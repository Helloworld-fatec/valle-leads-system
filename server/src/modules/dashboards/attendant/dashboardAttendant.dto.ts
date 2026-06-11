// src/modules/dashboards/attendant/dashboardAttendant.dto.ts

import { z } from 'zod';
import type { NegotiationStage } from '../../negotiation-stage-history/negotiationStageHistory.dto.js';

// ─────────────────────────────────────────────────────────────────────────────
// FILTER SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
// REFACTOR (negociação-cêntrico): a janela de datas NÃO filtra mais
// `leads.created_at`. Ela ancora no EVENTO relevante de cada métrica:
//   - "abertas no período"  → negotiations.created_at
//   - "vendas no período"   → negotiation_status_history.created_at (won/lost)
// Métricas de SNAPSHOT (carteira ativa, funil, temperatura, leads parados)
// ignoram a janela por definição — representam o estado ATUAL.

export const attendantDashboardFilterSchema = z.object({
  attendantId: z
    .string()
    .uuid({ message: 'O ID do atendente deve ser um UUID válido.' })
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

export type AttendantDashboardFilterDTO = z.infer<typeof attendantDashboardFilterSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE TYPES — KPIs
// ─────────────────────────────────────────────────────────────────────────────

/** KPI 1 — Negociações ativas (snapshot: sem registro de status terminal). */
export interface ActiveNegotiationsResponse {
  activeNegotiations: number;
}

/** KPI 2 — Vendas no período (eventos 'won' dentro da janela). */
export interface SalesResponse {
  sales: number;
}

/**
 * KPI 3 — Taxa de fechamento: won / (won + lost) das negociações ENCERRADAS
 * na janela. Não pune negociações ainda abertas (diferente do antigo won/total).
 */
export interface ClosingRateResponse {
  closingRate: number; // percentual 0–100
  wonCount: number;
  lostCount: number;
}

/**
 * KPI 4 — Tempo médio de fechamento: média de
 * (evento 'won'.created_at − negotiations.created_at) das vendas da janela.
 */
export interface AvgClosingTimeResponse {
  avgClosingTimeHours: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE TYPES — CHARTS
// ─────────────────────────────────────────────────────────────────────────────

/** Chart 1 — Funil: negociações ATIVAS distribuídas pelo estágio atual. */
export interface StageFunnelItem {
  stage: NegotiationStage;
  count: number;
}

export interface StageFunnelResponse {
  funnel: StageFunnelItem[];
}

/** Chart 2 — Evolução diária: negociações abertas × vendas. */
export interface EvolutionPoint {
  date: string; // YYYY-MM-DD
  opened: number;
  won: number;
}

export interface NegotiationsEvolutionResponse {
  evolution: EvolutionPoint[];
}

/** Chart 3 — Temperatura da carteira ativa (importância mais recente). */
export interface TemperatureItem {
  importance: string; // 'quente' | 'morno' | 'frio' (vocabulário do módulo de importância)
  count: number;
}

export interface TemperatureResponse {
  temperature: TemperatureItem[];
}

/** Chart 4 — Negociações abertas no período, agrupadas pela origem do lead. */
export interface NegotiationsBySourceItem {
  source: string;
  count: number;
}

export interface NegotiationsBySourceResponse {
  sources: NegotiationsBySourceItem[];
}

/**
 * Chart 5 — Leads parados: leads do atendente SEM nenhuma negociação aberta.
 *   - neverNegotiated: nunca tiveram negociação (carteira não trabalhada);
 *   - closedOnly: já tiveram, mas todas encerradas (candidatos a reativação);
 *   - bySource: detalhamento por origem dos nunca-negociados (acionável).
 */
export interface IdleLeadsBySourceItem {
  source: string;
  count: number;
}

export interface IdleLeadsResponse {
  idleLeads: {
    total: number;
    neverNegotiated: number;
    closedOnly: number;
    bySource: IdleLeadsBySourceItem[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL TYPES (usados entre repository e service)
// ─────────────────────────────────────────────────────────────────────────────

/** Eventos terminais da janela — base da taxa de fechamento. */
export interface ClosingData {
  wonCount: number;
  lostCount: number;
}

/**
 * Evento de venda: instante do 'won' pareado com a abertura da NEGOCIAÇÃO
 * (não mais do lead). Base do tempo médio de fechamento.
 */
export interface SaleEvent {
  negotiationCreatedAt: Date;
  wonAt: Date;
}
