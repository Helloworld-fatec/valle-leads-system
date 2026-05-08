import { MapPin, Car, User } from "lucide-react";
import type { Lead } from "../../services/leadService";

// ─────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────

const statusConfig = {
  OPEN:        { bg: "#EFF6FF", text: "#2563EB", label: "Aberto" },
  IN_PROGRESS: { bg: "#F5F3FF", text: "#7C3AED", label: "Em Progresso" },
  CLOSED_WON:  { bg: "#ECFDF5", text: "#059669", label: "Ganho" },
  CLOSED_LOST: { bg: "#FEF2F2", text: "#DC2626", label: "Perdido" },
};

const sourceIcons: Record<string, string> = {
  whatsapp:  "💬",
  instagram: "📸",
  site:      "🌐",
  indicacao: "👤",
  google:    "🔍",
  telefone:  "📞",
};

const avatarColors = [
  "#2563EB", "#8B5CF6", "#F97316",
  "#10B981", "#EF4444", "#F59E0B", "#06B6D4",
];

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ─────────────────────────────────────────────
// SKELETON — exibido durante o loading
// ─────────────────────────────────────────────

export function LeadCardSkeleton() {
  return (
    <div className="rounded-xl p-4 border animate-pulse"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3.5 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
        <div className="h-5 w-20 bg-gray-200 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
  // showAttendant: true na visão do gerente
  showAttendant?: boolean;
  // showCheckbox: true quando BulkAssignToolbar está ativo
  showCheckbox?: boolean;
  checked?: boolean;
  onCheckChange?: (id: string, checked: boolean) => void;
}

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────

export default function LeadCard({
  lead,
  onClick,
  showAttendant = false,
  showCheckbox = false,
  checked = false,
  onCheckChange,
}: LeadCardProps) {
  const status = statusConfig[lead.status] ?? {
    bg: "#F1F5F9", text: "#6B7280", label: lead.status,
  };

  const sourceKey = (lead.source ?? "").toLowerCase();
  const sourceIcon = sourceIcons[sourceKey] ?? "📌";

  const customerName = lead.customers?.name ?? "Cliente não informado";
  const colorIdx = lead.id.charCodeAt(0) % avatarColors.length;

  return (
    <div
      className="rounded-xl p-4 border shadow-sm cursor-pointer transition-all 
                 hover:shadow-md hover:-translate-y-0.5 group relative"
      style={{ background: "#FFFFFF", borderColor: "#E5E7EB" }}
      onClick={() => onClick(lead)}
    >
      {/* Checkbox — visível só na visão do gerente */}
      {showCheckbox && (
        <div
          className="absolute top-3 right-3"
          onClick={(e) => e.stopPropagation()} // evita abrir modal ao clicar
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckChange?.(lead.id, e.target.checked)}
            className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
          />
        </div>
      )}

      {/* Topo: avatar + nome + status */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center 
                     text-white text-xs font-bold flex-shrink-0"
          style={{ background: avatarColors[colorIdx] }}
        >
          {initials(customerName)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "#111827" }}>
            {customerName}
          </p>
          {/* Status badge */}
          <span
            className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: status.bg, color: status.text }}
          >
            {status.label}
          </span>
        </div>
      </div>

      {/* Origem */}
      <div className="flex items-center gap-1.5 text-xs mb-1.5"
        style={{ color: "#6B7280" }}>
        <MapPin size={11} />
        <span>{sourceIcon} {lead.source ?? "Origem não informada"}</span>
      </div>

      {/* Veículo de interesse */}
      <div className="flex items-center gap-1.5 text-xs"
        style={{ color: "#6B7280" }}>
        <Car size={11} />
        <span className="truncate">
          {lead.vehicle_interest ?? "Veículo não informado"}
        </span>
      </div>

      {/* Atendente — só na visão do gerente */}
      {showAttendant && (
        <div
          className="flex items-center gap-1.5 text-xs mt-2 pt-2 border-t"
          style={{ color: "#6B7280", borderColor: "#F1F5F9" }}
        >
          <User size={11} />
          <span>
            {lead.attendant?.name ?? "Não atribuído"}
          </span>
        </div>
      )}
    </div>
  );
}