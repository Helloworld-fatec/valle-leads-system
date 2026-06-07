// src/modules/dashboards/dashboard-manager/dashboardManager.dto.ts

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// FILTER SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

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
// RESPONSE TYPES
// Cada método do service retorna um tipo nomeado — sem objetos anônimos
// espalhados pelo código. Contratos estáveis verificados pelo compilador.
// ─────────────────────────────────────────────────────────────────────────────

export interface TeamKpisResponse {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  stagnantLeads: number;
}

export interface TopAttendantInfo {
  id: string;
  name: string;
  conversions: number;
}

export interface TopAttendantResponse {
  topAttendant: TopAttendantInfo | null;
}

export interface AttendantLeadsItem {
  attendantId: string | null;
  attendantName: string;
  count: number;
}

export interface LeadsByAttendantResponse {
  leadsByAttendant: AttendantLeadsItem[];
}

export interface AttendantConversionsItem {
  attendantId: string | null;
  attendantName: string;
  count: number;
}

export interface ConversionsByAttendantResponse {
  conversionsByAttendant: AttendantConversionsItem[];
}

export interface TeamEvolutionPoint {
  date: string;
  count: number;
}

export interface TeamEvolutionResponse {
  evolution: TeamEvolutionPoint[];
}

export interface TeamFunnelItem {
  status: string;
  count: number;
}

export interface TeamFunnelResponse {
  funnel: TeamFunnelItem[];
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL TYPES (usados entre repository e service)
// ─────────────────────────────────────────────────────────────────────────────

/** Retorno bruto do repository para o cálculo de KPIs de conversão da equipa. */
export interface TeamConversionData {
  totalLeads: number;
  convertedLeads: number;
}

/**
 * Linha bruta retornada pelo groupBy de attendant_id.
 * Representa uma agregação de leads por atendente (total ou convertidos).
 */
export interface AttendantLeadsRow {
  attendant_id: string | null;
  _count: { id: number };
}