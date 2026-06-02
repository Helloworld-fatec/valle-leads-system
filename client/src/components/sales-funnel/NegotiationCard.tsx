// src/components/sales-funnel/NegotiationCard.tsx
import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";
import { Flame, Thermometer, Snowflake, Car, GripVertical } from "lucide-react";
import type { Negotiation, ImportanceLevel } from "../../types/negotiations";
import NegotiationModal from "./NegotiationModal";

const importanceConfig: Record<ImportanceLevel, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  quente: { icon: <Flame size={11} />,       color: "#EF4444", bg: "#FFF1F2", label: "Quente" },
  morno:  { icon: <Thermometer size={11} />, color: "#F59E0B", bg: "#FFFBEB", label: "Morno"  },
  frio:   { icon: <Snowflake size={11} />,   color: "#3B82F6", bg: "#EFF6FF", label: "Frio"   },
};

const STATUS_LABEL: Record<string, string> = {
  open:   "Aberta",
  closed: "Encerrada",
};

const avatarGradients = [
  "linear-gradient(135deg,#6366F1,#8B5CF6)",
  "linear-gradient(135deg,#3B82F6,#06B6D4)",
  "linear-gradient(135deg,#F97316,#EF4444)",
  "linear-gradient(135deg,#10B981,#0EA5E9)",
  "linear-gradient(135deg,#EC4899,#8B5CF6)",
  "linear-gradient(135deg,#F59E0B,#F97316)",
  "linear-gradient(135deg,#06B6D4,#3B82F6)",
];

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

interface Props {
  negotiation: Negotiation;
  color: string;
  isDragging?: boolean;
}

export default function NegotiationCard({ negotiation, color, isDragging = false }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: negotiation.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  const clientName    = negotiation.lead?.customers?.name ?? "—";
  const vehicle       = (negotiation.lead as any)?.vehicle_interest ?? "Não informado";

  const statusHistory = negotiation.status_history ?? [];
  const lastStatus    = statusHistory[statusHistory.length - 1];
  const currentStatus = lastStatus
    ? (STATUS_LABEL[lastStatus.status_negotiation] ?? lastStatus.status_negotiation)
    : "Sem status";

  const importanceHistory = negotiation.importance_history ?? [];
  const rawImportance: ImportanceLevel =
    (importanceHistory[importanceHistory.length - 1]?.importance as ImportanceLevel) ?? "morno";
  const imp = importanceConfig[rawImportance];

  const idx = negotiation.id.charCodeAt(0) % avatarGradients.length;

  return (
    <>
      <div
        ref={setNodeRef}
        style={{ ...style }}
        className={`rounded-xl transition-all duration-150 ${isDragging ? "opacity-60 rotate-1 scale-105" : ""}`}
      >
        <div
          className="p-3.5 rounded-xl cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
          style={{
            background: "#ffffff",
            border: "1px solid #E2E8F0",
            boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
          }}
          onClick={() => setModalOpen(true)}
        >
          {/* Drag handle + header */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex items-center gap-2.5">
              {/* Drag handle */}
              <div
                {...listeners}
                {...attributes}
                className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-400 transition-colors shrink-0 mt-0.5"
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical size={14} />
              </div>

              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                style={{ background: avatarGradients[idx] }}
              >
                {initials(clientName)}
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight text-slate-800">
                  {clientName}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{currentStatus}</p>
              </div>
            </div>

            {/* Importance badge */}
            <div
              className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg shrink-0"
              style={{ background: imp.bg, color: imp.color }}
            >
              {imp.icon}
              <span>{imp.label}</span>
            </div>
          </div>

          {/* Vehicle */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
            <Car size={11} className="shrink-0 opacity-60" />
            <span className="truncate">{vehicle}</span>
          </div>

          {/* Footer */}
          <div
            className="pt-2.5 border-t border-slate-100 flex items-center gap-1.5"
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: color }}
            />
            <span className="text-xs font-semibold" style={{ color }}>
              {currentStatus}
            </span>
          </div>
        </div>
      </div>

      {modalOpen && (
        <NegotiationModal
          negotiationId={negotiation.id}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}