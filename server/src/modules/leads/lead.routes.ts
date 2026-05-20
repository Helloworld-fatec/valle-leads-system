// src/modules/leads/lead.routes.ts
import { Router } from "express";
import { LeadsController } from "./lead.controller.js";
import {
  CreateLeadSchema,
  UpdateLeadSchema,
  QueryLeadSchema,
  LeadIdParamSchema,
  BulkAssignAttendantSchema,
  BulkAssignTeamSchema,
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

// Estrutura da pipeline em cada rota:
//   authMiddleware     → exige access token válido + injeta req.user
//   checkPermission/   → autoriza pelo role (RBAC "grosso")
//   checkRole
//   validate*          → garante shape dos dados via Zod
//   controller.handler → orquestra e responde
//
// A autorização granular (escopo por times, escopo por atendente, restrições
// por campo como reativar/mover entre times) é feita no SERVICE — defesa em
// profundidade. Os middlewares filtram "quem pode chamar"; o service decide
// "o que ele pode fazer com qual recurso".
//
// Importante: rotas mais específicas vêm ANTES das genéricas com `:id` para
// o Express resolvê-las primeiro (ex.: /bulk/* antes de /:id).

const leadsRoutes = Router();
const controller = new LeadsController();

// Autenticação obrigatória em todo o módulo
leadsRoutes.use(authMiddleware);

// ─── BULK (rotas específicas — vêm antes de /:id) ──────

// Atribuir atendente em lote (MANAGER e ADMIN)
leadsRoutes.post(
  "/bulk/assign-attendant",
  checkRole("MANAGER", "ADMIN"),
  validateBody(BulkAssignAttendantSchema),
  controller.bulkAssignAttendant
);

// Atribuir/transferir leads para outro time em lote (GENERAL_MANAGER e ADMIN)
leadsRoutes.post(
  "/bulk/assign-team",
  checkRole("GENERAL_MANAGER", "ADMIN"),
  validateBody(BulkAssignTeamSchema),
  controller.bulkAssignTeam
);

// ─── LISTAGEM E LEITURA ────────────────────────────────

// Lista — todos os autenticados; service aplica filtro de escopo e força
// is_active=true para quem não pode ver inativos.
leadsRoutes.get(
  "/",
  checkPermission("ATTENDANT"),
  validateQuery(QueryLeadSchema),
  controller.findAll
);

leadsRoutes.get(
  "/:id",
  checkPermission("ATTENDANT"),
  validateParams(LeadIdParamSchema),
  controller.findById
);

// ─── CRIAÇÃO ───────────────────────────────────────────

// Todos os roles podem criar agora (inclusive GENERAL_MANAGER).
leadsRoutes.post(
  "/",
  checkPermission("ATTENDANT"),
  validateBody(CreateLeadSchema),
  controller.create
);

// ─── ATUALIZAÇÃO ───────────────────────────────────────

// Todos podem editar com escopo aplicado no service.
// Restrições por campo (reativar, trocar time) também ficam no service.
leadsRoutes.put(
  "/:id",
  checkPermission("ATTENDANT"),
  validateParams(LeadIdParamSchema),
  validateBody(UpdateLeadSchema),
  controller.update
);

leadsRoutes.patch(
  "/:id",
  checkPermission("ATTENDANT"),
  validateParams(LeadIdParamSchema),
  validateBody(UpdateLeadSchema),
  controller.update
);

// ─── EXCLUSÃO ──────────────────────────────────────────

// Hard delete — rota separada, só ADMIN. Rota específica vem antes de /:id genérica
// não é problema aqui porque o path é diferente (/:id/permanent vs /:id).
leadsRoutes.delete(
  "/:id/permanent",
  checkRole("ADMIN"),
  validateParams(LeadIdParamSchema),
  controller.hardDelete
);

// Soft delete — todos os autenticados, escopo aplicado no service.
leadsRoutes.delete(
  "/:id",
  checkPermission("ATTENDANT"),
  validateParams(LeadIdParamSchema),
  controller.softDelete
);

export default leadsRoutes;
