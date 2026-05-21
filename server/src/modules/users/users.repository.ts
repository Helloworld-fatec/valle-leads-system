// src/modules/users/users.repository.ts
import { prisma, Prisma } from "../../config/prisma.js";

// ─────────────────────────────────────────────
// USERS REPOSITORY
// ─────────────────────────────────────────────
// Responsabilidade ÚNICA: acesso ao banco (SRP).
// Regras de negócio, hash de senha e RBAC ficam no service.
//
// Decisões importantes:
//   - password_hash NUNCA retorna em métodos públicos de leitura.
//     Apenas findByEmailWithPassword e findByIdWithPassword o expõem,
//     exclusivamente para o fluxo de auth e troca de senha.
//   - Vínculo user ↔ team passa pela tabela pivô UserTeams —
//     sync de times feito aqui via transação para garantir atomicidade.
//   - Listagem sempre paginada.
// ─────────────────────────────────────────────

// Select seguro — todos os campos exceto password_hash
const safeUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  phone_1_ddd: true,
  phone_1_number: true,
  phone_2_ddd: true,
  phone_2_number: true,
  address_street: true,
  address_number: true,
  address_complement: true,
  address_neighborhood: true,
  address_city: true,
  address_state: true,
  address_zip: true,
  is_active: true,
  created_at: true,
  updated_at: true,
  created_by_user_id: true,
  updated_by_user_id: true,
  user_teams: {
    where: { is_active: true },
    select: {
      id: true,
      team_id: true,
      team: {
        select: {
          id: true,
          name: true,
          store_id: true,
          is_active: true,
        },
      },
    },
  },
} as const satisfies Prisma.UsersSelect;

export type SafeUser = Prisma.UsersGetPayload<{ select: typeof safeUserSelect }>;

// ─── Filtros da listagem ──────────────────────────────
// Os campos *_scope são INJETADOS PELO SERVICE conforme o role do actor;
// nunca chegam do cliente diretamente.
export interface ListUsersFilters {
  page: number;
  pageSize: number;
  role?: string;
  team_id?: string;
  search?: string;
  is_active?: boolean;
  // Restrição de escopo aplicada pelo service (ex.: MANAGER só vê seus times)
  team_ids_scope?: string[];
}

export class UsersRepository {
  // ─── LEITURA ──────────────────────────────────────

  async findMany(
    filters: ListUsersFilters
  ): Promise<{ data: SafeUser[]; total: number }> {
    const where: Prisma.UsersWhereInput = {};

    if (filters.is_active !== undefined) where.is_active = filters.is_active;
    if (filters.role) where.role = filters.role;

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Restrição de times: intersecta filtro livre com escopo do actor.
    // Ambos vão para AND para que se reforcem mutuamente.
    const teamConditions: Prisma.UsersWhereInput[] = [];

    if (filters.team_ids_scope && filters.team_ids_scope.length > 0) {
      teamConditions.push({
        user_teams: {
          some: { team_id: { in: filters.team_ids_scope }, is_active: true },
        },
      });
    }

    if (filters.team_id) {
      teamConditions.push({
        user_teams: {
          some: { team_id: filters.team_id, is_active: true },
        },
      });
    }

    if (teamConditions.length > 0) {
      where.AND = teamConditions;
    }

    // Fallback explícito: Prisma 7 não aceita skip=undefined quando take
    // está presente — NaN também é rejeitado. Garante valores válidos mesmo
    // que o caller não tenha aplicado defaults antes de chamar o repository.
    const page     = filters.page     ?? 1;
    const pageSize = filters.pageSize ?? 20;
    const skip     = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      prisma.users.findMany({
        where,
        select: safeUserSelect,
        skip,
        take: pageSize,
        orderBy: { created_at: "desc" },
      }),
      prisma.users.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<SafeUser | null> {
    return prisma.users.findUnique({ where: { id }, select: safeUserSelect });
  }

  async findByEmail(email: string): Promise<SafeUser | null> {
    return prisma.users.findUnique({
      where: { email },
      select: safeUserSelect,
    });
  }

  // Retorna password_hash — uso exclusivo do fluxo de auth e troca de senha.
  async findByEmailWithPassword(email: string) {
    return prisma.users.findUnique({
      where: { email },
      select: { ...safeUserSelect, password_hash: true },
    });
  }

  async findByIdWithPassword(id: string) {
    return prisma.users.findUnique({
      where: { id },
      select: { ...safeUserSelect, password_hash: true },
    });
  }

  // ─── ESCRITA ──────────────────────────────────────

  // Cria usuário e, opcionalmente, vincula a times — tudo em uma transação.
  async create(params: {
    data: Prisma.UsersCreateInput;
    team_ids?: string[];
    actorId: string;
  }): Promise<SafeUser> {
    const { data, team_ids, actorId } = params;

    return prisma.$transaction(async (tx) => {
      const user = await tx.users.create({ data });

      if (team_ids && team_ids.length > 0) {
        await tx.userTeams.createMany({
          data: team_ids.map((team_id) => ({
            user_id: user.id,
            team_id,
            created_by_user_id: actorId,
          })),
          skipDuplicates: true,
        });
      }

      return tx.users.findUniqueOrThrow({
        where: { id: user.id },
        select: safeUserSelect,
      });
    });
  }

  // Atualiza dados e, se team_ids fornecido, sincroniza vínculos — tudo em transação.
  // Estratégia de sync: desativa todos os vínculos atuais e recria/reativa só os enviados.
  // Mantemos histórico (não deletamos UserTeams) — útil para auditoria.
  async update(params: {
    id: string;
    data: Prisma.UsersUpdateInput;
    team_ids?: string[];
    actorId: string;
  }): Promise<SafeUser> {
    const { id, data, team_ids, actorId } = params;

    return prisma.$transaction(async (tx) => {
      await tx.users.update({ where: { id }, data });

      if (team_ids !== undefined) {
        await tx.userTeams.updateMany({
          where: { user_id: id },
          data: { is_active: false },
        });

        for (const team_id of team_ids) {
          await tx.userTeams.upsert({
            where: { user_id_team_id: { user_id: id, team_id } },
            update: { is_active: true },
            create: {
              user_id: id,
              team_id,
              is_active: true,
              created_by_user_id: actorId,
            },
          });
        }
      }

      return tx.users.findUniqueOrThrow({
        where: { id },
        select: safeUserSelect,
      });
    });
  }

  // Soft delete: marca is_active=false, preserva histórico e vínculos.
  async softDelete(params: {
    id: string;
    actorId: string;
  }): Promise<SafeUser> {
    const { id, actorId } = params;

    return prisma.users.update({
      where: { id },
      data: { is_active: false, updated_by_user_id: actorId },
      select: safeUserSelect,
    });
  }

  // Hard delete: exclusão física. O schema tem onDelete: Cascade em UserTeams,
  // SetNull em Leads e Negotiations, SetNull em SystemLogs — o Prisma propaga.
  async hardDelete(id: string): Promise<void> {
    await prisma.users.delete({ where: { id } });
  }

  // ─── HELPERS ──────────────────────────────────────

  // IDs dos times ativos do usuário — usado pelo service para montar escopos.
  async findActiveTeamIds(userId: string): Promise<string[]> {
    const rows = await prisma.userTeams.findMany({
      where: { user_id: userId, is_active: true },
      select: { team_id: true },
    });
    return rows.map((r) => r.team_id);
  }
}