// server/src/modules/customers/customer.dtos.ts
import { z } from "zod";

// ─────────────────────────────────────────────
// CUSTOMER DTOS
// ─────────────────────────────────────────────

export const CreateCustomerSchema = z.object({
  // Nome é o único campo obrigatório na criação
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido").optional(),
  // CPF opcional, mas quando informado deve ter exatamente 11 dígitos numéricos (sem máscara)
  cpf: z
    .string()
    .regex(/^\d{11}$/, "CPF deve conter exatamente 11 dígitos numéricos")
    .optional(),
  phone: z.string().optional(),
  // team_id opcional pois um customer pode existir sem estar vinculado a um time ainda
  team_id: z.string().uuid("team_id deve ser um UUID válido").optional(),
});

export const UpdateCustomerSchema = z.object({
  // Todos os campos opcionais — atualiza apenas o que for enviado
  name: z.string().min(1).optional(),
  email: z.string().email("E-mail inválido").optional(),
  cpf: z
    .string()
    .regex(/^\d{11}$/, "CPF deve conter exatamente 11 dígitos numéricos")
    .optional(),
  phone: z.string().optional(),
  // is_active permite reativar um customer via update
  is_active: z.boolean().optional(),
  team_id: z.string().uuid("team_id deve ser um UUID válido").optional(),
});

// Query params chegam como string na URL — os transforms convertem para os tipos corretos
export const QueryCustomerSchema = z.object({
  team_id: z.string().uuid().optional(),
  // "true" → true, qualquer outro valor → false
  is_active: z.string().transform((v) => v === "true").optional(),
  name: z.string().optional(),
  cpf: z.string().optional(),
  // Paginação com transform de string para number
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

export type CreateCustomerDTO = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerDTO = z.infer<typeof UpdateCustomerSchema>;
export type QueryCustomerDTO = z.infer<typeof QueryCustomerSchema>;