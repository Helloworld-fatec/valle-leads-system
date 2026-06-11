// src/components/dashboards/general-manager/GlobalFunnelChart.tsx
// Funil global: carteira ATIVA da empresa pelo estágio atual (snapshot).
// fechamento_com_venda / fechamento_sem_venda são filtrados — são estágios
// de transição, não resultados finais. O GM não tem endpoint de closing-rate
// global, portanto a seção "Resultados do período" não é exibida aqui.
import {
  getStageColor,
  getStageLabel,
  type GlobalStageFunnelResponse,
} from "../../../services/dashboardService";

const CLOSING_STAGES = new Set(["fechamento_com_venda", "fechamento_sem_venda"]);

interface Props {
  data: GlobalStageFunnelResponse | null;
  loading: boolean;
}

function SkeletonBar() {
  return (
    <div className="flex items-center gap-4">
      <div className="w-28 h-4 rounded animate-pulse" style={{ background: "#F1F5F9" }} />
      <div className="flex-1 h-7 rounded-lg animate-pulse" style={{ background: "#F1F5F9" }} />
      <div className="w-10 h-4 rounded animate-pulse" style={{ background: "#F1F5F9" }} />
    </div>
  );
}

export default function GlobalFunnelChart({ data, loading }: Props) {
  const allItems = data?.funnel ?? [];
  const items    = allItems.filter((i) => !CLOSING_STAGES.has(i.stage));
  const max      = items.length > 0 ? Math.max(...items.map((i) => i.count), 1) : 1;
  const total    = items.reduce((acc, i) => acc + i.count, 0);

  return (
    <div
      className="rounded-2xl p-6 shadow-sm border"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-semibold text-sm" style={{ color: "#111827" }}>
            Funil Global
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
            Carteira ativa por estágio — todas as equipes
          </p>
        </div>
        <span
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{ background: "#EFF6FF", color: "#2563EB" }}
        >
          {total} ativas
        </span>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonBar key={i} />)
        ) : items.length === 0 || total === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: "#9CA3AF" }}>
            Nenhuma negociação ativa
          </p>
        ) : (
          items.map((item) => {
            const pct   = Math.round((item.count / max) * 100);
            const color = getStageColor(item.stage);
            const label = getStageLabel(item.stage);
            return (
              <div key={item.stage} className="flex items-center gap-4">
                <span
                  className="text-xs font-medium w-28 shrink-0 text-right truncate"
                  style={{ color: "#6B7280" }}
                  title={label}
                >
                  {label}
                </span>
                <div
                  className="flex-1 h-7 rounded-lg overflow-hidden"
                  style={{ background: "#F1F5F9" }}
                >
                  {item.count > 0 && (
                    <div
                      className="h-full rounded-lg flex items-center px-3 transition-all duration-700"
                      style={{ width: `${Math.max(pct, 8)}%`, background: color }}
                    >
                      <span className="text-white text-xs font-semibold">{item.count}</span>
                    </div>
                  )}
                </div>
                <span
                  className="text-xs font-semibold w-10 text-right"
                  style={{ color: "#111827" }}
                >
                  {pct}%
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}