// src/modules/dashboards/general-manager/dashboardGeneralManager.routes.ts

import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth/auth.middleware.js';
import { checkPermission } from '../../../middlewares/auth/permission.middleware.js';
import { validateQuery } from '../../../middlewares/validation/validate.middleware.js';
import { generalManagerDashboardFilterSchema } from './dashboardGeneralManager.dto.js';
import { DashboardGeneralManagerController } from './dashboardGeneralManager.controller.js';

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD GENERAL MANAGER ROUTES
// ─────────────────────────────────────────────────────────────────────────────
//
// Pipeline aplicada a TODAS as rotas via .use():
//
//   1. authMiddleware
//      → Valida o access token JWT e injeta req.user com { id, email, role, team_ids }.
//        Qualquer requisição sem token válido é rejeitada com 403 antes de chegar
//        ao controller.
//
//   2. checkPermission('GENERAL_MANAGER')
//      → Hierárquico: apenas GENERAL_MANAGER e ADMIN passam. MANAGER e ATTENDANT
//        recebem 403. O RF02 é explícito: o dashboard do ADMIN inclui o mesmo
//        dashboard do GENERAL_MANAGER, então a hierarquia resolve corretamente
//        sem precisar de checkRole.
//
//   3. validateQuery(generalManagerDashboardFilterSchema)
//      → Valida e transforma os query params via Zod. Após este middleware,
//        req.query contém valores já tipados (Dates em vez de strings brutas).
//        Requisições com params inválidos recebem 422 antes de chegar ao controller.
//
// Não há restrição de escopo a aplicar no service além dos filtros temporais:
// os endpoints desta rota são globais por definição — cobrem todas as equipas.
//
// ─────────────────────────────────────────────────────────────────────────────

const dashboardGeneralManagerRoutes = Router();
const controller = new DashboardGeneralManagerController();

// Aplica a pipeline de segurança e validação globalmente neste router
dashboardGeneralManagerRoutes.use(authMiddleware);
dashboardGeneralManagerRoutes.use(checkPermission('GENERAL_MANAGER'));
dashboardGeneralManagerRoutes.use(validateQuery(generalManagerDashboardFilterSchema));

// ─── KPIs ─────────────────────────────────────────────────────────────────
dashboardGeneralManagerRoutes.get('/kpi/global', controller.getGlobalKpis);
dashboardGeneralManagerRoutes.get('/kpi/top-team', controller.getTopTeam);

// ─── CHARTS ───────────────────────────────────────────────────────────────
dashboardGeneralManagerRoutes.get('/charts/leads-by-team', controller.getLeadsByTeam);
dashboardGeneralManagerRoutes.get('/charts/team-ranking', controller.getTeamRanking);
dashboardGeneralManagerRoutes.get('/charts/global-evolution', controller.getGlobalEvolution);
dashboardGeneralManagerRoutes.get('/charts/global-funnel', controller.getGlobalFunnel);

export default dashboardGeneralManagerRoutes;  