import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../hook/useAuth";
import { useLeadService } from "../services/leadService";
import type { Lead, LeadStatus } from "../services/leadService";
import LeadCard, { LeadCardSkeleton } from "../components/leads/LeadCard";
import LeadsFilterBar from "../components/leads/LeadsFilterBar";
import LeadsPagination from "../components/leads/LeadsPagination";
import LeadDetailModal from "../components/leads/LeadDetailModal";

const PER_PAGE = 12;

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

// "Todos" é o valor sentinela de UI; qualquer outro valor é um LeadStatus real.
type StatusFilter = LeadStatus | "Todos";

function filterLeads(
  leads: Lead[],
  status: StatusFilter,
  source: string,
  search: string,
  dateFrom: string,
  dateTo: string,
): Lead[] {
  return leads.filter((l) => {
    if (status !== "Todos" && l.status !== status) return false;
    if (source !== "Todos" && (l.source ?? "") !== source) return false;

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      if (new Date(l.created_at) < from) return false;
    }

    if (dateTo) {
      // Inclusivo: qualquer momento do dia selecionado passa
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(l.created_at) > to) return false;
    }

    if (search) {
      const q = search.toLowerCase();
      const name  = l.customers?.name?.toLowerCase()  ?? "";
      const email = l.customers?.email?.toLowerCase() ?? "";
      const cpf   = l.customers?.cpf                  ?? "";
      if (!name.includes(q) && !email.includes(q) && !cpf.includes(q))
        return false;
    }

    return true;
  });
}

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────

export default function Leads() {
  const { user } = useAuth();
  const { getLeads } = useLeadService();

  // ── Estado ──────────────────────────────────
  const [leads, setLeads]           = useState<Lead[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Filtros
  const [status, setStatus]     = useState<StatusFilter>("Todos");
  const [source, setSource]     = useState("Todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");
  const [page, setPage]         = useState(1);
  const [search, setSearch]     = useState("");

  // ── Busca leads do atendente logado ─────────
  useEffect(() => {
    if (!user?.id) return;

    async function fetchLeads() {
      try {
        setLoading(true);
        setError(null);
        const data = await getLeads({ attendant_id: user!.id });
        setLeads(data);
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Erro ao carregar leads.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }

    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── Filtragem local ──────────────────────────
  const filtered = useMemo(
    () => filterLeads(leads, status, source, search, dateFrom, dateTo),
    [leads, status, source, search, dateFrom, dateTo],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleFilter(key: string, value: string) {
    setPage(1);
    if (key === "status") setStatus(value as StatusFilter);
    if (key === "source") setSource(value);
    if (key === "dateFrom") setDateFrom(value);
    if (key === "dateTo")   setDateTo(value);
  }

  function handleClear() {
    setStatus("Todos");
    setSource("Todos");
    setSearch("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }

  // ── Render ───────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>
            Meus Leads
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
            {loading
              ? "Carregando..."
              : `${filtered.length} lead${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <LeadsFilterBar
        search={search}
        onSearch={(v) => {
          setSearch(v);
          setPage(1);
        }}
        stage={status}
        onStage={(v) => handleFilter("status", v)}
        source={source}
        onSource={(v) => handleFilter("source", v)}
        onClear={handleClear}
      />

      {/* Filtro de data */}
      <div className="flex items-center gap-2 mb-5">
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => handleFilter("dateFrom", e.target.value)}
          className="text-sm py-2 px-3 rounded-lg border outline-none"
          style={{
            background: "#F8FAFC",
            borderColor: "#E5E7EB",
            color: "#374151",
          }}
        />
        <span className="text-xs" style={{ color: "#9CA3AF" }}>
          até
        </span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => handleFilter("dateTo", e.target.value)}
          className="text-sm py-2 px-3 rounded-lg border outline-none"
          style={{
            background: "#F8FAFC",
            borderColor: "#E5E7EB",
            color: "#374151",
          }}
        />
      </div>

      {/* Erro */}
      {error && (
        <div
          className="rounded-xl p-4 mb-4 text-sm font-medium"
          style={{ background: "#FEF2F2", color: "#DC2626" }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Loading — skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <LeadCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Lista vazia */}
      {!loading && !error && filtered.length === 0 && (
        <div
          className="rounded-xl border flex flex-col items-center justify-center py-20"
          style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
        >
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
            <LeadCard key={lead.id} lead={lead} onClick={setSelectedLead} />
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
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </div>
  );
}