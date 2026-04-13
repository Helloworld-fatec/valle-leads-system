import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";

const service = new AuthService();

export class AuthController {

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      const result = await service.login(email, password);

      return res.status(200).json({
        success: true,
        data: result
      });

    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      const result = await service.forgotPassword(email);

      return res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;

      const result = await service.resetPassword(token, newPassword);

      return res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (err) {
      next(err);
    }
  }

  async updatePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      const result = await service.updatePassword(
        userId,
        currentPassword,
        newPassword
      );

      return res.status(200).json({
        success: true,
        message: result.message
      });

    } catch (err) {
      next(err);
    }
  }
}