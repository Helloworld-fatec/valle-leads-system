// server/src/modules/negotiation-importance/importance.repository.ts
import { prisma, Prisma } from "../../config/prisma";
import type {
  CreateNegotiationImportanceDTO,
  UpdateNegotiationImportanceDTO,
  QueryNegotiationImportanceDTO,
} from "./importance.dto";

// ─────────────────────────────────────────────
// INCLUDES REUTILIZÁVEIS
// ─────────────────────────────────────────────

// Include da listagem — dados básicos da negociação pai para contexto do card.
const importanceListInclude = {
  negotiations: {
    select: {
      id: true,
      team_id: true,
      lead_id: true,
      customer_id: true,
      attendant_id: true,
    },
  },
} as const satisfies Prisma.NegotiationImportanceInclude;

// Include do detalhe — negociação com último status para contexto rico no /:id.
const importanceDetailInclude = {
  negotiations: {
    select: {
      id: true,
      team_id: true,
      lead_id: true,
      customer_id: true,
      attendant_id: true,
      status_history: {
        orderBy: { created_at: "desc" as const },
        take: 1,
        select: { status_negotiation: true },
      },
    },
  },
} as const satisfies Prisma.NegotiationImportanceInclude;

// ─────────────────────────────────────────────
// TIPOS DERIVADOS
// ─────────────────────────────────────────────

export type ImportanceListItem = Prisma.NegotiationImportanceGetPayload<{
  include: typeof importanceListInclude;
}>;

export type ImportanceDetail = Prisma.NegotiationImportanceGetPayload<{
  include: typeof importanceDetailInclude;
}>;

// ─────────────────────────────────────────────
// PAYLOAD DE CRIAÇÃO (com auditoria já resolvida pelo service)
// ─────────────────────────────────────────────

export interface CreateImportancePayload extends CreateNegotiationImportanceDTO {
  lead_id: string;
  created_by_user_id: string;
}

// ─────────────────────────────────────────────
// REPOSITÓRIO
// ─────────────────────────────────────────────

export const NegotiationImportanceRepository = {
  // ──────────────────────────────────────────────────────
  // LEITURA
  // ──────────────────────────────────────────────────────

  async findAll(
    filters: QueryNegotiationImportanceDTO
  ): Promise<ImportanceListItem[]> {
    const { negotiation_id, importance, page, limit } = filters;

    // Fallback de segurança para evitar NaN no cálculo do Prisma
    const p = page ?? 1;
    const l = limit ?? 20;

    return prisma.negotiationImportance.findMany({
      where: {
        ...(negotiation_id && { negotiation_id }),
        ...(importance && { importance }),
      },
      include: importanceListInclude,
      skip: (p - 1) * l,
      take: l,
      orderBy: { created_at: "desc" },
    });
  },

  async findById(id: string): Promise<ImportanceDetail | null> {
    return prisma.negotiationImportance.findUnique({
      where: { id },
      include: importanceDetailInclude,
    });
  },

  // Busca a importância mais recente de uma negociação — usado pelo service
  // para aplicar a RN17 (impede registro duplicado seguido).
  async findCurrentByNegotiationId(negotiationId: string) {
    return prisma.negotiationImportance.findFirst({
      where: { negotiation_id: negotiationId },
      orderBy: { created_at: "desc" },
      select: { importance: true },
    });
  },

  // Retorna todo o histórico de uma negociação em ordem cronológica crescente.
  async findByNegotiationId(negotiationId: string) {
    return prisma.negotiationImportance.findMany({
      where: { negotiation_id: negotiationId },
      orderBy: { created_at: "asc" },
    });
  },

  // ──────────────────────────────────────────────────────
  // ESCRITA
  // ──────────────────────────────────────────────────────

  // Registra um novo nível de importância na linha do tempo (RN17).
  // lead_id e created_by_user_id são obrigatórios e vêm resolvidos pelo service.
  async create(payload: CreateImportancePayload): Promise<ImportanceDetail> {
    const record = await prisma.negotiationImportance.create({
      data: {
        negotiation_id: payload.negotiation_id,
        lead_id: payload.lead_id,
        importance: payload.importance,
        notes: payload.notes ?? null,
        created_by_user_id: payload.created_by_user_id,
        updated_by_user_id: payload.created_by_user_id,
      },
    });

    // Recarrega com include completo para retorno consistente.
    const result = await prisma.negotiationImportance.findUnique({
      where: { id: record.id },
      include: importanceDetailInclude,
    });
    return result!;
  },

  // Apenas notas podem ser corrigidas — importance é imutável após o registro
  // para preservar a integridade da linha do tempo histórica.
  async update(
    id: string,
    data: UpdateNegotiationImportanceDTO & { updated_by_user_id: string }
  ): Promise<ImportanceDetail> {
    await prisma.negotiationImportance.update({
      where: { id },
      data: {
        ...(data.notes !== undefined && { notes: data.notes }),
        updated_by_user_id: data.updated_by_user_id,
      },
    });

    const result = await prisma.negotiationImportance.findUnique({
      where: { id },
      include: importanceDetailInclude,
    });
    return result!;
  },

  // Delete físico — NegotiationImportance não tem is_active no schema.
  async delete(id: string): Promise<void> {
    await prisma.negotiationImportance.delete({ where: { id } });
  },
};
