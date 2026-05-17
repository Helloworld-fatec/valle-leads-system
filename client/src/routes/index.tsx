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
import SalesFunnel from "../pages/SalesFunnel";
import ManagerLeads from "../pages/ManagerLeads";
import Stores from "../pages/Stores";
import Teams from "../pages/Teams";
import GMLeads from "../pages/GMLeads";

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
      {/* Rotas Públicas */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={onLogin} />
        }
      />
      <Route path="/403" element={<Forbidden onNavigate={navigate} />} />
      <Route path="/404" element={<NotFound onNavigate={navigate} />} />

      {/* Rotas Protegidas */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/funil" element={<SalesFunnel />} />
        <Route path="/manager/leads" element={<ManagerLeads />} />
        <Route path="/funil" element={<FunilPlaceholder onNavigate={navigate} />} />
        <Route path="/usuarios" element={<Users />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/stores" element={<Stores />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/gm/leads" element={<GMLeads />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}