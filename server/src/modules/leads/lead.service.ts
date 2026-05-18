// src/modules/leads/lead.service.ts
import { LeadsRepository } from "./lead.repository.js";
import { CustomersRepository } from "../customers/customer.repository.js";
import { InterestItemsRepository } from "../interest-items/item.repository.js";
import type { CreateLeadDTO, UpdateLeadDTO, QueryLeadDTO } from "./lead.dtos.js";
import {
  RecursoNaoEncontradoError,
  RequisicaoInvalidaError,
  AcessoNaoAutorizadoError,
  BusinessRuleError,
} from "../../middlewares/errors/domainErrors.middleware.js";

// ─────────────────────────────────────────────
// LEADS SERVICE
// ─────────────────────────────────────────────
// Regras de negócio e RBAC do módulo de leads.
//
// MATRIZ DE PERMISSÕES (RF02):
//                         | Lista | Lê | Cria | Edita | Soft-delete
//   ATTENDANT             |   ✓*  |  ✓*|  ✓** |  ✓*   |     ✗
//   MANAGER               |   ✓+  |  ✓+|  ✓+  |  ✓+   |     ✗ (gerente não exclui)
//   GENERAL_MANAGER       |   ✓   |  ✓ |  ✗   |  ✗    |     ✗
//   ADMIN                 |   ✓   |  ✓ |  ✓   |  ✓    |     ✓
//
//   *  apenas os próprios leads (attendant_id === actor.id)
//   ** force attendant_id = actor.id e team_id ∈ actor.team_ids
//   +  apenas leads cujo team_id ∈ actor.team_ids
//
// Recebe ActorContext (id + role + team_ids) injetado pelo controller a
// partir de req.user. Esse contexto é usado para:
//   - Aplicar RBAC granular
//   - Preencher created_by_user_id / updated_by_user_id (auditoria)
//   - Filtrar listagens por escopo
// ─────────────────────────────────────────────

export interface ActorContext {
  id: string;
  role: "ATTENDANT" | "MANAGER" | "GENERAL_MANAGER" | "ADMIN";
  team_ids: string[];
}

export class LeadsService {
  private leadsRepository = new LeadsRepository();

  // ─── LIST ────────────────────────────────────────────
  async findAll(filters: QueryLeadDTO, actor: ActorContext) {
    // Constrói o escopo de leitura conforme o role
    let attendant_id_scope: string | undefined;
    let team_ids_scope: string[] | undefined;

    switch (actor.role) {
      case "ATTENDANT":
        attendant_id_scope = actor.id;
        break;
      case "MANAGER":
        if (actor.team_ids.length === 0) {
          // Manager sem times ativos → não vê nada
          return { data: [], total: 0, page: filters.page ?? 1, limit: filters.limit ?? 20 };
        }
        team_ids_scope = actor.team_ids;
        break;
      case "GENERAL_MANAGER":
      case "ADMIN":
        // sem escopo — visão global
        break;
    }

    return this.leadsRepository.findAll({
      ...filters,
      attendant_id_scope,
      team_ids_scope,
    });
  }

  // ─── READ ────────────────────────────────────────────
  async findById(id: string, actor: ActorContext) {
    const lead = await this.leadsRepository.findById(id);
    if (!lead) {
      throw new RecursoNaoEncontradoError("Lead não encontrado.");
    }

    this.assertCanRead(lead, actor);
    return lead;
  }

  // ─── CREATE ──────────────────────────────────────────
  async create(data: CreateLeadDTO, actor: ActorContext) {
    // GENERAL_MANAGER não cria
    if (actor.role === "GENERAL_MANAGER") {
      throw new AcessoNaoAutorizadoError(
        "Gerente geral não tem permissão para criar leads."
      );
    }

    // Normaliza o DTO conforme o role
    const normalized: CreateLeadDTO = { ...data };

    if (actor.role === "ATTENDANT") {
      // Atendente só cria leads sob sua responsabilidade, no próprio time
      if (data.attendant_id && data.attendant_id !== actor.id) {
        throw new AcessoNaoAutorizadoError(
          "Atendentes só podem criar leads sob sua própria responsabilidade."
        );
      }
      normalized.attendant_id = actor.id;

      if (!actor.team_ids.includes(data.team_id)) {
        throw new AcessoNaoAutorizadoError(
          "Você só pode criar leads em times aos quais pertence."
        );
      }
    } else if (actor.role === "MANAGER") {
      // Manager cria leads no escopo dos próprios times
      if (!actor.team_ids.includes(data.team_id)) {
        throw new AcessoNaoAutorizadoError(
          "Você só pode criar leads nos times que gerencia."
        );
      }
      // Se atribuiu atendente, valida que pertence ao mesmo time
      if (data.attendant_id) {
        await this.assertAttendantBelongsToTeam(data.attendant_id, data.team_id);
      }
    } else if (actor.role === "ADMIN") {
      // Admin pode tudo — mas se atribuiu atendente, valida coerência
      if (data.attendant_id) {
        await this.assertAttendantBelongsToTeam(data.attendant_id, data.team_id);
      }
    }

    // Validações de entidades referenciadas (independem do role)
    await this.assertTeamExistsAndActive(normalized.team_id);
    await this.assertCustomerExistsAndActive(normalized.customer_id);
    if (normalized.interest_item_id) {
      await this.assertInterestItemExistsAndActive(normalized.interest_item_id);
    }

    return this.leadsRepository.create({
      dto: normalized,
      actorId: actor.id,
    });
  }

