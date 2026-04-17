// server/src/modules/stores/store.routes.ts
import { Router } from "express";
import { StoresController } from "./stores.controller.js";
import { validateBody } from "../../middlewares/validation/validate.middleware.js";

import {
  createStoreSchema,
  updateStoreSchema
} from "./stores.dtos.js";

const router = Router();
const controller = new StoresController();

// Handlers seguros (evita problema de contexto / bind esquecido)
const findAll = controller.findAll.bind(controller);
const findById = controller.findById.bind(controller);
const create = controller.create.bind(controller);
const update = controller.update.bind(controller);
const remove = controller.delete.bind(controller);

// 🔍 LISTAR TODAS AS STORES
router.get("/", findAll);

// 🔍 BUSCAR STORE POR ID
router.get("/:id", findById);

// ➕ CRIAR STORE
router.post(
  "/",
  validateBody(createStoreSchema),
  create
);

// ✏️ ATUALIZAR STORE
router.put(
  "/:id",
  validateBody(updateStoreSchema),
  update
);

// ❌ DELETAR STORE
router.delete("/:id", remove);

export default router;