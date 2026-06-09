// src/pages/Leads.tsx

import { useState, useEffect, useMemo } from "react";
import { LayoutList, LayoutGrid, ArrowUpDown, Plus } from "lucide-react";
import { useAuth } from "../hook/useAuth";
import { useLeadService } from "../services/leadService";
import type { Lead, LeadStatus } from "../services/leadService";
import LeadCard, {
  LeadRow,
  LeadCardSkeleton,
  LeadRowSkeleton,
} from "../components/leads/LeadCard";
import LeadsFilterBar from "../components/leads/LeadsFilterBar";
import LeadsPagination from "../components/leads/LeadsPagination";
import LeadDetailModal from "../components/leads/LeadDetailModal";
import CreateLeadModal from "../components/leads/CreateLeadModal";
import { STATUS_CONFIG } from "../components/leads/LeadCard";

// ─────────────────────────────────────────────
// CONSTANTES
// ─────────────────────────────────────────────

const PER_PAGE = 20;

// Ordem de prioridade: "new" sempre no topo
const STATUS_ORDER: Record<string, number> = {
  new: 0,
  open: 1,
  won: 2,
  lost: 3,
};

type StatusFilter = LeadStatus | "Todos";
type ViewMode = "list" | "card";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

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

    // Comparação case-insensitive para a origem
    if (source !== "Todos") {
      const src = (l.source ?? "").toLowerCase();
      if (src !== source.toLowerCase()) return false;
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      if (new Date(l.created_at) < from) return false;
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      if (new Date(l.created_at) > to) return false;
    }

    if (search) {
      const q = search.toLowerCase();
      const name = l.customers?.name?.toLowerCase() ?? "";
      const email = l.customers?.email?.toLowerCase() ?? "";
      const cpf = l.customers?.cpf ?? "";
      const ref = l.interest_item?.reference_code ?? "";
      if (
        !name.includes(q) &&
        !email.includes(q) &&
        !cpf.includes(q) &&
        !ref.includes(q)
      )
        return false;
    }

    return true;
  });
}

