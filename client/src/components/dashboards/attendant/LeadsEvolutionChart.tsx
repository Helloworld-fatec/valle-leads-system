// src/components/dashboards/attendant/LeadsEvolutionChart.tsx
import { ChartEvolutionItem } from "../../../services/dashboardService";

interface LeadsEvolutionChartProps {
  data: ChartEvolutionItem[];
  loading?: boolean;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function LeadsEvolutionChart({ data, loading }: LeadsEvolutionChartProps) {
  const max = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 1;

  // Show at most 10 ticks on X axis for readability
  const step = Math.max(1, Math.ceil(data.length / 10));
  const visibleLabels = data.map((_, i) => i % step === 0);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="w-40 h-5 bg-gray-100 rounded mb-1" />
        <div className="w-24 h-4 bg-gray-100 rounded mb-6" />
        <div className="h-44 bg-gray-50 rounded-lg" />
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

  const HEIGHT = 160;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="mb-4">
        <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>
          Evolução de Leads
        </h3>
        <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
          Quantidade de leads ao longo do período
        </p>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          width="100%"
          viewBox={`0 0 ${Math.max(data.length * 36, 320)} ${HEIGHT + 40}`}
          preserveAspectRatio="none"
          className="w-full"
          style={{ minHeight: `${HEIGHT + 40}px` }}
        >
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = HEIGHT - ratio * HEIGHT;
            return (
              <line
                key={ratio}
                x1={0}
                x2={data.length * 36}
                y1={y}
                y2={y}
                stroke="#F1F5F9"
                strokeWidth={1}
              />
            );
          })}

          {/* Area fill */}
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {data.length > 1 && (() => {
            const pts = data.map((d, i) => {
              const x = i * 36 + 18;
              const y = HEIGHT - (d.count / max) * HEIGHT;
              return `${x},${y}`;
            });
            const firstX = 18;
            const lastX = (data.length - 1) * 36 + 18;
            const areaPath = `M${firstX},${HEIGHT} L${pts.join(" L")} L${lastX},${HEIGHT} Z`;
            const linePath = `M${pts.join(" L")}`;
            return (
              <>
                <path d={areaPath} fill="url(#areaGrad)" />
                <path
                  d={linePath}
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </>
            );
          })()}

          {/* Data points */}
          {data.map((d, i) => {
            const x = i * 36 + 18;
            const y = HEIGHT - (d.count / max) * HEIGHT;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={4} fill="#2563EB" />
                <circle cx={x} cy={y} r={7} fill="#2563EB" fillOpacity={0.15} />
                {/* Value tooltip on hover — simplified as static label for top values */}
                {d.count === max && (
                  <text
                    x={x}
                    y={y - 12}
                    textAnchor="middle"
                    fontSize={10}
                    fill="#1E3A8A"
                    fontWeight="600"
                  >
                    {d.count}
                  </text>
                )}
                {/* X axis labels */}
                {visibleLabels[i] && (
                  <text
                    x={x}
                    y={HEIGHT + 22}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#9CA3AF"
                  >
                    {formatDate(d.date)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
