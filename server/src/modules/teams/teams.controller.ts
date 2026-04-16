import type { Request, Response, NextFunction } from "express";
import { TeamsService } from "./teams.service.js";

const service = new TeamsService();

export class TeamsController {

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const isActiveParam = req.query.is_active;

      let isActive: boolean | undefined;

      if (isActiveParam === "true") {
        isActive = true;
      } else if (isActiveParam === "false") {
        isActive = false;
      } else {
        isActive = undefined;
      }

      const teams = await service.findAll(isActive);

      return res.status(200).json({
        success: true,
        data: teams
      });

    } catch (err) {
      next(err);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      const team = await service.findById(id);

      return res.status(200).json({
        success: true,
        data: team
      });

    } catch (err) {
      next(err);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await service.create(req.body);

      return res.status(201).json({
        success: true,
        data: team
      });

    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      const team = await service.update(id, req.body);

      return res.status(200).json({
        success: true,
        data: team
      });

    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;

      await service.delete(id);

      return res.status(204).send();

    } catch (err) {
      next(err);
    }
  }
}