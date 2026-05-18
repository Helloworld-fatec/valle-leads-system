// src/modules/leads/lead.controller.ts
import type { Response, NextFunction } from "express";
import { LeadsService, type ActorContext } from "./lead.service.js";
import type { AuthRequest } from "../../middlewares/auth/auth.middleware.js";

// ─────────────────────────────────────────────
// LEADS CONTROLLER
// ─────────────────────────────────────────────
// Camada de apresentação. Responsabilidades:
//   - Extrair o actor a partir de req.user (injetado pelo authMiddleware)
//   - Delegar pro service
//   - Devolver resposta HTTP
//
// Sem regras de negócio aqui. Sem schema.parse — a validação Zod já
// rodou nos middlewares de rota (validateBody/validateQuery/validateParams).
// ─────────────────────────────────────────────

export class LeadsController {
  private leadsService = new LeadsService();

  // O authMiddleware garante que req.user existe nas rotas protegidas.
  // Esse helper só ajusta o tipo pra ActorContext.
  private getActor(req: AuthRequest): ActorContext {
    return {
      id: req.user!.id,
      role: req.user!.role as ActorContext["role"],
      team_ids: req.user!.team_ids,
    };
  }

  findAll = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const actor = this.getActor(req);
      // req.query já foi parseado e tipado pelo validateQuery
      const result = await this.leadsService.findAll(req.query as any, actor);
      return res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const actor = this.getActor(req);
      const lead = await this.leadsService.findById(req.params.id, actor);
      return res.status(200).json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  };

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const actor = this.getActor(req);
      const lead = await this.leadsService.create(req.body, actor);
      return res.status(201).json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const actor = this.getActor(req);
      const lead = await this.leadsService.update(req.params.id, req.body, actor);
      return res.status(200).json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  };

  softDelete = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const actor = this.getActor(req);
      await this.leadsService.softDelete(req.params.id, actor);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}
