// src/pages/GMLeads.tsx
import { useEffect, useState } from "react";
import { useLeadService } from "../services/leadService";
import type { Lead, LeadStatus } from "../services/leadService";
import { useTeamsService } from "../services/teamService";
import type { Team } from "../services/teamService";
import { useStoresService } from "../services/storesService";
import type { Store } from "../services/storesService";
import { useAuth } from "../hook/useAuth";
import { useNavigate } from "react-router-dom";
import LeadGMCard from "../components/leads/LeadGMCard";
import AssignTeamModal from "../components/leads/AssignTeamModal";
import BulkAssignTeamToolbar from "../components/leads/BulkAssignTeamToolbar";

export default function GMLeads() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const { getLeads, bulkAssignTeam } = useLeadService();
  const { getTeams }  = useTeamsService();
  const { getStores } = useStoresService();

  const [leads, setLeads]   = useState<Lead[]>([]);
  const [teams, setTeams]   = useState<Team[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // Filtros
  // store_id não é um filtro da API de leads — usamos para filtrar teams
  // localmente e derivar os team_ids da loja selecionada.
  const [filterStoreId, setFilterStoreId] = useState("");
  const [filterTeamId, setFilterTeamId]   = useState("");
  const [filterStatus, setFilterStatus]   = useState<LeadStatus | "">("");

  // Seleção em lote
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal de atribuição individual
  const [assignLead, setAssignLead] = useState<Lead | null>(null);

  // ─── Proteção de rota ───────────────────────
  useEffect(() => {
    if (user && user.role !== "GENERAL_MANAGER" && user.role !== "ADMIN") {
      navigate("/403");
    }
  }, [user, navigate]);

  // ─── Busca equipes e lojas uma única vez ────
  useEffect(() => {
    getTeams().then(setTeams).catch(() => {});
    getStores().then(setStores).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Busca leads ────────────────────────────
  // store_id não existe na API de leads — filtramos pelo team_id.
  // Quando o GM seleciona uma loja, derivamos os times dessa loja e
  // passamos o team_id do filtro (ou deixamos em branco para ver todos).
  async function fetchLeads() {
    setLoading(true);
    setError(null);
    setSelectedIds([]);
    try {
      const data = await getLeads({
        team_id:  filterTeamId  || undefined,
        status:   (filterStatus as LeadStatus) || undefined,
      });
      setLeads(data);
    } catch {
      setError("Erro ao carregar leads. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTeamId, filterStatus]);

  // Quando o filtro de loja muda, reseta o filtro de equipe
  // para não manter um team_id de outra loja selecionado.
  function handleStoreChange(storeId: string) {
    setFilterStoreId(storeId);
    setFilterTeamId("");
  }

  // Equipes disponíveis no select — filtradas pela loja se uma estiver selecionada
  const teamsForStore = filterStoreId
    ? teams.filter((t) => t.store_id === filterStoreId)
    : teams;

  // ─── Seleção ────────────────────────────────
  function handleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  function handleSelectAll() {
    if (selectedIds.length === leads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map((l) => l.id));
    }
  }

  // ─── Atribuição em lote ─────────────────────
  async function handleBulkAssign(teamId: string) {
    await bulkAssignTeam(selectedIds, teamId);
    setSelectedIds([]);
    fetchLeads();
  }

  return (
    <div className="flex flex-col gap-6 p-6 pb-32">

      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Atribuição de Leads</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gerencie e atribua leads às equipes
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        {/* Filtro por loja — filtra o select de equipes, não vai para a API */}
        <select
          value={filterStoreId}
          onChange={(e) => handleStoreChange(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="">Todas as lojas</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        {/* Filtro por equipe — vai para a API */}
        <select
          value={filterTeamId}
          onChange={(e) => setFilterTeamId(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="">Todas as equipes</option>
          {teamsForStore.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        {/* Filtro por status — valores alinhados com LeadStatusEnum do backend */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as LeadStatus | "")}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="">Todos os status</option>
          <option value="novo">Novo</option>
          <option value="em_atendimento">Em atendimento</option>
          <option value="aguardando">Aguardando</option>
          <option value="finalizado">Finalizado</option>
          <option value="perdido">Perdido</option>
        </select>
      </div>

      {/* Selecionar todos */}
      {!loading && leads.length > 0 && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedIds.length === leads.length && leads.length > 0}
            onChange={handleSelectAll}
            className="accent-purple-600 w-4 h-4"
          />
          <span className="text-sm text-gray-600">
            {selectedIds.length === leads.length
              ? "Desmarcar todos"
              : `Selecionar todos (${leads.length})`}
          </span>
        </div>
      )}

      {/* Estados */}
      {loading && <p className="text-sm text-gray-400">Carregando leads...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}
      {!loading && !error && leads.length === 0 && (
        <p className="text-sm text-gray-400">Nenhum lead encontrado.</p>
      )}

      {/* Grid de cards */}
      {!loading && !error && leads.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead) => (
            <LeadGMCard
              key={lead.id}
              lead={lead}
              selected={selectedIds.includes(lead.id)}
              onSelect={handleSelect}
              onAssign={setAssignLead}
            />
          ))}
        </div>
      )}

      {/* Modal de atribuição individual */}
      {assignLead && (
        <AssignTeamModal
          lead={assignLead}
          onClose={() => setAssignLead(null)}
          onSuccess={fetchLeads}
        />
      )}

      {/* Toolbar de atribuição em lote */}
      <BulkAssignTeamToolbar
        selectedCount={selectedIds.length}
        teams={teams}
        onAssign={handleBulkAssign}
        onClear={() => setSelectedIds([])}
      />

    </div>
  );
}