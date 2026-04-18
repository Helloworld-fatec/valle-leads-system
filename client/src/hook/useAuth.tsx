// src/hook/useAuth.ts
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

/**
 * Hook para acessar o contexto de autenticação em qualquer componente.
 *
 * Exemplo de uso:
 *   const { user, isAuthenticated, logout } = useAuth();
 */
export function useAuth() {
  return useContext(AuthContext);
}
