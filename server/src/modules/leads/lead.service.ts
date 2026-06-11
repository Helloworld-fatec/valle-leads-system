// src/modules/leads/lead.service.ts
import { Prisma } from "../../config/prisma.js";
import {
  LeadsRepository,
  type LeadWithIncludes,
  type LeadWithNegotiations,
  type PaginatedLeads,
} from "./lead.repository.js";
import { CustomersRepository } from "../customers/customer.repository.js";
import { InterestItemsRepository } from "../interest-items/item.repository.js";
import type {
  CreateLeadDTO,
  UpdateLeadDTO,
  QueryLeadDTO,
  BulkAssignAttendantDTO,
  BulkAssignTeamDTO,
} from "./lead.dtos.js";
import {
  RecursoNaoEncontradoError,
  RequisicaoInvalidaError,
  AcessoNaoAutorizadoError,
  BusinessRuleError,
} from "../../middlewares/errors/domainErrors.middleware.js";

export type LeadActorRole =
  | "ATTENDANT"
  | "MANAGER"
  | "GENERAL_MANAGER"
  | "ADMIN";

export interface ActorContext {
  id: string;
  role: LeadActorRole;
  team_ids: string[];
}

function canSeeInactive(role: LeadActorRole): boolean {
  return role === "GENERAL_MANAGER" || role === "ADMIN";
}
function canReactivate(role: LeadActorRole): boolean {
  return role === "GENERAL_MANAGER" || role === "ADMIN";
}
function canMoveBetweenTeams(role: LeadActorRole): boolean {
  return role === "GENERAL_MANAGER" || role === "ADMIN";
}
function canBulkAssignAttendant(role: LeadActorRole): boolean {
  return role === "MANAGER" || role === "ADMIN";
}
function canBulkAssignTeam(role: LeadActorRole): boolean {
  return role === "GENERAL_MANAGER" || role === "ADMIN";
}

interface LeadScopeFields {
  attendant_id: string | null;
  team_id: string | null;
  is_active: boolean;
}

export class LeadsService {
  private leadsRepository = new LeadsRepository();

  // ──────────────────────────────────────────────────────
  // LISTAGEM
  // ──────────────────────────────────────────────────────
  async findAll(
    filters: QueryLeadDTO,
    actor: ActorContext
  ): Promise<PaginatedLeads> {
    if (actor.role === "ATTENDANT") {
      return this.leadsRepository.findAll({
        ...filters,
        attendant_id_scope: actor.id,
        force_active_only: true,
      });
    }

    if (actor.role === "MANAGER") {
      if (actor.team_ids.length === 0) {
        return { data: [], total: 0, page: filters.page, limit: filters.limit };
      }
      return this.leadsRepository.findAll({
        ...filters,
        team_ids_scope: actor.team_ids,
        force_active_only: true,
      });
    }

    // GENERAL_MANAGER e ADMIN
    return this.leadsRepository.findAll({
      ...filters,
      force_active_only: false,
    });
  }

  // ──────────────────────────────────────────────────────
  // LEITURA POR ID
  // ──────────────────────────────────────────────────────
  async findById(
    id: string,
    actor: ActorContext
  ): Promise<LeadWithNegotiations> {
    const lead = await this.leadsRepository.findById(id);
    if (!lead) {
      throw new RecursoNaoEncontradoError("Lead não encontrado.");
    }
    if (!lead.is_active && !canSeeInactive(actor.role)) {
      throw new RecursoNaoEncontradoError("Lead não encontrado.");
    }
    this.assertCanRead(lead, actor);
    return lead;
  }

