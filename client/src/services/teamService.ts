// src/services/teamsService.ts
import { useApi } from "./api";

export interface Team {
  id: string;
  name: string;
  store_id: string;
  store_name?: string;
  is_active: boolean;
}

export const useTeamsService = () => {
  const { apiFetch } = useApi();

  const getTeams = async (store_id?: string): Promise<Team[]> => {
    const query = store_id ? `?store_id=${store_id}` : "";
    const res = await apiFetch(`/api/teams${query}`);
    const json = await res.json();
    return json.data;
  };

  const createTeam = async (data: { name: string; store_id: string }): Promise<Team> => {
    const res = await apiFetch("/api/teams", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  };

  const updateTeam = async (
    id: string,
    data: { name?: string; store_id?: string; is_active?: boolean }
  ): Promise<Team> => {
    const res = await apiFetch(`/api/teams/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  };

  return { getTeams, createTeam, updateTeam };
};