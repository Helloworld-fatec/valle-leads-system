// src/modules/dashboards/attendant/dashboardAttendant.dto.ts

import { z } from 'zod';

/**
 * Schema Zod para validação dos filtros de query string do Dashboard do Atendente.
 * Utilizado em conjunto com o middleware validateQuery.
 */
export const attendantDashboardFilterSchema = z.object({
  // NOVO: Permite receber o ID de um atendente específico via query params
  attendantId: z.string()
    .uuid({ message: "O ID do atendente deve ser um UUID válido." })
    .optional(),

  // Transformamos a string de data que vem da query em um objeto Date válido.
  startDate: z.string()
    .datetime({ message: "A data de início deve estar no formato ISO 8601 (ex: 2026-05-01T00:00:00Z)." })
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),

  endDate: z.string()
    .datetime({ message: "A data de fim deve estar no formato ISO 8601 (ex: 2026-05-11T23:59:59Z)." })
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),

}).refine((data) => {
  // Regra de negócio: Se ambas as datas forem fornecidas, startDate não pode ser maior que endDate.
  if (data.startDate && data.endDate) {
    return data.startDate <= data.endDate;
  }
  return true;
}, {
  message: "A data de início não pode ser posterior à data de fim.",
  path: ["startDate"], // O erro será associado ao campo startDate
});

// Inferência de tipagem para usar nos Controllers e Services
export type AttendantDashboardFilterDTO = z.infer<typeof attendantDashboardFilterSchema>;