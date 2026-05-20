// src/modules/leads/lead.repository.ts
import { prisma, Prisma } from "../../config/prisma.js";
import type {
  CreateLeadDTO,
  UpdateLeadDTO,
  QueryLeadDTO,
} from "./lead.dtos.js";

// Select padronizado para o atendente embutido nos retornos.
// Mantemos const + satisfies para que o TS infira o tipo exato (sem alargar
// para Prisma.UsersSelect "genérico"), permitindo derivar o payload depois.
const attendantSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const satisfies Prisma.UsersSelect;

// Include reutilizado por todos os retornos de leitura.
// Marcar como const + satisfies dá ao TS o tipo exato deste include,
// o que nos permite derivar LeadWithIncludes via Prisma.LeadsGetPayload.
const leadInclude = {
  customers: true,
  teams: true,
  attendant: { select: attendantSelect },
  interest_item: true,
} as const satisfies Prisma.LeadsInclude;

// Versão com include de negociações — só usada em findById.
const leadIncludeWithNegotiations = {
  ...leadInclude,
  negotiations: true,
} as const satisfies Prisma.LeadsInclude;

// Tipos derivados do Prisma: nos dão o shape exato do retorno, evitando
// `any` em qualquer ponto da camada de aplicação.
export type LeadWithIncludes = Prisma.LeadsGetPayload<{
  include: typeof leadInclude;
}>;
export type LeadWithNegotiations = Prisma.LeadsGetPayload<{
  include: typeof leadIncludeWithNegotiations;
}>;

// Filtros aceitos pela listagem.
// Os campos *_scope são INJETADOS PELO SERVICE conforme o role do actor;
// nunca chegam do cliente. Isso garante que a restrição de escopo não pode
// ser burlada via query string.
export interface FindAllLeadsParams extends QueryLeadDTO {
  attendant_id_scope?: string;
  team_ids_scope?: string[];
  // Força is_active=true ignorando o que veio na query (para ATTENDANT/MANAGER).
  force_active_only?: boolean;
}

// Resultado paginado padrão.
export interface PaginatedLeads {
  data: LeadWithIncludes[];
  total: number;
  page: number;
  limit: number;
}

