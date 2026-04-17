// server/src/modules/negotiation-stage-history/negotiationStageHistory.dto.ts
import { z } from "zod";

// ─────────────────────────────────────────────
// NEGOTIATION STAGE HISTORY DTOS
// ─────────────────────────────────────────────

// Estágios do funil de vendas conforme definido no documento de elicitação (seção 7)
export const NegotiationStageEnum = z.enum([
  "qualificacao",
  "contato_inicial",
  "visita",
  "proposta",
  "negociacao",
  "fechamento_com_venda",
  "fechamento_sem_venda",
]);

export const CreateNegotiationStageHistorySchema = z.object({
  // Adicionado negotiation_id para validação no body da requisição
  negotiation_id: z.string().uuid("negotiation_id deve ser um UUID válido"),
  
  // Estágio anterior — opcional pois o lead pode não ter histórico prévio
  old_status: NegotiationStageEnum.nullable().optional(),

  // Novo estágio obrigatório — toda mudança deve registrar para onde o funil avançou/retrocedeu
  new_status: NegotiationStageEnum,

  // Observação livre sobre a mudança de estágio
  notes: z.string().max(500, { message: "A observação não pode exceder 500 caracteres" }).optional(),
});

export const UpdateNegotiationStageHistorySchema = z.object({
  // Tudo opcional para permitir correções pontuais no histórico
  old_status: NegotiationStageEnum.nullable().optional(),
  new_status: NegotiationStageEnum.optional(),
  notes: z.string().max(500).optional(),
});

export const QueryNegotiationStageHistorySchema = z.object({
  negotiation_id: z.string().uuid().optional(),
  new_status: NegotiationStageEnum.optional(),
  
  // Paginação
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

// Inferência de Tipos
export type CreateNegotiationStageHistoryDTO = z.infer<typeof CreateNegotiationStageHistorySchema>;
export type UpdateNegotiationStageHistoryDTO = z.infer<typeof UpdateNegotiationStageHistorySchema>;
export type QueryNegotiationStageHistoryDTO = z.infer<typeof QueryNegotiationStageHistorySchema>;
export type NegotiationStage = z.infer<typeof NegotiationStageEnum>;