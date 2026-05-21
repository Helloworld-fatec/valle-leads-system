// src/components/dashboards/attendant/ConversionsByPeriodChart.tsx
import { ChartEvolutionItem } from "../../../services/dashboardService";

interface ConversionsByPeriodChartProps {
  data: ChartEvolutionItem[];
  loading?: boolean;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function ConversionsByPeriodChart({ data, loading }: ConversionsByPeriodChartProps) {
  const max = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 1;
  const step = Math.max(1, Math.ceil(data.length / 8));

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="w-48 h-5 bg-gray-100 rounded mb-1" />
        <div className="w-24 h-4 bg-gray-100 rounded mb-6" />
        <div className="flex items-end gap-2 h-36">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex-1 bg-gray-100 rounded-t-lg"
              style={{ height: `${30 + Math.random() * 70}%` }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-55">
        <p className="text-sm font-medium" style={{ color: "#6B7280" }}>
          Nenhum dado no período
        </p>
      </div>
    );
  }

  const BAR_W = 24;
  const GAP = 12;
  const HEIGHT = 140;
  const WIDTH = data.length * (BAR_W + GAP);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="mb-4">
        <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>
          Conversões por Período
        </h3>
        <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
          Fechamentos realizados ao longo do tempo
        </p>
      </div>

      <div className="overflow-x-auto">
        <svg
          width={Math.max(WIDTH, 280)}
          height={HEIGHT + 36}
          viewBox={`0 0 ${Math.max(WIDTH, 280)} ${HEIGHT + 36}`}
        >
          {/* Grid */}
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = HEIGHT - ratio * HEIGHT;
            return (
              <line
                key={ratio}
                x1={0}
                x2={Math.max(WIDTH, 280)}
                y1={y}
                y2={y}
                stroke="#F1F5F9"
                strokeWidth={1}
              />
            );
          })}

          {data.map((d, i) => {
            const barH = Math.max((d.count / max) * HEIGHT, d.count > 0 ? 6 : 0);
            const x = i * (BAR_W + GAP);
            const y = HEIGHT - barH;

            return (
              <g key={i}>
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={BAR_W}
                  height={barH}
                  rx={4}
                  fill="#10B981"
                  fillOpacity={0.85}
                />
                {/* Value on bar */}
                {d.count > 0 && (
                  <text
                    x={x + BAR_W / 2}
                    y={y - 4}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#059669"
                    fontWeight="600"
                  >
                    {d.count}
                  </text>
                )}
                {/* X label */}
                {i % step === 0 && (
                  <text
                    x={x + BAR_W / 2}
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
