// src/modules/dashboards/general-manager/dashboardGeneralManager.dto.ts

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// FILTER SCHEMA
// ─────────────────────────────────────────────────────────────────────────────
// Não há teamId nem attendantId aqui: a visão do General Manager é sempre
// global — cobre todas as equipas sem restrição de escopo.

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

export type GeneralManagerDashboardFilterDTO = z.infer<typeof generalManagerDashboardFilterSchema>;

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSE TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface GlobalKpisResponse {
  totalLeads: number;
  totalSales: number;
  globalConversionRate: number;
}

export interface TopTeamInfo {
  id: string;
  name: string;
  conversions: number;
}

export interface TopTeamResponse {
  topTeam: TopTeamInfo | null;
}

export interface TeamLeadsItem {
  teamId: string | null;
  teamName: string;
  count: number;
}

export interface LeadsByTeamResponse {
  leadsByTeam: TeamLeadsItem[];
}

export interface TeamRankingItem {
  teamId: string | null;
  teamName: string;
  conversions: number;
}

export interface TeamRankingResponse {
  teamRanking: TeamRankingItem[];
}

export interface GlobalEvolutionPoint {
  date: string;
  count: number;
}

export interface GlobalEvolutionResponse {
  evolution: GlobalEvolutionPoint[];
}

export interface GlobalFunnelItem {
  status: string;
  count: number;
}

export interface GlobalFunnelResponse {
  funnel: GlobalFunnelItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL TYPES (usados entre repository e service)
// ─────────────────────────────────────────────────────────────────────────────

/** Retorno bruto do repository para o cálculo de KPIs globais de conversão. */
export interface GlobalConversionData {
  totalLeads: number;
  convertedLeads: number;
}

/**
 * Linha bruta retornada pelo groupBy de team_id.
 * Representa uma agregação de leads por equipa (total ou convertidos).
 * Mesmo padrão de AttendantLeadsRow no manager — o Prisma infere
 * o tipo internamente; mapeamos explicitamente antes de retornar.
 */
export interface TeamLeadsRow {
  team_id: string;
  _count: { id: number };
}