// src/modules/dashboards/attendant/dashboardAttendant.service.ts

import { prisma } from '../../../config/prisma.js';
import type { AccessLevel } from '../../../middlewares/auth/permission.middleware.js';
import {
  AcessoNaoAutorizadoError,
  RequisicaoInvalidaError,
} from '../../../middlewares/errors/domainErrors.middleware.js';
import {
  DashboardAttendantRepository,
  groupDatesByDay,
  calcAvgServiceTimeHours,
} from './dashboardAttendant.repository.js';
import type {
  AttendantDashboardFilterDTO,
  ActiveLeadsResponse,
  AvgServiceTimeResponse,
  ConversionRateResponse,
  ConversionsByPeriodResponse,
  ConvertedLeadsResponse,
  LeadsBySourceResponse,
  LeadsEvolutionResponse,
  SalesFunnelResponse,
} from './dashboardAttendant.dto.js';

// ─────────────────────────────────────────────────────────────────────────────
// REQUESTER TYPE
// Representa o subconjunto de req.user necessário para as regras de autorização.
// Usa o tipo AccessLevel importado do permission middleware para garantir que
// o role seja sempre um dos 4 valores conhecidos.
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthenticatedRequester {
  id: string;
  role: AccessLevel;
  team_ids: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD ATTENDANT SERVICE
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
        select: { id: true }, // select mínimo — só precisamos confirmar existência
      });

      if (!membership) {
        throw new AcessoNaoAutorizadoError(
          'Não tem permissão para ver dados de atendentes de outras equipas.',
        );
      }

      return;
    }

    // Regra 4 — ATTENDANT tentando ver outro atendente
    throw new AcessoNaoAutorizadoError('Acesso negado ao dashboard solicitado.');
  }

  // ─── KPIs ─────────────────────────────────────────────────────────────────

  public async getActiveLeads(
    requester: AuthenticatedRequester,
    targetId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<ActiveLeadsResponse> {
    await this.assertCanAccess(requester, targetId);
    const count = await this.repository.countActiveLeads(targetId, filters);
    return { activeLeads: count };
  }

  public async getConvertedLeads(
    requester: AuthenticatedRequester,
    targetId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<ConvertedLeadsResponse> {
    await this.assertCanAccess(requester, targetId);
    const count = await this.repository.countConvertedLeads(targetId, filters);
    return { convertedLeads: count };
  }

  public async getConversionRate(
    requester: AuthenticatedRequester,
    targetId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<ConversionRateResponse> {
    await this.assertCanAccess(requester, targetId);
    const { totalLeads, convertedLeads } = await this.repository.getConversionData(
      targetId,
      filters,
    );

    if (totalLeads === 0) {
      return { conversionRate: 0, totalLeads, convertedLeads };
    }

    const rate = (convertedLeads / totalLeads) * 100;
    return {
      conversionRate: Number(rate.toFixed(2)),
      totalLeads,
      convertedLeads,
    };
  }

  public async getAvgServiceTime(
    requester: AuthenticatedRequester,
    targetId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<AvgServiceTimeResponse> {
    await this.assertCanAccess(requester, targetId);
    const timestamps = await this.repository.getConvertedLeadTimestamps(targetId, filters);
    const avgHours = calcAvgServiceTimeHours(timestamps);
    return { avgServiceTimeHours: Number(avgHours.toFixed(2)) };
  }

  // ─── CHARTS ───────────────────────────────────────────────────────────────

  public async getLeadsEvolution(
    requester: AuthenticatedRequester,
    targetId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<LeadsEvolutionResponse> {
    await this.assertCanAccess(requester, targetId);
    const dates = await this.repository.getLeadsCreatedDates(targetId, filters);
    return { evolution: groupDatesByDay(dates) };
  }

  public async getSalesFunnel(
    requester: AuthenticatedRequester,
    targetId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<SalesFunnelResponse> {
    await this.assertCanAccess(requester, targetId);
    const funnel = await this.repository.getSalesFunnel(targetId, filters);
    return { funnel };
  }

  public async getLeadsBySource(
    requester: AuthenticatedRequester,
    targetId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<LeadsBySourceResponse> {
    await this.assertCanAccess(requester, targetId);
    const sources = await this.repository.getLeadsBySource(targetId, filters);
    return { sources };
  }

  public async getConversionsByPeriod(
    requester: AuthenticatedRequester,
    targetId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<ConversionsByPeriodResponse> {
    await this.assertCanAccess(requester, targetId);
    const dates = await this.repository.getConvertedLeadUpdateDates(targetId, filters);
    return { conversions: groupDatesByDay(dates) };
  }
}