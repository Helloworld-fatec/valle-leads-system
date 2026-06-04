// server/src/modules/negotiation/negotiation.repository.ts
import { prisma, Prisma } from "../../config/prisma.js";
import { NegotiationStatusRepository } from "../negotiation-status/status.repository.js";
import type {
  CreateNegotiationDTO,
  UpdateNegotiationDTO,
  QueryNegotiationDTO,
} from "./negotiation.dto.js";

const attendantSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const satisfies Prisma.UsersSelect;

const negotiationListInclude = {
  leads: { include: { customers: true } },
  teams: true,
  customers: true,
  attendant: { select: attendantSelect },
  status_history:    { orderBy: { created_at: "desc" as const }, take: 1 },
  stage_history:     { orderBy: { created_at: "desc" as const }, take: 1 },
  importance_history:{ orderBy: { created_at: "desc" as const }, take: 1 },
} as const satisfies Prisma.NegotiationsInclude;

const negotiationDetailInclude = {
  leads: { include: { customers: true, interest_item: true } },
  teams: true,
  customers: true,
  attendant: { select: attendantSelect },
  status_history:    { orderBy: { created_at: "desc" as const } },
  stage_history:     { orderBy: { created_at: "desc" as const } },
  importance_history:{ orderBy: { created_at: "desc" as const } },
} as const satisfies Prisma.NegotiationsInclude;

export type NegotiationListItem = Prisma.NegotiationsGetPayload<{
  include: typeof negotiationListInclude;
}>;
export type NegotiationDetail = Prisma.NegotiationsGetPayload<{
  include: typeof negotiationDetailInclude;
}>;

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

export interface NegotiationScopeRow {
  id: string;
  team_id: string;
  attendant_id: string | null;
  lead_id: string;
  customer_id: string;
}

export interface LeadForNegotiationCreation {
  id: string;
  team_id: string | null;      // CORRIGIDO: Agora aceita null
  customer_id: string | null;  // CORRIGIDO: Agora aceita null
  attendant_id: string | null;
  is_active: boolean;
}

export class NegotiationsRepository {
  // ──────────────────────────────────────────────────────
  // LEITURA
  // ──────────────────────────────────────────────────────

  async findAll(filters: FindAllNegotiationsParams): Promise<PaginatedNegotiations> {
    const where = this.buildWhere(filters);

    // Fallback explícito: mesmo que o Zod já defina defaults, o repository
    // garante valores numéricos válidos para que skip nunca seja NaN/undefined
    // (Prisma 7 não aceita skip undefined quando take está presente).
    const page  = filters.page  ?? 1;
    const limit = filters.limit ?? 20;
    const skip  = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.negotiations.findMany({
        where,
        include: negotiationListInclude,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.negotiations.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  private buildWhere(
    filters: FindAllNegotiationsParams
  ): Prisma.NegotiationsWhereInput {
    const where: Prisma.NegotiationsWhereInput = {};

    if (filters.lead_id)     where.lead_id     = filters.lead_id;
    if (filters.customer_id) where.customer_id = filters.customer_id;

    if (filters.attendant_id_scope) {
      where.attendant_id = filters.attendant_id_scope;
    } else if (filters.attendant_id) {
      where.attendant_id = filters.attendant_id;
    }

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

    if (filters.is_open !== undefined) {
      if (filters.is_open) {
        where.status_history = { some: { status_negotiation: "open" } };
        where.NOT = { status_history: { some: { status_negotiation: "closed" } } };
      } else {
        where.status_history = { some: { status_negotiation: "closed" } };
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

      // Espelha imediatamente o status recém-criado no lead pai, dentro da
      // MESMA transação. Sem isto, a negociação nasce "open" mas leads.status
      // permanece no default "new" do schema — a redundância fica dessincronizada.
      // Reaproveita o mesmo syncLeadStatus usado pelos demais caminhos de escrita.
      await NegotiationStatusRepository.syncLeadStatus(dto.lead_id, tx);

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

    await prisma.negotiations.update({ where: { id }, data });

    const result = await prisma.negotiations.findUnique({
      where: { id },
      include: negotiationDetailInclude,
    });
    return result!;
  }

  // ──────────────────────────────────────────────────────
  // EXCLUSÃO
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
      data: { attendant_id: attendantId, updated_by_user_id: actorId },
    });
    return { count: result.count };
  }

  async bulkAssignTeam(params: {
    negotiationIds: string[];
    teamId: string;
    actorId: string;
  }): Promise<{ count: number }> {
    const { negotiationIds, teamId, actorId } = params;
    const result = await prisma.negotiations.updateMany({
      where: { id: { in: negotiationIds } },
      data: { team_id: teamId, attendant_id: null, updated_by_user_id: actorId },
    });
    return { count: result.count };
  }

  // ──────────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────────

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
    | { id: string; role: string; is_active: boolean; user_teams: { team_id: string }[] }
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