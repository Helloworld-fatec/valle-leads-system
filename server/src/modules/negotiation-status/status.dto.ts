// server/src/modules/negotiation-status/status.dto.ts
import { z } from "zod";

// ─────────────────────────────────────────────
// NEGOTIATION STATUS DTOS
// ─────────────────────────────────────────────

// RF03 define apenas dois estados macro para uma negociação:
//   "open"   → negociação aberta / em andamento
//   "closed" → negociação encerrada (por fechamento com ou sem venda,
//               ou por qualquer outro motivo administrativo)
//
// O status "in_progress" foi removido — não existe no domínio definido.
// Granularidade de progresso fica a cargo do histórico de ESTÁGIOS.
export const StatusEnum = z.enum(["open", "closed"]);

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
export type NegotiationStatus = z.infer<typeof StatusEnum>;
