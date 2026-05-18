// server/src/modules/auth/login/login.controller.ts
import type { Request, Response, NextFunction, CookieOptions } from "express";
import { LoginService } from "./login.service.js";

// ─────────────────────────────────────────────
// LOGIN CONTROLLER
// ─────────────────────────────────────────────
// Camada de apresentação do módulo de autenticação.
// Responsabilidades:
//   - Receber a request, repassar pro service
//   - Cuidar dos COOKIES (refresh_token vai em cookie httpOnly)
//   - Devolver o access_token e dados do usuário no body
//
// Estratégia de transporte do refresh token:
//   - PRINCIPAL: cookie httpOnly + secure + sameSite=strict
//     (protege contra XSS — JS do navegador não consegue ler)
//   - FALLBACK: aceita também no body em /auth/refresh
//     (útil pra mobile/SDK que não usa cookies)
// ─────────────────────────────────────────────

const REFRESH_COOKIE_NAME = "refresh_token";

// Configuração do cookie de refresh.
// Em produção (NODE_ENV=production): secure=true exige HTTPS.
// Em desenvolvimento local: secure=false, sameSite=lax pra funcionar com Vite na 5173.
const refreshCookieOptions = (): CookieOptions => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "strict" : "lax",
    path: "/api/auth", // limita o escopo do cookie às rotas de auth
    // O maxAge é calculado a partir de REFRESH_TOKEN_EXPIRES_IN.
    // Como o env é em formato "7d" / "30m", deixamos o navegador
    // descartar pela expiração do JWT em vez de redefinir maxAge aqui.
    // (Simplifica e evita drift entre as duas configurações.)
  };
};

export class LoginController {
  private loginService = new LoginService();

  // POST /auth/login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.loginService.login(req.body);

      // Refresh vai no cookie httpOnly
      res.cookie(REFRESH_COOKIE_NAME, result.refresh_token, refreshCookieOptions());

      // Devolve access_token + dados do usuário no body.
      // refresh_token NÃO vai no body (já está no cookie) — exceto se o
      // cliente precisar (ex.: mobile). Mantemos no body também por
      // conveniência de desenvolvimento; em produção pode ser removido.
      return res.status(200).json({
        access_token: result.access_token,
        access_token_expires_in: result.access_token_expires_in,
        refresh_token_expires_in: result.refresh_token_expires_in,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/refresh
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      // Prioridade: cookie > body
      const tokenFromCookie = req.cookies?.[REFRESH_COOKIE_NAME];
      const tokenFromBody = req.body?.refresh_token;
      const refreshToken: string | undefined = tokenFromCookie ?? tokenFromBody;

      const result = await this.loginService.refresh(refreshToken ?? "");

      // Rotação: emite cookie novo
      res.cookie(REFRESH_COOKIE_NAME, result.refresh_token, refreshCookieOptions());

      return res.status(200).json({
        access_token: result.access_token,
        access_token_expires_in: result.access_token_expires_in,
        refresh_token_expires_in: result.refresh_token_expires_in,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  // POST /auth/logout
  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      // Se a rota estiver protegida pelo authMiddleware, req.user existe.
      // Caso contrário, logout é idempotente — não tem problema.
      const userId = (req as any).user?.id ?? null;

      await this.loginService.logout(userId);

      // Limpa o cookie em qualquer cenário (mesmo se já não havia)
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
