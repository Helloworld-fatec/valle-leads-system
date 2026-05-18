import { Router } from "express";
import { InterestItemsController } from "./item.controller";
import {
  CreateInterestItemSchema,
  UpdateInterestItemSchema,
  QueryInterestItemSchema,
} from "./item.dtos";
import {
  validateBody,
  validateQuery,
} from "../../middlewares/validation/validate.middleware";

// ─────────────────────────────────────────────
// INTEREST ITEMS ROUTES
// ─────────────────────────────────────────────

const interestItemsRoutes = Router();

// ⚠️ TODO: aplicar authMiddleware em todas as rotas na próxima sprint
// interestItemsRoutes.use(authMiddleware);

// Listagem com filtros: ?description=civic&is_active=true&page=1&limit=20
interestItemsRoutes.get(
  "/",
  validateQuery(QueryInterestItemSchema),
  InterestItemsController.findAll
);

interestItemsRoutes.get("/:id", InterestItemsController.findById);

interestItemsRoutes.post(
  "/",
  validateBody(CreateInterestItemSchema),
  InterestItemsController.create
);

// PUT — atualização completa do recurso
interestItemsRoutes.put(
  "/:id",
  validateBody(UpdateInterestItemSchema),
  InterestItemsController.update
);

// PATCH — atualização parcial, usa o mesmo schema pois todos os campos já são opcionais
interestItemsRoutes.patch(
  "/:id",
  validateBody(UpdateInterestItemSchema),
  InterestItemsController.update
);

// DELETE — soft delete, não remove o registro do banco
interestItemsRoutes.delete("/:id", InterestItemsController.softDelete);

export default interestItemsRoutes;
