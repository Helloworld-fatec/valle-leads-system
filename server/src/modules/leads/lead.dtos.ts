// src/modules/leads/lead.dtos.ts
import { z } from "zod";


// Schema de criação de lead.

export const CreateLeadSchema = z.object({
  source: z.string().trim().max(100).optional(),
  status: z.string().optional(),
  customer_id: z.string().uuid("customer_id deve ser um UUID válido"),
  team_id: z.string().uuid("team_id deve ser um UUID válido").optional(),
  attendant_id: z
    .string()
    .uuid("attendant_id deve ser um UUID válido")
    .optional(),
  interest_item_id: z
    .string()
    .uuid("interest_item_id deve ser um UUID válido")
    .optional(),
});

// Schema de atualização.
// Todos os campos são opcionais, mas a validação de RBAC sobre QUAL campo
// cada role pode mexer fica no service:
//   - is_active=true (reativar): apenas GENERAL_MANAGER e ADMIN
//   - team_id (mover entre times): apenas GENERAL_MANAGER e ADMIN
//   - attendant_id (reatribuir): MANAGER no escopo do seu time, ADMIN sempre
// O refine garante que pelo menos um campo foi enviado.
export const UpdateLeadSchema = z
  .object({
    source: z.string().trim().max(100).optional(),
    status: z.string().optional(),
    is_active: z.boolean().optional(),
    team_id: z.string().uuid("team_id deve ser um UUID válido").optional(),
    attendant_id: z
      .string()
      .uuid("attendant_id deve ser um UUID válido")
      .nullable()
      .optional(),
    interest_item_id: z
      .string()
      .uuid("interest_item_id deve ser um UUID válido")
      .nullable()
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nenhum campo enviado para atualização",
  });

// Schema da query string da listagem.
// Campos chegam como string e usamos transform + pipe para converter e
// validar o tipo final: "abc" em ?page=abc é rejeitado, não vira NaN.
// is_active aceita "true"/"false" e ignora qualquer outro valor.
export const QueryLeadSchema = z.object({
  team_id: z.string().uuid().optional(),
  status: z.string().optional(),
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

// Schema do parâmetro de rota :id — garante UUID válido antes do Prisma.
export const LeadIdParamSchema = z.object({
  id: z.string().uuid("id deve ser um UUID válido"),
});

// Atribuição em lote de atendente.
// Usado por MANAGER (atribui atendentes do próprio time aos leads do time)
// e ADMIN (sem restrição). O service valida pertinência do atendente ao time
// de cada lead.
export const BulkAssignAttendantSchema = z.object({
  lead_ids: z
    .array(z.string().uuid("lead_id deve ser um UUID válido"))
    .min(1, "Informe ao menos um lead")
    .max(500, "Limite de 500 leads por operação"),
  attendant_id: z.string().uuid("attendant_id deve ser um UUID válido"),
});

// Atribuição em lote de equipe — move leads entre times.
// Usado por GENERAL_MANAGER (move livremente) e ADMIN.
// Ao trocar de time, o attendant_id é zerado pois pode ficar incoerente
// com o novo time (regra implementada no service).
export const BulkAssignTeamSchema = z.object({
  lead_ids: z
    .array(z.string().uuid("lead_id deve ser um UUID válido"))
    .min(1, "Informe ao menos um lead")
    .max(500, "Limite de 500 leads por operação"),
  team_id: z.string().uuid("team_id deve ser um UUID válido"),
});

// Tipos derivados — fonte única de verdade entre runtime (Zod) e TypeScript.
export type CreateLeadDTO = z.infer<typeof CreateLeadSchema>;
export type UpdateLeadDTO = z.infer<typeof UpdateLeadSchema>;
export type QueryLeadDTO = z.infer<typeof QueryLeadSchema>;
export type LeadIdParamDTO = z.infer<typeof LeadIdParamSchema>;
export type BulkAssignAttendantDTO = z.infer<typeof BulkAssignAttendantSchema>;
export type BulkAssignTeamDTO = z.infer<typeof BulkAssignTeamSchema>;


