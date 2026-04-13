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
  }
}