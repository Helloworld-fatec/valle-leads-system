import { useState, useRef, useEffect } from "react";
import { User } from "../../services/userService";
import { formatPhone, getTeamNames } from "../../constants/userConstants";
import UserAvatar from "./UserAvatar";
import RoleBadge from "./RoleBadge";
import { Phone, Users, MoreVertical, Pencil, ShieldAlert, ShieldCheck } from "lucide-react";

interface UserListRowProps {
  user: User;
  onEdit?: () => void;
  onToggleStatus?: (id: string) => void;
}

export default function UserListRow({ user, onEdit, onToggleStatus }: UserListRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const phone = formatPhone(user.phone_1_ddd, user.phone_1_number);
  const teamNames = getTeamNames(
    user.user_teams as Array<{
      id: string;
      team_id: string;
      team?: { id: string; name: string; store_id: string; is_active: boolean };
    }>
  );

  // Fecha o menu de 3 pontos se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <tr className="border-b border-gray-50 hover:bg-blue-50/30 transition-colors group">
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
      <td className="px-4 py-3.5 vertical-align-middle">
        <RoleBadge role={user.role} />
      </td>

      {/* Equipe */}
      <td className="px-4 py-3.5 hidden md:table-cell max-w-[180px] truncate text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Users size={14} className="text-gray-400 flex-shrink-0" />
          <span className="truncate" title={teamNames}>{teamNames}</span>
        </div>
      </td>

      {/* Telefone */}
      <td className="px-4 py-3.5 hidden lg:table-cell text-sm text-gray-500">
        {phone !== "—" ? (
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-gray-400 flex-shrink-0" />
            <span>{phone}</span>
          </div>
        ) : (
          <span className="text-gray-300">—</span>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3.5 text-sm">
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            user.is_active
              ? "text-green-700 bg-green-50"
              : "text-gray-500 bg-gray-100"
          }`}
        >
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