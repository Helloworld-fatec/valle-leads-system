import { X, User, Phone, Mail, CreditCard, MapPin, Package, Tag, Building2, Calendar } from "lucide-react";
import type { Lead } from "../../services/leadService";
import { STATUS_CONFIG, formatDate, formatCurrency, getInitials, getAvatarColor } from "./LeadCard";
import OpenNegotiationButton from "./OpenNegotiationButton";

// ─────────────────────────────────────────────
// InfoRow
// ─────────────────────────────────────────────

function InfoRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: highlight ? "#ECFDF5" : "#F8FAFC", color: highlight ? "#059669" : "#9CA3AF" }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p
          className="text-sm font-medium mt-0.5"
          style={{ color: highlight ? "#059669" : "#111827" }}
        >
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

export default function LeadDetailModal({ lead, onClose, onAssign }: LeadDetailModalProps) {
  const status = STATUS_CONFIG[lead.status] ?? {
    bg: "#F1F5F9", text: "#6B7280", dot: "#9CA3AF", label: lead.status,
  };

  const name = lead.customers?.name ?? "Cliente não informado";
  const avatar = getAvatarColor(lead.id);
  const price = lead.interest_item?.value ? formatCurrency(lead.interest_item.value) : null;

  const interestDescription = lead.interest_item?.description
    ?? (lead.interest_item?.reference_code ? `Produto Ref: ${lead.interest_item.reference_code}` : null);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "#FFFFFF" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header com avatar */}
        <div className="relative px-6 pt-6 pb-5 border-b border-gray-100">
          {/* Drag handle mobile */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-200 sm:hidden" />

          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0"
              style={{ background: avatar.bg, color: avatar.text }}
            >
              {getInitials(name)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-gray-900 truncate">{name}</h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full"
                  style={{ background: status.bg, color: status.text }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />
                  {status.label}
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  <Calendar size={11} />
                  {formatDate(lead.created_at)}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100 text-gray-400 hover:text-gray-600 shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body com scroll */}
        <div className="px-6 py-5 space-y-6 overflow-y-auto max-h-[60vh] sm:max-h-none">
          {/* Cliente */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Dados do Cliente
            </p>
            <div className="space-y-3">
              <InfoRow icon={<User size={14} />}    label="Nome completo"    value={lead.customers?.name} />
              <InfoRow icon={<CreditCard size={14} />} label="CPF"           value={lead.customers?.cpf} />
              <InfoRow icon={<Phone size={14} />}   label="Telefone"         value={lead.customers?.phone} />
              <InfoRow icon={<Mail size={14} />}    label="E-mail"           value={lead.customers?.email} />
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Lead */}
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Dados do Lead
            </p>
            <div className="space-y-3">
              <InfoRow icon={<MapPin size={14} />}     label="Origem"              value={lead.source} />
              <InfoRow icon={<Package size={14} />}    label="Item de interesse"   value={interestDescription} />
              {lead.interest_item?.reference_code && (
                <InfoRow icon={<Tag size={14} />}      label="Código de referência" value={lead.interest_item.reference_code} />
              )}
              {price && (
                <InfoRow icon={<Tag size={14} />}      label="Valor estimado"      value={price} highlight />
              )}
              <InfoRow icon={<Building2 size={14} />}  label="Equipe"              value={lead.teams?.name} />
              <InfoRow icon={<User size={14} />}        label="Atendente responsável" value={lead.attendant?.name ?? "Não atribuído"} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-2">
          {onAssign && (
            <button
              onClick={onAssign}
              className="w-full text-sm font-semibold px-4 py-2.5 rounded-xl border border-gray-200
                         bg-white text-gray-700 hover:bg-gray-100 transition-colors"
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