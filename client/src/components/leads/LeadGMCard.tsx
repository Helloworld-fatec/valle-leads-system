// src/components/leads/LeadGMCard.tsx
import { Lead } from "../../services/leadService";

interface LeadGMCardProps {
  lead: Lead;
  selected: boolean;
  onSelect: (id: string) => void;
  onAssign: (lead: Lead) => void;
}

export default function LeadGMCard({ lead, selected, onSelect, onAssign }: LeadGMCardProps) {
  const semEquipe = !lead.team_id;

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border p-5 flex flex-col gap-3 transition-all ${
        semEquipe ? "border-yellow-400 bg-yellow-50" : "border-gray-100"
      } ${selected ? "ring-2 ring-purple-400" : ""}`}
    >
      {/* Checkbox + Nome */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(lead.id)}
          className="mt-1 accent-purple-600 w-4 h-4"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-gray-900">{lead.name}</h3>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                semEquipe
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {semEquipe ? "Sem equipe" : lead.team_name ?? "Com equipe"}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{lead.phone}</p>
        </div>
      </div>

      {/* Infos */}
      <div className="flex flex-col gap-1 text-sm text-gray-500">
        {lead.store_name && <span>🏬 {lead.store_name}</span>}
        <span>📌 Status: {lead.status}</span>
      </div>

      {/* Botão atribuir */}
      <button
        onClick={() => onAssign(lead)}
        className="text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl py-2 transition-colors"
      >
        Atribuir equipe
      </button>
    </div>
  );
}