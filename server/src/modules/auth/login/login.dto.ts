// server/src/modules/auth/login/login.dto.ts
import { z } from "zod";

// ─────────────────────────────────────────────
// LOGIN DTO
// ─────────────────────────────────────────────
// Schemas de validação Zod para o fluxo de autenticação.
// Cobre apenas login / refresh / logout — recuperação e redefinição
// de senha pertencem a outro módulo (forgot-password / reset-password).
// ─────────────────────────────────────────────

// POST /auth/login
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Email inválido"),
  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .max(72, "Senha excede o tamanho máximo"), // limite do bcrypt
});

// POST /auth/refresh
// O refresh token chega normalmente via cookie httpOnly, mas aceitamos
// também no body como fallback (útil para clientes mobile/SDK que não
// usam cookies). A camada de service tenta primeiro o cookie.
export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(10).optional(),
});

export type LoginDTO = z.infer<typeof loginSchema>;
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchema>;
