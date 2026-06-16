// src/modules/dashboards/attendant/dashboardAttendant.service.ts

import { prisma } from '../../../config/prisma.js';
import type { AccessLevel } from '../../../middlewares/auth/permission.middleware.js';
import {
  AcessoNaoAutorizadoError,
  RequisicaoInvalidaError,
} from '../../../middlewares/errors/domainErrors.middleware.js';
import {
  DashboardAttendantRepository,
  mergeEvolution,
  calcAvgClosingTimeHours,
} from './dashboardAttendant.repository.js';
import type {
  AttendantDashboardFilterDTO,
  ActiveNegotiationsResponse,
  AvgClosingTimeResponse,
  ClosingRateResponse,
  IdleLeadsResponse,
  NegotiationsBySourceResponse,
  NegotiationsEvolutionResponse,
  SalesResponse,
  StageFunnelResponse,
  TemperatureResponse,
} from './dashboardAttendant.dto.js';

// ─────────────────────────────────────────────────────────────────────────────
// REQUESTER TYPE
// Subconjunto de req.user necessário para as regras de autorização.
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthenticatedRequester {
  id: string;
  role: AccessLevel;
  team_ids: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD ATTENDANT SERVICE — negociação-cêntrico
// ─────────────────────────────────────────────────────────────────────────────
// Autorização idêntica à versão anterior (regras inalteradas pelo refactor).
// A semântica das métricas mudou: ver comentários no DTO e no repository.
// ─────────────────────────────────────────────────────────────────────────────

export class DashboardAttendantService {
  private readonly repository: DashboardAttendantRepository;

  constructor() {
    this.repository = DashboardAttendantRepository.getInstance();
  }

  // ─── AUTORIZAÇÃO ──────────────────────────────────────────────────────────

  /**
   * Valida se o requester pode consultar dados do targetAttendantId.
   *
   * Regras (ordem de precedência):
   *   1. Próprio atendente consultando a si mesmo → permitido sempre.
   *   2. ADMIN ou GENERAL_MANAGER → acesso total, sem restrição de equipa.
   *   3. MANAGER → apenas se o target pertencer a alguma das suas equipas.
   *   4. ATTENDANT tentando ver outro atendente → negado.
   */
  private async assertCanAccess(
    requester: AuthenticatedRequester,
    targetAttendantId: string,
  ): Promise<void> {
    if (!targetAttendantId) {
      throw new RequisicaoInvalidaError('ID do atendente é obrigatório.');
    }

    // Regra 1 — próprio usuário
    if (requester.id === targetAttendantId) return;

    // Regra 2 — papéis com visibilidade global
    if (requester.role === 'ADMIN' || requester.role === 'GENERAL_MANAGER') return;

    // Regra 3 — MANAGER vê apenas membros das suas equipas
    if (requester.role === 'MANAGER') {
      if (requester.team_ids.length === 0) {
        throw new AcessoNaoAutorizadoError(
          'Não tem permissão para ver dados de atendentes de outras equipas.',
        );
      }

      const membership = await prisma.userTeams.findFirst({
        where: {
          user_id: targetAttendantId,
          team_id: { in: requester.team_ids },
          is_active: true,
        },
        select: { id: true },
      });

      if (!membership) {
        throw new AcessoNaoAutorizadoError(
          'Não tem permissão para ver dados de atendentes de outras equipas.',
        );
      }

      return;
    }

    // Regra 4 — ATTENDANT tentando ver outro atendente
    throw new AcessoNaoAutorizadoError(
      'Não tem permissão para ver dados de outros atendentes.',
    );
  }

  // ─── KPIs ─────────────────────────────────────────────────────────────────

  /** 1. Negociações ativas (snapshot — não recebe filtros de data). */
  public async getActiveNegotiations(
    requester: AuthenticatedRequester,
    targetId: string,
  ): Promise<ActiveNegotiationsResponse> {
    await this.assertCanAccess(requester, targetId);
    const activeNegotiations = await this.repository.countActiveNegotiations(targetId);
    return { activeNegotiations };
  }

  /** 2. Vendas no período (eventos 'won' na janela). */
  public async getSales(
    requester: AuthenticatedRequester,
    targetId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<SalesResponse> {
    await this.assertCanAccess(requester, targetId);
    const sales = await this.repository.countSales(targetId, filters);
    return { sales };
  }

  /** 3. Taxa de fechamento: won / (won + lost) das encerradas na janela. */
  public async getClosingRate(
    requester: AuthenticatedRequester,
    targetId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<ClosingRateResponse> {
    await this.assertCanAccess(requester, targetId);
    const { wonCount, lostCount } = await this.repository.getClosingData(targetId, filters);

    const closed = wonCount + lostCount;
    const closingRate = closed === 0 ? 0 : (wonCount / closed) * 100;

    return {
      closingRate: Number(closingRate.toFixed(1)),
      wonCount,
      lostCount,
    };
  }

  /** 4. Tempo médio de fechamento (abertura da negociação → evento 'won'). */
  public async getAvgClosingTime(
    requester: AuthenticatedRequester,
    targetId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<AvgClosingTimeResponse> {
    await this.assertCanAccess(requester, targetId);
    const events = await this.repository.getSaleEvents(targetId, filters);
    const avgHours = calcAvgClosingTimeHours(events);
    return { avgClosingTimeHours: Number(avgHours.toFixed(2)) };
  }

  // ─── CHARTS ───────────────────────────────────────────────────────────────

  /** 5. Funil de estágios da carteira ativa (snapshot). */
  public async getStageFunnel(
    requester: AuthenticatedRequester,
    targetId: string,
  ): Promise<StageFunnelResponse> {
    await this.assertCanAccess(requester, targetId);
    const funnel = await this.repository.getStageFunnel(targetId);
    return { funnel };
  }

  /** 6. Evolução diária: aberturas × vendas na janela. */
  public async getEvolution(
    requester: AuthenticatedRequester,
    targetId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<NegotiationsEvolutionResponse> {
    await this.assertCanAccess(requester, targetId);

    const [openedDates, saleEvents] = await Promise.all([
      this.repository.getNegotiationsCreatedDates(targetId, filters),
      this.repository.getSaleEvents(targetId, filters),
    ]);

    return {
      evolution: mergeEvolution(
        openedDates,
        saleEvents.map((e) => e.wonAt),
      ),
    };
  }

  /** 7. Temperatura da carteira ativa (snapshot). */
  public async getTemperature(
    requester: AuthenticatedRequester,
    targetId: string,
  ): Promise<TemperatureResponse> {
    await this.assertCanAccess(requester, targetId);
    const temperature = await this.repository.getTemperature(targetId);
    return { temperature };
  }

  /** 8. Negociações abertas na janela por origem do lead. */
  public async getNegotiationsBySource(
    requester: AuthenticatedRequester,
    targetId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<NegotiationsBySourceResponse> {
    await this.assertCanAccess(requester, targetId);
    const sources = await this.repository.getNegotiationsBySource(targetId, filters);
    return { sources };
  }

  /** 9. Leads parados: sem nenhuma negociação aberta (snapshot). */
  public async getIdleLeads(
    requester: AuthenticatedRequester,
    targetId: string,
  ): Promise<IdleLeadsResponse> {
    await this.assertCanAccess(requester, targetId);
    return this.repository.getIdleLeads(targetId);
  }
}
