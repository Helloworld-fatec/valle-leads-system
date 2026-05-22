// src/services/leadService.ts
import { useApi } from "./api";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

// Valores reais que o backend retorna (lead.dtos.ts → LeadStatusEnum)
export type LeadStatus =
  | "novo"
  | "em_atendimento"
  | "aguardando"
  | "finalizado"
  | "perdido";

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
  customers?: {        // plural — como vem do banco via Prisma
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
  team_id?: string;        // mover lead entre times (GENERAL_MANAGER / ADMIN)
  attendant_id?: string | null;
}

export interface CreateNegotiationDTO {
  lead_id: string;
  team_id?: string;
  customer_id?: string;
  attendant_id?: string | null;
}

// ─────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────

export function useLeadService() {
  const { apiFetch } = useApi();

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

  async function getLeads(filters: QueryLeadDTO = {}): Promise<Lead[]> {
    const res = await apiFetch(`/api/leads${buildQuery(filters)}`);
    const json = await res.json();
    return json.data ?? json;
  }

  async function getLeadById(id: string): Promise<Lead> {
    const res = await apiFetch(`/api/leads/${id}`);
    const json = await res.json();
    return json.data ?? json;
  }

  async function updateLead(id: string, data: UpdateLeadDTO): Promise<Lead> {
    const res = await apiFetch(`/api/leads/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data ?? json;
  }

  /** Atribui um atendente a um lead — atalho semântico para updateLead */
  async function assignLead(leadId: string, attendantId: string): Promise<Lead> {
    return updateLead(leadId, { attendant_id: attendantId });
  }

  /**
   * Atribuição de atendente em lote — continua mesmo se um falhar.
   * Usa Promise.allSettled para não interromper na primeira falha.
   */
  async function bulkAssignLeads(
    leadIds: string[],
    attendantId: string
  ): Promise<PromiseSettledResult<Lead>[]> {
    return Promise.allSettled(
      leadIds.map((id) => assignLead(id, attendantId))
    );
  }

  /**
   * Transfere leads entre times em lote.
   * Rota dedicada: POST /api/leads/bulk/assign-team (GENERAL_MANAGER / ADMIN).
   * O servidor zera attendant_id de cada lead automaticamente ao trocar time.
   */
  async function bulkAssignTeam(
    leadIds: string[],
    teamId: string
  ): Promise<void> {
    await apiFetch("/api/leads/bulk/assign-team", {
      method: "POST",
      body: JSON.stringify({ lead_ids: leadIds, team_id: teamId }),
    });
  }

  async function createNegotiation(
    data: CreateNegotiationDTO
  ): Promise<{ id: string }> {
    const res = await apiFetch("/api/negotiations", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data ?? json;
  }

  return {
    getLeads,
    getLeadById,
    updateLead,
    assignLead,
    bulkAssignLeads,
    bulkAssignTeam,
    createNegotiation,
  };
}