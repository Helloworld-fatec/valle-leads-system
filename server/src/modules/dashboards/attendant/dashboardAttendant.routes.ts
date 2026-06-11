// src/modules/dashboards/attendant/dashboardAttendant.routes.ts

import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth/auth.middleware.js';
import { checkPermission } from '../../../middlewares/auth/permission.middleware.js';
import { validateQuery } from '../../../middlewares/validation/validate.middleware.js';
import { attendantDashboardFilterSchema } from './dashboardAttendant.dto.js';
import { DashboardAttendantController } from './dashboardAttendant.controller.js';

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD ATTENDANT ROUTES — negociação-cêntrico
// ─────────────────────────────────────────────────────────────────────────────
//
// Pipeline aplicada a TODAS as rotas via .use():
//
//   1. authMiddleware
//      → Valida o access token JWT e injeta req.user. Sem token válido → 403.
//
//   2. checkPermission('ATTENDANT')
//      → Nível hierárquico mínimo. O controle granular de escopo
//        ("atendente vê APENAS os próprios dados") é do service
//        (assertCanAccess), que tem contexto de runtime.
//
//   3. validateQuery(attendantDashboardFilterSchema)
//      → Valida e transforma query params via Zod (Dates tipadas).
//        Params inválidos → 422 antes do controller.
//
// SEMÂNTICA DOS ENDPOINTS:
//   - SNAPSHOT (ignoram startDate/endDate): active-negotiations, stage-funnel,
//     temperature, idle-leads — representam a carteira ATUAL.
//   - JANELA (âncora na data do EVENTO da negociação): sales, closing-rate,
//     avg-closing-time, evolution, negotiations-by-source.
//
// ─────────────────────────────────────────────────────────────────────────────

const dashboardAttendantRoutes = Router();
const controller = new DashboardAttendantController();

dashboardAttendantRoutes.use(authMiddleware);
dashboardAttendantRoutes.use(checkPermission('ATTENDANT'));
dashboardAttendantRoutes.use(validateQuery(attendantDashboardFilterSchema));

// ─── KPIs ─────────────────────────────────────────────────────────────────
dashboardAttendantRoutes.get('/kpi/active-negotiations', controller.getActiveNegotiations);
dashboardAttendantRoutes.get('/kpi/sales', controller.getSales);
dashboardAttendantRoutes.get('/kpi/closing-rate', controller.getClosingRate);
dashboardAttendantRoutes.get('/kpi/avg-closing-time', controller.getAvgClosingTime);

// ─── CHARTS ───────────────────────────────────────────────────────────────
dashboardAttendantRoutes.get('/charts/stage-funnel', controller.getStageFunnel);
dashboardAttendantRoutes.get('/charts/evolution', controller.getEvolution);
dashboardAttendantRoutes.get('/charts/temperature', controller.getTemperature);
dashboardAttendantRoutes.get('/charts/negotiations-by-source', controller.getNegotiationsBySource);
dashboardAttendantRoutes.get('/charts/idle-leads', controller.getIdleLeads);

export default dashboardAttendantRoutes;
