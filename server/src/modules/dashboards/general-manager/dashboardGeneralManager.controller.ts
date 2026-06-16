// src/modules/dashboards/dashboard-general-manager/dashboardGeneralManager.controller.ts

import type { Response, NextFunction } from 'express';
import type { ParsedQs } from 'qs';
import type { AuthRequest } from '../../../middlewares/auth/auth.middleware.js';
import type { AuthenticatedRequester } from './dashboardGeneralManager.service.js';
import type { AccessLevel } from '../../../middlewares/auth/permission.middleware.js';
import { DashboardGeneralManagerService } from './dashboardGeneralManager.service.js';
import type { GeneralManagerDashboardFilterDTO } from './dashboardGeneralManager.dto.js';

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type DashboardGMQueryParams = ParsedQs & {
  startDate?: string;
  endDate?: string;
};

type DashboardGMRequest = AuthRequest<Record<string, never>, unknown, DashboardGMQueryParams>;

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD GENERAL MANAGER CONTROLLER — negociação-cêntrico
// ─────────────────────────────────────────────────────────────────────────────

export class DashboardGeneralManagerController {
  private readonly service: DashboardGeneralManagerService;

  constructor() {
    this.service = new DashboardGeneralManagerService();
  }

  // ─── HELPERS PRIVADOS ─────────────────────────────────────────────────────

  /** Mapeia req.user para o tipo esperado pelo service. */
  private buildRequester(req: DashboardGMRequest): AuthenticatedRequester {
    return {
      id: req.user.id,
      role: req.user.role as AccessLevel,
      team_ids: req.user.team_ids,
    };
  }

  /** req.query já validado/transformado pelo validateQuery(schema). */
  private extractFilters(req: DashboardGMRequest): GeneralManagerDashboardFilterDTO {
    return req.query as unknown as GeneralManagerDashboardFilterDTO;
  }

  /**
   * Fábrica de handlers — elimina os blocos try/catch repetidos.
   * Métricas de snapshot simplesmente ignoram o segundo argumento.
   */
  private handle(
    serviceCall: (
      requester: AuthenticatedRequester,
      filters: GeneralManagerDashboardFilterDTO,
    ) => Promise<unknown>,
  ) {
    return async (
      req: DashboardGMRequest,
      res: Response,
      next: NextFunction,
    ): Promise<void> => {
      try {
        const data = await serviceCall(
          this.buildRequester(req),
          this.extractFilters(req),
        );
        res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    };
  }

  // ─── KPI HANDLERS ────────────────────────────────────────────────────────

  public getActiveNegotiations = this.handle((r) => this.service.getActiveNegotiations(r));

  public getSales = this.handle((r, f) => this.service.getSales(r, f));

  public getSalesValue = this.handle((r, f) => this.service.getSalesValue(r, f));

  public getPipelineValue = this.handle((r) => this.service.getPipelineValue(r));

  // ─── CHART HANDLERS ──────────────────────────────────────────────────────

  public getStageFunnel = this.handle((r) => this.service.getStageFunnel(r));

  public getSalesByTeam = this.handle((r, f) => this.service.getSalesByTeam(r, f));

  public getSalesByStore = this.handle((r, f) => this.service.getSalesByStore(r, f));

  public getEvolution = this.handle((r, f) => this.service.getEvolution(r, f));

  public getIdleLeads = this.handle((r) => this.service.getIdleLeads(r));
}
