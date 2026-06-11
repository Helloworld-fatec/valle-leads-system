// src/components/dashboards/attendant/StageFunnelChart.tsx
import {
  StageFunnelItem,
  getStageColor,
  getStageLabel,
} from "../../../services/dashboardService";

const CLOSING_STAGES = new Set(["fechamento_com_venda", "fechamento_sem_venda"]);

interface StageFunnelChartProps {
  data: StageFunnelItem[];
  loading?: boolean;
  wonCount?: number;
  lostCount?: number;
}

export default function StageFunnelChart({
  data,
  loading,
  wonCount = 0,
  lostCount = 0,
}: StageFunnelChartProps) {
  const pipelineData = data.filter((item) => !CLOSING_STAGES.has(item.stage));

  const stageMax    = pipelineData.length > 0 ? Math.max(...pipelineData.map((d) => d.count), 1) : 1;
  const closedMax   = Math.max(wonCount, lostCount, 1);
  const totalStages = pipelineData.reduce((acc, d) => acc + d.count, 0);
  const hasResults  = wonCount > 0 || lostCount > 0;

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="w-40 h-5 bg-gray-100 rounded mb-1" />
        <div className="w-24 h-4 bg-gray-100 rounded mb-6" />
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-7 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!pipelineData.length && !hasResults) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-55">
        <p className="text-sm font-medium" style={{ color: "#6B7280" }}>
          Nenhum dado no período
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">

      {/* ── Cabeçalho ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>
            Funil de Vendas
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
            Distribuição por etapa
          </p>
        </div>
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: "#EFF6FF", color: "#2563EB" }}
        >
          {totalStages} em aberto
        </span>
      </div>

      {/* ── Estágios do pipeline (sem fechamentos) ── */}
      <div className="space-y-3">
        {pipelineData.map((item) => {
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

      {/* ── Resultados do período ─────────────────── */}
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
              <span
                className="text-xs font-medium w-28 shrink-0 text-right"
                style={{ color: "#6B7280" }}
              >
                Ganhas
              </span>
              <div
                className="flex-1 h-7 rounded-lg overflow-hidden"
                style={{ background: "#F1F5F9" }}
              >
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
              <span
                className="text-xs font-semibold w-10 text-right"
                style={{ color: "#16A34A" }}
              >
                {wonCount}
              </span>
            </div>

            {/* Perdidas */}
            <div className="flex items-center gap-3">
              <span
                className="text-xs font-medium w-28 shrink-0 text-right"
                style={{ color: "#6B7280" }}
              >
                Perdidas
              </span>
              <div
                className="flex-1 h-7 rounded-lg overflow-hidden"
                style={{ background: "#F1F5F9" }}
              >
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
              <span
                className="text-xs font-semibold w-10 text-right"
                style={{ color: "#DC2626" }}
              >
                {lostCount}
              </span>
            </div>
          </div>
        </>
      )}

    </div>
  );
}