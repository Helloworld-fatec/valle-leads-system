import { z } from "zod";

// ─────────────────────────────────────────────
// LEADS DTOS
// ─────────────────────────────────────────────

export const LeadStatusEnum = z.enum([
  "novo",
  "em_atendimento",
  "aguardando",
  "finalizado",
  "perdido",
]);

export const CreateLeadSchema = z.object({
  source: z.string().optional(),
  status: LeadStatusEnum,
  customer_id: z.string().uuid("customer_id deve ser um UUID válido"),
  team_id: z.string().uuid("team_id deve ser um UUID válido"),
  attendant_id: z.string().uuid("attendant_id deve ser um UUID válido").optional(),
  // Substitui vehicle_interest — referencia um InterestItems cadastrado
  interest_item_id: z.string().uuid("interest_item_id deve ser um UUID válido").optional(),
});

export const UpdateLeadSchema = z.object({
  source: z.string().optional(),
  status: LeadStatusEnum.optional(),
  // is_active permite reativar um lead via update
  is_active: z.boolean().optional(),
  attendant_id: z.string().uuid("attendant_id deve ser um UUID válido").optional(),
  interest_item_id: z.string().uuid("interest_item_id deve ser um UUID válido").optional(),
});

// Query params chegam como string na URL — os transforms convertem para os tipos corretos
export const QueryLeadSchema = z.object({
  team_id: z.string().uuid().optional(),
  status: LeadStatusEnum.optional(),
  attendant_id: z.string().uuid().optional(),
  customer_id: z.string().uuid().optional(),
  interest_item_id: z.string().uuid().optional(),
  // "true" → true, qualquer outro valor → false
  is_active: z.string().transform((v) => v === "true").optional(),
  // Paginação com transform de string para number
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

export type CreateLeadDTO = z.infer<typeof CreateLeadSchema>;
export type UpdateLeadDTO = z.infer<typeof UpdateLeadSchema>;
export type QueryLeadDTO = z.infer<typeof QueryLeadSchema>;
