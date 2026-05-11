// src/modules/dashboards/attendant/dashboardAttendant.routes.ts

import { Router } from 'express';
import { DashboardAttendantController } from './dashboardAttendant.controller.js';
import { validateQuery } from '../../../middlewares/validation/validate.middleware.js';
import { attendantDashboardFilterSchema } from './dashboardAttendant.dto.js';
import { mockAuthMiddleware } from '../../../middlewares/auth/mockAuth.middleware.js';

const dashboardAttendantRoutes = Router();
const controller = new DashboardAttendantController();

// Middleware de Mock Auth (Temporário)
dashboardAttendantRoutes.use(mockAuthMiddleware);

// Middleware de Validação (Zod)
dashboardAttendantRoutes.use(validateQuery(attendantDashboardFilterSchema));

// KPIs
dashboardAttendantRoutes.get('/kpi/active-leads', controller.getActiveLeads);
dashboardAttendantRoutes.get('/kpi/converted-leads', controller.getConvertedLeads);
dashboardAttendantRoutes.get('/kpi/conversion-rate', controller.getConversionRate);
dashboardAttendantRoutes.get('/kpi/avg-service-time', controller.getAvgServiceTime);

// Gráficos
dashboardAttendantRoutes.get('/charts/leads-evolution', controller.getLeadsEvolution);
dashboardAttendantRoutes.get('/charts/sales-funnel', controller.getSalesFunnel);
dashboardAttendantRoutes.get('/charts/leads-by-source', controller.getLeadsBySource);
dashboardAttendantRoutes.get('/charts/conversions-by-period', controller.getConversionsByPeriod);

export default dashboardAttendantRoutes;