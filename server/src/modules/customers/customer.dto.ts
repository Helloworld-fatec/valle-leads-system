// src/modules/customers/customer.dto.ts
import { z } from "zod";

// ─────────────────────────────────────────────
// CUSTOMER — DTOs
// ─────────────────────────────────────────────
// phone é String (obrigatório e único) no schema Prisma.
// ─────────────────────────────────────────────

const addressFields = {
  address_street: z.string().max(150).optional(),
  address_number: z.string().max(20).optional(),
  address_complement: z.string().max(100).optional(),
  address_neighborhood: z.string().max(100).optional(),
  address_city: z.string().max(100).optional(),
  address_state: z
    .string()
    .length(2, "UF deve ter exatamente 2 caracteres")
    .toUpperCase()
    .optional(),
  address_zip: z
    .string()
    .regex(/^\d{5}-?\d{3}$/, "CEP inválido (use 00000-000 ou 00000000)")
    .optional(),
} as const;

// ─── CREATE ───────────────────────────────────────────
export const createCustomerSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório").max(200),
  email: z.string().trim().toLowerCase().email("E-mail inválido").optional(),
  cpf: z
    .string()
    .regex(/^\d{11}$/, "CPF deve conter exatamente 11 dígitos numéricos")
    .optional(),
  // phone é obrigatório no schema — String @unique
  phone: z
    .string()
    .regex(/^\d{10,11}$/, "Telefone deve conter 10 ou 11 dígitos numéricos"),
  ...addressFields,
});

// ─── UPDATE ───────────────────────────────────────────
export const updateCustomerSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    email: z.string().trim().toLowerCase().email().optional(),
    cpf: z
      .string()
      .regex(/^\d{11}$/, "CPF deve ter 11 dígitos numéricos")
      .optional(),
    phone: z
      .string()
      .regex(/^\d{10,11}$/, "Telefone deve ter 10 ou 11 dígitos")
      .optional(),
    is_active: z.boolean().optional(),
    ...addressFields,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nenhum campo enviado para atualização",
  });

// ─── QUERY ────────────────────────────────────────────
export const queryCustomerSchema = z.object({
  is_active: z
    .string()
    .optional()
    .transform((v) => {
      if (v === "true") return true;
      if (v === "false") return false;
      return undefined;
    })
    .pipe(z.boolean().optional()),
  name: z.string().trim().min(1).optional(),
  cpf: z.string().optional(),
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

// ─── PARAMS (:id) ─────────────────────────────────────
export const customerIdParamSchema = z.object({
  id: z.string().uuid("id deve ser um UUID válido"),
});

// ─── Tipos derivados ──────────────────────────────────
export type CreateCustomerDTO = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerDTO = z.infer<typeof updateCustomerSchema>;
export type QueryCustomerDTO = z.infer<typeof queryCustomerSchema>;
export type CustomerIdParamDTO = z.infer<typeof customerIdParamSchema>;