// src/modules/dashboards/general-manager/dashboardGeneralManager.dto.ts

import { z } from 'zod';

export const generalManagerDashboardFilterSchema = z.object({
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

export type GeneralManagerDashboardFilterDTO = z.infer<typeof generalManagerDashboardFilterSchema>;