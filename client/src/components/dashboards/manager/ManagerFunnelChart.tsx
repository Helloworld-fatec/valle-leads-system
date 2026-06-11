// src/components/dashboards/manager/ManagerFunnelChart.tsx
// Funil da carteira ATIVA da equipe pelo estágio atual (snapshot —
// não muda com o filtro de período).
import {
  getStageColor,
  getStageLabel,
  type TeamStageFunnelResponse,
} from "../../../services/dashboardService";

interface ManagerFunnelChartProps {
  data: TeamStageFunnelResponse | null;
  loading: boolean;
}

export default function ManagerFunnelChart({ data, loading }: ManagerFunnelChartProps) {
  const stages = data?.funnel ?? [];
  const max = stages.length > 0 ? Math.max(...stages.map((s) => s.count), 1) : 1;
  const total = stages.reduce((acc, s) => acc + s.count, 0);

  return (
    <div
      className="rounded-2xl p-5 shadow-sm border h-full"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>
            Funil da Equipe
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
            Carteira ativa por estágio atual
          </p>
        </div>
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: "#EFF6FF", color: "#2563EB" }}
        >
          {total} ativas
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-24 h-4 rounded animate-pulse" style={{ background: "#F1F5F9" }} />
              <div className="flex-1 h-7 rounded-lg animate-pulse" style={{ background: "#F1F5F9" }} />
            </div>
          ))}
        </div>
      ) : stages.length === 0 || total === 0 ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-sm" style={{ color: "#9CA3AF" }}>
            Nenhuma negociação ativa
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {stages.map((item) => {
            const pct = Math.round((item.count / max) * 100);
            const color = getStageColor(item.stage);
            return (
              <div key={item.stage} className="flex items-center gap-3">
                <span
                  className="text-xs font-medium w-28 shrink-0 text-right"
                  style={{ color: "#6B7280" }}
                >
                  {getStageLabel(item.stage)}
                </span>
                <div
                  className="flex-1 h-7 rounded-lg overflow-hidden"
                  style={{ background: "#F1F5F9" }}
                >
                  {item.count > 0 && (
                    <div
                      className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                      style={{ width: `${Math.max(pct, 8)}%`, background: color }}
                    >
                      <span className="text-white text-xs font-semibold">{item.count}</span>
                    </div>
                  )}
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
