// server/src/modules/interest-items/item.controller.ts
import type { Response, NextFunction } from "express";
import { InterestItemsService } from "./item.service.js";
import type { AuthRequest } from "../../middlewares/auth/auth.middleware.js";
import type {
  CreateInterestItemDTO,
  UpdateInterestItemDTO,
  QueryInterestItemDTO,
  InterestItemIdParamDTO,
} from "./item.dto.js";

// ─────────────────────────────────────────────
// INTEREST ITEMS CONTROLLER
// ─────────────────────────────────────────────
// Extrai dados do request, delega ao service e formata a response.
// Sem regras de negócio aqui.
//
// req.user é garantido pelo authMiddleware em todas as rotas
// deste módulo — o "!" é seguro nesse contexto.
// ─────────────────────────────────────────────

export const InterestItemsController = {
  // GET /interest-items — qualquer role autenticado
  async findAll(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = req.query as unknown as QueryInterestItemDTO;
      const items = await InterestItemsService.findAll(filters);
      res.status(200).json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  },

  // GET /interest-items/:id — qualquer role autenticado
  async findById(
    req: AuthRequest<InterestItemIdParamDTO>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const item = await InterestItemsService.findById(id);
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  },

  // POST /interest-items — GENERAL_MANAGER ou ADMIN
  async create(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = req.body as CreateInterestItemDTO;
      const actorId = req.user!.id;
      const item = await InterestItemsService.create(body, actorId);
      res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  },

  // PUT/PATCH /interest-items/:id — GENERAL_MANAGER ou ADMIN
  async update(
    req: AuthRequest<InterestItemIdParamDTO>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const body = req.body as UpdateInterestItemDTO;
      const actorId = req.user!.id;
      const item = await InterestItemsService.update(id, body, actorId);
      res.status(200).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /interest-items/:id — GENERAL_MANAGER ou ADMIN (soft delete)
  async softDelete(
    req: AuthRequest<InterestItemIdParamDTO>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      const actorId = req.user!.id;
      await InterestItemsService.softDelete(id, actorId);
      res.status(200).json({
        success: true,
        message: "Item de interesse desativado com sucesso.",
      });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /interest-items/:id/hard — somente ADMIN (hard delete)
  async hardDelete(
    req: AuthRequest<InterestItemIdParamDTO>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      await InterestItemsService.hardDelete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
