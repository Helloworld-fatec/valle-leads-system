// src/components/dashboards/general-manager/DashboardFilterBar.tsx
import type { DashboardFilters } from "../../../services/dashboardService";

interface Props {
  filters: DashboardFilters;
  onChange: (f: DashboardFilters) => void;
  onApply: () => void;
  loading: boolean;
}

export default function DashboardFilterBar({ filters, onChange, onApply, loading }: Props) {
  return (
    <div
      className="flex flex-col sm:flex-row items-start sm:items-end gap-3 rounded-2xl px-5 py-4 border shadow-sm"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
          Data inicial
        </label>
        <input
          type="date"
          className="rounded-xl border px-3 py-2 text-sm outline-none transition-all focus:ring-2"
          style={{
            borderColor: "#E5E7EB",
            color: "#111827",
            background: "#F9FAFB",
          }}
          value={filters.startDate ? filters.startDate.slice(0, 10) : ""}
          onChange={(e) =>
            onChange({
              ...filters,
              startDate: e.target.value ? `${e.target.value}T00:00:00Z` : undefined,
            })
          }
        />
      </div>

      <div className="flex flex-col gap-1 flex-1 min-w-0">
        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
          Data final
        </label>
        <input
          type="date"
          className="rounded-xl border px-3 py-2 text-sm outline-none transition-all focus:ring-2"
          style={{
            borderColor: "#E5E7EB",
            color: "#111827",
            background: "#F9FAFB",
          }}
          value={filters.endDate ? filters.endDate.slice(0, 10) : ""}
          onChange={(e) =>
            onChange({
              ...filters,
              endDate: e.target.value ? `${e.target.value}T23:59:59Z` : undefined,
            })
          }
        />
      </div>

      <button
        onClick={onApply}
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ background: "#2563EB", color: "#FFFFFF" }}
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Carregando...
          </>
        ) : (
          <>🔍 Aplicar</>
        )}
      </button>

      {(filters.startDate || filters.endDate) && (
        <button
          onClick={() => onChange({})}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-gray-100 disabled:opacity-60"
          style={{ color: "#6B7280" }}
        >
          Limpar
        </button>
      )}
    </div>
  );
}
