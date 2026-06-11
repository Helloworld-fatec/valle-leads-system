// src/components/dashboards/attendant/IdleLeadsChart.tsx
// Leads SEM negociação aberta (snapshot):
//   - "Nunca trabalhados": sem nenhuma negociação → backlog acionável
//   - "Tudo encerrado": só negociações fechadas → candidatos a reativação
// + barras por origem dos nunca trabalhados (onde agir primeiro).
import { IdleLeadsResponse } from "../../../services/dashboardService";

interface IdleLeadsChartProps {
  data: IdleLeadsResponse["idleLeads"] | null;
  loading?: boolean;
}

const NEVER_COLOR = "#F59E0B";
const CLOSED_COLOR = "#94A3B8";

export default function IdleLeadsChart({ data, loading }: IdleLeadsChartProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="w-40 h-5 bg-gray-100 rounded mb-1" />
        <div className="w-24 h-4 bg-gray-100 rounded mb-6" />
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="h-20 bg-gray-100 rounded-xl" />
          <div className="h-20 bg-gray-100 rounded-xl" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.total === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[220px]">
        <p className="text-sm font-medium" style={{ color: "#16A34A" }}>
          Nenhum lead parado 🎉
        </p>
        <p className="text-xs mt-1" style={{ color: "#9CA3AF" }}>
          Toda a carteira tem negociação aberta
        </p>
      </div>
    );
  }

  const maxSource =
    data.bySource.length > 0 ? Math.max(...data.bySource.map((s) => s.count), 1) : 1;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>
            Leads Parados
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
            Sem nenhuma negociação aberta
          </p>
        </div>
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: "#FEF3C7", color: "#D97706" }}
        >
          {data.total} no total
        </span>
      </div>

      {/* Os dois baldes */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="rounded-xl p-4" style={{ background: "#FFFBEB" }}>
          <p className="text-2xl font-bold" style={{ color: "#D97706" }}>
            {data.neverNegotiated}
          </p>
          <p className="text-xs mt-1 font-medium" style={{ color: "#92400E" }}>
            Nunca trabalhados
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "#B45309" }}>
            sem negociação criada
          </p>
        </div>
        <div className="rounded-xl p-4" style={{ background: "#F8FAFC" }}>
          <p className="text-2xl font-bold" style={{ color: "#475569" }}>
            {data.closedOnly}
          </p>
          <p className="text-xs mt-1 font-medium" style={{ color: "#475569" }}>
            Tudo encerrado
          </p>
          <p className="text-[11px] mt-0.5" style={{ color: "#94A3B8" }}>
            candidatos a reativação
          </p>
        </div>
      </div>

      {/* Origem dos nunca trabalhados */}
      {data.bySource.length > 0 && (
        <>
          <p className="text-xs font-medium mb-3" style={{ color: "#6B7280" }}>
            Nunca trabalhados, por origem
          </p>
          <div className="space-y-2.5">
            {data.bySource.map((s) => {
              const pct = Math.round((s.count / maxSource) * 100);
              return (
                <div key={s.source} className="flex items-center gap-3">
                  <span
                    className="text-xs font-medium w-24 shrink-0 text-right truncate"
                    style={{ color: "#6B7280" }}
                    title={s.source}
                  >
                    {s.source}
                  </span>
                  <div
                    className="flex-1 h-5 rounded-md overflow-hidden"
                    style={{ background: "#F1F5F9" }}
                  >
                    <div
                      className="h-full rounded-md flex items-center px-2 transition-all duration-700"
                      style={{ width: `${Math.max(pct, 10)}%`, background: NEVER_COLOR }}
                    >
                      <span className="text-white text-[11px] font-semibold">{s.count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
