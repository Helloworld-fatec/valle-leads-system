// server/src/modules/users-teams/usersTeams.routes.ts
import { Router } from "express";
import { UsersTeamsController } from "./usersTeams.controller.js";
import { validateBody } from "../../middlewares/validation/validate.middleware.js";

import { 
  createUserTeamSchema, 
  updateUserTeamSchema 
} from "./usersTeams.dto.js";

const router = Router();
const controller = new UsersTeamsController();

// Handlers seguros
const findAll = controller.findAll.bind(controller);
const findById = controller.findById.bind(controller);
const create = controller.create.bind(controller);
const update = controller.update.bind(controller);
const remove = controller.delete.bind(controller);

// 🔍 LISTAR TODOS OS VÍNCULOS
router.get("/", findAll);

// 🔍 BUSCAR VÍNCULO ESPECÍFICO POR ID
router.get("/:id", findById);

// ➕ VINCULAR UTILIZADOR A UM TIME
router.post(
  "/",
  validateBody(createUserTeamSchema),
  create
);

// ✏️ ATUALIZAR VÍNCULO
router.put(
  "/:id",
  validateBody(updateUserTeamSchema),
  update
);

// ❌ REMOVER UTILIZADOR DO TIME (DESVINCULAR)
router.delete("/:id", remove);

export default router;