// src/components/dashboards/attendant/TemperatureChart.tsx
// Donut: temperatura (importância mais recente) das negociações ATIVAS.
// Snapshot da carteira — não muda com o filtro de período.
import {
  TemperatureItem,
  getTemperatureColor,
  getTemperatureLabel,
} from "../../../services/dashboardService";

interface TemperatureChartProps {
  data: TemperatureItem[];
  loading?: boolean;
}

/** Converte (fração inicial, fração final) em um path de arco de donut. */
function arcPath(cx: number, cy: number, r: number, from: number, to: number): string {
  const a0 = 2 * Math.PI * from - Math.PI / 2;
  const a1 = 2 * Math.PI * to - Math.PI / 2;
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const largeArc = to - from > 0.5 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${largeArc} 1 ${x1} ${y1}`;
}

export default function TemperatureChart({ data, loading }: TemperatureChartProps) {
  const total = data.reduce((acc, d) => acc + d.count, 0);

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="w-40 h-5 bg-gray-100 rounded mb-1" />
        <div className="w-24 h-4 bg-gray-100 rounded mb-6" />
        <div className="flex justify-center mb-4">
          <div className="w-36 h-36 rounded-full bg-gray-100" />
        </div>
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (!data.length || total === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[220px]">
        <p className="text-sm font-medium" style={{ color: "#6B7280" }}>
          Nenhuma negociação ativa
        </p>
      </div>
    );
  }

  // Fatias acumuladas
  let acc = 0;
  const slices = data.map((d) => {
    const from = acc / total;
    acc += d.count;
    const to = acc / total;
    return { ...d, from, to };
  });

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="mb-4">
        <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>
          Temperatura da Carteira
        </h3>
        <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
          Negociações ativas por importância
        </p>
      </div>

      <div className="flex justify-center mb-4">
        <svg width={150} height={150} viewBox="0 0 150 150">
          {slices.length === 1 ? (
            // Arco de 100% degenera no path — desenha círculo cheio
            <circle
              cx={75}
              cy={75}
              r={58}
              fill="none"
              stroke={getTemperatureColor(slices[0].importance)}
              strokeWidth={26}
            />
          ) : (
            slices.map((s) => (
              <path
                key={s.importance}
                d={arcPath(75, 75, 58, s.from, s.to)}
                fill="none"
                stroke={getTemperatureColor(s.importance)}
                strokeWidth={26}
              >
                <title>{`${getTemperatureLabel(s.importance)}: ${s.count}`}</title>
              </path>
            ))
          )}
          <text
            x={75}
            y={71}
            textAnchor="middle"
            fontSize={22}
            fontWeight={700}
            fill="#111827"
          >
            {total}
          </text>
          <text x={75} y={89} textAnchor="middle" fontSize={10} fill="#9CA3AF">
            ativas
          </text>
        </svg>
      </div>

      <div className="space-y-2">
        {data.map((d) => {
          const pct = Math.round((d.count / total) * 100);
          return (
            <div key={d.importance} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2" style={{ color: "#6B7280" }}>
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: getTemperatureColor(d.importance) }}
                />
                {getTemperatureLabel(d.importance)}
              </span>
              <span className="font-semibold" style={{ color: "#111827" }}>
                {d.count} <span className="font-normal" style={{ color: "#9CA3AF" }}>({pct}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
