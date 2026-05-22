// src/components/dashboards/attendant/SalesFunnelChart.tsx
import { ChartFunnelItem } from "../../../services/dashboardService";

interface SalesFunnelChartProps {
  data: ChartFunnelItem[];
  loading?: boolean;
}

const FUNNEL_COLORS: Record<string, string> = {
  Novo: "#3B82F6",
  "Contato Inicial": "#8B5CF6",
  Qualificação: "#F59E0B",
  Proposta: "#F97316",
  Negociação: "#EF4444",
  Fechamento: "#10B981",
};

function getColor(status: string, index: number): string {
  const fallbacks = ["#3B82F6", "#8B5CF6", "#F59E0B", "#F97316", "#EF4444", "#10B981"];
  return FUNNEL_COLORS[status] ?? fallbacks[index % fallbacks.length];
}

export default function SalesFunnelChart({ data, loading }: SalesFunnelChartProps) {
  const max = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 1;

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="w-40 h-5 bg-gray-100 rounded mb-1" />
        <div className="w-24 h-4 bg-gray-100 rounded mb-6" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-7 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[220px]">
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
          {data.reduce((acc, d) => acc + d.count, 0)} leads
        </span>
      </div>

      <div className="space-y-3">
        {data.map((stage, i) => {
          const pct = Math.round((stage.count / max) * 100);
          const color = getColor(stage.status, i);
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
                  style={{
                    width: `${Math.max(pct, 8)}%`,
                    background: color,
                  }}
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
    </div>
  );
}
