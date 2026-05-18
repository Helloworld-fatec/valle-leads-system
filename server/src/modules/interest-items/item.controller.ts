import { Request, Response, NextFunction } from "express";
import { InterestItemsService } from "./item.service";
import {
  QueryInterestItemSchema,
  CreateInterestItemSchema,
  UpdateInterestItemSchema,
} from "./item.dtos";

// ─────────────────────────────────────────────
// INTEREST ITEMS CONTROLLER
// ─────────────────────────────────────────────

type ParamsWithId = { id: string };

export const InterestItemsController = {
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = QueryInterestItemSchema.parse(req.query);
      const items = await InterestItemsService.findAll(filters);

      return res.status(200).json({ success: true, data: items });
    } catch (error) {
      next(error);
    }
  },

  async findById(req: Request<ParamsWithId>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const item = await InterestItemsService.findById(id);

      return res.status(200).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = CreateInterestItemSchema.parse(req.body);
      const item = await InterestItemsService.create(data);

      return res.status(201).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request<ParamsWithId>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const data = UpdateInterestItemSchema.parse(req.body);
      const item = await InterestItemsService.update(id, data);

      return res.status(200).json({ success: true, data: item });
    } catch (error) {
      next(error);
    }
  },

  async softDelete(req: Request<ParamsWithId>, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await InterestItemsService.softDelete(id);

      return res.status(200).json({
        success: true,
        message: "Item de interesse desativado com sucesso.",
      });
    } catch (error) {
      next(error);
    }
  },
};
