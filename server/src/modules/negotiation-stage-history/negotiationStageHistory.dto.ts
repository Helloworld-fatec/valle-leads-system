// server/src/modules/negotiation-stage-history/negotiationStageHistory.dto.ts
import { z } from "zod";
import type { NegotiationStatus } from "../negotiation-status/status.dto";

// ─────────────────────────────────────────────
// NEGOTIATION STAGE HISTORY DTOS
// ─────────────────────────────────────────────

// Estágios do funil de vendas conforme o documento de elicitação (seção 7).
// Os dois estágios de fechamento disparam a criação automática do status
// terminal correspondente (won/lost) na negociação pai — ver service.
export const NegotiationStageEnum = z.enum([
  "qualificacao",
  "contato_inicial",
  "visita",
  "proposta",
  "negociacao",
  "fechamento_com_venda",
  "fechamento_sem_venda",
]);

// Estágios que encerram a negociação.
export const CLOSING_STAGES = new Set<NegotiationStage>([
  "fechamento_com_venda",
  "fechamento_sem_venda",
]);

// FONTE ÚNICA da regra "estágio de fechamento → status terminal".
// `as const satisfies` garante que os valores são NegotiationStatus válidos
// e preserva os literais ("won" | "lost") para inferência precisa no service.
export const CLOSING_STAGE_TO_STATUS = {
  fechamento_com_venda: "won",
  fechamento_sem_venda: "lost",
} as const satisfies Record<string, NegotiationStatus>;

export type ClosingStage = keyof typeof CLOSING_STAGE_TO_STATUS;

// Type guard: estreita um NegotiationStage para ClosingStage, permitindo
// indexar CLOSING_STAGE_TO_STATUS sem casts.
export function isClosingStage(stage: NegotiationStage): stage is ClosingStage {
  return stage in CLOSING_STAGE_TO_STATUS;
}

export const CreateNegotiationStageHistorySchema = z.object({
  negotiation_id: z.string().uuid("negotiation_id deve ser um UUID válido"),

  // Estágio anterior — opcional pois o lead pode não ter histórico prévio.
  old_stage: NegotiationStageEnum.nullable().optional(),

  // Novo estágio obrigatório — toda mudança deve registrar o destino do funil.
  new_stage: NegotiationStageEnum,

  // Observação livre sobre a mudança de estágio
  notes: z
    .string()
    .max(500, { message: "A observação não pode exceder 500 caracteres" })
    .optional(),
});

export const UpdateNegotiationStageHistorySchema = z.object({
  // Apenas notas podem ser corrigidas — old_stage/new_stage são imutáveis.
  notes: z.string().max(500).optional(),
});

export const QueryNegotiationStageHistorySchema = z.object({
  negotiation_id: z.string().uuid().optional(),

  new_stage: NegotiationStageEnum.optional(),

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
export type CreateNegotiationStageHistoryDTO = z.infer<
  typeof CreateNegotiationStageHistorySchema
>;
export type UpdateNegotiationStageHistoryDTO = z.infer<
  typeof UpdateNegotiationStageHistorySchema
>;
export type QueryNegotiationStageHistoryDTO = z.infer<
  typeof QueryNegotiationStageHistorySchema
>;
export type NegotiationStage = z.infer<typeof NegotiationStageEnum>;