// src/components/dashboards/manager/ManagerLeadsByAttendantChart.tsx
import type { LeadsByAttendantResponse } from "../../../services/dashboardService";

interface Props {
  data: LeadsByAttendantResponse | null;
  loading: boolean;
}

const BAR_COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#F59E0B",
  "#F97316",
  "#10B981",
  "#EF4444",
  "#06B6D4",
  "#EC4899",
];

export default function ManagerLeadsByAttendantChart({ data, loading }: Props) {
  const items = data?.leadsByAttendant ?? [];
  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <div
      className="rounded-xl p-5 shadow-sm border h-full"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>
            Leads por Atendente
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
            Volume captado no período
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-24 h-4 rounded animate-pulse" style={{ background: "#F1F5F9" }} />
              <div className="flex-1 h-7 rounded-lg animate-pulse" style={{ background: "#F1F5F9" }} />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-sm" style={{ color: "#9CA3AF" }}>Sem dados para exibir</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {items.map((item, idx) => {
            const pct = Math.round((item.count / max) * 100);
            const color = BAR_COLORS[idx % BAR_COLORS.length];
            const firstName = item.attendantName.split(" ")[0];
            return (
              <div key={item.attendantId} className="flex items-center gap-3">
                <span
                  className="text-xs font-medium w-24 shrink-0 truncate text-right"
                  title={item.attendantName}
                  style={{ color: "#6B7280" }}
                >
                  {firstName}
                </span>
                <div
                  className="flex-1 h-7 rounded-lg overflow-hidden"
                  style={{ background: "#F1F5F9" }}
                >
                  <div
                    className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                    style={{ width: `${pct}%`, background: color, minWidth: "2rem" }}
                  >
                    <span className="text-white text-xs font-semibold">{item.count}</span>
                  </div>
                </div>
                <span
                  className="text-xs font-semibold w-10 text-right"
                  style={{ color: "#111827" }}
                >
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
