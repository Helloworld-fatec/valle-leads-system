// server/src/modules/negotiation-status/status.controller.ts
import type { Response, NextFunction } from "express";
import { NegotiationStatusService } from "./status.service";
import type { AuthRequest } from "../../middlewares/auth/auth.middleware";
import type {
  CreateNegotiationStatusDTO,
  UpdateNegotiationStatusDTO,
  QueryNegotiationStatusDTO,
} from "./status.dto";
import type {
  ActorContext,
  NegotiationActorRole,
} from "../negotiation/negotiation.service";

// ─────────────────────────────────────────────
// NEGOTIATION STATUS CONTROLLER
// ─────────────────────────────────────────────

const VALID_ROLES: ReadonlyArray<NegotiationActorRole> = [
  "ATTENDANT",
  "MANAGER",
  "GENERAL_MANAGER",
  "ADMIN",
];

function isValidRole(role: string): role is NegotiationActorRole {
  return (VALID_ROLES as ReadonlyArray<string>).includes(role);
}

// Extrai o ActorContext do req.user injetado pelo authMiddleware.
// authMiddleware garante a existência de req.user — o "!" é seguro aqui.
function getActor(req: AuthRequest): ActorContext {
  const user = req.user!;
  if (!isValidRole(user.role)) {
    throw new Error(`Role desconhecido no token: ${user.role}`);
  }
  return {
    id: user.id,
    role: user.role,
    team_ids: user.team_ids,
  };
}

type ParamsWithId = { id: string };

export const NegotiationStatusController = {
  async findAll(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const actor = getActor(req);
      // req.query já foi validado e transformado pelo validateQuery (Zod)
      const filters = req.query as unknown as QueryNegotiationStatusDTO;

      const data = await NegotiationStatusService.findAll(filters, actor);

      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async findById(
    req: AuthRequest<ParamsWithId>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const actor = getActor(req);
      const { id } = req.params;

      const data = await NegotiationStatusService.findById(id, actor);

      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async create(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const actor = getActor(req);
      // req.body já chega 100% validado pelo validateBody (Zod)
      const body = req.body as CreateNegotiationStatusDTO;

      const data = await NegotiationStatusService.create(body, actor);

      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async update(
    req: AuthRequest<ParamsWithId>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const actor = getActor(req);
      const { id } = req.params;
      const body = req.body as UpdateNegotiationStatusDTO;

      const data = await NegotiationStatusService.update(id, body, actor);

      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async delete(
    req: AuthRequest<ParamsWithId>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const actor = getActor(req);
      const { id } = req.params;

      await NegotiationStatusService.delete(id, actor);

      res.status(200).json({
        success: true,
        message: "Histórico de status excluído com sucesso.",
      });
    } catch (error) {
      next(error);
    }
  },
};