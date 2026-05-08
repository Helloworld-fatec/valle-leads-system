// src/types/negotiations.ts

export type ImportanceLevel = "frio" | "morno" | "quente";

export type NegotiationStage =
  | "contato_inicial"
  | "visita"
  | "proposta"
  | "negociacao"
  | "fechamento_com_venda"
  | "fechamento_sem_venda";

export interface NegotiationStatusEntry {
  id: string;
  status_negotiation: string; // ← nome real do campo no schema
  notes: string | null;
  created_at: string;
}

export interface NegotiationStageEntry {
  id: string;
  old_status: NegotiationStage | null;
  new_status: NegotiationStage;
  notes: string | null;
  created_at: string;
}

export interface NegotiationImportanceEntry {
  id: string;
  importance: ImportanceLevel;
  created_at: string;
}

export interface Negotiation {
  id: string;
  lead_id: string;
  team_id: string;
  created_at: string;
  // Dados do Lead (via join do backend)
  lead?: {
    vehicle_interest: string | null;
    attendant_id: string | null;
    customers?: {
      name: string;
    };
  };
  // Último registro de cada histórico (via join do backend)
  current_stage?: NegotiationStage;       // backend precisa calcular isso
  current_status?: string;                // backend precisa calcular isso
  status_history?: NegotiationStatusEntry[];
  stage_history?: NegotiationStageEntry[];
  importance_history?: NegotiationImportanceEntry[];
}