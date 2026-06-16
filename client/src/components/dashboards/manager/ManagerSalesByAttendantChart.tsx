// src/components/dashboards/manager/ManagerSalesByAttendantChart.tsx
// Ranking de VENDAS por atendente (eventos 'won' na janela).
// Substitui o antigo ManagerConversionsByAttendantChart.
import type { SalesByAttendantResponse } from "../../../services/dashboardService";

interface ManagerSalesByAttendantChartProps {
  data: SalesByAttendantResponse | null;
  loading: boolean;
}

const MEDAL_COLORS = ["#F59E0B", "#94A3B8", "#B45309"]; // ouro, prata, bronze
const BAR_COLOR = "#10B981";

export default function ManagerSalesByAttendantChart({
  data,
  loading,
}: ManagerSalesByAttendantChartProps) {
  const rows = data?.salesByAttendant ?? [];
  const max = rows.length > 0 ? Math.max(...rows.map((r) => r.sales), 1) : 1;
  const total = rows.reduce((acc, r) => acc + r.sales, 0);

  return (
    <div
      className="rounded-2xl p-5 shadow-sm border h-full"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>
            Ranking de Vendas
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
            Por atendente, no período
          </p>
        </div>
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: "#F0FDF4", color: "#16A34A" }}
        >
          {total} vendas
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
            Nenhuma venda no período
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row, i) => {
            const pct = Math.round((row.sales / max) * 100);
            return (
              <div key={row.attendantId ?? "none"} className="flex items-center gap-3">
                <span
                  className="w-5 shrink-0 text-center text-xs font-bold"
                  style={{ color: MEDAL_COLORS[i] ?? "#CBD5E1" }}
                >
                  {i + 1}º
                </span>
                <span
                  className="text-xs font-medium w-28 shrink-0 truncate"
                  style={{ color: "#374151" }}
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
                    style={{ width: `${Math.max(pct, 8)}%`, background: BAR_COLOR }}
                  >
                    <span className="text-white text-xs font-semibold">{row.sales}</span>
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