  // ──────────────────────────────────────────────────────
  // CRIAÇÃO
  // ──────────────────────────────────────────────────────
  // ATTENDANT  → team_id obrigatório, pertencente ao seu escopo;
  //              attendant_id forçado para si mesmo.
  // MANAGER    → team_id obrigatório, pertencente ao seu escopo;
  //              sem attendant_id (lead fica solto na equipe).
  // GM / ADMIN → team_id OPCIONAL (lead pode ficar solto no sistema);
  //              sem attendant_id obrigatório.
  async create(
    data: CreateLeadDTO,
    actor: ActorContext
  ): Promise<LeadWithIncludes> {
    const normalized: CreateLeadDTO = { ...data };

    if (actor.role === "ATTENDANT") {
      if (data.attendant_id && data.attendant_id !== actor.id) {
        throw new AcessoNaoAutorizadoError(
          "Atendentes só podem criar leads sob sua própria responsabilidade."
        );
      }
      normalized.attendant_id = actor.id;

      if (!data.team_id) {
        throw new RequisicaoInvalidaError(
          "Atendentes precisam informar o time ao criar um lead."
        );
      }
      if (!actor.team_ids.includes(data.team_id)) {
        throw new AcessoNaoAutorizadoError(
          "Você só pode criar leads em times aos quais pertence."
        );
      }
    } else if (actor.role === "MANAGER") {
      if (!data.team_id) {
        throw new RequisicaoInvalidaError(
          "Gerentes precisam informar o time ao criar um lead."
        );
      }
      if (!actor.team_ids.includes(data.team_id)) {
        throw new AcessoNaoAutorizadoError(
          "Você só pode criar leads nos times que gerencia."
        );
      }
      if (data.attendant_id) {
        await this.assertAttendantBelongsToTeam(
          data.attendant_id,
          data.team_id
        );
      }
    } else {
      // GENERAL_MANAGER ou ADMIN — team_id é opcional.
      // Se informou atendente E equipe, valida coerência.
      if (data.attendant_id && data.team_id) {
        await this.assertAttendantBelongsToTeam(
          data.attendant_id,
          data.team_id
        );
      }
    }

    // Valida equipe apenas se foi informada.
    if (normalized.team_id) {
      await this.assertTeamExistsAndActive(normalized.team_id);
    }
    await this.assertCustomerExistsAndActive(normalized.customer_id);
    if (normalized.interest_item_id) {
      await this.assertInterestItemExistsAndActive(normalized.interest_item_id);
    }

    return this.leadsRepository.create({
      dto: normalized,
      actorId: actor.id,
    });
  }

  // ──────────────────────────────────────────────────────
  // ATUALIZAÇÃO
  // ──────────────────────────────────────────────────────
  async update(
    id: string,
    data: UpdateLeadDTO,
    actor: ActorContext
  ): Promise<LeadWithIncludes> {
    const lead = await this.leadsRepository.findById(id);
    if (!lead) {
      throw new RecursoNaoEncontradoError("Lead não encontrado.");
    }
    if (!lead.is_active && !canSeeInactive(actor.role)) {
      throw new RecursoNaoEncontradoError("Lead não encontrado.");
    }

    this.assertCanWrite(lead, actor);

    if (data.is_active === true && !canReactivate(actor.role)) {
      throw new AcessoNaoAutorizadoError(
        "Apenas gerente geral ou administrador podem reativar leads."
      );
    }
    if (data.team_id !== undefined && !canMoveBetweenTeams(actor.role)) {
      throw new AcessoNaoAutorizadoError(
        "Apenas gerente geral ou administrador podem mover leads entre times."
      );
    }

    if (data.attendant_id !== undefined && data.attendant_id !== null) {
      const targetTeamId = data.team_id ?? lead.team_id;

      if (actor.role === "ATTENDANT") {
        if (data.attendant_id !== actor.id) {
          throw new AcessoNaoAutorizadoError(
            "Atendentes só podem atribuir leads a si mesmos."
          );
        }
      } else if (actor.role === "MANAGER") {
        if (!targetTeamId || !actor.team_ids.includes(targetTeamId)) {
          throw new AcessoNaoAutorizadoError(
            "Você só pode atribuir atendentes em times que gerencia."
          );
        }
        if (targetTeamId) {
          await this.assertAttendantBelongsToTeam(data.attendant_id, targetTeamId);
        }
      } else if (targetTeamId) {
        // GM / ADMIN com equipe definida: valida coerência.
        await this.assertAttendantBelongsToTeam(data.attendant_id, targetTeamId);
      }
    }

    if (data.team_id) {
      await this.assertTeamExistsAndActive(data.team_id);
    }
    if (data.interest_item_id) {
      await this.assertInterestItemExistsAndActive(data.interest_item_id);
    }

    return this.leadsRepository.update({
      id,
      dto: data,
      actorId: actor.id,
    });
  }

