// src/components/leads/LeadGMCard.tsx
import type { Lead } from "../../services/leadService";

interface LeadGMCardProps {
  lead: Lead;
  selected: boolean;
  onSelect: (id: string) => void;
  onAssign: (lead: Lead) => void;
}

export default function LeadGMCard({ lead, selected, onSelect, onAssign }: LeadGMCardProps) {
  const semEquipe = !lead.team_id;
  const customerName = lead.customers?.name ?? "Cliente não informado";
  const customerPhone = lead.customers?.phone ?? "Telefone não informado";
  const teamName = lead.teams?.name ?? "Com equipe";

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border p-5 flex flex-col gap-3 transition-all ${
        semEquipe ? "border-yellow-400 bg-yellow-50" : "border-gray-100"
      } ${selected ? "ring-2 ring-purple-400" : ""}`}
    >
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(lead.id)}
          className="mt-1 accent-purple-600 w-4 h-4"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-gray-900">{customerName}</h3>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                semEquipe
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {semEquipe ? "Sem equipe" : teamName}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{customerPhone}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1 text-sm text-gray-500">
        {lead.teams?.store_id && <span>🏬 Loja: {lead.teams.store_id}</span>}
        <span>📌 Status: {lead.status}</span>
      </div>

      <button
        onClick={() => onAssign(lead)}
        className="text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl py-2 transition-colors"
      >
        Atribuir equipe
      </button>
    </div>
  );
}
