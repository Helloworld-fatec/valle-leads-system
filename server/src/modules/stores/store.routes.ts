import { Router } from "express";
import { StoresController } from "../controllers/stores.controller.js";

import { validate } from "../../../middlewares/validade.middleware.js";
import { authMiddleware } from "../../../middlewares/auth.middleware.js";

import {
  createStoreSchema,
  updateStoreSchema
} from "../dtos/stores.dtos.js";

const router = Router();
const controller = new StoresController();

router.get("/team/:teamId", authMiddleware, controller.findByTeamId);

router.post(
  "/",
  authMiddleware,
  validate(createStoreSchema),
  controller.create
);

router.put(
  "/:id",
  authMiddleware,
  validate(updateStoreSchema),
  controller.update
);

router.delete("/:id", authMiddleware, controller.delete);

export default router;