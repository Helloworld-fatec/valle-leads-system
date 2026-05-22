// src/modules/dashboards/dashboard-manager/dashboardManager.controller.ts

import { Request, Response, NextFunction } from 'express';
import { DashboardManagerService } from './dashboardManager.service.js';

export class DashboardManagerController {
  private service: DashboardManagerService;

  constructor() {
    this.service = new DashboardManagerService();
  }

  /**
   * Resolve o ID da equipa alvo: 
   * 1. Pega do parâmetro 'teamId' na query string (para navegação do General Manager).
   * 2. Caso contrário, usa o team_id do próprio utilizador logado.
   */
  /**
   * Resolve o teamId alvo e garante que é string — lança erro 400 antes
   * de chegar ao service caso não haja nenhum team_id disponível.
   * O service.validateAccess() ainda valida a permissão (403) depois.
   */
  private resolveTargetTeamId(req: Request): string {
    const queryTeamId = (req.query.teamId as string) || undefined;
    // O token armazena team_ids (array), nunca team_id (singular).
    const user = (req as any).user;
    const tokenTeamId: string | undefined = Array.isArray(user?.team_ids)
      ? (user.team_ids[0] as string | undefined)
      : (user?.team_id as string | undefined);

    const resolved = queryTeamId ?? tokenTeamId;

    if (!resolved) {
      throw new Error('ID da equipa não encontrado no token nem na query.');
    }

    return resolved;
  }

  public getTeamKpis = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetId = this.resolveTargetTeamId(req);
      const data = await this.service.getTeamKpis((req as any).user, targetId, req.query as any);
      res.status(200).json(data);
    } catch (error) { next(error); }
  };

  public getTopAttendant = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetId = this.resolveTargetTeamId(req);
      const data = await this.service.getTopAttendant((req as any).user, targetId, req.query as any);
      res.status(200).json(data);
    } catch (error) { next(error); }
  };

  public getLeadsByAttendant = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetId = this.resolveTargetTeamId(req);
      const data = await this.service.getLeadsByAttendant((req as any).user, targetId, req.query as any);
      res.status(200).json(data);
    } catch (error) { next(error); }
  };

  public getConversionsByAttendant = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetId = this.resolveTargetTeamId(req);
      const data = await this.service.getConversionsByAttendant((req as any).user, targetId, req.query as any);
      res.status(200).json(data);
    } catch (error) { next(error); }
  };

  public getTeamEvolution = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetId = this.resolveTargetTeamId(req);
      const data = await this.service.getTeamEvolution((req as any).user, targetId, req.query as any);
      res.status(200).json(data);
    } catch (error) { next(error); }
  };

  public getTeamFunnel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetId = this.resolveTargetTeamId(req);
      const data = await this.service.getTeamFunnel((req as any).user, targetId, req.query as any);
      res.status(200).json(data);
    } catch (error) { next(error); }
  };
}