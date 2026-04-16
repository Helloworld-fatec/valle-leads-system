import { UserRole, roleLabels, roleColors } from "../../data/mockUsers";

interface RoleBadgeProps {
  role: UserRole;
}

export default function RoleBadge({ role }: RoleBadgeProps) {
  const { bg, text, dot } = roleColors[role];

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
      style={{ backgroundColor: bg, color: text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: dot }}
      />
      {roleLabels[role]}
    </span>
  );
}
