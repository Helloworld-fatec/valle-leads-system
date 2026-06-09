import { useState } from "react";
import { User } from "../../services/userService";
import { formatPhone, getTeamNames } from "../../constants/userConstants";
import UserAvatar from "./UserAvatar";
import RoleBadge from "./RoleBadge";
import { Phone, Users, MoreVertical, Pencil, Trash2 } from "lucide-react";

interface UserListRowProps {
  user: User;
  onDeactivate?: (id: string) => void;
}

export default function UserListRow({ user, onDeactivate }: UserListRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const phone = formatPhone(user.phone_1_ddd, user.phone_1_number);
  const teamNames = getTeamNames(
    user.user_teams as Array<{
      id: string;
      team_id: string;
      team?: { id: string; name: string; store_id: string; is_active: boolean };
    }>
  );

  return (
    <tr
      className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors group"
      onClick={() => menuOpen && setMenuOpen(false)}
    >
      {/* Usuário */}
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
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              {user.name}
            </p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Perfil */}
      <td className="px-4 py-3.5">
        <RoleBadge role={user.role} />
      </td>

      {/* Equipe */}
      <td className="px-4 py-3.5 hidden md:table-cell">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <Users size={13} className="text-gray-400 shrink-0" />
          <span className="truncate max-w-[160px]">{teamNames}</span>
        </div>
      </td>

      {/* Telefone */}
      <td className="px-4 py-3.5 hidden lg:table-cell">
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Phone size={13} className="text-gray-400 shrink-0" />
          {phone}
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

      {/* Ações */}
      <td className="px-4 py-3.5">
        <div className="relative flex justify-end">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all"
          >
            <MoreVertical size={15} />
          </button>

          {menuOpen && (
            <>
              {/* Overlay para fechar */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-8 z-20 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-[152px]">
                <button className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Pencil size={13} className="text-gray-400" />
                  Editar
                </button>
                {user.is_active && onDeactivate && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDeactivate(user.id);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={13} className="text-red-400" />
                    Desativar
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
