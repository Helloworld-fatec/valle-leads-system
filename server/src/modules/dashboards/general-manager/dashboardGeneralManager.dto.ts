// src/modules/dashboards/dashboard-general-manager/dashboardGeneralManager.dto.ts

import { z } from 'zod';
import type { NegotiationStage } from '../../negotiation-stage-history/negotiationStageHistory.dto.js';

// ─────────────────────────────────────────────────────────────────────────────
// FILTER SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
// Visão global: SEM parâmetro de escopo (toda a empresa). A janela ancora na
// data do EVENTO da negociação (abertura, won/lost). Métricas de SNAPSHOT
// (carteira ativa, pipeline, funil, leads parados) ignoram a janela.

export const generalManagerDashboardFilterSchema = z.object({
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

export type GeneralManagerDashboardFilterDTO = z.infer<
  typeof generalManagerDashboardFilterSchema
>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE TYPES — KPIs
// ─────────────────────────────────────────────────────────────────────────────

/** KPI 1 — Negociações ativas em toda a empresa (snapshot). */
export interface GlobalActiveNegotiationsResponse {
  activeNegotiations: number;
}

/** KPI 2 — Vendas no período (eventos 'won' na janela, contagem). */
export interface GlobalSalesResponse {
  sales: number;
}

/**
 * KPI 3 — Valor vendido (R$): soma de interest_items.value dos leads das
 * negociações ganhas na janela. Vendas sem item de interesse (ou item sem
 * valor) entram com 0 — `salesWithoutValue` expõe quantas são, para o
 * gestor saber o quanto o número está subestimado.
 */
export interface SalesValueResponse {
  salesValue: number;
  salesWithoutValue: number;
}

/**
 * KPI 4 — Valor em pipeline (R$): soma de interest_items.value dos leads
 * das negociações ATIVAS (snapshot) — quanto há "na mesa" agora.
 */
export interface PipelineValueResponse {
  pipelineValue: number;
  negotiationsWithoutValue: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE TYPES — CHARTS
// ─────────────────────────────────────────────────────────────────────────────

/** Chart 1 — Funil global: negociações ATIVAS pelo estágio atual. */
export interface GlobalStageFunnelItem {
  stage: NegotiationStage;
  count: number;
}

export interface GlobalStageFunnelResponse {
  funnel: GlobalStageFunnelItem[];
}

/** Chart 2 — Ranking de vendas por equipe (eventos 'won' na janela). */
export interface SalesByTeamItem {
  teamId: string;
  teamName: string;
  sales: number;
}

export interface SalesByTeamResponse {
  salesByTeam: SalesByTeamItem[];
}

/** Chart 3 — Vendas por loja (Stores → Teams → Negotiations), com valor. */
export interface SalesByStoreItem {
  storeId: string;
  storeName: string;
  sales: number;
  salesValue: number;
}

export interface SalesByStoreResponse {
  salesByStore: SalesByStoreItem[];
}

/** Chart 4 — Evolução global diária: abertas × ganhas. */
export interface GlobalEvolutionPoint {
  date: string; // YYYY-MM-DD
  opened: number;
  won: number;
}

export interface GlobalEvolutionResponse {
  evolution: GlobalEvolutionPoint[];
}

/** Chart 5 — Leads parados (global): sem nenhuma negociação aberta. */
export interface GlobalIdleLeadsBySourceItem {
  source: string;
  count: number;
}

export interface GlobalIdleLeadsResponse {
  idleLeads: {
    total: number;
    neverNegotiated: number;
    closedOnly: number;
    bySource: GlobalIdleLeadsBySourceItem[];
  };
}
