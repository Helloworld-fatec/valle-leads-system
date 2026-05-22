// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hook/useAuth";

interface ProtectedRouteProps {
  /** Roles permitidos. Se omitido, qualquer usuário autenticado passa. */
  allowedRoles?: string[];
  /** Para onde redirecionar se não autenticado. Default: /login */
  redirectTo?: string;
}

/**
 * Rota protegida por autenticação (e opcionalmente por role).
 *
 * - Não autenticado → redireciona para /login
 * - Autenticado mas sem role permitido → redireciona para /403
 * - Autenticado e com role permitido → renderiza <Outlet />
 */
export default function ProtectedRoute({
  allowedRoles,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}