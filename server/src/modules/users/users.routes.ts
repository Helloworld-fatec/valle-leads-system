// server/src/modules/users/users.routes.ts
import { Router } from "express";
import { UsersController } from "./users.controller.js";
import { validateBody } from "../../middlewares/validation/validate.middleware.js"; // Ajuste o caminho se necessário
import { createUserSchema, updateUserSchema } from "./users.dto.js";

const router = Router();
const usersController = new UsersController();

// Rotas de leitura (sem validação de body)
router.get("/", usersController.findAll.bind(usersController));
router.get("/:id", usersController.findById.bind(usersController));

// Rota de criação: aplica a validação do createUserSchema antes de chamar o controller
router.post(
  "/",
  validateBody(createUserSchema),
  usersController.create.bind(usersController)
);

// Rota de atualização: aplica a validação do updateUserSchema antes de chamar o controller
router.put(
  "/:id",
  validateBody(updateUserSchema),
  usersController.update.bind(usersController)
);

// Rota de eliminação (soft delete)
router.delete("/:id", usersController.softDelete.bind(usersController));

export default router;