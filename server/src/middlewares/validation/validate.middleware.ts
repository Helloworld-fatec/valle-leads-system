// server/src/middlewares/validation/validate.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ZodType, ZodError } from "zod";
import { ErroDeValidacaoError } from "../errors/domainErrors.middleware.js";

// ─────────────────────────────────────────────
// VALIDATE MIDDLEWARE
// ─────────────────────────────────────────────
// Middlewares reutilizáveis de validação Zod.
// Aplicados nas routes antes de chegar no controller —
// garantem que dados inválidos nunca chegam ao service.
// ─────────────────────────────────────────────

// Valida e substitui o req.body pelo valor já parseado pelo Zod
// Usado em endpoints POST, PUT e PATCH
export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // req.body é injetado pelo express.json() e pode ser reatribuído normalmente
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
        return next(new ErroDeValidacaoError(messages.join(" | ")));
      }
      next(error);
    }
  };
}

// Valida e substitui o req.query pelo valor já parseado pelo Zod
// Usado em endpoints GET com filtros — os transforms do schema convertem string → tipo correto
export function validateQuery(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Faz o parse (validação, tipagem e remoção de campos extras)
      const parsedQuery = schema.parse(req.query);

      // 2. Como o Express 5 impede `req.query = ...`, nós esvaziamos o objeto original...
      for (const key in req.query) {
        delete req.query[key];
      }

      // 3. ...e injetamos os dados já tipados/validados de volta no mesmo objeto
      Object.assign(req.query, parsedQuery);

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
        return next(new ErroDeValidacaoError(messages.join(" | ")));
      }
      next(error);
    }
  };
}