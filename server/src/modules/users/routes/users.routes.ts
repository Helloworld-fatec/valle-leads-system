import { Router } from "express";
import { UsersController } from "../controller/UsersController.js";

const router = Router();
const usersController = new UsersController();

router.get("/", usersController.findAll.bind(usersController));
router.get("/:id", usersController.findById.bind(usersController));
router.post("/", usersController.create.bind(usersController));
router.put("/:id", usersController.update.bind(usersController));
router.delete("/:id", usersController.softDelete.bind(usersController));

export default router;