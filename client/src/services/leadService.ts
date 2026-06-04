// src/services/leadService.ts
import { useApi } from "./api";

// ─────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────

// Valores reais retornados pelo backend (domínio unificado com a negociação)
export type LeadStatus =
  | "new"
  | "open"
  | "won"
  | "lost";

export interface LeadCustomer {
  id: string;
  name: string;
  cpf?: string;
  phone?: string;
  email?: string;
  address_street?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LeadAttendant {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

export interface LeadTeam {
  id: string;
  name: string;
  store_id?: string | null;   // Prisma retorna null quando não preenchido
  is_active?: boolean;
}

export interface InterestItem {
  id: string;
  reference_code: string;
  description?: string | null;
  value?: string | null;
  is_active?: boolean;
}

// O Prisma retorna null (não undefined) em campos de relacionamento opcionais.
// Todos os joins e FKs opcionais aceitam | null para refletir isso.
export interface Lead {
  id: string;
  source?: string | null;
  status: LeadStatus;
  is_active: boolean;
  customer_id: string;
  team_id: string | null;          // null quando lead ainda não tem equipe
  attendant_id?: string | null;    // null = sem atendente atribuído
  interest_item_id?: string | null;
  customers?: LeadCustomer | null;
  teams?: LeadTeam | null;         // null quando o join não encontra registro
  attendant?: LeadAttendant | null;
  interest_item?: InterestItem | null;
  created_at: string;
  updated_at: string;
  created_by_user_id?: string | null;
  updated_by_user_id?: string | null;
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
  interest_item_id?: string;
  team_id?: string;
  attendant_id?: string | null;
}

export interface CreateNegotiationDTO {
  lead_id: string;
  team_id?: string;
  customer_id?: string;
  attendant_id?: string | null;
}

export interface PaginatedLeadsResponse {
  success: boolean;
  data: Lead[];
  total: number;
  page: number;
  limit: number;
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
    const json: PaginatedLeadsResponse | Lead[] = await res.json();
    // Suporte a ambos os formatos: paginado { data: [...] } ou array direto
    if (Array.isArray(json)) return json;
    return (json as PaginatedLeadsResponse).data ?? [];
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

  async function assignLead(leadId: string, attendantId: string): Promise<Lead> {
    return updateLead(leadId, { attendant_id: attendantId });
  }

  async function bulkAssignLeads(
    leadIds: string[],
    attendantId: string
  ): Promise<PromiseSettledResult<Lead>[]> {
    return Promise.allSettled(
      leadIds.map((id) => assignLead(id, attendantId))
    );
  }

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