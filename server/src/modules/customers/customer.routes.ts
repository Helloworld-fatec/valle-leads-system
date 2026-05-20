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
  CustomersController.findAll
);

customersRouter.get(
  "/:id",
  validateParams(customerIdParamSchema),
  CustomersController.findById
);

// ─── CRIAÇÃO ─────────────────────────────────────────
customersRouter.post(
  "/",
  validateBody(createCustomerSchema),
  CustomersController.create
);

// ─── ATUALIZAÇÃO ─────────────────────────────────────
customersRouter.put(
  "/:id",
  validateParams(customerIdParamSchema),
  validateBody(updateCustomerSchema),
  CustomersController.update
);

customersRouter.patch(
  "/:id",
  validateParams(customerIdParamSchema),
  validateBody(updateCustomerSchema),
  CustomersController.update
);

// ─── EXCLUSÃO ────────────────────────────────────────
// Hard delete — rota específica ANTES da genérica /:id
customersRouter.delete(
  "/:id/hard",
  checkRole("ADMIN"),
  validateParams(customerIdParamSchema),
  CustomersController.hardDelete
);

// Soft delete — qualquer autenticado
customersRouter.delete(
  "/:id",
  validateParams(customerIdParamSchema),
  CustomersController.softDelete
);

export default customersRouter;