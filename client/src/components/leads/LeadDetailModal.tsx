import { X, User, Phone, Mail, CreditCard, MapPin, Car } from "lucide-react";
import type { Lead } from "../../services/leadService";
import OpenNegotiationButton from "./OpenNegotiationButton";

// ─────────────────────────────────────────────
// STATUS BADGE
// ─────────────────────────────────────────────

const statusConfig: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  novo: { bg: "#EFF6FF", text: "#2563EB", label: "Novo" },
  em_atendimento: { bg: "#F5F3FF", text: "#7C3AED", label: "Em Atendimento" },
  aguardando: { bg: "#FFFBEB", text: "#D97706", label: "Aguardando" },
  finalizado: { bg: "#ECFDF5", text: "#059669", label: "Finalizado" },
  perdido: { bg: "#FEF2F2", text: "#DC2626", label: "Perdido" },
};

// ─────────────────────────────────────────────
// SUB-COMPONENTE: linha de informação
// ─────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: "#F1F5F9", color: "#6B7280" }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs" style={{ color: "#9CA3AF" }}>
          {label}
        </p>
        <p className="text-sm font-medium mt-0.5" style={{ color: "#111827" }}>
          {value ?? "Não informado"}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PROPS
// ─────────────────────────────────────────────

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  onAssign?: () => void;
}

// ─────────────────────────────────────────────
// COMPONENTE
// ─────────────────────────────────────────────

export default function LeadDetailModal({
  lead,
  onClose,
  onAssign
}: LeadDetailModalProps) {
  const status = statusConfig[lead.status] ?? {
    bg: "#F1F5F9",
    text: "#6B7280",
    label: lead.status,
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose} // fecha ao clicar fora
    >
      {/* Modal */}
      <div
        className="w-full max-w-md rounded-2xl shadow-xl overflow-hidden"
        style={{ background: "#FFFFFF" }}
        onClick={(e) => e.stopPropagation()} // evita fechar ao clicar dentro
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: "#F1F5F9" }}
        >
          <div>
            <h2 className="text-base font-bold" style={{ color: "#111827" }}>
              Detalhes do Lead
            </h2>
            <span
              className="inline-block mt-1 text-xs font-medium px-2.5 py-0.5 rounded-full"
              style={{ background: status.bg, color: status.text }}
            >
              {status.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
            style={{ color: "#6B7280" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">
          {/* Seção: Dados do cliente */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wide mb-3"
              style={{ color: "#9CA3AF" }}
            >
              Dados do Cliente
            </p>
            <div className="space-y-3">
              <InfoRow
                icon={<User size={15} />}
                label="Nome completo"
                value={lead.customers?.name}
              />
              <InfoRow
                icon={<CreditCard size={15} />}
                label="CPF"
                value={lead.customers?.cpf}
              />
              <InfoRow
                icon={<Phone size={15} />}
                label="Telefone"
                value={lead.customers?.phone}
              />
              <InfoRow
                icon={<Mail size={15} />}
                label="E-mail"
                value={lead.customers?.email}
              />
            </div>
          </div>

          {/* Divisor */}
          <div className="border-t" style={{ borderColor: "#F1F5F9" }} />

          {/* Seção: Dados do lead */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-wide mb-3"
              style={{ color: "#9CA3AF" }}
            >
              Dados do Lead
            </p>
            <div className="space-y-3">
              <InfoRow
                icon={<MapPin size={15} />}
                label="Origem"
                value={lead.source}
              />
              <InfoRow
                icon={<Car size={15} />}
                label="Veículo de interesse"
                value={lead.vehicle_interest}
              />
            </div>
          </div>
        </div>

        {/* Footer com o botão */}
        <div
          className="px-6 py-4 border-t"
          style={{ borderColor: "#F1F5F9", background: "#F8FAFC" }}
        >
          {/* Botão atribuir — só aparece se onAssign foi passado */}
          {onAssign && (
            <button
              onClick={onAssign}
              className="w-full py-2 rounded-xl text-sm font-semibold border transition-all hover:bg-gray-50"
              style={{ borderColor: "#E5E7EB", color: "#374151" }}
            >
              Atribuir a Atendente
            </button>
          )}
          <OpenNegotiationButton lead={lead} />
        </div>
      </div>
    </div>
  );
}
