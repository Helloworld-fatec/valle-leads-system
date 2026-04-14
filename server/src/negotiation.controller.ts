import type { Request, Response, NextFunction } from "express";
import { NegotiationsRepository } from "../repositories/negotiation.repository.js";

const repository = new NegotiationsRepository();

export class NegotiationsController {
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const { team_id, status, is_open } = req.query;
            const data = await repository.findAll({
                team_id: team_id as string,
                status: status as string,
                is_open: is_open ? is_open === 'true': undefined,
            });
            res.json({ success: true, data });
        } catch (error) { next(error); }
    }

    async detail(req: Request, res: Response, next: NextFunction) {
        try {
            const data = await repository.findById(req.params.id);
            if (!data) return res.status(404).json({ message: 'Negotiation not found'});
        } catch (error) { next(error); }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const data = await repository.create(req.body, userId);
            res.status(201).json({ success: true, data });
        } catch (error) { next(error); }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const data = await repository.update(req.params.id, req.body, userId);
            res.json({ success: true, data});
        } catch (error) { next(error); }
    }

    async changeStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            const { status, notes } = req.body;
            const data = await repository.updateStatus(req.params.id, status, notes, userId);
            res.json({ success: true, data });
        } catch (error) { next(error); }
    }
}