// server/src/modules/negotiation-status/status.routes.ts
import { Router } from "express";
import { NegotiationStatusController } from "./status.controller";
import {
  CreateNegotiationStatusSchema,
  UpdateNegotiationStatusSchema,
  QueryNegotiationStatusSchema,
} from "./status.dto";
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
// NEGOTIATION STATUS ROUTES
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
// (status duplicado, reabertura restrita) ficam no service.

const negotiationStatusRoutes = Router();

// Autenticação obrigatória em todo o módulo
negotiationStatusRoutes.use(authMiddleware);

// ─── GET / — Listagem com filtros opcionais ────────────
// Todos os roles autenticados podem listar; o service filtra por escopo.
negotiationStatusRoutes.get(
  "/",
  checkPermission("ATTENDANT"),
  validateQuery(QueryNegotiationStatusSchema),
  NegotiationStatusController.findAll
);

// ─── GET /:id — Detalhe de um registro ────────────────
negotiationStatusRoutes.get(
  "/:id",
  checkPermission("ATTENDANT"),
  NegotiationStatusController.findById
);

// ─── POST / — Registra novo status na negociação ──────
// Todos os roles podem criar; o service aplica escopo e regras de negócio:
//   • Impede status duplicado seguido
//   • Impede ATTENDANT de reabrir negociação encerrada
negotiationStatusRoutes.post(
  "/",
  checkPermission("ATTENDANT"),
  validateBody(CreateNegotiationStatusSchema),
  NegotiationStatusController.create
);

// ─── PUT /:id — Corrige notas de um registro ──────────
// status_negotiation é imutável após o registro.
negotiationStatusRoutes.put(
  "/:id",
  checkPermission("ATTENDANT"),
  validateBody(UpdateNegotiationStatusSchema),
  NegotiationStatusController.update
);

// ─── PATCH /:id — Atualização parcial (mesmo schema) ──
negotiationStatusRoutes.patch(
  "/:id",
  checkPermission("ATTENDANT"),
  validateBody(UpdateNegotiationStatusSchema),
  NegotiationStatusController.update
);

// ─── DELETE /:id — Exclusão física (apenas ADMIN) ─────
// Deletar um status histórico pode adulterar o estado atual da negociação
// (se for o registro mais recente). Restrito ao ADMIN por segurança.
negotiationStatusRoutes.delete(
  "/:id",
  checkRole("ADMIN"),
  NegotiationStatusController.delete
);

export default negotiationStatusRoutes;
