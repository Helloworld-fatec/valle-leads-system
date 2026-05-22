// src/modules/dashboards/attendant/dashboardAttendant.routes.ts

import { Router } from 'express';
import { DashboardAttendantController } from './dashboardAttendant.controller.js';
import { validateQuery } from '../../../middlewares/validation/validate.middleware.js';
import { attendantDashboardFilterSchema } from './dashboardAttendant.dto.js';
import { authMiddleware } from '../../../middlewares/auth/auth.middleware.js';
import { checkPermission } from '../../../middlewares/auth/permission.middleware.js';

// ─────────────────────────────────────────────
// DASHBOARD ATTENDANT ROUTES
// ─────────────────────────────────────────────
// Pipeline aplicada a TODAS as rotas deste router (via .use):
//   1. authMiddleware              → exige access token válido + injeta req.user
//   2. checkPermission("ATTENDANT") → mínimo hierárquico: qualquer perfil autenticado
//   3. validateQuery(schema)       → valida e tipa os filtros temporais
//
// Por que checkPermission("ATTENDANT") e não algo mais restritivo?
// O nível ATTENDANT é o "piso" da hierarquia — o middleware deixa passar
// QUALQUER perfil autenticado (ATTENDANT, MANAGER, GENERAL_MANAGER, ADMIN).
// A restrição real de escopo ("atendente vê APENAS os próprios leads",
// conforme RF02) é responsabilidade do SERVICE, não da rota — porque ela
// é dinâmica (depende do req.user.id), não estática.
// ─────────────────────────────────────────────

const dashboardAttendantRoutes = Router();
const controller = new DashboardAttendantController();

// Autenticação + Permissão + Validação aplicadas globalmente
dashboardAttendantRoutes.use(authMiddleware);
dashboardAttendantRoutes.use(checkPermission('ATTENDANT'));
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
