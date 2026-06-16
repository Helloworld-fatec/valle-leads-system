import { UserRole } from "../../services/userService";
import { roleLabels, roleColors } from "../../constants/userConstants";

interface RoleBadgeProps {
  role: UserRole;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const colors = roleColors[role] ?? roleColors.ATTENDANT;
  const label  = roleLabels[role]  ?? role;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: colors.dot }}
      />
      {label}
    </span>
  );
}
