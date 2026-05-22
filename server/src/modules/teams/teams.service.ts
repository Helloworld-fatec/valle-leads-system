// src/modules/teams/teams.service.ts
import { Prisma } from "../../config/prisma.js";
import {
  TeamsRepository,
  type TeamRow,
  type TeamWithRelations,
} from "./teams.repository.js";
import type { CreateTeamDTO, UpdateTeamDTO } from "./teams.dto.js";
import {
  RecursoNaoEncontradoError,
  AcessoNaoAutorizadoError,
  BusinessRuleError,
} from "../../middlewares/errors/domainErrors.middleware.js";

// Roles aceitos pelo módulo — espelham os valores do JWT sem acoplar ao
// middleware de auth. Valores idênticos aos do permission.middleware.ts.
export type TeamActorRole =
  | "ATTENDANT"
  | "MANAGER"
  | "GENERAL_MANAGER"
  | "ADMIN";

// Contexto do solicitante, montado pelo controller a partir de req.user.
export interface TeamActorContext {
  id: string;
  role: TeamActorRole;
}

// ─── Helpers de permissão ─────────────────────────────
// Centralizam as verificações de role para que o código de negócio leia
// intenção ("canManageTeams") e não comparações de string espalhadas.

function canManageTeams(role: TeamActorRole): boolean {
  return role === "GENERAL_MANAGER" || role === "ADMIN";
}

function canHardDelete(role: TeamActorRole): boolean {
  return role === "ADMIN";
}

export class TeamsService {
  private repo = new TeamsRepository();

  // ─── LISTAR ─────────────────────────────────────────
  // Apenas GENERAL_MANAGER e ADMIN (route já garante via checkPermission,
  // mas o service reaplica como defesa em profundidade).
  async findAll(
    isActive: boolean | undefined,
    actor: TeamActorContext
  ): Promise<TeamRow[]> {
    if (!canManageTeams(actor.role)) {
      throw new AcessoNaoAutorizadoError(
        "Apenas gerente geral ou administrador podem listar times."
      );
    }
    return this.repo.findAll(isActive);
  }

  // ─── BUSCAR POR ID ───────────────────────────────────
  // Qualquer role autenticado pode buscar um time por ID.
  async findById(id: string): Promise<TeamWithRelations> {
    const team = await this.repo.findById(id);
    if (!team) {
      throw new RecursoNaoEncontradoError("Time não encontrado.");
    }
    return team;
  }

  // ─── CRIAR ──────────────────────────────────────────
  async create(
    dto: CreateTeamDTO,
    actor: TeamActorContext
  ): Promise<TeamWithRelations> {
    if (!canManageTeams(actor.role)) {
      throw new AcessoNaoAutorizadoError(
        "Apenas gerente geral ou administrador podem criar times."
      );
    }
    return this.repo.create({ dto, actorId: actor.id });
  }

  // ─── ATUALIZAR ──────────────────────────────────────
  async update(
    id: string,
    dto: UpdateTeamDTO,
    actor: TeamActorContext
  ): Promise<TeamWithRelations> {
    if (!canManageTeams(actor.role)) {
      throw new AcessoNaoAutorizadoError(
        "Apenas gerente geral ou administrador podem atualizar times."
      );
    }

    const team = await this.repo.findLightById(id);
    if (!team) {
      throw new RecursoNaoEncontradoError("Time não encontrado.");
    }

    return this.repo.update({ id, dto, actorId: actor.id });
  }

  // ─── SOFT DELETE ────────────────────────────────────
  async softDelete(id: string, actor: TeamActorContext): Promise<void> {
    if (!canManageTeams(actor.role)) {
      throw new AcessoNaoAutorizadoError(
        "Apenas gerente geral ou administrador podem desativar times."
      );
    }

    const team = await this.repo.findLightById(id);
    if (!team) {
      throw new RecursoNaoEncontradoError("Time não encontrado.");
    }

    if (!team.is_active) {
      throw new BusinessRuleError("Time já está inativo.");
    }

    await this.repo.softDelete({ id, actorId: actor.id });
  }

  // ─── HARD DELETE ────────────────────────────────────
  // Apenas ADMIN. O schema usa onDelete: Restrict para leads, negotiations
  // e user_teams vinculados, então o Prisma rejeita com P2003 se houver
  // registros filhos — capturamos e devolvemos mensagem de domínio clara.
  async hardDelete(id: string, actor: TeamActorContext): Promise<void> {
    if (!canHardDelete(actor.role)) {
      throw new AcessoNaoAutorizadoError(
        "Apenas administradores podem excluir times permanentemente."
      );
    }

    const team = await this.repo.findLightById(id);
    if (!team) {
      throw new RecursoNaoEncontradoError("Time não encontrado.");
    }

    try {
      await this.repo.hardDelete(id);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2003"
      ) {
        throw new BusinessRuleError(
          "Não é possível excluir o time permanentemente pois existem registros vinculados (leads, negociações ou membros)."
        );
      }
      throw err;
    }
  }
}
