import { useDroppable } from "@dnd-kit/core";
import NegotiationCard from "../sales-funnel/NegotiationCard";
import type { Negotiation, NegotiationStage } from "../../services/negotiationsService";

interface Props {
  stageKey: NegotiationStage;
  label: string;
  color: string;
  bg: string;
  negotiations: Negotiation[];
  isClosed?: boolean;
}

export default function KanbanColumn({
  stageKey,
  label,
  color,
  bg,
  negotiations,
  isClosed = false,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: stageKey });

  return (
    <div
      ref={isClosed ? undefined : setNodeRef} // colunas de fechamento não aceitam drop
      className="flex flex-col rounded-xl border transition-colors"
      style={{
        minWidth: 260,
        width: 260,
        background: isOver && !isClosed ? bg : "#FFFFFF",
        borderColor: isOver && !isClosed ? color : "#E5E7EB",
      }}
    >
      {/* Cabeçalho */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-t-xl"
        style={{ background: bg }}
      >
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ background: color }}
          />
          <span className="text-sm font-semibold" style={{ color }}>
            {label}
          </span>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ background: color + "20", color }}
        >
          {negotiations.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-2 p-3 min-h-30">
        {negotiations.length === 0 ? (
          <p className="text-xs text-center text-gray-400 mt-6">
            Nenhuma negociação
          </p>
        ) : (
          negotiations.map((neg) => (
            <NegotiationCard
              key={neg.id}
              negotiation={neg}
              color={color}
              isDragging={false}
            />
          ))
        )}
      </div>
    </div>
  );
}