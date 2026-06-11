// src/modules/dashboards/dashboard-manager/dashboardManager.service.ts

import { prisma } from '../../../config/prisma.js';
import type { AccessLevel } from '../../../middlewares/auth/permission.middleware.js';
import {
  AcessoNaoAutorizadoError,
  RequisicaoInvalidaError,
} from '../../../middlewares/errors/domainErrors.middleware.js';
import {
  DashboardManagerRepository,
  mergeEvolution,
} from './dashboardManager.repository.js';
import type {
  ManagerDashboardFilterDTO,
  SalesByAttendantResponse,
  StagnantNegotiationsResponse,
  TeamActiveNegotiationsResponse,
  TeamClosingRateResponse,
  TeamEvolutionResponse,
  TeamIdleLeadsResponse,
  TeamSalesResponse,
  TeamStageFunnelResponse,
  WorkloadByAttendantResponse,
} from './dashboardManager.dto.js';

// ─────────────────────────────────────────────────────────────────────────────
// REQUESTER TYPE
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthenticatedRequester {
  id: string;
  role: AccessLevel;
  team_ids: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD MANAGER SERVICE — negociação-cêntrico
// ─────────────────────────────────────────────────────────────────────────────
// Autorização idêntica à versão anterior (regras inalteradas pelo refactor).
// ─────────────────────────────────────────────────────────────────────────────

export class DashboardManagerService {
  private readonly repository: DashboardManagerRepository;

  constructor() {
    this.repository = DashboardManagerRepository.getInstance();
  }

  // ─── AUTORIZAÇÃO ──────────────────────────────────────────────────────────

  /**
   * Valida se o requester pode consultar dados da targetTeamId.
   *   1. ADMIN ou GENERAL_MANAGER → acesso total.
   *   2. MANAGER → apenas as suas próprias equipas.
   *   3. Qualquer outro papel → negado.
   */
  private assertCanAccess(
    requester: AuthenticatedRequester,
    targetTeamId: string,
  ): void {
    if (!targetTeamId) {
      throw new RequisicaoInvalidaError('ID da equipa é obrigatório.');
    }

    if (requester.role === 'ADMIN' || requester.role === 'GENERAL_MANAGER') return;

    if (requester.role === 'MANAGER') {
      if (!requester.team_ids.includes(targetTeamId)) {
        throw new AcessoNaoAutorizadoError(
          'Não tem permissão para visualizar dados de outra equipa.',
        );
      }
      return;
    }

    throw new AcessoNaoAutorizadoError('Acesso negado ao dashboard de gerência.');
  }

  // ─── HELPERS PRIVADOS ────────────────────────────────────────────────────

  /** Mapa { id → name } dos atendentes, para lookups O(1) nas formatações. */
  private async fetchAttendantNames(
    attendantIds: string[],
  ): Promise<Record<string, string>> {
    if (attendantIds.length === 0) return {};

    const users = await prisma.users.findMany({
      where: { id: { in: attendantIds } },
      select: { id: true, name: true },
    });

    return Object.fromEntries(users.map((u) => [u.id, u.name]));
  }

  /** Extrai os IDs não-nulos de linhas agregadas por atendente. */
  private extractAttendantIds(rows: Array<{ attendant_id: string | null }>): string[] {
    return rows
      .map((r) => r.attendant_id)
      .filter((id): id is string => id !== null);
  }

  // ─── KPIs ─────────────────────────────────────────────────────────────────

  /** 1. Negociações ativas da equipa (snapshot). */
  public async getActiveNegotiations(
    requester: AuthenticatedRequester,
    targetTeamId: string,
  ): Promise<TeamActiveNegotiationsResponse> {
    this.assertCanAccess(requester, targetTeamId);
    const activeNegotiations = await this.repository.countActiveNegotiations(targetTeamId);
    return { activeNegotiations };
  }

  /** 2. Vendas da equipa no período. */
  public async getSales(
    requester: AuthenticatedRequester,
    targetTeamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Promise<TeamSalesResponse> {
    this.assertCanAccess(requester, targetTeamId);
    const sales = await this.repository.countSales(targetTeamId, filters);
    return { sales };
  }

  /** 3. Taxa de fechamento da equipa: won / (won + lost) na janela. */
  public async getClosingRate(
    requester: AuthenticatedRequester,
    targetTeamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Promise<TeamClosingRateResponse> {
    this.assertCanAccess(requester, targetTeamId);
    const { wonCount, lostCount } = await this.repository.getClosingData(
      targetTeamId,
      filters,
    );

    const closed = wonCount + lostCount;
    const closingRate = closed === 0 ? 0 : (wonCount / closed) * 100;

    return {
      closingRate: Number(closingRate.toFixed(1)),
      wonCount,
      lostCount,
    };
  }

  /** 4. Negociações estagnadas (snapshot, corte de 7 dias). */
  public async getStagnantNegotiations(
    requester: AuthenticatedRequester,
    targetTeamId: string,
  ): Promise<StagnantNegotiationsResponse> {
    this.assertCanAccess(requester, targetTeamId);
    const stagnantNegotiations =
      await this.repository.countStagnantNegotiations(targetTeamId);
    return { stagnantNegotiations };
  }

  // ─── CHARTS ───────────────────────────────────────────────────────────────

  /** 5. Funil de estágios da carteira ativa da equipa (snapshot). */
  public async getStageFunnel(
    requester: AuthenticatedRequester,
    targetTeamId: string,
  ): Promise<TeamStageFunnelResponse> {
    this.assertCanAccess(requester, targetTeamId);
    const funnel = await this.repository.getStageFunnel(targetTeamId);
    return { funnel };
  }

  /** 6. Ranking de vendas por atendente na janela. */
  public async getSalesByAttendant(
    requester: AuthenticatedRequester,
    targetTeamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Promise<SalesByAttendantResponse> {
    this.assertCanAccess(requester, targetTeamId);

    const rows = await this.repository.getSalesByAttendant(targetTeamId, filters);
    const namesMap = await this.fetchAttendantNames(this.extractAttendantIds(rows));

    return {
      salesByAttendant: rows.map((row) => ({
        attendantId: row.attendant_id,
        attendantName: row.attendant_id
          ? (namesMap[row.attendant_id] ?? 'Desconhecido')
          : 'Sem Atendente',
        sales: row.sales,
      })),
    };
  }

  /** 7. Carga de trabalho: negociações ativas por atendente (snapshot). */
  public async getWorkloadByAttendant(
    requester: AuthenticatedRequester,
    targetTeamId: string,
  ): Promise<WorkloadByAttendantResponse> {
    this.assertCanAccess(requester, targetTeamId);

    const rows = await this.repository.getWorkloadByAttendant(targetTeamId);
    const namesMap = await this.fetchAttendantNames(this.extractAttendantIds(rows));

    return {
      workloadByAttendant: rows.map((row) => ({
        attendantId: row.attendant_id,
        attendantName: row.attendant_id
          ? (namesMap[row.attendant_id] ?? 'Desconhecido')
          : 'Sem Atendente',
        active: row.active,
      })),
    };
  }

  /** 8. Evolução diária da equipa: abertas × ganhas na janela. */
  public async getEvolution(
    requester: AuthenticatedRequester,
    targetTeamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Promise<TeamEvolutionResponse> {
    this.assertCanAccess(requester, targetTeamId);

    const [openedDates, wonDates] = await Promise.all([
      this.repository.getNegotiationsCreatedDates(targetTeamId, filters),
      this.repository.getWonDates(targetTeamId, filters),
    ]);

    return { evolution: mergeEvolution(openedDates, wonDates) };
  }

  /** 9. Leads parados da equipa (snapshot). */
  public async getIdleLeads(
    requester: AuthenticatedRequester,
    targetTeamId: string,
  ): Promise<TeamIdleLeadsResponse> {
    this.assertCanAccess(requester, targetTeamId);
    return this.repository.getIdleLeads(targetTeamId);
  }
}
