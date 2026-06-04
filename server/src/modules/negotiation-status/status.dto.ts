// server/src/modules/negotiation-status/status.dto.ts
import { z } from "zod";

// ─────────────────────────────────────────────
// NEGOTIATION STATUS DTOS
// ─────────────────────────────────────────────

// Domínio macro UNIFICADO de status — compartilhado entre a negociação e,
// por redundância, o campo `status` do lead (espelhado via syncLeadStatus).
// Como os dois domínios agora são idênticos, a sincronização é 1:1, sem
// necessidade de qualquer mapeamento/tradução.
//
//   "new"  → estado inicial, antes de qualquer movimentação efetiva
//   "open" → negociação aberta / em andamento
//   "won"  → encerrada COM venda  (origem: estágio fechamento_com_venda)
//   "lost" → encerrada SEM venda  (origem: estágio fechamento_sem_venda)
//
// "won" e "lost" são estados TERMINAIS. A granularidade de progresso
// (qualificação, visita, proposta...) continua no histórico de ESTÁGIOS.
export const StatusEnum = z.enum(["new", "open", "won", "lost"]);

export type NegotiationStatus = z.infer<typeof StatusEnum>;

// Estados terminais (negociação encerrada). Reabri-los é operação privilegiada.
export const CLOSED_STATUSES: readonly NegotiationStatus[] = ["won", "lost"];

// Type guard reutilizável — aceita string crua (vinda do banco) e estreita
// para NegotiationStatus quando for um estado terminal.
export function isClosedStatus(status: string): status is NegotiationStatus {
  return (CLOSED_STATUSES as readonly string[]).includes(status);
}

// Transições permitidas entre estados. A chave "__none__" representa a
// ausência de status anterior (primeiro registro da negociação).
//   new  → open
//   open → won | lost
//   won  → open   (reabertura, privilegiada)
//   lost → open   (reabertura, privilegiada)
export const ALLOWED_STATUS_TRANSITIONS: Record<
  string,
  readonly NegotiationStatus[]
> = {
  __none__: ["new", "open"],
  new: ["open"],
  open: ["won", "lost"],
  won: ["open"],
  lost: ["open"],
};

export const CreateNegotiationStatusSchema = z.object({
  negotiation_id: z.string().uuid("negotiation_id deve ser um UUID válido"),
  status_negotiation: StatusEnum,

  // Observação opcional — útil para registrar o motivo do fechamento,
  // por exemplo: "cliente desistiu", "proposta recusada", etc.
  notes: z
    .string()
    .max(500, { message: "A observação não pode exceder 500 caracteres" })
    .optional(),
  // created_by_user_id é injetado pelo controller via req.user (não vem do body)
});

export const UpdateNegotiationStatusSchema = z.object({
  // status_negotiation é imutável após o registro para preservar a linha
  // do tempo histórica — só notas podem ser corrigidas.
  notes: z
    .string()
    .max(500, { message: "A observação não pode exceder 500 caracteres" })
    .optional(),
  // updated_by_user_id é injetado pelo controller via req.user (não vem do body)
});

export const QueryNegotiationStatusSchema = z.object({
  negotiation_id: z
    .string()
    .uuid("negotiation_id deve ser um UUID válido")
    .optional(),
  status_negotiation: StatusEnum.optional(),

  // Paginação — transforma string de query em número e valida intervalo
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
});

// Inferência de Tipos
export type CreateNegotiationStatusDTO = z.infer<
  typeof CreateNegotiationStatusSchema
>;
export type UpdateNegotiationStatusDTO = z.infer<
  typeof UpdateNegotiationStatusSchema
>;
export type QueryNegotiationStatusDTO = z.infer<
  typeof QueryNegotiationStatusSchema
>;