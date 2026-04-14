import { Router } from "express";
import { TeamsController } from "../controllers/teams.controller.js";

import { validate } from "../../../middlewares/validade.middleware.js";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";

import {
  createTeamSchema,
  updateTeamSchema
} from "../dtos/teams.dto.js";

const router = Router();
const controller = new TeamsController();

router.get("/", authMiddleware, controller.findAll);

router.get("/:id", authMiddleware, controller.findById);

router.post(
  "/",
  authMiddleware,
  validate(createTeamSchema),
  controller.create
);

router.put(
  "/:id",
  authMiddleware,
  validate(updateTeamSchema),
  controller.update
);

router.delete("/:id", authMiddleware, controller.delete);

export default router;