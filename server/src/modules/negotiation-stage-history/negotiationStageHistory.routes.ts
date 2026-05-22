// server/src/modules/negotiation-stage-history/negotiationStageHistory.routes.ts
import { Router } from "express";
import { NegotiationStageHistoryController } from "./negotiationStageHistory.controller";
import {
  CreateNegotiationStageHistorySchema,
  UpdateNegotiationStageHistorySchema,
  QueryNegotiationStageHistorySchema,
} from "./negotiationStageHistory.dto";
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
// NEGOTIATION STAGE HISTORY ROUTES
// ─────────────────────────────────────────────
//
// Pipeline em todas as rotas:
//   authMiddleware      → injeta req.user (obrigatório)
//   checkPermission /   → RBAC grosso pelo role
//   checkRole
//   validate*           → garante shape via Zod antes do controller
//   controller.handler  → orquestra service e responde
//
// Regras granulares de escopo (attendant_id, team_ids) ficam no service.

const negotiationStageHistoryRoutes = Router();

// Autenticação obrigatória em todo o módulo
negotiationStageHistoryRoutes.use(authMiddleware);

// ─── GET / — Listagem com filtros opcionais ────────────
// Todos os roles autenticados podem listar; o service filtra por escopo.
negotiationStageHistoryRoutes.get(
  "/",
  checkPermission("ATTENDANT"),
  validateQuery(QueryNegotiationStageHistorySchema),
  NegotiationStageHistoryController.findAll
);

// ─── GET /:id — Detalhe de um registro ────────────────
negotiationStageHistoryRoutes.get(
  "/:id",
  checkPermission("ATTENDANT"),
  NegotiationStageHistoryController.findById
);

// ─── POST / — Registra novo estágio no funil ──────────
// Todos os roles podem criar; o service aplica escopo e regras de negócio.
// Se new_stage for fechamento_com_venda ou fechamento_sem_venda, o service
// cria automaticamente um NegotiationStatus "closed" na mesma transação.
negotiationStageHistoryRoutes.post(
  "/",
  checkPermission("ATTENDANT"),
  validateBody(CreateNegotiationStageHistorySchema),
  NegotiationStageHistoryController.create
);

// ─── PUT /:id — Atualização de notas de um registro ───
// old_stage e new_stage são imutáveis após o registro.
negotiationStageHistoryRoutes.put(
  "/:id",
  checkPermission("ATTENDANT"),
  validateBody(UpdateNegotiationStageHistorySchema),
  NegotiationStageHistoryController.update
);

// ─── PATCH /:id — Atualização parcial (mesmo schema) ──
negotiationStageHistoryRoutes.patch(
  "/:id",
  checkPermission("ATTENDANT"),
  validateBody(UpdateNegotiationStageHistorySchema),
  NegotiationStageHistoryController.update
);

// ─── DELETE /:id — Exclusão física (apenas ADMIN) ─────
// Deletar um registro histórico é destrutivo e irreversível.
// Restrito ao ADMIN para preservar rastreabilidade de auditoria.
negotiationStageHistoryRoutes.delete(
  "/:id",
  checkRole("ADMIN"),
  NegotiationStageHistoryController.delete
);

export default negotiationStageHistoryRoutes;
