// server/src/modules/negotiation-importance/importance.dto.ts
import { z } from "zod";

// ─────────────────────────────────────────────
// NEGOTIATION IMPORTANCE DTOS
// ─────────────────────────────────────────────

// Níveis de temperatura do lead — alteráveis a qualquer momento (RN17).
// Cada alteração cria um novo registro na linha do tempo; o mais recente
// representa o estado atual da importância da negociação.
export const ImportanceEnum = z.enum(["frio", "morno", "quente"]);

export const CreateNegotiationImportanceSchema = z.object({
  negotiation_id: z.string().uuid("negotiation_id deve ser um UUID válido"),
  importance: ImportanceEnum,

  // Notas opcionais para justificar por que o lead esfriou ou esquentou
  notes: z
    .string()
    .max(500, { message: "A observação não pode exceder 500 caracteres" })
    .optional(),
  // created_by_user_id é injetado pelo controller via req.user (não vem do body)
});

export const UpdateNegotiationImportanceSchema = z.object({
  // importance é imutável após o registro para preservar a linha do tempo
  // histórica — só notas podem ser corrigidas.
  notes: z
    .string()
    .max(500, { message: "A observação não pode exceder 500 caracteres" })
    .optional(),
  // updated_by_user_id é injetado pelo controller via req.user (não vem do body)
});

export const QueryNegotiationImportanceSchema = z.object({
  negotiation_id: z.string().uuid().optional(),
  importance: ImportanceEnum.optional(),

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
export type CreateNegotiationImportanceDTO = z.infer<
  typeof CreateNegotiationImportanceSchema
>;
export type UpdateNegotiationImportanceDTO = z.infer<
  typeof UpdateNegotiationImportanceSchema
>;
export type QueryNegotiationImportanceDTO = z.infer<
  typeof QueryNegotiationImportanceSchema
>;
export type NegotiationImportanceLevel = z.infer<typeof ImportanceEnum>;
