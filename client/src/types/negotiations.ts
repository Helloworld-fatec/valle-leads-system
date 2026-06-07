// src/types/negotiations.ts
// Fonte canônica de todos os tipos do módulo de negociações.
// Os serviços e componentes importam daqui — sem duplicação.

// ─────────────────────────────────────────────
// Enums (espelham os DTOs do servidor)
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

// status.dto.ts → StatusEnum = ["new", "open", "won", "lost"]
//   "new"  → estado inicial, antes de qualquer movimentação efetiva
//   "open" → negociação aberta / em andamento
//   "won"  → encerrada COM venda  (estágio fechamento_com_venda)
//   "lost" → encerrada SEM venda  (estágio fechamento_sem_venda)
export type NegotiationStatusValue = "new" | "open" | "won" | "lost";

// ─────────────────────────────────────────────
// Entidades relacionadas
// ─────────────────────────────────────────────

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
  status_negotiation: NegotiationStatusValue;
  notes: string | null;
  created_at: string;
}

// ─────────────────────────────────────────────
// Negociação
// ─────────────────────────────────────────────

export interface Negotiation {
  id: string;
  lead_id: string;
  team_id: string;
  customer_id: string;
  attendant_id?: string | null;
  lead?: {
    id: string;
    source?: string;
    vehicle_interest?: string | null;
    attendant_id?: string | null;
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

// ─────────────────────────────────────────────
// DTOs de query e criação
// ─────────────────────────────────────────────

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
  status_negotiation: NegotiationStatusValue;
  notes?: string;
}