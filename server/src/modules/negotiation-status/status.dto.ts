// server/src/modules/negotiation-status/status.dto.ts
import { z } from "zod";

// ─────────────────────────────────────────────
// NEGOTIATION STATUS DTOS
// ─────────────────────────────────────────────

// Enum centralizado com os status permitidos
export const StatusEnum = z.enum(["open", "in_progress", "closed"]);

export const CreateNegotiationStatusSchema = z.object({
  negotiation_id: z.string().uuid("negotiation_id deve ser um UUID válido"),
  status_negotiation: StatusEnum,
  notes: z.string().optional(),
  // Nota: created_by_user_id será injetado pelo controller via req.user
});

export const UpdateNegotiationStatusSchema = z.object({
  // Embora atualizar histórico não seja muito comum, mantemos a possibilidade 
  // caso o usuário precise corrigir uma anotação, por exemplo.
  status_negotiation: StatusEnum.optional(),
  notes: z.string().optional(),
  // Nota: updated_by_user_id será injetado pelo controller via req.user
});

export const QueryNegotiationStatusSchema = z.object({
  negotiation_id: z.string().uuid("negotiation_id deve ser um UUID válido").optional(),
  status_negotiation: StatusEnum.optional(),
  
  // Paginação
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

// Inferência de Tipos
export type CreateNegotiationStatusDTO = z.infer<typeof CreateNegotiationStatusSchema>;
export type UpdateNegotiationStatusDTO = z.infer<typeof UpdateNegotiationStatusSchema>;
export type QueryNegotiationStatusDTO = z.infer<typeof QueryNegotiationStatusSchema>;