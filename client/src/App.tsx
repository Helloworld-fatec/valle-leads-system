// src/App.tsx
import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import AppRoutes from "./routes/index";

export default function App() {
  const { isAuthenticated, login, logout } = useContext(AuthContext);

  function handleLogin() {
    // Com o mock do AuthContext, o usuário já está autenticado.
    // Quando o login real estiver pronto, chame login(user, token, refreshToken) aqui.
  }

  function handleLogout() {
    logout();
  }

  return (
    <AppRoutes
      isAuthenticated={isAuthenticated}
      onLogin={handleLogin}
      onLogout={handleLogout}
    />
  );
}