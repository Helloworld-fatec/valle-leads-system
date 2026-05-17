// src/components/dashboards/general-manager/GlobalFunnelChart.tsx
import type { GlobalFunnelResponse } from "../../../services/dashboardService";

interface Props {
  data: GlobalFunnelResponse | null;
  loading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  Novo: "#3B82F6",
  "Contato Inicial": "#8B5CF6",
  Qualificação: "#F59E0B",
  Proposta: "#F97316",
  Negociação: "#EF4444",
  Fechamento: "#10B981",
};

const FALLBACK_COLORS = [
  "#3B82F6", "#8B5CF6", "#F59E0B", "#F97316", "#EF4444", "#10B981", "#06B6D4",
];

function getColor(status: string, idx: number) {
  return STATUS_COLORS[status] ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length];
}

function SkeletonBar() {
  return (
    <div className="flex items-center gap-4">
      <div className="w-28 h-4 rounded animate-pulse" style={{ background: "#F1F5F9" }} />
      <div className="flex-1 h-7 rounded-lg animate-pulse" style={{ background: "#F1F5F9" }} />
      <div className="w-10 h-4 rounded animate-pulse" style={{ background: "#F1F5F9" }} />
    </div>
  );
}

export default function GlobalFunnelChart({ data, loading }: Props) {
  const items = data?.funnel ?? [];
  const max = items.length > 0 ? Math.max(...items.map((i) => i.count), 1) : 1;

  return (
    <div
      className="rounded-2xl p-6 shadow-sm border"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>
            Funil Global de Conversão
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
            Distribuição por etapa — todas as equipes
          </p>
        </div>
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: "#FEF3C7", color: "#D97706" }}
        >
          {items.length} etapas
        </span>
      </div>

      <div className="space-y-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonBar key={i} />)
          : items.length === 0
          ? (
            <p className="text-sm text-center py-8" style={{ color: "#9CA3AF" }}>
              Nenhum dado disponível
            </p>
          )
          : items.map((item, idx) => {
              const pct = Math.round((item.count / max) * 100);
              const color = getColor(item.status, idx);
              return (
                <div key={item.status} className="flex items-center gap-4">
                  <span
                    className="text-xs font-medium w-28 shrink-0 text-right truncate"
                    style={{ color: "#6B7280" }}
                    title={item.status}
                  >
                    {item.status}
                  </span>
                  <div
                    className="flex-1 h-7 rounded-lg overflow-hidden"
                    style={{ background: "#F1F5F9" }}
                  >
                    <div
                      className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                      style={{ width: `${pct}%`, background: color, minWidth: "2.5rem" }}
                    >
                      <span className="text-white text-xs font-semibold">{item.count}</span>
                    </div>
                  </div>
                  <span
                    className="text-xs font-semibold w-10 text-right"
                    style={{ color: "#111827" }}
                  >
                    {pct}%
                  </span>
                </div>
              );
            })}
      </div>
    </div>
  );
}
