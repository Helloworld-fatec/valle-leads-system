// src/components/sales-funnel/ClosedNegotiationsList.tsx
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../hook/useAuth";
import { useNegotiationsService } from "../../services/negotiationsService";
import { useLeadService } from "../../services/leadService";
import NegotiationModal from "./NegotiationModal";
import type { Negotiation, ImportanceLevel } from "../../types/negotiations";
import {
  Flame,
  Thermometer,
  Snowflake,
  CheckCircle2,
  XCircle,
  Car,
  History,
  RefreshCw,
  CalendarRange,
  Inbox,
  Trophy,
  TrendingDown,
} from "lucide-react";

// ─────────────────────────────────────────────
// Configurações visuais — espelham NegotiationCard / NegotiationModal
// ─────────────────────────────────────────────

const IMPORTANCE_CONFIG: Record<
  ImportanceLevel,
  { label: string; text: string; badge: string; icon: React.ReactNode }
> = {
  quente: {
    label: "Quente",
    text: "text-red-700",
    badge: "bg-red-50 border-red-200",
    icon: <Flame size={13} className="text-red-500" />,
  },
  morno: {
    label: "Morno",
    text: "text-amber-700",
    badge: "bg-amber-50 border-amber-200",
    icon: <Thermometer size={13} className="text-amber-500" />,
  },
  frio: {
    label: "Frio",
    text: "text-blue-700",
    badge: "bg-blue-50 border-blue-200",
    icon: <Snowflake size={13} className="text-blue-500" />,
  },
};

// Apenas os estados terminais aparecem nesta lista (won / lost).
type ClosedStatus = "won" | "lost";

const RESULT_CONFIG: Record<
  ClosedStatus,
  { label: string; text: string; badge: string; icon: React.ReactNode }
> = {
  won: {
    label: "Ganho",
    text: "text-emerald-700",
    badge: "bg-emerald-50 border-emerald-200",
    icon: <CheckCircle2 size={13} className="text-emerald-500" />,
  },
  lost: {
    label: "Perdido",
    text: "text-red-700",
    badge: "bg-red-50 border-red-200",
    icon: <XCircle size={13} className="text-red-500" />,
  },
};

const avatarGradients = [
  "linear-gradient(135deg,#6366F1,#8B5CF6)",
  "linear-gradient(135deg,#3B82F6,#06B6D4)",
  "linear-gradient(135deg,#F97316,#EF4444)",
  "linear-gradient(135deg,#10B981,#0EA5E9)",
  "linear-gradient(135deg,#EC4899,#8B5CF6)",
];

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase();
}

// ─────────────────────────────────────────────
// Filtro de período
// ─────────────────────────────────────────────

type PeriodKey = "this_month" | "last_month" | "last_3_months" | "custom";

const PERIOD_OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: "this_month", label: "Este mês" },
  { key: "last_month", label: "Mês passado" },
  { key: "last_3_months", label: "Últimos 3 meses" },
  { key: "custom", label: "Personalizado" },
];

// Retorna o intervalo [start, end] em epoch ms para o período escolhido.
function getRange(
  period: PeriodKey,
  customFrom: string,
  customTo: string
): { start: number; end: number } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  if (period === "this_month") {
    return {
      start: new Date(y, m, 1, 0, 0, 0, 0).getTime(),
      end: new Date(y, m + 1, 0, 23, 59, 59, 999).getTime(),
    };
  }

  if (period === "last_month") {
    return {
      start: new Date(y, m - 1, 1, 0, 0, 0, 0).getTime(),
      end: new Date(y, m, 0, 23, 59, 59, 999).getTime(),
    };
  }

  if (period === "last_3_months") {
    return {
      start: new Date(y, m - 2, 1, 0, 0, 0, 0).getTime(),
      end: new Date(y, m + 1, 0, 23, 59, 59, 999).getTime(),
    };
  }

  // Personalizado — limites abertos quando a data não foi informada.
  const start = customFrom
    ? new Date(`${customFrom}T00:00:00`).getTime()
    : Number.NEGATIVE_INFINITY;
  const end = customTo
    ? new Date(`${customTo}T23:59:59.999`).getTime()
    : Number.POSITIVE_INFINITY;
  return { start, end };
}

