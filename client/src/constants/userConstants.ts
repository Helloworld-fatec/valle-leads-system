import { UserRole } from "../services/userService";

export const roleLabels: Record<UserRole, string> = {
  ATTENDANT: "Atendente",
  MANAGER: "Gerente",
  GENERAL_MANAGER: "Gerente Geral",
  ADMIN: "Administrador",
};

export const roleColors: Record<
  UserRole,
  { bg: string; text: string; dot: string }
> = {
  ATTENDANT: { bg: "#FFF7ED", text: "#C2410C", dot: "#F97316" },
  MANAGER: { bg: "#EFF6FF", text: "#1D4ED8", dot: "#2563EB" },
  GENERAL_MANAGER: { bg: "#F0FDF4", text: "#15803D", dot: "#10B981" },
  ADMIN: { bg: "#FDF4FF", text: "#7E22CE", dot: "#A855F7" },
};

/** Formata phone_1_ddd + phone_1_number em string legível ou "—" */
export function formatPhone(
  ddd?: string | null,
  number?: string | null
): string {
  if (!ddd || !number) return "—";
  return `(${ddd}) ${number}`;
}

/** Retorna o nome do primeiro time ativo do usuário, ou "—" */
export function getTeamNames(
  userTeams?: Array<{
    id: string;
    team_id: string;
    team?: { id: string; name: string; store_id: string; is_active: boolean };
  }>
): string {
  if (!userTeams || userTeams.length === 0) return "—";
  const names = userTeams
    .map((ut) => ut.team?.name)
    .filter(Boolean) as string[];
  return names.length > 0 ? names.join(", ") : "—";
}
