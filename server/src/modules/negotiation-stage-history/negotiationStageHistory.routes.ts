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
  validateQuery 
} from "../../middlewares/validation/validate.middleware";

// ─────────────────────────────────────────────
// NEGOTIATION STAGE HISTORY ROUTES
// ─────────────────────────────────────────────

const negotiationStageHistoryRoutes = Router();

// ⚠️ TODO: aplicar authMiddleware em todas as rotas na próxima sprint para garantir que req.user exista
// negotiationStageHistoryRoutes.use(authMiddleware);

// GET / - Listagem do histórico de estágios com filtros opcionais (validados pelo Zod)
negotiationStageHistoryRoutes.get(
  "/",
  validateQuery(QueryNegotiationStageHistorySchema),
  NegotiationStageHistoryController.findAll
);

// GET /:id - Busca de um registro específico de mudança de estágio
negotiationStageHistoryRoutes.get(
  "/:id",
  NegotiationStageHistoryController.findById
);

// POST / - Registra um avanço ou retrocesso no funil de vendas (cria novo estágio)
negotiationStageHistoryRoutes.post(
  "/",
  validateBody(CreateNegotiationStageHistorySchema),
  NegotiationStageHistoryController.create
);

// PUT /:id - Atualização de um registro do histórico (ex: correção de uma anotação)
negotiationStageHistoryRoutes.put(
  "/:id",
  validateBody(UpdateNegotiationStageHistorySchema),
  NegotiationStageHistoryController.update
);

// PATCH /:id - Atualização parcial (mesmo comportamento do PUT pois o schema tem apenas optionals)
negotiationStageHistoryRoutes.patch(
  "/:id",
  validateBody(UpdateNegotiationStageHistorySchema),
  NegotiationStageHistoryController.update
);

// DELETE /:id - Exclusão física de um registro do histórico de estágios
negotiationStageHistoryRoutes.delete(
  "/:id",
  NegotiationStageHistoryController.delete
);

export default negotiationStageHistoryRoutes;