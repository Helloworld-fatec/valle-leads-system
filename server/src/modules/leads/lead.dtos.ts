import { z } from "zod";

// ─────────────────────────────────────────────
// LEADS DTOS
// ─────────────────────────────────────────────

// Enum centralizado para reutilizar nos schemas de create, update e query
export const LeadStatusEnum = z.enum([
  "novo",
  "em_atendimento",
  "aguardando",
  "finalizado",
  "perdido",
]);

export const CreateLeadSchema = z.object({
  source: z.string().optional(),
  // Status obrigatório na criação — deve ser um dos valores do enum acima
  status: LeadStatusEnum,
  vehicle_interest: z.string().optional(),
  // customer_id obrigatório — o service valida se o customer existe e está ativo
  customer_id: z.string().uuid("customer_id deve ser um UUID válido"),
  // team_id obrigatório — o service valida se o team existe (via TeamsRepository do Pedro)
  team_id: z.string().uuid("team_id deve ser um UUID válido"),
  // attendant_id opcional — lead pode ser criado sem atendente e atribuído depois
  attendant_id: z.string().uuid("attendant_id deve ser um UUID válido").optional(),
});

export const UpdateLeadSchema = z.object({
  // Todos os campos opcionais — atualiza apenas o que for enviado
  source: z.string().optional(),
  status: LeadStatusEnum.optional(),
  // is_active permite reativar um lead via update
  is_active: z.boolean().optional(),
  vehicle_interest: z.string().optional(),
  attendant_id: z.string().uuid("attendant_id deve ser um UUID válido").optional(),
});

// Query params chegam como string na URL — os transforms convertem para os tipos corretos
export const QueryLeadSchema = z.object({
  team_id: z.string().uuid().optional(),
  status: LeadStatusEnum.optional(),
  attendant_id: z.string().uuid().optional(),
  customer_id: z.string().uuid().optional(),
  // "true" → true, qualquer outro valor → false
  is_active: z.string().transform((v) => v === "true").optional(),
  // Paginação com transform de string para number
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

export type CreateLeadDTO = z.infer<typeof CreateLeadSchema>;
export type UpdateLeadDTO = z.infer<typeof UpdateLeadSchema>;
export type QueryLeadDTO = z.infer<typeof QueryLeadSchema>;