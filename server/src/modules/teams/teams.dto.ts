// src/modules/teams/teams.dto.ts
import { z } from "zod";

// ─── CREATE ───────────────────────────────────────────
// store_id é obrigatório no schema Prisma (Teams.store_id: String, sem default).
export const createTeamSchema = z.object({
  store_id: z.string().uuid("store_id deve ser um UUID válido"),
  name: z.string().min(1, "name é obrigatório").max(200),
  is_active: z.boolean().optional(),
});

// ─── UPDATE ───────────────────────────────────────────
// Todos opcionais; refine garante que ao menos um campo foi enviado.
export const updateTeamSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    is_active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nenhum campo enviado para atualização",
  });

// ─── QUERY (GET /teams) ───────────────────────────────
// is_active chega como string na query string; transform converte para boolean.
export const queryTeamSchema = z.object({
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

// ─── PARAMS (:id) ─────────────────────────────────────
export const teamIdParamSchema = z.object({
  id: z.string().uuid("id deve ser um UUID válido"),
});

// ─── Tipos derivados ──────────────────────────────────
export type CreateTeamDTO = z.infer<typeof createTeamSchema>;
export type UpdateTeamDTO = z.infer<typeof updateTeamSchema>;
export type QueryTeamDTO = z.infer<typeof queryTeamSchema>;
export type TeamIdParamDTO = z.infer<typeof teamIdParamSchema>;
