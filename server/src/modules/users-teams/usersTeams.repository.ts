// src/modules/users-teams/usersTeams.repository.ts
import { prisma, Prisma } from "../../config/prisma.js";
import type { CreateUserTeamDTO, UpdateUserTeamDTO } from "./usersTeams.dto.js";

// ─── Include padrão ───────────────────────────────────
// Traz dados resumidos do usuário e do time para evitar joins desnecessários.
const userTeamInclude = {
  user: {
    select: { id: true, name: true, email: true, role: true, is_active: true },
  },
  team: {
    select: { id: true, name: true, is_active: true },
  },
} as const satisfies Prisma.UserTeamsInclude;

export type UserTeamWithRelations = Prisma.UserTeamsGetPayload<{
  include: typeof userTeamInclude;
}>;

export class UsersTeamsRepository {
  // ─── LISTAR ─────────────────────────────────────────
  async findAll(): Promise<UserTeamWithRelations[]> {
    return prisma.userTeams.findMany({
      include: userTeamInclude,
      orderBy: { created_at: "desc" },
    });
  }

  // ─── BUSCAR POR ID ───────────────────────────────────
  async findById(id: string): Promise<UserTeamWithRelations | null> {
    return prisma.userTeams.findUnique({
      where: { id },
      include: userTeamInclude,
    });
  }

  // ─── BUSCAR POR USER + TEAM (para verificar duplicidade) ─
  async findByUserAndTeam(
    user_id: string,
    team_id: string
  ): Promise<{ id: string; is_active: boolean } | null> {
    return prisma.userTeams.findUnique({
      where: { user_id_team_id: { user_id, team_id } },
      select: { id: true, is_active: true },
    });
  }

  // ─── CRIAR ──────────────────────────────────────────
  async create(params: {
    dto: CreateUserTeamDTO;
    actorId: string;
  }): Promise<UserTeamWithRelations> {
    const { dto, actorId } = params;

    return prisma.userTeams.create({
      data: {
        user_id: dto.user_id,
        team_id: dto.team_id,
        created_by_user_id: actorId,
      },
      include: userTeamInclude,
    });
  }

  // ─── ATUALIZAR (is_active) ───────────────────────────
  async update(params: {
    id: string;
    dto: UpdateUserTeamDTO;
  }): Promise<UserTeamWithRelations> {
    const { id, dto } = params;

    return prisma.userTeams.update({
      where: { id },
      data: { is_active: dto.is_active },
      include: userTeamInclude,
    });
  }

  // ─── SOFT DELETE ────────────────────────────────────
  async softDelete(id: string): Promise<UserTeamWithRelations> {
    return prisma.userTeams.update({
      where: { id },
      data: { is_active: false },
      include: userTeamInclude,
    });
  }

  // ─── HARD DELETE ────────────────────────────────────
  // onDelete: Cascade em user e team — sem restrições de FK no sentido inverso.
  async hardDelete(id: string): Promise<void> {
    await prisma.userTeams.delete({ where: { id } });
  }
}
