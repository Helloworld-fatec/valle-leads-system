// src/services/teamService.ts
import { useApi } from "./api";

// ─────────────────────────────────────────────
// Tipos
// Team referencia Store via store_id (relação Teams.store_id → Stores).
// ─────────────────────────────────────────────
export interface Team {
  id: string;
  name: string;
  store_id: string;
  store_name?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTeamDTO {
  name: string;
  store_id: string;
}

export interface UpdateTeamDTO {
  name?: string;
  store_id?: string;
  is_active?: boolean;
}

// Helper: aceita resposta { data: ... } ou corpo direto
function unwrap<T>(json: any): T {
  return (json && typeof json === "object" && "data" in json ? json.data : json) as T;
}

export const useTeamsService = () => {
  const { apiFetch } = useApi();

  // GET /api/teams (opcionalmente filtrado por store_id)
  const getTeams = async (store_id?: string): Promise<Team[]> => {
    const query = store_id ? `?store_id=${encodeURIComponent(store_id)}` : "";
    const res = await apiFetch(`/api/teams${query}`);
    return unwrap<Team[]>(await res.json());
  };

  // GET /api/teams/:id
  const getTeamById = async (id: string): Promise<Team> => {
    const res = await apiFetch(`/api/teams/${id}`);
    return unwrap<Team>(await res.json());
  };

  // POST /api/teams
  const createTeam = async (data: CreateTeamDTO): Promise<Team> => {
    const res = await apiFetch("/api/teams", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return unwrap<Team>(await res.json());
  };

  // PATCH /api/teams/:id
  const updateTeam = async (id: string, data: UpdateTeamDTO): Promise<Team> => {
    const res = await apiFetch(`/api/teams/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return unwrap<Team>(await res.json());
  };

  // DELETE /api/teams/:id (soft delete)
  const deleteTeam = async (id: string): Promise<void> => {
    await apiFetch(`/api/teams/${id}`, { method: "DELETE" });
  };

  return { getTeams, getTeamById, createTeam, updateTeam, deleteTeam };
};
