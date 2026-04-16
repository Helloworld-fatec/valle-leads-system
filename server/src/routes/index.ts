// src/routes/index.ts
import { Router } from 'express';

// Rotas dos módulos
import usersRoutes from '../modules/users/users.routes.js';

const mainRouter = Router();

// Usuários
mainRouter.use('/users', usersRoutes);


export default mainRouter;