// server/server/src/modules/users/users.dto.ts
import { z } from "zod";

// Criar usuário
export const createUserSchema = z.object({
    name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
    role: z.enum(["ADMIN", "MANAGER", "ATTENDANT"]),
    team_id: z.number().optional()
});

// Atualizar usuário
export const updateUserSchema = z.object({
    name: z.string().min(3).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role: z.enum(["ADMIN", "MANAGER", "ATTENDANT"]).optional(),
    team_id: z.number().optional()
});

// Tipos automáticos (TypeScript)
export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;