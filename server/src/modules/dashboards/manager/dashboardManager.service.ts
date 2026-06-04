// src/modules/dashboards/dashboard-manager/dashboardManager.service.ts

import { prisma } from '../../../config/prisma.js';
import type { AccessLevel } from '../../../middlewares/auth/permission.middleware.js';
import {
  AcessoNaoAutorizadoError,
  RequisicaoInvalidaError,
} from '../../../middlewares/errors/domainErrors.middleware.js';
import {
  DashboardManagerRepository,
  groupDatesByDay,
} from './dashboardManager.repository.js';
import type {
  ManagerDashboardFilterDTO,
  AttendantLeadsRow,
  TeamKpisResponse,
  TopAttendantResponse,
  LeadsByAttendantResponse,
  ConversionsByAttendantResponse,
  TeamEvolutionResponse,
  TeamFunnelResponse,
} from './dashboardManager.dto.js';

// ─────────────────────────────────────────────────────────────────────────────
// REQUESTER TYPE
// Mesmo contrato usado no dashboardAttendant — representa o subconjunto de
// req.user necessário para as regras de autorização deste módulo.
// Importar de um shared types seria o ideal num monorepo; aqui redeclaramos
// para manter os módulos de dashboard independentes entre si.
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthenticatedRequester {
  id: string;
  role: AccessLevel;
  team_ids: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD MANAGER SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export class DashboardManagerService {
  private readonly repository: DashboardManagerRepository;

  constructor() {
    this.repository = DashboardManagerRepository.getInstance();
  }

  // ─── AUTORIZAÇÃO ─────────────────────────────────────────────────────────

  /**
   * Valida se o requester pode consultar dados da equipa alvo.
   *
   * Regras (ordem de precedência):
   *   1. ADMIN ou GENERAL_MANAGER → acesso total, sem restrição de equipa.
   *   2. MANAGER → apenas se o targetTeamId estiver no seu token (team_ids).
   *   3. Qualquer outro papel (ex: ATTENDANT) → negado.
   */
  private assertCanAccess(
    requester: AuthenticatedRequester,
    targetTeamId: string,
  ): void {
    if (!targetTeamId) {
      throw new RequisicaoInvalidaError('ID da equipa é obrigatório.');
    }

    // Regra 1 — papéis com visibilidade global
    if (requester.role === 'ADMIN' || requester.role === 'GENERAL_MANAGER') return;

    // Regra 2 — MANAGER vê apenas as suas próprias equipas
    if (requester.role === 'MANAGER') {
      if (!requester.team_ids.includes(targetTeamId)) {
        throw new AcessoNaoAutorizadoError(
          'Não tem permissão para visualizar dados de outra equipa.',
        );
      }
      return;
    }

    // Regra 3 — qualquer outro papel
    throw new AcessoNaoAutorizadoError('Acesso negado ao dashboard de gerência.');
  }

  // ─── HELPERS PRIVADOS ────────────────────────────────────────────────────

  /**
   * Busca o nome dos atendentes a partir de uma lista de IDs válidos.
   * Retorna um mapa { id → name } para lookups O(1) nas formatações.
   */
  private async fetchAttendantNames(
    attendantIds: string[],
  ): Promise<Record<string, string>> {
    if (attendantIds.length === 0) return {};

    const users = await prisma.users.findMany({
      where: { id: { in: attendantIds } },
      select: { id: true, name: true },
    });

    return users.reduce<Record<string, string>>((acc, user) => {
      acc[user.id] = user.name;
      return acc;
    }, {});
  }

  /**
   * Extrai IDs de atendente não-nulos de um array de linhas de groupBy.
   * Centraliza o filter + cast que se repetia em múltiplos métodos.
   */
  private extractAttendantIds(rows: AttendantLeadsRow[]): string[] {
    return rows.map((r) => r.attendant_id).filter((id): id is string => id !== null);
  }

  // ─── KPIs ────────────────────────────────────────────────────────────────

  /** 1. KPIs consolidados da equipa: totais, taxa de conversão e leads estagnados. */
  public async getTeamKpis(
    requester: AuthenticatedRequester,
    targetTeamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Promise<TeamKpisResponse> {
    this.assertCanAccess(requester, targetTeamId);

    const [conversionData, stagnantLeads] = await Promise.all([
      this.repository.getTeamConversionData(targetTeamId, filters),
      this.repository.countStagnantLeads(targetTeamId, filters),
    ]);

    const { totalLeads, convertedLeads } = conversionData;
    const rate = totalLeads === 0 ? 0 : (convertedLeads / totalLeads) * 100;

    return {
      totalLeads,
      convertedLeads,
      conversionRate: Number(rate.toFixed(2)),
      stagnantLeads,
    };
  }

  /** 2. Atendente com mais conversões no período. */
  public async getTopAttendant(
    requester: AuthenticatedRequester,
    targetTeamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Promise<TopAttendantResponse> {
    this.assertCanAccess(requester, targetTeamId);

    const conversions = await this.repository.getConversionsByAttendant(targetTeamId, filters);

    // Sem conversões ou sem atendente associado ao topo → retorna null
    const topRow = conversions[0];
    if (!topRow?.attendant_id) {
      return { topAttendant: null };
    }

    const namesMap = await this.fetchAttendantNames([topRow.attendant_id]);

    return {
      topAttendant: {
        id: topRow.attendant_id,
        name: namesMap[topRow.attendant_id] ?? 'Atendente Desconhecido',
        conversions: topRow._count.id,
      },
    };
  }

  // ─── CHARTS ──────────────────────────────────────────────────────────────

  /** 3. Distribuição de leads (todos os status) por atendente. */
  public async getLeadsByAttendant(
    requester: AuthenticatedRequester,
    targetTeamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Promise<LeadsByAttendantResponse> {
    this.assertCanAccess(requester, targetTeamId);

    const rows = await this.repository.getLeadsByAttendant(targetTeamId, filters);
    const namesMap = await this.fetchAttendantNames(this.extractAttendantIds(rows));

    return {
      leadsByAttendant: rows.map((item) => ({
        attendantId: item.attendant_id,
        attendantName: item.attendant_id
          ? (namesMap[item.attendant_id] ?? 'Desconhecido')
          : 'Sem Atendente',
        count: item._count.id,
      })),
    };
  }

  /** 4. Distribuição de leads convertidos por atendente. */
  public async getConversionsByAttendant(
    requester: AuthenticatedRequester,
    targetTeamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Promise<ConversionsByAttendantResponse> {
    this.assertCanAccess(requester, targetTeamId);

    const rows = await this.repository.getConversionsByAttendant(targetTeamId, filters);
    const namesMap = await this.fetchAttendantNames(this.extractAttendantIds(rows));

    return {
      conversionsByAttendant: rows.map((item) => ({
        attendantId: item.attendant_id,
        attendantName: item.attendant_id
          ? (namesMap[item.attendant_id] ?? 'Desconhecido')
          : 'Sem Atendente',
        count: item._count.id,
      })),
    };
  }

  /** 5. Evolução de volume de leads da equipa ao longo do período. */
  public async getTeamEvolution(
    requester: AuthenticatedRequester,
    targetTeamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Promise<TeamEvolutionResponse> {
    this.assertCanAccess(requester, targetTeamId);

    const dates = await this.repository.getTeamLeadsCreatedDates(targetTeamId, filters);
    return { evolution: groupDatesByDay(dates) };
  }

  /** 6. Funil da equipa — contagem de leads por status. */
  public async getTeamFunnel(
    requester: AuthenticatedRequester,
    targetTeamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Promise<TeamFunnelResponse> {
    this.assertCanAccess(requester, targetTeamId);

    const funnel = await this.repository.getTeamFunnel(targetTeamId, filters);
    return { funnel };
  }
}