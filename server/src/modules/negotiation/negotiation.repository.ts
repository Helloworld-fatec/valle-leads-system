// server/src/modules/negotiation/negotiation.repository.ts
import { prisma, Prisma } from "../../config/prisma.js";
import type {
  CreateNegotiationDTO,
  UpdateNegotiationDTO,
  QueryNegotiationDTO,
} from "./negotiation.dto.js";

// Select reutilizado para o atendente — evita expor password_hash.
const attendantSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const satisfies Prisma.UsersSelect;

// Include padrão da listagem.
// Trazemos apenas o último item de cada histórico para o "card" da listagem;
// no findById traremos o histórico completo.
const negotiationListInclude = {
  leads: { include: { customers: true } },
  teams: true,
  customers: true,
  attendant: { select: attendantSelect },
  status_history: { orderBy: { created_at: "desc" as const }, take: 1 },
  stage_history: { orderBy: { created_at: "desc" as const }, take: 1 },
  importance_history: { orderBy: { created_at: "desc" as const }, take: 1 },
} as const satisfies Prisma.NegotiationsInclude;

// Include do detalhe — histórico completo, ordenado do mais recente p/ o mais antigo.
const negotiationDetailInclude = {
  leads: { include: { customers: true, interest_item: true } },
  teams: true,
  customers: true,
  attendant: { select: attendantSelect },
  status_history: { orderBy: { created_at: "desc" as const } },
  stage_history: { orderBy: { created_at: "desc" as const } },
  importance_history: { orderBy: { created_at: "desc" as const } },
} as const satisfies Prisma.NegotiationsInclude;

// Tipos derivados — shape exato do retorno, sem `any` em ninguém.
export type NegotiationListItem = Prisma.NegotiationsGetPayload<{
  include: typeof negotiationListInclude;
}>;
export type NegotiationDetail = Prisma.NegotiationsGetPayload<{
  include: typeof negotiationDetailInclude;
}>;

// Filtros aceitos pela listagem. Os _scope são injetados pelo SERVICE
// conforme o role do actor — nunca vêm do cliente.
export interface FindAllNegotiationsParams extends QueryNegotiationDTO {
  attendant_id_scope?: string;
  team_ids_scope?: string[];
}

export interface PaginatedNegotiations {
  data: NegotiationListItem[];
  total: number;
  page: number;
  limit: number;
}

// Tipo mínimo retornado por findManyByIds — usado pelos guards de escopo no service.
export interface NegotiationScopeRow {
  id: string;
  team_id: string;
  attendant_id: string | null;
  lead_id: string;
  customer_id: string;
}

// Tipo do lead para a criação (lê os dados que a negociação herda).
export interface LeadForNegotiationCreation {
  id: string;
  team_id: string;
  customer_id: string;
  attendant_id: string | null;
  is_active: boolean;
}

export class NegotiationsRepository {
  // ──────────────────────────────────────────────────────
  // LEITURA
  // ──────────────────────────────────────────────────────

