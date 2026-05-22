// src/services/negotiationsService.ts
import { useApi } from "./api";

// ─────────────────────────────────────────────
// TIPOS — espelham os DTOs do servidor
// ─────────────────────────────────────────────

// negotiationStageHistory.dto.ts → NegotiationStageEnum
export type NegotiationStage =
  | "qualificacao"
  | "contato_inicial"
  | "visita"
  | "proposta"
  | "negociacao"
  | "fechamento_com_venda"
  | "fechamento_sem_venda";

// importance.dto.ts → ImportanceEnum
export type ImportanceLevel = "frio" | "morno" | "quente";

// status.dto.ts → StatusEnum
export type NegotiationStatus = "open" | "closed";

export interface StageHistoryItem {
  id: string;
  negotiation_id: string;
  old_stage: NegotiationStage | null;
  new_stage: NegotiationStage;
  notes: string | null;
  created_at: string;
}

export interface ImportanceItem {
  id: string;
  negotiation_id: string;
  importance: ImportanceLevel;
  notes: string | null;
  created_at: string;
}

export interface StatusHistoryItem {
  id: string;
  negotiation_id: string;
  status_negotiation: NegotiationStatus;
  notes: string | null;
  created_at: string;
}

export interface Negotiation {
  id: string;
  lead_id: string;
  team_id: string;
  customer_id: string;
  attendant_id?: string | null;
  lead?: {
    id: string;
    source?: string;
    customers?: {
      id: string;
      name: string;
      cpf?: string;
      phone?: string;
      email?: string;
    };
  };
  attendant?: {
    id: string;
    name: string;
  };
  stage_history?: StageHistoryItem[];
  importance_history?: ImportanceItem[];
  status_history?: StatusHistoryItem[];
  created_at: string;
  updated_at: string;
}

export interface QueryNegotiationDTO {
  team_id?: string;
  lead_id?: string;
  customer_id?: string;
  attendant_id?: string;
  is_open?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateStageHistoryDTO {
  negotiation_id: string;
  old_stage?: NegotiationStage | null;
  new_stage: NegotiationStage;
  notes?: string;
}

export interface CreateImportanceDTO {
  negotiation_id: string;
  importance: ImportanceLevel;
  notes?: string;
}

export interface CreateStatusDTO {
  negotiation_id: string;
  status_negotiation: NegotiationStatus;
  notes?: string;
}

// ─────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────

export function useNegotiationsService() {
  const { apiFetch } = useApi();

  function buildQuery(filters: QueryNegotiationDTO): string {
    const params = new URLSearchParams();
    if (filters.team_id)       params.set("team_id", filters.team_id);
    if (filters.lead_id)       params.set("lead_id", filters.lead_id);
    if (filters.customer_id)   params.set("customer_id", filters.customer_id);
    if (filters.attendant_id)  params.set("attendant_id", filters.attendant_id);
    if (filters.is_open !== undefined)
      params.set("is_open", String(filters.is_open));
    if (filters.page)          params.set("page", String(filters.page));
    if (filters.limit)         params.set("limit", String(filters.limit));
    const q = params.toString();
    return q ? `?${q}` : "";
  }

  // ── Negociações ────────────────────────────

  /** Lista negociações com filtros opcionais */
  async function getNegotiations(filters: QueryNegotiationDTO = {}): Promise<Negotiation[]> {
    const res = await apiFetch(`/api/negotiations${buildQuery(filters)}`);
    const json = await res.json();
    return json.data ?? json;
  }

  /** Busca uma negociação pelo id */
  async function getNegotiationById(id: string): Promise<Negotiation> {
    const res = await apiFetch(`/api/negotiations/${id}`);
    const json = await res.json();
    return json.data ?? json;
  }

  // ── Histórico de Estágios ──────────────────

  /**
   * Lista o histórico de estágios de uma negociação.
   * O servidor aceita ?negotiation_id= na query.
   */
  async function getStageHistory(negotiationId: string): Promise<StageHistoryItem[]> {
    const res = await apiFetch(
      `/api/negotiation-stage-history?negotiation_id=${negotiationId}`
    );
    const json = await res.json();
    return json.data ?? json;
  }

  /**
   * Registra uma nova transição de estágio.
   * O DTO do backend usa old_stage / new_stage (não old_status / new_status).
   */
  async function createStageHistory(data: CreateStageHistoryDTO): Promise<StageHistoryItem> {
    const res = await apiFetch("/api/negotiation-stage-history", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data ?? json;
  }

  // ── Importância ────────────────────────────

  /**
   * Retorna o histórico de importância de uma negociação.
   * O último item do array é o estado atual.
   */
  async function getImportanceHistory(negotiationId: string): Promise<ImportanceItem[]> {
    const res = await apiFetch(
      `/api/negotiation-importance?negotiation_id=${negotiationId}`
    );
    const json = await res.json();
    return json.data ?? json;
  }

  /** Registra um novo nível de importância */
  async function createImportance(data: CreateImportanceDTO): Promise<ImportanceItem> {
    const res = await apiFetch("/api/negotiation-importance", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data ?? json;
  }

  // ── Status ─────────────────────────────────

  /**
   * Retorna o histórico de status (open / closed) de uma negociação.
   * O último item é o estado atual.
   */
  async function getStatusHistory(negotiationId: string): Promise<StatusHistoryItem[]> {
    const res = await apiFetch(
      `/api/negotiation-status?negotiation_id=${negotiationId}`
    );
    const json = await res.json();
    return json.data ?? json;
  }

  /** Registra um novo status */
  async function createStatus(data: CreateStatusDTO): Promise<StatusHistoryItem> {
    const res = await apiFetch("/api/negotiation-status", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data ?? json;
  }

  return {
    // negociações
    getNegotiations,
    getNegotiationById,
    // estágios
    getStageHistory,
    createStageHistory,
    // importância
    getImportanceHistory,
    createImportance,
    // status
    getStatusHistory,
    createStatus,
  };
}