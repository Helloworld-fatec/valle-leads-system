import { Router } from "express";
import { negotiationStageHistoryController } from "./negotiationStageHistory.controller.js";

const router = Router({ mergeParams: true });

// mergeParams: true — necessário para acessar :id vindo do router pai (/negotiations/:id/history)

router.get("/", negotiationStageHistoryController.getHistory);
router.post("/", negotiationStageHistoryController.createHistoryEntry);

export const negotiationStageHistoryRouter = router;