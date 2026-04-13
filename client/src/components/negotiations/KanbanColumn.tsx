import { MoreHorizontal } from "lucide-react";
import LeadCard, { Lead } from "./LeadCard";

type Props = {
  stage: string;
  color: string;
  bg: string;
  leads: Lead[];
};

export default function KanbanColumn({ stage, color, bg, leads }: Props) {
  const total = leads.reduce((acc, l) => acc + l.rawValue, 0);
  const formatted = total >= 1_000_000
    ? `R$ ${(total / 1_000_000).toFixed(1)}M`
    : `R$ ${(total / 1_000).toFixed(0)}K`;

  return (
    <div className="flex flex-col min-w-[260px] w-[260px]">
      {/* Column header */}
      <div
        className="rounded-xl px-4 py-3 mb-3 flex items-center justify-between"
        style={{ background: bg }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
          <span className="text-sm font-semibold" style={{ color: "#111827" }}>{stage}</span>
          <span
            className="text-xs font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: color, color: "#fff" }}
          >
            {leads.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: "#6B7280" }}>{formatted}</span>
          <button className="hover:bg-black/5 rounded p-0.5 transition-all" style={{ color: "#9CA3AF" }}>
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3 flex-1">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} color={color} />
        ))}

        {/* Drop zone hint */}
        <div
          className="rounded-xl border-2 border-dashed h-16 flex items-center justify-center text-xs transition-all hover:border-current cursor-pointer"
          style={{ borderColor: "#E5E7EB", color: "#D1D5DB" }}
        >
          + Soltar aqui
        </div>
      </div>
    </div>
  );
}
