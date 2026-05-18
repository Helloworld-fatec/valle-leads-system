// src/pages/Dashboard.tsx
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import DashboardAttendant from "./DashboardAttendant";
import DashboardManager from "./DashboardManager";
import DashboardGeneralManager from "./DashboardGeneralManager";
import Forbidden from "./Forbidden";

/**
 * Orquestra qual dashboard renderizar conforme o role do usuário autenticado.
 *
 * ATTENDANT       → DashboardAttendant  (só vê a própria performance)
 * MANAGER         → DashboardManager    (vê equipe + todos os atendentes da equipe)
 * GENERAL_MANAGER → DashboardGeneralManager (visão global)
 * ADMIN           → DashboardGeneralManager (mesmo acesso que gerente geral)
 * qualquer outro  → Forbidden (403)
 */
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null; // AuthProvider já redireciona, mas como safety net

  switch (user.role) {
    case "ATTENDANT":
      return <DashboardAttendant />;

    case "MANAGER":
      return <DashboardManager />;

    case "GENERAL_MANAGER":
    case "ADMIN":
      return <DashboardGeneralManager />;

    default:
      return <Forbidden onNavigate={navigate} />;
  }
}