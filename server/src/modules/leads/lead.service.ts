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

// Roles aceitos pelo módulo. Manter como literal type aqui (em vez de
// importar do middleware) evita acoplamento da camada de domínio com o
// middleware de auth. Os valores são idênticos aos do JWT.
export type LeadActorRole =
  | "ATTENDANT"
  | "MANAGER"
  | "GENERAL_MANAGER"
  | "ADMIN";

// Contexto do solicitante, montado pelo controller a partir de req.user.
// É a "carteira de identidade" que circula pela camada de aplicação para
// que cada operação saiba quem está pedindo e com que privilégios.
export interface ActorContext {
  id: string;
  role: LeadActorRole;
  team_ids: string[];
}

// Helpers de comparação de role: legibilidade > repetir comparação.
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

// Shape mínimo de lead que os guards de RBAC precisam para decidir.
// Aceita tanto LeadWithIncludes quanto o select reduzido do findManyByIds.
interface LeadScopeFields {
  attendant_id: string | null;
  team_id: string;
  is_active: boolean;
}

export class LeadsService {
  private leadsRepository = new LeadsRepository();

  // ──────────────────────────────────────────────────────
  // LISTAGEM
  // ──────────────────────────────────────────────────────
  // Aplica o escopo de leitura conforme o role e, para os perfis que não
  // podem ver inativos, força is_active=true mesmo que o cliente tente
  // passar ?is_active=false.
  async findAll(
    filters: QueryLeadDTO,
    actor: ActorContext
  ): Promise<PaginatedLeads> {
    if (actor.role === "ATTENDANT") {
      // Spread condicional: attendant_id_scope só é incluído quando definido,
      // satisfazendo exactOptionalPropertyTypes (evita passar `undefined`
      // explicitamente para um campo opcional).
      return this.leadsRepository.findAll({
        ...filters,
        attendant_id_scope: actor.id,
        force_active_only: true,
      });
    }

    if (actor.role === "MANAGER") {
      if (actor.team_ids.length === 0) {
        // Manager sem times → não retorna nada (visão vazia).
        return {
          data: [],
          total: 0,
          page: filters.page,
          limit: filters.limit,
        };
      }

      return this.leadsRepository.findAll({
        ...filters,
        team_ids_scope: actor.team_ids,
        force_active_only: true,
      });
    }

    // GENERAL_MANAGER e ADMIN: sem restrição de escopo.
    // force_active_only=false permite que o cliente filtre por is_active.
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

    // Quem não pode ver inativos recebe 404 (semanticamente equivalente
    // a "não existe pra você") — não vazamos a existência do registro.
    if (!lead.is_active && !canSeeInactive(actor.role)) {
      throw new RecursoNaoEncontradoError("Lead não encontrado.");
    }

    this.assertCanRead(lead, actor);
    return lead;
  }

  // ──────────────────────────────────────────────────────
  // CRIAÇÃO
  // ──────────────────────────────────────────────────────
  // Todos os roles podem criar (inclusive GENERAL_MANAGER agora).
  // Para ATTENDANT, força attendant_id=self e exige team_id ∈ team_ids.
  // Para MANAGER, exige team_id ∈ team_ids e atendente coerente com o time.
  // GENERAL_MANAGER e ADMIN criam livremente, validando coerências.
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

