// src/modules/dashboards/dashboard-manager/dashboardManager.routes.ts

import { Router } from 'express';
import { DashboardManagerController } from './dashboardManager.controller.js';
import { validateQuery } from '../../../middlewares/validation/validate.middleware.js';
import { managerDashboardFilterSchema } from './dashboardManager.dto.js';
import { authMiddleware } from '../../../middlewares/auth/auth.middleware.js';
import { checkPermission } from '../../../middlewares/auth/permission.middleware.js';

// ─────────────────────────────────────────────
// DASHBOARD MANAGER ROUTES
// ─────────────────────────────────────────────
// Pipeline aplicada a TODAS as rotas deste router:
//   1. authMiddleware            → exige access token válido + injeta req.user
//   2. checkPermission("MANAGER") → hierárquico: MANAGER, GENERAL_MANAGER e ADMIN
//   3. validateQuery(schema)     → valida e tipa os filtros temporais
//
// Por que checkPermission e não checkRole?
// Aqui a regra é monotônica: quem tem mais privilégio (GENERAL_MANAGER, ADMIN)
// pode visualizar o dashboard de gerente também. Hierarquia resolve.
//
// Restrição granular ("manager vê apenas dados dos próprios times", conforme
// RF02): o SERVICE filtra pelo req.user.team_ids — não cabe na rota.
// ─────────────────────────────────────────────

const dashboardManagerRoutes = Router();
const controller = new DashboardManagerController();

// Autenticação + Permissão + Validação aplicadas globalmente
dashboardManagerRoutes.use(authMiddleware);
dashboardManagerRoutes.use(checkPermission('MANAGER'));
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
