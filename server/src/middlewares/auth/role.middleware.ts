import { Request, Response, NextFunction } from "express";
import { AppError } from "../../utils/appError.utils.js";

export function authorizeRoles(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      throw new AppError("Usuário não autenticado", 401);
    }

    if (!roles.includes(user.role)) {
      throw new AppError("Acesso negado", 403);
    }

    next();
  };
}