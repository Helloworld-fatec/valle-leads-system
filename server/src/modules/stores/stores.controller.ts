import type { Request, Response, NextFunction } from "express";
import { StoresService } from "../store.service.js";

const service = new StoresService();

function getParam(param: string | string[] | undefined): string | null {
  if (!param || Array.isArray(param)) return null;
  return param;
}

export class StoresController {

  async findByTeamId(req: Request, res: Response, next: NextFunction) {
    try {
      const teamId = getParam(req.params.teamId);

      if (!teamId) {
        return res.status(400).json({ message: "Invalid teamId" });
      }

      const stores = await service.findByTeamId(teamId);

      return res.status(200).json({
        success: true,
        data: stores
      });

    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const store = await service.create(req.body);

      return res.status(201).json({
        success: true,
        data: store
      });

    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params.id);

      if (!id) {
        return res.status(400).json({ message: "Invalid id" });
      }

      const store = await service.update(id, req.body);

      return res.status(200).json({
        success: true,
        data: store
      });

    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params.id);

      if (!id) {
        return res.status(400).json({ message: "Invalid id" });
      }

      await service.delete(id);

      return res.status(204).send();

    } catch (err) {
      next(err);
    }
  }
}