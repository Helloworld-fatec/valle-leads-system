// src/App.tsx
import { useState } from "react";
import AppRoutes from "./routes";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AppRoutes
      isAuthenticated={isAuthenticated}
      onLogin={() => setIsAuthenticated(true)}
      onLogout={() => setIsAuthenticated(false)}
    />
  );
}