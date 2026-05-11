// src/routes/index.tsx
import { Routes, Route, Navigate, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import type { UserRole } from "../contexts/AuthContext";

// Pages
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";          // ← orquestrador de roles
import Leads from "../pages/Leads";
import Users from "../pages/Users";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";
import Forbidden from "../pages/Forbidden";
import ManagerLeads from "../pages/ManagerLeads";

// Layout
import MainLayout from "../layouts/MainLayout";

// ─────────────────────────────────────────────
// Placeholder
// ─────────────────────────────────────────────

const FunilPlaceholder = ({ onNavigate }: { onNavigate: (p: string) => void }) => (
  <div className="flex flex-col items-center justify-center h-full py-32 text-center">
    <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
      <span className="text-2xl">🔄</span>
    </div>
    <p className="text-lg font-bold text-gray-900">Funil de Vendas</p>
    <p className="text-sm text-gray-400 mt-1">Tela em construção — Kanban em breve!</p>
  </div>
);

// ─────────────────────────────────────────────
// Guard de roles
// Uso: <RoleRoute allow={["MANAGER", "GENERAL_MANAGER", "ADMIN"]} />
// ─────────────────────────────────────────────

interface RoleRouteProps {
  allow: UserRole[];
}

function RoleRoute({ allow }: RoleRouteProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  if (!allow.includes(user.role)) {
    return <Forbidden onNavigate={navigate} />;
  }

  return <Outlet />;
}

// ─────────────────────────────────────────────
// Props do AppRoutes
// ─────────────────────────────────────────────

interface AppRoutesProps {
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

// ─────────────────────────────────────────────
// Rotas
// ─────────────────────────────────────────────

export default function AppRoutes({ isAuthenticated, onLogin, onLogout }: AppRoutesProps) {
  const location = useLocation();
  const navigate = useNavigate();

  /** Protege todas as rotas filhas e injeta o MainLayout */
  const ProtectedRoute = () => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    return (
      <MainLayout
        currentPath={location.pathname}
        onNavigate={(path) => {
          if (path === "/login") {
            onLogout();
          } else {
            navigate(path);
          }
        }}
      >
        <Outlet />
      </MainLayout>
    );
  };

  return (
    <Routes>
      {/* ── Rotas Públicas ─────────────────────────────── */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={onLogin} />
        }
      />
      <Route path="/403" element={<Forbidden onNavigate={navigate} />} />
      <Route path="/404" element={<NotFound onNavigate={navigate} />} />

      {/* ── Rotas Protegidas ───────────────────────────── */}
      <Route element={<ProtectedRoute />}>
        {/* Redireciona raiz para o dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/*
          /dashboard — Dashboard.tsx decide qual view renderizar baseado no role:
            ATTENDANT       → DashboardAttendant
            MANAGER         → DashboardManager
            GENERAL_MANAGER → DashboardGeneralManager
            ADMIN           → DashboardGeneralManager
        */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Rotas acessíveis a todos os roles autenticados */}
        <Route path="/perfil" element={<Profile />} />
        <Route path="/funil" element={<FunilPlaceholder onNavigate={navigate} />} />

        {/*
          /leads — visível para ATTENDANT (próprios leads).
          Gerentes e acima acessam leads pelo /manager/leads.
        */}
        <Route
          element={
            <RoleRoute allow={["ATTENDANT", "MANAGER", "GENERAL_MANAGER", "ADMIN"]} />
          }
        >
          <Route path="/leads" element={<Leads />} />
        </Route>

        {/*
          /manager/leads — visível para MANAGER, GENERAL_MANAGER e ADMIN.
          ATTENDANT recebe Forbidden.
        */}
        <Route
          element={
            <RoleRoute allow={["MANAGER", "GENERAL_MANAGER", "ADMIN"]} />
          }
        >
          <Route path="/manager/leads" element={<ManagerLeads />} />
        </Route>

        {/*
          /usuarios — somente GENERAL_MANAGER e ADMIN.
        */}
        <Route
          element={<RoleRoute allow={["GENERAL_MANAGER", "ADMIN"]} />}
        >
          <Route path="/usuarios" element={<Users />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}