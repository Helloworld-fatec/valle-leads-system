// src/App.tsx
import AppRoutes from "./routes";
 
/**
 * App root — sem estado local de autenticação.
 * Toda a lógica de auth vive no AuthContext (AuthProvider em main.tsx).
 * O AppRoutes consulta o contexto diretamente via useAuth.
 */
export default function App() {
  return <AppRoutes />;
}
 