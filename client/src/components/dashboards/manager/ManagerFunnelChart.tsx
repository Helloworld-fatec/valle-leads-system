// src/components/dashboards/manager/ManagerFunnelChart.tsx
import {
  getStageColor,
  getStageLabel,
  type TeamStageFunnelResponse,
  type TeamClosingRateResponse,
} from "../../../services/dashboardService";

const CLOSING_STAGES = new Set(["fechamento_com_venda", "fechamento_sem_venda"]);

interface ManagerFunnelChartProps {
  data: TeamStageFunnelResponse | null;
  closingRate?: TeamClosingRateResponse | null;
  loading: boolean;
}

export default function ManagerFunnelChart({ data, closingRate, loading }: ManagerFunnelChartProps) {
  const allStages   = data?.funnel ?? [];
  const stages      = allStages.filter((s) => !CLOSING_STAGES.has(s.stage));
  const stageMax    = stages.length > 0 ? Math.max(...stages.map((s) => s.count), 1) : 1;
  const total       = stages.reduce((acc, s) => acc + s.count, 0);
  const wonCount    = closingRate?.wonCount  ?? 0;
  const lostCount   = closingRate?.lostCount ?? 0;
  const closedMax   = Math.max(wonCount, lostCount, 1);
  const hasResults  = wonCount > 0 || lostCount > 0;

  return (
    <div
      className="rounded-2xl p-5 shadow-sm border h-full"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      {/* Cabeçalho */}
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
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-24 h-4 rounded animate-pulse" style={{ background: "#F1F5F9" }} />
              <div className="flex-1 h-7 rounded-lg animate-pulse" style={{ background: "#F1F5F9" }} />
              <div className="w-10 h-4 rounded animate-pulse" style={{ background: "#F1F5F9" }} />
            </div>
          ))}
        </div>
      ) : stages.length === 0 && !hasResults ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-sm" style={{ color: "#9CA3AF" }}>
            Nenhuma negociação ativa
          </p>
        </div>
      ) : (
        <>
          {/* Estágios do pipeline */}
          <div className="space-y-3">
            {stages.map((item) => {
              const pct   = Math.round((item.count / stageMax) * 100);
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
                  <span className="text-xs font-semibold w-10 text-right" style={{ color: "#111827" }}>
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>

          {/* Resultados do período */}
          {hasResults && (
            <>
              <div className="flex items-center gap-2 mt-5 mb-3">
                <div className="flex-1 border-t" style={{ borderColor: "#E5E7EB" }} />
                <span className="text-xs font-medium px-2" style={{ color: "#9CA3AF" }}>
                  Resultados do período
                </span>
                <div className="flex-1 border-t" style={{ borderColor: "#E5E7EB" }} />
              </div>

              <div className="space-y-3">
                {/* Ganhas */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium w-28 shrink-0 text-right" style={{ color: "#6B7280" }}>
                    Ganhas
                  </span>
                  <div className="flex-1 h-7 rounded-lg overflow-hidden" style={{ background: "#F1F5F9" }}>
                    {wonCount > 0 && (
                      <div
                        className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                        style={{
                          width: `${Math.max(Math.round((wonCount / closedMax) * 100), 8)}%`,
                          background: "#16A34A",
                        }}
                      >
                        <span className="text-white text-xs font-semibold">{wonCount}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold w-10 text-right" style={{ color: "#16A34A" }}>
                    {wonCount}
                  </span>
                </div>

                {/* Perdidas */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium w-28 shrink-0 text-right" style={{ color: "#6B7280" }}>
                    Perdidas
                  </span>
                  <div className="flex-1 h-7 rounded-lg overflow-hidden" style={{ background: "#F1F5F9" }}>
                    {lostCount > 0 && (
                      <div
                        className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                        style={{
                          width: `${Math.max(Math.round((lostCount / closedMax) * 100), 8)}%`,
                          background: "#DC2626",
                        }}
                      >
                        <span className="text-white text-xs font-semibold">{lostCount}</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-semibold w-10 text-right" style={{ color: "#DC2626" }}>
                    {lostCount}
                  </span>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}