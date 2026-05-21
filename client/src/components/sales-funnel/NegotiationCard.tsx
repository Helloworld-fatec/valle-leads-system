// src/components/sales-funnel/NegotiationCard.tsx
import { useDraggable } from "@dnd-kit/core";
import { useState } from "react";
import { Flame, Thermometer, Snowflake, Car } from "lucide-react";
import type { Negotiation, ImportanceLevel } from "../../types/negotiations";
import NegotiationModal from "./NegotiationModal";

const importanceConfig: Record<ImportanceLevel, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  quente: { icon: <Flame size={12} />,       color: "#EF4444", bg: "#FEF2F2", label: "Quente" },
  morno:  { icon: <Thermometer size={12} />, color: "#F59E0B", bg: "#FFFBEB", label: "Morno"  },
  frio:   { icon: <Snowflake size={12} />,   color: "#3B82F6", bg: "#EFF6FF", label: "Frio"   },
};

const STATUS_LABEL: Record<string, string> = {
  open:   "Aberta",
  closed: "Encerrada",
};

const avatarColors = ["#2563EB", "#8B5CF6", "#F97316", "#10B981", "#EF4444", "#F59E0B", "#06B6D4"];

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

  const clientName = negotiation.lead?.customers?.name ?? "—";

  // vehicle_interest agora existe na interface Negotiation.lead
  const vehicle = negotiation.lead?.vehicle_interest ?? "Não informado";

  // Status atual = último item do histórico
  const statusHistory  = negotiation.status_history ?? [];
  const lastStatus     = statusHistory[statusHistory.length - 1];
  const currentStatus  = lastStatus
    ? (STATUS_LABEL[lastStatus.status_negotiation] ?? lastStatus.status_negotiation)
    : "Sem status";

  // Importância atual = último item do histórico
  const importanceHistory = negotiation.importance_history ?? [];
  const rawImportance: ImportanceLevel =
    (importanceHistory[importanceHistory.length - 1]?.importance as ImportanceLevel) ?? "morno";
  const imp = importanceConfig[rawImportance];

  const idx = negotiation.id.charCodeAt(0) % avatarColors.length;

  return (
    <>
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        onClick={() => setModalOpen(true)}
        className={`rounded-xl p-4 border shadow-sm cursor-grab transition-all
          hover:shadow-md hover:-translate-y-0.5
          ${isDragging ? "opacity-50 rotate-1 shadow-lg" : ""}`}
        style={{ ...style, background: "#FFFFFF", borderColor: "#E5E7EB" }}
      >
        {/* Top: avatar + nome + importância */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: avatarColors[idx] }}
            >
              {initials(clientName)}
            </div>
            <div>
              <p className="text-sm font-semibold leading-none" style={{ color: "#111827" }}>
                {clientName}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                {currentStatus}
              </p>
            </div>
          </div>

          {/* Badge de importância */}
          <div
            className="flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full flex-shrink-0"
            style={{ background: imp.bg, color: imp.color }}
          >
            {imp.icon}
            <span>{imp.label}</span>
          </div>
        </div>

        {/* Veículo */}
        <div className="flex items-center gap-1.5 text-xs mb-3" style={{ color: "#6B7280" }}>
          <Car size={11} />
          <span className="truncate">{vehicle}</span>
        </div>

        {/* Footer */}
        <div
          className="pt-3 border-t flex items-center gap-1.5"
          style={{ borderColor: "#F1F5F9" }}
        >
          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          <span className="text-xs font-medium" style={{ color }}>
            {currentStatus}
          </span>
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