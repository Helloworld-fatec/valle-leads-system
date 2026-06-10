// src/pages/Leads.tsx

import { useState, useEffect, useMemo } from "react";
import {
  LayoutList,
  LayoutGrid,
  ArrowUpDown,
  Plus,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";
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

// Quantidade de leads exibidos por página.
// Se quiser mudar a paginação da tela, altere este valor.
const PER_PAGE = 20;

// Ordem lógica do funil.
// Isso garante que leads "new" apareçam antes de "open", "won" e "lost".
const STATUS_ORDER: Record<string, number> = {
  new: 0,
  open: 1,
  won: 2,
  lost: 3,
};

type StatusFilter = LeadStatus | "Todos";
type ViewMode = "list" | "card";

/**
 * Aplica todos os filtros usados na tela de Leads.
 *
 * Filtros considerados:
 * - status/etapa;
 * - origem;
 * - período;
 * - busca textual por nome, e-mail, CPF, referência ou produto.
 */
function filterLeads(
  leads: Lead[],
  status: StatusFilter,
  source: string,
  search: string,
  dateFrom: string,
  dateTo: string,
): Lead[] {
  return leads.filter((lead) => {
    if (status !== "Todos" && lead.status !== status) return false;

    if (source !== "Todos") {
      const src = (lead.source ?? "").toLowerCase();
      if (src !== source.toLowerCase()) return false;
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);

      if (new Date(lead.created_at) < from) return false;
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);

      if (new Date(lead.created_at) > to) return false;
    }

    if (search) {
      const query = search.toLowerCase();

      const name = lead.customers?.name?.toLowerCase() ?? "";
      const email = lead.customers?.email?.toLowerCase() ?? "";
      const cpf = lead.customers?.cpf ?? "";
      const ref = lead.interest_item?.reference_code ?? "";
      const product = lead.interest_item?.description?.toLowerCase() ?? "";

      if (
        !name.includes(query) &&
        !email.includes(query) &&
        !cpf.includes(query) &&
        !ref.includes(query) &&
        !product.includes(query)
      ) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Ordena os leads para deixar a visualização mais útil.
 *
 * Primeiro ordena pela etapa do funil:
 * Novo → Em andamento → Ganho → Perdido
 *
 * Dentro da mesma etapa, ordena pelos mais recentes.
 */
function sortLeads(leads: Lead[]): Lead[] {
  return [...leads].sort((a, b) => {
    const orderA = STATUS_ORDER[a.status] ?? 99;
    const orderB = STATUS_ORDER[b.status] ?? 99;

    if (orderA !== orderB) return orderA - orderB;

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

/**
 * Cards de resumo do funil.
 *
 * Esses cards substituem badges pequenos e ajudam o usuário a entender
 * rapidamente a situação dos leads filtrados.
 *
 * Importante:
 * Os valores são baseados no array recebido em "leads".
 * Neste caso, estamos passando os leads já filtrados.
 */
function LeadsOverview({ leads }: { leads: Lead[] }) {
  const total = leads.length;

  const counts = leads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.status] = (acc[lead.status] ?? 0) + 1;
    return acc;
  }, {});

  const newCount = counts.new ?? 0;
  const openCount = counts.open ?? 0;
  const wonCount = counts.won ?? 0;
  const lostCount = counts.lost ?? 0;

  const cards = [
    {
      label: "Leads encontrados",
      value: total,
      description: "Resultado atual da busca",
      icon: Users,
      className: "bg-white border-gray-100 text-gray-700",
    },
    {
      label: "Novos",
      value: newCount,
      description:
        newCount === 0 ? "Sem novos leads" : "Aguardando primeiro contato",
      icon: Sparkles,
      className: "bg-blue-50 border-blue-100 text-blue-700",
    },
    {
      label: "Em andamento",
      value: openCount,
      description:
        openCount === 0 ? "Nenhum lead em andamento" : "Em acompanhamento",
      icon: Clock,
      className: "bg-violet-50 border-violet-100 text-violet-700",
    },
    {
      label: "Ganhos",
      value: wonCount,
      description: wonCount === 0 ? "Nenhuma conversão" : "Convertidos",
      icon: CheckCircle2,
      className: "bg-emerald-50 border-emerald-100 text-emerald-700",
    },
    {
      label: "Perdidos",
      value: lostCount,
      description: lostCount === 0 ? "Sem perdas registradas" : "Sem conversão",
      icon: XCircle,
      className: "bg-red-50 border-red-100 text-red-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 mb-5">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className={`rounded-2xl border px-4 py-3 shadow-sm ${card.className}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                  {card.label}
                </p>

                <p className="text-xl font-bold mt-1">{card.value}</p>

                <p className="text-xs mt-1 opacity-70 leading-snug">
                  {card.description}
                </p>
              </div>

              <div className="w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center shrink-0">
                <Icon size={15} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Leads() {
  const { user } = useAuth();
  const { getLeads } = useLeadService();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [status, setStatus] = useState<StatusFilter>("Todos");
  const [source, setSource] = useState("Todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  /**
   * Busca os leads do usuário logado.
   *
   * Atualmente a tela filtra por attendant_id.
   * Isso significa que o atendente vê apenas os leads atribuídos a ele.
   *
   * Atenção:
   * Se o seed/banco local criar leads sem attendant_id, a tela ficará vazia.
   */
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

  /**
   * Chamado depois que um novo lead é criado no modal.
   * Atualiza a listagem e volta para a primeira página.
   */
  async function handleLeadCreated() {
    await fetchLeads();
    setPage(1);
  }

  /**
   * useMemo evita refazer filtros e ordenação em todo render.
   * Só recalcula quando leads ou filtros mudam.
   */
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen bg-gray-50">
      {/* Cabeçalho da página */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between mb-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 mb-2">
              Gestão de oportunidades
            </div>

            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Meus Leads
            </h1>

            <p className="text-sm text-gray-500 mt-0.5 max-w-2xl">
              {loading
                ? "Carregando leads..."
                : `${filtered.length} lead${
                    filtered.length !== 1 ? "s" : ""
                  } encontrado${
                    filtered.length !== 1 ? "s" : ""
                  }. Acompanhe status, origem e produto de interesse.`}
            </p>
          </div>

          {/* Ações principais da tela */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Novo Lead</span>
            </button>

            {/* Alternância entre visualização em lista e cards */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <LayoutList size={14} />
                <span className="hidden sm:inline">Lista</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("card")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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

        {/* Indicadores do funil. Aparecem somente quando já existem leads carregados. */}
        {!loading && leads.length > 0 && <LeadsOverview leads={filtered} />}
      </div>

      {/* Barra de filtros principais */}
      <LeadsFilterBar
        search={search}
        onSearch={(value) => {
          setSearch(value);
          setPage(1);
        }}
        stage={status}
        onStage={(value) => handleFilter("status", value)}
        source={source}
        onSource={(value) => handleFilter("source", value)}
        onClear={handleClear}
      />

      {/* Filtro por período */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <span className="text-xs text-gray-400 font-medium">Período:</span>

        <input
          type="date"
          value={dateFrom}
          onChange={(event) => handleFilter("dateFrom", event.target.value)}
          className="text-sm py-2 px-3 rounded-lg border border-gray-200 bg-white text-gray-700
                     focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300
                     transition-colors"
        />

        <span className="text-xs text-gray-400">até</span>

        <input
          type="date"
          value={dateTo}
          onChange={(event) => handleFilter("dateTo", event.target.value)}
          className="text-sm py-2 px-3 rounded-lg border border-gray-200 bg-white text-gray-700
                     focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300
                     transition-colors"
        />
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="rounded-xl p-4 mb-4 text-sm font-medium bg-red-50 text-red-700 border border-red-200">
          ⚠️ {error}
        </div>
      )}

      {/* Loading da visualização em cards */}
      {loading && viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <LeadCardSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Loading da visualização em lista */}
      {loading && viewMode === "list" && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {Array.from({ length: 8 }).map((_, index) => (
            <LeadRowSkeleton key={index} />
          ))}
        </div>
      )}

      {/* Estado vazio */}
      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white flex flex-col items-center justify-center py-20 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Sparkles size={24} />
          </div>

          <p className="font-semibold text-gray-800">Nenhum lead encontrado</p>

          <p className="text-sm mt-1 text-gray-400 max-w-md">
            Ajuste os filtros aplicados ou cadastre um novo lead para iniciar o
            acompanhamento.
          </p>

          <div className="flex items-center gap-2 mt-5">
            <button
              type="button"
              onClick={handleClear}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Limpar filtros
            </button>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Novo Lead
            </button>
          </div>
        </div>
      )}

      {/* Visualização em cards */}
      {!loading && !error && paginated.length > 0 && viewMode === "card" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onClick={setSelectedLead} />
          ))}
        </div>
      )}

      {/* Visualização em lista */}
      {!loading && !error && paginated.length > 0 && viewMode === "list" && (
        <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto">
          {/* min-w evita que colunas importantes sejam comprimidas demais */}
          <div className="min-w-[1180px]">
            <div className="flex items-center gap-4 px-4 py-2.5 border-b border-gray-100 bg-gray-50">
              <div className="w-9 shrink-0" />

              <div className="flex-1 min-w-[220px] flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                <ArrowUpDown size={10} /> Cliente
              </div>

              <div className="w-32 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Status
              </div>

              <div className="w-40 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:block">
                Atenção
              </div>

              <div className="w-32 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:block">
                Origem
              </div>

              <div className="w-48 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden xl:block">
                Produto
              </div>

              <div className="w-28 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden xl:block">
                Valor
              </div>

              <div className="w-24 shrink-0 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden 2xl:block">
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

      {/* Modal de detalhes do lead */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
        />
      )}

      {showCreateModal && (
        <CreateLeadModal
          defaultTeamId={leads[0]?.team_id ?? undefined}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleLeadCreated}
        />
      )}
    </div>
  );
}
