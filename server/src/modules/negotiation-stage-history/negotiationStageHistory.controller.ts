// server/src/modules/negotiation-stage-history/negotiationStageHistory.controller.ts
import { Request, Response, NextFunction } from "express";
import { NegotiationStageHistoryService } from "./negotiationStageHistory.service";

// ─────────────────────────────────────────────
// NEGOTIATION STAGE HISTORY CONTROLLER
// ─────────────────────────────────────────────

// Tipo auxiliar para tipar req.params com id obrigatório
type ParamsWithId = { id: string };

export const NegotiationStageHistoryController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      // Os query params já chegam validados, tipados e limpos pelo Zod no middleware
      const filters = req.query as any;
      const stageHistory = await NegotiationStageHistoryService.findAll(filters);

      return res.status(200).json({
        success: true,
        data: stageHistory,
      });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request<ParamsWithId>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const stageHistory = await NegotiationStageHistoryService.findById(id);

      return res.status(200).json({
        success: true,
        data: stageHistory,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // O req.body já chega 100% validado de acordo com o Schema do Zod
      const data = req.body;

      // ⚠️ Extrai o ID do usuário autenticado no token (req.user)
      const userId = (req as any).user?.id || "00000000-0000-0000-0000-000000000000";

      const stageHistory = await NegotiationStageHistoryService.create({
        ...data,
        created_by_user_id: userId,
      });

      return res.status(201).json({
        success: true,
        data: stageHistory,
      });
    } catch (error) {
      // Se a regra de negócio do Service falhar (ex: tentar adicionar estágio em negociação 'closed'),
      // o erro cai aqui e o domainErrors.middleware devolve o status 400 bonitinho.
      next(error);
    }
  },

  async update(req: Request<ParamsWithId>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = req.body;

      const userId = (req as any).user?.id || "00000000-0000-0000-0000-000000000000";

      const stageHistory = await NegotiationStageHistoryService.update(id, {
        ...data,
        updated_by_user_id: userId,
      });

      return res.status(200).json({
        success: true,
        data: stageHistory,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request<ParamsWithId>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await NegotiationStageHistoryService.delete(id);

      return res.status(200).json({
        success: true,
        message: "Histórico de estágio excluído com sucesso.",
      });
    } catch (error) {
      next(error);
    }
  },
};