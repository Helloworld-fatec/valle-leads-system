// src/components/dashboards/attendant/NegotiationsBySourceChart.tsx
// Negociações ABERTAS na janela, agrupadas pela origem do lead.
// Substitui o antigo LeadsBySourceChart (que contava leads criados).
import { NegotiationsBySourceItem } from "../../../services/dashboardService";

interface NegotiationsBySourceChartProps {
  data: NegotiationsBySourceItem[];
  loading?: boolean;
}

const SOURCE_COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#10B981",
  "#F97316",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
];

export default function NegotiationsBySourceChart({
  data,
  loading,
}: NegotiationsBySourceChartProps) {
  const total = data.reduce((acc, d) => acc + d.count, 0);
  const max = data.length > 0 ? Math.max(...data.map((d) => d.count), 1) : 1;

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="w-40 h-5 bg-gray-100 rounded mb-1" />
        <div className="w-24 h-4 bg-gray-100 rounded mb-6" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-6 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!data.length || total === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[220px]">
        <p className="text-sm font-medium" style={{ color: "#6B7280" }}>
          Nenhuma negociação no período
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>
            Negociações por Origem
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
            Abertas no período, pela origem do lead
          </p>
        </div>
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: "#F5F3FF", color: "#7C3AED" }}
        >
          {total} no período
        </span>
      </div>

      <div className="space-y-3">
        {data.map((item, i) => {
          const widthPct = Math.round((item.count / max) * 100);
          const sharePct = Math.round((item.count / total) * 100);
          const color = SOURCE_COLORS[i % SOURCE_COLORS.length];
          return (
            <div key={item.source} className="flex items-center gap-3">
              <span
                className="text-xs font-medium w-28 shrink-0 text-right truncate"
                style={{ color: "#6B7280" }}
                title={item.source}
              >
                {item.source}
              </span>
              <div
                className="flex-1 h-6 rounded-lg overflow-hidden"
                style={{ background: "#F1F5F9" }}
              >
                <div
                  className="h-full rounded-lg flex items-center px-2.5 transition-all duration-700"
                  style={{ width: `${Math.max(widthPct, 8)}%`, background: color }}
                >
                  <span className="text-white text-xs font-semibold">{item.count}</span>
                </div>
              </div>
              <span
                className="text-xs font-semibold w-10 text-right"
                style={{ color: "#111827" }}
              >
                {sharePct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
