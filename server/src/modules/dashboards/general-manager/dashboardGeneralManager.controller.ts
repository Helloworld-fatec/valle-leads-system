// src/modules/dashboards/general-manager/dashboardGeneralManager.controller.ts

import { Request, Response, NextFunction } from 'express';
import { DashboardGeneralManagerService } from './dashboardGeneralManager.service.js';

export class DashboardGeneralManagerController {
  private service: DashboardGeneralManagerService;

  constructor() {
    this.service = new DashboardGeneralManagerService();
  }

  public getGlobalKpis = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getGlobalKpis((req as any).user, req.query as any);
      res.status(200).json(data);
    } catch (error) { next(error); }
  };

  public getTopTeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getTopTeam((req as any).user, req.query as any);
      res.status(200).json(data);
    } catch (error) { next(error); }
  };

  public getLeadsByTeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getLeadsByTeam((req as any).user, req.query as any);
      res.status(200).json(data);
    } catch (error) { next(error); }
  };

  public getTeamRanking = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getTeamRanking((req as any).user, req.query as any);
      res.status(200).json(data);
    } catch (error) { next(error); }
  };

  public getGlobalEvolution = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getGlobalEvolution((req as any).user, req.query as any);
      res.status(200).json(data);
    } catch (error) { next(error); }
  };

  public getGlobalFunnel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await this.service.getGlobalFunnel((req as any).user, req.query as any);
      res.status(200).json(data);
    } catch (error) { next(error); }
  };
}