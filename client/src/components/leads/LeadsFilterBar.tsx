import { Search, SlidersHorizontal, X } from "lucide-react";

type Props = {
  search: string;
  onSearch: (v: string) => void;
  stage: string;
  onStage: (v: string) => void;
  source: string;
  onSource: (v: string) => void;
  onClear: () => void;
};

const stages = ["Todos", "ABERTO", "EM_PROGRESSO", "CLOSED_WON", "CLOSED_LOST"];
const sources = ["Todos", "Indicação", "Site", "WhatsApp", "Instagram", "Google"];

const stageLabels: Record<string, string> = {
  "ABERTO": "Aberto",
  "EM_PROGRESSO": "Em Progresso",
  "CLOSED_WON": "Ganho",
  "CLOSED_LOST": "Perdido",
};

export default function LeadsFilterBar({
  search, onSearch,
  stage, onStage,
  source, onSource,
  onClear,
}: Props) {
  const hasFilters = stage !== "Todos" || source !== "Todos" || search !== "";

  return (
    <div
      className="rounded-xl border px-5 py-4 mb-5 flex flex-wrap items-center gap-3"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Buscar por nome, email, CPF..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border outline-none"
          style={{ background: "#F8FAFC", borderColor: "#E5E7EB", color: "#111827" }}
        />
      </div>

      {/* Stage filter */}
      <div className="flex items-center gap-1.5">
        <SlidersHorizontal size={14} style={{ color: "#9CA3AF" }} />
        <select
          value={stage}
          onChange={(e) => onStage(e.target.value)}
          className="text-sm py-2 pl-3 pr-7 rounded-lg border outline-none cursor-pointer appearance-none"
          style={{ background: "#F8FAFC", borderColor: "#E5E7EB", color: "#374151" }}
        >
          {stages.map(s => (
            <option key={s} value={s}>
              {s === "Todos" ? "Etapa: Todas" : stageLabels[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Source filter */}
      <select
        value={source}
        onChange={(e) => onSource(e.target.value)}
        className="text-sm py-2 pl-3 pr-7 rounded-lg border outline-none cursor-pointer appearance-none"
        style={{ background: "#F8FAFC", borderColor: "#E5E7EB", color: "#374151" }}
      >
        {sources.map(s => (
          <option key={s} value={s}>{s === "Todos" ? "Origem: Todas" : s}</option>
        ))}
      </select>

      {/* Clear */}
      {hasFilters && (
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-all hover:bg-red-50"
          style={{ color: "#EF4444", borderColor: "#FECACA" }}
        >
          <X size={13} />
          Limpar
        </button>
      )}
    </div>
  );
}