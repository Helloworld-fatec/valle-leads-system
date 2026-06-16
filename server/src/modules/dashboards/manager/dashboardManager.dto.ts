// src/modules/dashboards/dashboard-manager/dashboardManager.dto.ts

import { z } from 'zod';
import type { NegotiationStage } from '../../negotiation-stage-history/negotiationStageHistory.dto.js';

// ─────────────────────────────────────────────────────────────────────────────
// FILTER SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
// REFACTOR (negociação-cêntrico): a janela ancora na data do EVENTO da
// negociação (abertura, won/lost) — nunca em leads.created_at.
// Métricas de SNAPSHOT (carteira ativa, funil, estagnadas, carga, leads
// parados) ignoram a janela: representam o estado ATUAL da equipa.

export const managerDashboardFilterSchema = z.object({
  teamId: z
    .string()
    .uuid({ message: 'O ID da equipe deve ser um UUID válido.' })
    .optional(),

  startDate: z
    .string()
    .datetime({ message: 'A data de início deve estar no formato ISO 8601 (ex: 2026-05-01T00:00:00Z).' })
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),

  endDate: z
    .string()
    .datetime({ message: 'A data de fim deve estar no formato ISO 8601 (ex: 2026-05-11T23:59:59Z).' })
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
}).refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.startDate <= data.endDate;
    }
    return true;
  },
  {
    message: 'A data de início não pode ser posterior à data de fim.',
    path: ['startDate'],
  },
);

export type ManagerDashboardFilterDTO = z.infer<typeof managerDashboardFilterSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE TYPES — KPIs
// ─────────────────────────────────────────────────────────────────────────────

/** KPI 1 — Negociações ativas da equipa (snapshot). */
export interface TeamActiveNegotiationsResponse {
  activeNegotiations: number;
}

/** KPI 2 — Vendas da equipa no período (eventos 'won' na janela). */
export interface TeamSalesResponse {
  sales: number;
}

/** KPI 3 — Taxa de fechamento da equipa: won / (won + lost) na janela. */
export interface TeamClosingRateResponse {
  closingRate: number; // percentual 0–100
  wonCount: number;
  lostCount: number;
}

/**
 * KPI 4 — Negociações estagnadas (snapshot): ativas, abertas há 7+ dias e
 * SEM movimentação de estágio nos últimos 7 dias. Lê o histórico de estágios,
 * não `leads.updated_at` (que é bumpado por qualquer edição do lead).
 */
export interface StagnantNegotiationsResponse {
  stagnantNegotiations: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE TYPES — CHARTS
// ─────────────────────────────────────────────────────────────────────────────

/** Chart 1 — Funil: negociações ATIVAS da equipa pelo estágio atual. */
export interface TeamStageFunnelItem {
  stage: NegotiationStage;
  count: number;
}

export interface TeamStageFunnelResponse {
  funnel: TeamStageFunnelItem[];
}

/** Chart 2 — Ranking de vendas por atendente (eventos 'won' na janela). */
export interface SalesByAttendantItem {
  attendantId: string | null;
  attendantName: string;
  sales: number;
}

export interface SalesByAttendantResponse {
  salesByAttendant: SalesByAttendantItem[];
}

/** Chart 3 — Carga de trabalho: negociações ATIVAS por atendente (snapshot). */
export interface WorkloadByAttendantItem {
  attendantId: string | null;
  attendantName: string;
  active: number;
}

export interface WorkloadByAttendantResponse {
  workloadByAttendant: WorkloadByAttendantItem[];
}

/** Chart 4 — Evolução diária da equipa: abertas × ganhas. */
export interface TeamEvolutionPoint {
  date: string; // YYYY-MM-DD
  opened: number;
  won: number;
}

export interface TeamEvolutionResponse {
  evolution: TeamEvolutionPoint[];
}

/** Chart 5 — Leads parados da equipa: sem nenhuma negociação aberta. */
export interface TeamIdleLeadsBySourceItem {
  source: string;
  count: number;
}

export interface TeamIdleLeadsResponse {
  idleLeads: {
    total: number;
    neverNegotiated: number;
    closedOnly: number;
    bySource: TeamIdleLeadsBySourceItem[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL TYPES (usados entre repository e service)
// ─────────────────────────────────────────────────────────────────────────────

/** Eventos terminais da janela — base da taxa de fechamento. */
export interface TeamClosingData {
  wonCount: number;
  lostCount: number;
}

/** Linha bruta: vendas (eventos won) agregadas por atendente. */
export interface AttendantSalesRow {
  attendant_id: string | null;
  sales: number;
}

/** Linha bruta: negociações ativas agregadas por atendente. */
export interface AttendantWorkloadRow {
  attendant_id: string | null;
  active: number;
}
