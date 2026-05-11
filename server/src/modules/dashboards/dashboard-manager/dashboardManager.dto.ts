// src/modules/dashboards/dashboard-manager/dashboardManager.dto.ts

import { z } from 'zod';

export const managerDashboardFilterSchema = z.object({
  // NOVO: Permite receber o ID de uma equipe específica via query params
  teamId: z.string()
    .uuid({ message: "O ID da equipe deve ser um UUID válido." })
    .optional(),

  startDate: z.string()
    .datetime({ message: "A data de início deve estar no formato ISO 8601." })
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),

  endDate: z.string()
    .datetime({ message: "A data de fim deve estar no formato ISO 8601." })
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),

}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.startDate <= data.endDate;
  }
  return true;
}, {
  message: "A data de início não pode ser posterior à data de fim.",
  path: ["startDate"],
});

export type ManagerDashboardFilterDTO = z.infer<typeof managerDashboardFilterSchema>;