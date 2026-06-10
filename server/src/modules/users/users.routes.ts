// src/modules/users/users.routes.ts
import { Router } from "express";
import type { Response, NextFunction } from "express";
import { UsersController } from "./users.controller.js";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../../middlewares/validation/validate.middleware.js";
import {
  createUserSchema,
  updateUserAdminSchema,
  updateSelfSchema,
  listUsersQuerySchema,
  userIdParamSchema,
} from "./users.dto.js";
import { authMiddleware } from "../../middlewares/auth/auth.middleware.js";
import type { AuthRequest } from "../../middlewares/auth/auth.middleware.js";
import {
  checkPermission,
  checkRole,
} from "../../middlewares/auth/permission.middleware.js";

// ─────────────────────────────────────────────
// USERS ROUTES
// ─────────────────────────────────────────────
// Pipeline de cada rota:
//   authMiddleware          → exige access token válido + injeta req.user
//   checkPermission/Role    → RBAC "grosso" por role
//   validate*               → valida e tipifica dados via Zod
//   controller.handler      → orquestra service e responde
//
// Regras de acesso:
//   GET    /users              → MANAGER, GENERAL_MANAGER ou ADMIN
//   GET    /users/:id          → qualquer role autenticado
//   POST   /users              → somente ADMIN
//   PUT    /users/:id          → ADMIN (qualquer usuário) ou qualquer role (próprio id)
//   PATCH  /users/:id          → ADMIN (qualquer usuário) ou qualquer role (próprio id)
//   DELETE /users/:id          → somente ADMIN (soft delete)
//   DELETE /users/:id/hard     → somente ADMIN (hard delete físico)
//
// Importante:
//   - PUT/PATCH usa middleware condicional que escolhe o schema Zod correto:
//       ADMIN                     → updateUserAdminSchema (campos completos)
//       qualquer role, próprio id → updateSelfSchema (inclui current/new_password)
//     Isso evita que current_password e new_password sejam descartados antes
//     de chegar ao controller, o que causava "Nenhum campo enviado para atualização".
//   - /hard deve vir ANTES de /:id para o Express resolver primeiro.
// ─────────────────────────────────────────────

const usersRouter = Router();
const controller = new UsersController();

// Autenticação obrigatória em todo o módulo
usersRouter.use(authMiddleware);

// ─── LISTAGEM ────────────────────────────────────────
usersRouter.get(
  "/",
  checkPermission("MANAGER"),
  validateQuery(listUsersQuerySchema),
  controller.findAll
);

// ─── LEITURA POR ID ──────────────────────────────────
usersRouter.get(
  "/:id",
  checkPermission("ATTENDANT"),
  validateParams(userIdParamSchema),
  controller.findById
);

// ─── CRIAÇÃO ─────────────────────────────────────────
usersRouter.post(
  "/",
  checkRole("ADMIN"),
  validateBody(createUserSchema),
  controller.create
);

// ─── ATUALIZAÇÃO ─────────────────────────────────────
// Middleware condicional: escolhe o schema Zod correto com base no actor.
//   - ADMIN editando qualquer id     → updateUserAdminSchema (campos completos)
//   - qualquer role no próprio id    → updateSelfSchema (inclui current/new_password)
//
// Corrige o erro "Nenhum campo enviado para atualização" que ocorria porque
// o updateUserAdminSchema descartava current_password e new_password.
function conditionalValidateBody(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const isAdmin = req.user?.role === "ADMIN";
  const isSelf  = req.user?.id === req.params.id;

  if (!isAdmin && isSelf) {
    return validateBody(updateSelfSchema)(req, res, next);
  }
  return validateBody(updateUserAdminSchema)(req, res, next);
}

usersRouter.put(
  "/:id",
  checkPermission("ATTENDANT"),
  validateParams(userIdParamSchema),
  conditionalValidateBody,
  controller.update
);

usersRouter.patch(
  "/:id",
  checkPermission("ATTENDANT"),
  validateParams(userIdParamSchema),
  conditionalValidateBody,
  controller.update
);

// ─── EXCLUSÃO ────────────────────────────────────────
usersRouter.delete(
  "/:id/hard",
  checkRole("ADMIN"),
  validateParams(userIdParamSchema),
  controller.hardDelete
);

usersRouter.delete(
  "/:id",
  checkRole("ADMIN"),
  validateParams(userIdParamSchema),
  controller.softDelete
);

export default usersRouter;