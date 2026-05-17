// src/pages/GMLeads.tsx
import { useEffect, useState } from "react";
import { Lead, useLeadsService } from "../services/leadService";
import { Team, useTeamsService } from "../services/teamService";
import { Store, useStoresService } from "../services/storesService";
import { useAuth } from "../hook/useAuth";
import { useNavigate } from "react-router-dom";
import LeadGMCard from "../components/leads/LeadGMCard";
import AssignTeamModal from "../components/leads/AssignTeamModal";
import BulkAssignTeamToolbar from "../components/leads/BulkAssignTeamToolbar";

export default function GMLeads() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getLeads, assignTeamBulk } = useLeadsService();
  const { getTeams } = useTeamsService();
  const { getStores } = useStoresService();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filterStoreId, setFilterStoreId] = useState("");
  const [filterTeamId, setFilterTeamId] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Seleção em lote
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal individual
  const [assignLead, setAssignLead] = useState<Lead | null>(null);

  // ─── Proteção de rota ───
  useEffect(() => {
    if (user && user.role !== "GENERAL_MANAGER") {
      navigate("/403");
    }
  }, [user]);

  // ─── Busca dados ───
  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLeads({
        store_id: filterStoreId || undefined,
        team_id: filterTeamId || undefined,
        status: filterStatus || undefined,
      });
      setLeads(data);
    } catch {
      setError("Erro ao carregar leads. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTeams().then(setTeams).catch(() => {});
    getStores().then(setStores).catch(() => {});
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [filterStoreId, filterTeamId, filterStatus]);

  // ─── Seleção ───
  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === leads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map((l) => l.id));
    }
  };

  // ─── Atribuição em lote ───
  const handleBulkAssign = async (teamId: string) => {
    await assignTeamBulk(selectedIds, teamId);
    fetchLeads();
  };

  return (
    <div className="flex flex-col gap-6 p-6 pb-32">

      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Atribuição de Leads</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie e atribua leads às equipes</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterStoreId}
          onChange={(e) => setFilterStoreId(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="">Todas as lojas</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <select
          value={filterTeamId}
          onChange={(e) => setFilterTeamId(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="">Todas as equipes</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="">Todos os status</option>
          <option value="novo">Novo</option>
          <option value="em_atendimento">Em atendimento</option>
          <option value="convertido">Convertido</option>
          <option value="perdido">Perdido</option>
        </select>
      </div>

      {/* Selecionar todos */}
      {!loading && leads.length > 0 && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selectedIds.length === leads.length}
            onChange={handleSelectAll}
            className="accent-purple-600 w-4 h-4"
          />
          <span className="text-sm text-gray-600">
            {selectedIds.length === leads.length ? "Desmarcar todos" : "Selecionar todos"}
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