// src/routes/index.ts
import { Router } from 'express';

// Rotas dos módulos
import usersRoutes from '../modules/users/users.routes.js';
import storesRoutes from '../modules/stores/store.routes.js';
import teamsRoutes from '../modules/teams/teams.routes.js';
import usersTeamsRoutes from '../modules/users-teams/usersTeams.routes.js';
import customersRoutes from '../modules/customers/customer.routes.js';
import leadsRoutes from '../modules/leads/lead.routes.js';
import negotiationsRoutes from '../modules/negotiation/negotiation.routes.js';

const mainRouter = Router();

// Usuários
mainRouter.use('/users', usersRoutes);

// Lojas
mainRouter.use('/stores', storesRoutes);

// Times
mainRouter.use('/teams', teamsRoutes);

// Vínculos entre usuários e times
mainRouter.use('/users-teams', usersTeamsRoutes);

// Clientes
mainRouter.use('/customers', customersRoutes);

// Leads
mainRouter.use('/leads', leadsRoutes);

// Negociações
mainRouter.use('/negotiations', negotiationsRoutes);

export default mainRouter;