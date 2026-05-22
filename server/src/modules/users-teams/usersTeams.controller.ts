// src/modules/users-teams/usersTeams.controller.ts
import type { Response, NextFunction } from "express";
import {
  UsersTeamsService,
  type ActorContext,
  type UserTeamActorRole,
} from "./usersTeams.service.js";
import type { AuthRequest } from "../../middlewares/auth/auth.middleware.js";
import type {
  CreateUserTeamDTO,
  UpdateUserTeamDTO,
  UserTeamIdParamDTO,
} from "./usersTeams.dto.js";

const VALID_ROLES: ReadonlyArray<UserTeamActorRole> = [
  "ATTENDANT",
  "MANAGER",
  "GENERAL_MANAGER",
  "ADMIN",
];

function isValidRole(role: string): role is UserTeamActorRole {
  return (VALID_ROLES as ReadonlyArray<string>).includes(role);
}

export class UsersTeamsController {
  private service = new UsersTeamsService();

  private getActor(req: AuthRequest): ActorContext {
    const user = req.user!;
    if (!isValidRole(user.role)) {
      throw new Error(`Role desconhecido no token: ${user.role}`);
    }
    return { id: user.id, role: user.role };
  }

  // ─── GET /users-teams ─────────────────────────────
  findAll = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userTeams = await this.service.findAll();
      res.status(200).json({ success: true, data: userTeams });
    } catch (err) {
      next(err);
    }
  };

  // ─── GET /users-teams/:id ─────────────────────────
  findById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { id } = req.params as unknown as UserTeamIdParamDTO;
      const userTeam = await this.service.findById(id);
      res.status(200).json({ success: true, data: userTeam });
    } catch (err) {
      next(err);
    }
  };

  // ─── POST /users-teams ────────────────────────────
  create = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const body = req.body as CreateUserTeamDTO;
      const userTeam = await this.service.create(body, actor);
      res.status(201).json({ success: true, data: userTeam });
    } catch (err) {
      next(err);
    }
  };

  // ─── PUT/PATCH /users-teams/:id ───────────────────
  update = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const { id } = req.params as unknown as UserTeamIdParamDTO;
      const body = req.body as UpdateUserTeamDTO;
      const userTeam = await this.service.update(id, body, actor);
      res.status(200).json({ success: true, data: userTeam });
    } catch (err) {
      next(err);
    }
  };

  // ─── DELETE /users-teams/:id ──────────────────────
  softDelete = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const { id } = req.params as unknown as UserTeamIdParamDTO;
      await this.service.softDelete(id, actor);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  // ─── DELETE /users-teams/:id/hard ─────────────────
  hardDelete = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const { id } = req.params as unknown as UserTeamIdParamDTO;
      await this.service.hardDelete(id, actor);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
