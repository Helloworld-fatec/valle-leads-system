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

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AcessoNaoAutorizadoError("Token not provided.")
    }

    const token = authHeader.split(" ")[1]

    if (!token) {
      throw new AcessoNaoAutorizadoError("Token not provided.")
    }

    const secret = process.env.JWT_SECRET

    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables.")
    }

    const decoded = jwt.verify(token, secret) as {
      id: string
      role: string
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    }

    next()
  } catch (error) {
    next(new AcessoNaoAutorizadoError("Invalid or expired token."))
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, decoded) => {
    if (err) {
      res.status(401).json({ message: 'Token inválido ou expirado' });
      return;
    }

    req.user = decoded as AuthRequest['user'];
    next();
  });
}
