import { Router } from "express";
import { LeadsController } from "./lead.controller";
import {
  CreateLeadSchema,
  UpdateLeadSchema,
  QueryLeadSchema,
} from "./lead.dtos";
import { validateBody, validateQuery } from "../../middlewares/validation/validate.middleware";

// ─────────────────────────────────────────────
// LEADS ROUTES
// ─────────────────────────────────────────────

const leadsRoutes = Router();

// ⚠️ TODO: aplicar authMiddleware em todas as rotas na próxima sprint
// leadsRouter.use(authMiddleware);

// Listagem com filtros opcionais via query params
leadsRoutes.get(
  "/",
  validateQuery(QueryLeadSchema),
  LeadsController.findAll
);

leadsRoutes.get(
  "/:id",
  LeadsController.findById
);

// validateBody garante que o body está válido antes de chegar no controller
leadsRoutes.post(
  "/",
  validateBody(CreateLeadSchema),
  LeadsController.create
);

// PUT — atualização completa do recurso
leadsRoutes.put(
  "/:id",
  validateBody(UpdateLeadSchema),
  LeadsController.update
);

// PATCH — atualização parcial, usa o mesmo schema pois todos os campos já são opcionais
leadsRoutes.patch(
  "/:id",
  validateBody(UpdateLeadSchema),
  LeadsController.update
);

// DELETE — soft delete, não remove o registro do banco
leadsRoutes.delete(
  "/:id",
  LeadsController.softDelete
);

export default leadsRoutes;