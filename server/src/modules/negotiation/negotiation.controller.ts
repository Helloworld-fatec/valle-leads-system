// server/src/modules/negotiation/negotiation.controller.ts
import { Request, Response, NextFunction } from "express";
import { NegotiationsService } from "./negotiation.service";

// ─────────────────────────────────────────────
// NEGOTIATIONS CONTROLLER
// ─────────────────────────────────────────────

// Tipo auxiliar para tipar req.params com id obrigatório
type ParamsWithId = { id: string };

export const NegotiationsController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      // Os filtros já chegam validados e tipados pelo middleware validateQuery
      // Usamos "as any" aqui apenas para facilitar a ponte com o Service,
      // mas você também pode importar QueryNegotiationDTO e fazer o cast
      const filters = req.query as any; 
      const negotiations = await NegotiationsService.findAll(filters);

      return res.status(200).json({
        success: true,
        data: negotiations,
      });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request<ParamsWithId>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const negotiation = await NegotiationsService.findById(id);

      return res.status(200).json({
        success: true,
        data: negotiation,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      // O req.body já chega 100% validado pelo validateBody
      const data = req.body;

      // ⚠️ Pega o ID do usuário autenticado no token.
      // Substitua o fallback UUID padrão pelo comportamento esperado caso o usuário não exista (ex: lançar erro).
      const userId = (req as any).user?.id || "00000000-0000-0000-0000-000000000000";

      const negotiation = await NegotiationsService.create({
        ...data,
        created_by_user_id: userId,
      });

      return res.status(201).json({
        success: true,
        data: negotiation,
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

      const negotiation = await NegotiationsService.update(id, {
        ...data,
        updated_by_user_id: userId,
      });

      return res.status(200).json({
        success: true,
        data: negotiation,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request<ParamsWithId>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await NegotiationsService.delete(id);

      return res.status(200).json({
        success: true,
        message: "Negociação excluída com sucesso.",
      });
    } catch (error) {
      next(error);
    }
  },
};