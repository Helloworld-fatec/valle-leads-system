// src/components/leads/AssignTeamModal.tsx
import { useEffect, useState } from "react";
import { useLeadService } from "../../services/leadService";
import type { Lead } from "../../services/leadService";
import { useTeamsService } from "../../services/teamService";
import type { Team } from "../../services/teamService";

interface AssignTeamModalProps {
  lead: Lead;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AssignTeamModal({ lead, onClose, onSuccess }: AssignTeamModalProps) {
  const { updateLead } = useLeadService();
  const { getTeams }   = useTeamsService();

  const [teams, setTeams]                   = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>(lead.team_id ?? "");
  const [loading, setLoading]               = useState(false);
  const [fetching, setFetching]             = useState(true);
  const [error, setError]                   = useState<string | null>(null);

  useEffect(() => {
    getTeams()
      .then(setTeams)
      .catch(() => setError("Erro ao carregar equipes."))
      .finally(() => setFetching(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave() {
    if (!selectedTeamId) {
      setError("Selecione uma equipe.");
      return;
    }
    if (selectedTeamId === lead.team_id) {
      onClose();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // O UpdateLeadSchema do backend aceita team_id.
      // O servidor zera attendant_id automaticamente ao trocar de time.
      // Não é necessário usar userTeamsService aqui — esse service gerencia
      // o vínculo usuário↔time (tabela pivô), não lead↔time.
      await updateLead(lead.id, { team_id: selectedTeamId });
      onSuccess();
      onClose();
    } catch {
      setError("Erro ao atribuir equipe. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // lead.name não existe — o nome do cliente está em lead.customers?.name
  const clientName = lead.customers?.name ?? "—";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">

        <div>
          <h2 className="text-lg font-bold text-gray-900">Atribuir Equipe</h2>
          <p className="text-sm text-gray-500 mt-1">
            Lead: <span className="font-medium text-gray-700">{clientName}</span>
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Equipe</label>
          {fetching ? (
            <p className="text-sm text-gray-400">Carregando equipes...</p>
          ) : (
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="">Selecione uma equipe</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                  {team.store_name ? ` — ${team.store_name}` : ""}
                </option>
              ))}
            </select>
          )}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 mt-2">
          <button
            onClick={onClose}
            className="flex-1 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl py-2 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading || fetching}
            className="flex-1 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl py-2 transition-colors"
          >
            {loading ? "Salvando..." : "Confirmar"}
          </button>
        </div>

      </div>
    </div>
  );
}