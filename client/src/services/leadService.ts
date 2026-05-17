//src/services/leadService.ts
import { useApi } from "./api";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

export type LeadStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "CLOSED_WON"
  | "CLOSED_LOST";

export interface LeadCustomer {
  id: string;
  name: string;
  cpf?: string;
  phone?: string;
  email?: string;
}

export interface LeadAttendant {
  id: string;
  name: string;
}

export interface Lead {
  id: string;
  source?: string;
  status: LeadStatus;
  vehicle_interest?: string;
  is_active: boolean;
  customer_id: string;
  team_id: string;
  attendant_id?: string;
  customers?: {        // ← plural, como vem do banco
    id: string;
    name: string;
    cpf?: string;
    phone?: string;
    email?: string;
  };
  attendant?: {
    id: string;
    name: string;
  };
  created_at: string;
  updated_at: string;
}

export interface QueryLeadDTO {
  team_id?: string;
  status?: LeadStatus;
  attendant_id?: string;
  customer_id?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface UpdateLeadDTO {
  source?: string;
  status?: LeadStatus;
  is_active?: boolean;
  vehicle_interest?: string;
  attendant_id?: string;
}

export interface CreateNegotiationDTO {
  lead_id: string;
  team_id: string;
}
// ─────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────

export function useLeadService() {
  const { apiFetch } = useApi();

  // Monta query string ignorando valores undefined
  function buildQuery(filters: QueryLeadDTO): string {
    const params = new URLSearchParams();
    if (filters.team_id)      params.set("team_id", filters.team_id);
    if (filters.attendant_id) params.set("attendant_id", filters.attendant_id);
    if (filters.customer_id)  params.set("customer_id", filters.customer_id);
    if (filters.status)       params.set("status", filters.status);
    if (filters.is_active !== undefined)
      params.set("is_active", String(filters.is_active));
    if (filters.page)         params.set("page", String(filters.page));
    if (filters.limit)        params.set("limit", String(filters.limit));
    const q = params.toString();
    return q ? `?${q}` : "";
  }

  /** Busca leads com filtros opcionais.
   *  - Atendente: passa { attendant_id: user.id }
   *  - Gerente:   passa { team_id: user.team_id }
   */

 async function getLeads(filters: QueryLeadDTO = {}): Promise<Lead[]> {
  const res = await apiFetch(`/api/leads${buildQuery(filters)}`);
  const json = await res.json();
  return json.data ?? json; // ← extrai o array de dentro do { success, data }
}

  /** Busca detalhes completos de um lead */
 async function getLeadById(id: string): Promise<Lead> {
  const res = await apiFetch(`/api/leads/${id}`);
  const json = await res.json();
  return json.data ?? json;
}

  /** Atualiza parcialmente um lead */
 async function updateLead(id: string, data: UpdateLeadDTO): Promise<Lead> {
  const res = await apiFetch(`/api/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  const json = await res.json();
  return json.data ?? json;
}

  /** Atribui um lead a um atendente — atalho semântico */
  async function assignLead(leadId: string, attendantId: string): Promise<Lead> {
    return updateLead(leadId, { attendant_id: attendantId });
  }

  /** Atribuição em lote — continua mesmo se um falhar */
  async function bulkAssignLeads(
    leadIds: string[],
    attendantId: string
  ): Promise<PromiseSettledResult<Lead>[]> {
    return Promise.allSettled(
      leadIds.map((id) => assignLead(id, attendantId))
    );
  }

  /** Cria uma negociação a partir de um lead */
  async function createNegotiation(data: CreateNegotiationDTO): Promise<{ id: string }> {
    const res = await apiFetch("/api/negotiations", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.json();
  }

  return {
    getLeads,
    getLeadById,
    updateLead,
    assignLead,
    bulkAssignLeads,
    createNegotiation,
  };
}
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
