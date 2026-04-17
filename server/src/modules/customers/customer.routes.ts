import { Router } from "express";
import { CustomersController } from "./customer.controller";
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  QueryCustomerSchema,
} from "./customer.dtos";
import { validateBody, validateQuery } from "../../middlewares/validation/validate.middleware";
import { de } from "zod/locales";

// ─────────────────────────────────────────────
// CUSTOMER ROUTES
// ─────────────────────────────────────────────

const customersRoutes = Router();

// ⚠️ TODO: aplicar authMiddleware em todas as rotas na próxima sprint
// customersRouter.use(authMiddleware);

// Listagem com filtros opcionais via query params
customersRoutes.get(
  "/",
  validateQuery(QueryCustomerSchema),
  CustomersController.findAll
);

customersRoutes.get(
  "/:id",
  CustomersController.findById
);

// validateBody garante que o body está válido antes de chegar no controller
customersRoutes.post(
  "/",
  validateBody(CreateCustomerSchema),
  CustomersController.create
);

// PUT — atualização completa do recurso
customersRoutes.put(
  "/:id",
  validateBody(UpdateCustomerSchema),
  CustomersController.update
);

// PATCH — atualização parcial, usa o mesmo schema pois todos os campos já são opcionais
customersRoutes.patch(
  "/:id",
  validateBody(UpdateCustomerSchema),
  CustomersController.update
);

// DELETE — soft delete, não remove o registro do banco
customersRoutes.delete(
  "/:id",
  CustomersController.softDelete
);


export default customersRoutes;