// src/contexts/AuthContext.tsx
import { createContext, useState, useEffect, useContext, ReactNode } from "react";

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

export type UserRole = "ATTENDANT" | "MANAGER" | "GENERAL_MANAGER" | "ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team_ids: string[]; // array — usuário pode pertencer a múltiplos times
}

interface AuthContextData {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

// ─────────────────────────────────────────────
// Chaves do localStorage
// ─────────────────────────────────────────────

const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "authUser";

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

// ─────────────────────────────────────────────
// Helpers de persistência
// ─────────────────────────────────────────────

function loadFromStorage(): { user: AuthUser | null; accessToken: string | null } {
  try {
    const rawUser = localStorage.getItem(USER_KEY);
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const user: AuthUser | null = rawUser ? JSON.parse(rawUser) : null;
    return { user, accessToken };
  } catch {
    return { user: null, accessToken: null };
  }
}

function saveToStorage(user: AuthUser, accessToken: string, refreshToken: string) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

function clearStorage() {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Hidrata o estado a partir do localStorage na montagem
  useEffect(() => {
    const { user: storedUser, accessToken: storedToken } = loadFromStorage();
    if (storedUser && storedToken) {
      setUser(storedUser);
      setAccessToken(storedToken);
    }
    setInitialized(true);
  }, []);

  function login(userData: AuthUser, token: string, refreshToken: string) {
    saveToStorage(userData, token, refreshToken);
    setUser(userData);
    setAccessToken(token);
  }

  function logout() {
    clearStorage();
    setUser(null);
    setAccessToken(null);
  }

  // Não renderiza nada até a hidratação estar completa
  // (evita flash de redirect para /login quando o usuário já está logado)
  if (!initialized) return null;

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}