function sortLeads(leads: Lead[]): Lead[] {
  return [...leads].sort((a, b) => {
    const orderA = STATUS_ORDER[a.status] ?? 99;
    const orderB = STATUS_ORDER[b.status] ?? 99;
    if (orderA !== orderB) return orderA - orderB;
    // Dentro do mesmo status: mais recente primeiro
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

// ─────────────────────────────────────────────
// STATS CARD (mini summary)
// ─────────────────────────────────────────────

function StatusSummary({ leads }: { leads: Lead[] }) {
  const counts = leads.reduce<Record<string, number>>((acc, l) => {
    acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  }, {});

  const items = [
    { key: "new", emoji: "🆕" },
    { key: "open", emoji: "⚡" },
    { key: "won", emoji: "✅" },
    { key: "lost", emoji: "❌" },
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {items.map(({ key, emoji }) => {
        const count = counts[key] ?? 0;
        if (count === 0) return null;
        const cfg = STATUS_CONFIG[key];
        return (
          <span
            key={key}
            className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: cfg.bg, color: cfg.text }}
          >
            {emoji} {cfg.label}: {count}
          </span>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────

export default function Leads() {
  const { user } = useAuth();
  const { getLeads } = useLeadService();

  // ── Estado ──────────────────────────────────
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filtros
  const [status, setStatus] = useState<StatusFilter>("Todos");
  const [source, setSource] = useState("Todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  // ── Fetch ────────────────────────────────────
  async function fetchLeads() {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getLeads({ attendant_id: user.id });
      setLeads(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erro ao carregar leads.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  async function handleLeadCreated() {
    await fetchLeads();
    setPage(1);
  }

  // ── Filtragem + ordenação ────────────────────
  const filtered = useMemo(
    () =>
      sortLeads(filterLeads(leads, status, source, search, dateFrom, dateTo)),
    [leads, status, source, search, dateFrom, dateTo],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleFilter(key: string, value: string) {
    setPage(1);
    if (key === "status") setStatus(value as StatusFilter);
    if (key === "source") setSource(value);
    if (key === "dateFrom") setDateFrom(value);
    if (key === "dateTo") setDateTo(value);
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
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Meus Leads
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading
                ? "Carregando..."
                : `${filtered.length} lead${filtered.length !== 1 ? "s" : ""} encontrado${filtered.length !== 1 ? "s" : ""}`}
            </p>
          </div>

          {/* Ações + Toggle de visualização */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Novo Lead</span>
            </button>

            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                           transition-all ${
                             viewMode === "list"
                               ? "bg-blue-600 text-white shadow-sm"
                               : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                           }`}
              >
                <LayoutList size={14} />
                <span className="hidden sm:inline">Lista</span>
              </button>
              <button
                onClick={() => setViewMode("card")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                           transition-all ${
                             viewMode === "card"
                               ? "bg-blue-600 text-white shadow-sm"
                               : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                           }`}
              >
                <LayoutGrid size={14} />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary badges — só quando há dados */}
        {!loading && leads.length > 0 && <StatusSummary leads={filtered} />}
      </div>

      {/* ── Filtros ── */}
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

      {/* ── Filtro de data ── */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <span className="text-xs text-gray-400 font-medium">Período:</span>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => handleFilter("dateFrom", e.target.value)}
          className="text-sm py-2 px-3 rounded-lg border border-gray-200 bg-white text-gray-700
                     focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300
                     transition-colors"
        />
        <span className="text-xs text-gray-400">até</span>
        <input
          type="date"
          value={dateTo}
          onChange={(e) => handleFilter("dateTo", e.target.value)}
          className="text-sm py-2 px-3 rounded-lg border border-gray-200 bg-white text-gray-700
                     focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300
                     transition-colors"
        />
      </div>

      {/* ── Erro ── */}
      {error && (
        <div className="rounded-xl p-4 mb-4 text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          ⚠️ {error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <LeadCardSkeleton key={i} />
          ))}
        </div>
      )}
      {loading && viewMode === "list" && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <LeadRowSkeleton key={i} />
          ))}
        </div>
      )}

      {/* ── Vazio ── */}
      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-xl border border-gray-100 bg-white flex flex-col items-center justify-center py-20">
          <p className="text-4xl mb-3">🔍</p>
          <p className="font-semibold text-gray-700">Nenhum lead encontrado</p>
          <p className="text-sm mt-1 text-gray-400">Tente ajustar os filtros</p>
        </div>
      )}

      {/* ── CARD VIEW ── */}
      {!loading && !error && paginated.length > 0 && viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onClick={setSelectedLead} />
          ))}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {!loading && !error && paginated.length > 0 && viewMode === "list" && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {/* Header da tabela */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
            <div className="w-9 shrink-0" />
            <div className="flex-1 flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <ArrowUpDown size={10} /> Cliente
            </div>
            <div className="w-32 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Status
            </div>
            <div className="w-32 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:block">
              Origem
            </div>
            <div className="w-48 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:block">
              Produto
            </div>
            <div className="w-28 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden xl:block">
              Valor
            </div>
            <div className="w-24 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden xl:block">
              Equipe
            </div>
            <div className="w-28 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:block text-right">
              Criado em
            </div>
          </div>

          {paginated.map((lead) => (
            <LeadRow key={lead.id} lead={lead} onClick={setSelectedLead} />
          ))}
        </div>
      )}

      {/* ── Paginação ── */}
      {!loading && totalPages > 1 && (
        <LeadsPagination
          page={page}
          totalPages={totalPages}
          total={filtered.length}
          perPage={PER_PAGE}
          onPage={setPage}
        />
      )}

      {/* Modal de detalhe */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}

      {/* Modal de criação */}
      {showCreateModal && (
        <CreateLeadModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleLeadCreated}
        />
      )}
    </div>
  );
}
