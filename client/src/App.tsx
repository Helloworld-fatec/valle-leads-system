import { useAuth } from "./hook/useAuth";
import AppRoutes from "./routes/index";

function AppContent() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <AppRoutes
      isAuthenticated={isAuthenticated}
      onLogin={() => {}}
      onLogout={logout}
    />
  );
}

export default function App() {
  return <AppContent />;
}