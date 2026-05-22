// server/src/modules/negotiation/negotiation.controller.ts
import type { Response, NextFunction } from "express";
import {
  NegotiationsService,
  type ActorContext,
  type NegotiationActorRole,
} from "./negotiation.service.js";
import type { AuthRequest } from "../../middlewares/auth/auth.middleware.js";
import type {
  CreateNegotiationDTO,
  UpdateNegotiationDTO,
  QueryNegotiationDTO,
  NegotiationIdParamDTO,
  BulkAssignAttendantDTO,
  BulkAssignTeamDTO,
} from "./negotiation.dto.js";

// Lista fechada dos roles aceitos. Usada num type guard antes de tratar
// o role do JWT como NegotiationActorRole (defesa contra JWT inconsistente).
const VALID_NEGOTIATION_ROLES: ReadonlyArray<NegotiationActorRole> = [
  "ATTENDANT",
  "MANAGER",
  "GENERAL_MANAGER",
  "ADMIN",
];

function isNegotiationActorRole(role: string): role is NegotiationActorRole {
  return (VALID_NEGOTIATION_ROLES as ReadonlyArray<string>).includes(role);
}

export class NegotiationsController {
  private negotiationsService = new NegotiationsService();

  // Extrai e tipa o ator a partir de req.user. authMiddleware garante
  // a existência de req.user — o `!` é seguro nessas rotas protegidas.
  private getActor(req: AuthRequest): ActorContext {
    const user = req.user!;
    if (!isNegotiationActorRole(user.role)) {
      throw new Error(`Role desconhecido no token: ${user.role}`);
    }
    return {
      id: user.id,
      role: user.role,
      team_ids: user.team_ids,
    };
  }

  // O validateBody/Query/Params já garantiu o shape em runtime; aqui só
  // reinterpretamos o tipo (via unknown) para o DTO tipado.

  findAll = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const query = req.query as unknown as QueryNegotiationDTO;
      const result = await this.negotiationsService.findAll(query, actor);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  findById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const { id } = req.params as unknown as NegotiationIdParamDTO;
      const negotiation = await this.negotiationsService.findById(id, actor);
      res.status(200).json({ success: true, data: negotiation });
    } catch (error) {
      next(error);
    }
  };

  create = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const body = req.body as CreateNegotiationDTO;
      const negotiation = await this.negotiationsService.create(body, actor);
      res.status(201).json({ success: true, data: negotiation });
    } catch (error) {
      next(error);
    }
  };

  update = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const { id } = req.params as unknown as NegotiationIdParamDTO;
      const body = req.body as UpdateNegotiationDTO;
      const negotiation = await this.negotiationsService.update(id, body, actor);
      res.status(200).json({ success: true, data: negotiation });
    } catch (error) {
      next(error);
    }
  };

  hardDelete = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const { id } = req.params as unknown as NegotiationIdParamDTO;
      await this.negotiationsService.hardDelete(id, actor);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  bulkAssignAttendant = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const body = req.body as BulkAssignAttendantDTO;
      const result = await this.negotiationsService.bulkAssignAttendant(
        body,
        actor
      );
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  bulkAssignTeam = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const body = req.body as BulkAssignTeamDTO;
      const result = await this.negotiationsService.bulkAssignTeam(body, actor);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };
}
