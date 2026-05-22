// server/src/modules/negotiation-stage-history/negotiationStageHistory.controller.ts
import type { Response, NextFunction } from "express";
import { NegotiationStageHistoryService } from "./negotiationStageHistory.service";
import type { AuthRequest } from "../../middlewares/auth/auth.middleware";
import type {
  CreateNegotiationStageHistoryDTO,
  UpdateNegotiationStageHistoryDTO,
  QueryNegotiationStageHistoryDTO,
} from "./negotiationStageHistory.dto";
import type {
  ActorContext,
  NegotiationActorRole,
} from "../negotiation/negotiation.service";

// ─────────────────────────────────────────────
// NEGOTIATION STAGE HISTORY CONTROLLER
// ─────────────────────────────────────────────

// Roles reconhecidos pelo sistema — type guard para transformar a string
// do JWT em NegotiationActorRole de forma segura.
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
// authMiddleware garante a existência de req.user nessas rotas — o "!" é seguro.
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

// AuthRequest não é genérico — tipamos req.params via interseção,
// sobrescrevendo apenas o campo `params` no tipo resultante.
type RequestWithId = AuthRequest & { params: { id: string } };

export const NegotiationStageHistoryController = {
  async findAll(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const actor = getActor(req);
      // req.query já foi validado e transformado pelo validateQuery (Zod)
      const filters = req.query as unknown as QueryNegotiationStageHistoryDTO;

      const data = await NegotiationStageHistoryService.findAll(
        filters,
        actor
      );

      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async findById(
    req: RequestWithId,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const actor = getActor(req);
      const { id } = req.params;

      const data = await NegotiationStageHistoryService.findById(id, actor);

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
      const body = req.body as CreateNegotiationStageHistoryDTO;

      const data = await NegotiationStageHistoryService.create(body, actor);

      res.status(201).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async update(
    req: RequestWithId,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const actor = getActor(req);
      const { id } = req.params;
      const body = req.body as UpdateNegotiationStageHistoryDTO;

      const data = await NegotiationStageHistoryService.update(
        id,
        body,
        actor
      );

      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  },

  async delete(
    req: RequestWithId,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const actor = getActor(req);
      const { id } = req.params;

      await NegotiationStageHistoryService.delete(id, actor);

      res.status(200).json({
        success: true,
        message: "Histórico de estágio excluído com sucesso.",
      });
    } catch (error) {
      next(error);
    }
  },
};