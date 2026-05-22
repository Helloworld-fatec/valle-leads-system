// server/src/modules/negotiation-stage-history/negotiationStageHistory.repository.ts
import { prisma, Prisma } from "../../config/prisma";
import type {
  CreateNegotiationStageHistoryDTO,
  UpdateNegotiationStageHistoryDTO,
  QueryNegotiationStageHistoryDTO,
} from "./negotiationStageHistory.dto";

// ─────────────────────────────────────────────
// INCLUDES REUTILIZÁVEIS
// ─────────────────────────────────────────────

// Include usado na listagem — dados básicos da negociação pai para contexto.
const stageHistoryListInclude = {
  negotiations: {
    select: {
      id: true,
      team_id: true,
      lead_id: true,
      customer_id: true,
    },
  },
} as const satisfies Prisma.NegotiationStageHistoryInclude;

// Include usado no detalhe — negociação completa com último status.
const stageHistoryDetailInclude = {
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
} as const satisfies Prisma.NegotiationStageHistoryInclude;

// ─────────────────────────────────────────────
// TIPOS DERIVADOS
// ─────────────────────────────────────────────

export type StageHistoryListItem = Prisma.NegotiationStageHistoryGetPayload<{
  include: typeof stageHistoryListInclude;
}>;

export type StageHistoryDetail = Prisma.NegotiationStageHistoryGetPayload<{
  include: typeof stageHistoryDetailInclude;
}>;

// ─────────────────────────────────────────────
// PAYLOAD DE CRIAÇÃO (com auditoria já resolvida)
// ─────────────────────────────────────────────

export interface CreateStageHistoryPayload
  extends CreateNegotiationStageHistoryDTO {
  lead_id: string;
  created_by_user_id: string;
}

// ─────────────────────────────────────────────
// REPOSITÓRIO
// ─────────────────────────────────────────────

export const NegotiationStageHistoryRepository = {
  // ──────────────────────────────────────────────────────
  // LEITURA
  // ──────────────────────────────────────────────────────

  async findAll(
    filters: QueryNegotiationStageHistoryDTO
  ): Promise<StageHistoryListItem[]> {
    const { negotiation_id, new_stage, page, limit } = filters;

    return prisma.negotiationStageHistory.findMany({
      where: {
        ...(negotiation_id && { negotiation_id }),
        ...(new_stage && { new_stage }),
      },
      include: stageHistoryListInclude,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
    });
  },

  async findById(id: string): Promise<StageHistoryDetail | null> {
    return prisma.negotiationStageHistory.findUnique({
      where: { id },
      include: stageHistoryDetailInclude,
    });
  },

  // Retorna o estágio mais recente de uma negociação (para popular old_stage automaticamente).
  async findCurrentByNegotiationId(negotiationId: string) {
    return prisma.negotiationStageHistory.findFirst({
      where: { negotiation_id: negotiationId },
      orderBy: { created_at: "desc" },
      select: { new_stage: true },
    });
  },

  // Retorna todo o histórico de uma negociação em ordem cronológica crescente.
  async findByNegotiationId(negotiationId: string) {
    return prisma.negotiationStageHistory.findMany({
      where: { negotiation_id: negotiationId },
      orderBy: { created_at: "asc" },
    });
  },

  // ──────────────────────────────────────────────────────
  // ESCRITA — caso simples (sem fechar a negociação)
  // ──────────────────────────────────────────────────────

  // Registra um novo estágio na linha do tempo. Campos de auditoria já vêm
  // resolvidos pelo service (lead_id derivado da negociação, actorId do JWT).
  async create(payload: CreateStageHistoryPayload): Promise<StageHistoryDetail> {
    const record = await prisma.negotiationStageHistory.create({
      data: {
        negotiation_id: payload.negotiation_id,
        lead_id: payload.lead_id,
        old_stage: payload.old_stage ?? null,
        new_stage: payload.new_stage,
        notes: payload.notes ?? null,
        created_by_user_id: payload.created_by_user_id,
        updated_by_user_id: payload.created_by_user_id,
      },
    });

    // Recarrega com include completo para retorno consistente.
    const result = await prisma.negotiationStageHistory.findUnique({
      where: { id: record.id },
      include: stageHistoryDetailInclude,
    });
    return result!;
  },

  // ──────────────────────────────────────────────────────
  // ESCRITA — estágio de fechamento (transação atômica)
  // ──────────────────────────────────────────────────────

  // Quando new_stage é "fechamento_com_venda" ou "fechamento_sem_venda":
  //   1. Cria o registro de estágio
  //   2. Cria automaticamente um NegotiationStatus "closed" na mesma transação
  // Se qualquer passo falhar, nada é persistido.
  async createWithAutoClose(payload: CreateStageHistoryPayload & {
    statusNotes: string;
  }): Promise<StageHistoryDetail> {
    const stageRecord = await prisma.$transaction(async (tx) => {
      // 1. Registra o novo estágio de fechamento
      const stage = await tx.negotiationStageHistory.create({
        data: {
          negotiation_id: payload.negotiation_id,
          lead_id: payload.lead_id,
          old_stage: payload.old_stage ?? null,
          new_stage: payload.new_stage,
          notes: payload.notes ?? null,
          created_by_user_id: payload.created_by_user_id,
          updated_by_user_id: payload.created_by_user_id,
        },
      });

      // 2. Fecha a negociação automaticamente
      await tx.negotiationStatus.create({
        data: {
          negotiation_id: payload.negotiation_id,
          lead_id: payload.lead_id,
          status_negotiation: "closed",
          notes: payload.statusNotes,
          created_by_user_id: payload.created_by_user_id,
          updated_by_user_id: payload.created_by_user_id,
        },
      });

      return stage;
    });

    // Recarrega com include completo fora da transação.
    const result = await prisma.negotiationStageHistory.findUnique({
      where: { id: stageRecord.id },
      include: stageHistoryDetailInclude,
    });
    return result!;
  },

  // ──────────────────────────────────────────────────────
  // ATUALIZAÇÃO — apenas notas (histórico é imutável)
  // ──────────────────────────────────────────────────────

  async update(
    id: string,
    data: UpdateNegotiationStageHistoryDTO & { updated_by_user_id: string }
  ): Promise<StageHistoryDetail> {
    await prisma.negotiationStageHistory.update({
      where: { id },
      data: {
        // Apenas notas podem ser corrigidas — old_stage e new_stage são
        // imutáveis após o registro para preservar a integridade do histórico.
        ...(data.notes !== undefined && { notes: data.notes }),
        updated_by_user_id: data.updated_by_user_id,
      },
    });

    const result = await prisma.negotiationStageHistory.findUnique({
      where: { id },
      include: stageHistoryDetailInclude,
    });
    return result!;
  },

  // ──────────────────────────────────────────────────────
  // EXCLUSÃO
  // ──────────────────────────────────────────────────────

  async delete(id: string): Promise<void> {
    await prisma.negotiationStageHistory.delete({ where: { id } });
  },
};