      if (!actor.team_ids.includes(data.team_id)) {
        throw new AcessoNaoAutorizadoError(
          "Você só pode criar leads em times aos quais pertence."
        );
      }
    } else if (actor.role === "MANAGER") {
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
    } else if (data.attendant_id) {
      // GENERAL_MANAGER ou ADMIN — atribuição livre, mas com coerência.
      await this.assertAttendantBelongsToTeam(
        data.attendant_id,
        data.team_id
      );
    }

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

  // ──────────────────────────────────────────────────────
  // ATUALIZAÇÃO
  // ──────────────────────────────────────────────────────
  // Regras finas, organizadas por campo sensível:
  //   - is_active=true (reativar): só GENERAL_MANAGER e ADMIN
  //   - team_id (trocar de time): só GENERAL_MANAGER e ADMIN
  //   - attendant_id: ATTENDANT só pode atribuir a si mesmo; MANAGER no
  //     escopo do time do lead; ADMIN livre.
  async update(
    id: string,
    data: UpdateLeadDTO,
    actor: ActorContext
  ): Promise<LeadWithIncludes> {
    const lead = await this.leadsRepository.findById(id);
    if (!lead) {
      throw new RecursoNaoEncontradoError("Lead não encontrado.");
    }

    // Esconde existência de inativos para quem não pode vê-los.
    if (!lead.is_active && !canSeeInactive(actor.role)) {
      throw new RecursoNaoEncontradoError("Lead não encontrado.");
    }

    this.assertCanWrite(lead, actor);

    // Restrições por campo
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

    // ATTENDANT não reatribui pra outra pessoa
    if (actor.role === "ATTENDANT" && data.attendant_id !== undefined) {
      if (data.attendant_id !== actor.id) {
        throw new AcessoNaoAutorizadoError(
          "Atendentes não podem reatribuir leads a outros usuários."
        );
      }
    }

    // Decide qual será o team final do lead (importante para validar atendente)
    const finalTeamId = data.team_id ?? lead.team_id;

    // Se trocou de time, valida o novo time
    if (data.team_id !== undefined && data.team_id !== lead.team_id) {
      await this.assertTeamExistsAndActive(data.team_id);
    }

    // Se reatribuiu para alguém específico (não null), valida coerência com o time final
    if (data.attendant_id) {
      if (actor.role === "MANAGER" || actor.role === "ADMIN" || actor.role === "GENERAL_MANAGER") {
        await this.assertAttendantBelongsToTeam(data.attendant_id, finalTeamId);
      }
    }

    // Se MANAGER, só pode trocar para um atendente do PRÓPRIO time
    if (actor.role === "MANAGER" && data.attendant_id) {
      if (!actor.team_ids.includes(finalTeamId)) {
        throw new AcessoNaoAutorizadoError(
          "Você só pode reatribuir leads em times que gerencia."
        );
      }
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
  // Liberado para todos os roles, respeitando o escopo de escrita:
  //   - ATTENDANT: só os próprios leads
  //   - MANAGER: só leads dos times que gerencia
  //   - GENERAL_MANAGER e ADMIN: qualquer lead
  async softDelete(id: string, actor: ActorContext): Promise<void> {
    const lead = await this.leadsRepository.findById(id);
    if (!lead) {
      throw new RecursoNaoEncontradoError("Lead não encontrado.");
    }
    if (!lead.is_active && !canSeeInactive(actor.role)) {
      throw new RecursoNaoEncontradoError("Lead não encontrado.");
    }

    this.assertCanWrite(lead, actor);

    if (!lead.is_active) {
      throw new BusinessRuleError("Lead já está inativo.");
    }

    await this.leadsRepository.softDelete({ id, actorId: actor.id });
  }

  // ──────────────────────────────────────────────────────
  // HARD DELETE (exclusão permanente)
  // ──────────────────────────────────────────────────────
  // Apenas ADMIN. Negociações vinculadas têm onDelete: Restrict no schema,
  // então o Prisma vai recusar a exclusão — capturamos e devolvemos mensagem
  // de regra de negócio em vez de deixar vazar um erro do Prisma.
  async hardDelete(id: string, actor: ActorContext): Promise<void> {
    if (actor.role !== "ADMIN") {
      throw new AcessoNaoAutorizadoError(
        "Apenas administradores podem excluir leads permanentemente."
      );
    }

    const lead = await this.leadsRepository.findById(id);
    if (!lead) {
      throw new RecursoNaoEncontradoError("Lead não encontrado.");
    }

    try {
      await this.leadsRepository.hardDelete(id);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2003"
      ) {
        throw new BusinessRuleError(
          "Não é possível excluir o lead permanentemente pois existem negociações vinculadas."
        );
      }
      throw err;
    }
  }

  // ──────────────────────────────────────────────────────
  // BULK — atribuir atendente em lote
  // ──────────────────────────────────────────────────────
  // MANAGER: leads precisam estar todos em times que ele gerencia, e o
  // atendente precisa pertencer ao mesmo time de TODOS os leads selecionados.
  // ADMIN: sem restrição de escopo, só valida coerência de time × atendente.
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

    // Detecta IDs inexistentes — falha rápido com mensagem clara
    if (leads.length !== data.lead_ids.length) {
      throw new RecursoNaoEncontradoError(
        "Um ou mais leads informados não foram encontrados."
      );
    }

    // Verifica escopo do MANAGER e que todos compartilham o mesmo time
    const teamsInBatch = new Set(leads.map((l) => l.team_id));

    if (actor.role === "MANAGER") {
      for (const teamId of teamsInBatch) {
        if (!actor.team_ids.includes(teamId)) {
          throw new AcessoNaoAutorizadoError(
            "Há leads fora dos times que você gerencia."
          );
        }
      }
    }

    // O atendente deve pertencer a TODOS os times representados no lote.
    // Em geral isso significa "um único time"; se houver mais de um, exigimos
    // que o atendente pertença a todos eles.
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
  // BULK — atribuir/transferir equipe em lote
  // ──────────────────────────────────────────────────────
  // GENERAL_MANAGER: livre (esse é justamente seu poder de orquestração).
  // ADMIN: idem.
  // Ao mover, o attendant_id é zerado (vide repository) porque o atendente
  // antigo pode não pertencer ao novo time.
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

  // Decide se o actor pode LER este lead, dado seu role e escopo de times.
  private assertCanRead(lead: LeadScopeFields, actor: ActorContext): void {
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

  // Decide se o actor pode ESCREVER (atualizar/desativar) este lead.
  // Note que para o soft delete também usamos este guard, porque o "direito
  // de remover" segue exatamente o mesmo escopo do "direito de editar".
  private assertCanWrite(lead: LeadScopeFields, actor: ActorContext): void {
    if (actor.role === "ADMIN" || actor.role === "GENERAL_MANAGER") return;

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

  // Valida: usuário existe, está ativo, é ATTENDANT, e pertence ao time alvo.
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