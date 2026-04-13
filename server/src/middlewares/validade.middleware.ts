import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "../utils/appError.utils.js";

export function validate(schema: z.ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body); // 🔥 valida body

      next();
    } catch (err: any) {
      return next(
        new AppError(err.errors?.[0]?.message || "Erro de validação", 400)
      );
    }
  };
}