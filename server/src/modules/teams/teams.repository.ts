// src/modules/teams/teams.repository.ts
import { prisma, Prisma } from "../../config/prisma.js";
import type { CreateTeamDTO, UpdateTeamDTO } from "./teams.dto.js";

// ─── Selects / Includes ───────────────────────────────

// Select enxuto — usado na listagem e nos lookups de validação.
const teamSelect = {
  id: true,
  store_id: true,
  name: true,
  is_active: true,
  created_at: true,
  updated_at: true,
  created_by_user_id: true,
  updated_by_user_id: true,
} as const satisfies Prisma.TeamsSelect;

// Include rico — usado em findById e nos retornos de escrita.
// Relações reais do schema:
//   Teams → store  (Stores, belongs-to)
//   Teams → user_teams (UserTeams[])
//   Teams → leads  (Leads[])
// Stores NÃO tem leads diretamente — a relação é Stores → Teams → Leads.
const teamInclude = {
  store: true,
  user_teams: true,
  leads: true,
} as const satisfies Prisma.TeamsInclude;

// Tipos derivados do Prisma — shape exato, sem `any`.
export type TeamRow = Prisma.TeamsGetPayload<{ select: typeof teamSelect }>;
export type TeamWithRelations = Prisma.TeamsGetPayload<{
  include: typeof teamInclude;
}>;

export class TeamsRepository {
  // ─── LISTAR ─────────────────────────────────────────
  async findAll(isActive?: boolean): Promise<TeamRow[]> {
    return prisma.teams.findMany({
      where: isActive !== undefined ? { is_active: isActive } : {},
      select: teamSelect,
      orderBy: { created_at: "desc" },
    });
  }

  // ─── BUSCAR POR ID ───────────────────────────────────
  async findById(id: string): Promise<TeamWithRelations | null> {
    return prisma.teams.findUnique({
      where: { id },
      include: teamInclude,
    });
  }

  // ─── LOOKUP LEVE (validações no service) ────────────
  async findLightById(
    id: string
  ): Promise<{ id: string; is_active: boolean } | null> {
    return prisma.teams.findUnique({
      where: { id },
      select: { id: true, is_active: true },
    });
  }

  // ─── CRIAR ──────────────────────────────────────────
  async create(params: {
    dto: CreateTeamDTO;
    actorId: string;
  }): Promise<TeamWithRelations> {
    const { dto, actorId } = params;

    return prisma.teams.create({
      data: {
        store_id: dto.store_id,
        name: dto.name,
        // is_active tem default(true) no schema; só inclui se veio explícito.
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
        created_by_user_id: actorId,
        updated_by_user_id: actorId,
      },
      include: teamInclude,
    });
  }

  // ─── ATUALIZAR ──────────────────────────────────────
  async update(params: {
    id: string;
    dto: UpdateTeamDTO;
    actorId: string;
  }): Promise<TeamWithRelations> {
    const { id, dto, actorId } = params;

    const data: Prisma.TeamsUpdateInput = {
      updated_by_user_id: actorId,
    };

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.is_active !== undefined) data.is_active = dto.is_active;

    return prisma.teams.update({
      where: { id },
      data,
      include: teamInclude,
    });
  }

  // ─── SOFT DELETE ────────────────────────────────────
  async softDelete(params: {
    id: string;
    actorId: string;
  }): Promise<TeamWithRelations> {
    const { id, actorId } = params;

    return prisma.teams.update({
      where: { id },
      data: {
        is_active: false,
        updated_by_user_id: actorId,
      },
      include: teamInclude,
    });
  }

  // ─── HARD DELETE ────────────────────────────────────
  // onDelete: Restrict em leads, negotiations e user_teams.
  // O Prisma rejeita com P2003 se houver registros filhos — o service captura.
  async hardDelete(id: string): Promise<void> {
    await prisma.teams.delete({ where: { id } });
  }
}