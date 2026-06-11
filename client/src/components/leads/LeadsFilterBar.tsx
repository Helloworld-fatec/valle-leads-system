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

const stages = ["Todos", "new", "open", "won", "lost"];

const sources = [
  "Todos",
  "Instagram",
  "WhatsApp",
  "Facebook",
  "Indicação",
  "Loja Física",
  "Mercado Livre",
  "Site",
  "Google",
  "Telefone",
];

const stageLabels: Record<string, string> = {
  new: "Novo",
  open: "Em andamento",
  won: "Ganho",
  lost: "Perdido",
};

export default function LeadsFilterBar({
  search,
  onSearch,
  stage,
  onStage,
  source,
  onSource,
  onClear,
}: Props) {
  const hasFilters = stage !== "Todos" || source !== "Todos" || search !== "";

  return (
    <div className="rounded-xl border border-gray-100 bg-white px-4 py-3.5 mb-4 flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-50">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Nome, e-mail, CPF ou produto..."
          className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200
                     bg-gray-50 text-gray-900 placeholder-gray-400
                     focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300
                     transition-colors"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <SlidersHorizontal size={13} className="text-gray-400 shrink-0" />

        <select
          value={stage}
          onChange={(e) => onStage(e.target.value)}
          className="text-sm py-2 pl-3 pr-7 rounded-lg border border-gray-200 bg-gray-50
                     text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100
                     focus:border-blue-300 cursor-pointer appearance-none transition-colors"
        >
          {stages.map((stageValue) => (
            <option key={stageValue} value={stageValue}>
              {stageValue === "Todos"
                ? "Etapa: Todas"
                : stageLabels[stageValue] ?? stageValue}
            </option>
          ))}
        </select>
      </div>

      <select
        value={source}
        onChange={(e) => onSource(e.target.value)}
        className="text-sm py-2 pl-3 pr-7 rounded-lg border border-gray-200 bg-gray-50
                   text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100
                   focus:border-blue-300 cursor-pointer appearance-none transition-colors"
      >
        {sources.map((sourceValue) => (
          <option key={sourceValue} value={sourceValue}>
            {sourceValue === "Todos" ? "Origem: Todas" : sourceValue}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg
                     border border-red-200 text-red-500 bg-white
                     hover:bg-red-50 transition-colors"
        >
          <X size={12} />
          Limpar
        </button>
      )}
    </div>
  );
}