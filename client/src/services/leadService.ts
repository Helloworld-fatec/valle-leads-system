// src/services/leadsService.ts
import { useApi } from "./api";

export interface Lead {
  id: string;
  name: string;
  phone: string;
  status: string;
  team_id: string | null;
  team_name?: string;
  store_id?: string;
  store_name?: string;
  attendant_id?: string | null;
}

export interface AssignTeamPayload {
  team_id: string;
}

export const useLeadsService = () => {
  const { apiFetch } = useApi();

  const getLeads = async (params?: {
    store_id?: string;
    team_id?: string;
    status?: string;
  }): Promise<Lead[]> => {
    const query = new URLSearchParams();
    if (params?.store_id) query.append("store_id", params.store_id);
    if (params?.team_id) query.append("team_id", params.team_id);
    if (params?.status) query.append("status", params.status);

    const res = await apiFetch(`/api/leads?${query.toString()}`);
    const json = await res.json();
    return json.data;
  };

  const assignTeam = async (leadId: string, payload: AssignTeamPayload): Promise<void> => {
    await apiFetch(`/api/leads/${leadId}/assign-team`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  };

  const assignTeamBulk = async (leadIds: string[], team_id: string): Promise<void> => {
    await Promise.all(leadIds.map((id) => assignTeam(id, { team_id })));
  };

  return { getLeads, assignTeam, assignTeamBulk };
};