  // ─── UPDATE ──────────────────────────────────────────
  async update(id: string, data: UpdateLeadDTO, actor: ActorContext) {
    if (actor.role === "GENERAL_MANAGER") {
      throw new AcessoNaoAutorizadoError(
        "Gerente geral não tem permissão para editar leads."
      );
    }

    const lead = await this.leadsRepository.findById(id);
    if (!lead) {
      throw new RecursoNaoEncontradoError("Lead não encontrado.");
    }

    this.assertCanWrite(lead, actor);

    // ATTENDANT não pode reatribuir o lead pra outro atendente
    if (actor.role === "ATTENDANT" && data.attendant_id !== undefined) {
      if (data.attendant_id !== actor.id) {
        throw new AcessoNaoAutorizadoError(
          "Atendentes não podem reatribuir leads a outros usuários."
        );
      }
    }

    // Se MANAGER ou ADMIN reatribuiu, valida que o novo atendente pertence ao time
    if (
      data.attendant_id !== undefined &&
      data.attendant_id !== null &&
      (actor.role === "MANAGER" || actor.role === "ADMIN")
    ) {
      await this.assertAttendantBelongsToTeam(data.attendant_id, lead.team_id);
    }

    // Se trocou o item de interesse, valida
    if (data.interest_item_id) {
      await this.assertInterestItemExistsAndActive(data.interest_item_id);
    }

    return this.leadsRepository.update({
      id,
      dto: data,
      actorId: actor.id,
    });
  }

  // ─── SOFT DELETE ─────────────────────────────────────
  async softDelete(id: string, actor: ActorContext) {
    // Apenas ADMIN pode excluir leads (RF02 — listado explicitamente)
    if (actor.role !== "ADMIN") {
      throw new AcessoNaoAutorizadoError(
        "Apenas administradores podem excluir leads."
      );
    }

    const lead = await this.leadsRepository.findById(id);
    if (!lead) {
      throw new RecursoNaoEncontradoError("Lead não encontrado.");
    }
    if (!lead.is_active) {
      throw new BusinessRuleError("Lead já está inativo.");
    }

    return this.leadsRepository.softDelete({ id, actorId: actor.id });
  }

  // ─────────────────────────────────────────────
  // GUARDS DE RBAC (sobre um lead já carregado)
  // ─────────────────────────────────────────────

  private assertCanRead(
    lead: { attendant_id: string | null; team_id: string },
    actor: ActorContext
  ) {
    if (actor.role === "ADMIN" || actor.role === "GENERAL_MANAGER") return;

    if (actor.role === "MANAGER") {
      if (!actor.team_ids.includes(lead.team_id)) {
        throw new AcessoNaoAutorizadoError(
          "Você só pode visualizar leads dos times que gerencia."
        );
      }
      return;
    }

    // ATTENDANT
    if (lead.attendant_id !== actor.id) {
      throw new AcessoNaoAutorizadoError(
        "Você só pode visualizar os seus próprios leads."
      );
    }
  }

  private assertCanWrite(
    lead: { attendant_id: string | null; team_id: string },
    actor: ActorContext
  ) {
    if (actor.role === "ADMIN") return;

    if (actor.role === "MANAGER") {
      if (!actor.team_ids.includes(lead.team_id)) {
        throw new AcessoNaoAutorizadoError(
          "Você só pode editar leads dos times que gerencia."
        );
      }
      return;
    }

    // ATTENDANT
    if (lead.attendant_id !== actor.id) {
      throw new AcessoNaoAutorizadoError(
        "Você só pode editar os seus próprios leads."
      );
    }
  }

  // ─────────────────────────────────────────────
  // VALIDAÇÕES DE ENTIDADES REFERENCIADAS
  // ─────────────────────────────────────────────

  private async assertTeamExistsAndActive(teamId: string) {
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

  private async assertCustomerExistsAndActive(customerId: string) {
    // Mantemos a dependência de CustomersRepository (literal/classe — depende
    // de como esse módulo está hoje). Se for literal, o uso continua igual.
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

  private async assertInterestItemExistsAndActive(itemId: string) {
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

  /**
   * Garante que o atendente existe, está ativo, tem role ATTENDANT
   * e pertence ao time informado.
   */
  private async assertAttendantBelongsToTeam(attendantId: string, teamId: string) {
    const attendant = await this.leadsRepository.findAttendantForValidation(attendantId);
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
