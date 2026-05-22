// src/modules/users/users.service.ts
import bcrypt from "bcrypt";
import { Prisma } from "../../config/prisma.js";
import { UsersRepository, type SafeUser, type ListUsersFilters } from "./users.repository.js";
import type {
  CreateUserDTO,
  UpdateUserAdminDTO,
  UpdateSelfDTO,
  ListUsersQueryDTO,
  UserRole,
} from "./users.dto.js";
import {
  ConflitoDeDadosError,
  RecursoNaoEncontradoError,
  AcessoNaoAutorizadoError,
  RequisicaoInvalidaError,
  BusinessRuleError,
} from "../../middlewares/errors/domainErrors.middleware.js";

// ─────────────────────────────────────────────
// USERS SERVICE
// ─────────────────────────────────────────────
// Responsabilidade: regras de negócio e RBAC do módulo de usuários.
//
// Separação clara de dois fluxos de update:
//   - updateAdmin(id, data, actor): ADMIN edita qualquer usuário com campos completos
//   - updateSelf(data, actor):      qualquer autenticado edita o próprio perfil,
//                                   sem campos sensíveis (role, is_active, team_ids)
//
// O controller escolhe qual chamar com base na rota e no actor.role.
// ─────────────────────────────────────────────

const BCRYPT_ROUNDS = 10;

export interface ActorContext {
  id: string;
  role: UserRole;
}

export class UsersService {
  private repo = new UsersRepository();

