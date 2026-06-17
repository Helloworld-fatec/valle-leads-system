// src/modules/stores/stores.routes.ts
import { Router } from "express";
import { StoresController } from "./stores.controller.js";
import { authMiddleware } from "../../middlewares/auth/auth.middleware.js";
import {
  checkPermission,
  checkRole,
} from "../../middlewares/auth/permission.middleware.js";
import {
  validateBody,
  validateParams,
} from "../../middlewares/validation/validate.middleware.js";
import {
  createStoreSchema,
  updateStoreSchema,
  storeIdParamSchema,
} from "./stores.dto.js";
import {
  createLogMiddleware,
  LOG_ACTIONS,
  LOG_MODULES,
} from "../../middlewares/log/log.middleware.js";

// ─────────────────────────────────────────────
// STORES ROUTES
// ─────────────────────────────────────────────
// Regras de acesso:
//   GET    /stores          → qualquer role autenticado
//   GET    /stores/:id      → qualquer role autenticado
//   POST   /stores          → somente ADMIN
//   PUT    /stores/:id      → somente ADMIN
//   PATCH  /stores/:id      → somente ADMIN
//   DELETE /stores/:id/hard → somente ADMIN (hard delete físico)
//   DELETE /stores/:id      → somente ADMIN (soft delete)
// ─────────────────────────────────────────────

const storesRouter = Router();
const controller = new StoresController();

// Autenticação obrigatória em todo o módulo
storesRouter.use(authMiddleware);

// ─── LEITURA ─────────────────────────────────────────
storesRouter.get(
  "/",
  checkPermission("ATTENDANT"),
  createLogMiddleware({
    action: LOG_ACTIONS.stores.LIST,
    module: LOG_MODULES.STORES,
  }),
  controller.findAll
);

storesRouter.get(
  "/:id",
  checkPermission("ATTENDANT"),
  validateParams(storeIdParamSchema),
  createLogMiddleware({
    action: LOG_ACTIONS.stores.GET,
    module: LOG_MODULES.STORES,
    description: (req) => `Consulta da loja ${req.params.id}`,
  }),
  controller.findById
);

// ─── CRIAÇÃO ─────────────────────────────────────────
storesRouter.post(
  "/",
  checkRole("ADMIN"),
  validateBody(createStoreSchema),
  createLogMiddleware({
    action: LOG_ACTIONS.stores.CREATE,
    module: LOG_MODULES.STORES,
  }),
  controller.create
);

// ─── ATUALIZAÇÃO ─────────────────────────────────────
storesRouter.put(
  "/:id",
  checkRole("ADMIN"),
  validateParams(storeIdParamSchema),
  validateBody(updateStoreSchema),
  createLogMiddleware({
    action: LOG_ACTIONS.stores.UPDATE,
    module: LOG_MODULES.STORES,
    description: (req) => `Atualização (PUT) da loja ${req.params.id}`,
  }),
  controller.update
);

storesRouter.patch(
  "/:id",
  checkRole("ADMIN"),
  validateParams(storeIdParamSchema),
  validateBody(updateStoreSchema),
  createLogMiddleware({
    action: LOG_ACTIONS.stores.UPDATE,
    module: LOG_MODULES.STORES,
    description: (req) => `Atualização (PATCH) da loja ${req.params.id}`,
  }),
  controller.update
);

// ─── EXCLUSÃO ────────────────────────────────────────
// Hard delete — rota específica ANTES da genérica /:id
storesRouter.delete(
  "/:id/hard",
  checkRole("ADMIN"),
  validateParams(storeIdParamSchema),
  createLogMiddleware({
    action: LOG_ACTIONS.stores.HARD_DELETE,
    module: LOG_MODULES.STORES,
    description: (req) => `Hard delete da loja ${req.params.id}`,
  }),
  controller.hardDelete
);

storesRouter.delete(
  "/:id",
  checkRole("ADMIN"),
  validateParams(storeIdParamSchema),
  createLogMiddleware({
    action: LOG_ACTIONS.stores.SOFT_DELETE,
    module: LOG_MODULES.STORES,
    description: (req) => `Soft delete da loja ${req.params.id}`,
  }),
  controller.softDelete
);

export default storesRouter;