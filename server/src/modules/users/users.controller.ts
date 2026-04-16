// server/src/modules/users/users.controller.ts
import type { Request, Response, NextFunction } from "express";
import { UsersService } from "./users.service.js";

export class UsersController {
    private usersService = new UsersService();

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const user = await this.usersService.create(req.body);
            return res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }

    async findAll(req: Request, res: Response, next: NextFunction) {
        try {
            const users = await this.usersService.findAll();
            return res.json(users);
        } catch (error) {
            next(error);
        }
    }

    async findById(req: Request, res: Response, next: NextFunction) {
        try {
            const id = String(req.params.id);
            const user = await this.usersService.findById(id);
            return res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = String(req.params.id);
            const user = await this.usersService.update(id, req.body);
            return res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async softDelete(req: Request, res: Response, next: NextFunction) {
        try {
            const id = String(req.params.id);
            await this.usersService.softDelete(id);
            return res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}