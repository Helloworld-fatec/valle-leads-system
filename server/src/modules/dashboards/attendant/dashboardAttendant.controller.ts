// src/modules/dashboards/attendant/dashboardAttendant.controller.ts

import type { Response, NextFunction } from 'express';
import type { ParsedQs } from 'qs';
import type { AuthRequest } from '../../../middlewares/auth/auth.middleware.js';
import type { AuthenticatedRequester } from './dashboardAttendant.service.js';
import type { AccessLevel } from '../../../middlewares/auth/permission.middleware.js';
import { DashboardAttendantService } from './dashboardAttendant.service.js';
import type { AttendantDashboardFilterDTO } from './dashboardAttendant.dto.js';
import { RequisicaoInvalidaError } from '../../../middlewares/errors/domainErrors.middleware.js';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Query params deste router — após validação pelo schema Zod.
 * startDate/endDate chegam já como Date após o transform do schema, mas a
 * tipagem de req.query é string-based pelo Express; o controller delega o
 * cast para o service via DTO.
 */
type DashboardQueryParams = ParsedQs & {
  attendantId?: string;
  startDate?: string;
  endDate?: string;
};

/** Especialização de AuthRequest para as rotas deste controller. */
type DashboardRequest = AuthRequest<Record<string, never>, unknown, DashboardQueryParams>;

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD ATTENDANT CONTROLLER — negociação-cêntrico
// ─────────────────────────────────────────────────────────────────────────────

export class DashboardAttendantController {
  private readonly service: DashboardAttendantService;

  constructor() {
    this.service = new DashboardAttendantService();
  }

  // ─── HELPERS PRIVADOS ─────────────────────────────────────────────────────

  /**
   * Extrai o ID do atendente alvo.
   * - Query param `attendantId` tem precedência (uso por MANAGER/ADMIN/GM).
   * - Fallback: ID do próprio usuário logado (uso típico do ATTENDANT).
   */
  private resolveTargetId(req: DashboardRequest): string {
    const targetId = req.query.attendantId ?? req.user.id;
    if (!targetId) {
      throw new RequisicaoInvalidaError('ID do atendente não pôde ser determinado.');
    }
    return targetId;
  }

  /** Mapeia req.user para o tipo esperado pelo service. */
  private buildRequester(req: DashboardRequest): AuthenticatedRequester {
    return {
      id: req.user.id,
      role: req.user.role as AccessLevel,
      team_ids: req.user.team_ids,
    };
  }

  /**
   * req.query foi validado/transformado pelo validateQuery(schema);
   * o cast é seguro neste ponto.
   */
  private extractFilters(req: DashboardRequest): AttendantDashboardFilterDTO {
    return req.query as unknown as AttendantDashboardFilterDTO;
  }

  /**
   * Fábrica de handlers — elimina os 9 blocos try/catch idênticos.
   * Cada handler recebe (requester, targetId, filters) e devolve o payload.
   * Métricas de snapshot simplesmente ignoram o terceiro argumento.
   */
  private handle(
    serviceCall: (
      requester: AuthenticatedRequester,
      targetId: string,
      filters: AttendantDashboardFilterDTO,
    ) => Promise<unknown>,
  ) {
    return async (req: DashboardRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        const data = await serviceCall(
          this.buildRequester(req),
          this.resolveTargetId(req),
          this.extractFilters(req),
        );
        res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    };
  }

  // ─── KPI HANDLERS ────────────────────────────────────────────────────────

  public getActiveNegotiations = this.handle((r, t) =>
    this.service.getActiveNegotiations(r, t),
  );

  public getSales = this.handle((r, t, f) => this.service.getSales(r, t, f));

  public getClosingRate = this.handle((r, t, f) => this.service.getClosingRate(r, t, f));

  public getAvgClosingTime = this.handle((r, t, f) =>
    this.service.getAvgClosingTime(r, t, f),
  );

  // ─── CHART HANDLERS ──────────────────────────────────────────────────────

  public getStageFunnel = this.handle((r, t) => this.service.getStageFunnel(r, t));

  public getEvolution = this.handle((r, t, f) => this.service.getEvolution(r, t, f));

  public getTemperature = this.handle((r, t) => this.service.getTemperature(r, t));

  public getNegotiationsBySource = this.handle((r, t, f) =>
    this.service.getNegotiationsBySource(r, t, f),
  );

  public getIdleLeads = this.handle((r, t) => this.service.getIdleLeads(r, t));
}
