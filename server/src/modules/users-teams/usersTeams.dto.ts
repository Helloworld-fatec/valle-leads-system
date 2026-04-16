// server/src/modules/users-teams/usersTeams.dto.ts
import { z } from "zod";

// Schema para vincular um usuário a um time
export const createUserTeamSchema = z.object({
  user_id: z.string().uuid("user_id deve ser um UUID válido"),
  team_id: z.string().uuid("team_id deve ser um UUID válido"),
});

// Schema para atualizar um vínculo (caso precise mudar o time de um registro específico, 
// embora em tabelas pivô muitas vezes seja mais comum deletar e recriar)
export const updateUserTeamSchema = z.object({
  user_id: z.string().uuid("user_id deve ser um UUID válido").optional(),
  team_id: z.string().uuid("team_id deve ser um UUID válido").optional(),
});

// Tipos inferidos automaticamente para o TypeScript usar no Service e Repository
export type CreateUserTeamDTO = z.infer<typeof createUserTeamSchema>;
export type UpdateUserTeamDTO = z.infer<typeof updateUserTeamSchema>;