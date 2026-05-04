// client/src/routes/index.tsx
import { Routes, Route, Navigate, useLocation, useNavigate, Outlet } from "react-router-dom";

// Pages
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Leads from "../pages/Leads";
import Users from "../pages/Users";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";
import Forbidden from "../pages/Forbidden";
import SalesFunnel from "../pages/salesFunnel";

// Layout
import MainLayout from "../layouts/MainLayout";

// Placeholder
const FunilPlaceholder = ({ onNavigate }: { onNavigate: (p: string) => void }) => (
  <div className="flex flex-col items-center justify-center h-full py-32 text-center">
    <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
      <span className="text-2xl">🔄</span>
    </div>
    <p className="text-lg font-bold text-gray-900">Funil de Vendas</p>
    <p className="text-sm text-gray-400 mt-1">Tela em construção — Kanban em breve!</p>
  </div>
);

// Tipagem das props que nosso componente de rotas vai receber
interface AppRoutesProps {
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export default function AppRoutes({ isAuthenticated, onLogin, onLogout }: AppRoutesProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Wrapper para proteger rotas e aplicar o Layout
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
        {/* O Outlet diz onde as páginas (Dashboard, Leads, etc) vão ser renderizadas dentro do Layout */}
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

      {/* Rotas Protegidas (Envolvidas pelo ProtectedRoute/MainLayout) */}
      <Route element={<ProtectedRoute />}>
        {/* Rota raiz redireciona pro dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/funil" element={<SalesFunnel />} />
        <Route path="/usuarios" element={<Users />} />
        <Route path="/perfil" element={<Profile />} />
      </Route>

      {/* Catch-all: qualquer rota não encontrada cai aqui */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}