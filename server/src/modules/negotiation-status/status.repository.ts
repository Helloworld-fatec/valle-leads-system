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
  // SYNC LEAD STATUS (redundância de domínio)
  // ──────────────────────────────────────────────────────
  // Recalcula o status atual do lead consultando o histórico de todas as
  // suas negociações e grava o valor no campo `status` de `leads`.
  //
  // Estratégia:
  //   - Busca o registro mais recente (by created_at DESC) de
  //     negotiation_status_history para o lead_id recebido.
  //   - Se não existir nenhum registro (ex: último status foi deletado),
  //     retorna ao valor padrão "new".
  //   - Executa dentro de uma transação opcional: se `tx` for fornecido
  //     (pelo método `create` que já está numa transação), usa-o;
  //     caso contrário, abre sua própria operação atômica.
  //
  // Por que aqui no repository e não no service?
  //   O repository é a única camada que fala com o Prisma diretamente.
  //   Centralizar aqui evita que o service precise conhecer os detalhes
  //   de qual tabela consultar para derivar o status correto.
  async syncLeadStatus(
    leadId: string,
    tx?: Prisma.TransactionClient
  ): Promise<void> {
    const client = tx ?? prisma;

    // Último registro de status_history que pertence a este lead,
    // independente de qual negociação originou.
    const lastRecord = await client.negotiationStatus.findFirst({
      where: { lead_id: leadId },
      orderBy: { created_at: "desc" },
      select: { status_negotiation: true },
    });

    // Se não sobrou nenhum registro (histórico vazio após delete),
    // volta ao status padrão do schema.
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

      // Sincroniza o status do lead logo após a inserção,
      // dentro da mesma transação para garantir atomicidade.
      await NegotiationStatusRepository.syncLeadStatus(payload.lead_id, tx);

      // Recarrega com include completo para retorno consistente.
      const result = await tx.negotiationStatus.findUnique({
        where: { id: record.id },
        include: statusDetailInclude,
      });
      return result!;
    });
  },

  // Apenas notas podem ser corrigidas — status_negotiation é imutável
  // após o registro para preservar a integridade do histórico.
  // Notas não alteram o status do lead, portanto não há necessidade de sync.
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
  // Após excluir o registro, recalcula o status do lead (o penúltimo
  // registro passa a ser o "atual"), dentro da mesma transação.
  async delete(id: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // Carrega o lead_id antes de deletar — após o delete não há como
      // recuperá-lo sem uma query extra fora da transação.
      const record = await tx.negotiationStatus.findUnique({
        where: { id },
        select: { lead_id: true },
      });

      if (!record) return; // Registro já inexistente — nada a fazer.

      await tx.negotiationStatus.delete({ where: { id } });

      // Recalcula: o penúltimo registro (agora o mais recente) passa a ser
      // o status vigente do lead. Se era o único registro, volta a "new".
      await NegotiationStatusRepository.syncLeadStatus(record.lead_id, tx);
    });
  },
};