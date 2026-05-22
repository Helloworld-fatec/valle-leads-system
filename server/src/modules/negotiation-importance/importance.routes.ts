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
  NegotiationImportanceController.findAll
);

// ─── GET /:id — Detalhe de um registro ────────────────
negotiationImportanceRoutes.get(
  "/:id",
  checkPermission("ATTENDANT"),
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
  NegotiationImportanceController.create
);

// ─── PUT /:id — Corrige notas de um registro ──────────
// importance é imutável após o registro.
negotiationImportanceRoutes.put(
  "/:id",
  checkPermission("ATTENDANT"),
  validateBody(UpdateNegotiationImportanceSchema),
  NegotiationImportanceController.update
);

// ─── PATCH /:id — Atualização parcial (mesmo schema) ──
negotiationImportanceRoutes.patch(
  "/:id",
  checkPermission("ATTENDANT"),
  validateBody(UpdateNegotiationImportanceSchema),
  NegotiationImportanceController.update
);

// ─── DELETE /:id — Exclusão física (apenas ADMIN) ─────
// Deletar um registro histórico pode adulterar o nível atual da negociação
// (se for o mais recente). Restrito ao ADMIN por segurança.
negotiationImportanceRoutes.delete(
  "/:id",
  checkRole("ADMIN"),
  NegotiationImportanceController.delete
);

export default negotiationImportanceRoutes;
