// src/components/leads/AssignTeamModal.tsx
import { useEffect, useState } from "react";
import { Lead, useLeadsService } from "../../services/leadService";
import { Team, useTeamsService } from "../../services/teamService";

interface AssignTeamModalProps {
  lead: Lead;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignTeamModal({ lead, onClose, onSuccess }: AssignTeamModalProps) {
  const { assignTeam } = useLeadsService();
  const { getTeams } = useTeamsService();

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(lead.team_id ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getTeams()
      .then(setTeams)
      .catch(() => setError("Erro ao carregar equipes."));
  }, []);

  const handleSave = async () => {
    if (!selectedTeamId) {
      setError("Selecione uma equipe.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await assignTeam(lead.id, { team_id: selectedTeamId });
      onSuccess();
      onClose();
    } catch {
      setError("Erro ao atribuir equipe. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">

        {/* Título */}
        <div>
          <h2 className="text-lg font-bold text-gray-900">Atribuir Equipe</h2>
          <p className="text-sm text-gray-500 mt-1">Lead: <span className="font-medium text-gray-700">{lead.name}</span></p>
        </div>

        {/* Select de equipe */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Equipe</label>
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="">Selecione uma equipe</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} {team.store_name ? `— ${team.store_name}` : ""}
              </option>
            ))}
          </select>
        </div>

        {/* Erro */}
        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* Botões */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl py-2 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl py-2 transition-colors"
          >
            {loading ? "Salvando..." : "Confirmar"}
          </button>
        </div>

      </div>
    </div>
  );
}