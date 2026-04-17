// server/src/modules/negotiation/negotiation.routes.ts
import { Router } from "express";
import { NegotiationsController } from "./negotiation.controller";
import {
  CreateNegotiationSchema,
  UpdateNegotiationSchema,
  QueryNegotiationSchema,
} from "./negotiation.dto";
import { 
  validateBody, 
  validateQuery 
} from "../../middlewares/validation/validate.middleware";

// ─────────────────────────────────────────────
// NEGOTIATIONS ROUTES
// ─────────────────────────────────────────────

const negotiationsRoutes = Router();

// ⚠️ TODO: aplicar authMiddleware em todas as rotas na próxima sprint para garantir que req.user exista
// negotiationsRoutes.use(authMiddleware);

// GET / - Listagem com filtros opcionais via query params (validados pelo Zod)
negotiationsRoutes.get(
  "/",
  validateQuery(QueryNegotiationSchema),
  NegotiationsController.findAll
);

// GET /:id - Busca de uma negociação específica pelo ID com todo seu histórico
negotiationsRoutes.get(
  "/:id",
  NegotiationsController.findById
);

// POST / - Criação de uma nova negociação (e seus históricos iniciais na transaction)
negotiationsRoutes.post(
  "/",
  validateBody(CreateNegotiationSchema),
  NegotiationsController.create
);

// PUT /:id - Atualização da negociação (ex: mudança de equipe ou lead)
negotiationsRoutes.put(
  "/:id",
  validateBody(UpdateNegotiationSchema),
  NegotiationsController.update
);

// PATCH /:id - Atualização parcial (como UpdateNegotiationSchema só tem optionals, funciona igual ao PUT)
negotiationsRoutes.patch(
  "/:id",
  validateBody(UpdateNegotiationSchema),
  NegotiationsController.update
);

// DELETE /:id - Exclusão física da negociação (deleta históricos em cascata)
negotiationsRoutes.delete(
  "/:id",
  NegotiationsController.delete
);

export default negotiationsRoutes;