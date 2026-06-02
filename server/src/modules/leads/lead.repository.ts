// src/modules/leads/lead.repository.ts
import { prisma, Prisma } from "../../config/prisma.js";
import type {
  CreateLeadDTO,
  UpdateLeadDTO,
  QueryLeadDTO,
} from "./lead.dtos.js";

const attendantSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const satisfies Prisma.UsersSelect;

const leadInclude = {
  customers: true,
  teams: true,
  attendant: { select: attendantSelect },
  interest_item: true,
} as const satisfies Prisma.LeadsInclude;

const leadIncludeWithNegotiations = {
  ...leadInclude,
  negotiations: true,
} as const satisfies Prisma.LeadsInclude;

export type LeadWithIncludes = Prisma.LeadsGetPayload<{
  include: typeof leadInclude;
}>;
export type LeadWithNegotiations = Prisma.LeadsGetPayload<{
  include: typeof leadIncludeWithNegotiations;
}>;

export interface FindAllLeadsParams extends QueryLeadDTO {
  attendant_id_scope?: string;
  team_ids_scope?: string[];
  force_active_only?: boolean;
}

export interface PaginatedLeads {
  data: LeadWithIncludes[];
  total: number;
  page: number;
  limit: number;
}

export class LeadsRepository {
  async findAll(filters: FindAllLeadsParams): Promise<PaginatedLeads> {
    const where = this.buildWhere(filters);

    // Fallback explícito: mesmo que o Zod já defina defaults, o repository
    // garante valores numéricos válidos para que skip nunca seja NaN/undefined
    // (Prisma 7 não aceita skip undefined quando take está presente).
    const page  = filters.page  ?? 1;
    const limit = filters.limit ?? 20;
    const skip  = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.leads.findMany({
        where,
        include: leadInclude,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.leads.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  private buildWhere(filters: FindAllLeadsParams): Prisma.LeadsWhereInput {
    const where: Prisma.LeadsWhereInput = {};

    if (filters.status)           where.status           = filters.status;
    if (filters.customer_id)      where.customer_id      = filters.customer_id;
    if (filters.interest_item_id) where.interest_item_id = filters.interest_item_id;

    if (filters.force_active_only) {
      where.is_active = true;
    } else if (filters.is_active !== undefined) {
      where.is_active = filters.is_active;
    }

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

    return where;
  }

  async findById(id: string): Promise<LeadWithNegotiations | null> {
    return prisma.leads.findUnique({
      where: { id },
      include: leadIncludeWithNegotiations,
    });
  }

  async findManyByIds(ids: string[]): Promise<
    Pick<LeadWithIncludes, "id" | "team_id" | "attendant_id" | "is_active">[]
  > {
    return prisma.leads.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        team_id: true,
        attendant_id: true,
        is_active: true,
      },
    });
  }

  async create(params: {
    dto: CreateLeadDTO;
    actorId: string;
  }): Promise<LeadWithIncludes> {
    const { dto, actorId } = params;
    return prisma.leads.create({
      data: {
        status: dto.status ?? "new",
        customer_id: dto.customer_id,
        team_id: dto.team_id,
        source: dto.source ?? null,
        attendant_id: dto.attendant_id ?? null,
        interest_item_id: dto.interest_item_id ?? null,
        created_by_user_id: actorId,
        updated_by_user_id: actorId,
      },
      include: leadInclude,
    });
  }

  async update(params: {
    id: string;
    dto: UpdateLeadDTO;
    actorId: string;
  }): Promise<LeadWithIncludes> {
    const { id, dto, actorId } = params;

    const data: Prisma.LeadsUpdateInput = {
      updated_by_user_id: actorId,
    };

    if (dto.status      !== undefined) data.status    = dto.status;
    if (dto.is_active   !== undefined) data.is_active = dto.is_active;
    if (dto.source      !== undefined) data.source    = dto.source ?? null;

    if (dto.attendant_id !== undefined) {
      data.attendant =
        dto.attendant_id === null
          ? { disconnect: true }
          : { connect: { id: dto.attendant_id } };
    }
    if (dto.interest_item_id !== undefined) {
      data.interest_item =
        dto.interest_item_id === null
          ? { disconnect: true }
          : { connect: { id: dto.interest_item_id } };
    }
    if (dto.team_id !== undefined) {
      data.teams = { connect: { id: dto.team_id } };
    }

    return prisma.leads.update({
      where: { id },
      data,
      include: leadInclude,
    });
  }

  async softDelete(params: {
    id: string;
    actorId: string;
  }): Promise<LeadWithIncludes> {
    const { id, actorId } = params;
    return prisma.leads.update({
      where: { id },
      data: { is_active: false, updated_by_user_id: actorId },
      include: leadInclude,
    });
  }

  async hardDelete(id: string): Promise<void> {
    await prisma.leads.delete({ where: { id } });
  }

  async bulkAssignAttendant(params: {
    leadIds: string[];
    attendantId: string;
    actorId: string;
  }): Promise<{ count: number }> {
    const { leadIds, attendantId, actorId } = params;
    const result = await prisma.leads.updateMany({
      where: { id: { in: leadIds } },
      data: { attendant_id: attendantId, updated_by_user_id: actorId },
    });
    return { count: result.count };
  }

  async bulkAssignTeam(params: {
    leadIds: string[];
    teamId: string;
    actorId: string;
  }): Promise<{ count: number }> {
    const { leadIds, teamId, actorId } = params;
    const result = await prisma.leads.updateMany({
      where: { id: { in: leadIds } },
      data: { team_id: teamId, attendant_id: null, updated_by_user_id: actorId },
    });
    return { count: result.count };
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