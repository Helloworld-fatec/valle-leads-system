// server/src/modules/negotiation-status/status.repository.ts
import { prisma, Prisma } from "../../config/prisma";
import type {
  CreateNegotiationStatusDTO,
  UpdateNegotiationStatusDTO,
  QueryNegotiationStatusDTO,
} from "./status.dto";

// ─────────────────────────────────────────────
// INCLUDES REUTILIZÁVEIS
// ─────────────────────────────────────────────

// Include da listagem — dados básicos da negociação pai para contexto do card.
const statusListInclude = {
  negotiations: {
    select: {
      id: true,
      team_id: true,
      lead_id: true,
      customer_id: true,
      attendant_id: true,
    },
  },
} as const satisfies Prisma.NegotiationStatusInclude;

// Include do detalhe — negociação completa para contexto rico no endpoint /:id.
const statusDetailInclude = {
  negotiations: {
    select: {
      id: true,
      team_id: true,
      lead_id: true,
      customer_id: true,
      attendant_id: true,
      // Último estágio para complementar o contexto do status
      stage_history: {
        orderBy: { created_at: "desc" as const },
        take: 1,
        select: { new_stage: true },
      },
    },
  },
} as const satisfies Prisma.NegotiationStatusInclude;

// ─────────────────────────────────────────────
// TIPOS DERIVADOS
// ─────────────────────────────────────────────

export type StatusListItem = Prisma.NegotiationStatusGetPayload<{
  include: typeof statusListInclude;
}>;

export type StatusDetail = Prisma.NegotiationStatusGetPayload<{
  include: typeof statusDetailInclude;
}>;

// ─────────────────────────────────────────────
// PAYLOAD DE CRIAÇÃO (com auditoria já resolvida pelo service)
// ─────────────────────────────────────────────

export interface CreateStatusPayload extends CreateNegotiationStatusDTO {
  lead_id: string;
  created_by_user_id: string;
}

// ─────────────────────────────────────────────
// REPOSITÓRIO
// ─────────────────────────────────────────────

export const NegotiationStatusRepository = {
  // ──────────────────────────────────────────────────────
  // LEITURA
  // ──────────────────────────────────────────────────────

  async findAll(
    filters: QueryNegotiationStatusDTO
  ): Promise<StatusListItem[]> {
    const { negotiation_id, status_negotiation, page, limit } = filters;

    return prisma.negotiationStatus.findMany({
      where: {
        ...(negotiation_id && { negotiation_id }),
        ...(status_negotiation && { status_negotiation }),
      },
      include: statusListInclude,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
    });
  },

  async findById(id: string): Promise<StatusDetail | null> {
    return prisma.negotiationStatus.findUnique({
      where: { id },
      include: statusDetailInclude,
    });
  },

  // Busca o status mais recente de uma negociação — usado pelo service para
  // validar se já está "closed" antes de aceitar um novo registro.
  async findCurrentByNegotiationId(negotiationId: string) {
    return prisma.negotiationStatus.findFirst({
      where: { negotiation_id: negotiationId },
      orderBy: { created_at: "desc" },
      select: { status_negotiation: true },
    });
  },

  // Retorna todo o histórico de uma negociação em ordem cronológica crescente.
  async findByNegotiationId(negotiationId: string) {
    return prisma.negotiationStatus.findMany({
      where: { negotiation_id: negotiationId },
      orderBy: { created_at: "asc" },
    });
  },

  // ──────────────────────────────────────────────────────
  // ESCRITA
  // ──────────────────────────────────────────────────────

  // Registra um novo status na linha do tempo da negociação.
  // lead_id e created_by_user_id são obrigatórios e vêm resolvidos pelo service.
  async create(payload: CreateStatusPayload): Promise<StatusDetail> {
    const record = await prisma.negotiationStatus.create({
      data: {
        negotiation_id: payload.negotiation_id,
        lead_id: payload.lead_id,
        status_negotiation: payload.status_negotiation,
        notes: payload.notes ?? null,
        created_by_user_id: payload.created_by_user_id,
        updated_by_user_id: payload.created_by_user_id,
      },
    });

    // Recarrega com include completo para retorno consistente.
    const result = await prisma.negotiationStatus.findUnique({
      where: { id: record.id },
      include: statusDetailInclude,
    });
    return result!;
  },

  // Apenas notas podem ser corrigidas — status_negotiation é imutável
  // após o registro para preservar a integridade do histórico.
  async update(
    id: string,
    data: UpdateNegotiationStatusDTO & { updated_by_user_id: string }
  ): Promise<StatusDetail> {
    await prisma.negotiationStatus.update({
      where: { id },
      data: {
        ...(data.notes !== undefined && { notes: data.notes }),
        updated_by_user_id: data.updated_by_user_id,
      },
    });

    const result = await prisma.negotiationStatus.findUnique({
      where: { id },
      include: statusDetailInclude,
    });
    return result!;
  },

  // Delete físico — NegotiationStatus não tem is_active no schema.
  async delete(id: string): Promise<void> {
    await prisma.negotiationStatus.delete({ where: { id } });
  },
};
