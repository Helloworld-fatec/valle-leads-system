// server/src/modules/users/users.dto.ts
import { z } from "zod";

// ─────────────────────────────────────────────
// USERS DTO
// ─────────────────────────────────────────────
// Schemas de validação Zod para o módulo de usuários.
// Alinhados aos 4 perfis definidos no desafio (RF02):
//   - ATTENDANT       (atendente)
//   - MANAGER         (gerente)
//   - GENERAL_MANAGER (gerente geral)
//   - ADMIN           (administrador)
// O vínculo com times é feito via tabela pivô UserTeams,
// portanto recebemos uma lista de team_ids (uuid), não um team_id único.
// ─────────────────────────────────────────────

// Enum compartilhado entre create/update — fonte única de verdade
export const userRoleSchema = z.enum([
  "ATTENDANT",
  "MANAGER",
  "GENERAL_MANAGER",
  "ADMIN",
]);
export type UserRole = z.infer<typeof userRoleSchema>;

// Reaproveitáveis: campos opcionais de telefone e endereço
const phoneAndAddressFields = {
  phone_1_ddd: z
    .string()
    .regex(/^\d{2}$/, "DDD deve conter exatamente 2 dígitos")
    .optional(),
  phone_1_number: z
    .string()
    .regex(/^\d{8,9}$/, "Número de telefone deve conter 8 ou 9 dígitos")
    .optional(),
  phone_2_ddd: z
    .string()
    .regex(/^\d{2}$/, "DDD deve conter exatamente 2 dígitos")
    .optional(),
  phone_2_number: z
    .string()
    .regex(/^\d{8,9}$/, "Número de telefone deve conter 8 ou 9 dígitos")
    .optional(),
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

// ─────────────────────────────────────────────
// CREATE — usado por ADMIN (ou MANAGER vinculando atendentes à sua equipe)
// ─────────────────────────────────────────────
export const createUserSchema = z.object({
  name: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres").max(120),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Email inválido"),
  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .max(72, "Senha deve ter no máximo 72 caracteres"), // limite do bcrypt
  role: userRoleSchema,
  // Times aos quais o usuário será vinculado (via tabela pivô UserTeams)
  team_ids: z.array(z.string().uuid("team_id deve ser um UUID válido")).optional(),
  ...phoneAndAddressFields,
});

// ─────────────────────────────────────────────
// UPDATE — usado por ADMIN para alterar qualquer campo (exceto senha do próprio usuário,
// que tem fluxo separado por segurança)
// ─────────────────────────────────────────────
export const updateUserSchema = z
  .object({
    name: z.string().trim().min(3).max(120).optional(),
    email: z.string().trim().toLowerCase().email().optional(),
    role: userRoleSchema.optional(),
    team_ids: z.array(z.string().uuid()).optional(),
    is_active: z.boolean().optional(),
    ...phoneAndAddressFields,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nenhum campo enviado para atualização",
  });

// ─────────────────────────────────────────────
// SELF UPDATE — qualquer usuário autenticado pode atualizar seu próprio e-mail/senha (RF01)
// ─────────────────────────────────────────────
export const updateSelfSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().optional(),
    current_password: z.string().min(1).optional(),
    new_password: z.string().min(8).max(72).optional(),
    name: z.string().trim().min(3).max(120).optional(),
    ...phoneAndAddressFields,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nenhum campo enviado para atualização",
  })
  .refine(
    (data) => {
      // Se for trocar a senha, exige a senha atual
      if (data.new_password) return Boolean(data.current_password);
      return true;
    },
    {
      message: "current_password é obrigatório para alterar a senha",
      path: ["current_password"],
    }
  );

// ─────────────────────────────────────────────
// LIST FILTERS — usado em GET /users (com paginação)
// ─────────────────────────────────────────────
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
  search: z.string().trim().min(1).optional(), // busca em nome/email
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
});

// ─────────────────────────────────────────────
// PARAMS — validação do :id nas rotas
// ─────────────────────────────────────────────
export const userIdParamSchema = z.object({
  id: z.string().uuid("id deve ser um UUID válido"),
});

// ─────────────────────────────────────────────
// Tipos automáticos
// ─────────────────────────────────────────────
export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type UpdateSelfDTO = z.infer<typeof updateSelfSchema>;
export type ListUsersQueryDTO = z.infer<typeof listUsersQuerySchema>;
