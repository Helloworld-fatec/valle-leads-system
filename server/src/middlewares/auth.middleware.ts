import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/appError.utils.js";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Token não informado", 401);
    }

    const [, token] = authHeader.split(" ");

    if (!token) {
      throw new AppError("Token inválido", 401);
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { userId: string };

    req.user = {
      id: decoded.userId
    };

    next();

  } catch (err) {
    next(new AppError("Não autorizado", 401));
import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { AcessoNaoAutorizadoError } from "./error.middleware.js"

// Extende o tipo do Request para expor o usuário autenticado nos controllers
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string
        role: string
      }
    }
  }
}

/**
 * Middleware de autenticação JWT.
 * Valida o token do header Authorization e injeta o usuário em req.user.
 * Quando o utilitário de JWT estiver pronto, substituir a verificação abaixo pela chamada correspondente.
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AcessoNaoAutorizadoError("Token not provided.")
    }

    const token = authHeader.split(" ")[1]
    if(!token) {
        throw new AcessoNaoAutorizadoError("Token not provided.");
    }

    const secret = process.env.JWT_SECRET

    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables.")
    }

    // Decodifica e valida o token — substituir por utilitário compartilhado quando disponível
    const decoded = jwt.verify(token, secret) as unknown as { id: string; role: string }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    }

    next()
  } catch (error) {
    next(new AcessoNaoAutorizadoError("Invalid or expired token."))
  }
}