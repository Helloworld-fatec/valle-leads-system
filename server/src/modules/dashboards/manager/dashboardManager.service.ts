// src/modules/dashboards/dashboard-manager/dashboardManager.service.ts

import { DashboardManagerRepository } from './dashboardManager.repository.js';
import { ManagerDashboardFilterDTO } from './dashboardManager.dto.js';
import { prisma } from '../../../config/prisma.js';
import { 
  RecursoNaoEncontradoError, 
  RequisicaoInvalidaError,
  AcessoNaoAutorizadoError
} from '../../../middlewares/errors/domainErrors.middleware.js';

export class DashboardManagerService {
  private repository: DashboardManagerRepository;

  constructor() {
    this.repository = DashboardManagerRepository.getInstance();
  }

  /**
   * VALIDAÇÃO HIERÁRQUICA:
   * Garante que o utilizador tem permissão para ver os dados da equipa alvo.
   */
  private async validateAccess(requester: any, targetTeamId: string): Promise<void> {
    if (!targetTeamId) {
      throw new RequisicaoInvalidaError('ID da equipa é obrigatório.');
    }

    // 1. Admin e Gerente Geral têm acesso a qualquer equipa.
    if (requester.role === 'ADMIN' || requester.role === 'GENERAL_MANAGER') return;

    // 2. Gerente (MANAGER) só pode ver as suas próprias equipas.
    // O token carrega team_ids (array) — nunca team_id (singular).
    if (requester.role === 'MANAGER') {
      const managerTeamIds: string[] = Array.isArray(requester.team_ids)
        ? requester.team_ids
        : requester.team_id
          ? [requester.team_id]   // fallback defensivo para tokens legados
          : [];

      if (!managerTeamIds.includes(targetTeamId)) {
        throw new AcessoNaoAutorizadoError('Não tem permissão para visualizar dados de outra equipa.');
      }
      return;
    }

    // 3. Outros cargos (ex: Atendentes) não acedem ao dashboard de gerência.
    throw new AcessoNaoAutorizadoError('Acesso negado ao dashboard de gerência.');
  }

  /**
   * Helper para buscar o nome dos atendentes a partir dos IDs.
   */
  private async getAttendantsNames(attendantIds: string[]) {
    const validIds = attendantIds.filter((id) => id !== null);
    if (validIds.length === 0) return {};

    const users = await prisma.users.findMany({
      where: { id: { in: validIds } },
      select: { id: true, name: true }
    });

    return users.reduce((acc, user) => {
      acc[user.id] = user.name;
      return acc;
    }, {} as Record<string, string>);
  }

  // 1. KPIs Agrupados
  public async getTeamKpis(requester: any, targetTeamId: string, filters?: ManagerDashboardFilterDTO) {
    await this.validateAccess(requester, targetTeamId);
    
    const [conversionData, stagnantLeads] = await Promise.all([
      this.repository.getTeamConversionData(targetTeamId, filters),
      this.repository.countStagnantLeads(targetTeamId, filters)
    ]);

    const { totalLeads, convertedLeads } = conversionData;
    const rate = totalLeads === 0 ? 0 : (convertedLeads / totalLeads) * 100;

    return {
      totalLeads,
      convertedLeads,
      conversionRate: Number(rate.toFixed(2)),
      stagnantLeads
    };
  }

  // 2. Melhor Atendente
  public async getTopAttendant(requester: any, targetTeamId: string, filters?: ManagerDashboardFilterDTO) {
    await this.validateAccess(requester, targetTeamId);
    
    const conversions = await this.repository.getConversionsByAttendant(targetTeamId, filters);
    
    if (conversions.length === 0 || !conversions[0]?.attendant_id) {
      return { topAttendant: null };
    }

    const topAttendantId = conversions[0].attendant_id;
    const usersMap = await this.getAttendantsNames([topAttendantId]);

    return {
      topAttendant: {
        id: topAttendantId,
        name: usersMap[topAttendantId] || 'Atendente Desconhecido',
        conversions: conversions[0]._count.id
      }
    };
  }

  // 3. Leads por Atendente
  public async getLeadsByAttendant(requester: any, targetTeamId: string, filters?: ManagerDashboardFilterDTO) {
    await this.validateAccess(requester, targetTeamId);
    const data = await this.repository.getLeadsByAttendant(targetTeamId, filters);
    
    const attendantIds = data.map(d => d.attendant_id).filter(Boolean) as string[];
    const namesMap = await this.getAttendantsNames(attendantIds);

    const formattedData = data.map(item => ({
      attendantId: item.attendant_id,
      attendantName: item.attendant_id ? (namesMap[item.attendant_id] || 'Desconhecido') : 'Sem Atendente',
      count: item._count.id
    }));

    return { leadsByAttendant: formattedData };
  }

  // 4. Conversões por Atendente
  public async getConversionsByAttendant(requester: any, targetTeamId: string, filters?: ManagerDashboardFilterDTO) {
    await this.validateAccess(requester, targetTeamId);
    const data = await this.repository.getConversionsByAttendant(targetTeamId, filters);
    
    const attendantIds = data.map(d => d.attendant_id).filter(Boolean) as string[];
    const namesMap = await this.getAttendantsNames(attendantIds);

    const formattedData = data.map(item => ({
      attendantId: item.attendant_id,
      attendantName: item.attendant_id ? (namesMap[item.attendant_id] || 'Desconhecido') : 'Sem Atendente',
      count: item._count.id
    }));

    return { conversionsByAttendant: formattedData };
  }

  // 5. Evolução da Equipa
  public async getTeamEvolution(requester: any, targetTeamId: string, filters?: ManagerDashboardFilterDTO) {
    await this.validateAccess(requester, targetTeamId);
    const data = await this.repository.getTeamEvolution(targetTeamId, filters);
    return { evolution: data };
  }

  // 6. Funil da Equipa
  public async getTeamFunnel(requester: any, targetTeamId: string, filters?: ManagerDashboardFilterDTO) {
    await this.validateAccess(requester, targetTeamId);
    const data = await this.repository.getTeamFunnel(targetTeamId, filters);
    return { funnel: data };
  }
}