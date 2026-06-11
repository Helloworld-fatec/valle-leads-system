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
import {
  createLogMiddleware,
  LOG_ACTIONS,
  LOG_MODULES,
} from "../../middlewares/log/log.middleware.js";

// ─────────────────────────────────────────────
// USERS ROUTES
// ─────────────────────────────────────────────
// Pipeline de cada rota:
//   authMiddleware          → exige access token válido + injeta req.user
//   checkPermission/Role    → RBAC "grosso" por role
//   validate*               → valida e tipifica dados via Zod
//   createLogMiddleware     → agenda gravação assíncrona em system_logs
//   controller.handler      → orquestra service e responde
//
// O log middleware é posicionado ANTES do controller intencionalmente:
//   - Ele só grava após res.on("finish"), então o controller já executou.
//   - Precisa estar na pipeline (não no controller) para manter a separação
//     de responsabilidades — o controller não sabe que existe log.
//   - Fica DEPOIS das validações para não logar tentativas que falhariam
//     em validação antes mesmo de chegar ao service.
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
  createLogMiddleware({
    action: LOG_ACTIONS.users.LIST,
    module: LOG_MODULES.USERS,
  }),
  controller.findAll
);

// ─── LEITURA POR ID ──────────────────────────────────
usersRouter.get(
  "/:id",
  checkPermission("ATTENDANT"),
  validateParams(userIdParamSchema),
  createLogMiddleware({
    action: LOG_ACTIONS.users.GET,
    module: LOG_MODULES.USERS,
    description: (req) => `Consulta do usuário ${req.params.id}`,
  }),
  controller.findById
);

// ─── CRIAÇÃO ─────────────────────────────────────────
usersRouter.post(
  "/",
  checkRole("ADMIN"),
  validateBody(createUserSchema),
  createLogMiddleware({
    action: LOG_ACTIONS.users.CREATE,
    module: LOG_MODULES.USERS,
    description: (req) => `Criação de usuário: ${(req.body as { email?: string }).email ?? ""}`,
  }),
  controller.create
);

// ─── ATUALIZAÇÃO ─────────────────────────────────────
// Middleware condicional: escolhe o schema Zod correto com base no actor.
//   - ADMIN editando qualquer id     → updateUserAdminSchema (campos completos)
//   - qualquer role no próprio id    → updateSelfSchema (inclui current/new_password)
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
  createLogMiddleware({
    action: LOG_ACTIONS.users.UPDATE,
    module: LOG_MODULES.USERS,
    description: (req) => `Atualização (PUT) do usuário ${req.params.id}`,
  }),
  controller.update
);

usersRouter.patch(
  "/:id",
  checkPermission("ATTENDANT"),
  validateParams(userIdParamSchema),
  conditionalValidateBody,
  createLogMiddleware({
    action: LOG_ACTIONS.users.UPDATE,
    module: LOG_MODULES.USERS,
    description: (req) => `Atualização (PATCH) do usuário ${req.params.id}`,
  }),
  controller.update
);

// ─── EXCLUSÃO ────────────────────────────────────────
// /hard deve vir ANTES de /:id para o Express resolver corretamente
usersRouter.delete(
  "/:id/hard",
  checkRole("ADMIN"),
  validateParams(userIdParamSchema),
  createLogMiddleware({
    action: LOG_ACTIONS.users.HARD_DELETE,
    module: LOG_MODULES.USERS,
    description: (req) => `Hard delete do usuário ${req.params.id}`,
  }),
  controller.hardDelete
);

usersRouter.delete(
  "/:id",
  checkRole("ADMIN"),
  validateParams(userIdParamSchema),
  createLogMiddleware({
    action: LOG_ACTIONS.users.SOFT_DELETE,
    module: LOG_MODULES.USERS,
    description: (req) => `Soft delete do usuário ${req.params.id}`,
  }),
  controller.softDelete
);

export default usersRouter;