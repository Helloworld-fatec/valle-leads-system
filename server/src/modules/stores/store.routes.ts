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
  controller.findAll
);

storesRouter.get(
  "/:id",
  checkPermission("ATTENDANT"),
  validateParams(storeIdParamSchema),
  controller.findById
);

// ─── CRIAÇÃO ─────────────────────────────────────────
storesRouter.post(
  "/",
  checkRole("ADMIN"),
  validateBody(createStoreSchema),
  controller.create
);

// ─── ATUALIZAÇÃO ─────────────────────────────────────
storesRouter.put(
  "/:id",
  checkRole("ADMIN"),
  validateParams(storeIdParamSchema),
  validateBody(updateStoreSchema),
  controller.update
);

storesRouter.patch(
  "/:id",
  checkRole("ADMIN"),
  validateParams(storeIdParamSchema),
  validateBody(updateStoreSchema),
  controller.update
);

// ─── EXCLUSÃO ────────────────────────────────────────
// Hard delete — rota específica ANTES da genérica /:id
storesRouter.delete(
  "/:id/hard",
  checkRole("ADMIN"),
  validateParams(storeIdParamSchema),
  controller.hardDelete
);

storesRouter.delete(
  "/:id",
  checkRole("ADMIN"),
  validateParams(storeIdParamSchema),
  controller.softDelete
);

export default storesRouter;