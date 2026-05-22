// src/modules/dashboards/general-manager/dashboardGeneralManager.routes.ts

import { Router } from 'express';
import { DashboardGeneralManagerController } from './dashboardGeneralManager.controller.js';
import { validateQuery } from '../../../middlewares/validation/validate.middleware.js';
import { generalManagerDashboardFilterSchema } from './dashboardGeneralManager.dto.js';
import { authMiddleware } from '../../../middlewares/auth/auth.middleware.js';
import { checkPermission } from '../../../middlewares/auth/permission.middleware.js';

// ─────────────────────────────────────────────
// DASHBOARD GENERAL MANAGER ROUTES
// ─────────────────────────────────────────────
// Pipeline aplicada a TODAS as rotas deste router:
//   1. authMiddleware                    → exige access token válido + injeta req.user
//   2. checkPermission("GENERAL_MANAGER") → hierárquico: GENERAL_MANAGER e ADMIN
//   3. validateQuery(schema)             → valida e tipa os filtros temporais
//
// O desafio (RF02) é explícito: o dashboard do ADMIN inclui o mesmo dashboard
// do GENERAL_MANAGER. Como ADMIN está hierarquicamente acima, checkPermission
// resolve corretamente — não precisa de checkRole aqui.
//
// Os dashboards globais já são "globais" por definição (cobrem todas as
// equipes), então não há filtro de escopo a aplicar no service além dos
// filtros temporais do próprio DTO.
// ─────────────────────────────────────────────

const dashboardGeneralManagerRoutes = Router();
const controller = new DashboardGeneralManagerController();

// Autenticação + Permissão + Validação aplicadas globalmente
dashboardGeneralManagerRoutes.use(authMiddleware);
dashboardGeneralManagerRoutes.use(checkPermission('GENERAL_MANAGER'));
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
