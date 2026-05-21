// src/services/userTeamsService.ts
import { useApi } from "./api";

// ─────────────────────────────────────────────
// Tipos — alinhados a usersTeams.dto.ts (tabela pivô User ↔ Team)
// ─────────────────────────────────────────────
export interface UserTeam {
  id: string;
  user_id: string;
  team_id: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // relações opcionais que o backend pode incluir via include
  user?: { id: string; name: string; email: string };
  team?: { id: string; name: string };
}

// createUserTeamSchema: ambos os IDs obrigatórios
export interface CreateUserTeamDTO {
  user_id: string;
  team_id: string;
}

// updateUserTeamSchema: em pivô só is_active é mutável (não se troca os IDs)
export interface UpdateUserTeamDTO {
  is_active: boolean;
}

// Helper: aceita resposta { data: ... } ou corpo direto
function unwrap<T>(json: any): T {
  return (json && typeof json === "object" && "data" in json ? json.data : json) as T;
}

export const useUserTeamsService = () => {
  const { apiFetch } = useApi();

  // GET /api/users-teams → qualquer autenticado
  const getUserTeams = async (): Promise<UserTeam[]> => {
    const res = await apiFetch("/api/users-teams");
    return unwrap<UserTeam[]>(await res.json());
  };

  // GET /api/users-teams/:id → qualquer autenticado
  const getUserTeamById = async (id: string): Promise<UserTeam> => {
    const res = await apiFetch(`/api/users-teams/${id}`);
    return unwrap<UserTeam>(await res.json());
  };

  // POST /api/users-teams → GENERAL_MANAGER ou ADMIN
  const createUserTeam = async (data: CreateUserTeamDTO): Promise<UserTeam> => {
    const res = await apiFetch("/api/users-teams", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return unwrap<UserTeam>(await res.json());
  };

  // PATCH /api/users-teams/:id → GENERAL_MANAGER ou ADMIN (só is_active)
  // Útil para reativar um vínculo sem recriar o registro.
  const updateUserTeam = async (id: string, data: UpdateUserTeamDTO): Promise<UserTeam> => {
    const res = await apiFetch(`/api/users-teams/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return unwrap<UserTeam>(await res.json());
  };

  // DELETE /api/users-teams/:id → soft delete (GENERAL_MANAGER ou ADMIN)
  const deleteUserTeam = async (id: string): Promise<void> => {
    await apiFetch(`/api/users-teams/${id}`, { method: "DELETE" });
  };

  // DELETE /api/users-teams/:id/hard → hard delete (somente ADMIN)
  const hardDeleteUserTeam = async (id: string): Promise<void> => {
    await apiFetch(`/api/users-teams/${id}/hard`, { method: "DELETE" });
  };

  return {
    getUserTeams,
    getUserTeamById,
    createUserTeam,
    updateUserTeam,
    deleteUserTeam,
    hardDeleteUserTeam,
  };
};
