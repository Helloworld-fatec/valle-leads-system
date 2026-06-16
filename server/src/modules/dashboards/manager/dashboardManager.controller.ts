// src/modules/dashboards/dashboard-manager/dashboardManager.controller.ts

import type { Response, NextFunction } from 'express';
import type { ParsedQs } from 'qs';
import type { AuthRequest } from '../../../middlewares/auth/auth.middleware.js';
import type { AuthenticatedRequester } from './dashboardManager.service.js';
import type { AccessLevel } from '../../../middlewares/auth/permission.middleware.js';
import { DashboardManagerService } from './dashboardManager.service.js';
import type { ManagerDashboardFilterDTO } from './dashboardManager.dto.js';
import { RequisicaoInvalidaError } from '../../../middlewares/errors/domainErrors.middleware.js';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type DashboardManagerQueryParams = ParsedQs & {
  teamId?: string;
  startDate?: string;
  endDate?: string;
};

type DashboardManagerRequest = AuthRequest<
  Record<string, never>,
  unknown,
  DashboardManagerQueryParams
>;

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD MANAGER CONTROLLER — negociação-cêntrico
// ─────────────────────────────────────────────────────────────────────────────

export class DashboardManagerController {
  private readonly service: DashboardManagerService;

  constructor() {
    this.service = new DashboardManagerService();
  }

  // ─── HELPERS PRIVADOS ────────────────────────────────────────────────────

  /**
   * Resolve o ID da equipa alvo:
   *   1. Query param `teamId` (GM/ADMIN navegando entre equipas).
   *   2. Primeiro team_id do token (MANAGER consultando a própria equipa).
   */
  private resolveTargetTeamId(req: DashboardManagerRequest): string {
    const targetId = req.query.teamId ?? req.user.team_ids[0];
    if (!targetId) {
      throw new RequisicaoInvalidaError(
        'ID da equipa não encontrado: informe teamId na query ou verifique o token.',
      );
    }
    return targetId;
  }

  /** Mapeia req.user para o tipo esperado pelo service. */
  private buildRequester(req: DashboardManagerRequest): AuthenticatedRequester {
    return {
      id: req.user.id,
      role: req.user.role as AccessLevel,
      team_ids: req.user.team_ids,
    };
  }

  /** req.query já validado/transformado pelo validateQuery(schema). */
  private extractFilters(req: DashboardManagerRequest): ManagerDashboardFilterDTO {
    return req.query as unknown as ManagerDashboardFilterDTO;
  }

  /**
   * Fábrica de handlers — elimina os blocos try/catch repetidos.
   * Métricas de snapshot simplesmente ignoram o terceiro argumento.
   */
  private handle(
    serviceCall: (
      requester: AuthenticatedRequester,
      targetTeamId: string,
      filters: ManagerDashboardFilterDTO,
    ) => Promise<unknown>,
  ) {
    return async (
      req: DashboardManagerRequest,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      try {
        const data = await serviceCall(
          this.buildRequester(req),
          this.resolveTargetTeamId(req),
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

  public getStagnantNegotiations = this.handle((r, t) =>
    this.service.getStagnantNegotiations(r, t),
  );

  // ─── CHART HANDLERS ──────────────────────────────────────────────────────

  public getStageFunnel = this.handle((r, t) => this.service.getStageFunnel(r, t));

  public getSalesByAttendant = this.handle((r, t, f) =>
    this.service.getSalesByAttendant(r, t, f),
  );

  public getWorkloadByAttendant = this.handle((r, t) =>
    this.service.getWorkloadByAttendant(r, t),
  );

  public getEvolution = this.handle((r, t, f) => this.service.getEvolution(r, t, f));

  public getIdleLeads = this.handle((r, t) => this.service.getIdleLeads(r, t));
}
