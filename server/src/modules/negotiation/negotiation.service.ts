// server/src/modules/negotiation/negotiation.service.ts
import {
  NegotiationsRepository,
  type NegotiationDetail,
  type PaginatedNegotiations,
  type NegotiationScopeRow,
} from "./negotiation.repository.js";
import type {
  CreateNegotiationDTO,
  UpdateNegotiationDTO,
  QueryNegotiationDTO,
  BulkAssignAttendantDTO,
  BulkAssignTeamDTO,
} from "./negotiation.dto.js";
import {
  RecursoNaoEncontradoError,
  RequisicaoInvalidaError,
  AcessoNaoAutorizadoError,
  BusinessRuleError,
} from "../../middlewares/errors/domainErrors.middleware.js";

// Roles aceitos. Definidos localmente para não acoplar a camada de domínio
// ao middleware de auth — os valores são idênticos aos do JWT.
export type NegotiationActorRole =
  | "ATTENDANT"
  | "MANAGER"
  | "GENERAL_MANAGER"
  | "ADMIN";

// Contexto do solicitante, vindo do controller a partir de req.user.
export interface ActorContext {
  id: string;
  role: NegotiationActorRole;
  team_ids: string[];
}

// Helpers de comparação — legibilidade nos guards.
function canMoveBetweenTeams(role: NegotiationActorRole): boolean {
  return role === "GENERAL_MANAGER" || role === "ADMIN";
}
function canBulkAssignAttendant(role: NegotiationActorRole): boolean {
  return role === "MANAGER" || role === "ADMIN";
}
function canBulkAssignTeam(role: NegotiationActorRole): boolean {
  return role === "GENERAL_MANAGER" || role === "ADMIN";
}

// Shape mínimo necessário para os guards de escopo decidirem.
// Compatível tanto com NegotiationDetail quanto com NegotiationScopeRow.
interface NegotiationScopeFields {
  team_id: string;
  attendant_id: string | null;
}

export class NegotiationsService {
  private negotiationsRepository = new NegotiationsRepository();

  // ──────────────────────────────────────────────────────
  // LISTAGEM
  // ──────────────────────────────────────────────────────
  // Aplica o escopo conforme o role. Branches separadas para satisfazer
  // exactOptionalPropertyTypes: cada chamada inclui apenas as propriedades
  // de escopo que têm valor concreto, nunca passando `undefined` explícito
  // para um campo declarado como opcional (?: string vs ?: string | undefined).
  async findAll(
    filters: QueryNegotiationDTO,
    actor: ActorContext
  ): Promise<PaginatedNegotiations> {
    if (actor.role === "ATTENDANT") {
      return this.negotiationsRepository.findAll({
        ...filters,
        attendant_id_scope: actor.id,
      });
    }

    if (actor.role === "MANAGER") {
      if (actor.team_ids.length === 0) {
        return {
          data: [],
          total: 0,
          page: filters.page,
          limit: filters.limit,
        };
      }

      return this.negotiationsRepository.findAll({
        ...filters,
        team_ids_scope: actor.team_ids,
      });
    }

    // GENERAL_MANAGER e ADMIN: sem restrição de escopo.
    return this.negotiationsRepository.findAll({ ...filters });
  }

  // ──────────────────────────────────────────────────────
  // LEITURA POR ID
  // ──────────────────────────────────────────────────────
  async findById(
    id: string,
    actor: ActorContext
  ): Promise<NegotiationDetail> {
    const negotiation = await this.negotiationsRepository.findById(id);
    if (!negotiation) {
      throw new RecursoNaoEncontradoError("Negociação não encontrada.");
    }

    this.assertCanRead(negotiation, actor);
    return negotiation;
  }

