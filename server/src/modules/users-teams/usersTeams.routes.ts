// src/modules/users-teams/usersTeams.routes.ts
import { Router } from "express";
import { UsersTeamsController } from "./usersTeams.controller.js";
import {
  validateBody,
  validateParams,
} from "../../middlewares/validation/validate.middleware.js";
import {
  createUserTeamSchema,
  updateUserTeamSchema,
  userTeamIdParamSchema,
} from "./usersTeams.dto.js";
import { authMiddleware } from "../../middlewares/auth/auth.middleware.js";
import {
  checkPermission,
  checkRole,
} from "../../middlewares/auth/permission.middleware.js";
import {
  createLogMiddleware,
  LOG_MODULES,
} from "../../middlewares/log/log.middleware.js";

// ─────────────────────────────────────────────
// USERS-TEAMS ROUTES
// ─────────────────────────────────────────────
// Regras de acesso:
//   GET    /users-teams          → qualquer role autenticado
//   GET    /users-teams/:id      → qualquer role autenticado
//   POST   /users-teams          → GENERAL_MANAGER ou ADMIN
//   PUT    /users-teams/:id      → GENERAL_MANAGER ou ADMIN
//   PATCH  /users-teams/:id      → GENERAL_MANAGER ou ADMIN
//   DELETE /users-teams/:id/hard → somente ADMIN (hard delete físico)
//   DELETE /users-teams/:id      → GENERAL_MANAGER ou ADMIN (soft delete)
//
// /hard deve vir ANTES de /:id para o Express resolver primeiro.
// ─────────────────────────────────────────────

const usersTeamsRouter = Router();
const controller = new UsersTeamsController();

// Autenticação obrigatória em todo o módulo
usersTeamsRouter.use(authMiddleware);

// ─── LEITURA ─────────────────────────────────────────
// checkPermission("ATTENDANT") aprova todos os 4 roles (nível mínimo hierárquico)
usersTeamsRouter.get(
  "/",
  checkPermission("ATTENDANT"),
  createLogMiddleware({
    action: "LIST_USERS_TEAMS",
    module: LOG_MODULES.USERS_TEAMS,
  }),
  controller.findAll
);

usersTeamsRouter.get(
  "/:id",
  checkPermission("ATTENDANT"),
  validateParams(userTeamIdParamSchema),
  createLogMiddleware({
    action: "GET_USER_TEAM",
    module: LOG_MODULES.USERS_TEAMS,
    description: (req) => `Consulta do vínculo usuário-time ${req.params.id}`,
  }),
  controller.findById
);

// ─── CRIAÇÃO ─────────────────────────────────────────
usersTeamsRouter.post(
  "/",
  checkRole("GENERAL_MANAGER", "ADMIN"),
  validateBody(createUserTeamSchema),
  createLogMiddleware({
    action: "CREATE_USER_TEAM",
    module: LOG_MODULES.USERS_TEAMS,
  }),
  controller.create
);

// ─── ATUALIZAÇÃO ─────────────────────────────────────
usersTeamsRouter.put(
  "/:id",
  checkRole("GENERAL_MANAGER", "ADMIN"),
  validateParams(userTeamIdParamSchema),
  validateBody(updateUserTeamSchema),
  createLogMiddleware({
    action: "UPDATE_USER_TEAM",
    module: LOG_MODULES.USERS_TEAMS,
    description: (req) => `Atualização (PUT) do vínculo usuário-time ${req.params.id}`,
  }),
  controller.update
);

usersTeamsRouter.patch(
  "/:id",
  checkRole("GENERAL_MANAGER", "ADMIN"),
  validateParams(userTeamIdParamSchema),
  validateBody(updateUserTeamSchema),
  createLogMiddleware({
    action: "UPDATE_USER_TEAM",
    module: LOG_MODULES.USERS_TEAMS,
    description: (req) => `Atualização (PATCH) do vínculo usuário-time ${req.params.id}`,
  }),
  controller.update
);

// ─── EXCLUSÃO ────────────────────────────────────────
// Hard delete — rota específica ANTES da genérica /:id
usersTeamsRouter.delete(
  "/:id/hard",
  checkRole("ADMIN"),
  validateParams(userTeamIdParamSchema),
  createLogMiddleware({
    action: "HARD_DELETE_USER_TEAM",
    module: LOG_MODULES.USERS_TEAMS,
    description: (req) => `Hard delete do vínculo usuário-time ${req.params.id}`,
  }),
  controller.hardDelete
);

// Soft delete
usersTeamsRouter.delete(
  "/:id",
  checkRole("GENERAL_MANAGER", "ADMIN"),
  validateParams(userTeamIdParamSchema),
  createLogMiddleware({
    action: "SOFT_DELETE_USER_TEAM",
    module: LOG_MODULES.USERS_TEAMS,
    description: (req) => `Soft delete do vínculo usuário-time ${req.params.id}`,
  }),
  controller.softDelete
);

export default usersTeamsRouter;