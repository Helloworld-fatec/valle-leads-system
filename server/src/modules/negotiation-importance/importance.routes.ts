// server/src/modules/negotiation-importance/importance.routes.ts
import { Router } from "express";
import { NegotiationImportanceController } from "./importance.controller";
import {
  CreateNegotiationImportanceSchema,
  UpdateNegotiationImportanceSchema,
  QueryNegotiationImportanceSchema,
} from "./importance.dto";
import {
  validateBody,
  validateQuery,
} from "../../middlewares/validation/validate.middleware";
import { authMiddleware } from "../../middlewares/auth/auth.middleware";
import {
  checkPermission,
  checkRole,
} from "../../middlewares/auth/permission.middleware";
import {
  createLogMiddleware,
  LOG_MODULES,
} from "../../middlewares/log/log.middleware";

// ─────────────────────────────────────────────
// NEGOTIATION IMPORTANCE ROUTES
// ─────────────────────────────────────────────
//
// Pipeline em todas as rotas:
//   authMiddleware      → injeta req.user (obrigatório)
//   checkPermission /   → RBAC grosso pelo role
//   checkRole
//   validate*           → garante shape via Zod antes do controller
//   controller.handler  → orquestra service e responde
//
// Regras granulares de escopo (attendant_id, team_ids) e de negócio
// (RN17 — duplicado seguido, negociação encerrada) ficam no service.

const negotiationImportanceRoutes = Router();

// Autenticação obrigatória em todo o módulo
negotiationImportanceRoutes.use(authMiddleware);

// ─── GET / — Listagem com filtros opcionais ────────────
// Todos os roles autenticados podem listar; o service filtra por escopo.
negotiationImportanceRoutes.get(
  "/",
  checkPermission("ATTENDANT"),
  validateQuery(QueryNegotiationImportanceSchema),
  createLogMiddleware({
    action: "LIST_NEGOTIATION_IMPORTANCE",
    module: LOG_MODULES.NEGOTIATION_IMPORTANCE,
  }),
  NegotiationImportanceController.findAll
);

// ─── GET /:id — Detalhe de um registro ────────────────
negotiationImportanceRoutes.get(
  "/:id",
  checkPermission("ATTENDANT"),
  createLogMiddleware({
    action: "GET_NEGOTIATION_IMPORTANCE",
    module: LOG_MODULES.NEGOTIATION_IMPORTANCE,
    description: (req) => `Consulta do nível de importância de negociação ${req.params.id}`,
  }),
  NegotiationImportanceController.findById
);

// ─── POST / — Registra novo nível de importância ──────
// Todos os roles podem criar; o service aplica escopo e regras de negócio:
//   • Impede alteração em negociação encerrada
//   • RN17: impede registro duplicado seguido (mesmo nível do atual)
negotiationImportanceRoutes.post(
  "/",
  checkPermission("ATTENDANT"),
  validateBody(CreateNegotiationImportanceSchema),
  createLogMiddleware({
    action: "CREATE_NEGOTIATION_IMPORTANCE",
    module: LOG_MODULES.NEGOTIATION_IMPORTANCE,
  }),
  NegotiationImportanceController.create
);

// ─── PUT /:id — Corrige notas de um registro ──────────
// importance é imutável após o registro.
negotiationImportanceRoutes.put(
  "/:id",
  checkPermission("ATTENDANT"),
  validateBody(UpdateNegotiationImportanceSchema),
  createLogMiddleware({
    action: "UPDATE_NEGOTIATION_IMPORTANCE",
    module: LOG_MODULES.NEGOTIATION_IMPORTANCE,
    description: (req) => `Atualização (PUT) do nível de importância de negociação ${req.params.id}`,
  }),
  NegotiationImportanceController.update
);

// ─── PATCH /:id — Atualização parcial (mesmo schema) ──
negotiationImportanceRoutes.patch(
  "/:id",
  checkPermission("ATTENDANT"),
  validateBody(UpdateNegotiationImportanceSchema),
  createLogMiddleware({
    action: "UPDATE_NEGOTIATION_IMPORTANCE",
    module: LOG_MODULES.NEGOTIATION_IMPORTANCE,
    description: (req) => `Atualização (PATCH) do nível de importância de negociação ${req.params.id}`,
  }),
  NegotiationImportanceController.update
);

// ─── DELETE /:id — Exclusão física (apenas ADMIN) ─────
// Deletar um registro histórico pode adulterar o nível atual da negociação
// (se for o mais recente). Restrito ao ADMIN por segurança.
negotiationImportanceRoutes.delete(
  "/:id",
  checkRole("ADMIN"),
  createLogMiddleware({
    action: "DELETE_NEGOTIATION_IMPORTANCE",
    module: LOG_MODULES.NEGOTIATION_IMPORTANCE,
    description: (req) => `Hard delete do nível de importância de negociação ${req.params.id}`,
  }),
  NegotiationImportanceController.delete
);

export default negotiationImportanceRoutes;