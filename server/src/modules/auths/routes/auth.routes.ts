import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";

import { validate } from "../../../middlewares/validade.middleware.js";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";

import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema
} from "../dtos/auth.dto.js";

const router = Router();
const controller = new AuthController();

// 🔓 ROTAS PÚBLICAS
router.post(
  "/login",
  validate(loginSchema),
  controller.login
);

router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  controller.forgotPassword
);

router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  controller.resetPassword
);

// 🔒 ROTA PROTEGIDA
router.patch(
  "/update-password",
  authMiddleware,
  validate(updatePasswordSchema),
  controller.updatePassword
);

export default router;