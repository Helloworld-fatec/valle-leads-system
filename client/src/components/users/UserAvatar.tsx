import { UserRole } from "../../services/userService";
import { roleColors } from "../../constants/userConstants";

interface UserAvatarProps {
  name: string;
  role: UserRole;
  size?: "sm" | "md" | "lg";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function UserAvatar({ name, role, size = "md" }: UserAvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
  };

  const colors = roleColors[role] ?? roleColors.ATTENDANT;

  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold shrink-0`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {getInitials(name)}
    </div>
  );
}
