// src/routes/index.tsx
import { Routes, Route, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";

// Guards
import PublicOnlyRoute from "./PublicOnlyRoute";
import ProtectedRoute from "./ProtectedRoute";

// Pages
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Leads from "../pages/Leads";
import Users from "../pages/Users";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";
import Forbidden from "../pages/Forbidden";
import SalesFunnel from "../pages/SalesFunnel";
import ManagerLeads from "../pages/ManagerLeads";
import Stores from "../pages/Stores";
import Teams from "../pages/Teams";
import GMLeads from "../pages/GMLeads";
import Config from "../pages/Config";

// Layout
import MainLayout from "../layouts/MainLayout";

// ─────────────────────────────────────────────
// Layout wrapper para rotas protegidas
// ─────────────────────────────────────────────

function AppLayout() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <MainLayout
      currentPath={location.pathname}
      onNavigate={(path) => {
        if (path === "/login") {
          logout();
          navigate("/login");
        } else {
          navigate(path);
        }
      }}
    >
      <Outlet />
    </MainLayout>
  );
}

// ─────────────────────────────────────────────
// Rotas
// ─────────────────────────────────────────────

export default function AppRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* ── Rotas Públicas (só acessíveis sem login) ── */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* ── Rotas de erro (sempre acessíveis) ── */}
      <Route path="/403" element={<Forbidden onNavigate={navigate} />} />
      <Route path="/404" element={<NotFound onNavigate={navigate} />} />

      {/* ── Rotas Protegidas (qualquer autenticado) ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/funil" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/funil" element={<SalesFunnel />} />
          <Route path="/perfil" element={<Profile />} />
        </Route>
      </Route>

      {/* ── Rotas Protegidas — MANAGER, GENERAL_MANAGER, ADMIN ── */}
      <Route element={<ProtectedRoute allowedRoles={["MANAGER", "GENERAL_MANAGER", "ADMIN"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/manager/leads" element={<ManagerLeads />} />
          <Route path="/usuarios" element={<Users />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/config" element={<Config />} />
        </Route>
      </Route>

      {/* ── Rotas Protegidas — GENERAL_MANAGER, ADMIN ── */}
      <Route element={<ProtectedRoute allowedRoles={["GENERAL_MANAGER", "ADMIN"]} />}>
        <Route element={<AppLayout />}>
          <Route path="/stores" element={<Stores />} />
          <Route path="/gm/leads" element={<GMLeads />} />
        </Route>
      </Route>

      {/* ── Catch-all ── */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}