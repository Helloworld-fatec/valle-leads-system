import { User } from "../../data/mockUsers";
import UserAvatar from "./UserAvatar";
import RoleBadge from "./RoleBadge";
import { Mail, Phone, Users, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

interface UserListRowProps {
  user: User;
}

export default function UserListRow({ user }: UserListRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <tr className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors group">
      {/* User */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <UserAvatar name={user.name} role={user.role} size="sm" />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                user.is_active ? "bg-green-500" : "bg-gray-300"
              }`}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-4 py-3.5">
        <RoleBadge role={user.role} />
      </td>

      {/* Team */}
      <td className="px-4 py-3.5 hidden md:table-cell">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Users size={13} className="text-gray-400" />
          {user.team}
        </div>
      </td>

      {/* Phone */}
      <td className="px-4 py-3.5 hidden lg:table-cell">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Phone size={13} className="text-gray-400" />
          {user.phone ?? "—"}
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3.5">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
            user.is_active
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              user.is_active ? "bg-green-500" : "bg-gray-400"
            }`}
          />
          {user.is_active ? "Ativo" : "Inativo"}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5">
        <div className="relative flex justify-end">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreVertical size={15} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-35">
              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Pencil size={13} className="text-gray-400" /> Editar
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                <Trash2 size={13} className="text-red-400" /> Desativar
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
