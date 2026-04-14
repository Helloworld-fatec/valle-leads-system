import type { Request, Response, NextFunction } from "express";
import { importanceService } from "./importance.service.js";
import { updateNegotiationImportanceSchema } from "./importance.dto.js";

/**
 * GET /negotiations/:id/importance
 * Retorna o importance atual de uma negociação (UC23)
 */
async function getImportance(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      res.status(400).json({ success: false, message: "Negotiation ID not provided." });
      return;
    }

    const data = await importanceService.getImportance(id);

    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /negotiations/:id/importance
 * Registra um novo importance para a negociação (UC23 — RN17)
 */
async function updateImportance(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      res.status(400).json({ success: false, message: "Negotiation ID not provided." });
      return;
    }

    const parsed = updateNegotiationImportanceSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        success: false,
        message: parsed.error.issues.map((i) => i.message).join(", "),
      });
      return;
    }

    // changedBy virá de req.user.id após integração completa do authMiddleware
    const changedBy = req.user?.id ?? req.body.userId;

    const data = await importanceService.updateImportance(id, parsed.data.importance, changedBy);

    res.status(201).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

export const importanceController = {
  getImportance,
  updateImportance,
};