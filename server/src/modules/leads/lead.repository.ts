// src/modules/leads/lead.repository.ts
import { prisma, Prisma } from "../../config/prisma.js";
import type { CreateLeadDTO, UpdateLeadDTO, QueryLeadDTO } from "./lead.dtos.js";

// ─────────────────────────────────────────────
// LEADS REPOSITORY
// ─────────────────────────────────────────────
// Responsabilidade ÚNICA: acesso ao banco (SRP / RNF13).
// Não conhece regras de RBAC nem regras de negócio — apenas executa queries.
// O service injeta os filtros de escopo (team_ids_scope, attendant_id_scope)
// conforme o role do solicitante.
// ─────────────────────────────────────────────

// Select reutilizável para o atendente — evita expor password_hash
const attendantSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

// Filtros aceitos pela listagem. Os campos *_scope são injetados pelo
// service de acordo com o role do actor (defesa em profundidade).
export interface FindAllLeadsParams extends QueryLeadDTO {
  // ATTENDANT: força attendant_id = actor.id
  attendant_id_scope?: string;
  // MANAGER: restringe team_id ∈ actor.team_ids
  team_ids_scope?: string[];
}

export class LeadsRepository {
  // ─── LEITURA ──────────────────────────────────────

  /**
   * Retorna a lista paginada + total (pra montar envelope de paginação).
   */
  async findAll(filters: FindAllLeadsParams): Promise<{
    data: Awaited<ReturnType<LeadsRepository["queryMany"]>>;
    total: number;
    page: number;
    limit: number;
  }> {
    const where = this.buildWhere(filters);
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;

    const [data, total] = await Promise.all([
      this.queryMany(where, page, limit),
      prisma.leads.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  private queryMany(where: Prisma.LeadsWhereInput, page: number, limit: number) {
    return prisma.leads.findMany({
      where,
      include: {
        customers: true,
        teams: true,
        attendant: { select: attendantSelect },
        interest_item: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
    });
  }

  private buildWhere(filters: FindAllLeadsParams): Prisma.LeadsWhereInput {
    const where: Prisma.LeadsWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.customer_id) where.customer_id = filters.customer_id;
    if (filters.interest_item_id) where.interest_item_id = filters.interest_item_id;
    if (filters.is_active !== undefined) where.is_active = filters.is_active;

    // attendant_id: escopo (ATTENDANT) tem prioridade sobre filtro livre
    if (filters.attendant_id_scope) {
      where.attendant_id = filters.attendant_id_scope;
    } else if (filters.attendant_id) {
      where.attendant_id = filters.attendant_id;
    }

    // team_id: idem — escopo (MANAGER) restringe ao subconjunto de times
    if (filters.team_ids_scope && filters.team_ids_scope.length > 0) {
      if (filters.team_id) {
        // Filtro do usuário + restrição de escopo → intersecção
        if (filters.team_ids_scope.includes(filters.team_id)) {
          where.team_id = filters.team_id;
        } else {
          // Pediu um team fora do escopo → força resultado vazio
          where.team_id = { in: [] };
        }
      } else {
        where.team_id = { in: filters.team_ids_scope };
      }
    } else if (filters.team_id) {
      where.team_id = filters.team_id;
    }

    return where;
  }

  async findById(id: string) {
    return prisma.leads.findUnique({
      where: { id },
      include: {
        customers: true,
        teams: true,
        attendant: { select: attendantSelect },
        interest_item: true,
        negotiations: true,
      },
    });
  }

  // ─── ESCRITA ──────────────────────────────────────

  async create(params: { dto: CreateLeadDTO; actorId: string }) {
    const { dto, actorId } = params;
    return prisma.leads.create({
      data: {
        status: dto.status,
        customer_id: dto.customer_id,
        team_id: dto.team_id,
        source: dto.source ?? null,
        attendant_id: dto.attendant_id ?? null,
        interest_item_id: dto.interest_item_id ?? null,
        created_by_user_id: actorId,
        updated_by_user_id: actorId,
      },
      include: {
        customers: true,
        teams: true,
        attendant: { select: attendantSelect },
        interest_item: true,
      },
    });
  }

  async update(params: { id: string; dto: UpdateLeadDTO; actorId: string }) {
    const { id, dto, actorId } = params;
    return prisma.leads.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
        ...(dto.source !== undefined && { source: dto.source ?? null }),
        ...(dto.attendant_id !== undefined && {
          attendant_id: dto.attendant_id ?? null,
        }),
        ...(dto.interest_item_id !== undefined && {
          interest_item_id: dto.interest_item_id ?? null,
        }),
        updated_by_user_id: actorId,
      },
      include: {
        customers: true,
        teams: true,
        attendant: { select: attendantSelect },
        interest_item: true,
      },
    });
  }

  async softDelete(params: { id: string; actorId: string }) {
    const { id, actorId } = params;
    return prisma.leads.update({
      where: { id },
      data: {
        is_active: false,
        updated_by_user_id: actorId,
      },
    });
  }

  // ─── HELPERS ──────────────────────────────────────

  /**
   * Lookup leve de team — usado pelo service pra validar se team_id existe e está ativo,
   * sem depender de um TeamsRepository (que ainda não existe).
   */
  async findTeamForValidation(teamId: string) {
    return prisma.teams.findUnique({
      where: { id: teamId },
      select: { id: true, is_active: true },
    });
  }

  /**
   * Lookup leve de atendente — valida que o user existe, está ativo, é ATTENDANT
   * e pertence ao time informado.
   */
  async findAttendantForValidation(attendantId: string) {
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
