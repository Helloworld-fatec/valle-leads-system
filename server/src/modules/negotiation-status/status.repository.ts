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

    // Fallback de segurança para evitar NaN no cálculo do Prisma
    const p = page ?? 1;
    const l = limit ?? 20;

    return prisma.negotiationStatus.findMany({
      where: {
        ...(negotiation_id && { negotiation_id }),
        ...(status_negotiation && { status_negotiation }),
      },
      include: statusListInclude,
      skip: (p - 1) * l,
      take: l,
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
  // validar transições (ex.: bloquear duplicado ou reabertura indevida).
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
  // SYNC LEAD STATUS (redundância de domínio — espelho 1:1)
  // ──────────────────────────────────────────────────────
  // Com o domínio de status unificado (new | open | won | lost) sendo o mesmo
  // para a negociação e para o lead, a sincronização é uma cópia direta: o
  // valor do registro de status mais recente do lead é gravado em leads.status.
  // Não há mais tradução open/closed → new/in_progress/won/lost.
  //
  // Estratégia:
  //   - Pega o registro mais recente (created_at DESC) em
  //     negotiation_status_history para o lead_id recebido.
  //   - Se não houver nenhum (ex.: último status foi deletado), volta a "new".
  //   - Usa a transação `tx` quando fornecida (mantém atomicidade com quem chama);
  //     caso contrário, opera diretamente sobre o prisma.
  async syncLeadStatus(
    leadId: string,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    const client = tx ?? prisma;

    const lastRecord = await client.negotiationStatus.findFirst({
      where: { lead_id: leadId },
      orderBy: { created_at: "desc" },
      select: { status_negotiation: true },
    });

    // Histórico vazio → status padrão do schema.
    const derivedStatus = lastRecord?.status_negotiation ?? "new";

    await client.leads.update({
      where: { id: leadId },
      data: { status: derivedStatus },
    });
  },

  // ──────────────────────────────────────────────────────
  // ESCRITA
  // ──────────────────────────────────────────────────────

  // Registra um novo status na linha do tempo da negociação e sincroniza
  // o campo `status` do lead pai em seguida, dentro da mesma transação.
  async create(payload: CreateStatusPayload): Promise<StatusDetail> {
    return prisma.$transaction(async (tx) => {
      const record = await tx.negotiationStatus.create({
        data: {
          negotiation_id: payload.negotiation_id,
          lead_id: payload.lead_id,
          status_negotiation: payload.status_negotiation,
          notes: payload.notes ?? null,
          created_by_user_id: payload.created_by_user_id,
          updated_by_user_id: payload.created_by_user_id,
        },
      });

      // Espelha o status no lead logo após a inserção, na mesma transação.
      await NegotiationStatusRepository.syncLeadStatus(payload.lead_id, tx);

      const result = await tx.negotiationStatus.findUnique({
        where: { id: record.id },
        include: statusDetailInclude,
      });
      return result!;
    });
  },

  // Apenas notas podem ser corrigidas — status_negotiation é imutável
  // após o registro. Notas não alteram o status do lead, então não há sync.
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

  // Delete físico — após excluir, recalcula o status do lead (o registro
  // anterior passa a ser o "atual"), na mesma transação.
  async delete(id: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const record = await tx.negotiationStatus.findUnique({
        where: { id },
        select: { lead_id: true },
      });

      if (!record) return; // Registro já inexistente — nada a fazer.

      await tx.negotiationStatus.delete({ where: { id } });

      // Recalcula: o penúltimo registro (agora o mais recente) vira o vigente.
      // Se era o único, o lead volta a "new".
      await NegotiationStatusRepository.syncLeadStatus(record.lead_id, tx);
    });
  },
};