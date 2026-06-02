// src/modules/dashboards/attendant/dashboardAttendant.dto.ts

import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// FILTER SCHEMA
// ─────────────────────────────────────────────────────────────────────────────

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
// RESPONSE TYPES
// Cada método do service retorna um tipo específico — sem objetos anônimos
// espalhados pelo código. Isso permite que o front-end consuma contratos
// estáveis e que o TypeScript verifique a forma de cada resposta.
// ─────────────────────────────────────────────────────────────────────────────

export interface ActiveLeadsResponse {
  activeLeads: number;
}

export interface ConvertedLeadsResponse {
  convertedLeads: number;
}

export interface ConversionRateResponse {
  conversionRate: number;
  totalLeads: number;
  convertedLeads: number;
}

export interface AvgServiceTimeResponse {
  avgServiceTimeHours: number;
}

export interface LeadsEvolutionPoint {
  date: string;
  count: number;
}

export interface LeadsEvolutionResponse {
  evolution: LeadsEvolutionPoint[];
}

export interface SalesFunnelItem {
  status: string;
  count: number;
}

export interface SalesFunnelResponse {
  funnel: SalesFunnelItem[];
}

export interface LeadsBySourceItem {
  source: string;
  count: number;
}

export interface LeadsBySourceResponse {
  sources: LeadsBySourceItem[];
}

export interface ConversionsByPeriodPoint {
  date: string;
  count: number;
}

export interface ConversionsByPeriodResponse {
  conversions: ConversionsByPeriodPoint[];
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL TYPES (usados entre repository e service)
// ─────────────────────────────────────────────────────────────────────────────

/** Retorno bruto do repository para o cálculo de taxa de conversão. */
export interface ConversionData {
  totalLeads: number;
  convertedLeads: number;
}

/** Shape mínimo de um lead usado para cálculo de tempo médio. */
export interface LeadTimestamps {
  created_at: Date;
  updated_at: Date;
}