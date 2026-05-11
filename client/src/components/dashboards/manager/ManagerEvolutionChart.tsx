// src/components/dashboards/manager/ManagerEvolutionChart.tsx
import type { TeamEvolutionResponse } from "../../../services/dashboardService";

interface ManagerEvolutionChartProps {
  data: TeamEvolutionResponse | null;
  loading: boolean;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function ManagerEvolutionChart({ data, loading }: ManagerEvolutionChartProps) {
  const points = data?.evolution ?? [];
  const max = Math.max(...points.map((p) => p.count), 1);
  const min = 0;
  const range = max - min || 1;

  const W = 600;
  const H = 180;
  const PAD = { top: 16, right: 16, bottom: 32, left: 40 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const toX = (i: number) =>
    PAD.left + (points.length <= 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const toY = (v: number) =>
    PAD.top + innerH - ((v - min) / range) * innerH;

  const pathD =
    points.length < 2
      ? ""
      : points
          .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.count)}`)
          .join(" ");

  const areaD =
    points.length < 2
      ? ""
      : `${pathD} L ${toX(points.length - 1)} ${PAD.top + innerH} L ${toX(0)} ${PAD.top + innerH} Z`;

  // Y axis labels
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    value: Math.round(min + t * range),
    y: PAD.top + innerH - t * innerH,
  }));

  // X axis sample labels (show up to 6)
  const xStep = Math.max(1, Math.floor(points.length / 6));
  const xLabels = points
    .map((p, i) => ({ label: formatDate(p.date), x: toX(i), i }))
    .filter((_, i) => i % xStep === 0 || i === points.length - 1);

  return (
    <div
      className="rounded-xl p-5 shadow-sm border h-full"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>
            Evolução da Equipe
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
            Novos leads por dia
          </p>
        </div>
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: "#F3F4F6", color: "#374151" }}
        >
          {points.length} dias
        </span>
      </div>

      {loading ? (
        <div className="h-44 rounded-lg animate-pulse" style={{ background: "#F1F5F9" }} />
      ) : points.length === 0 ? (
        <div className="flex items-center justify-center h-44">
          <p className="text-sm" style={{ color: "#9CA3AF" }}>Sem dados para exibir</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="w-full"
            style={{ minWidth: 280 }}
            aria-label="Gráfico de evolução da equipe"
          >
            <defs>
              <linearGradient id="mgr-evo-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {yTicks.map((t) => (
              <g key={t.value}>
                <line
                  x1={PAD.left}
                  y1={t.y}
                  x2={PAD.left + innerW}
                  y2={t.y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
                <text
                  x={PAD.left - 6}
                  y={t.y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fill="#9CA3AF"
                >
                  {t.value}
                </text>
              </g>
            ))}

            {/* Area fill */}
            <path d={areaD} fill="url(#mgr-evo-grad)" />

            {/* Line */}
            <path
              d={pathD}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dots */}
            {points.map((p, i) => (
              <circle
                key={i}
                cx={toX(i)}
                cy={toY(p.count)}
                r="3.5"
                fill="#FFFFFF"
                stroke="#3B82F6"
                strokeWidth="2"
              />
            ))}

            {/* X axis labels */}
            {xLabels.map(({ label, x }) => (
              <text
                key={label + x}
                x={x}
                y={H - 6}
                textAnchor="middle"
                fontSize="10"
                fill="#9CA3AF"
              >
                {label}
              </text>
            ))}
          </svg>
        </div>
      )}
    </div>
  );
}
