// src/components/dashboards/manager/ManagerWorkloadChart.tsx
// Carga de trabalho: negociações ATIVAS por atendente (snapshot).
// Mostra desequilíbrio de distribuição da carteira dentro da equipe.
// Substitui o antigo ManagerLeadsByAttendantChart.
import type { WorkloadByAttendantResponse } from "../../../services/dashboardService";

interface ManagerWorkloadChartProps {
  data: WorkloadByAttendantResponse | null;
  loading: boolean;
}

const BAR_COLOR = "#3B82F6";
const UNASSIGNED_COLOR = "#F59E0B";

export default function ManagerWorkloadChart({ data, loading }: ManagerWorkloadChartProps) {
  const rows = data?.workloadByAttendant ?? [];
  const max = rows.length > 0 ? Math.max(...rows.map((r) => r.active), 1) : 1;
  const total = rows.reduce((acc, r) => acc + r.active, 0);

  return (
    <div
      className="rounded-2xl p-5 shadow-sm border h-full"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>
            Carga de Trabalho
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
            Negociações ativas por atendente
          </p>
        </div>
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: "#EFF6FF", color: "#2563EB" }}
        >
          {total} ativas
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-7 rounded-lg animate-pulse" style={{ background: "#F1F5F9" }} />
          ))}
        </div>
      ) : rows.length === 0 || total === 0 ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-sm" style={{ color: "#9CA3AF" }}>
            Nenhuma negociação ativa
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => {
            const pct = Math.round((row.active / max) * 100);
            const isUnassigned = row.attendantId === null;
            return (
              <div key={row.attendantId ?? "none"} className="flex items-center gap-3">
                <span
                  className="text-xs font-medium w-28 shrink-0 text-right truncate"
                  style={{ color: isUnassigned ? "#D97706" : "#6B7280" }}
                  title={row.attendantName}
                >
                  {row.attendantName}
                </span>
                <div
                  className="flex-1 h-6 rounded-lg overflow-hidden"
                  style={{ background: "#F1F5F9" }}
                >
                  <div
                    className="h-full rounded-lg flex items-center px-2.5 transition-all duration-700"
                    style={{
                      width: `${Math.max(pct, 8)}%`,
                      background: isUnassigned ? UNASSIGNED_COLOR : BAR_COLOR,
                    }}
                  >
                    <span className="text-white text-xs font-semibold">{row.active}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
