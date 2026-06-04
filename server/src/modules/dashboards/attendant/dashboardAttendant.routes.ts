// src/modules/dashboards/attendant/dashboardAttendant.routes.ts

import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth/auth.middleware.js';
import { checkPermission } from '../../../middlewares/auth/permission.middleware.js';
import { validateQuery } from '../../../middlewares/validation/validate.middleware.js';
import { attendantDashboardFilterSchema } from './dashboardAttendant.dto.js';
import { DashboardAttendantController } from './dashboardAttendant.controller.js';

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD ATTENDANT ROUTES
// ─────────────────────────────────────────────────────────────────────────────
//
// Pipeline aplicada a TODAS as rotas via .use():
//
//   1. authMiddleware
//      → Valida o access token JWT e injeta req.user com { id, email, role, team_ids }.
//        Qualquer requisição sem token válido é rejeitada com 403 antes de chegar
//        ao controller.
//
//   2. checkPermission('ATTENDANT')
//      → Nível hierárquico mínimo: deixa passar ATTENDANT, MANAGER,
//        GENERAL_MANAGER e ADMIN. O controle granular de escopo
//        ("atendente vê APENAS os próprios dados") é responsabilidade do
//        DashboardAttendantService.assertCanAccess(), que tem contexto de
//        runtime (req.user.id vs targetId) para aplicar a regra.
//
//   3. validateQuery(attendantDashboardFilterSchema)
//      → Valida e transforma os query params via Zod. Após este middleware,
//        req.query contém valores já tipados (Dates em vez de strings brutas).
//        Requisições com params inválidos recebem 422 antes de chegar ao controller.
//
// ─────────────────────────────────────────────────────────────────────────────

const dashboardAttendantRoutes = Router();
const controller = new DashboardAttendantController();

// Aplica a pipeline de segurança e validação globalmente neste router
dashboardAttendantRoutes.use(authMiddleware);
dashboardAttendantRoutes.use(checkPermission('ATTENDANT'));
dashboardAttendantRoutes.use(validateQuery(attendantDashboardFilterSchema));

// ─── KPIs ─────────────────────────────────────────────────────────────────
dashboardAttendantRoutes.get('/kpi/active-leads', controller.getActiveLeads);
dashboardAttendantRoutes.get('/kpi/converted-leads', controller.getConvertedLeads);
dashboardAttendantRoutes.get('/kpi/conversion-rate', controller.getConversionRate);
dashboardAttendantRoutes.get('/kpi/avg-service-time', controller.getAvgServiceTime);

// ─── CHARTS ───────────────────────────────────────────────────────────────
dashboardAttendantRoutes.get('/charts/leads-evolution', controller.getLeadsEvolution);
dashboardAttendantRoutes.get('/charts/sales-funnel', controller.getSalesFunnel);
dashboardAttendantRoutes.get('/charts/leads-by-source', controller.getLeadsBySource);
dashboardAttendantRoutes.get('/charts/conversions-by-period', controller.getConversionsByPeriod);

export default dashboardAttendantRoutes;