// src/routes/PublicOnlyRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hook/useAuth";

/**
 * Rota exclusivamente pública.
 * Se o usuário já estiver autenticado, redireciona para /dashboard.
 * Usado para envolver /login e evitar que usuários logados acessem a tela de entrada.
 */
export default function PublicOnlyRoute() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}