  // ──────────────────────────────────────────────────────
  // SOFT DELETE
  // ──────────────────────────────────────────────────────
  async softDelete(
    id: string,
    actor: ActorContext
  ): Promise<void> {
    const lead = await this.leadsRepository.findById(id);
    if (!lead) {
      throw new RecursoNaoEncontradoError("Lead não encontrado.");
    }
    if (!lead.is_active && !canSeeInactive(actor.role)) {
      throw new RecursoNaoEncontradoError("Lead não encontrado.");
    }
    if (!lead.is_active) {
      throw new BusinessRuleError("Lead já está inativo.");
    }

    this.assertCanWrite(lead, actor);
    await this.leadsRepository.softDelete({ id, actorId: actor.id });
  }

  // ──────────────────────────────────────────────────────
  // HARD DELETE
  // ──────────────────────────────────────────────────────
  async hardDelete(
    id: string,
    actor: ActorContext
  ): Promise<void> {
    if (actor.role !== "ADMIN") {
      throw new AcessoNaoAutorizadoError(
        "Apenas administradores podem excluir leads permanentemente."
      );
    }
    const lead = await this.leadsRepository.findById(id);
    if (!lead) {
      throw new RecursoNaoEncontradoError("Lead não encontrado.");
    }
    await this.leadsRepository.hardDelete(id);
  }

  // ──────────────────────────────────────────────────────
  // BULK — atribuir atendente
  // ──────────────────────────────────────────────────────
  async bulkAssignAttendant(
    data: BulkAssignAttendantDTO,
    actor: ActorContext
  ): Promise<{ count: number }> {
    if (!canBulkAssignAttendant(actor.role)) {
      throw new AcessoNaoAutorizadoError(
        "Você não tem permissão para atribuir leads em lote a atendentes."
      );
    }

    const leads = await this.leadsRepository.findManyByIds(data.lead_ids);
    if (leads.length !== data.lead_ids.length) {
      throw new RecursoNaoEncontradoError(
        "Um ou mais leads informados não foram encontrados."
      );
    }

    if (leads.some((l) => l.team_id === null)) {
      throw new RequisicaoInvalidaError(
        "Há leads sem time definido; defina o time antes de atribuir um atendente."
      );
    }

    const teamsInBatch = new Set(
      leads.map((l) => l.team_id).filter((t): t is string => t !== null)
    );

    if (actor.role === "MANAGER") {
      for (const teamId of teamsInBatch) {
        if (!actor.team_ids.includes(teamId)) {
          throw new AcessoNaoAutorizadoError(
            "Há leads fora dos times que você gerencia."
          );
        }
      }
    }

    const attendant = await this.leadsRepository.findAttendantForValidation(
      data.attendant_id
    );
    if (!attendant) {
      throw new RecursoNaoEncontradoError("Atendente não encontrado.");
    }
    if (!attendant.is_active) {
      throw new RequisicaoInvalidaError("O atendente informado está inativo.");
    }
    if (attendant.role !== "ATTENDANT") {
      throw new RequisicaoInvalidaError(
        "O usuário informado não é um atendente."
      );
    }

    const attendantTeamIds = new Set(
      attendant.user_teams.map((ut) => ut.team_id)
    );
    for (const teamId of teamsInBatch) {
      if (!attendantTeamIds.has(teamId)) {
        throw new RequisicaoInvalidaError(
          "O atendente informado não pertence a todos os times dos leads selecionados."
        );
      }
    }

    return this.leadsRepository.bulkAssignAttendant({
      leadIds: data.lead_ids,
      attendantId: data.attendant_id,
      actorId: actor.id,
    });
  }

