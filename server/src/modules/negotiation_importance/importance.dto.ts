import { z } from "zod"

// Níveis de importância da negociação — alteráveis a qualquer momento pelo atendente (RN17)
const importanceEnum = z.enum(["frio", "morno", "quente"])

export const updateNegotiationImportanceSchema = z.object({
  importance: importanceEnum,
})

export type UpdateNegotiationImportanceDTO = z.infer<
  typeof updateNegotiationImportanceSchema
>

export type NegotiationImportance = z.infer<typeof importanceEnum>