  // ──────────────────────────────────────────────────────
  // CRIAÇÃO
  // ──────────────────────────────────────────────────────
  // A negociação herda team/customer/attendant do lead se não vierem no body.
  // Validações em camadas:
  //   1. Lead existe e está ativo
  //   2. Lead tem team_id e customer_id (campos nullable no schema)
  //   3. RBAC: o actor pode operar sobre esse lead
  //   4. RF03: lead não tem outra negociação ATIVA
  //   5. Coerência de team/customer/attendant se foram passados explicitamente
  //   6. Cria com transação (negociação + 3 históricos iniciais)
  async create(
    data: CreateNegotiationDTO,
    actor: ActorContext
  ): Promise<NegotiationDetail> {
    // 1. Carrega o lead — ele dita os defaults da negociação
    const lead = await this.negotiationsRepository.findLeadForValidation(
      data.lead_id
    );
    if (!lead) {
      throw new RecursoNaoEncontradoError("Lead não encontrado.");
    }
    if (!lead.is_active) {
      throw new RequisicaoInvalidaError(
        "Não é possível criar uma negociação para um lead inativo."
      );
    }

    // 2. Garante que os campos obrigatórios para criar uma negociação existem
    //    no lead. team_id e customer_id são nullable no schema (leads pode
    //    existir sem equipe/cliente ainda atribuídos), portanto validamos
    //    explicitamente antes de prosseguir.
    if (!lead.team_id) {
      throw new RequisicaoInvalidaError(
        "O lead não possui uma equipe associada. Atribua uma equipe ao lead antes de criar a negociação."
      );
    }
    if (!lead.customer_id) {
      throw new RequisicaoInvalidaError(
        "O lead não possui um cliente associado. Atribua um cliente ao lead antes de criar a negociação."
      );
    }

    // A partir daqui, lead.team_id e lead.customer_id são `string` (não null).
    // Extraímos em variáveis narrowed para que o TS entenda o tipo correto.
    const leadTeamId: string = lead.team_id;
    const leadCustomerId: string = lead.customer_id;

    // 3. RBAC sobre o lead
    this.assertCanCreateForLead(
      { team_id: leadTeamId, attendant_id: lead.attendant_id },
      actor
    );

    // 4. RF03 — uma negociação ativa por lead
    const existingActive =
      await this.negotiationsRepository.findActiveNegotiationByLeadId(
        data.lead_id
      );
    if (existingActive) {
      throw new BusinessRuleError(
        "Este lead já possui uma negociação ativa. Encerre a anterior antes de criar uma nova."
      );
    }

    // 5. Resolução de team/customer/attendant.
    //    Defaults vêm do lead; o body pode sobrescrever, mas validamos coerência.
    const resolvedTeamId: string = data.team_id ?? leadTeamId;
    const resolvedCustomerId: string = data.customer_id ?? leadCustomerId;
    const resolvedAttendantId: string | null =
      data.attendant_id === undefined ? lead.attendant_id : data.attendant_id;

    // O customer_id da negociação tem que ser o do lead (regra de domínio).
    if (resolvedCustomerId !== leadCustomerId) {
      throw new RequisicaoInvalidaError(
        "O customer da negociação deve ser o mesmo do lead."
      );
    }

    // Se mudou de team em relação ao lead, valida o novo time.
    if (resolvedTeamId !== leadTeamId) {
      if (!canMoveBetweenTeams(actor.role)) {
        throw new AcessoNaoAutorizadoError(
          "Apenas gerente geral ou administrador podem criar negociações em times diferentes do lead."
        );
      }
      await this.assertTeamExistsAndActive(resolvedTeamId);
    }

    // Se atribuiu atendente específico, valida que pertence ao time final.
    if (resolvedAttendantId) {
      await this.assertAttendantBelongsToTeam(resolvedAttendantId, resolvedTeamId);

      // Se MANAGER, o team final tem que estar no escopo dele.
      if (actor.role === "MANAGER" && !actor.team_ids.includes(resolvedTeamId)) {
        throw new AcessoNaoAutorizadoError(
          "Você só pode atribuir atendentes em times que gerencia."
        );
      }
    }

    return this.negotiationsRepository.createWithInitialHistory({
      dto: data,
      resolved: {
        team_id: resolvedTeamId,
        customer_id: resolvedCustomerId,
        attendant_id: resolvedAttendantId,
      },
      actorId: actor.id,
    });
  }

