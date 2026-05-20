// server/src/modules/interest-items/item.routes.ts
import { Router } from "express";
import { InterestItemsController } from "./item.controller.js";
import { authMiddleware } from "../../middlewares/auth/auth.middleware.js";
import { checkPermission } from "../../middlewares/auth/permission.middleware.js";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../../middlewares/validation/validate.middleware.js";
import {
  createInterestItemSchema,
  updateInterestItemSchema,
  queryInterestItemSchema,
  interestItemIdParamSchema,
} from "./item.dto.js";

// ─────────────────────────────────────────────
// INTEREST ITEMS ROUTES
// ─────────────────────────────────────────────
// Regras de acesso:
//   GET    /interest-items          → qualquer role autenticado
//   GET    /interest-items/:id      → qualquer role autenticado
//   POST   /interest-items          → GENERAL_MANAGER ou ADMIN
//   PUT    /interest-items/:id      → GENERAL_MANAGER ou ADMIN
//   PATCH  /interest-items/:id      → GENERAL_MANAGER ou ADMIN
//   DELETE /interest-items/:id      → GENERAL_MANAGER ou ADMIN (soft delete)
//   DELETE /interest-items/:id/hard → somente ADMIN (hard delete físico)
//
// Pipeline padrão:
//   authMiddleware → [checkPermission/checkRole] → [validateParams] → [validateBody/Query] → controller
// ─────────────────────────────────────────────

const router = Router();

// Aplica authMiddleware em todas as rotas deste router de uma vez
router.use(authMiddleware);

// ─── Rotas abertas a qualquer role autenticado ────────

router.get(
  "/",
  validateQuery(queryInterestItemSchema),
  InterestItemsController.findAll
);

router.get(
  "/:id",
  validateParams(interestItemIdParamSchema),
  InterestItemsController.findById
);

// ─── Rotas restritas a GENERAL_MANAGER ou ADMIN ──────
// checkPermission("GENERAL_MANAGER") usa a hierarquia — GENERAL_MANAGER (3)
// e ADMIN (4) passam; MANAGER (2) e ATTENDANT (1) recebem 403.

router.post(
  "/",
  checkPermission("GENERAL_MANAGER"),
  validateBody(createInterestItemSchema),
  InterestItemsController.create
);

router.put(
  "/:id",
  checkPermission("GENERAL_MANAGER"),
  validateParams(interestItemIdParamSchema),
  validateBody(updateInterestItemSchema),
  InterestItemsController.update
);

// PATCH usa o mesmo schema do PUT — todos os campos já são opcionais
router.patch(
  "/:id",
  checkPermission("GENERAL_MANAGER"),
  validateParams(interestItemIdParamSchema),
  validateBody(updateInterestItemSchema),
  InterestItemsController.update
);

// Soft delete — GENERAL_MANAGER ou ADMIN
router.delete(
  "/:id",
  checkPermission("GENERAL_MANAGER"),
  validateParams(interestItemIdParamSchema),
  InterestItemsController.softDelete
);

// ─── Rota restrita a ADMIN ────────────────────────────
// Declarada antes de "/:id" para o Express não interpretar
// "hard" como um UUID de parâmetro.
router.delete(
  "/:id/hard",
  checkPermission("ADMIN"),
  validateParams(interestItemIdParamSchema),
  InterestItemsController.hardDelete
);

export default router;
