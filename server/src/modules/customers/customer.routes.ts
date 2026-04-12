import { Router } from "express";
import { CustomersController } from "./customer.controller";
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  QueryCustomerSchema,
} from "./customer.dtos";
import { validateBody, validateQuery } from "../../middlewares/validate.middleware";

// ─────────────────────────────────────────────
// CUSTOMER ROUTES
// ─────────────────────────────────────────────

export const customersRouter = Router();

// ⚠️ TODO: aplicar authMiddleware em todas as rotas na próxima sprint
// customersRouter.use(authMiddleware);

// Listagem com filtros opcionais via query params
customersRouter.get(
  "/",
  validateQuery(QueryCustomerSchema),
  CustomersController.findAll
);

customersRouter.get(
  "/:id",
  CustomersController.findById
);

// validateBody garante que o body está válido antes de chegar no controller
customersRouter.post(
  "/",
  validateBody(CreateCustomerSchema),
  CustomersController.create
);

// PUT — atualização completa do recurso
customersRouter.put(
  "/:id",
  validateBody(UpdateCustomerSchema),
  CustomersController.update
);

// PATCH — atualização parcial, usa o mesmo schema pois todos os campos já são opcionais
customersRouter.patch(
  "/:id",
  validateBody(UpdateCustomerSchema),
  CustomersController.update
);

// DELETE — soft delete, não remove o registro do banco
customersRouter.delete(
  "/:id",
  CustomersController.softDelete
);