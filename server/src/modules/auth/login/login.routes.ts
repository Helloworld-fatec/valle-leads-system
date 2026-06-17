// server/src/modules/auth/login/login.routes.ts
import { Router } from "express";
import { LoginController } from "./login.controller.js";
import { validateBody } from "../../../middlewares/validation/validate.middleware.js";
import { loginSchema, refreshTokenSchema } from "./login.dto.js";
import {
  createLogMiddleware,
  LOG_ACTIONS,
  LOG_MODULES,
} from "../../../middlewares/log/log.middleware.js";

// Será adicionado na Etapa 3.
// import { authMiddleware } from "../../../middlewares/auth/auth.middleware.js";

// ─────────────────────────────────────────────
// AUTH / LOGIN ROUTES
// ─────────────────────────────────────────────
// Endpoints expostos:
//   POST /auth/login    → autentica e devolve access + refresh
//   POST /auth/refresh  → rotaciona o par de tokens
//   POST /auth/logout   → encerra a sessão (limpa cookie)
//
// Recuperação e redefinição de senha vivem em outro módulo
// (forgot-password / reset-password), conforme combinado.
// ─────────────────────────────────────────────

const router = Router();
const loginController = new LoginController();

// POST /auth/login — público
router.post(
  "/login",
  validateBody(loginSchema),
  createLogMiddleware({
    action: LOG_ACTIONS.auth.LOGIN,
    module: LOG_MODULES.AUTH,
  }),
  loginController.login.bind(loginController)
);

// POST /auth/refresh — público (a segurança vem da assinatura do refresh token)
router.post(
  "/refresh",
  validateBody(refreshTokenSchema),
  createLogMiddleware({
    action: LOG_ACTIONS.auth.REFRESH_TOKEN,
    module: LOG_MODULES.AUTH,
  }),
  loginController.refresh.bind(loginController)
);

// POST /auth/logout — pode ser público ou autenticado.
// Manter público é prático (cliente desloga mesmo sem access válido),
// mas autenticar permite registrar log com o user_id (RF07).
// Quando a Etapa 3 estiver pronta, basta descomentar authMiddleware.
router.post(
  "/logout",
  // authMiddleware,
  createLogMiddleware({
    action: LOG_ACTIONS.auth.LOGOUT,
    module: LOG_MODULES.AUTH,
  }),
  loginController.logout.bind(loginController)
);

export default router;