// src/components/dashboards/manager/ManagerFunnelChart.tsx
import type { TeamFunnelResponse } from "../../../services/dashboardService";

interface ManagerFunnelChartProps {
  data: TeamFunnelResponse | null;
  loading: boolean;
}

const FUNNEL_COLORS: Record<string, string> = {
  Novo: "#3B82F6",
  "Contato Inicial": "#8B5CF6",
  Qualificação: "#F59E0B",
  Proposta: "#F97316",
  Negociação: "#EF4444",
  Fechamento: "#10B981",
};

const DEFAULT_COLOR = "#6B7280";

function getColor(status: string): string {
  return FUNNEL_COLORS[status] ?? DEFAULT_COLOR;
}

export default function ManagerFunnelChart({ data, loading }: ManagerFunnelChartProps) {
  const stages = data?.funnel ?? [];
  const max = stages[0]?.count ?? 1;

  return (
    <div
      className="rounded-xl p-5 shadow-sm border h-full"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>
            Funil da Equipe
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
            Distribuição por etapa
          </p>
        </div>
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: "#EFF6FF", color: "#2563EB" }}
        >
          Período
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-24 h-4 rounded animate-pulse" style={{ background: "#F1F5F9" }} />
              <div className="flex-1 h-7 rounded-lg animate-pulse" style={{ background: "#F1F5F9" }} />
            </div>
          ))}
        </div>
      ) : stages.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-sm" style={{ color: "#9CA3AF" }}>Sem dados para exibir</p>
        </div>
      ) : (
        <div className="space-y-3">
          {stages.map((stage) => {
            const pct = Math.round((stage.count / max) * 100);
            const color = getColor(stage.status);
            return (
              <div key={stage.status} className="flex items-center gap-3">
                <span
                  className="text-xs font-medium w-28 shrink-0 text-right"
                  style={{ color: "#6B7280" }}
                >
                  {stage.status}
                </span>
                <div
                  className="flex-1 h-7 rounded-lg overflow-hidden"
                  style={{ background: "#F1F5F9" }}
                >
                  <div
                    className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                    style={{ width: `${pct}%`, background: color, minWidth: "2.5rem" }}
                  >
                    <span className="text-white text-xs font-semibold">{stage.count}</span>
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
      )}
    </div>
  );
}