// Linha já decorada para a tabela.
interface ClosedRow {
  negotiation: Negotiation;
  clientName: string;
  vehicle: string;
  importance: ImportanceLevel;
  result: ClosedStatus;
  closedAt: string; // ISO — data do último status (won/lost)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─────────────────────────────────────────────
// Componente
// ─────────────────────────────────────────────

export default function ClosedNegotiationsList() {
  const { user } = useAuth();
  const { getNegotiations } = useNegotiationsService();
  const { getAllLeads } = useLeadService();

  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtro de período — começa em "este mês".
  const [period, setPeriod] = useState<PeriodKey>("this_month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // Modal de histórico
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadClosed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  function loadClosed() {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    // Buscamos TODAS as negociações do usuário (sem is_open, que hoje está
    // quebrado no backend) e filtramos por won/lost no cliente. O embed da
    // listagem traz o último status e a última importância (take: 1).
    Promise.all([
      getNegotiations({ attendant_id: user.id }),
      getAllLeads({ attendant_id: user.id }),
    ])
      .then(([negs, leads]) => {
        // Mesmo enriquecimento usado no SalesFunnel: o embed `lead` da
        // listagem é incompleto, então mesclamos os dados completos do
        // leadService pelo lead_id (cliente + interesse do veículo).
        const leadMap = new Map(leads.map((l) => [l.id, l]));
        const enriched: Negotiation[] = negs.map((n) => {
          const fullLead = leadMap.get(n.lead_id);
          if (!fullLead) return n;

          const vehicleInterest =
            fullLead.interest_item?.description ??
            fullLead.interest_item?.reference_code ??
            null;

          return {
            ...n,
            lead: {
              ...(n.lead ?? {}),
              id: fullLead.id,
              source: fullLead.source ?? undefined,
              customers: fullLead.customers ?? n.lead?.customers ?? undefined,
              vehicle_interest: vehicleInterest,
            },
          };
        });
        setNegotiations(enriched);
      })
      .catch(() => setError("Erro ao carregar as negociações encerradas."))
      .finally(() => setLoading(false));
  }

  // Deriva as linhas encerradas no período selecionado.
  const rows: ClosedRow[] = useMemo(() => {
    const { start, end } = getRange(period, customFrom, customTo);
    const out: ClosedRow[] = [];

    for (const n of negotiations) {
      // Embed da listagem vem com orderBy created_at desc + take 1 → o
      // elemento [0] é o status mais recente da negociação.
      const latest = n.status_history?.[0];
      if (!latest) continue;

      const status = latest.status_negotiation;
      if (status !== "won" && status !== "lost") continue; // só encerradas

      const closedMs = new Date(latest.created_at).getTime();
      if (closedMs < start || closedMs > end) continue;

      const impHistory = n.importance_history ?? [];
      const importance =
        impHistory[impHistory.length - 1]?.importance ?? "morno";

      out.push({
        negotiation: n,
        clientName: n.lead?.customers?.name ?? "—",
        vehicle: n.lead?.vehicle_interest || "Sem descrição do interesse",
        importance,
        result: status, // narrowed para "won" | "lost"
        closedAt: latest.created_at,
      });
    }

    // Mais recentes primeiro.
    out.sort(
      (a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime()
    );
    return out;
  }, [negotiations, period, customFrom, customTo]);

  const wonCount = rows.filter((r) => r.result === "won").length;
  const lostCount = rows.length - wonCount;

  return (
    <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Cabeçalho */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-5 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History size={18} className="text-blue-500" />
            Negociações Encerradas
          </h2>
          <div className="flex items-center gap-3 mt-1 text-sm">
            <span className="text-slate-500">
              {rows.length} no período
            </span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <Trophy size={13} /> {wonCount} ganhas
            </span>
            <span className="inline-flex items-center gap-1 text-red-600 font-medium">
              <TrendingDown size={13} /> {lostCount} perdidas
            </span>
          </div>
        </div>

        {/* Filtro por período */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            {PERIOD_OPTIONS.map((opt) => {
              const active = period === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setPeriod(opt.key)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    active
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <button
            onClick={loadClosed}
            className="p-2 text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm shrink-0"
            title="Atualizar"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Inputs de data (apenas no modo personalizado) */}
      {period === "custom" && (
        <div className="flex flex-wrap items-center gap-3 px-6 py-3 bg-slate-50/60 border-b border-slate-100">
          <CalendarRange size={16} className="text-slate-400" />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            De
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Até
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="px-2 py-1.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </label>
        </div>
      )}

      {/* Corpo */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Carregando negociações encerradas...</p>
        </div>
      ) : error ? (
        <div className="m-6 p-4 bg-red-50 border border-red-100 rounded-xl text-center">
          <p className="text-sm text-red-600 font-medium mb-3">{error}</p>
          <button
            onClick={loadClosed}
            className="inline-flex items-center gap-2 mx-auto text-sm bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-200 transition-colors"
          >
            <RefreshCw size={14} />
            Tentar novamente
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mb-3">
            <Inbox size={26} className="text-slate-400" />
          </div>
          <h3 className="text-slate-700 font-semibold mb-1">
            Nenhuma negociação encerrada no período
          </h3>
          <p className="text-slate-400 text-sm max-w-sm">
            Ajuste o filtro de período para visualizar negociações ganhas ou
            perdidas em outras datas.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Veículo / Interesse</th>
                <th className="px-6 py-3">Importância</th>
                <th className="px-6 py-3">Resultado</th>
                <th className="px-6 py-3">Encerrada em</th>
                <th className="px-6 py-3 text-right">Histórico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => {
                const imp = IMPORTANCE_CONFIG[row.importance];
                const res = RESULT_CONFIG[row.result];
                const idx =
                  row.negotiation.id.charCodeAt(0) % avatarGradients.length;

                return (
                  <tr
                    key={row.negotiation.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    {/* Cliente */}
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-inner shrink-0"
                          style={{ background: avatarGradients[idx] }}
                        >
                          {initials(row.clientName)}
                        </div>
                        <span
                          className="font-medium text-slate-800 truncate max-w-45"
                          title={row.clientName}
                        >
                          {row.clientName}
                        </span>
                      </div>
                    </td>

                    {/* Veículo / Interesse */}
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1.5 text-slate-600 min-w-0">
                        <Car size={14} className="text-slate-400 shrink-0" />
                        <span
                          className="truncate max-w-55"
                          title={row.vehicle}
                        >
                          {row.vehicle}
                        </span>
                      </div>
                    </td>

                    {/* Importância */}
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${imp.badge} ${imp.text}`}
                      >
                        {imp.icon}
                        {imp.label}
                      </span>
                    </td>

                    {/* Resultado */}
                    <td className="px-6 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border ${res.badge} ${res.text}`}
                      >
                        {res.icon}
                        {res.label}
                      </span>
                    </td>

                    {/* Data de encerramento */}
                    <td className="px-6 py-3 text-slate-500 whitespace-nowrap">
                      {formatDate(row.closedAt)}
                    </td>

                    {/* Ação: ver histórico */}
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => setSelectedId(row.negotiation.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <History size={13} />
                        Ver histórico
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de detalhes/histórico — reaproveita o componente existente */}
      {selectedId && (
        <NegotiationModal
          negotiationId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </section>
  );
}