export class LeadsRepository {
  // Lê uma página de leads aplicando todos os filtros do service.
  async findAll(filters: FindAllLeadsParams): Promise<PaginatedLeads> {
    const where = this.buildWhere(filters);
    const page = filters.page;
    const limit = filters.limit;

    const [data, total] = await Promise.all([
      prisma.leads.findMany({
        where,
        include: leadInclude,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: "desc" },
      }),
      prisma.leads.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  // Monta o WHERE combinando filtros do cliente e restrições de escopo.
  // Lógica importante: o escopo SEMPRE vence sobre o filtro livre.
  // Se um ATTENDANT pedir ?attendant_id=outro, o escopo sobrescreve.
  private buildWhere(filters: FindAllLeadsParams): Prisma.LeadsWhereInput {
    const where: Prisma.LeadsWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.customer_id) where.customer_id = filters.customer_id;
    if (filters.interest_item_id)
      where.interest_item_id = filters.interest_item_id;

    // is_active: força true para perfis sem permissão de ver inativos,
    // caso contrário respeita o filtro do cliente.
    if (filters.force_active_only) {
      where.is_active = true;
    } else if (filters.is_active !== undefined) {
      where.is_active = filters.is_active;
    }

    // Escopo de atendente (ATTENDANT) sobrepõe filtro livre.
    if (filters.attendant_id_scope) {
      where.attendant_id = filters.attendant_id_scope;
    } else if (filters.attendant_id) {
      where.attendant_id = filters.attendant_id;
    }

    // Escopo de times (MANAGER): intersecta com filtro livre se houver.
    if (filters.team_ids_scope && filters.team_ids_scope.length > 0) {
      if (filters.team_id) {
        where.team_id = filters.team_ids_scope.includes(filters.team_id)
          ? filters.team_id
          : { in: [] }; // pediu time fora do escopo → resultado vazio
      } else {
        where.team_id = { in: filters.team_ids_scope };
      }
    } else if (filters.team_id) {
      where.team_id = filters.team_id;
    }

    return where;
  }

  // Busca individual com include rico (inclui negociações).
  async findById(id: string): Promise<LeadWithNegotiations | null> {
    return prisma.leads.findUnique({
      where: { id },
      include: leadIncludeWithNegotiations,
    });
  }

  // Busca em lote para validações de operações bulk (sem includes pesados).
  async findManyByIds(ids: string[]): Promise<
    Pick<
      LeadWithIncludes,
      "id" | "team_id" | "attendant_id" | "is_active"
    >[]
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

  // Cria um lead já com campos de auditoria preenchidos pelo service.
  async create(params: {
    dto: CreateLeadDTO;
    actorId: string;
  }): Promise<LeadWithIncludes> {
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
      include: leadInclude,
    });
  }

  // Atualização parcial. Só copia o que veio no DTO (preserva o restante).
  // attendant_id e interest_item_id aceitam null explícito para desvincular.
  async update(params: {
    id: string;
    dto: UpdateLeadDTO;
    actorId: string;
  }): Promise<LeadWithIncludes> {
    const { id, dto, actorId } = params;

    const data: Prisma.LeadsUpdateInput = {
      updated_by_user_id: actorId,
    };

    if (dto.status !== undefined) data.status = dto.status;
    if (dto.is_active !== undefined) data.is_active = dto.is_active;
    if (dto.source !== undefined) data.source = dto.source ?? null;

    // Relacionamentos: usamos connect/disconnect porque attendant é opcional
    // e queremos suportar desvincular (null) com tipagem correta.
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

  // Soft delete: marca is_active=false e registra quem fez.
  async softDelete(params: {
    id: string;
    actorId: string;
  }): Promise<LeadWithIncludes> {
    const { id, actorId } = params;
    return prisma.leads.update({
      where: { id },
      data: {
        is_active: false,
        updated_by_user_id: actorId,
      },
      include: leadInclude,
    });
  }

  // Exclusão permanente. Em cascata pelo schema: status_history,
  // stage_history e importance_history são apagados; negociações têm
  // onDelete: Restrict, então o Prisma vai recusar a exclusão se existirem
  // negociações vinculadas — o service trata e devolve mensagem clara.
  async hardDelete(id: string): Promise<void> {
    await prisma.leads.delete({ where: { id } });
  }

  // Atribuição em lote de atendente. Faz UPDATE direto no banco para
  // performance — uma única instrução SQL em vez de N updates.
  async bulkAssignAttendant(params: {
    leadIds: string[];
    attendantId: string;
    actorId: string;
  }): Promise<{ count: number }> {
    const { leadIds, attendantId, actorId } = params;
    const result = await prisma.leads.updateMany({
      where: { id: { in: leadIds } },
      data: {
        attendant_id: attendantId,
        updated_by_user_id: actorId,
      },
    });
    return { count: result.count };
  }

  // Atribuição em lote de equipe. Ao mover entre times, zera o attendant
  // (atendente antigo pode não pertencer ao novo time — fica inconsistente).
  // O reatribuir vira responsabilidade do manager do novo time.
  async bulkAssignTeam(params: {
    leadIds: string[];
    teamId: string;
    actorId: string;
  }): Promise<{ count: number }> {
    const { leadIds, teamId, actorId } = params;
    const result = await prisma.leads.updateMany({
      where: { id: { in: leadIds } },
      data: {
        team_id: teamId,
        attendant_id: null,
        updated_by_user_id: actorId,
      },
    });
    return { count: result.count };
  }

  // Lookup leve de team para validação no service (sem trazer dados pesados).
  async findTeamForValidation(
    teamId: string
  ): Promise<{ id: string; is_active: boolean } | null> {
    return prisma.teams.findUnique({
      where: { id: teamId },
      select: { id: true, is_active: true },
    });
  }

  // Lookup leve de atendente para validar role, atividade e pertinência ao time.
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
