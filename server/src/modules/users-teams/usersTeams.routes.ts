// server/src/modules/users-teams/usersTeams.routes.ts
import { Router } from "express";
import { UsersTeamsController } from "./usersTeams.controller.js";
import { validateBody } from "../../middlewares/validation/validate.middleware.js";
import { authMiddleware } from "../../middlewares/auth/auth.middleware.js";
import { 
  createUserTeamSchema, 
  updateUserTeamSchema 
} from "./usersTeams.dto.js";

const router = Router();
const controller = new UsersTeamsController();

// 🔍 LISTAR TODOS OS VÍNCULOS
// Geralmente usado por administradores para ver a árvore completa de acessos
router.get(
  "/", 
  authMiddleware, 
  controller.findAll.bind(controller)
);

// 🔍 BUSCAR VÍNCULO ESPECÍFICO POR ID
router.get(
  "/:id", 
  authMiddleware, 
  controller.findById.bind(controller)
);

// ➕ VINCULAR UTILIZADOR A UM TIME
// Valida se o user_id e team_id são UUIDs válidos antes de processar
router.post(
  "/",
  authMiddleware,
  validateBody(createUserTeamSchema),
  controller.create.bind(controller)
);

// ✏️ ATUALIZAR VÍNCULO
// Útil caso queira transferir um registo de vínculo para outro ID sem apagar
router.put(
  "/:id",
  authMiddleware,
  validateBody(updateUserTeamSchema),
  controller.update.bind(controller)
);

// ❌ REMOVER UTILIZADOR DO TIME (DESVINCULAR)
router.delete(
  "/:id", 
  authMiddleware, 
  controller.delete.bind(controller)
);

export default router;