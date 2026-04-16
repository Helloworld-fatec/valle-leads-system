// server/src/app.ts
import express from 'express';
import { json } from 'express';
//import cors from 'cors';
import cookieParser from 'cookie-parser';

import mainRouter from './routes';
import { globalErrorHandler } from './middlewares/errors/globalError.middleware.js';


const app = express();

/**
 * Configuração dos Middlewares Globais do Express.
 */

// 1. Middleware para processar corpos de requisição JSON.
app.use(json());

// 2. Middleware CORS.

/** 
const allowedOrigins = ['http://localhost:5173', FRONTEND_URL]; // Adicione a URL do seu frontend
app.use(cors({
  origin: allowedOrigins,
  credentials: true, // Muito importante para permitir o envio e recebimento de cookies (refreshToken)
}));
*/

// 3. NOVO MIDDLEWARE: Analisa os cookies das requisições.
// Sem esta linha, `req.cookies` será um objeto vazio.
// Adicione-o aqui, após o `json()` e `cors()`.
app.use(cookieParser());


// 4. Monta o roteador principal da API.
app.use('/api', mainRouter);

// 5. Rota de teste simples.
app.get('/', (req, res) => {
    res.json({ message: 'Bem-vindo à API do Valle Leads System! TypeScript + Express + Prisma está funcionando!' });
});

// 6. Middleware de Tratamento de Erros Global.
app.use(globalErrorHandler);

// Exporta a instância da aplicação Express.
export default app;