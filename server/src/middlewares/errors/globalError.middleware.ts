// src/middlewares/errors/globalError.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AppError } from './domainErrors.middleware.js';

/**
 * Middleware global de tratamento de erros.
 * Intercepta exceções da aplicação e padroniza o JSON de resposta.
 */
export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Se for um erro de domínio conhecido, usa o status code definido
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
    return;
  }

  // Loga o erro real no console para debug (recomenda-se usar uma lib de log em prod)
  console.error('🔥 Erro Interno do Servidor:', err);

  // Fallback genérico para erros não tratados (Evita vazar stack trace para o client)
  res.status(500).json({
    status: 'error',
    message: 'Ocorreu um erro interno no servidor.',
  });
};