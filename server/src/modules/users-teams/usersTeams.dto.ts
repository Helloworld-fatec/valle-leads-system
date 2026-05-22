// src/modules/users-teams/usersTeams.dto.ts
import { z } from "zod";

// ─── CREATE ───────────────────────────────────────────
// Vincula um usuário a um time. Ambos os IDs são obrigatórios.
export const createUserTeamSchema = z.object({
  user_id: z.string().uuid("user_id deve ser um UUID válido"),
  team_id: z.string().uuid("team_id deve ser um UUID válido"),
});

// ─── UPDATE ───────────────────────────────────────────
// Em tabelas pivô não faz sentido trocar user_id ou team_id
// (seria deletar e recriar o vínculo). O único campo mutável aqui é is_active,
// que permite reativar um vínculo sem precisar recriar o registro.
export const updateUserTeamSchema = z.object({
  is_active: z.boolean(),
});

// ─── PARAMS (:id) ─────────────────────────────────────
export const userTeamIdParamSchema = z.object({
  id: z.string().uuid("id deve ser um UUID válido"),
});

// ─── Tipos derivados ──────────────────────────────────
export type CreateUserTeamDTO = z.infer<typeof createUserTeamSchema>;
export type UpdateUserTeamDTO = z.infer<typeof updateUserTeamSchema>;
export type UserTeamIdParamDTO = z.infer<typeof userTeamIdParamSchema>;
