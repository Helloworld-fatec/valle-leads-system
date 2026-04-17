import { Request, Response, NextFunction } from "express";
import { LeadsService } from "./lead.service";
import {
  QueryLeadSchema,
  CreateLeadSchema,
  UpdateLeadSchema,
} from "./lead.dtos";

// ─────────────────────────────────────────────
// LEADS CONTROLLER
// ─────────────────────────────────────────────

// Tipo auxiliar para tipar req.params com id obrigatório
type ParamsWithId = { id: string };

export const LeadsController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      // Query params são parseados e transformados pelo schema antes de chegar no service
      const filters = QueryLeadSchema.parse(req.query);
      const leads = await LeadsService.findAll(filters);

      return res.status(200).json({
        success: true,
        data: leads,
      });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request<ParamsWithId>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const lead = await LeadsService.findById(id);

      return res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreateLeadSchema.parse(req.body);
      const lead = await LeadsService.create(data);

      // 201 Created — recurso criado com sucesso
      return res.status(201).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request<ParamsWithId>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = UpdateLeadSchema.parse(req.body);
      const lead = await LeadsService.update(id, data);

      return res.status(200).json({
        success: true,
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  },

  async softDelete(req: Request<ParamsWithId>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Service cuida da validação — controller apenas repassa e retorna
      await LeadsService.softDelete(id);

      return res.status(200).json({
        success: true,
        message: "Lead desativado com sucesso.",
      });
    } catch (error) {
      next(error);
    }
  },
};