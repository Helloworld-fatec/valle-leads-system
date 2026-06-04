// src/modules/dashboards/dashboard-manager/dashboardManager.routes.ts

import { Router } from 'express';
import { authMiddleware } from '../../../middlewares/auth/auth.middleware.js';
import { checkPermission } from '../../../middlewares/auth/permission.middleware.js';
import { validateQuery } from '../../../middlewares/validation/validate.middleware.js';
import { managerDashboardFilterSchema } from './dashboardManager.dto.js';
import { DashboardManagerController } from './dashboardManager.controller.js';

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD MANAGER ROUTES
// ─────────────────────────────────────────────────────────────────────────────
//
// Pipeline aplicada a TODAS as rotas via .use():
//
//   1. authMiddleware
//      → Valida o access token JWT e injeta req.user com { id, email, role, team_ids }.
//        Qualquer requisição sem token válido é rejeitada com 403 antes de chegar
//        ao controller.
//
//   2. checkPermission('MANAGER')
//      → Hierárquico: MANAGER, GENERAL_MANAGER e ADMIN passam; ATTENDANT recebe 403.
//        Aqui a hierarquia resolve bem porque quem tem mais privilégio
//        (GENERAL_MANAGER, ADMIN) também pode visualizar o dashboard de gerente.
//
//   3. validateQuery(managerDashboardFilterSchema)
//      → Valida e transforma os query params via Zod. Após este middleware,
//        req.query contém valores já tipados (Dates em vez de strings brutas).
//        Requisições com params inválidos recebem 422 antes de chegar ao controller.
//
// Restrição granular ("manager vê apenas dados dos próprios times"):
// responsabilidade do DashboardManagerService.assertCanAccess() — que
// tem contexto de runtime (req.user.team_ids vs targetTeamId) para aplicar
// a regra. Não cabe na rota, que só conhece papel, não escopo.
//
// ─────────────────────────────────────────────────────────────────────────────

const dashboardManagerRoutes = Router();
const controller = new DashboardManagerController();

// Aplica a pipeline de segurança e validação globalmente neste router
dashboardManagerRoutes.use(authMiddleware);
dashboardManagerRoutes.use(checkPermission('MANAGER'));
dashboardManagerRoutes.use(validateQuery(managerDashboardFilterSchema));

// ─── KPIs ─────────────────────────────────────────────────────────────────
dashboardManagerRoutes.get('/kpi/team', controller.getTeamKpis);
dashboardManagerRoutes.get('/kpi/top-attendant', controller.getTopAttendant);

// ─── CHARTS ───────────────────────────────────────────────────────────────
dashboardManagerRoutes.get('/charts/leads-by-attendant', controller.getLeadsByAttendant);
dashboardManagerRoutes.get('/charts/conversions-by-attendant', controller.getConversionsByAttendant);
dashboardManagerRoutes.get('/charts/team-evolution', controller.getTeamEvolution);
dashboardManagerRoutes.get('/charts/team-funnel', controller.getTeamFunnel);

export default dashboardManagerRoutes;