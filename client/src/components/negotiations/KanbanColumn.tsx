import { useDroppable } from "@dnd-kit/core";
import NegotiationCard from "../sales-funnel/NegotiationCard";
import LeadCard, { Lead } from "./LeadCard";
import type { Negotiation, NegotiationStage } from "../../services/negotiationsService";

interface Props {
  stageKey: NegotiationStage;
  label: string;
  color: string;
  bg: string;
  negotiations?: Negotiation[];
  leads?: Lead[];
  isClosed?: boolean;
}

export default function KanbanColumn({
  stageKey,
  label,
  color,
  bg,
  negotiations = [],
  leads = [],
  isClosed = false,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: stageKey });

  const totalItems = negotiations.length + leads.length;

  return (
    <div
      ref={isClosed ? undefined : setNodeRef}
      className="flex flex-col rounded-2xl transition-all duration-200"
      style={{
        minWidth: 272,
        width: 272,
        background: isOver && !isClosed ? bg : "#F8FAFC",
        border: `1.5px solid ${isOver && !isClosed ? color : "#E2E8F0"}`,
        boxShadow: isOver && !isClosed
          ? `0 0 0 3px ${color}22, 0 4px 16px 0 ${color}18`
          : "0 1px 4px 0 rgba(15,23,42,0.06)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3.5 rounded-t-2xl"
        style={{ background: bg, borderBottom: `1px solid ${color}30` }}
      >
        <div className="flex items-center gap-2.5">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
          />
          <span className="text-sm font-semibold tracking-tight" style={{ color }}>
            {label}
          </span>
          {isClosed && (
            <span
              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ background: `${color}18`, color }}
            >
              Final
            </span>
          )}
        </div>
        <span
          className="text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full"
          style={{ background: color, color: "#fff" }}
        >
          {totalItems}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2.5 p-3 min-h-32 flex-1">
        {totalItems === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-1.5 min-h-24 opacity-50">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: `${color}15` }}
            >
              <span style={{ color, fontSize: 16 }}>·</span>
            </div>
            <p className="text-xs text-slate-400">Nenhum lead</p>
          </div>
        ) : (
          <>
            {negotiations.map((neg) => (
              <NegotiationCard
                key={neg.id}
                negotiation={neg}
                color={color}
                isDragging={false}
              />
            ))}
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} color={color} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}