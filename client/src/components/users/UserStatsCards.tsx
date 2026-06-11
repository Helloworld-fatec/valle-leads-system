import { User, UserRole } from "../../services/userService";
import { roleLabels, roleColors } from "../../constants/userConstants";
import {
  Users,
  Headphones,
  ShieldCheck,
  Crown,
  ShieldAlert,
} from "lucide-react";

interface UserStatsCardsProps {
  users: User[];
  loading?: boolean;
}

// Ícone por role
const roleIcons: Record<UserRole, React.ReactNode> = {
  ATTENDANT:       <Headphones size={18} />,
  MANAGER:         <ShieldCheck size={18} />,
  GENERAL_MANAGER: <Crown size={18} />,
  ADMIN:           <ShieldAlert size={18} />,
};

// KPI card de role individual
function RoleCard({ role, users }: { role: UserRole; users: User[] }) {
  const count  = users.filter((u) => u.role === role).length;
  const active = users.filter((u) => u.role === role && u.is_active).length;
  const { bg, text } = roleColors[role];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: bg, color: text }}
      >
        {roleIcons[role]}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">
          {roleLabels[role]}s
        </p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5 leading-none">
          {count}
        </p>
        <p className="text-xs mt-1.5" style={{ color: text }}>
          {active} ativo{active !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

// Skeleton de loading
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm animate-pulse">
      <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
      <div className="flex-1 space-y-2 pt-1">
        <div className="h-3 w-20 bg-gray-100 rounded" />
        <div className="h-7 w-10 bg-gray-100 rounded" />
        <div className="h-3 w-16 bg-gray-100 rounded" />
      </div>
    </div>
  );
}

const ROLE_ORDER: UserRole[] = [
  "ATTENDANT",
  "MANAGER",
  "GENERAL_MANAGER",
  "ADMIN",
];

export default function UserStatsCards({ users, loading = false }: UserStatsCardsProps) {
  const total       = users.length;
  const activeCount = users.filter((u) => u.is_active).length;
  const inactiveCount = total - activeCount;
  const activePct  = total > 0 ? Math.round((activeCount / total) * 100) : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
          <Users size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            Total
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5 leading-none">
            {total}
          </p>
          {/* Mini barra de ativos vs inativos */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-green-400 transition-all duration-500"
                style={{ width: `${activePct}%` }}
              />
            </div>
            <span className="text-xs text-green-600 font-medium shrink-0">
              {activePct}%
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {activeCount} ativos · {inactiveCount} inativos
          </p>
        </div>
      </div>

      {/* Cards por role */}
      {ROLE_ORDER.map((role) => (
        <RoleCard key={role} role={role} users={users} />
      ))}

      {/* Card Taxa de Atividade */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">
            Taxa de Atividade
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5 leading-none">
            {activePct}%
          </p>
          <p className="text-xs mt-1.5 text-emerald-600">
            {activeCount} de {total} ativos
          </p>
        </div>
      </div>
    </div>
  );
}