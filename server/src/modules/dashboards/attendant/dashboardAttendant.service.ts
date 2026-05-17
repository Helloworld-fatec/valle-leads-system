// src/modules/dashboards/attendant/dashboardAttendant.service.ts

import { DashboardAttendantRepository } from './dashboardAttendant.repository.js';
import { AttendantDashboardFilterDTO } from './dashboardAttendant.dto.js';
import { prisma } from '../../../config/prisma.js';
import { 
  RecursoNaoEncontradoError, 
  RequisicaoInvalidaError,
  AcessoNaoAutorizadoError 
} from '../../../middlewares/errors/domainErrors.middleware.js';

export class DashboardAttendantService {
  private repository: DashboardAttendantRepository;

  constructor() {
    this.repository = DashboardAttendantRepository.getInstance();
  }

  /**
   * VALIDAÇÃO HIERÁRQUICA:
   * Verifica se o utilizador logado (requester) pode ver os dados do atendente alvo.
   */
  private async validateAccess(requester: any, targetAttendantId: string): Promise<void> {
    if (!targetAttendantId) {
      throw new RequisicaoInvalidaError('ID do atendente é obrigatório.');
    }

    // 1. Se for o próprio atendente a ver os seus dados, acesso permitido.
    if (requester.id === targetAttendantId) return;

    // 2. Se for Admin ou Gerente Geral, acesso total permitido.
    if (requester.role === 'ADMIN' || requester.role === 'GENERAL_MANAGER') return;

    // 3. Se for Gerente (MANAGER), só pode ver atendentes da mesma equipa.
    if (requester.role === 'MANAGER') {
      const isSameTeam = await prisma.userTeams.findFirst({
        where: {
          user_id: targetAttendantId,
          team_id: requester.team_id // O ID da equipa vem do utilizador logado
        }
      });

      if (!isSameTeam) {
        throw new AcessoNaoAutorizadoError('Não tem permissão para ver dados de atendentes de outras equipas.');
      }
      return;
    }

    // 4. Atendentes não podem passar IDs de terceiros.
    throw new AcessoNaoAutorizadoError('Acesso negado ao dashboard solicitado.');
  }

  public async getActiveLeads(requester: any, targetId: string, filters?: AttendantDashboardFilterDTO) {
    await this.validateAccess(requester, targetId);
    const count = await this.repository.countActiveLeads(targetId, filters);
    return { activeLeads: count };
  }

  public async getConvertedLeads(requester: any, targetId: string, filters?: AttendantDashboardFilterDTO) {
    await this.validateAccess(requester, targetId);
    const count = await this.repository.countConvertedLeads(targetId, filters);
    return { convertedLeads: count };
  }

  public async getConversionRate(requester: any, targetId: string, filters?: AttendantDashboardFilterDTO) {
    await this.validateAccess(requester, targetId);
    const { totalLeads, convertedLeads } = await this.repository.getConversionData(targetId, filters);
    
    if (totalLeads === 0) return { conversionRate: 0, totalLeads, convertedLeads };

    const rate = (convertedLeads / totalLeads) * 100;
    return { 
      conversionRate: Number(rate.toFixed(2)), 
      totalLeads, 
      convertedLeads 
    };
  }

  public async getAvgServiceTime(requester: any, targetId: string, filters?: AttendantDashboardFilterDTO) {
    await this.validateAccess(requester, targetId);
    const avgTimeInHours = await this.repository.getAvgServiceTime(targetId, filters);
    return { avgServiceTimeHours: Number(avgTimeInHours.toFixed(2)) };
  }

  public async getLeadsEvolution(requester: any, targetId: string, filters?: AttendantDashboardFilterDTO) {
    await this.validateAccess(requester, targetId);
    const data = await this.repository.getLeadsEvolution(targetId, filters);
    return { evolution: data };
  }

  public async getSalesFunnel(requester: any, targetId: string, filters?: AttendantDashboardFilterDTO) {
    await this.validateAccess(requester, targetId);
    const data = await this.repository.getSalesFunnel(targetId, filters);
    return { funnel: data };
  }

  public async getLeadsBySource(requester: any, targetId: string, filters?: AttendantDashboardFilterDTO) {
    await this.validateAccess(requester, targetId);
    const data = await this.repository.getLeadsBySource(targetId, filters);
    return { sources: data };
  }

  public async getConversionsByPeriod(requester: any, targetId: string, filters?: AttendantDashboardFilterDTO) {
    await this.validateAccess(requester, targetId);
    const data = await this.repository.getConversionsByPeriod(targetId, filters);
    return { conversions: data };
  }
}