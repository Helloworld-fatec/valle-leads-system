// src/components/dashboards/attendant/LeadsBySourceChart.tsx
import { ChartSourceItem } from "../../../services/dashboardService";

interface LeadsBySourceChartProps {
  data: ChartSourceItem[];
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

export default function LeadsBySourceChart({ data, loading }: LeadsBySourceChartProps) {
  const total = data.reduce((acc, d) => acc + d.count, 0) || 1;

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="w-40 h-5 bg-gray-100 rounded mb-1" />
        <div className="w-24 h-4 bg-gray-100 rounded mb-6" />
        <div className="flex justify-center mb-4">
          <div className="w-36 h-36 rounded-full bg-gray-100" />
        </div>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded" />
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

  // Build donut SVG slices
  const cx = 80;
  const cy = 80;
  const r = 60;
  const innerR = 38;
  const circumference = 2 * Math.PI * r;

  let cumulativeAngle = -90; // Start from top

  const slices = data.map((item, i) => {
    const pct = item.count / total;
    const angle = pct * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    const endAngle = cumulativeAngle;

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const xi1 = cx + innerR * Math.cos(toRad(endAngle));
    const yi1 = cy + innerR * Math.sin(toRad(endAngle));
    const xi2 = cx + innerR * Math.cos(toRad(startAngle));
    const yi2 = cy + innerR * Math.sin(toRad(startAngle));

    const largeArc = angle > 180 ? 1 : 0;

    const d = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${xi1} ${yi1}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${xi2} ${yi2}`,
      "Z",
    ].join(" ");

    return { d, color: SOURCE_COLORS[i % SOURCE_COLORS.length], item, pct };
  });

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="mb-4">
        <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>
          Leads por Origem
        </h3>
        <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
          Distribuição por canal de entrada
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut chart */}
        <div className="shrink-0">
          <svg viewBox="0 0 160 160" width={160} height={160}>
            {slices.map((s, i) => (
              <path key={i} d={s.d} fill={s.color} stroke="#fff" strokeWidth={2} />
            ))}
            {/* Center label */}
            <text
              x={cx}
              y={cy - 6}
              textAnchor="middle"
              fontSize={20}
              fontWeight="700"
              fill="#111827"
            >
              {total}
            </text>
            <text
              x={cx}
              y={cy + 12}
              textAnchor="middle"
              fontSize={9}
              fill="#9CA3AF"
            >
              leads
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-2">
          {slices.map((s, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: s.color }}
                />
                <span
                  className="text-xs truncate"
                  style={{ color: "#374151" }}
                >
                  {s.item.source}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-semibold" style={{ color: "#111827" }}>
                  {s.item.count}
                </span>
                <span
                  className="text-xs w-10 text-right"
                  style={{ color: "#9CA3AF" }}
                >
                  {Math.round(s.pct * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
