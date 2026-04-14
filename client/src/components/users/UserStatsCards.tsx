import { User, UserRole, roleLabels, roleColors } from "../../data/mockUsers";
import { Users, TrendingUp, Headphones, ShieldCheck } from "lucide-react";

interface UserStatsCardsProps {
  users: User[];
}

const roleIcons: Record<UserRole, React.ReactNode> = {
  MANAGER: <ShieldCheck size={20} />,
  SELLER: <TrendingUp size={20} />,
  ATTENDANT: <Headphones size={20} />,
};

export default function UserStatsCards({ users }: UserStatsCardsProps) {
  const total = users.length;
  const activeCount = users.filter((u) => u.is_active).length;

  const countByRole = (role: UserRole) => users.filter((u) => u.role === role).length;
  const activeByRole = (role: UserRole) =>
    users.filter((u) => u.role === role && u.is_active).length;

  const roles: UserRole[] = ["MANAGER", "SELLER", "ATTENDANT"];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
          <Users size={20} />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">{total}</p>
          <p className="text-xs text-green-600 mt-1">{activeCount} ativos</p>
        </div>
      </div>

      {roles.map((role) => {
        const count = countByRole(role);
        const active = activeByRole(role);
        const { bg, text } = roleColors[role];

        return (
          <div
            key={role}
            className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: bg, color: text }}
            >
              {roleIcons[role]}
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                {roleLabels[role]}s
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{count}</p>
              <p className="text-xs mt-1" style={{ color: text }}>
                {active} ativo{active !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
