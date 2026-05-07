import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";
import { useLeadService } from "../services/leadService";
import type { Lead } from "../services/leadService";
import LeadCard, { LeadCardSkeleton } from "../components/leads/LeadCard";
import LeadsFilterBar from "../components/leads/LeadsFilterBar";
import LeadsPagination from "../components/leads/LeadsPagination";
import LeadDetailModal from "../components/leads/LeadDetailModal";
import AssignLeadModal from "../components/leads/AssignLeadModal";
import BulkAssignToolbar from "../components/leads/BulkAssignToolbar";

const PER_PAGE = 12;

function filterLeads(
  leads: Lead[],
  status: string,
  source: string,
  attendantId: string,
  dateFrom: string,
  dateTo: string
): Lead[] {
  return leads.filter((l) => {
    if (status !== "Todos" && l.status !== status) return false;
    if (source !== "Todos" && (l.source ?? "") !== source) return false;
    if (attendantId !== "Todos" && l.attendant_id !== attendantId) return false;
    if (dateFrom && new Date(l.created_at) < new Date(dateFrom)) return false;
    if (dateTo   && new Date(l.created_at) > new Date(dateTo))   return false;
    return true;
  });
}

export default function ManagerLeads() {
  const { user } = useAuth();
  const { getLeads } = useLeadService();
  const navigate = useNavigate();

  // 🔒 Proteção de rota
  useEffect(() => {
    if (user && user.role !== "MANAGER") {
      navigate("/leads");
    }
  }, [user, navigate]);

  // ── Estado ──────────────────────────────────
  const [leads, setLeads]               = useState<Lead[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [assignLead, setAssignLead]     = useState<Lead | null>(null);

  // Seleção em lote
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulk, setShowBulk]       = useState(false);

  // Filtros
  const [status, setStatus]           = useState("Todos");
  const [source, setSource]           = useState("Todos");
  const [attendantId, setAttendantId] = useState("Todos");
  const [dateFrom, setDateFrom]       = useState("");
  const [dateTo, setDateTo]           = useState("");
  const [page, setPage]               = useState(1);

  // ── Busca todos os leads da equipe ──────────
  useEffect(() => {
    if (!user?.team_id) return;

    async function fetchLeads() {
      try {
        setLoading(true);
        setError(null);
        const data = await getLeads({ team_id: user!.team_id! });
        setLeads(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erro ao carregar leads.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.team_id]);

  // ── Filtragem local ──────────────────────────
  const filtered = useMemo(
    () => filterLeads(leads, status, source, attendantId, dateFrom, dateTo),
    [leads, status, source, attendantId, dateFrom, dateTo]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // Atendentes únicos para o filtro extra
  const attendants = useMemo(() => {
    const map = new Map<string, string>();
    leads.forEach((l) => {
      if (l.attendant_id && l.attendant?.name) {
        map.set(l.attendant_id, l.attendant.name);
      }
    });
    return Array.from(map.entries());
  }, [leads]);

  function handleFilter(key: string, value: string) {
    setPage(1);
    if (key === "status")    setStatus(value);
    if (key === "source")    setSource(value);
    if (key === "attendant") setAttendantId(value);
    if (key === "dateFrom")  setDateFrom(value);
    if (key === "dateTo")    setDateTo(value);
  }

  function handleClear() {
    setStatus("Todos");
    setSource("Todos");
    setAttendantId("Todos");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  // ── Seleção em lote ──────────────────────────
  function handleCheckChange(id: string, checked: boolean) {
    setSelectedIds((prev) => {
      const next = checked ? [...prev, id] : prev.filter((i) => i !== id);
      setShowBulk(next.length > 0);
      return next;
    });
  }

  function handleClearSelection() {
    setSelectedIds([]);
    setShowBulk(false);
  }

  function handleAssigned(updatedLead: Lead) {
    setLeads((prev) =>
      prev.map((l) => (l.id === updatedLead.id ? updatedLead : l))
    );
    setAssignLead(null);
    handleClearSelection();
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>
            Leads da Equipe
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
            {loading
              ? "Carregando..."
              : `${filtered.length} lead${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Toolbar de seleção em lote */}
      {showBulk && (
        <BulkAssignToolbar
          selectedCount={selectedIds.length}
          onAssign={() => setAssignLead({ id: "bulk" } as Lead)}
          onClear={handleClearSelection}
        />
      )}

      {/* Filtros */}
      <LeadsFilterBar
        search=""
        onSearch={() => {}}
        stage={status}
        onStage={(v) => handleFilter("status", v)}
        source={source}
        onSource={(v) => handleFilter("source", v)}
        onClear={handleClear}
      />

      {/* Filtros extras: atendente + data */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select
          value={attendantId}
          onChange={(e) => handleFilter("attendant", e.target.value)}
          className="text-sm py-2 pl-3 pr-7 rounded-lg border outline-none cursor-pointer appearance-none"
          style={{ background: "#F8FAFC", borderColor: "#E5E7EB", color: "#374151" }}
        >
          <option value="Todos">Atendente: Todos</option>
          {attendants.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => handleFilter("dateFrom", e.target.value)}
          className="text-sm py-2 px-3 rounded-lg border outline-none"
          style={{ background: "#F8FAFC", borderColor: "#E5E7EB", color: "#374151" }}
        />
        <span className="text-xs" style={{ color: "#9CA3AF" }}>até</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => handleFilter("dateTo", e.target.value)}
          className="text-sm py-2 px-3 rounded-lg border outline-none"
          style={{ background: "#F8FAFC", borderColor: "#E5E7EB", color: "#374151" }}
        />
      </div>

      {/* Erro */}
      {error && (
        <div className="rounded-xl p-4 mb-4 text-sm font-medium"
          style={{ background: "#FEF2F2", color: "#DC2626" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <LeadCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Lista vazia */}
      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-xl border flex flex-col items-center justify-center py-20"
          style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}>
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold" style={{ color: "#374151" }}>
            Nenhum lead encontrado
          </p>
          <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>
            Tente ajustar os filtros
          </p>
        </div>
      )}

      {/* Grid de cards */}
      {!loading && !error && paginated.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onClick={setSelectedLead}
              showAttendant
              showCheckbox
              checked={selectedIds.includes(lead.id)}
              onCheckChange={handleCheckChange}
            />
          ))}
        </div>
      )}

      {/* Paginação */}
      {!loading && totalPages > 1 && (
        <LeadsPagination
          page={page}
          totalPages={totalPages}
          total={filtered.length}
          perPage={PER_PAGE}
          onPage={setPage}
        />
      )}

      {/* Modal de detalhes */}
      {selectedLead && selectedLead.id !== "bulk" && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onAssign={() => {
            setAssignLead(selectedLead);
            setSelectedLead(null);
          }}
        />
      )}

      {/* Modal de atribuição */}
      {assignLead && (
        <AssignLeadModal
          leadIds={assignLead.id === "bulk" ? selectedIds : [assignLead.id]}
          teamId={user?.team_id ?? ""}
          onClose={() => setAssignLead(null)}
          onAssigned={handleAssigned}
        />
      )}
    </div>
  );
}