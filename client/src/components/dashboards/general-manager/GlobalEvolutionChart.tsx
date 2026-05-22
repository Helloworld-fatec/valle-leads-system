// src/components/dashboards/general-manager/GlobalEvolutionChart.tsx
import { useMemo } from "react";
import type { GlobalEvolutionResponse } from "../../../services/dashboardService";

interface Props {
  data: GlobalEvolutionResponse | null;
  loading: boolean;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export default function GlobalEvolutionChart({ data, loading }: Props) {
  const points = data?.evolution ?? [];

  const { path, areaPath, viewBox, ticks, maxVal } = useMemo(() => {
    if (points.length === 0) return { path: "", areaPath: "", viewBox: "0 0 600 200", ticks: [], maxVal: 0 };

    const W = 560;
    const H = 160;
    const padL = 8;
    const padR = 8;
    const padT = 10;
    const padB = 10;

    const maxVal = Math.max(...points.map((p) => p.count), 1);
    const xs = points.map((_, i) => padL + (i / (points.length - 1)) * (W - padL - padR));
    const ys = points.map((p) => padT + (1 - p.count / maxVal) * (H - padT - padB));

    const pathD = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x} ${ys[i]}`).join(" ");
    const areaD =
      `M ${xs[0]} ${H - padB} ` +
      xs.map((x, i) => `L ${x} ${ys[i]}`).join(" ") +
      ` L ${xs[xs.length - 1]} ${H - padB} Z`;

    // Pick up to 6 tick labels evenly
    const step = Math.max(1, Math.floor(points.length / 5));
    const ticks = points
      .map((p, i) => ({ label: formatDate(p.date), x: xs[i], i }))
      .filter((_, i) => i % step === 0 || i === points.length - 1);

    return { path: pathD, areaPath: areaD, viewBox: `0 0 ${W} ${H}`, ticks, maxVal };
  }, [points]);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm border"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>
            Evolução Global de Leads
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
            Total de leads ao longo do período
          </p>
        </div>
        {!loading && points.length > 0 && (
          <span
            className="text-xs px-2 py-1 rounded-full font-medium"
            style={{ background: "#ECFDF5", color: "#059669" }}
          >
            {points.reduce((s, p) => s + p.count, 0).toLocaleString("pt-BR")} leads
          </span>
        )}
      </div>

      {loading ? (
        <div
          className="w-full h-48 rounded-xl animate-pulse"
          style={{ background: "#F1F5F9" }}
        />
      ) : points.length === 0 ? (
        <div className="w-full h-48 flex items-center justify-center">
          <p className="text-sm" style={{ color: "#9CA3AF" }}>
            Nenhum dado disponível
          </p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <svg
            viewBox={viewBox}
            className="w-full"
            style={{ minWidth: "260px", height: "auto", maxHeight: "220px" }}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="gmEvolutionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            {/* Area */}
            <path d={areaPath} fill="url(#gmEvolutionGrad)" />
            {/* Line */}
            <path
              d={path}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {/* Dots */}
            {points.map((p, i) => {
              const xs2 = 8 + (i / (points.length - 1)) * (560 - 16);
              const ys2 = 10 + (1 - p.count / maxVal) * 140;
              return (
                <circle key={i} cx={xs2} cy={ys2} r="3.5" fill="#3B82F6" stroke="#fff" strokeWidth="1.5" />
              );
            })}
          </svg>
          {/* X-axis labels */}
          <div className="flex justify-between mt-1 px-1">
            {ticks.map((t) => (
              <span key={t.i} className="text-xs" style={{ color: "#9CA3AF" }}>
                {t.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
