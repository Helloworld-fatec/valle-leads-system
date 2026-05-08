// src/contexts/AuthContext.tsx
import { createContext, useState, ReactNode, useContext } from "react";

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

export type UserRole = "ATTENDANT" | "MANAGER" | "GENERAL_MANAGER" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team_id: string | null;
}

interface AuthContextData {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

// ─────────────────────────────────────────────
// Usuário mockado
// Troque o `role` conforme a tela que está desenvolvendo:
//   "ATTENDANT"       → visão atendente
//   "MANAGER"         → visão gerente
//   "GENERAL_MANAGER" → visão gerente geral
// ─────────────────────────────────────────────


// ─────────────────────────────────────────────
//Para testar com um usuário com outro 'role', basta descomentar o bloco correspondente e comentar o atual.

/*
const MOCK_USER: AuthUser = {
  id: "92e8f1df-9e6e-4af8-8b4e-82fa3bc88120",
  name: "Dev Local",
  email: "dev@vallemultimarcas.com.br",
  role: "ATTENDANT",
  team_id: "fcc5008a-3313-49e4-8ddd-5e68a9363502",
};

const MOCK_USER: AuthUser = {
  id: "c6fe0f87-5147-4e2d-a19d-fa6d076524b9",
  name: "Gerente Geral",
  email: "dev@vallemultimarcas.com.br",
  role: "GENERAL_MANAGER",
  team_id: "33fc73b5-38da-4cc0-9906-69f2ea0610c0",
};
*/

// ─────────────────────────────────────────────

const MOCK_USER: AuthUser = {
  id: "d450a691-e2ea-47c1-9087-ecdd9bbde73c",
  name: "Gerente Local",
  email: "dev@vallemultimarcas.com.br",
  role: "MANAGER",
  team_id: "33fc73b5-38da-4cc0-9906-69f2ea0610c0",
};

// ─────────────────────────────────────────────

const MOCK_TOKEN = "mock-access-token";

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(MOCK_USER);
  const [accessToken, setAccessToken] = useState<string | null>(MOCK_TOKEN);

  function login(userData: AuthUser, token: string, refreshToken: string) {
    localStorage.setItem("refreshToken", refreshToken);
    setUser(userData);
    setAccessToken(token);
  }

  function logout() {
    localStorage.removeItem("refreshToken");
    setUser(null);
    setAccessToken(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}