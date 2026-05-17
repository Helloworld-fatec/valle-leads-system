// src/pages/Teams.tsx
import { useEffect, useState } from "react";
import { Team, useTeamsService } from "../services/teamService"
import { Store, useStoresService } from "../services/storesService";
import TeamCard from "../components/teams/TeamCard";
import TeamFormModal from "../components/teams/TeamFormModal";

export default function Teams() {
  const { getTeams, updateTeam } = useTeamsService();
  const { getStores } = useStoresService();

  const [teams, setTeams] = useState<Team[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<Team | null>(null);

  // ─── Busca equipes (com filtro opcional por loja) ───
  const fetchTeams = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTeams(selectedStoreId || undefined);
      setTeams(data);
    } catch {
      setError("Erro ao carregar equipes. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Busca lojas para o filtro ───
  const fetchStores = async () => {
    try {
      const data = await getStores();
      setStores(data);
    } catch {
      // silencioso — filtro fica vazio
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [selectedStoreId]);

  const handleNewTeam = () => {
    setSelectedTeam(null);
    setModalOpen(true);
  };

  const handleEdit = (team: Team) => {
    setSelectedTeam(team);
    setModalOpen(true);
  };

  const handleToggleActive = (team: Team) => {
    setConfirmToggle(team);
  };

  const handleConfirmToggle = async () => {
    if (!confirmToggle) return;
    try {
      await updateTeam(confirmToggle.id, { is_active: !confirmToggle.is_active });
      setConfirmToggle(null);
      fetchTeams();
    } catch {
      alert("Erro ao atualizar status da equipe.");
      setConfirmToggle(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipes</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie as equipes da rede Valle</p>
        </div>
        <button
          onClick={handleNewTeam}
          className="text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl px-4 py-2 transition-colors"
        >
          + Nova Equipe
        </button>
      </div>

      {/* Filtro por loja */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700">Filtrar por loja:</label>
        <select
          value={selectedStoreId}
          onChange={(e) => setSelectedStoreId(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="">Todas as lojas</option>
          {stores.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>
      </div>

      {/* Estados de loading e erro */}
      {loading && <p className="text-sm text-gray-400">Carregando equipes...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Lista de cards */}
      {!loading && !error && teams.length === 0 && (
        <p className="text-sm text-gray-400">Nenhuma equipe cadastrada ainda.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <TeamCard
            key={team.id}
            team={team}
            onEdit={handleEdit}
            onToggleActive={handleToggleActive}
          />
        ))}
      </div>

      {/* Modal de criar/editar */}
      {modalOpen && (
        <TeamFormModal
          team={selectedTeam}
          onClose={() => setModalOpen(false)}
          onSuccess={fetchTeams}
        />
      )}

      {/* Modal de confirmação de toggle */}
      {confirmToggle && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5">
            <h2 className="text-lg font-bold text-gray-900">Confirmar ação</h2>
            <p className="text-sm text-gray-600">
              Deseja realmente{" "}
              <span className="font-semibold">
                {confirmToggle.is_active ? "desativar" : "ativar"}
              </span>{" "}
              a equipe <span className="font-semibold">{confirmToggle.name}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmToggle(null)}
                className="flex-1 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl py-2 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmToggle}
                className="flex-1 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-xl py-2 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}