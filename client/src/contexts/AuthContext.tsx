// src/context/AuthContext.tsx
import { createContext, useState, ReactNode } from "react";

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
// Usuário mockado — usado enquanto o backend de
// auth não está pronto. Troque o `role` conforme
// a tela que está desenvolvendo:
//   "ATTENDANT"      → Nicolas, Bruna (visão atendente)
//   "MANAGER"        → Bruna (visão gerente)
//   "GENERAL_MANAGER"→ Pedro, Ryan
// ─────────────────────────────────────────────
const MOCK_USER: AuthUser = {
  id: "mock-user-id-001", // ← volta para o mock
  name: "Dev Local",
  email: "dev@vallemultimarcas.com.br",
  role: "ATTENDANT",
  team_id: "mock-team-id-001",
};

const MOCK_TOKEN = "mock-access-token";

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Inicializa já com o mock enquanto o login real não existe.
  // Quando o login estiver pronto, mude o estado inicial para `null`
  // e implemente o login/logout abaixo normalmente.
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
