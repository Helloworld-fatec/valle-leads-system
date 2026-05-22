// src/modules/teams/teams.controller.ts
import type { Response, NextFunction } from "express";
import {
  TeamsService,
  type TeamActorContext,
  type TeamActorRole,
} from "./teams.service.js";
import type { AuthRequest } from "../../middlewares/auth/auth.middleware.js";
import type {
  CreateTeamDTO,
  UpdateTeamDTO,
  QueryTeamDTO,
  TeamIdParamDTO,
} from "./teams.dto.js";

// Lista fechada de roles válidos para o módulo de times.
const VALID_TEAM_ROLES: ReadonlyArray<TeamActorRole> = [
  "ATTENDANT",
  "MANAGER",
  "GENERAL_MANAGER",
  "ADMIN",
];

function isTeamActorRole(role: string): role is TeamActorRole {
  return (VALID_TEAM_ROLES as ReadonlyArray<string>).includes(role);
}

export class TeamsController {
  private service = new TeamsService();

  // Extrai e valida o ator a partir de req.user.
  // authMiddleware garante que req.user existe nas rotas protegidas.
  private getActor(req: AuthRequest): TeamActorContext {
    const user = req.user!;
    if (!isTeamActorRole(user.role)) {
      // Role fora do enum esperado — indica JWT inconsistente.
      // globalErrorHandler responde 500.
      throw new Error(`Role desconhecido no token: ${user.role}`);
    }
    return { id: user.id, role: user.role };
  }

  // ─── LISTAR ─────────────────────────────────────────
  findAll = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      // validateQuery já converteu a query; cast via unknown é seguro aqui.
      const query = req.query as unknown as QueryTeamDTO;
      const teams = await this.service.findAll(query.is_active, actor);
      res.status(200).json({ success: true, data: teams });
    } catch (err) {
      next(err);
    }
  };

  // ─── BUSCAR POR ID ───────────────────────────────────
  findById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Não precisa de actor — findById é aberto a qualquer autenticado.
      const { id } = req.params as unknown as TeamIdParamDTO;
      const team = await this.service.findById(id);
      res.status(200).json({ success: true, data: team });
    } catch (err) {
      next(err);
    }
  };

  // ─── CRIAR ──────────────────────────────────────────
  create = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const body = req.body as CreateTeamDTO;
      const team = await this.service.create(body, actor);
      res.status(201).json({ success: true, data: team });
    } catch (err) {
      next(err);
    }
  };

  // ─── ATUALIZAR ──────────────────────────────────────
  update = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const { id } = req.params as unknown as TeamIdParamDTO;
      const body = req.body as UpdateTeamDTO;
      const team = await this.service.update(id, body, actor);
      res.status(200).json({ success: true, data: team });
    } catch (err) {
      next(err);
    }
  };

  // ─── SOFT DELETE ────────────────────────────────────
  softDelete = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const { id } = req.params as unknown as TeamIdParamDTO;
      await this.service.softDelete(id, actor);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  // ─── HARD DELETE ────────────────────────────────────
  hardDelete = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const { id } = req.params as unknown as TeamIdParamDTO;
      await this.service.hardDelete(id, actor);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
