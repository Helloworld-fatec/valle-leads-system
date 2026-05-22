// server/src/modules/negotiation-stage-history/negotiationStageHistory.dto.ts
import { z } from "zod";

// ─────────────────────────────────────────────
// NEGOTIATION STAGE HISTORY DTOS
// ─────────────────────────────────────────────

// Estágios do funil de vendas conforme definido no documento de elicitação (seção 7).
// Os dois estágios de fechamento disparam a criação automática de um status "closed"
// na negociação pai (regra implementada no service).
export const NegotiationStageEnum = z.enum([
  "qualificacao",
  "contato_inicial",
  "visita",
  "proposta",
  "negociacao",
  "fechamento_com_venda",
  "fechamento_sem_venda",
]);

// Estágios que representam encerramento da negociação — ao registrá-los,
// o service cria automaticamente um NegotiationStatus "closed".
export const CLOSING_STAGES = new Set<NegotiationStage>([
  "fechamento_com_venda",
  "fechamento_sem_venda",
]);

export const CreateNegotiationStageHistorySchema = z.object({
  negotiation_id: z.string().uuid("negotiation_id deve ser um UUID válido"),

  // Estágio anterior — opcional pois o lead pode não ter histórico prévio.
  // Nomeado old_stage para alinhar com o campo real do schema Prisma.
  old_stage: NegotiationStageEnum.nullable().optional(),

  // Novo estágio obrigatório — toda mudança deve registrar para onde o funil avançou/retrocedeu.
  // Nomeado new_stage para alinhar com o campo real do schema Prisma.
  new_stage: NegotiationStageEnum,

  // Observação livre sobre a mudança de estágio
  notes: z
    .string()
    .max(500, { message: "A observação não pode exceder 500 caracteres" })
    .optional(),
});

export const UpdateNegotiationStageHistorySchema = z.object({
  // Apenas notas podem ser corrigidas em um registro histórico existente.
  // Alterar old_stage/new_stage distorceria a linha do tempo — não permitido.
  notes: z.string().max(500).optional(),
});

export const QueryNegotiationStageHistorySchema = z.object({
  negotiation_id: z.string().uuid().optional(),

  // Filtro pelo estágio de destino registrado
  new_stage: NegotiationStageEnum.optional(),

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
