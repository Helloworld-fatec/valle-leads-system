import { User } from "../../data/mockUsers";
import UserAvatar from "./UserAvatar";
import RoleBadge from "./RoleBadge";
import { Mail, Phone, Users, MoreVertical } from "lucide-react";

interface UserCardProps {
  user: User;
}

export default function UserCard({ user }: UserCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200 overflow-hidden group">
      {/* Top accent */}
      <div
        className="h-1 w-full"
        style={{
          background: user.is_active
            ? "linear-gradient(90deg, #2563EB, #3B82F6)"
            : "#E5E7EB",
        }}
      />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <UserAvatar name={user.name} role={user.role} size="md" />
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                  user.is_active ? "bg-green-500" : "bg-gray-300"
                }`}
              />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm leading-tight">{user.name}</p>
              <div className="mt-1">
                <RoleBadge role={user.role} />
              </div>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-gray-50">
            <MoreVertical size={16} />
          </button>
        </div>

        {/* Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Mail size={13} className="text-gray-400 shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Phone size={13} className="text-gray-400 shrink-0" />
              <span>{user.phone}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Users size={13} className="text-gray-400 shrink-0" />
            <span>{user.team}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Desde {new Date(user.created_at).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              user.is_active
                ? "text-green-700 bg-green-50"
                : "text-gray-500 bg-gray-100"
            }`}
          >
            {user.is_active ? "Ativo" : "Inativo"}
          </span>
        </div>
      </div>
    </div>
  );
}
