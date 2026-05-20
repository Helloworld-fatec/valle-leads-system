// src/modules/users/users.dto.ts
import { z } from "zod";

// ─────────────────────────────────────────────
// USERS DTO
// ─────────────────────────────────────────────
// Schemas Zod para validação de entrada do módulo de usuários.
//
// Separação de responsabilidades entre DTO e service:
//   - DTO (aqui): valida SHAPE dos dados (tipos, formatos, tamanhos).
//   - Service:    valida PERMISSÃO de campo (ex.: só ADMIN envia `role`).
//
// Isso evita proliferação de schemas por role e mantém um único ponto de
// validação de formato, com a lógica de autorização onde ela pertence.
// ─────────────────────────────────────────────

// Enum compartilhado — fonte única de verdade para os 4 roles do sistema
export const userRoleSchema = z.enum([
  "ATTENDANT",
  "MANAGER",
  "GENERAL_MANAGER",
  "ADMIN",
]);
export type UserRole = z.infer<typeof userRoleSchema>;

// ─── Campos reutilizáveis (telefone + endereço) ───────
// Extraídos para reuso em create, update e self-update sem repetição.
const phoneFields = {
  phone_1_ddd: z
    .string()
    .regex(/^\d{2}$/, "DDD deve ter exatamente 2 dígitos")
    .optional(),
  phone_1_number: z
    .string()
    .regex(/^\d{8,9}$/, "Número deve ter 8 ou 9 dígitos")
    .optional(),
  phone_2_ddd: z
    .string()
    .regex(/^\d{2}$/, "DDD deve ter exatamente 2 dígitos")
    .optional(),
  phone_2_number: z
    .string()
    .regex(/^\d{8,9}$/, "Número deve ter 8 ou 9 dígitos")
    .optional(),
} as const;

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

// ─── CREATE (somente ADMIN) ───────────────────────────
export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Nome deve ter no mínimo 3 caracteres")
    .max(120),
  email: z.string().trim().toLowerCase().email("Email inválido"),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .max(72, "Senha deve ter no máximo 72 caracteres"), // limite do bcrypt
  role: userRoleSchema,
  team_ids: z
    .array(z.string().uuid("team_id deve ser um UUID válido"))
    .optional(),
  ...phoneFields,
  ...addressFields,
});

// ─── UPDATE ADMINISTRATIVO (somente ADMIN) ────────────
// Inclui campos sensíveis: role, is_active, team_ids.
// O service garante que esses campos só chegam aqui se o actor for ADMIN.
export const updateUserAdminSchema = z
  .object({
    name: z.string().trim().min(3).max(120).optional(),
    email: z.string().trim().toLowerCase().email().optional(),
    role: userRoleSchema.optional(),
    is_active: z.boolean().optional(),
    team_ids: z.array(z.string().uuid()).optional(),
    ...phoneFields,
    ...addressFields,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nenhum campo enviado para atualização",
  });

// ─── UPDATE PRÓPRIO PERFIL (qualquer autenticado) ─────
// NÃO inclui role, is_active nem team_ids — o service rejeita
// qualquer tentativa de enviar esses campos via essa rota.
// Para troca de senha exige confirmação da senha atual.
export const updateSelfSchema = z
  .object({
    name: z.string().trim().min(3).max(120).optional(),
    email: z.string().trim().toLowerCase().email().optional(),
    current_password: z.string().min(1).optional(),
    new_password: z.string().min(8).max(72).optional(),
    ...phoneFields,
    ...addressFields,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nenhum campo enviado para atualização",
  })
  .refine(
    (data) => {
      if (data.new_password) return Boolean(data.current_password);
      return true;
    },
    {
      message: "current_password é obrigatório para alterar a senha",
      path: ["current_password"],
    }
  );

// ─── QUERY STRING — GET /users ────────────────────────
export const listUsersQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 1))
    .pipe(z.number().int().min(1)),
  pageSize: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
  role: userRoleSchema.optional(),
  team_id: z.string().uuid().optional(),
  search: z.string().trim().min(1).optional(),
  is_active: z
    .string()
    .optional()
    .transform((v) => {
      if (v === "true") return true;
      if (v === "false") return false;
      return undefined;
    })
    .pipe(z.boolean().optional()),
});

// ─── PARAMS — :id ─────────────────────────────────────
export const userIdParamSchema = z.object({
  id: z.string().uuid("id deve ser um UUID válido"),
});

// ─── Tipos derivados ──────────────────────────────────
export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserAdminDTO = z.infer<typeof updateUserAdminSchema>;
export type UpdateSelfDTO = z.infer<typeof updateSelfSchema>;
export type ListUsersQueryDTO = z.infer<typeof listUsersQuerySchema>;
export type UserIdParamDTO = z.infer<typeof userIdParamSchema>;
