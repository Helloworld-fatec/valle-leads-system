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
  validateQuery 
} from "../../middlewares/validation/validate.middleware";

// ─────────────────────────────────────────────
// NEGOTIATION IMPORTANCE ROUTES
// ─────────────────────────────────────────────

const negotiationImportanceRoutes = Router();

// ⚠️ TODO: aplicar authMiddleware em todas as rotas para garantir req.user
// negotiationImportanceRoutes.use(authMiddleware);

// GET / - Listagem do histórico de importância com filtros (ex: por negotiation_id)
negotiationImportanceRoutes.get(
  "/",
  validateQuery(QueryNegotiationImportanceSchema),
  NegotiationImportanceController.findAll
);

// GET /:id - Busca de um registro específico de mudança de importância
negotiationImportanceRoutes.get(
  "/:id",
  NegotiationImportanceController.findById
);

// POST / - Registra uma nova temperatura para a negociação (RN17)
// O Service validará se a temperatura é diferente da atual e se a negociação existe.
negotiationImportanceRoutes.post(
  "/",
  validateBody(CreateNegotiationImportanceSchema),
  NegotiationImportanceController.create
);

// PUT /:id - Atualização de um registro de histórico (ex: correção de notas)
negotiationImportanceRoutes.put(
  "/:id",
  validateBody(UpdateNegotiationImportanceSchema),
  NegotiationImportanceController.update
);

// PATCH /:id - Atualização parcial (mesmo schema do PUT)
negotiationImportanceRoutes.patch(
  "/:id",
  validateBody(UpdateNegotiationImportanceSchema),
  NegotiationImportanceController.update
);

// DELETE /:id - Exclusão física de um registro de importância
negotiationImportanceRoutes.delete(
  "/:id",
  NegotiationImportanceController.delete
);

export default negotiationImportanceRoutes;