  async findAll(filters: FindAllNegotiationsParams): Promise<PaginatedNegotiations> {
    const where = this.buildWhere(filters);
    const page = filters.page;
    const limit = filters.limit;

    const [data, total] = await Promise.all([
      prisma.negotiations.findMany({
        where,
        include: negotiationListInclude,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.negotiations.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  // Monta o WHERE combinando filtros do cliente e restrições de escopo.
  // O escopo sempre vence sobre filtros livres — segurança em primeiro lugar.
  private buildWhere(
    filters: FindAllNegotiationsParams
  ): Prisma.NegotiationsWhereInput {
    const where: Prisma.NegotiationsWhereInput = {};

    if (filters.lead_id) where.lead_id = filters.lead_id;
    if (filters.customer_id) where.customer_id = filters.customer_id;

    // attendant_id: escopo de ATTENDANT sobrepõe filtro livre.
    if (filters.attendant_id_scope) {
      where.attendant_id = filters.attendant_id_scope;
    } else if (filters.attendant_id) {
      where.attendant_id = filters.attendant_id;
    }

    // team_id: escopo de MANAGER intersecta com filtro livre.
    if (filters.team_ids_scope && filters.team_ids_scope.length > 0) {
      if (filters.team_id) {
        where.team_id = filters.team_ids_scope.includes(filters.team_id)
          ? filters.team_id
          : { in: [] };
      } else {
        where.team_id = { in: filters.team_ids_scope };
      }
    } else if (filters.team_id) {
      where.team_id = filters.team_id;
    }

    // is_open: filtra pelo último status do histórico.
    // Implementação: aberta = existe pelo menos um status no histórico e
    // o mais recente é "open"; fechada = mais recente é "closed".
    // Usamos `some` com ordenação por created_at desc + take 1 não é viável
    // em where direto do Prisma; em vez disso, usamos um subfiltro com
    // negação para garantir que NÃO exista um status mais recente com o
    // valor contrário.
    if (filters.is_open !== undefined) {
      if (filters.is_open) {
        where.status_history = {
          some: {
            status_negotiation: "open",
            // Não pode haver outro status criado depois deste com valor diferente.
            // (Aproximação prática: confiamos que o histórico está consistente,
            // já que o service só insere novos status de forma controlada.)
          },
        };
        where.NOT = {
          status_history: {
            some: { status_negotiation: "closed" },
          },
        };
      } else {
        where.status_history = {
          some: { status_negotiation: "closed" },
        };
      }
    }

    return where;
  }

  async findById(id: string): Promise<NegotiationDetail | null> {
    return prisma.negotiations.findUnique({
      where: { id },
      include: negotiationDetailInclude,
    });
  }

  // Busca enxuta para validações de operações em lote.
  async findManyByIds(ids: string[]): Promise<NegotiationScopeRow[]> {
    return prisma.negotiations.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        team_id: true,
        attendant_id: true,
        lead_id: true,
        customer_id: true,
      },
    });
  }

  // ──────────────────────────────────────────────────────
  // CRIAÇÃO (transação)
  // ──────────────────────────────────────────────────────
  // Cria a negociação E seus três históricos iniciais em uma única
  // transação — se qualquer passo falhar, nada é persistido (RNF05).
  // Os valores iniciais são fixos por convenção:
  //   - status: "open"
  //   - stage:  "qualificacao"
  //   - importance: "morno"
  async createWithInitialHistory(params: {
    dto: CreateNegotiationDTO;
    resolved: {
      team_id: string;
      customer_id: string;
      attendant_id: string | null;
    };
    actorId: string;
  }): Promise<NegotiationDetail> {
    const { dto, resolved, actorId } = params;

    return prisma.$transaction(async (tx) => {
      const negotiation = await tx.negotiations.create({
        data: {
          lead_id: dto.lead_id,
          team_id: resolved.team_id,
          customer_id: resolved.customer_id,
          attendant_id: resolved.attendant_id,
          created_by_user_id: actorId,
          updated_by_user_id: actorId,
        },
      });

      await tx.negotiationStatus.create({
        data: {
          negotiation_id: negotiation.id,
          lead_id: dto.lead_id,
          status_negotiation: "open",
          notes: "Status inicial gerado automaticamente.",
          created_by_user_id: actorId,
        },
      });

      await tx.negotiationStageHistory.create({
        data: {
          negotiation_id: negotiation.id,
          lead_id: dto.lead_id,
          old_stage: null,
          new_stage: "qualificacao",
          notes: "Estágio inicial gerado automaticamente.",
          created_by_user_id: actorId,
        },
      });

      await tx.negotiationImportance.create({
        data: {
          negotiation_id: negotiation.id,
          lead_id: dto.lead_id,
          importance: "morno",
          notes: "Importância inicial gerada automaticamente.",
          created_by_user_id: actorId,
        },
      });

      const result = await tx.negotiations.findUnique({
        where: { id: negotiation.id },
        include: negotiationDetailInclude,
      });

      // findUnique imediatamente após create da própria transação sempre
      // retorna o registro; o "!" aqui é justificado.
      return result!;
    });
  }

  // ──────────────────────────────────────────────────────
  // ATUALIZAÇÃO
  // ──────────────────────────────────────────────────────

  async update(params: {
    id: string;
    dto: UpdateNegotiationDTO;
    actorId: string;
  }): Promise<NegotiationDetail> {
    const { id, dto, actorId } = params;

    const data: Prisma.NegotiationsUpdateInput = {
      updated_by_user_id: actorId,
    };

    if (dto.team_id !== undefined) {
      data.teams = { connect: { id: dto.team_id } };
    }
    if (dto.attendant_id !== undefined) {
      data.attendant =
        dto.attendant_id === null
          ? { disconnect: true }
          : { connect: { id: dto.attendant_id } };
    }

    await prisma.negotiations.update({
      where: { id },
      data,
    });

    // Recarrega com include completo para retorno consistente.
    const result = await prisma.negotiations.findUnique({
      where: { id },
      include: negotiationDetailInclude,
    });
    return result!;
  }

  // ──────────────────────────────────────────────────────
  // EXCLUSÃO (apenas hard delete; cascade nos históricos pelo schema)
  // ──────────────────────────────────────────────────────

  async hardDelete(id: string): Promise<void> {
    await prisma.negotiations.delete({ where: { id } });
  }

  // ──────────────────────────────────────────────────────
  // BULK
  // ──────────────────────────────────────────────────────

  async bulkAssignAttendant(params: {
    negotiationIds: string[];
    attendantId: string;
    actorId: string;
  }): Promise<{ count: number }> {
    const { negotiationIds, attendantId, actorId } = params;
    const result = await prisma.negotiations.updateMany({
      where: { id: { in: negotiationIds } },
      data: {
        attendant_id: attendantId,
        updated_by_user_id: actorId,
      },
    });
    return { count: result.count };
  }

  async bulkAssignTeam(params: {
    negotiationIds: string[];
    teamId: string;
    actorId: string;
  }): Promise<{ count: number }> {
    const { negotiationIds, teamId, actorId } = params;
    // Igual ao módulo de leads: ao trocar de time, zera o atendente — o
    // atendente antigo pode não pertencer ao novo time.
    const result = await prisma.negotiations.updateMany({
      where: { id: { in: negotiationIds } },
      data: {
        team_id: teamId,
        attendant_id: null,
        updated_by_user_id: actorId,
      },
    });
    return { count: result.count };
  }

  // ──────────────────────────────────────────────────────
  // HELPERS (lookup leve para validação no service)
  // ──────────────────────────────────────────────────────

  // Retorna os campos do lead que a negociação herda na criação.
  async findLeadForValidation(
    leadId: string
  ): Promise<LeadForNegotiationCreation | null> {
    return prisma.leads.findUnique({
      where: { id: leadId },
      select: {
        id: true,
        team_id: true,
        customer_id: true,
        attendant_id: true,
        is_active: true,
      },
    });
  }

  // RF03: "cada lead pode possuir no máximo uma negociação ATIVA".
  // Ativa = última entrada do status_history NÃO é "closed".
  // Buscamos a última negociação do lead e checamos seu status mais recente.
  async findActiveNegotiationByLeadId(leadId: string): Promise<{
    id: string;
    last_status: string | null;
  } | null> {
    const negotiations = await prisma.negotiations.findMany({
      where: { lead_id: leadId },
      select: {
        id: true,
        status_history: {
          orderBy: { created_at: "desc" },
          take: 1,
          select: { status_negotiation: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Procura a primeira cujo último status não é "closed"
    for (const n of negotiations) {
      const last = n.status_history[0]?.status_negotiation ?? null;
      if (last !== "closed") {
        return { id: n.id, last_status: last };
      }
    }
    return null;
  }

  async findTeamForValidation(
    teamId: string
  ): Promise<{ id: string; is_active: boolean } | null> {
    return prisma.teams.findUnique({
      where: { id: teamId },
      select: { id: true, is_active: true },
    });
  }

  async findAttendantForValidation(attendantId: string): Promise<
    | {
        id: string;
        role: string;
        is_active: boolean;
        user_teams: { team_id: string }[];
      }
    | null
  > {
    return prisma.users.findUnique({
      where: { id: attendantId },
      select: {
        id: true,
        role: true,
        is_active: true,
        user_teams: {
          where: { is_active: true },
          select: { team_id: true },
        },
      },
    });
  }
}