  // ──────────────────────────────────────────────────────
  // ATUALIZAÇÃO
  // ──────────────────────────────────────────────────────
  // Regras por campo:
  //   - team_id (mover entre times): só GENERAL_MANAGER e ADMIN
  //   - attendant_id: ATTENDANT só pra si; MANAGER no escopo; ADMIN livre
  async update(
    id: string,
    data: UpdateNegotiationDTO,
    actor: ActorContext
  ): Promise<NegotiationDetail> {
    const negotiation = await this.negotiationsRepository.findById(id);
    if (!negotiation) {
      throw new RecursoNaoEncontradoError("Negociação não encontrada.");
    }

    this.assertCanWrite(negotiation, actor);

    if (data.team_id !== undefined && !canMoveBetweenTeams(actor.role)) {
      throw new AcessoNaoAutorizadoError(
        "Apenas gerente geral ou administrador podem mover negociações entre times."
      );
    }

    // ATTENDANT não reatribui para outra pessoa
    if (actor.role === "ATTENDANT" && data.attendant_id !== undefined) {
      if (data.attendant_id !== actor.id) {
        throw new AcessoNaoAutorizadoError(
          "Atendentes não podem reatribuir negociações a outros usuários."
        );
      }
    }

    const finalTeamId = data.team_id ?? negotiation.team_id;

    if (data.team_id !== undefined && data.team_id !== negotiation.team_id) {
      await this.assertTeamExistsAndActive(data.team_id);
    }

    if (data.attendant_id) {
      await this.assertAttendantBelongsToTeam(data.attendant_id, finalTeamId);

      if (actor.role === "MANAGER" && !actor.team_ids.includes(finalTeamId)) {
        throw new AcessoNaoAutorizadoError(
          "Você só pode reatribuir negociações em times que gerencia."
        );
      }
    }

    return this.negotiationsRepository.update({
      id,
      dto: data,
      actorId: actor.id,
    });
  }

