// src/modules/dashboards/dashboard-general-manager/dashboardGeneralManager.routes.ts

import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth/auth.middleware.js';
import { checkPermission } from '../../../middlewares/auth/permission.middleware.js';
import { validateQuery } from '../../../middlewares/validation/validate.middleware.js';
import { generalManagerDashboardFilterSchema } from './dashboardGeneralManager.dto.js';
import { DashboardGeneralManagerController } from './dashboardGeneralManager.controller.js';

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD GENERAL MANAGER ROUTES — negociação-cêntrico
// ─────────────────────────────────────────────────────────────────────────────
//
// Pipeline aplicada a TODAS as rotas via .use():
//   1. authMiddleware                       → JWT válido, injeta req.user.
//   2. checkPermission('GENERAL_MANAGER')   → restrito a GM e ADMIN.
//   3. validateQuery(schema)                → startDate/endDate tipados via Zod.
//
// SEMÂNTICA DOS ENDPOINTS:
//   - SNAPSHOT (ignoram startDate/endDate): active-negotiations,
//     pipeline-value, stage-funnel, idle-leads — estado ATUAL da empresa.
//   - JANELA (âncora na data do EVENTO da negociação): sales, sales-value,
//     sales-by-team, sales-by-store, evolution.
//
// Drill-down de equipe/atendente: o frontend usa os endpoints /manager e
// /attendant com teamId/attendantId — não há rotas de drill-down aqui.
//
// ─────────────────────────────────────────────────────────────────────────────

const dashboardGeneralManagerRoutes = Router();
const controller = new DashboardGeneralManagerController();

dashboardGeneralManagerRoutes.use(authMiddleware);
dashboardGeneralManagerRoutes.use(checkPermission('GENERAL_MANAGER'));
dashboardGeneralManagerRoutes.use(validateQuery(generalManagerDashboardFilterSchema));

// ─── KPIs ─────────────────────────────────────────────────────────────────
dashboardGeneralManagerRoutes.get('/kpi/active-negotiations', controller.getActiveNegotiations);
dashboardGeneralManagerRoutes.get('/kpi/sales', controller.getSales);
dashboardGeneralManagerRoutes.get('/kpi/sales-value', controller.getSalesValue);
dashboardGeneralManagerRoutes.get('/kpi/pipeline-value', controller.getPipelineValue);

// ─── CHARTS ───────────────────────────────────────────────────────────────
dashboardGeneralManagerRoutes.get('/charts/stage-funnel', controller.getStageFunnel);
dashboardGeneralManagerRoutes.get('/charts/sales-by-team', controller.getSalesByTeam);
dashboardGeneralManagerRoutes.get('/charts/sales-by-store', controller.getSalesByStore);
dashboardGeneralManagerRoutes.get('/charts/evolution', controller.getEvolution);
dashboardGeneralManagerRoutes.get('/charts/idle-leads', controller.getIdleLeads);

export default dashboardGeneralManagerRoutes;
