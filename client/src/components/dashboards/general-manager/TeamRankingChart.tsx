// src/components/dashboards/general-manager/TeamRankingChart.tsx
import type { TeamRankingResponse } from "../../../services/dashboardService";

interface Props {
  data: TeamRankingResponse | null;
  loading: boolean;
}

const MEDALS = ["🥇", "🥈", "🥉"];
const ROW_COLORS = ["#FEF3C7", "#F3F4F6", "#FEF3C7"];
const RANK_ACCENTS = ["#F59E0B", "#9CA3AF", "#CD7F32"];

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <div className="w-6 h-6 rounded-full animate-pulse" style={{ background: "#F1F5F9" }} />
      <div className="flex-1 h-4 rounded animate-pulse" style={{ background: "#F1F5F9" }} />
      <div className="w-16 h-4 rounded animate-pulse" style={{ background: "#F1F5F9" }} />
    </div>
  );
}

export default function TeamRankingChart({ data, loading }: Props) {
  const items = data?.teamRanking ?? [];

  return (
    <div
      className="rounded-2xl shadow-sm border overflow-hidden"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      {/* Header */}
      <div className="px-6 py-5 border-b" style={{ borderColor: "#F3F4F6" }}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>
              Ranking de Equipes
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
              Ordenado por conversões
            </p>
          </div>
          <span
            className="text-xs px-2 py-1 rounded-full font-medium"
            style={{ background: "#F5F3FF", color: "#7C3AED" }}
          >
            Top {items.length || "—"}
          </span>
        </div>
      </div>

      {/* Table header */}
      <div
        className="grid grid-cols-12 px-4 py-2 text-xs font-semibold uppercase tracking-wider"
        style={{ color: "#9CA3AF", background: "#FAFAFA" }}
      >
        <span className="col-span-1 text-center">#</span>
        <span className="col-span-7 pl-3">Equipe</span>
        <span className="col-span-4 text-right">Conversões</span>
      </div>

      {/* Rows */}
      <div className="divide-y" style={{ borderColor: "#F3F4F6" }}>
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          : items.length === 0
          ? (
            <p className="text-sm text-center py-10" style={{ color: "#9CA3AF" }}>
              Nenhuma equipe encontrada
            </p>
          )
          : items.map((item, idx) => {
              const isTop3 = idx < 3;
              return (
                <div
                  key={item.teamId}
                  className="grid grid-cols-12 items-center px-4 py-3 transition-colors hover:bg-gray-50"
                  style={isTop3 ? { background: idx === 0 ? "#FFFBEB" : undefined } : undefined}
                >
                  {/* Rank */}
                  <div className="col-span-1 flex justify-center">
                    {isTop3 ? (
                      <span className="text-base">{MEDALS[idx]}</span>
                    ) : (
                      <span
                        className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ background: "#F1F5F9", color: "#6B7280" }}
                      >
                        {idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <span
                    className="col-span-7 pl-3 text-sm font-medium truncate"
                    style={{ color: isTop3 ? RANK_ACCENTS[idx] : "#374151" }}
                    title={item.teamName}
                  >
                    {item.teamName}
                  </span>

                  {/* Conversions */}
                  <div className="col-span-4 flex justify-end items-center gap-1">
                    <span
                      className="text-sm font-bold"
                      style={{ color: isTop3 ? RANK_ACCENTS[idx] : "#111827" }}
                    >
                      {item.conversions.toLocaleString("pt-BR")}
                    </span>
                    <span className="text-xs" style={{ color: "#9CA3AF" }}>
                      conv.
                    </span>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
