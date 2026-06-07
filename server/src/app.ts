// server/src/app.ts
import express from 'express';
import { json } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mainRouter from './routes';
import { globalErrorHandler } from './middlewares/errors/globalError.middleware.js';

const app = express();

// 1. JSON
app.use(json());

// 2. Middleware CORS.
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174']; // Adicione a URL do seu frontend
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// 3. Cookies
app.use(cookieParser());

// 4. Rotas
app.use('/api', mainRouter);

// 5. Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo à API do Valle Leads System!' });
});

// 6. Error handler global
app.use(globalErrorHandler);

export default app;