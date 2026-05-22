// src/modules/teams/teams.routes.ts
import { Router } from "express";
import { TeamsController } from "./teams.controller.js";
import {
  createTeamSchema,
  updateTeamSchema,
  queryTeamSchema,
  teamIdParamSchema,
} from "./teams.dto.js";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../../middlewares/validation/validate.middleware.js";
import { authMiddleware } from "../../middlewares/auth/auth.middleware.js";
import {
  checkPermission,
  checkRole,
} from "../../middlewares/auth/permission.middleware.js";

// Pipeline de cada rota:
//   authMiddleware          → exige access token válido + injeta req.user
//   checkPermission/Role    → RBAC "grosso" por role
//   validate*               → valida e tipifica dados via Zod
//   controller.handler      → orquestra serviço e responde
//
// Regras de acesso:
//   GET    /teams              → GENERAL_MANAGER ou ADMIN
//   GET    /teams/:id          → qualquer role autenticado
//   POST   /teams              → GENERAL_MANAGER ou ADMIN
//   PUT    /teams/:id          → GENERAL_MANAGER ou ADMIN
//   PATCH  /teams/:id          → GENERAL_MANAGER ou ADMIN
//   DELETE /teams/:id/hard     → somente ADMIN (hard delete físico)
//   DELETE /teams/:id          → GENERAL_MANAGER ou ADMIN (soft delete)
//
// Importante: /hard deve vir ANTES de /:id para o Express resolver
// a rota específica primeiro.

const teamsRouter = Router();
const controller = new TeamsController();

// Autenticação obrigatória em todo o módulo
teamsRouter.use(authMiddleware);

// ─── LISTAGEM ────────────────────────────────────────
teamsRouter.get(
  "/",
  checkRole("GENERAL_MANAGER", "ADMIN"),
  validateQuery(queryTeamSchema),
  controller.findAll
);

// ─── LEITURA POR ID ──────────────────────────────────
// Aberta a qualquer role autenticado — checkPermission("ATTENDANT") aprova
// todos os 4 roles (ATTENDANT é o nível mínimo da hierarquia).
teamsRouter.get(
  "/:id",
  checkPermission("ATTENDANT"),
  validateParams(teamIdParamSchema),
  controller.findById
);

// ─── CRIAÇÃO ─────────────────────────────────────────
teamsRouter.post(
  "/",
  checkRole("GENERAL_MANAGER", "ADMIN"),
  validateBody(createTeamSchema),
  controller.create
);

// ─── ATUALIZAÇÃO ─────────────────────────────────────
teamsRouter.put(
  "/:id",
  checkRole("GENERAL_MANAGER", "ADMIN"),
  validateParams(teamIdParamSchema),
  validateBody(updateTeamSchema),
  controller.update
);

teamsRouter.patch(
  "/:id",
  checkRole("GENERAL_MANAGER", "ADMIN"),
  validateParams(teamIdParamSchema),
  validateBody(updateTeamSchema),
  controller.update
);

// ─── EXCLUSÃO ────────────────────────────────────────
// Hard delete — rota específica ANTES de /:id genérica.
teamsRouter.delete(
  "/:id/hard",
  checkRole("ADMIN"),
  validateParams(teamIdParamSchema),
  controller.hardDelete
);

// Soft delete
teamsRouter.delete(
  "/:id",
  checkRole("GENERAL_MANAGER", "ADMIN"),
  validateParams(teamIdParamSchema),
  controller.softDelete
);

export default teamsRouter;
