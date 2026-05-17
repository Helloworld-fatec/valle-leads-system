// src/components/leads/BulkAssignTeamToolbar.tsx
import { useState } from "react";
import { Team } from "../../services/teamService";

interface BulkAssignTeamToolbarProps {
  selectedCount: number;
  teams: Team[];
  onAssign: (teamId: string) => Promise<void>;
  onClear: () => void;
}

export default function BulkAssignTeamToolbar({
  selectedCount,
  teams,
  onAssign,
  onClear,
}: BulkAssignTeamToolbarProps) {
  const [teamId, setTeamId] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleAssign = async () => {
    if (!teamId) {
      setFeedback({ type: "error", message: "Selecione uma equipe." });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      await onAssign(teamId);
      setFeedback({ type: "success", message: "Equipe atribuída com sucesso!" });
      setTeamId("");
      onClear();
    } catch {
      setFeedback({ type: "error", message: "Erro ao atribuir equipe. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="bg-gray-900 text-white rounded-2xl shadow-xl px-5 py-4 flex flex-col gap-3">

        {/* Contador */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {selectedCount} lead{selectedCount > 1 ? "s" : ""} selecionado{selectedCount > 1 ? "s" : ""}
          </span>
          <button
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            Limpar seleção
          </button>
        </div>

        {/* Select + Botão */}
        <div className="flex gap-3">
          <select
            value={teamId}
            onChange={(e) => setTeamId(e.target.value)}
            className="flex-1 rounded-xl px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="">Selecione uma equipe</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} {team.store_name ? `— ${team.store_name}` : ""}
              </option>
            ))}
          </select>
          <button
            onClick={handleAssign}
            disabled={loading}
            className="text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-xl px-4 py-2 transition-colors whitespace-nowrap"
          >
            {loading ? "Atribuindo..." : "Atribuir"}
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <p className={`text-xs font-medium ${feedback.type === "success" ? "text-green-400" : "text-red-400"}`}>
            {feedback.message}
          </p>
        )}

      </div>
    </div>
  );
}