  // ─── CREATE ───────────────────────────────────────
  // Somente ADMIN pode criar usuários (RF02).
  async create(data: CreateUserDTO, actor: ActorContext): Promise<SafeUser> {
    if (actor.role !== "ADMIN") {
      throw new AcessoNaoAutorizadoError(
        "Apenas administradores podem criar usuários."
      );
    }

    const existing = await this.repo.findByEmail(data.email);
    if (existing) {
      throw new ConflitoDeDadosError("E-mail já cadastrado.");
    }

    const password_hash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    // Campos opcionais do Prisma são `string | null`, não `string | undefined`.
    // Com exactOptionalPropertyTypes, o spread do DTO passaria `undefined` onde
    // o Prisma exige `null` — por isso construímos o objeto explicitamente.
    return this.repo.create({
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        password_hash,
        phone_1_ddd: data.phone_1_ddd ?? null,
        phone_1_number: data.phone_1_number ?? null,
        phone_2_ddd: data.phone_2_ddd ?? null,
        phone_2_number: data.phone_2_number ?? null,
        address_street: data.address_street ?? null,
        address_number: data.address_number ?? null,
        address_complement: data.address_complement ?? null,
        address_neighborhood: data.address_neighborhood ?? null,
        address_city: data.address_city ?? null,
        address_state: data.address_state ?? null,
        address_zip: data.address_zip ?? null,
        created_by_user_id: actor.id,
        updated_by_user_id: actor.id,
      },
      ...(data.team_ids !== undefined && { team_ids: data.team_ids }),
      actorId: actor.id,
    });
  }

  // ─── FIND ALL ─────────────────────────────────────
  // MANAGER vê apenas usuários dos próprios times.
  // GENERAL_MANAGER e ADMIN veem todos.
  // ATTENDANT não tem acesso (route já bloqueia via checkPermission("MANAGER"),
  // mas o service reaplica como defesa em profundidade).
  async findAll(
    filters: ListUsersQueryDTO,
    actor: ActorContext
  ): Promise<{ data: SafeUser[]; total: number; page: number; pageSize: number }> {
    if (actor.role === "ATTENDANT") {
      throw new AcessoNaoAutorizadoError(
        "Atendentes não podem listar usuários."
      );
    }

    let team_ids_scope: string[] | undefined;

    if (actor.role === "MANAGER") {
      team_ids_scope = await this.repo.findActiveTeamIds(actor.id);
      if (team_ids_scope.length === 0) {
        return { data: [], total: 0, page: filters.page, pageSize: filters.pageSize };
      }
    }

    // Monta o objeto de filtros sem passar undefined explicitamente
    // (compatibilidade com exactOptionalPropertyTypes).
    const repoFilters: ListUsersFilters = {
      page: filters.page,
      pageSize: filters.pageSize,
    };

    if (filters.role !== undefined) repoFilters.role = filters.role;
    if (filters.team_id !== undefined) repoFilters.team_id = filters.team_id;
    if (filters.search !== undefined) repoFilters.search = filters.search;
    if (filters.is_active !== undefined) repoFilters.is_active = filters.is_active;
    if (team_ids_scope !== undefined) repoFilters.team_ids_scope = team_ids_scope;

    const { data, total } = await this.repo.findMany(repoFilters);

    return { data, total, page: filters.page, pageSize: filters.pageSize };
  }

  // ─── FIND BY ID ───────────────────────────────────
  // Qualquer autenticado pode buscar. Escopo:
  //   ATTENDANT:       apenas o próprio cadastro
  //   MANAGER:         apenas usuários que dividem time com ele (+ si mesmo)
  //   GENERAL_MANAGER: qualquer um
  //   ADMIN:           qualquer um
  async findById(id: string, actor: ActorContext): Promise<SafeUser> {
    const user = await this.repo.findById(id);
    if (!user) {
      throw new RecursoNaoEncontradoError("Usuário não encontrado.");
    }

    if (actor.role === "ATTENDANT" && actor.id !== id) {
      throw new AcessoNaoAutorizadoError(
        "Você só pode visualizar o seu próprio cadastro."
      );
    }

    if (actor.role === "MANAGER" && actor.id !== id) {
      const managerTeams = await this.repo.findActiveTeamIds(actor.id);
      const targetTeams = user.user_teams.map((ut) => ut.team_id);
      const sharesTeam = targetTeams.some((t) => managerTeams.includes(t));
      if (!sharesTeam) {
        throw new AcessoNaoAutorizadoError(
          "Você só pode visualizar usuários dos seus times."
        );
      }
    }

    return user;
  }

  // ─── UPDATE ADMIN ─────────────────────────────────
  // ADMIN edita qualquer usuário com acesso completo a todos os campos,
  // incluindo role, is_active e team_ids.
  async updateAdmin(
    id: string,
    data: UpdateUserAdminDTO,
    actor: ActorContext
  ): Promise<SafeUser> {
    if (actor.role !== "ADMIN") {
      throw new AcessoNaoAutorizadoError(
        "Apenas administradores podem usar esta operação."
      );
    }

    const target = await this.repo.findById(id);
    if (!target) {
      throw new RecursoNaoEncontradoError("Usuário não encontrado.");
    }

    if (data.email !== undefined && data.email !== target.email) {
      const emailInUse = await this.repo.findByEmail(data.email);
      if (emailInUse) {
        throw new ConflitoDeDadosError("E-mail já cadastrado.");
      }
    }

    const { team_ids, ...rest } = data;

    // Monta o UpdateInput sem campos undefined (exactOptionalPropertyTypes).
    const updateData: Prisma.UsersUpdateInput = {
      updated_by_user_id: actor.id,
    };

    if (rest.name !== undefined) updateData.name = rest.name;
    if (rest.email !== undefined) updateData.email = rest.email;
    if (rest.role !== undefined) updateData.role = rest.role;
    if (rest.is_active !== undefined) updateData.is_active = rest.is_active;
    if (rest.phone_1_ddd !== undefined) updateData.phone_1_ddd = rest.phone_1_ddd;
    if (rest.phone_1_number !== undefined) updateData.phone_1_number = rest.phone_1_number;
    if (rest.phone_2_ddd !== undefined) updateData.phone_2_ddd = rest.phone_2_ddd;
    if (rest.phone_2_number !== undefined) updateData.phone_2_number = rest.phone_2_number;
    if (rest.address_street !== undefined) updateData.address_street = rest.address_street;
    if (rest.address_number !== undefined) updateData.address_number = rest.address_number;
    if (rest.address_complement !== undefined) updateData.address_complement = rest.address_complement;
    if (rest.address_neighborhood !== undefined) updateData.address_neighborhood = rest.address_neighborhood;
    if (rest.address_city !== undefined) updateData.address_city = rest.address_city;
    if (rest.address_state !== undefined) updateData.address_state = rest.address_state;
    if (rest.address_zip !== undefined) updateData.address_zip = rest.address_zip;

    return this.repo.update({
      id,
      data: updateData,
      // Spread condicional: omite a propriedade inteiramente quando undefined,
      // satisfazendo exactOptionalPropertyTypes (team_ids?: string[] não aceita undefined explícito).
      ...(team_ids !== undefined && { team_ids }),
      actorId: actor.id,
    });
  }

  // ─── UPDATE SELF ──────────────────────────────────
  // Qualquer autenticado edita o próprio /:id.
  // Campos proibidos (role, is_active, team_ids) não existem no UpdateSelfDTO,
  // então nunca chegam aqui — o schema Zod já os exclui no controller.
  // Para troca de senha exige confirmação da senha atual.
  async updateSelf(data: UpdateSelfDTO, actor: ActorContext): Promise<SafeUser> {
    const target = await this.repo.findByIdWithPassword(actor.id);
    if (!target) {
      throw new RecursoNaoEncontradoError("Usuário autenticado não encontrado.");
    }

    if (data.email !== undefined && data.email !== target.email) {
      const emailInUse = await this.repo.findByEmail(data.email);
      if (emailInUse) {
        throw new ConflitoDeDadosError("E-mail já cadastrado.");
      }
    }

    // Monta o UpdateInput com tipagem Prisma — sem Record<string, unknown>.
    const updateData: Prisma.UsersUpdateInput = {
      updated_by_user_id: actor.id,
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone_1_ddd !== undefined) updateData.phone_1_ddd = data.phone_1_ddd;
    if (data.phone_1_number !== undefined) updateData.phone_1_number = data.phone_1_number;
    if (data.phone_2_ddd !== undefined) updateData.phone_2_ddd = data.phone_2_ddd;
    if (data.phone_2_number !== undefined) updateData.phone_2_number = data.phone_2_number;
    if (data.address_street !== undefined) updateData.address_street = data.address_street;
    if (data.address_number !== undefined) updateData.address_number = data.address_number;
    if (data.address_complement !== undefined) updateData.address_complement = data.address_complement;
    if (data.address_neighborhood !== undefined) updateData.address_neighborhood = data.address_neighborhood;
    if (data.address_city !== undefined) updateData.address_city = data.address_city;
    if (data.address_state !== undefined) updateData.address_state = data.address_state;
    if (data.address_zip !== undefined) updateData.address_zip = data.address_zip;

    // Troca de senha
    if (data.new_password) {
      if (!data.current_password) {
        throw new RequisicaoInvalidaError(
          "É necessário informar a senha atual para alterá-la."
        );
      }
      const matches = await bcrypt.compare(
        data.current_password,
        target.password_hash
      );
      if (!matches) {
        throw new RequisicaoInvalidaError("Senha atual incorreta.");
      }
      if (data.current_password === data.new_password) {
        throw new BusinessRuleError(
          "A nova senha deve ser diferente da senha atual."
        );
      }
      updateData.password_hash = await bcrypt.hash(
        data.new_password,
        BCRYPT_ROUNDS
      );
    }

    return this.repo.update({
      id: actor.id,
      data: updateData,
      actorId: actor.id,
    });
  }

  // ─── SOFT DELETE ──────────────────────────────────
  // Somente ADMIN. Não permite autodesativação.
  async softDelete(id: string, actor: ActorContext): Promise<void> {
    if (actor.role !== "ADMIN") {
      throw new AcessoNaoAutorizadoError(
        "Apenas administradores podem desativar usuários."
      );
    }
    if (actor.id === id) {
      throw new BusinessRuleError("Você não pode desativar o próprio usuário.");
    }

    const target = await this.repo.findById(id);
    if (!target) {
      throw new RecursoNaoEncontradoError("Usuário não encontrado.");
    }
    if (!target.is_active) {
      throw new BusinessRuleError("Usuário já está inativo.");
    }

    await this.repo.softDelete({ id, actorId: actor.id });
  }

  // ─── HARD DELETE ──────────────────────────────────
  // Somente ADMIN. Exclusão física — o schema propaga:
  //   UserTeams     → onDelete: Cascade   (apagados junto)
  //   Leads         → attendant_id: SetNull
  //   Negotiations  → attendant_id: SetNull
  //   SystemLogs    → user_id: SetNull
  // Não há FK com Restrict em Users, então o Prisma não vai rejeitar.
  async hardDelete(id: string, actor: ActorContext): Promise<void> {
    if (actor.role !== "ADMIN") {
      throw new AcessoNaoAutorizadoError(
        "Apenas administradores podem excluir usuários permanentemente."
      );
    }
    if (actor.id === id) {
      throw new BusinessRuleError(
        "Você não pode excluir permanentemente o próprio usuário."
      );
    }

    const target = await this.repo.findById(id);
    if (!target) {
      throw new RecursoNaoEncontradoError("Usuário não encontrado.");
    }

    await this.repo.hardDelete(id);
  }
}