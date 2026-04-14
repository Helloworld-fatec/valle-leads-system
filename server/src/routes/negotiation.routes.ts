import { Router } from "express";
import { NegotiationsController } from "../controllers/negotiation.controller.js";
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
    CREATE_NEGOTIATION_SCHEMA,
    UPDATE_NEGOTIATION_SCHEMA,
    UPDATE_STATUS_SCHEMA,
} from '../dto/negotiation.dto.js';

const router = Router();
const controller = new NegotiationsController();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.detail);
router.post('/', validate(CREATE_NEGOTIATION_SCHEMA), controller.create);
router.put('/:id', validate(UPDATE_NEGOTIATION_SCHEMA), controller.update);
router.patch('/:id/status', validate(UPDATE_STATUS_SCHEMA), controller.changeStatus);

export default router;