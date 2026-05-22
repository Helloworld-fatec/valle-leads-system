// server/src/modules/negotiation/negotiation.dto.ts
import { z } from "zod";

// Schema de criação. A negociação herda lead, customer e attendant do lead
// se não forem passados — o service preenche automaticamente a partir do lead.
// Por isso, no body, apenas lead_id é OBRIGATÓRIO; os demais o service pode
// derivar. Permitimos passar explicitamente para os perfis que podem
// orquestrar a negociação (manager/general manager/admin).
export const CreateNegotiationSchema = z.object({
  lead_id: z.string().uuid("lead_id deve ser um UUID válido"),
  // Opcionais — derivados do lead quando ausentes
  team_id: z.string().uuid("team_id deve ser um UUID válido").optional(),
  customer_id: z.string().uuid("customer_id deve ser um UUID válido").optional(),
  attendant_id: z
    .string()
    .uuid("attendant_id deve ser um UUID válido")
    .nullable()
    .optional(),
});

// Schema de atualização — só o que faz sentido orquestrar depois que
// a negociação já existe:
//   - team_id      → mover a negociação entre times (apenas GM/ADMIN)
//   - attendant_id → reatribuir o responsável (atendente, manager, admin)
// Não permitimos trocar lead_id nem customer_id, pois a negociação
// nasce vinculada a esses (regra de domínio).
export const UpdateNegotiationSchema = z
  .object({
    team_id: z.string().uuid("team_id deve ser um UUID válido").optional(),
    attendant_id: z
      .string()
      .uuid("attendant_id deve ser um UUID válido")
      .nullable()
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nenhum campo enviado para atualização",
  });

// Query da listagem. Aceita filtros e paginação com transform + pipe
// para validar tipos finais e rejeitar valores como ?page=abc.
export const QueryNegotiationSchema = z.object({
  team_id: z.string().uuid().optional(),
  lead_id: z.string().uuid().optional(),
  customer_id: z.string().uuid().optional(),
  attendant_id: z.string().uuid().optional(),
  // Filtrar por estado macro (aberta x encerrada). O service traduz isso
  // em "consultar o último status no histórico".
  is_open: z
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

// Schema do parâmetro de rota
export const NegotiationIdParamSchema = z.object({
  id: z.string().uuid("id deve ser um UUID válido"),
});

// Atribuição em lote de atendente (MANAGER e ADMIN)
export const BulkAssignAttendantSchema = z.object({
  negotiation_ids: z
    .array(z.string().uuid("negotiation_id deve ser um UUID válido"))
    .min(1, "Informe ao menos uma negociação")
    .max(500, "Limite de 500 negociações por operação"),
  attendant_id: z.string().uuid("attendant_id deve ser um UUID válido"),
});

// Transferência em lote entre times (GENERAL_MANAGER e ADMIN)
export const BulkAssignTeamSchema = z.object({
  negotiation_ids: z
    .array(z.string().uuid("negotiation_id deve ser um UUID válido"))
    .min(1, "Informe ao menos uma negociação")
    .max(500, "Limite de 500 negociações por operação"),
  team_id: z.string().uuid("team_id deve ser um UUID válido"),
});

// Tipos derivados — fonte única entre runtime (Zod) e TS.
export type CreateNegotiationDTO = z.infer<typeof CreateNegotiationSchema>;
export type UpdateNegotiationDTO = z.infer<typeof UpdateNegotiationSchema>;
export type QueryNegotiationDTO = z.infer<typeof QueryNegotiationSchema>;
export type NegotiationIdParamDTO = z.infer<typeof NegotiationIdParamSchema>;
export type BulkAssignAttendantDTO = z.infer<typeof BulkAssignAttendantSchema>;
export type BulkAssignTeamDTO = z.infer<typeof BulkAssignTeamSchema>;
