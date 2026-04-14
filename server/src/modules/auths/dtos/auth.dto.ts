import { z } from "zod";

// LOGIN
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória")
});

// RECUPERAR SENHA
export const forgotPasswordSchema = z.object({
  email: z.string().email("Email inválido")
});

// RESETAR SENHA
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    newPassword: z.string().min(6),
    confirmPassword: z.string()
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"]
  });

// ALTERAR SENHA LOGADO
export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6)
});