  // ──────────────────────────────────────────────────────
  // BULK — atribuir equipe
  // ──────────────────────────────────────────────────────
  async bulkAssignTeam(
    data: BulkAssignTeamDTO,
    actor: ActorContext
  ): Promise<{ count: number }> {
    if (!canBulkAssignTeam(actor.role)) {
      throw new AcessoNaoAutorizadoError(
        "Você não tem permissão para transferir leads entre times."
      );
    }

    const leads = await this.leadsRepository.findManyByIds(data.lead_ids);
    if (leads.length !== data.lead_ids.length) {
      throw new RecursoNaoEncontradoError(
        "Um ou mais leads informados não foram encontrados."
      );
    }

    await this.assertTeamExistsAndActive(data.team_id);

    return this.leadsRepository.bulkAssignTeam({
      leadIds: data.lead_ids,
      teamId: data.team_id,
      actorId: actor.id,
    });
  }

  // ──────────────────────────────────────────────────────
  // GUARDS DE RBAC
  // ──────────────────────────────────────────────────────

  private assertCanRead(lead: LeadScopeFields, actor: ActorContext): void {
    if (actor.role === "ADMIN" || actor.role === "GENERAL_MANAGER") return;

    if (actor.role === "MANAGER") {
      if (lead.team_id === null || !actor.team_ids.includes(lead.team_id)) {
        throw new AcessoNaoAutorizadoError(
          "Você só pode visualizar leads dos times que gerencia."
        );
      }
      return;
    }

    if (lead.attendant_id !== actor.id) {
      throw new AcessoNaoAutorizadoError(
        "Você só pode visualizar os seus próprios leads."
      );
    }
  }

  private assertCanWrite(lead: LeadScopeFields, actor: ActorContext): void {
    if (actor.role === "ADMIN" || actor.role === "GENERAL_MANAGER") return;

    if (actor.role === "MANAGER") {
      if (lead.team_id === null || !actor.team_ids.includes(lead.team_id)) {
        throw new AcessoNaoAutorizadoError(
          "Você só pode editar leads dos times que gerencia."
        );
      }
      return;
    }

    if (lead.attendant_id !== actor.id) {
      throw new AcessoNaoAutorizadoError(
        "Você só pode editar os seus próprios leads."
      );
    }
  }

  // ──────────────────────────────────────────────────────
  // VALIDAÇÕES DE ENTIDADES REFERENCIADAS
  // ──────────────────────────────────────────────────────

  private async assertTeamExistsAndActive(teamId: string): Promise<void> {
    const team = await this.leadsRepository.findTeamForValidation(teamId);
    if (!team) {
      throw new RecursoNaoEncontradoError("Time não encontrado.");
    }
    if (!team.is_active) {
      throw new RequisicaoInvalidaError(
        "Não é possível vincular um lead a um time inativo."
      );
    }
  }

  private async assertCustomerExistsAndActive(
    customerId: string
  ): Promise<void> {
    const customer = await CustomersRepository.findById(customerId);
    if (!customer) {
      throw new RecursoNaoEncontradoError("Cliente não encontrado.");
    }
    if (!customer.is_active) {
      throw new RequisicaoInvalidaError(
        "Não é possível criar um lead para um cliente inativo."
      );
    }
  }

  private async assertInterestItemExistsAndActive(
    itemId: string
  ): Promise<void> {
    const item = await InterestItemsRepository.findById(itemId);
    if (!item) {
      throw new RecursoNaoEncontradoError("Item de interesse não encontrado.");
    }
    if (!item.is_active) {
      throw new RequisicaoInvalidaError(
        "Não é possível vincular um item de interesse inativo ao lead."
      );
    }
  }

  private async assertAttendantBelongsToTeam(
    attendantId: string,
    teamId: string
  ): Promise<void> {
    const attendant = await this.leadsRepository.findAttendantForValidation(
      attendantId
    );
    if (!attendant) {
      throw new RecursoNaoEncontradoError("Atendente não encontrado.");
    }
    if (!attendant.is_active) {
      throw new RequisicaoInvalidaError("O atendente informado está inativo.");
    }
    if (attendant.role !== "ATTENDANT") {
      throw new RequisicaoInvalidaError(
        "O usuário informado não é um atendente."
      );
    }
    const teams = attendant.user_teams.map((ut) => ut.team_id);
    if (!teams.includes(teamId)) {
      throw new RequisicaoInvalidaError(
        "O atendente informado não pertence ao time deste lead."
      );
    }
  }
}