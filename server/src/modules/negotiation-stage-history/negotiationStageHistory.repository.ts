// server/src/modules/negotiation-stage-history/negotiationStageHistory.repository.ts
import { prisma, Prisma } from "../../config/prisma";
import { NegotiationStatusRepository } from "../negotiation-status/status.repository";
import type { NegotiationStatus } from "../negotiation-status/status.dto";
import type {
  CreateNegotiationStageHistoryDTO,
  UpdateNegotiationStageHistoryDTO,
  QueryNegotiationStageHistoryDTO,
} from "./negotiationStageHistory.dto";

// ─────────────────────────────────────────────
// INCLUDES REUTILIZÁVEIS
// ─────────────────────────────────────────────

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

// Payload do fechamento atômico: além do estágio, carrega o status terminal
// (won/lost) já resolvido pelo service e a nota explicativa do status.
export interface CreateWithAutoClosePayload extends CreateStageHistoryPayload {
  closingStatus: NegotiationStatus;
  statusNotes: string;
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

    const p = page ?? 1;
    const l = limit ?? 20;

    return prisma.negotiationStageHistory.findMany({
      where: {
        ...(negotiation_id && { negotiation_id }),
        ...(new_stage && { new_stage }),
      },
      include: stageHistoryListInclude,
      skip: (p - 1) * l,
      take: l,
      orderBy: { created_at: "desc" },
    });
  },

  async findById(id: string): Promise<StageHistoryDetail | null> {
    return prisma.negotiationStageHistory.findUnique({
      where: { id },
      include: stageHistoryDetailInclude,
    });
  },

  // Estágio mais recente (para popular old_stage automaticamente).
  async findCurrentByNegotiationId(negotiationId: string) {
    return prisma.negotiationStageHistory.findFirst({
      where: { negotiation_id: negotiationId },
      orderBy: { created_at: "desc" },
      select: { new_stage: true },
    });
  },

  async findByNegotiationId(negotiationId: string) {
    return prisma.negotiationStageHistory.findMany({
      where: { negotiation_id: negotiationId },
      orderBy: { created_at: "asc" },
    });
  },

  // ──────────────────────────────────────────────────────
  // ESCRITA — caso simples (sem fechar a negociação)
  // ──────────────────────────────────────────────────────

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

    const result = await prisma.negotiationStageHistory.findUnique({
      where: { id: record.id },
      include: stageHistoryDetailInclude,
    });
    return result!;
  },

  // ──────────────────────────────────────────────────────
  // ESCRITA — estágio de fechamento (transação atômica)
  // ──────────────────────────────────────────────────────
  // Para fechamento_com_venda / fechamento_sem_venda, numa única transação:
  //   1. Cria o registro de estágio
  //   2. Cria o NegotiationStatus terminal correspondente (won/lost)
  //   3. Espelha o status no lead (syncLeadStatus)
  // Se qualquer passo falhar, nada é persistido — stage, status e lead
  // permanecem sempre consistentes entre si.
  async createWithAutoClose(
    payload: CreateWithAutoClosePayload
  ): Promise<StageHistoryDetail> {
    const stageRecord = await prisma.$transaction(async (tx) => {
      // 1. Registra o estágio de fechamento
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

      // 2. Registra o status terminal (won/lost) derivado do estágio
      await tx.negotiationStatus.create({
        data: {
          negotiation_id: payload.negotiation_id,
          lead_id: payload.lead_id,
          status_negotiation: payload.closingStatus,
          notes: payload.statusNotes,
          created_by_user_id: payload.created_by_user_id,
          updated_by_user_id: payload.created_by_user_id,
        },
      });

      // 3. Espelha o status no lead, na mesma transação.
      await NegotiationStatusRepository.syncLeadStatus(payload.lead_id, tx);

      return stage;
    });

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