import { useState } from "react";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";

// Layout
import MainLayout from "./layouts/MainLayout";

// Lazy-importable pages that may or may not exist yet
// (swap with real imports once those pages are built)
const FunilPlaceholder = ({ onNavigate }: { onNavigate: (p: string) => void }) => (
  <div className="flex flex-col items-center justify-center h-full py-32 text-center">
    <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
      <span className="text-2xl">🔄</span>
    </div>
    <p className="text-lg font-bold text-gray-900">Funil de Vendas</p>
    <p className="text-sm text-gray-400 mt-1">Tela em construção — Kanban em breve!</p>
  </div>
);

type Route =
  | "/login"
  | "/dashboard"
  | "/leads"
  | "/funil"
  | "/usuarios"
  | "/perfil"
  | "/403"
  | "/404";

// Rotas que requerem autenticação
const protectedRoutes: Route[] = [
  "/dashboard",
  "/leads",
  "/funil",
  "/usuarios",
  "/perfil",
];

export default function App() {
  const [currentPath, setCurrentPath] = useState<Route>("/login");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  function navigate(path: string) {
    const route = path as Route;

    // Se tentar acessar rota protegida sem autenticação → login
    if (protectedRoutes.includes(route) && !isAuthenticated) {
      setCurrentPath("/login");
      return;
    }

    setCurrentPath(route);
  }

  function handleLogin() {
    setIsAuthenticated(true);
    setCurrentPath("/dashboard");
  }

  function handleLogout() {
    setIsAuthenticated(false);
    setCurrentPath("/login");
  }

  // Renderiza sem layout (páginas públicas)
  if (currentPath === "/login") {
    return <Login onLogin={handleLogin} />;
  }

  if (currentPath === "/404") {
    return <NotFound onNavigate={navigate} />;
  }

  if (currentPath === "/403") {
    return <Forbidden onNavigate={navigate} />;
  }

  // Renderiza com layout (páginas autenticadas)
  const renderPage = () => {
    switch (currentPath) {
      case "/dashboard":
        return <Dashboard />;
      case "/leads":
        return <Leads />;
      case "/funil":
        return <FunilPlaceholder onNavigate={navigate} />;
      case "/usuarios":
        return <Users />;
      case "/perfil":
        return <Profile />;
      default:
        return <NotFound onNavigate={navigate} />;
    }
  };

  return (
    <MainLayout
      currentPath={currentPath}
      onNavigate={(path) => {
        if (path === "/login") {
          handleLogout();
        } else {
          navigate(path);
        }
      }}
    >
      {renderPage()}
    </MainLayout>
  );
}
