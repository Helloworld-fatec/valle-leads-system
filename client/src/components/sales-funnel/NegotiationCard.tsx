// src/components/sales-funnel/NegotiationCard.tsx
import { useState } from "react";
import { 
  Flame, 
  Thermometer, 
  Snowflake, 
  Car, 
  GripVertical, 
  ArrowRight 
} from "lucide-react";
import type { Negotiation, ImportanceLevel } from "../../types/negotiations";
import NegotiationModal from "./NegotiationModal";

const importanceConfig: Record<ImportanceLevel, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  quente: { icon: <Flame size={12} className="animate-pulse" />, color: "#DC2626", bg: "#FEE2E2", label: "Quente" },
  morno:  { icon: <Thermometer size={12} />, color: "#D97706", bg: "#FEF3C7", label: "Morno"  },
  frio:   { icon: <Snowflake size={12} />,   color: "#2563EB", bg: "#DBEAFE", label: "Frio"   },
};

const avatarGradients = [
  "linear-gradient(135deg,#6366F1,#8B5CF6)",
  "linear-gradient(135deg,#3B82F6,#06B6D4)",
  "linear-gradient(135deg,#F97316,#EF4444)",
  "linear-gradient(135deg,#10B981,#0EA5E9)",
  "linear-gradient(135deg,#EC4899,#8B5CF6)",
];

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

interface Props {
  negotiation: Negotiation;
  color: string;
  onAdvance?: () => void;
  onChangeImportance?: (id: string, level: ImportanceLevel) => void;
}

export default function NegotiationCard({ 
  negotiation, 
  color, 
  onAdvance, 
  onChangeImportance 
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showImportanceMenu, setShowImportanceMenu] = useState(false);

  const clientName = negotiation.lead?.customers?.name ?? "—";
  const vehicle = negotiation.lead?.vehicle_interest || "Sem descrição do interesse";

  const importanceHistory = negotiation.importance_history ?? [];
  const rawImportance: ImportanceLevel =
    (importanceHistory[importanceHistory.length - 1]?.importance as ImportanceLevel) ?? "morno";
  const imp = importanceConfig[rawImportance];

  const idx = negotiation.id.charCodeAt(0) % avatarGradients.length;

  // Handlers para o Drag and Drop Nativo
  function handleDragStart(e: React.DragEvent) {
    setIsDragging(true);
    e.dataTransfer.setData("application/json", negotiation.id);
    e.dataTransfer.effectAllowed = "move";
    
    // Cria um efeito visual limpo reduzindo ligeiramente a opacidade do elemento original
    setTimeout(() => {
      const element = document.getElementById(`card-${negotiation.id}`);
      if (element) element.style.opacity = "0.4";
    }, 0);
  }

  function handleDragEnd(e: React.DragEvent) {
    setIsDragging(false);
    const element = document.getElementById(`card-${negotiation.id}`);
    if (element) element.style.opacity = "1";
  }

  return (
    <>
      <div
        id={`card-${negotiation.id}`}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`relative bg-white rounded-xl transition-all duration-200 group border border-slate-200/80 cursor-grab active:cursor-grabbing select-none hover:border-slate-300 hover:shadow-md ${
          isDragging ? "shadow-sm border-blue-200 bg-slate-50/50" : "shadow-sm"
        }`}
      >
        {/* Indicador lateral sutil da Etapa Atual */}
        <div 
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl opacity-80 transition-all group-hover:w-1.5" 
          style={{ backgroundColor: color }} 
        />

        <div className="p-3.5 pl-4 flex flex-col gap-3">
          {/* Top Bar: Grip, Avatar, Título e Ações */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="text-slate-300 group-hover:text-slate-400 transition-colors p-0.5 -ml-1 rounded">
                <GripVertical size={14} />
              </div>

              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-inner shrink-0"
                style={{ background: avatarGradients[idx] }}
              >
                {initials(clientName)}
              </div>
              
              <div className="flex flex-col min-w-0">
                <h4 
                  onClick={() => setModalOpen(true)}
                  className="text-sm font-semibold text-slate-800 line-clamp-1 hover:text-blue-600 transition-colors cursor-pointer"
                  title={clientName}
                >
                  {clientName}
                </h4>
              </div>
            </div>
          </div>

          {/* Descrição e Info Intermediária */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md min-w-0 flex-1 border border-slate-100">
              <Car size={13} className="text-slate-400 shrink-0" />
              <span className="truncate" title={vehicle}>{vehicle}</span>
            </div>

            {/* Badge de Prioridade com seletor rápido */}
            <div className="relative shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowImportanceMenu(!showImportanceMenu);
                }}
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md border transition-all hover:brightness-95"
                style={{ background: imp.bg, color: imp.color, borderColor: `${imp.color}25` }}
                title="Alterar importância do Lead"
              >
                {imp.icon}
                <span>{imp.label}</span>
              </button>

              {/* Dropdown de Importância Rápida */}
              {showImportanceMenu && (
                <div 
                  className="absolute right-0 bottom-full mb-1 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-50 w-24 flex flex-col gap-0.5"
                  onMouseLeave={() => setShowImportanceMenu(false)}
                >
                  {(Object.keys(importanceConfig) as ImportanceLevel[]).map((level) => (
                    <button
                      key={level}
                      onClick={() => {
                        if (onChangeImportance) onChangeImportance(negotiation.id, level);
                        setShowImportanceMenu(false);
                      }}
                      className="px-2 py-1 text-left text-xs font-medium hover:bg-slate-50 flex items-center gap-1"
                      style={{ color: importanceConfig[level].color }}
                    >
                      {importanceConfig[level].icon}
                      {importanceConfig[level].label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botão de Avanço Rápido Unificado */}
          {onAdvance && (
            <div className="flex justify-end border-t border-slate-100/70 pt-2 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAdvance();
                }}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-blue-600 transition-colors"
                title="Avançar etapa"
              >
                <span>Avançar</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}
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