// src/middlewares/mockAuth.middleware.ts

import { Request, Response, NextFunction } from "express";

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type UserRole =
  | "ATTENDANT"
  | "MANAGER"
  | "GENERAL_MANAGER"
  | "ADMIN";

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team_id: string | null;
}

// ─────────────────────────────────────────────
// Usuários mockados
// DEVE ser igual ao frontend (AuthContext)
// Troque manualmente conforme o usuário usado no frontend
// ─────────────────────────────────────────────

const MOCK_USERS: Record<string, MockUser> = {
  ATTENDANT: {
    id: "92e8f1df-9e6e-4af8-8b4e-82fa3bc88120",
    name: "Dev Local",
    email: "dev@vallemultimarcas.com.br",
    role: "ATTENDANT",
    team_id: "fcc5008a-3313-49e4-8ddd-5e68a9363502",
  },

  MANAGER: {
    id: "d450a691-e2ea-47c1-9087-ecdd9bbde73c",
    name: "Gerente Local",
    email: "dev@vallemultimarcas.com.br",
    role: "MANAGER",
    team_id: "33fc73b5-38da-4cc0-9906-69f2ea0610c0",
  },

  GENERAL_MANAGER: {
    id: "c6fe0f87-5147-4e2d-a19d-fa6d076524b9",
    name: "Gerente Geral",
    email: "dev@vallemultimarcas.com.br",
    role: "GENERAL_MANAGER",
    team_id: "33fc73b5-38da-4cc0-9906-69f2ea0610c0",
  },
};

// ─────────────────────────────────────────────
// Usuário mockado ATIVO
// DEVE bater com o frontend
// ─────────────────────────────────────────────

const ACTIVE_MOCK_USER = MOCK_USERS.GENERAL_MANAGER;

// Exemplos:
// const ACTIVE_MOCK_USER = MOCK_USERS.ATTENDANT;
// const ACTIVE_MOCK_USER = MOCK_USERS.MANAGER;
// const ACTIVE_MOCK_USER = MOCK_USERS.GENERAL_MANAGER;

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────

/**
 * Middleware TEMPORÁRIO de desenvolvimento.
 *
 * Injeta um usuário fake no req.user
 * para permitir testar dashboards sem JWT.
 */
export function mockAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  (req as any).user = ACTIVE_MOCK_USER;

  next();
}