// src/modules/dashboards/general-manager/dashboardGeneralManager.controller.ts

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

/**
 * Query params que chegam neste router após validação pelo schema Zod.
 * Não há teamId nem attendantId — a visão do General Manager é sempre global.
 */
type DashboardGeneralManagerQueryParams = ParsedQs & {
  startDate?: string;
  endDate?: string;
};

/** Especialização de AuthRequest para as rotas deste controller. */
type DashboardGeneralManagerRequest = AuthRequest<
  Record<string, never>,
  unknown,
  DashboardGeneralManagerQueryParams
>;

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD GENERAL MANAGER CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────
// Mais simples que o DashboardManagerController: não há targetId para resolver
// — todos os endpoints operam sobre a visão global sem parâmetro de escopo.

export class DashboardGeneralManagerController {
  private readonly service: DashboardGeneralManagerService;

  constructor() {
    this.service = new DashboardGeneralManagerService();
  }

  // ─── HELPERS PRIVADOS ────────────────────────────────────────────────────

  /**
   * Mapeia req.user para AuthenticatedRequester.
   * O role já foi validado pelo authMiddleware + permission.middleware,
   * portanto o cast para AccessLevel é seguro neste ponto.
   */
  private buildRequester(req: DashboardGeneralManagerRequest): AuthenticatedRequester {
    return {
      id: req.user.id,
      role: req.user.role as AccessLevel,
      team_ids: req.user.team_ids,
    };
  }

  /**
   * req.query foi validado e transformado pelo validateQuery(generalManagerDashboardFilterSchema),
   * portanto o cast para GeneralManagerDashboardFilterDTO é seguro neste ponto.
   */
  private extractFilters(
    req: DashboardGeneralManagerRequest,
  ): GeneralManagerDashboardFilterDTO {
    return req.query as unknown as GeneralManagerDashboardFilterDTO;
  }

  // ─── KPI HANDLERS ────────────────────────────────────────────────────────

  public getGlobalKpis = async (
    req: DashboardGeneralManagerRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getGlobalKpis(
        this.buildRequester(req),
        this.extractFilters(req),
      );
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  public getTopTeam = async (
    req: DashboardGeneralManagerRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getTopTeam(
        this.buildRequester(req),
        this.extractFilters(req),
      );
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  // ─── CHART HANDLERS ──────────────────────────────────────────────────────

  public getLeadsByTeam = async (
    req: DashboardGeneralManagerRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getLeadsByTeam(
        this.buildRequester(req),
        this.extractFilters(req),
      );
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  public getTeamRanking = async (
    req: DashboardGeneralManagerRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getTeamRanking(
        this.buildRequester(req),
        this.extractFilters(req),
      );
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  public getGlobalEvolution = async (
    req: DashboardGeneralManagerRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getGlobalEvolution(
        this.buildRequester(req),
        this.extractFilters(req),
      );
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  public getGlobalFunnel = async (
    req: DashboardGeneralManagerRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getGlobalFunnel(
        this.buildRequester(req),
        this.extractFilters(req),
      );
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };
}