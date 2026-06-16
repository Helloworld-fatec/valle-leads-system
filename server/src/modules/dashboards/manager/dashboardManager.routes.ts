// src/modules/dashboards/dashboard-manager/dashboardManager.routes.ts

import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth/auth.middleware.js';
import { checkPermission } from '../../../middlewares/auth/permission.middleware.js';
import { validateQuery } from '../../../middlewares/validation/validate.middleware.js';
import { managerDashboardFilterSchema } from './dashboardManager.dto.js';
import { DashboardManagerController } from './dashboardManager.controller.js';

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD MANAGER ROUTES — negociação-cêntrico
// ─────────────────────────────────────────────────────────────────────────────
//
// Pipeline aplicada a TODAS as rotas via .use():
//   1. authMiddleware            → JWT válido, injeta req.user.
//   2. checkPermission('MANAGER') → nível mínimo MANAGER (GM/ADMIN passam por
//      hierarquia; o escopo fino "manager só vê a própria equipa" é do service).
//   3. validateQuery(schema)     → query params tipados via Zod.
//
// SEMÂNTICA DOS ENDPOINTS:
//   - SNAPSHOT (ignoram startDate/endDate): active-negotiations,
//     stagnant-negotiations, stage-funnel, workload-by-attendant, idle-leads.
//   - JANELA (âncora na data do EVENTO da negociação): sales, closing-rate,
//     sales-by-attendant, evolution.
//
// ─────────────────────────────────────────────────────────────────────────────

const dashboardManagerRoutes = Router();
const controller = new DashboardManagerController();

dashboardManagerRoutes.use(authMiddleware);
dashboardManagerRoutes.use(checkPermission('MANAGER'));
dashboardManagerRoutes.use(validateQuery(managerDashboardFilterSchema));

// ─── KPIs ─────────────────────────────────────────────────────────────────
dashboardManagerRoutes.get('/kpi/active-negotiations', controller.getActiveNegotiations);
dashboardManagerRoutes.get('/kpi/sales', controller.getSales);
dashboardManagerRoutes.get('/kpi/closing-rate', controller.getClosingRate);
dashboardManagerRoutes.get('/kpi/stagnant-negotiations', controller.getStagnantNegotiations);

// ─── CHARTS ───────────────────────────────────────────────────────────────
dashboardManagerRoutes.get('/charts/stage-funnel', controller.getStageFunnel);
dashboardManagerRoutes.get('/charts/sales-by-attendant', controller.getSalesByAttendant);
dashboardManagerRoutes.get('/charts/workload-by-attendant', controller.getWorkloadByAttendant);
dashboardManagerRoutes.get('/charts/evolution', controller.getEvolution);
dashboardManagerRoutes.get('/charts/idle-leads', controller.getIdleLeads);

export default dashboardManagerRoutes;
