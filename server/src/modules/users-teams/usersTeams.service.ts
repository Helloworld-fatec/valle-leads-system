// src/modules/users-teams/usersTeams.service.ts
import { UsersTeamsRepository, type UserTeamWithRelations } from "./usersTeams.repository.js";
import { UsersRepository } from "../users/users.repository.js";
import { TeamsRepository } from "../teams/teams.repository.js";
import type { CreateUserTeamDTO, UpdateUserTeamDTO } from "./usersTeams.dto.js";
import {
  RecursoNaoEncontradoError,
  AcessoNaoAutorizadoError,
  ConflitoDeDadosError,
  BusinessRuleError,
} from "../../middlewares/errors/domainErrors.middleware.js";

// Roles aceitos pelo módulo
export type UserTeamActorRole =
  | "ATTENDANT"
  | "MANAGER"
  | "GENERAL_MANAGER"
  | "ADMIN";

export interface ActorContext {
  id: string;
  role: UserTeamActorRole;
}

// ─── Helpers de permissão ─────────────────────────────
function canManage(role: UserTeamActorRole): boolean {
  return role === "GENERAL_MANAGER" || role === "ADMIN";
}

function canSoftDelete(role: UserTeamActorRole): boolean {
  return role === "GENERAL_MANAGER" || role === "ADMIN";
}

function canHardDelete(role: UserTeamActorRole): boolean {
  return role === "ADMIN";
}

export class UsersTeamsService {
  private repo = new UsersTeamsRepository();
  private usersRepo = new UsersRepository();
  private teamsRepo = new TeamsRepository();

  // ─── LISTAR ─────────────────────────────────────────
  // Qualquer role autenticado pode visualizar.
  async findAll(): Promise<UserTeamWithRelations[]> {
    return this.repo.findAll();
  }

  // ─── BUSCAR POR ID ───────────────────────────────────
  // Qualquer role autenticado pode visualizar.
  async findById(id: string): Promise<UserTeamWithRelations> {
    const userTeam = await this.repo.findById(id);
    if (!userTeam) {
      throw new RecursoNaoEncontradoError("Vínculo não encontrado.");
    }
    return userTeam;
  }

  // ─── CRIAR ──────────────────────────────────────────
  // GENERAL_MANAGER e ADMIN.
  // Reativa automaticamente se o vínculo já existia mas estava inativo,
  // em vez de lançar conflito — o "recriar" é apenas ativar o registro.
  async create(
    data: CreateUserTeamDTO,
    actor: ActorContext
  ): Promise<UserTeamWithRelations> {
    if (!canManage(actor.role)) {
      throw new AcessoNaoAutorizadoError(
        "Apenas gerente geral ou administrador podem criar vínculos."
      );
    }

    const user = await this.usersRepo.findById(data.user_id);
    if (!user) {
      throw new RecursoNaoEncontradoError("Usuário não encontrado.");
    }
    if (!user.is_active) {
      throw new BusinessRuleError(
        "Não é possível vincular um usuário inativo a um time."
      );
    }

    const team = await this.teamsRepo.findLightById(data.team_id);
    if (!team) {
      throw new RecursoNaoEncontradoError("Time não encontrado.");
    }
    if (!team.is_active) {
      throw new BusinessRuleError(
        "Não é possível vincular um usuário a um time inativo."
      );
    }

    const existing = await this.repo.findByUserAndTeam(data.user_id, data.team_id);

    if (existing) {
      if (existing.is_active) {
        throw new ConflitoDeDadosError("O usuário já pertence a este time.");
      }
      // Vínculo existe mas está inativo — reativa em vez de recriar
      return this.repo.update({ id: existing.id, dto: { is_active: true } });
    }

    return this.repo.create({ dto: data, actorId: actor.id });
  }

  // ─── ATUALIZAR ──────────────────────────────────────
  // GENERAL_MANAGER e ADMIN. Só é possível alterar is_active.
  async update(
    id: string,
    data: UpdateUserTeamDTO,
    actor: ActorContext
  ): Promise<UserTeamWithRelations> {
    if (!canManage(actor.role)) {
      throw new AcessoNaoAutorizadoError(
        "Apenas gerente geral ou administrador podem editar vínculos."
      );
    }

    const userTeam = await this.repo.findById(id);
    if (!userTeam) {
      throw new RecursoNaoEncontradoError("Vínculo não encontrado.");
    }

    if (userTeam.is_active === data.is_active) {
      throw new BusinessRuleError(
        `Vínculo já está ${data.is_active ? "ativo" : "inativo"}.`
      );
    }

    return this.repo.update({ id, dto: data });
  }

  // ─── SOFT DELETE ────────────────────────────────────
  // GENERAL_MANAGER e ADMIN.
  async softDelete(id: string, actor: ActorContext): Promise<void> {
    if (!canSoftDelete(actor.role)) {
      throw new AcessoNaoAutorizadoError(
        "Apenas gerente geral ou administrador podem desativar vínculos."
      );
    }

    const userTeam = await this.repo.findById(id);
    if (!userTeam) {
      throw new RecursoNaoEncontradoError("Vínculo não encontrado.");
    }
    if (!userTeam.is_active) {
      throw new BusinessRuleError("Vínculo já está inativo.");
    }

    await this.repo.softDelete(id);
  }

  // ─── HARD DELETE ────────────────────────────────────
  // Somente ADMIN.
  async hardDelete(id: string, actor: ActorContext): Promise<void> {
    if (!canHardDelete(actor.role)) {
      throw new AcessoNaoAutorizadoError(
        "Apenas administradores podem excluir vínculos permanentemente."
      );
    }

    const userTeam = await this.repo.findById(id);
    if (!userTeam) {
      throw new RecursoNaoEncontradoError("Vínculo não encontrado.");
    }

    await this.repo.hardDelete(id);
  }
}
