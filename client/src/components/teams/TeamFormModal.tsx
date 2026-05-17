// src/components/teams/TeamFormModal.tsx
import { useEffect, useState } from "react";
import { Team, useTeamsService } from "../../services/teamService"
import { Store } from "../../services/storesService";
import { useStoresService } from "../../services/storesService";

interface TeamFormModalProps {
  team?: Team | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TeamFormModal({ team, onClose, onSuccess }: TeamFormModalProps) {
  const { createTeam, updateTeam } = useTeamsService();
  const { getStores } = useStoresService();

  const [name, setName] = useState("");
  const [storeId, setStoreId] = useState("");
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Busca as lojas para o select
  useEffect(() => {
    getStores()
      .then(setStores)
      .catch(() => setError("Erro ao carregar lojas."));
  }, []);

  // Se for edição, pré-preenche os campos
  useEffect(() => {
    if (team) {
      setName(team.name);
      setStoreId(team.store_id);
    }
  }, [team]);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("O nome da equipe é obrigatório.");
      return;
    }
    if (!storeId) {
      setError("Selecione uma loja.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (team) {
        await updateTeam(team.id, { name, store_id: storeId });
      } else {
        await createTeam({ name, store_id: storeId });
      }
      onSuccess();
      onClose();
    } catch {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">

        {/* Título */}
        <h2 className="text-lg font-bold text-gray-900">
          {team ? "Editar Equipe" : "Nova Equipe"}
        </h2>

        {/* Campo: Nome */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Nome da equipe</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Equipe Alpha"
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Campo: Loja */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Loja</label>
          <select
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
            className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="">Selecione uma loja</option>
            {stores.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mensagem de erro */}
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
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>

      </div>
    </div>
  );
}