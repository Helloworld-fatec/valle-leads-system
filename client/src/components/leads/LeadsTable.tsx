import { ChevronUp, ChevronDown, ChevronsUpDown, Eye, Pencil, Trash2 } from "lucide-react";

export type LeadRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  source: string;
  stage: string;
  value: string;
  rawValue: number;
  importance: "quente" | "morno" | "frio";
  attendant: string;
  createdAt: string;
};

const stageConfig: Record<string, { bg: string; text: string }> = {
  "Novo":           { bg: "#EFF6FF", text: "#2563EB" },
  "Contato Inicial":{ bg: "#F5F3FF", text: "#7C3AED" },
  "Qualificação":   { bg: "#FFFBEB", text: "#D97706" },
  "Proposta":       { bg: "#FFF7ED", text: "#EA580C" },
  "Negociação":     { bg: "#FEF2F2", text: "#DC2626" },
  "Fechamento":     { bg: "#ECFDF5", text: "#059669" },
};

const importanceConfig = {
  quente: { label: "🔥 Quente", bg: "#FEF2F2", text: "#DC2626" },
  morno:  { label: "🌡️ Morno",  bg: "#FFFBEB", text: "#D97706" },
  frio:   { label: "❄️ Frio",   bg: "#EFF6FF", text: "#2563EB" },
};

const sourceIcons: Record<string, string> = {
  "Indicação": "👤", "Site": "🌐", "WhatsApp": "💬", "Instagram": "📸", "Google": "🔍",
};

const avatarColors = ["#2563EB", "#8B5CF6", "#F97316", "#10B981", "#EF4444", "#F59E0B", "#06B6D4"];

function initials(name: string) {
  return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
}

type SortKey = keyof LeadRow | null;
type SortDir = "asc" | "desc";

type Props = {
  leads: LeadRow[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
};

function SortIcon({ col, sortKey, sortDir }: { col: string; sortKey: SortKey; sortDir: SortDir }) {
  if (sortKey !== col) return <ChevronsUpDown size={13} style={{ color: "#D1D5DB" }} />;
  return sortDir === "asc"
    ? <ChevronUp size={13} style={{ color: "#2563EB" }} />
    : <ChevronDown size={13} style={{ color: "#2563EB" }} />;
}

function Th({ label, col, sortKey, sortDir, onSort, className = "" }: {
  label: string; col: SortKey; sortKey: SortKey; sortDir: SortDir;
  onSort: (k: SortKey) => void; className?: string;
}) {
  return (
    <th
      className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide cursor-pointer select-none hover:bg-gray-50 transition-all ${className}`}
      style={{ color: "#6B7280" }}
      onClick={() => col && onSort(col)}
    >
      <div className="flex items-center gap-1">
        {label}
        {col && <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />}
      </div>
    </th>
  );
}

export default function LeadsTable({ leads, sortKey, sortDir, onSort }: Props) {
  if (leads.length === 0) {
    return (
      <div
        className="rounded-xl border flex flex-col items-center justify-center py-20"
        style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
      >
        <p className="text-4xl mb-3">🔍</p>
        <p className="font-semibold" style={{ color: "#374151" }}>Nenhum lead encontrado</p>
        <p className="text-sm mt-1" style={{ color: "#9CA3AF" }}>Tente ajustar os filtros</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-xl border shadow-sm overflow-hidden"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ borderBottom: "1px solid #F1F5F9", background: "#F8FAFC" }}>
              <Th label="Lead"        col="name"      sortKey={sortKey} sortDir={sortDir} onSort={onSort} className="min-w-[200px]" />
              <Th label="Contato"     col={null}      sortKey={sortKey} sortDir={sortDir} onSort={onSort} className="min-w-[200px]" />
              <Th label="CPF"         col="cpf"       sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <Th label="Origem"      col="source"    sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <Th label="Etapa"       col="stage"     sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <Th label="Valor Est."  col="rawValue"  sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <Th label="Prioridade" col="importance" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-right" style={{ color: "#6B7280" }}>
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: "#F1F5F9" }}>
            {leads.map((lead, i) => {
              const sc = stageConfig[lead.stage] ?? { bg: "#F1F5F9", text: "#6B7280" };
              const ic = importanceConfig[lead.importance];
              const av = avatarColors[i % avatarColors.length];

              return (
                <tr
                  key={lead.id}
                  className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                >
                  {/* Lead */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{ background: av }}
                      >
                        {initials(lead.name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "#111827" }}>{lead.name}</p>
                        <p className="text-xs" style={{ color: "#9CA3AF" }}>{lead.createdAt}</p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-4 py-3">
                    <p className="text-xs" style={{ color: "#374151" }}>{lead.email}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>{lead.phone}</p>
                  </td>

                  {/* CPF */}
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono" style={{ color: "#6B7280" }}>{lead.cpf}</span>
                  </td>

                  {/* Source */}
                  <td className="px-4 py-3">
                    <span className="text-sm" style={{ color: "#374151" }}>
                      {sourceIcons[lead.source] ?? "📌"} {lead.source}
                    </span>
                  </td>

                  {/* Stage */}
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
                      style={{ background: sc.bg, color: sc.text }}
                    >
                      {lead.stage}
                    </span>
                  </td>

                  {/* Value */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold" style={{ color: "#111827" }}>{lead.value}</span>
                  </td>

                  {/* Importance */}
                  <td className="px-4 py-3">
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full"
                      style={{ background: ic.bg, color: ic.text }}
                    >
                      {ic.label}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-blue-50 transition-all"
                        style={{ color: "#2563EB" }}
                        title="Ver detalhes"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-yellow-50 transition-all"
                        style={{ color: "#D97706" }}
                        title="Editar"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-all"
                        style={{ color: "#EF4444" }}
                        title="Excluir"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
