// server/src/modules/users/users.service.ts
import bcrypt from "bcrypt";
import { UsersRepository, type SafeUser } from "./users.repository.js";
import type {
  CreateUserDTO,
  UpdateUserDTO,
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
// Responsabilidade: regras de negócio do módulo de usuários.
// - Faz hash de senha (RNF02)
// - Garante unicidade de e-mail
// - Aplica regras de RBAC (RF02) sobre QUEM pode fazer O QUÊ
// - Lança erros de domínio (interceptados pelo globalErrorHandler — RNF05)
// - Nunca devolve password_hash pro caller
// ─────────────────────────────────────────────

const BCRYPT_ROUNDS = 10;

// Contexto do solicitante — injetado pelo controller a partir do AuthRequest
export interface ActorContext {
  id: string;
  role: UserRole;
}

export class UsersService {
  private usersRepository = new UsersRepository();

  // ─── CREATE ───────────────────────────────────────

  /**
   * Cria um usuário. Apenas ADMIN pode criar usuários de qualquer perfil.
   * MANAGER pode criar apenas ATTENDANTs e somente vinculá-los aos próprios times.
   */
  async create(data: CreateUserDTO, actor: ActorContext): Promise<SafeUser> {
    // RBAC: quem pode criar?
    if (actor.role !== "ADMIN" && actor.role !== "MANAGER") {
      throw new AcessoNaoAutorizadoError(
        "Apenas administradores ou gerentes podem criar usuários."
      );
    }

    if (actor.role === "MANAGER") {
      // Manager só cria atendente
      if (data.role !== "ATTENDANT") {
        throw new AcessoNaoAutorizadoError(
          "Gerentes podem criar apenas atendentes."
        );
      }
      // E só pode vincular aos próprios times
      if (data.team_ids && data.team_ids.length > 0) {
        const managerTeams = await this.usersRepository.findActiveTeamIds(actor.id);
        const invalid = data.team_ids.filter((id) => !managerTeams.includes(id));
        if (invalid.length > 0) {
          throw new AcessoNaoAutorizadoError(
            "Você só pode vincular atendentes aos times que gerencia."
          );
        }
      }
    }

    // Unicidade de e-mail
    const existing = await this.usersRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflitoDeDadosError("E-mail já cadastrado.");
    }

    // Hash da senha
    const password_hash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);

    // Monta o payload Prisma (separa team_ids e password do resto)
    const { password, team_ids, ...rest } = data;

    return this.usersRepository.create({
      data: {
        ...rest,
        password_hash,
        created_by_user_id: actor.id,
        updated_by_user_id: actor.id,
      },
      team_ids,
      actorId: actor.id,
    });
  }

  // ─── READ ─────────────────────────────────────────

  /**
   * Lista usuários respeitando o escopo do solicitante:
   *   - ADMIN / GENERAL_MANAGER: vê todos
   *   - MANAGER: vê apenas usuários dos próprios times
   *   - ATTENDANT: não pode listar usuários
   */
  async findAll(filters: ListUsersQueryDTO, actor: ActorContext) {
    if (actor.role === "ATTENDANT") {
      throw new AcessoNaoAutorizadoError(
        "Atendentes não podem listar usuários."
      );
    }

    let team_ids_scope: string[] | undefined;
    if (actor.role === "MANAGER") {
      team_ids_scope = await this.usersRepository.findActiveTeamIds(actor.id);
      // Se o manager não está em nenhum time, lista vazia
      if (team_ids_scope.length === 0) {
        return { data: [], total: 0, page: filters.page, pageSize: filters.pageSize };
      }
    }

    const { data, total } = await this.usersRepository.findMany({
      ...filters,
      team_ids_scope,
    });

    return { data, total, page: filters.page, pageSize: filters.pageSize };
  }

  /**
   * Busca por ID respeitando escopo:
   *   - ADMIN / GENERAL_MANAGER: qualquer um
   *   - MANAGER: apenas usuários que dividem time com ele
   *   - ATTENDANT: apenas o próprio cadastro
   */
  async findById(id: string, actor: ActorContext): Promise<SafeUser> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new RecursoNaoEncontradoError("Usuário não encontrado.");
    }

    if (actor.role === "ATTENDANT" && actor.id !== id) {
      throw new AcessoNaoAutorizadoError(
        "Você só pode visualizar o seu próprio cadastro."
      );
    }

    if (actor.role === "MANAGER" && actor.id !== id) {
      const managerTeams = await this.usersRepository.findActiveTeamIds(actor.id);
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

  /**
   * Retorna o cadastro do próprio solicitante (rota GET /me).
   */
  async findMe(actor: ActorContext): Promise<SafeUser> {
    const user = await this.usersRepository.findById(actor.id);
    if (!user) {
      throw new RecursoNaoEncontradoError("Usuário autenticado não encontrado.");
    }
    return user;
  }

  // ─── UPDATE ───────────────────────────────────────

  /**
   * Atualiza dados administrativos de um usuário (role, times, ativação, perfil).
   * Apenas ADMIN tem acesso total. MANAGER pode editar atendentes do próprio time
   * (sem alterar role nem retirar do escopo).
   */
  async update(
    id: string,
    data: UpdateUserDTO,
    actor: ActorContext
  ): Promise<SafeUser> {
    const target = await this.usersRepository.findById(id);
    if (!target) {
      throw new RecursoNaoEncontradoError("Usuário não encontrado.");
    }

    // RBAC
    if (actor.role !== "ADMIN" && actor.role !== "MANAGER") {
      throw new AcessoNaoAutorizadoError(
        "Apenas administradores ou gerentes podem editar usuários."
      );
    }

    if (actor.role === "MANAGER") {
      // Manager não pode alterar role
      if (data.role !== undefined) {
        throw new AcessoNaoAutorizadoError(
          "Gerentes não podem alterar o perfil de acesso."
        );
      }
      // Manager só edita atendente do próprio time
      if (target.role !== "ATTENDANT") {
        throw new AcessoNaoAutorizadoError(
          "Gerentes só podem editar usuários do tipo atendente."
        );
      }
      const managerTeams = await this.usersRepository.findActiveTeamIds(actor.id);
      const targetTeams = target.user_teams.map((ut) => ut.team_id);
      const sharesTeam = targetTeams.some((t) => managerTeams.includes(t));
      if (!sharesTeam) {
        throw new AcessoNaoAutorizadoError(
          "Você só pode editar usuários dos seus times."
        );
      }
      // Se vier team_ids, valida que todos estão entre os times do manager
      if (data.team_ids) {
        const invalid = data.team_ids.filter((t) => !managerTeams.includes(t));
        if (invalid.length > 0) {
          throw new AcessoNaoAutorizadoError(
            "Você só pode vincular usuários aos times que gerencia."
          );
        }
      }
    }

    // Se o e-mail foi alterado, valida unicidade
    if (data.email && data.email !== target.email) {
      const emailInUse = await this.usersRepository.findByEmail(data.email);
      if (emailInUse) {
        throw new ConflitoDeDadosError("E-mail já cadastrado.");
      }
    }

    const { team_ids, ...rest } = data;

    return this.usersRepository.update({
      id,
      data: {
        ...rest,
        updated_by_user_id: actor.id,
      },
      team_ids,
      actorId: actor.id,
    });
  }

  /**
   * Atualização do próprio perfil (RF01).
   * Permite mudar nome, e-mail, telefones, endereço e senha (com confirmação da atual).
   * NÃO permite mudar role, is_active nem team_ids.
   */
  async updateSelf(data: UpdateSelfDTO, actor: ActorContext): Promise<SafeUser> {
    const target = await this.usersRepository.findByIdWithPassword(actor.id);
    if (!target) {
      throw new RecursoNaoEncontradoError("Usuário autenticado não encontrado.");
    }

    const updateData: Record<string, unknown> = {};

    // Campos simples
    if (data.name !== undefined) updateData.name = data.name;
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

    // E-mail (com unicidade)
    if (data.email && data.email !== target.email) {
      const emailInUse = await this.usersRepository.findByEmail(data.email);
      if (emailInUse) {
        throw new ConflitoDeDadosError("E-mail já cadastrado.");
      }
      updateData.email = data.email;
    }

    // Senha — exige senha atual
    if (data.new_password) {
      if (!data.current_password) {
        throw new RequisicaoInvalidaError(
          "É necessário informar a senha atual para alterá-la."
        );
      }
      const matches = await bcrypt.compare(data.current_password, target.password_hash);
      if (!matches) {
        throw new RequisicaoInvalidaError("Senha atual incorreta.");
      }
      if (data.current_password === data.new_password) {
        throw new BusinessRuleError(
          "A nova senha deve ser diferente da senha atual."
        );
      }
      updateData.password_hash = await bcrypt.hash(data.new_password, BCRYPT_ROUNDS);
    }

    if (Object.keys(updateData).length === 0) {
      throw new RequisicaoInvalidaError("Nenhuma alteração válida foi enviada.");
    }

    updateData.updated_by_user_id = actor.id;

    return this.usersRepository.update({
      id: actor.id,
      data: updateData,
      actorId: actor.id,
    });
  }

  // ─── DELETE ───────────────────────────────────────

  /**
   * Soft delete. Apenas ADMIN pode desativar usuários.
   * Não permite que o usuário se autodesative (regra de negócio).
   */
  async softDelete(id: string, actor: ActorContext): Promise<void> {
    if (actor.role !== "ADMIN") {
      throw new AcessoNaoAutorizadoError(
        "Apenas administradores podem excluir usuários."
      );
    }
    if (id === actor.id) {
      throw new BusinessRuleError(
        "Você não pode excluir o próprio usuário."
      );
    }

    const target = await this.usersRepository.findById(id);
    if (!target) {
      throw new RecursoNaoEncontradoError("Usuário não encontrado.");
    }
    if (!target.is_active) {
      throw new BusinessRuleError("Usuário já está inativo.");
    }

    await this.usersRepository.softDelete({ id, actorId: actor.id });
  }
}
