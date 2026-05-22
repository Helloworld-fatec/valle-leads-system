// src/components/dashboards/manager/ManagerDateFilter.tsx
import type { DashboardFilters } from "../../../services/dashboardService";

interface ManagerDateFilterProps {
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
  loading: boolean;
}

type Preset = { label: string; days: number };

const PRESETS: Preset[] = [
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
  { label: "90 dias", days: 90 },
];

function toISO(date: Date): string {
  return date.toISOString();
}

function getPresetDates(days: number): DashboardFilters {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { startDate: toISO(start), endDate: toISO(end) };
}

function toInputValue(iso?: string): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function fromInputValue(val: string, endOfDay = false): string {
  if (!val) return "";
  const d = new Date(val);
  if (endOfDay) {
    d.setHours(23, 59, 59, 999);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  return d.toISOString();
}

export default function ManagerDateFilter({ filters, onChange, loading }: ManagerDateFilterProps) {
  function handlePreset(days: number) {
    onChange(getPresetDates(days));
  }

  function handleStartDate(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...filters, startDate: fromInputValue(e.target.value, false) || undefined });
  }

  function handleEndDate(e: React.ChangeEvent<HTMLInputElement>) {
    onChange({ ...filters, endDate: fromInputValue(e.target.value, true) || undefined });
  }

  function handleClear() {
    onChange({});
  }

  return (
    <div
      className="rounded-xl px-4 py-3 border flex flex-wrap items-center gap-3"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      {/* Presets */}
      <div className="flex gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.days}
            onClick={() => handlePreset(p.days)}
            disabled={loading}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors"
            style={{
              borderColor: "#E5E7EB",
              background: "#F9FAFB",
              color: "#374151",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="w-px h-5 shrink-0" style={{ background: "#E5E7EB" }} />

      {/* Custom range */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs" style={{ color: "#6B7280" }}>
          De
        </span>
        <input
          type="date"
          value={toInputValue(filters.startDate)}
          onChange={handleStartDate}
          disabled={loading}
          className="text-xs px-2 py-1.5 rounded-lg border outline-none"
          style={{ borderColor: "#E5E7EB", color: "#111827", background: "#F9FAFB" }}
        />
        <span className="text-xs" style={{ color: "#6B7280" }}>
          até
        </span>
        <input
          type="date"
          value={toInputValue(filters.endDate)}
          onChange={handleEndDate}
          disabled={loading}
          className="text-xs px-2 py-1.5 rounded-lg border outline-none"
          style={{ borderColor: "#E5E7EB", color: "#111827", background: "#F9FAFB" }}
        />
      </div>

      {/* Clear */}
      {(filters.startDate || filters.endDate) && (
        <button
          onClick={handleClear}
          disabled={loading}
          className="text-xs px-2 py-1.5 rounded-lg transition-colors ml-auto"
          style={{ color: "#EF4444", background: "#FEF2F2" }}
        >
          Limpar
        </button>
      )}
    </div>
  );
}
