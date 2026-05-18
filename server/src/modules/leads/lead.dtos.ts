// src/modules/leads/lead.dtos.ts
import { z } from "zod";

// ─────────────────────────────────────────────
// LEADS DTOS
// ─────────────────────────────────────────────
// Schemas de validação Zod.
// As regras de RBAC são aplicadas no SERVICE — aqui só validamos o formato.
// ─────────────────────────────────────────────

export const LeadStatusEnum = z.enum([
  "novo",
  "em_atendimento",
  "aguardando",
  "finalizado",
  "perdido",
]);

// ─── CREATE ───────────────────────────────────────────
// attendant_id é opcional no body — pra ATTENDANT, o service preenche
// automaticamente com o próprio id (regra de negócio, não de schema).
export const CreateLeadSchema = z.object({
  source: z.string().trim().max(100).optional(),
  status: LeadStatusEnum,
  customer_id: z.string().uuid("customer_id deve ser um UUID válido"),
  team_id: z.string().uuid("team_id deve ser um UUID válido"),
  attendant_id: z.string().uuid("attendant_id deve ser um UUID válido").optional(),
  interest_item_id: z
    .string()
    .uuid("interest_item_id deve ser um UUID válido")
    .optional(),
});

// ─── UPDATE ───────────────────────────────────────────
export const UpdateLeadSchema = z
  .object({
    source: z.string().trim().max(100).optional(),
    status: LeadStatusEnum.optional(),
    is_active: z.boolean().optional(),
    attendant_id: z.string().uuid("attendant_id deve ser um UUID válido").optional(),
    interest_item_id: z
      .string()
      .uuid("interest_item_id deve ser um UUID válido")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nenhum campo enviado para atualização",
  });

// ─── QUERY (listagem) ─────────────────────────────────
// Query params chegam como string — usamos transform + pipe pra converter e
// validar o tipo final (mais seguro que transform(Number), que aceita "abc" → NaN).
export const QueryLeadSchema = z.object({
  team_id: z.string().uuid().optional(),
  status: LeadStatusEnum.optional(),
  attendant_id: z.string().uuid().optional(),
  customer_id: z.string().uuid().optional(),
  interest_item_id: z.string().uuid().optional(),
  is_active: z
    .string()
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      if (v === "true") return true;
      if (v === "false") return false;
      return undefined;
    })
    .pipe(z.boolean().optional()),
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

// ─── PARAMS ───────────────────────────────────────────
export const LeadIdParamSchema = z.object({
  id: z.string().uuid("id deve ser um UUID válido"),
});

export type CreateLeadDTO = z.infer<typeof CreateLeadSchema>;
export type UpdateLeadDTO = z.infer<typeof UpdateLeadSchema>;
export type QueryLeadDTO = z.infer<typeof QueryLeadSchema>;
