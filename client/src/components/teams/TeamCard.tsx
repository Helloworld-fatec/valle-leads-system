// src/components/teams/TeamCard.tsx
import { Team } from "../../services/teamService";

interface TeamCardProps {
  team: Team;
  onEdit: (team: Team) => void;
  onToggleActive: (team: Team) => void;
}

export default function TeamCard({ team, onEdit, onToggleActive }: TeamCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">

      {/* Cabeçalho: nome + badge de status */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900">{team.name}</h3>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
            team.is_active
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          {team.is_active ? "Ativa" : "Inativa"}
        </span>
      </div>

      {/* Loja vinculada */}
      <p className="text-sm text-gray-500">
        🏬 {team.store_name ?? "Loja não informada"}
      </p>

      {/* Botões de ação */}
      <div className="flex gap-2 mt-auto">
        <button
          onClick={() => onEdit(team)}
          className="flex-1 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl py-2 transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => onToggleActive(team)}
          className={`flex-1 text-sm font-medium rounded-xl py-2 transition-colors ${
            team.is_active
              ? "text-red-600 bg-red-50 hover:bg-red-100"
              : "text-green-700 bg-green-50 hover:bg-green-100"
          }`}
        >
          {team.is_active ? "Desativar" : "Ativar"}
        </button>
      </div>

    </div>
  );
}