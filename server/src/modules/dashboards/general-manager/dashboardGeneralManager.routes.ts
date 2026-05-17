// src/modules/dashboards/general-manager/dashboardGeneralManager.routes.ts

import { Router } from 'express';
import { DashboardGeneralManagerController } from './dashboardGeneralManager.controller.js';
import { validateQuery } from '../../../middlewares/validation/validate.middleware.js';
import { generalManagerDashboardFilterSchema } from './dashboardGeneralManager.dto.js';
import { mockAuthMiddleware } from '../../../middlewares/auth/mockAuth.middleware.js';

const dashboardGeneralManagerRoutes = Router();
const controller = new DashboardGeneralManagerController();

// Auth Mock e Validação Zod
dashboardGeneralManagerRoutes.use(mockAuthMiddleware);
dashboardGeneralManagerRoutes.use(validateQuery(generalManagerDashboardFilterSchema));

// KPIs Globais
dashboardGeneralManagerRoutes.get('/kpi/global', controller.getGlobalKpis);
dashboardGeneralManagerRoutes.get('/kpi/top-team', controller.getTopTeam);

// Gráficos Globais
dashboardGeneralManagerRoutes.get('/charts/leads-by-team', controller.getLeadsByTeam);
dashboardGeneralManagerRoutes.get('/charts/team-ranking', controller.getTeamRanking);
dashboardGeneralManagerRoutes.get('/charts/global-evolution', controller.getGlobalEvolution);
dashboardGeneralManagerRoutes.get('/charts/global-funnel', controller.getGlobalFunnel);

export default dashboardGeneralManagerRoutes;