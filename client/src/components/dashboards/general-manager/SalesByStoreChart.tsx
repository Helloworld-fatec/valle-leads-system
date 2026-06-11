// src/components/dashboards/general-manager/SalesByStoreChart.tsx
// Vendas por LOJA na janela (Stores → Teams → Negotiations).
// Barra dimensionada pela contagem; valor em R$ ao lado de cada loja.
import type { SalesByStoreResponse } from "../../../services/dashboardService";
import { formatBRL, formatBRLCompact } from "../../../services/dashboardService";

interface Props {
  data: SalesByStoreResponse | null;
  loading: boolean;
}

const BAR_COLOR = "#8B5CF6";

export default function SalesByStoreChart({ data, loading }: Props) {
  const rows = data?.salesByStore ?? [];
  const max = rows.length > 0 ? Math.max(...rows.map((r) => r.sales), 1) : 1;
  const totalSales = rows.reduce((acc, r) => acc + r.sales, 0);
  const totalValue = rows.reduce((acc, r) => acc + r.salesValue, 0);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm border h-full"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>
            Vendas por Loja
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
            Quantidade e valor, no período
          </p>
        </div>
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: "#F5F3FF", color: "#7C3AED" }}
          title={formatBRL(totalValue)}
        >
          {totalSales} vendas · {formatBRLCompact(totalValue)}
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-7 rounded-lg animate-pulse" style={{ background: "#F1F5F9" }} />
          ))}
        </div>
      ) : rows.length === 0 || totalSales === 0 ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-sm" style={{ color: "#9CA3AF" }}>
            Nenhuma venda no período
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => {
            const pct = Math.round((row.sales / max) * 100);
            return (
              <div key={row.storeId} className="flex items-center gap-3">
                <span
                  className="text-xs font-medium w-28 shrink-0 text-right truncate"
                  style={{ color: "#6B7280" }}
                  title={row.storeName}
                >
                  {row.storeName}
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
                <span
                  className="text-xs font-semibold w-20 text-right shrink-0"
                  style={{ color: "#111827" }}
                  title={formatBRL(row.salesValue)}
                >
                  {formatBRLCompact(row.salesValue)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
