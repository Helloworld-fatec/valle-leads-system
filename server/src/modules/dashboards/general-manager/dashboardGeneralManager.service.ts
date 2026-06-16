// src/modules/dashboards/dashboard-general-manager/dashboardGeneralManager.service.ts

import type { AccessLevel } from '../../../middlewares/auth/permission.middleware.js';
import { AcessoNaoAutorizadoError } from '../../../middlewares/errors/domainErrors.middleware.js';
import {
  DashboardGeneralManagerRepository,
  mergeEvolution,
} from './dashboardGeneralManager.repository.js';
import type {
  GeneralManagerDashboardFilterDTO,
  GlobalActiveNegotiationsResponse,
  GlobalEvolutionResponse,
  GlobalIdleLeadsResponse,
  GlobalSalesResponse,
  GlobalStageFunnelResponse,
  PipelineValueResponse,
  SalesByStoreResponse,
  SalesByTeamResponse,
  SalesValueResponse,
} from './dashboardGeneralManager.dto.js';

// ─────────────────────────────────────────────────────────────────────────────
// REQUESTER TYPE
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthenticatedRequester {
  id: string;
  role: AccessLevel;
  team_ids: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD GENERAL MANAGER SERVICE — negociação-cêntrico
// ─────────────────────────────────────────────────────────────────────────────
// Visão global sem escopo. A autorização é redundante com o
// checkPermission('GENERAL_MANAGER') das rotas — mantida como defesa em
// profundidade, igual à versão anterior.
// ─────────────────────────────────────────────────────────────────────────────

export class DashboardGeneralManagerService {
  private readonly repository: DashboardGeneralManagerRepository;

  constructor() {
    this.repository = DashboardGeneralManagerRepository.getInstance();
  }

  // ─── AUTORIZAÇÃO ──────────────────────────────────────────────────────────

  /** Garante que apenas ADMIN e GENERAL_MANAGER acessem dados globais. */
  private assertCanAccess(requester: AuthenticatedRequester): void {
    if (requester.role !== 'ADMIN' && requester.role !== 'GENERAL_MANAGER') {
      throw new AcessoNaoAutorizadoError(
        'Acesso restrito a administradores e gerentes gerais.',
      );
    }
  }

  // ─── KPIs ─────────────────────────────────────────────────────────────────

  /** 1. Negociações ativas globais (snapshot). */
  public async getActiveNegotiations(
    requester: AuthenticatedRequester,
  ): Promise<GlobalActiveNegotiationsResponse> {
    this.assertCanAccess(requester);
    const activeNegotiations = await this.repository.countActiveNegotiations();
    return { activeNegotiations };
  }

  /** 2. Vendas no período (contagem de eventos 'won'). */
  public async getSales(
    requester: AuthenticatedRequester,
    filters?: GeneralManagerDashboardFilterDTO,
  ): Promise<GlobalSalesResponse> {
    this.assertCanAccess(requester);
    const sales = await this.repository.countSales(filters);
    return { sales };
  }

  /** 3. Valor vendido (R$) no período. */
  public async getSalesValue(
    requester: AuthenticatedRequester,
    filters?: GeneralManagerDashboardFilterDTO,
  ): Promise<SalesValueResponse> {
    this.assertCanAccess(requester);
    const { salesValue, salesWithoutValue } =
      await this.repository.getSalesValue(filters);

    return {
      salesValue: Number(salesValue.toFixed(2)),
      salesWithoutValue,
    };
  }

  /** 4. Valor em pipeline (R$) — snapshot da carteira ativa. */
  public async getPipelineValue(
    requester: AuthenticatedRequester,
  ): Promise<PipelineValueResponse> {
    this.assertCanAccess(requester);
    const { pipelineValue, negotiationsWithoutValue } =
      await this.repository.getPipelineValue();

    return {
      pipelineValue: Number(pipelineValue.toFixed(2)),
      negotiationsWithoutValue,
    };
  }

  // ─── CHARTS ───────────────────────────────────────────────────────────────

  /** 5. Funil global da carteira ativa (snapshot). */
  public async getStageFunnel(
    requester: AuthenticatedRequester,
  ): Promise<GlobalStageFunnelResponse> {
    this.assertCanAccess(requester);
    const funnel = await this.repository.getStageFunnel();
    return { funnel };
  }

  /** 6. Ranking de vendas por equipe na janela. */
  public async getSalesByTeam(
    requester: AuthenticatedRequester,
    filters?: GeneralManagerDashboardFilterDTO,
  ): Promise<SalesByTeamResponse> {
    this.assertCanAccess(requester);
    const salesByTeam = await this.repository.getSalesByTeam(filters);
    return { salesByTeam };
  }

  /** 7. Vendas por loja na janela (contagem + valor). */
  public async getSalesByStore(
    requester: AuthenticatedRequester,
    filters?: GeneralManagerDashboardFilterDTO,
  ): Promise<SalesByStoreResponse> {
    this.assertCanAccess(requester);
    const rows = await this.repository.getSalesByStore(filters);

    return {
      salesByStore: rows.map((r) => ({
        ...r,
        salesValue: Number(r.salesValue.toFixed(2)),
      })),
    };
  }

  /** 8. Evolução global diária: abertas × ganhas na janela. */
  public async getEvolution(
    requester: AuthenticatedRequester,
    filters?: GeneralManagerDashboardFilterDTO,
  ): Promise<GlobalEvolutionResponse> {
    this.assertCanAccess(requester);

    const [openedDates, wonDates] = await Promise.all([
      this.repository.getNegotiationsCreatedDates(filters),
      this.repository.getWonDates(filters),
    ]);

    return { evolution: mergeEvolution(openedDates, wonDates) };
  }

  /** 9. Leads parados globais (snapshot). */
  public async getIdleLeads(
    requester: AuthenticatedRequester,
  ): Promise<GlobalIdleLeadsResponse> {
    this.assertCanAccess(requester);
    return this.repository.getIdleLeads();
  }
}
