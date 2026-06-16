// src/components/dashboards/attendant/EvolutionChart.tsx
// Linha dupla: negociações ABERTAS × GANHAS por dia, dentro da janela.
// Substitui o antigo LeadsEvolutionChart (série única de leads criados).
import { EvolutionPoint } from "../../../services/dashboardService";

interface EvolutionChartProps {
  data: EvolutionPoint[];
  loading?: boolean;
}

const OPENED_COLOR = "#3B82F6";
const WON_COLOR = "#10B981";

function formatDate(dateStr: string) {
  const d = new Date(`${dateStr}T12:00:00`); // meio-dia evita shift de timezone
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function EvolutionChart({ data, loading }: EvolutionChartProps) {
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
  const PAD_TOP = 10;
  const STEP_X = 36;
  const width = Math.max(data.length * STEP_X, 320);
  const max = Math.max(...data.map((d) => Math.max(d.opened, d.won)), 1);

  // No máximo 10 labels no eixo X, para legibilidade
  const labelStep = Math.max(1, Math.ceil(data.length / 10));

  const x = (i: number) =>
    data.length === 1 ? width / 2 : (i / (data.length - 1)) * (width - STEP_X) + STEP_X / 2;
  const y = (v: number) => PAD_TOP + (1 - v / max) * (HEIGHT - PAD_TOP);

  const linePoints = (key: "opened" | "won") =>
    data.map((d, i) => `${x(i)},${y(d[key])}`).join(" ");

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>
            Evolução de Negociações
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
            Abertas × ganhas por dia
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs" style={{ color: "#6B7280" }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: OPENED_COLOR }} />
            Abertas
          </span>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: "#6B7280" }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: WON_COLOR }} />
            Ganhas
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          width="100%"
          viewBox={`0 0 ${width} ${HEIGHT + 40}`}
          preserveAspectRatio="none"
          className="w-full"
          style={{ minHeight: `${HEIGHT + 40}px` }}
        >
          {/* Linhas-guia horizontais */}
          {[0.25, 0.5, 0.75, 1].map((f) => (
            <line
              key={f}
              x1={0}
              x2={width}
              y1={y(max * f)}
              y2={y(max * f)}
              stroke="#F1F5F9"
              strokeWidth={1}
            />
          ))}

          {/* Série: abertas */}
          <polyline
            points={linePoints("opened")}
            fill="none"
            stroke={OPENED_COLOR}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Série: ganhas */}
          <polyline
            points={linePoints("won")}
            fill="none"
            stroke={WON_COLOR}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* Pontos + labels do eixo X */}
          {data.map((d, i) => (
            <g key={d.date}>
              <circle cx={x(i)} cy={y(d.opened)} r={3} fill={OPENED_COLOR}>
                <title>{`${formatDate(d.date)} — abertas: ${d.opened}`}</title>
              </circle>
              <circle cx={x(i)} cy={y(d.won)} r={3} fill={WON_COLOR}>
                <title>{`${formatDate(d.date)} — ganhas: ${d.won}`}</title>
              </circle>
              {i % labelStep === 0 && (
                <text
                  x={x(i)}
                  y={HEIGHT + 24}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#9CA3AF"
                >
                  {formatDate(d.date)}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
