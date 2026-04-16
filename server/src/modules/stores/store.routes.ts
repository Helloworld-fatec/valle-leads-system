// server/src/modules/stores/store.routes.ts
import { Router } from "express";
import { StoresController } from "./stores.controller.js"; // Ajustado para o caminho local correto
import { validateBody } from "../../middlewares/validation/validate.middleware.js"; // Ajustado para importar o validateBody
import { authMiddleware } from "../../middlewares/auth/auth.middleware.js"; // Verifique se o caminho do authMiddleware está correto no seu projeto

import {
  createStoreSchema,
  updateStoreSchema
} from "./stores.dtos.js";

const router = Router();
const controller = new StoresController();

// 🔍 LISTAR TODAS AS STORES (Mapeado para o findAll do controller)
router.get(
  "/", 
  authMiddleware, 
  controller.findAll.bind(controller)
);

// 🔍 BUSCAR STORE POR ID (Nova rota baseada no controller)
router.get(
  "/:id", 
  authMiddleware, 
  controller.findById.bind(controller)
);

// ➕ CRIAR STORE (Com validação do body)
router.post(
  "/",
  authMiddleware,
  validateBody(createStoreSchema),
  controller.create.bind(controller)
);

// ✏️ ATUALIZAR STORE (Com validação do body)
router.put(
  "/:id",
  authMiddleware,
  validateBody(updateStoreSchema),
  controller.update.bind(controller)
);

// ❌ DELETAR STORE
router.delete(
  "/:id", 
  authMiddleware, 
  controller.delete.bind(controller)
);

export default router;