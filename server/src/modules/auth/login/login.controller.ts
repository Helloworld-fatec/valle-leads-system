// server/src/modules/auth/login/login.controller.ts
import type { Request, Response, NextFunction, CookieOptions } from "express";
import { LoginService } from "./login.service.js";

const REFRESH_COOKIE_NAME = "refresh_token";

const refreshCookieOptions = (): CookieOptions => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    path: "/api/auth",
  };
};

export class LoginController {
  private loginService = new LoginService();

  // POST /api/auth/login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.loginService.login(req.body);

      // Refresh também no cookie httpOnly (mantido para compatibilidade futura)
      res.cookie(REFRESH_COOKIE_NAME, result.refresh_token, refreshCookieOptions());

      // refresh_token retorna no body — cliente salva no localStorage
      return res.status(200).json({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        access_token_expires_in: result.access_token_expires_in,
        refresh_token_expires_in: result.refresh_token_expires_in,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/refresh
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      // Prioridade: body > cookie (fluxo localStorage-first)
      const tokenFromBody = req.body?.refresh_token;
      const tokenFromCookie = req.cookies?.[REFRESH_COOKIE_NAME];
      const refreshToken: string | undefined = tokenFromBody ?? tokenFromCookie;

      const result = await this.loginService.refresh(refreshToken ?? "");

      // Rotaciona cookie e retorna novo par no body
      res.cookie(REFRESH_COOKIE_NAME, result.refresh_token, refreshCookieOptions());

      return res.status(200).json({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        access_token_expires_in: result.access_token_expires_in,
        refresh_token_expires_in: result.refresh_token_expires_in,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /api/auth/logout
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id ?? null;

      await this.loginService.logout(userId);

      res.clearCookie(REFRESH_COOKIE_NAME, {
        ...refreshCookieOptions(),
        maxAge: 0,
      });

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}