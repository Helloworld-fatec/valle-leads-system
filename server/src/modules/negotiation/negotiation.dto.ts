// server/src/modules/negotiation/negotiation.dto.ts
import { z } from "zod";

// ─────────────────────────────────────────────
// NEGOTIATION DTOS
// ─────────────────────────────────────────────

export const CreateNegotiationSchema = z.object({
  // team_id e lead_id são obrigatórios para iniciar uma negociação
  team_id: z.string().uuid("team_id deve ser um UUID válido"),
  lead_id: z.string().uuid("lead_id deve ser um UUID válido"),
  // Nota: created_by_user_id não vem no body, será extraído do token (req.user) no controller/middleware
});

export const UpdateNegotiationSchema = z.object({
  // Atualizar a negociação "pai" (mudar a equipe ou o lead) é raro, 
  // mas mantemos opcional caso a regra de negócio permita transferência.
  team_id: z.string().uuid("team_id deve ser um UUID válido").optional(),
  lead_id: z.string().uuid("lead_id deve ser um UUID válido").optional(),
  // Nota: updated_by_user_id também será injetado pelo contexto de autenticação
});

export const QueryNegotiationSchema = z.object({
  team_id: z.string().uuid().optional(),
  lead_id: z.string().uuid().optional(),
  attendant_id: z.string().uuid().optional(),
  
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

// Inferência de Tipos
export type CreateNegotiationDTO = z.infer<typeof CreateNegotiationSchema>;
export type UpdateNegotiationDTO = z.infer<typeof UpdateNegotiationSchema>;
export type QueryNegotiationDTO = z.infer<typeof QueryNegotiationSchema>;