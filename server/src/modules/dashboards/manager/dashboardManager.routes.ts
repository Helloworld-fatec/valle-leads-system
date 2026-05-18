// src/modules/dashboards/dashboard-manager/dashboardManager.routes.ts

import { Router } from 'express';
import { DashboardManagerController } from './dashboardManager.controller.js';
import { validateQuery } from '../../../middlewares/validation/validate.middleware.js';
import { managerDashboardFilterSchema } from './dashboardManager.dto.js';
import { mockAuthMiddleware } from '../../../middlewares/auth/mockAuth.middleware.js';

const dashboardManagerRoutes = Router();
const controller = new DashboardManagerController();

// Auth Mock e Validação Zod
dashboardManagerRoutes.use(mockAuthMiddleware);
dashboardManagerRoutes.use(validateQuery(managerDashboardFilterSchema));

// Rotas de KPIs
dashboardManagerRoutes.get('/kpi/team', controller.getTeamKpis);
dashboardManagerRoutes.get('/kpi/top-attendant', controller.getTopAttendant);

// Rotas de Gráficos
dashboardManagerRoutes.get('/charts/leads-by-attendant', controller.getLeadsByAttendant);
dashboardManagerRoutes.get('/charts/conversions-by-attendant', controller.getConversionsByAttendant);
dashboardManagerRoutes.get('/charts/team-evolution', controller.getTeamEvolution);
dashboardManagerRoutes.get('/charts/team-funnel', controller.getTeamFunnel);

export default dashboardManagerRoutes;