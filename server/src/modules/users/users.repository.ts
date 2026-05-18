// server/src/modules/users/users.repository.ts
import { prisma, Prisma } from "../../config/prisma.js";

// ─────────────────────────────────────────────
// USERS REPOSITORY
// ─────────────────────────────────────────────
// Responsabilidade ÚNICA: acesso ao banco de dados (SRP / RNF13).
// Não conhece regras de negócio, não lança erros de domínio,
// não faz hash de senha — apenas executa queries Prisma.
//
// Decisões importantes:
//   - password_hash NUNCA é retornado em métodos públicos de leitura
//     (exceto findByEmailWithPassword, usado pelo módulo de auth).
//   - O vínculo user ↔ team passa pela tabela pivô UserTeams,
//     então o sync de times é feito aqui via transação.
//   - Listagem é sempre paginada (RNF03 — desempenho).
// ─────────────────────────────────────────────

// Campos seguros — tudo, MENOS password_hash
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
} satisfies Prisma.UsersSelect;

export type SafeUser = Prisma.UsersGetPayload<{ select: typeof safeUserSelect }>;

// ─────────────────────────────────────────────
// Filtros aceitos pela listagem
// ─────────────────────────────────────────────
export interface ListUsersFilters {
  page: number;
  pageSize: number;
  role?: string;
  team_id?: string;
  search?: string;
  is_active?: boolean;
  // Restrições aplicadas pela camada de service de acordo com o perfil
  // do solicitante (ex.: manager só vê usuários dos próprios times).
  team_ids_scope?: string[];
}

export class UsersRepository {
  // ─── LEITURA ──────────────────────────────────────

  /**
   * Listagem paginada com filtros.
   * Retorna também o total para que o controller possa montar o envelope de paginação.
   */
  async findMany(filters: ListUsersFilters): Promise<{ data: SafeUser[]; total: number }> {
    const where: Prisma.UsersWhereInput = {};

    if (filters.is_active !== undefined) where.is_active = filters.is_active;
    if (filters.role) where.role = filters.role;

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    // Restrição de escopo via times (aplicada pelo service de acordo com o role)
    const teamScopeConditions: Prisma.UsersWhereInput[] = [];
    if (filters.team_id) {
      teamScopeConditions.push({
        user_teams: { some: { team_id: filters.team_id, is_active: true } },
      });
    }
    if (filters.team_ids_scope && filters.team_ids_scope.length > 0) {
      teamScopeConditions.push({
        user_teams: { some: { team_id: { in: filters.team_ids_scope }, is_active: true } },
      });
    }
    if (teamScopeConditions.length > 0) {
      where.AND = teamScopeConditions;
    }

    const [data, total] = await Promise.all([
      prisma.users.findMany({
        where,
        select: safeUserSelect,
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
        orderBy: { created_at: "desc" },
      }),
      prisma.users.count({ where }),
    ]);

    return { data, total };
  }

  async findById(id: string): Promise<SafeUser | null> {
    return prisma.users.findUnique({
      where: { id },
      select: safeUserSelect,
    });
  }

  async findByEmail(email: string): Promise<SafeUser | null> {
    return prisma.users.findUnique({
      where: { email },
      select: safeUserSelect,
    });
  }

  /**
   * Retorna o usuário incluindo o password_hash.
   * Uso exclusivo do módulo de auth (login) e do fluxo de troca de senha.
   * NÃO usar em endpoints que devolvem dados pro client.
   */
  async findByEmailWithPassword(email: string) {
    return prisma.users.findUnique({
      where: { email },
      select: {
        ...safeUserSelect,
        password_hash: true,
      },
    });
  }

  async findByIdWithPassword(id: string) {
    return prisma.users.findUnique({
      where: { id },
      select: {
        ...safeUserSelect,
        password_hash: true,
      },
    });
  }

  // ─── ESCRITA ──────────────────────────────────────

  /**
   * Cria usuário e, opcionalmente, vincula a uma lista de times — tudo em uma transação
   * (RNF05 — consistência transacional).
   */
  async create(params: {
    data: Prisma.UsersCreateInput;
    team_ids?: string[];
    actorId?: string | null;
  }): Promise<SafeUser> {
    const { data, team_ids, actorId } = params;

    return prisma.$transaction(async (tx) => {
      const user = await tx.users.create({ data });

      if (team_ids && team_ids.length > 0) {
        await tx.userTeams.createMany({
          data: team_ids.map((team_id) => ({
            user_id: user.id,
            team_id,
            created_by_user_id: actorId ?? null,
          })),
          skipDuplicates: true,
        });
      }

      // Retorna o agregado com os times já vinculados
      return tx.users.findUniqueOrThrow({
        where: { id: user.id },
        select: safeUserSelect,
      });
    });
  }

  /**
   * Atualiza dados do usuário e, se team_ids for fornecido, sincroniza os vínculos
   * (desativa os que saíram, ativa/cria os novos). Tudo transacional.
   */
  async update(params: {
    id: string;
    data: Prisma.UsersUpdateInput;
    team_ids?: string[];
    actorId?: string | null;
  }): Promise<SafeUser> {
    const { id, data, team_ids, actorId } = params;

    return prisma.$transaction(async (tx) => {
      await tx.users.update({ where: { id }, data });

      if (team_ids !== undefined) {
        // Estratégia de sync: marca todos os atuais como inativos e recria/reativa só os enviados.
        // Mantemos histórico (não deletamos) — útil para auditoria.
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
              created_by_user_id: actorId ?? null,
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

  /**
   * Soft delete: marca o usuário como inativo.
   * Mantém integridade referencial (RNF05) — não apaga vínculos históricos.
   */
  async softDelete(params: { id: string; actorId?: string | null }): Promise<SafeUser> {
    const { id, actorId } = params;
    return prisma.users.update({
      where: { id },
      data: {
        is_active: false,
        updated_by_user_id: actorId ?? null,
      },
      select: safeUserSelect,
    });
  }

  // ─── HELPERS ──────────────────────────────────────

  /**
   * Retorna apenas os IDs dos times aos quais o usuário pertence ativamente.
   * Usado pelo service para montar o escopo de listagem do MANAGER.
   */
  async findActiveTeamIds(userId: string): Promise<string[]> {
    const rows = await prisma.userTeams.findMany({
      where: { user_id: userId, is_active: true },
      select: { team_id: true },
    });
    return rows.map((r) => r.team_id);
  }
}
