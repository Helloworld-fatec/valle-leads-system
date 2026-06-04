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
 * Query params que chegam neste router — após validação pelo schema Zod.
 * attendantId é string | undefined; startDate/endDate chegam já como Date
 * após o transform do schema, mas a tipagem de req.query é sempre string-based
 * pelo Express, por isso o controller delega o cast para o service via DTO.
 */
type DashboardQueryParams = ParsedQs & {
  attendantId?: string;
  startDate?: string;
  endDate?: string;
};

/** Especialização de AuthRequest para as rotas deste controller. */
type DashboardRequest = AuthRequest<Record<string, never>, unknown, DashboardQueryParams>;

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD ATTENDANT CONTROLLER
// ─────────────────────────────────────────────────────────────────────────────

export class DashboardAttendantController {
  private readonly service: DashboardAttendantService;

  constructor() {
    this.service = new DashboardAttendantService();
  }

  // ─── HELPERS PRIVADOS ─────────────────────────────────────────────────────

  /**
   * Extrai o ID do atendente alvo.
   * - Query param `attendantId` tem precedência (uso por MANAGER/ADMIN).
   * - Fallback: ID do próprio usuário logado (uso típico do ATTENDANT).
   *
   * Lança RequisicaoInvalidaError se — por alguma falha de pipeline —
   * nenhum ID estiver disponível.
   */
  private resolveTargetId(req: DashboardRequest): string {
    const targetId = req.query.attendantId ?? req.user.id;
    if (!targetId) {
      throw new RequisicaoInvalidaError('ID do atendente não pôde ser determinado.');
    }
    return targetId;
  }

  /**
   * Mapeia req.user para AuthenticatedRequester, que é o tipo esperado pelo service.
   * O role já foi validado pelo authMiddleware + permission.middleware antes de
   * chegar aqui, então o cast para AccessLevel é seguro.
   */
  private buildRequester(req: DashboardRequest): AuthenticatedRequester {
    return {
      id: req.user.id,
      role: req.user.role as AccessLevel,
      team_ids: req.user.team_ids,
    };
  }

  /**
   * req.query foi validado e transformado pelo validateQuery(attendantDashboardFilterSchema),
   * portanto o cast para AttendantDashboardFilterDTO é seguro neste ponto.
   */
  private extractFilters(req: DashboardRequest): AttendantDashboardFilterDTO {
    return req.query as unknown as AttendantDashboardFilterDTO;
  }

  // ─── KPI HANDLERS ────────────────────────────────────────────────────────

  public getActiveLeads = async (
    req: DashboardRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getActiveLeads(
        this.buildRequester(req),
        this.resolveTargetId(req),
        this.extractFilters(req),
      );
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  public getConvertedLeads = async (
    req: DashboardRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getConvertedLeads(
        this.buildRequester(req),
        this.resolveTargetId(req),
        this.extractFilters(req),
      );
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  public getConversionRate = async (
    req: DashboardRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getConversionRate(
        this.buildRequester(req),
        this.resolveTargetId(req),
        this.extractFilters(req),
      );
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  public getAvgServiceTime = async (
    req: DashboardRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getAvgServiceTime(
        this.buildRequester(req),
        this.resolveTargetId(req),
        this.extractFilters(req),
      );
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  // ─── CHART HANDLERS ───────────────────────────────────────────────────────

  public getLeadsEvolution = async (
    req: DashboardRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getLeadsEvolution(
        this.buildRequester(req),
        this.resolveTargetId(req),
        this.extractFilters(req),
      );
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  public getSalesFunnel = async (
    req: DashboardRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getSalesFunnel(
        this.buildRequester(req),
        this.resolveTargetId(req),
        this.extractFilters(req),
      );
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  public getLeadsBySource = async (
    req: DashboardRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getLeadsBySource(
        this.buildRequester(req),
        this.resolveTargetId(req),
        this.extractFilters(req),
      );
      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  public getConversionsByPeriod = async (
    req: DashboardRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const data = await this.service.getConversionsByPeriod(
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