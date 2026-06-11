// src/components/dashboards/attendant/SalesFunnelChart.tsx
import {
  ChartFunnelItem,
  getStageColor,
  getStageLabel,
} from "../../../services/dashboardService";

interface SalesFunnelChartProps {
  data: ChartFunnelItem[];
  loading?: boolean;
}

export default function SalesFunnelChart({ data, loading }: SalesFunnelChartProps) {
  const max = data.length > 0 ? Math.max(...data.map((d) => d.count), 1) : 1;
  const totalLeads = data.reduce((acc, d) => acc + d.count, 0);

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

  // O backend sempre retorna os 7 estágios (com zeros); "sem dados" agora
  // significa array vazio OU todos os counts zerados.
  if (!data.length || totalLeads === 0) {
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
          {totalLeads} negociações
        </span>
      </div>

      <div className="space-y-3">
        {data.map((item) => {
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
                    style={{
                      width: `${Math.max(pct, 8)}%`,
                      background: color,
                    }}
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
    </div>
  );
}