// server/src/modules/teams/teams.routes.ts
import { Router } from "express";
import { TeamsController } from "./teams.controller.js";

import { validateBody } from "../../middlewares/validation/validate.middleware.js";

import {
  createTeamSchema,
  updateTeamSchema
} from "./teams.dto.js";

const router = Router();
const controller = new TeamsController();

// Handlers seguros
const findAll = controller.findAll.bind(controller);
const findById = controller.findById.bind(controller);
const create = controller.create.bind(controller);
const update = controller.update.bind(controller);
const remove = controller.delete.bind(controller);

// 🔍 LISTAR TODAS AS TEAMS (aceita query param is_active)
router.get("/", findAll);

// 🔍 BUSCAR TEAM POR ID
router.get("/:id", findById);

// ➕ CRIAR TEAM
router.post(
  "/",
  validateBody(createTeamSchema),
  create
);

// ✏️ ATUALIZAR TEAM
router.put(
  "/:id",
  validateBody(updateTeamSchema),
  update
);

// ❌ DELETAR TEAM
router.delete("/:id", remove);

export default router;