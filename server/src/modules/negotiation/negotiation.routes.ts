// server/src/modules/negotiation/negotiation.routes.ts
import { Router } from "express";
import { NegotiationsController } from "./negotiation.controller.js";
import {
  CreateNegotiationSchema,
  UpdateNegotiationSchema,
  QueryNegotiationSchema,
  NegotiationIdParamSchema,
  BulkAssignAttendantSchema,
  BulkAssignTeamSchema,
} from "./negotiation.dto.js";
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

// Pipeline:
//   authMiddleware     → injeta req.user
//   checkPermission/   → autoriza pelo role (RBAC grosso)
//   checkRole
//   validate*          → garante shape via Zod
//   controller.handler → orquestra e responde
//
// Regras granulares (escopo por times, restrição por campo) ficam no service.
// Rotas específicas vêm ANTES das genéricas com :id para evitar conflito.

const negotiationsRoutes = Router();
const controller = new NegotiationsController();

// Autenticação obrigatória em todo o módulo
negotiationsRoutes.use(authMiddleware);

// ─── BULK (rotas específicas — antes de /:id) ──────────

// Atribuir atendente em lote — MANAGER e ADMIN
negotiationsRoutes.post(
  "/bulk/assign-attendant",
  checkRole("MANAGER", "ADMIN"),
  validateBody(BulkAssignAttendantSchema),
  controller.bulkAssignAttendant
);

// Transferir entre times em lote — GENERAL_MANAGER e ADMIN
negotiationsRoutes.post(
  "/bulk/assign-team",
  checkRole("GENERAL_MANAGER", "ADMIN"),
  validateBody(BulkAssignTeamSchema),
  controller.bulkAssignTeam
);

// ─── LISTAGEM E LEITURA ────────────────────────────────

// Todos os autenticados; service aplica filtro de escopo.
negotiationsRoutes.get(
  "/",
  checkPermission("ATTENDANT"),
  validateQuery(QueryNegotiationSchema),
  controller.findAll
);

negotiationsRoutes.get(
  "/:id",
  checkPermission("ATTENDANT"),
  validateParams(NegotiationIdParamSchema),
  controller.findById
);

// ─── CRIAÇÃO ───────────────────────────────────────────

// Todos os roles podem criar (escopo aplicado no service).
negotiationsRoutes.post(
  "/",
  checkPermission("ATTENDANT"),
  validateBody(CreateNegotiationSchema),
  controller.create
);

// ─── ATUALIZAÇÃO ───────────────────────────────────────

negotiationsRoutes.put(
  "/:id",
  checkPermission("ATTENDANT"),
  validateParams(NegotiationIdParamSchema),
  validateBody(UpdateNegotiationSchema),
  controller.update
);

negotiationsRoutes.patch(
  "/:id",
  checkPermission("ATTENDANT"),
  validateParams(NegotiationIdParamSchema),
  validateBody(UpdateNegotiationSchema),
  controller.update
);

// ─── HARD DELETE (apenas ADMIN) ────────────────────────
// Negociação não tem campo is_active no schema — só existe exclusão
// permanente. A forma "soft" de encerrar é criar um status "closed"
// no histórico (módulo de status).
negotiationsRoutes.delete(
  "/:id",
  checkRole("ADMIN"),
  validateParams(NegotiationIdParamSchema),
  controller.hardDelete
);

export default negotiationsRoutes;
