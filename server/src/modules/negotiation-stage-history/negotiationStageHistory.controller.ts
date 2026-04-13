import type { Request, Response, NextFunction } from "express";
import { negotiationStageHistoryService } from "./negotiationStageHistory.service.js";
import { createNegotiationStageHistorySchema } from "./negotiationStageHistory.dto.js";
import { RecursoNaoEncontradoError } from "../../middlewares/error.middleware.js";

/**
 * GET /negotiations/:id/history
 * Retorna o histórico completo de estágios de uma negociação (UC27)
 */
async function getHistory(req: Request, res: Response, next: NextFunction) {
    try{
        const {id} = req.params;
        if(!id || Array.isArray(id))
                throw new RecursoNaoEncontradoError("Negotiation ID not provided.");
        
        const history = await negotiationStageHistoryService.getHistoryByNegotiationId(id);

        res.status(200).json({
            success: true,
            data: history,
        });
    }   catch (error) {
        next(error)
    }
};

/**
 * POST /negotiations/:id:history
 * Permite adicionar uma entrada manual no histórico com notes (ex.: ajuste administrativo)
 */
async function createHistoryEntry(req: Request, res: Response, next: NextFunction) {
    try{
        const {id} = req.params;
        if(!id || Array.isArray(id))
                throw new RecursoNaoEncontradoError("Negotiation ID not provided.");

        // Valida o body com o schema Zod do DTO
        const parsed = createNegotiationStageHistorySchema.safeParse(req.body);
        if(!parsed.success) {
            res.status(400).json({
                success: true,
                message: parsed.error.issues.map((i) => i.message).join(", "),
            });
            return;
        }

        // changedBy virá do token JWT após o middleware de atenticação ser implementeado
        const changedBy = req.body.userId;

        const entry = await negotiationStageHistoryService.recordStageChange(
            id,
            parsed.data.old_status ?? parsed.data.new_status,
            parsed.data.new_status,
            changedBy,
        );

        res.status(201).json({
            success: true,
            data: entry,
        })
    }   catch (error) {
        next(error);
    }
};

export const negotiationStageHitoryController = {
    getHistory,
    createHistoryEntry,
};