  // ──────────────────────────────────────────────────────
  // HARD DELETE (apenas ADMIN)
  // ──────────────────────────────────────────────────────
  // Não há soft delete na tabela `negotiations` (não tem `is_active` no schema).
  // A forma "natural" de encerrar uma negociação é registrar um novo status
  // "closed" no histórico — isso é feito pelo módulo de status.
  async hardDelete(id: string, actor: ActorContext): Promise<void> {
    if (actor.role !== "ADMIN") {
      throw new AcessoNaoAutorizadoError(
        "Apenas administradores podem excluir negociações permanentemente."
      );
    }

    const negotiation = await this.negotiationsRepository.findById(id);
    if (!negotiation) {
      throw new RecursoNaoEncontradoError("Negociação não encontrada.");
    }

    // Cascade nos históricos é configurado no schema (onDelete: Cascade).
    await this.negotiationsRepository.hardDelete(id);
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
        "Você não tem permissão para atribuir negociações em lote a atendentes."
      );
    }

    const negotiations = await this.negotiationsRepository.findManyByIds(
      data.negotiation_ids
    );
    if (negotiations.length !== data.negotiation_ids.length) {
      throw new RecursoNaoEncontradoError(
        "Uma ou mais negociações informadas não foram encontradas."
      );
    }

    const teamsInBatch = new Set(negotiations.map((n) => n.team_id));

    if (actor.role === "MANAGER") {
      for (const teamId of teamsInBatch) {
        if (!actor.team_ids.includes(teamId)) {
          throw new AcessoNaoAutorizadoError(
            "Há negociações fora dos times que você gerencia."
          );
        }
      }
    }

    const attendant =
      await this.negotiationsRepository.findAttendantForValidation(
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
          "O atendente informado não pertence a todos os times das negociações selecionadas."
        );
      }
    }

    return this.negotiationsRepository.bulkAssignAttendant({
      negotiationIds: data.negotiation_ids,
      attendantId: data.attendant_id,
      actorId: actor.id,
    });
  }

  // ──────────────────────────────────────────────────────
  // BULK — transferir entre times
  // ──────────────────────────────────────────────────────
  async bulkAssignTeam(
    data: BulkAssignTeamDTO,
    actor: ActorContext
  ): Promise<{ count: number }> {
    if (!canBulkAssignTeam(actor.role)) {
      throw new AcessoNaoAutorizadoError(
        "Você não tem permissão para transferir negociações entre times."
      );
    }

    const negotiations = await this.negotiationsRepository.findManyByIds(
      data.negotiation_ids
    );
    if (negotiations.length !== data.negotiation_ids.length) {
      throw new RecursoNaoEncontradoError(
        "Uma ou mais negociações informadas não foram encontradas."
      );
    }

    await this.assertTeamExistsAndActive(data.team_id);

    return this.negotiationsRepository.bulkAssignTeam({
      negotiationIds: data.negotiation_ids,
      teamId: data.team_id,
      actorId: actor.id,
    });
  }

  // ──────────────────────────────────────────────────────
  // GUARDS DE RBAC
  // ──────────────────────────────────────────────────────

  private assertCanRead(
    negotiation: NegotiationScopeFields,
    actor: ActorContext
  ): void {
    if (actor.role === "ADMIN" || actor.role === "GENERAL_MANAGER") return;

    if (actor.role === "MANAGER") {
      if (!actor.team_ids.includes(negotiation.team_id)) {
        throw new AcessoNaoAutorizadoError(
          "Você só pode visualizar negociações dos times que gerencia."
        );
      }
      return;
    }

    // ATTENDANT
    if (negotiation.attendant_id !== actor.id) {
      throw new AcessoNaoAutorizadoError(
        "Você só pode visualizar as suas próprias negociações."
      );
    }
  }

  private assertCanWrite(
    negotiation: NegotiationScopeFields,
    actor: ActorContext
  ): void {
    if (actor.role === "ADMIN" || actor.role === "GENERAL_MANAGER") return;

    if (actor.role === "MANAGER") {
      if (!actor.team_ids.includes(negotiation.team_id)) {
        throw new AcessoNaoAutorizadoError(
          "Você só pode editar negociações dos times que gerencia."
        );
      }
      return;
    }

    // ATTENDANT
    if (negotiation.attendant_id !== actor.id) {
      throw new AcessoNaoAutorizadoError(
        "Você só pode editar as suas próprias negociações."
      );
    }
  }

  // Para a criação, o "recurso" base é o lead — checamos sobre os campos do lead.
  // Recebe um objeto já narrowed (team_id: string, não string | null) para que
  // a assinatura seja compatível com qualquer caller que já fez o null-check.
  private assertCanCreateForLead(
    lead: { team_id: string; attendant_id: string | null },
    actor: ActorContext
  ): void {
    if (actor.role === "ADMIN" || actor.role === "GENERAL_MANAGER") return;

    if (actor.role === "MANAGER") {
      if (!actor.team_ids.includes(lead.team_id)) {
        throw new AcessoNaoAutorizadoError(
          "Você só pode criar negociações para leads dos times que gerencia."
        );
      }
      return;
    }

    // ATTENDANT — só pode criar para leads que ele mesmo atende
    if (lead.attendant_id !== actor.id) {
      throw new AcessoNaoAutorizadoError(
        "Você só pode criar negociações para os seus próprios leads."
      );
    }
  }

  // ──────────────────────────────────────────────────────
  // VALIDAÇÕES DE ENTIDADES REFERENCIADAS
  // ──────────────────────────────────────────────────────

  private async assertTeamExistsAndActive(teamId: string): Promise<void> {
    const team = await this.negotiationsRepository.findTeamForValidation(teamId);
    if (!team) {
      throw new RecursoNaoEncontradoError("Time não encontrado.");
    }
    if (!team.is_active) {
      throw new RequisicaoInvalidaError(
        "Não é possível vincular a negociação a um time inativo."
      );
    }
  }

  private async assertAttendantBelongsToTeam(
    attendantId: string,
    teamId: string
  ): Promise<void> {
    const attendant =
      await this.negotiationsRepository.findAttendantForValidation(attendantId);
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
        "O atendente informado não pertence ao time desta negociação."
      );
    }
  }
}

// Re-export para uso pelos sub-módulos (status/stage/importance) — eles
// vão precisar do ActorContext na mesma tipagem.
export type { NegotiationScopeRow };