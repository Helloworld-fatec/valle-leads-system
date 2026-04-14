import { z } from "zod"

// Estágios do funil de vendas conforme definido no documento de elicitação (seção 7)
const negotiationStageEnum = z.enum([
  "contato_inicial",
  "visita",
  "proposta",
  "negociacao",
  "fechamento_com_venda",
  "fechamento_sem_venda",
])

export const createNegotiationStageHistorySchema = z.object({
  // Estágio anterior — opcional pois o lead pode não ter histórico prévio (ex: primeiro registro)
  old_status: negotiationStageEnum.nullable().optional(),

  // Novo estágio obrigatório — toda mudança deve registrar para onde o funil avançou/retrocedeu
  new_status: negotiationStageEnum,

  // Observação livre sobre a mudança de estágio — opcional (RN16)
  notes: z
    .string()
    .max(500, { message: "Notes must not exceed 500 characters" })
    .optional(),
})

export type CreateNegotiationStageHistoryDTO = z.infer<
  typeof createNegotiationStageHistorySchema
>

export type NegotiationStage = z.infer<typeof negotiationStageEnum>