// server/src/modules/negotiation-status/status.controller.ts
import { Request, Response, NextFunction } from "express";
import { NegotiationStatusService } from "./status.service";

// ─────────────────────────────────────────────
// NEGOTIATION STATUS CONTROLLER
// ─────────────────────────────────────────────

// Tipo auxiliar para tipar req.params com id obrigatório
type ParamsWithId = { id: string };

export const NegotiationStatusController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      // req.query já foi validado e tipado pelo validateQuery (Zod)
      const filters = req.query as any;
      const statusHistory = await NegotiationStatusService.findAll(filters);

      return res.status(200).json({
        success: true,
        data: statusHistory,
      });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request<ParamsWithId>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const statusHistory = await NegotiationStatusService.findById(id);

      return res.status(200).json({
        success: true,
        data: statusHistory,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // req.body já chega 100% validado pelo validateBody
      const data = req.body;

      // ⚠️ Pega o ID do usuário autenticado no token (ou usa fallback)
      const userId = (req as any).user?.id || "00000000-0000-0000-0000-000000000000";

      const statusHistory = await NegotiationStatusService.create({
        ...data,
        created_by_user_id: userId,
      });

      return res.status(201).json({
        success: true,
        data: statusHistory,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request<ParamsWithId>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body;

      const userId = (req as any).user?.id || "00000000-0000-0000-0000-000000000000";

      const statusHistory = await NegotiationStatusService.update(id, {
        ...data,
        updated_by_user_id: userId,
      });

      return res.status(200).json({
        success: true,
        data: statusHistory,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request<ParamsWithId>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await NegotiationStatusService.delete(id);

      return res.status(200).json({
        success: true,
        message: "Histórico de status excluído com sucesso.",
      });
    } catch (error) {
      next(error);
    }
  },
};