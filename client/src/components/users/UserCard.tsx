import { useState, useRef, useEffect } from "react";
import { User } from "../../services/userService";
import { formatPhone, getTeamNames } from "../../constants/userConstants";
import UserAvatar from "./UserAvatar";
import RoleBadge from "./RoleBadge";
import { Mail, Phone, Users, MoreVertical, Pencil, ShieldAlert, ShieldCheck } from "lucide-react";

interface UserCardProps {
  user: User;
  onEdit?: () => void;
  onToggleStatus?: (id: string) => void;
}

export default function UserCard({ user, onEdit, onToggleStatus }: UserCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const phone     = formatPhone(user.phone_1_ddd, user.phone_1_number);
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
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-200 overflow-hidden group relative">
      {/* Accent top bar */}
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
              <p className="font-semibold text-gray-900 text-sm leading-tight">
                {user.name}
              </p>
              <div className="mt-1">
                <RoleBadge role={user.role} />
              </div>
            </div>
          </div>

          {/* Menu de Ações de 3 pontos */}
          {(onEdit || onToggleStatus) && (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-gray-400 hover:text-gray-600 transition-opacity p-1 rounded-lg hover:bg-gray-50 focus:outline-none"
              >
                <MoreVertical size={16} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-30 py-1.5">
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Pencil size={14} className="text-gray-400" />
                      Editar Usuário
                    </button>
                  )}
                  {onToggleStatus && (
                    <button
                      onClick={() => {
                        onToggleStatus(user.id);
                        setMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium transition-colors border-t border-gray-50 ${
                        user.is_active 
                          ? "text-red-600 hover:bg-red-50/50" 
                          : "text-green-600 hover:bg-green-50/50"
                      }`}
                    >
                      {user.is_active ? (
                        <>
                          <ShieldAlert size={14} className="text-red-400" />
                          Desativar Conta
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={14} className="text-green-400" />
                          Reativar Conta
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Mail size={13} className="text-gray-400 shrink-0" />
            <span className="truncate">{user.email}</span>
          </div>

          {phone !== "—" && (
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
            {user.created_at
              ? `Desde ${new Date(user.created_at).toLocaleDateString("pt-BR", {
                  month: "short",
                  year: "numeric",
                })}`
              : "—"}
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