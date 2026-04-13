import { Router } from "express";
import { LeadsController } from "./lead.controller";
import {
  CreateLeadSchema,
  UpdateLeadSchema,
  QueryLeadSchema,
} from "./lead.dtos";
import { validateBody, validateQuery } from "../../middlewares/validate.middleware";

// ─────────────────────────────────────────────
// LEADS ROUTES
// ─────────────────────────────────────────────

export const leadsRouter = Router();

// ⚠️ TODO: aplicar authMiddleware em todas as rotas na próxima sprint
// leadsRouter.use(authMiddleware);

// Listagem com filtros opcionais via query params
leadsRouter.get(
  "/",
  validateQuery(QueryLeadSchema),
  LeadsController.findAll
);

leadsRouter.get(
  "/:id",
  LeadsController.findById
);

// validateBody garante que o body está válido antes de chegar no controller
leadsRouter.post(
  "/",
  validateBody(CreateLeadSchema),
  LeadsController.create
);

// PUT — atualização completa do recurso
leadsRouter.put(
  "/:id",
  validateBody(UpdateLeadSchema),
  LeadsController.update
);

// PATCH — atualização parcial, usa o mesmo schema pois todos os campos já são opcionais
leadsRouter.patch(
  "/:id",
  validateBody(UpdateLeadSchema),
  LeadsController.update
);

// DELETE — soft delete, não remove o registro do banco
leadsRouter.delete(
  "/:id",
  LeadsController.softDelete
);