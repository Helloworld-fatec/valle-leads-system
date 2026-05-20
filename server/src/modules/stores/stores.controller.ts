// src/modules/stores/stores.controller.ts
import type { Response, NextFunction } from "express";
import { StoresService } from "./store.service.js";
import type { AuthRequest } from "../../middlewares/auth/auth.middleware.js";
import type {
  CreateStoreDTO,
  UpdateStoreDTO,
  StoreIdParamDTO,
} from "./stores.dto.js";

export class StoresController {
  private service = new StoresService();

  // GET /stores
  findAll = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const stores = await this.service.findAll();
      res.status(200).json({ success: true, data: stores });
    } catch (err) {
      next(err);
    }
  };

  // GET /stores/:id
  findById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params as unknown as StoreIdParamDTO;
      const store = await this.service.findById(id);
      res.status(200).json({ success: true, data: store });
    } catch (err) {
      next(err);
    }
  };

  // POST /stores
  create = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const body = req.body as CreateStoreDTO;
      const store = await this.service.create(body, req.user!.id);
      res.status(201).json({ success: true, data: store });
    } catch (err) {
      next(err);
    }
  };

  // PUT/PATCH /stores/:id
  update = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params as unknown as StoreIdParamDTO;
      const body = req.body as UpdateStoreDTO;
      const store = await this.service.update(id, body, req.user!.id);
      res.status(200).json({ success: true, data: store });
    } catch (err) {
      next(err);
    }
  };

  // DELETE /stores/:id (soft)
  softDelete = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params as unknown as StoreIdParamDTO;
      await this.service.softDelete(id, req.user!.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  // DELETE /stores/:id/hard
  hardDelete = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params as unknown as StoreIdParamDTO;
      await this.service.hardDelete(id, req.user!.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}