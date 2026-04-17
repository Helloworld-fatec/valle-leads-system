// server/src/modules/negotiation-importance/importance.controller.ts
import { Request, Response, NextFunction } from "express";
import { NegotiationImportanceService } from "./importance.service";

// ─────────────────────────────────────────────
// NEGOTIATION IMPORTANCE CONTROLLER
// ─────────────────────────────────────────────

// Tipo auxiliar para tipar req.params com id obrigatório
type ParamsWithId = { id: string };

export const NegotiationImportanceController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      // Os query params já chegam validados, tipados e limpos pelo Zod no middleware
      const filters = req.query as any;
      const importanceHistory = await NegotiationImportanceService.findAll(filters);

      return res.status(200).json({
        success: true,
        data: importanceHistory,
      });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request<ParamsWithId>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const importanceHistory = await NegotiationImportanceService.findById(id);

      return res.status(200).json({
        success: true,
        data: importanceHistory,
      });
    } catch (error) {
      next(error);
    }
  },

  // Equivalente ao seu antigo "updateImportance" (cria um novo registro na linha do tempo)
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // O req.body já chega 100% validado de acordo com o Schema do Zod
      const data = req.body;

      // ⚠️ Extrai o ID do usuário autenticado no token (req.user)
      const userId = (req as any).user?.id || "00000000-0000-0000-0000-000000000000";

      const importanceHistory = await NegotiationImportanceService.create({
        ...data,
        created_by_user_id: userId,
      });

      return res.status(201).json({
        success: true,
        data: importanceHistory,
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

      const importanceHistory = await NegotiationImportanceService.update(id, {
        ...data,
        updated_by_user_id: userId,
      });

      return res.status(200).json({
        success: true,
        data: importanceHistory,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request<ParamsWithId>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await NegotiationImportanceService.delete(id);

      return res.status(200).json({
        success: true,
        message: "Histórico de importância excluído com sucesso.",
      });
    } catch (error) {
      next(error);
    }
  },
};