// src/routes/index.ts
import { Router } from 'express';

// Rotas dos módulos
import usersRoutes from '../modules/users/users.routes.js';
import storesRoutes from '../modules/stores/store.routes.js';
import teamsRoutes from '../modules/teams/teams.routes.js';
import usersTeamsRoutes from '../modules/users-teams/usersTeams.routes.js';

const mainRouter = Router();

// Usuários
mainRouter.use('/users', usersRoutes);

// Lojas
mainRouter.use('/stores', storesRoutes);

// Times
mainRouter.use('/teams', teamsRoutes);

// Vínculos entre usuários e times
mainRouter.use('/users-teams', usersTeamsRoutes);


export default mainRouter;