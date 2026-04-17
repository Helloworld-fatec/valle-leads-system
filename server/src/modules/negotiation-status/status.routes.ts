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
  validateQuery 
} from "../../middlewares/validation/validate.middleware";

// ─────────────────────────────────────────────
// NEGOTIATION STATUS ROUTES
// ─────────────────────────────────────────────

const negotiationStatusRoutes = Router();

// ⚠️ TODO: aplicar authMiddleware em todas as rotas na próxima sprint para garantir que req.user exista
// negotiationStatusRoutes.use(authMiddleware);

// GET / - Listagem do histórico com filtros opcionais (ex: por negotiation_id)
negotiationStatusRoutes.get(
  "/",
  validateQuery(QueryNegotiationStatusSchema),
  NegotiationStatusController.findAll
);

// GET /:id - Busca de um registro específico do histórico
negotiationStatusRoutes.get(
  "/:id",
  NegotiationStatusController.findById
);

// POST / - Criação de um novo registro de status (avanço na negociação)
negotiationStatusRoutes.post(
  "/",
  validateBody(CreateNegotiationStatusSchema),
  NegotiationStatusController.create
);

// PUT /:id - Atualização de um registro do histórico (correção)
negotiationStatusRoutes.put(
  "/:id",
  validateBody(UpdateNegotiationStatusSchema),
  NegotiationStatusController.update
);

// PATCH /:id - Atualização parcial (como UpdateNegotiationStatusSchema só tem optionals, funciona igual ao PUT)
negotiationStatusRoutes.patch(
  "/:id",
  validateBody(UpdateNegotiationStatusSchema),
  NegotiationStatusController.update
);

// DELETE /:id - Exclusão física de um registro do histórico (caso tenha sido criado por engano)
negotiationStatusRoutes.delete(
  "/:id",
  NegotiationStatusController.delete
);

export default negotiationStatusRoutes;