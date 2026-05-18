import { z } from "zod";

// ─────────────────────────────────────────────
// INTEREST ITEMS DTOS
// ─────────────────────────────────────────────

export const CreateInterestItemSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  // reference_code único — SKU, chassi, código interno etc.
  reference_code: z.string().optional(),
  // value aceita string (vindo de form/JSON) ou number — converte para string
  // pois o Prisma Decimal serializa como string
  value: z
    .union([z.string(), z.number()])
    .transform((v) => (v !== undefined && v !== "" ? String(v) : null))
    .nullable()
    .optional(),
});

export const UpdateInterestItemSchema = z.object({
  description: z.string().min(1, "Descrição não pode ser vazia").optional(),
  reference_code: z.string().optional(),
  value: z
    .union([z.string(), z.number()])
    .transform((v) => (v !== undefined && v !== "" ? String(v) : null))
    .nullable()
    .optional(),
  is_active: z.boolean().optional(),
});

export const QueryInterestItemSchema = z.object({
  description: z.string().optional(),
  reference_code: z.string().optional(),
  is_active: z.string().transform((v) => v === "true").optional(),
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

export type CreateInterestItemDTO = z.infer<typeof CreateInterestItemSchema>;
export type UpdateInterestItemDTO = z.infer<typeof UpdateInterestItemSchema>;
export type QueryInterestItemDTO = z.infer<typeof QueryInterestItemSchema>;
