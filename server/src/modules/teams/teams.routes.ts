// server/src/modules/teams/teams.routes.ts
import { Router } from "express";
import { TeamsController } from "./teams.controller.js";

// Ajuste os caminhos abaixo conforme a localização exata no seu projeto
import { validateBody } from "../../middlewares/validation/validate.middleware.js"; 
import { authMiddleware } from "../../middlewares/auth/auth.middleware.js"; 

import {
  createTeamSchema,
  updateTeamSchema
} from "./teams.dto.js";

const router = Router();
const controller = new TeamsController();

// 🔍 LISTAR TODAS AS TEAMS (aceita query param is_active)
router.get(
  "/", 
  authMiddleware, 
  controller.findAll.bind(controller)
);

// 🔍 BUSCAR TEAM POR ID
router.get(
  "/:id", 
  authMiddleware, 
  controller.findById.bind(controller)
);

// ➕ CRIAR TEAM (Com validação do body)
router.post(
  "/",
  authMiddleware,
  validateBody(createTeamSchema),
  controller.create.bind(controller)
);

// ✏️ ATUALIZAR TEAM (Com validação do body)
router.put(
  "/:id",
  authMiddleware,
  validateBody(updateTeamSchema),
  controller.update.bind(controller)
);

// ❌ DELETAR TEAM
router.delete(
  "/:id", 
  authMiddleware, 
  controller.delete.bind(controller)
);

export default router;