// src/modules/leads/lead.routes.ts
import { Router } from "express";
import { LeadsController } from "./lead.controller.js";
import {
  CreateLeadSchema,
  UpdateLeadSchema,
  QueryLeadSchema,
  LeadIdParamSchema,
} from "./lead.dtos.js";
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

// ─────────────────────────────────────────────
// LEADS ROUTES
// ─────────────────────────────────────────────
// Pipeline padrão:
//   authMiddleware → checkPermission/checkRole → validate* → controller
//
// O grosso da autorização (quem pode chamar a rota) fica nos middlewares;
// regras granulares de escopo (atendente vê apenas os próprios, manager
// vê apenas dos times que gerencia) ficam no SERVICE — defesa em profundidade.
// ─────────────────────────────────────────────

const leadsRoutes = Router();
const controller = new LeadsController();

// Autenticação obrigatória em todas as rotas
leadsRoutes.use(authMiddleware);

// ─── LISTAGEM ──────────────────────────────────────────
// Todos os perfis podem listar — o service filtra o escopo
leadsRoutes.get(
  "/",
  checkPermission("ATTENDANT"),
  validateQuery(QueryLeadSchema),
  controller.findAll
);

// ─── LEITURA POR ID ────────────────────────────────────
leadsRoutes.get(
  "/:id",
  checkPermission("ATTENDANT"),
  validateParams(LeadIdParamSchema),
  controller.findById
);

// ─── CREATE ────────────────────────────────────────────
// GENERAL_MANAGER não pode criar — usar checkRole (hierarquia não resolve)
leadsRoutes.post(
  "/",
  checkRole("ATTENDANT", "MANAGER", "ADMIN"),
  validateBody(CreateLeadSchema),
  controller.create
);

// ─── UPDATE ────────────────────────────────────────────
// GENERAL_MANAGER também não edita
leadsRoutes.put(
  "/:id",
  checkRole("ATTENDANT", "MANAGER", "ADMIN"),
  validateParams(LeadIdParamSchema),
  validateBody(UpdateLeadSchema),
  controller.update
);

// PATCH usa o mesmo schema (todos os campos já opcionais)
leadsRoutes.patch(
  "/:id",
  checkRole("ATTENDANT", "MANAGER", "ADMIN"),
  validateParams(LeadIdParamSchema),
  validateBody(UpdateLeadSchema),
  controller.update
);

// ─── SOFT DELETE ───────────────────────────────────────
// RF02 lista exclusão como exclusiva do ADMIN
leadsRoutes.delete(
  "/:id",
  checkRole("ADMIN"),
  validateParams(LeadIdParamSchema),
  controller.softDelete
);

export default leadsRoutes;
