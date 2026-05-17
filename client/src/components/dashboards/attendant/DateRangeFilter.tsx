// src/components/dashboards/attendant/DateRangeFilter.tsx
import { useState } from "react";
import { DashboardFilters } from "../../../services/dashboardService";

interface DateRangeFilterProps {
  onFilterChange: (filters: DashboardFilters) => void;
  loading?: boolean;
}

const PRESETS = [
  { label: "Hoje", days: 0 },
  { label: "7 dias", days: 7 },
  { label: "30 dias", days: 30 },
  { label: "90 dias", days: 90 },
];

function toISO(date: Date) {
  return date.toISOString();
}

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function endOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(23, 59, 59, 999);
  return c;
}

export default function DateRangeFilter({ onFilterChange, loading }: DateRangeFilterProps) {
  const [activePreset, setActivePreset] = useState<number | null>(30);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  function applyPreset(days: number) {
    setActivePreset(days);
    setCustomStart("");
    setCustomEnd("");
    const now = new Date();
    if (days === 0) {
      onFilterChange({
        startDate: toISO(startOfDay(now)),
        endDate: toISO(endOfDay(now)),
      });
    } else {
      const start = new Date(now);
      start.setDate(start.getDate() - days);
      onFilterChange({
        startDate: toISO(startOfDay(start)),
        endDate: toISO(endOfDay(now)),
      });
    }
  }

  function applyCustom() {
    if (!customStart || !customEnd) return;
    setActivePreset(null);
    onFilterChange({
      startDate: toISO(startOfDay(new Date(customStart))),
      endDate: toISO(endOfDay(new Date(customEnd))),
    });
  }

  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 flex flex-wrap items-center gap-3">
      {/* Presets */}
      <div className="flex items-center gap-1 flex-wrap">
        {PRESETS.map((p) => (
          <button
            key={p.days}
            onClick={() => applyPreset(p.days)}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
            style={
              activePreset === p.days
                ? { background: "#2563EB", color: "#fff" }
                : { background: "#F3F4F6", color: "#374151" }
            }
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-gray-200 hidden sm:block" />

      {/* Custom range */}
      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="date"
          value={customStart}
          onChange={(e) => setCustomStart(e.target.value)}
          disabled={loading}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
          style={{ color: "#111827" }}
        />
        <span className="text-xs" style={{ color: "#9CA3AF" }}>até</span>
        <input
          type="date"
          value={customEnd}
          onChange={(e) => setCustomEnd(e.target.value)}
          disabled={loading}
          className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400"
          style={{ color: "#111827" }}
        />
        <button
          onClick={applyCustom}
          disabled={!customStart || !customEnd || loading}
          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 disabled:opacity-40"
          style={{ background: "#1E3A8A", color: "#fff" }}
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}
