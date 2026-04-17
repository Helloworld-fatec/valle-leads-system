// server/src/modules/negotiation-importance/importance.dto.ts
import { z } from "zod";

// ─────────────────────────────────────────────
// NEGOTIATION IMPORTANCE DTOS
// ─────────────────────────────────────────────

// Níveis de importância da negociação — alteráveis a qualquer momento pelo atendente (RN17)
export const ImportanceEnum = z.enum(["frio", "morno", "quente"]);

export const CreateNegotiationImportanceSchema = z.object({
  negotiation_id: z.string().uuid("negotiation_id deve ser um UUID válido"),
  importance: ImportanceEnum,
  
  // Notas opcionais para justificar por que o lead esfriou ou esquentou
  notes: z.string().max(500, { message: "A observação não pode exceder 500 caracteres" }).optional(),
});

export const UpdateNegotiationImportanceSchema = z.object({
  // Tudo opcional para permitir atualizações parciais
  importance: ImportanceEnum.optional(),
  notes: z.string().max(500).optional(),
});

export const QueryNegotiationImportanceSchema = z.object({
  negotiation_id: z.string().uuid().optional(),
  importance: ImportanceEnum.optional(),
  
  // Paginação
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

// Inferência de Tipos
export type CreateNegotiationImportanceDTO = z.infer<typeof CreateNegotiationImportanceSchema>;
export type UpdateNegotiationImportanceDTO = z.infer<typeof UpdateNegotiationImportanceSchema>;
export type QueryNegotiationImportanceDTO = z.infer<typeof QueryNegotiationImportanceSchema>;
export type NegotiationImportance = z.infer<typeof ImportanceEnum>;