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

// Helper interno — converte um ZodError numa mensagem amigável e repassa
// como ErroDeValidacaoError (422) pro globalErrorHandler.
function handleZodError(error: unknown, next: NextFunction) {
  if (error instanceof ZodError) {
    const messages = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
    return next(new ErroDeValidacaoError(messages.join(" | ")));
  }
  next(error);
}

// Valida e substitui o req.body pelo valor já parseado pelo Zod
// Usado em endpoints POST, PUT e PATCH
export function validateBody(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      handleZodError(error, next);
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

      // 2. Como o Express 5 impede `req.query = ...`, esvaziamos o objeto original...
      for (const key in req.query) {
        delete req.query[key];
      }

      // 3. ...e injetamos os dados já tipados/validados de volta no mesmo objeto
      Object.assign(req.query, parsedQuery);

      next();
    } catch (error) {
      handleZodError(error, next);
    }
  };
}

// Valida req.params (ex.: garantir que :id é um UUID válido)
// Útil pra evitar que strings malformadas cheguem até o Prisma e gerem erros opacos.
export function validateParams(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.params);
      // req.params pode ser sobrescrito normalmente no Express 4 e 5
      Object.assign(req.params, parsed);
      next();
    } catch (error) {
      handleZodError(error, next);
    }
  };
}
