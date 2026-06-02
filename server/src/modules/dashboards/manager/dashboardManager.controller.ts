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

/**
 * Query params que chegam neste router após validação pelo schema Zod.
 * teamId é string | undefined; startDate/endDate chegam como strings brutas
 * do Express — o transform do schema já os converteu em Date no req.query,
 * mas a tipagem do Express sempre os expõe como string-based.
 * O controller delega o cast para o service via DTO.
 */
type DashboardManagerQueryParams = ParsedQs & {
  teamId?: string;
  startDate?: string;
  endDate?: string;
};

/** Especialização de AuthRequest para as rotas deste controller. */
type DashboardManagerRequest = AuthRequest<
  Record<string, never>,
  unknown,
  DashboardManagerQueryParams
>;

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD MANAGER CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────

export class DashboardManagerController {
  private readonly service: DashboardManagerService;

  constructor() {
    this.service = new DashboardManagerService();
  }

  // ─── HELPERS PRIVADOS ────────────────────────────────────────────────────

  /**
   * Resolve o ID da equipa alvo:
   *   1. Query param `teamId` (GENERAL_MANAGER/ADMIN navegando entre equipas).
   *   2. Primeiro team_id do token (MANAGER consultando a própria equipa).
   *
   * Lança RequisicaoInvalidaError se nenhum ID estiver disponível — o que
   * indica um estado inválido de pipeline (token sem team_ids e sem query param).
   * A validação de permissão (403) ocorre depois no service.assertCanAccess().
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

  /**
   * Mapeia req.user para AuthenticatedRequester.
   * O role já foi validado pelo authMiddleware + permission.middleware,
   * portanto o cast para AccessLevel é seguro neste ponto.
   */
  private buildRequester(req: DashboardManagerRequest): AuthenticatedRequester {
    return {
      id: req.user.id,
      role: req.user.role as AccessLevel,
      team_ids: req.user.team_ids,
    };
  }

  /**
   * req.query foi validado e transformado pelo validateQuery(managerDashboardFilterSchema),
   * portanto o cast para ManagerDashboardFilterDTO é seguro neste ponto.
   */
  private extractFilters(req: DashboardManagerRequest): ManagerDashboardFilterDTO {
    return req.query as unknown as ManagerDashboardFilterDTO;
  }

  // ─── KPI HANDLERS ────────────────────────────────────────────────────────

  public getTeamKpis = async (
    req: DashboardManagerRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getTeamKpis(
        this.buildRequester(req),
        this.resolveTargetTeamId(req),
        this.extractFilters(req),
      );
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  public getTopAttendant = async (
    req: DashboardManagerRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getTopAttendant(
        this.buildRequester(req),
        this.resolveTargetTeamId(req),
        this.extractFilters(req),
      );
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  // ─── CHART HANDLERS ──────────────────────────────────────────────────────

  public getLeadsByAttendant = async (
    req: DashboardManagerRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getLeadsByAttendant(
        this.buildRequester(req),
        this.resolveTargetTeamId(req),
        this.extractFilters(req),
      );
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  public getConversionsByAttendant = async (
    req: DashboardManagerRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getConversionsByAttendant(
        this.buildRequester(req),
        this.resolveTargetTeamId(req),
        this.extractFilters(req),
      );
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  public getTeamEvolution = async (
    req: DashboardManagerRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getTeamEvolution(
        this.buildRequester(req),
        this.resolveTargetTeamId(req),
        this.extractFilters(req),
      );
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  public getTeamFunnel = async (
    req: DashboardManagerRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getTeamFunnel(
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