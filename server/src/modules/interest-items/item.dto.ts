// server/src/modules/interest-items/item.dto.ts
import { z } from "zod";

// ─────────────────────────────────────────────
// INTEREST ITEMS — DTOs (Zod schemas + tipos inferidos)
// ─────────────────────────────────────────────

export const createInterestItemSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  // reference_code único — SKU, chassi, código interno etc.
  reference_code: z.string().optional(),
  // value aceita string ou number — normalizado para string pois o Prisma
  // serializa Decimal como string
  value: z
    .union([z.string(), z.number()])
    .transform((v) => (v !== undefined && v !== "" ? String(v) : null))
    .nullable()
    .optional(),
});

export const updateInterestItemSchema = z.object({
  description: z.string().min(1, "Descrição não pode ser vazia").optional(),
  reference_code: z.string().optional(),
  value: z
    .union([z.string(), z.number()])
    .transform((v) => (v !== undefined && v !== "" ? String(v) : null))
    .nullable()
    .optional(),
  is_active: z.boolean().optional(),
});

export const queryInterestItemSchema = z.object({
  description: z.string().optional(),
  reference_code: z.string().optional(),
  is_active: z.string().transform((v) => v === "true").optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

export const interestItemIdParamSchema = z.object({
  id: z.string().uuid("id deve ser um UUID válido"),
});

export type CreateInterestItemDTO = z.infer<typeof createInterestItemSchema>;
export type UpdateInterestItemDTO = z.infer<typeof updateInterestItemSchema>;
export type QueryInterestItemDTO = z.infer<typeof queryInterestItemSchema>;
export type InterestItemIdParamDTO = z.infer<typeof interestItemIdParamSchema>;
