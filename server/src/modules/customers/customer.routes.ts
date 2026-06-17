// src/modules/customers/customer.routes.ts
import { Router } from "express";
import { CustomersController } from "./customer.controller.js";
import { authMiddleware } from "../../middlewares/auth/auth.middleware.js";
import { checkRole } from "../../middlewares/auth/permission.middleware.js";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../../middlewares/validation/validate.middleware.js";
import {
  createCustomerSchema,
  updateCustomerSchema,
  queryCustomerSchema,
  customerIdParamSchema,
} from "./customer.dto.js";
import {
  createLogMiddleware,
  LOG_ACTIONS,
  LOG_MODULES,
} from "../../middlewares/log/log.middleware.js";

// ─────────────────────────────────────────────
// CUSTOMER ROUTES
// ─────────────────────────────────────────────
// Regras de acesso:
//   GET    /customers          → qualquer role autenticado
//   GET    /customers/:id      → qualquer role autenticado
//   POST   /customers          → qualquer role autenticado
//   PUT    /customers/:id      → qualquer role autenticado
//   PATCH  /customers/:id      → qualquer role autenticado
//   DELETE /customers/:id      → qualquer role autenticado (soft delete)
//   DELETE /customers/:id/hard → somente ADMIN (hard delete físico)
//
// /hard deve vir ANTES de /:id para o Express resolver primeiro.
// ─────────────────────────────────────────────

const customersRouter = Router();

customersRouter.use(authMiddleware);

// ─── LEITURA ─────────────────────────────────────────
customersRouter.get(
  "/",
  validateQuery(queryCustomerSchema),
  createLogMiddleware({
    action: LOG_ACTIONS.customers.LIST,
    module: LOG_MODULES.CUSTOMERS,
  }),
  CustomersController.findAll
);

customersRouter.get(
  "/:id",
  validateParams(customerIdParamSchema),
  createLogMiddleware({
    action: LOG_ACTIONS.customers.GET,
    module: LOG_MODULES.CUSTOMERS,
    description: (req) => `Consulta do cliente ${req.params.id}`,
  }),
  CustomersController.findById
);

// ─── CRIAÇÃO ─────────────────────────────────────────
customersRouter.post(
  "/",
  validateBody(createCustomerSchema),
  createLogMiddleware({
    action: LOG_ACTIONS.customers.CREATE,
    module: LOG_MODULES.CUSTOMERS,
  }),
  CustomersController.create
);

// ─── ATUALIZAÇÃO ─────────────────────────────────────
customersRouter.put(
  "/:id",
  validateParams(customerIdParamSchema),
  validateBody(updateCustomerSchema),
  createLogMiddleware({
    action: LOG_ACTIONS.customers.UPDATE,
    module: LOG_MODULES.CUSTOMERS,
    description: (req) => `Atualização (PUT) do cliente ${req.params.id}`,
  }),
  CustomersController.update
);

customersRouter.patch(
  "/:id",
  validateParams(customerIdParamSchema),
  validateBody(updateCustomerSchema),
  createLogMiddleware({
    action: LOG_ACTIONS.customers.UPDATE,
    module: LOG_MODULES.CUSTOMERS,
    description: (req) => `Atualização (PATCH) do cliente ${req.params.id}`,
  }),
  CustomersController.update
);

// ─── EXCLUSÃO ────────────────────────────────────────
// Hard delete — rota específica ANTES da genérica /:id
customersRouter.delete(
  "/:id/hard",
  checkRole("ADMIN"),
  validateParams(customerIdParamSchema),
  createLogMiddleware({
    action: LOG_ACTIONS.customers.HARD_DELETE,
    module: LOG_MODULES.CUSTOMERS,
    description: (req) => `Hard delete do cliente ${req.params.id}`,
  }),
  CustomersController.hardDelete
);

// Soft delete — qualquer autenticado
customersRouter.delete(
  "/:id",
  validateParams(customerIdParamSchema),
  createLogMiddleware({
    action: LOG_ACTIONS.customers.SOFT_DELETE,
    module: LOG_MODULES.CUSTOMERS,
    description: (req) => `Soft delete do cliente ${req.params.id}`,
  }),
  CustomersController.softDelete
);

export default customersRouter;