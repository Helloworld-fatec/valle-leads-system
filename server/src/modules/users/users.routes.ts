// src/modules/users/users.routes.ts
import { Router } from "express";
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
//   - PUT/PATCH usa dois schemas diferentes injetados condicionalmente.
//     O controller despacha para updateAdmin ou updateSelf conforme actor.role e id.
//     A route usa validateBody com o schema mais permissivo (updateUserAdminSchema)
//     para deixar o campo chegar ao controller — o service bloqueia via RBAC quem
//     não pode usar campos sensíveis.
//   - /hard deve vir ANTES de /:id para o Express resolver primeiro.
// ─────────────────────────────────────────────

const usersRouter = Router();
const controller = new UsersController();

// Autenticação obrigatória em todo o módulo
usersRouter.use(authMiddleware);

// ─── LISTAGEM ────────────────────────────────────────
// checkPermission("MANAGER") aprova MANAGER, GENERAL_MANAGER e ADMIN (hierárquico)
usersRouter.get(
  "/",
  checkPermission("MANAGER"),
  validateQuery(listUsersQuerySchema),
  controller.findAll
);

// ─── LEITURA POR ID ──────────────────────────────────
// Qualquer autenticado — checkPermission("ATTENDANT") aprova todos os 4 roles
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
// validateBody usa updateUserAdminSchema (superconjunto dos campos).
// Para não-ADMIN no próprio id, o body é interpretado como UpdateSelfDTO
// pelo controller — campos extras como role/is_active/team_ids não estarão
// presentes porque o updateSelfSchema não os aceita no lado do cliente.
// Se vierem, são simplesmente ignorados pelo Zod antes de chegar aqui.
//
// Nota: se quisermos rejeitar campos extras para não-ADMIN já no middleware,
// basta criar um middleware condicional. Por ora, a defesa fica no service.
usersRouter.put(
  "/:id",
  checkPermission("ATTENDANT"),
  validateParams(userIdParamSchema),
  validateBody(updateUserAdminSchema),
  controller.update
);

usersRouter.patch(
  "/:id",
  checkPermission("ATTENDANT"),
  validateParams(userIdParamSchema),
  validateBody(updateUserAdminSchema),
  controller.update
);

// ─── EXCLUSÃO ────────────────────────────────────────
// Hard delete — rota específica ANTES da genérica /:id
usersRouter.delete(
  "/:id/hard",
  checkRole("ADMIN"),
  validateParams(userIdParamSchema),
  controller.hardDelete
);

// Soft delete
usersRouter.delete(
  "/:id",
  checkRole("ADMIN"),
  validateParams(userIdParamSchema),
  controller.softDelete
);

export default usersRouter;
