// src/modules/dashboards/attendant/dashboardAttendant.controller.ts

import { Request, Response, NextFunction } from 'express';
import { DashboardAttendantService } from './dashboardAttendant.service.js';
import { AttendantDashboardFilterDTO } from './dashboardAttendant.dto.js';

export class DashboardAttendantController {
  private service: DashboardAttendantService;

  constructor() {
    this.service = new DashboardAttendantService();
  }

  /**
   * Helper para determinar qual ID de atendente deve ser consultado.
   * Prioriza o ID enviado na query (para Gerentes) ou usa o ID do próprio utilizador logado.
   */
  private getTargetId(req: Request): string {
    const queryId = req.query.attendantId as string;
    const requesterId = (req as any).user?.id;
    return queryId || requesterId;
  }

  public getActiveLeads = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetId = this.getTargetId(req);
      const data = await this.service.getActiveLeads((req as any).user, targetId, req.query as any);
      res.status(200).json(data);
    } catch (error) { next(error); }
  };

  public getConvertedLeads = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetId = this.getTargetId(req);
      const data = await this.service.getConvertedLeads((req as any).user, targetId, req.query as any);
      res.status(200).json(data);
    } catch (error) { next(error); }
  };

  public getConversionRate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetId = this.getTargetId(req);
      const data = await this.service.getConversionRate((req as any).user, targetId, req.query as any);
      res.status(200).json(data);
    } catch (error) { next(error); }
  };

  public getAvgServiceTime = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetId = this.getTargetId(req);
      const data = await this.service.getAvgServiceTime((req as any).user, targetId, req.query as any);
      res.status(200).json(data);
    } catch (error) { next(error); }
  };

  public getLeadsEvolution = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetId = this.getTargetId(req);
      const data = await this.service.getLeadsEvolution((req as any).user, targetId, req.query as any);
      res.status(200).json(data);
    } catch (error) { next(error); }
  };

  public getSalesFunnel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetId = this.getTargetId(req);
      const data = await this.service.getSalesFunnel((req as any).user, targetId, req.query as any);
      res.status(200).json(data);
    } catch (error) { next(error); }
  };

  public getLeadsBySource = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetId = this.getTargetId(req);
      const data = await this.service.getLeadsBySource((req as any).user, targetId, req.query as any);
      res.status(200).json(data);
    } catch (error) { next(error); }
  };

  public getConversionsByPeriod = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const targetId = this.getTargetId(req);
      const data = await this.service.getConversionsByPeriod((req as any).user, targetId, req.query as any);
      res.status(200).json(data);
    } catch (error) { next(error); }
  };
}