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
      // Sobrescreve o body com o valor parseado — campos extras são removidos automaticamente
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formata todos os erros de validação em uma única mensagem legível
        // Ex: "name: Nome é obrigatório | cpf: CPF deve conter exatamente 11 dígitos numéricos"
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
      // Cast para any necessário pois o tipo do Express espera Record<string, string>
      // mas o Zod pode retornar tipos transformados (boolean, number, etc.)
      req.query = schema.parse(req.query) as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Formata todos os erros de validação em uma única mensagem legível
        const messages = error.issues.map((e) => `${e.path.join(".")}: ${e.message}`);
        return next(new ErroDeValidacaoError(messages.join(" | ")));
      }
      next(error);
    }
  };
}