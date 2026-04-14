import { Router } from "express";
import { importanceController } from "./importance.controller.js";

const router = Router({ mergeParams: true });

// mergeParams: true — necessário para acessar :id vindo do router pai (/negotiations/:id/importance)

router.get("/", importanceController.getImportance);
router.put("/", importanceController.updateImportance);

export const importanceRouter = router;