import { useEffect, useRef, useState } from "react";
import {
  X,
  User,
  Phone,
  Mail,
  CreditCard,
  MapPin,
  Package,
  Tag,
  Building2,
  Calendar,
  Clock3,
  Car,
  Image as ImageIcon,
  Loader2,
  ChevronDown,
} from "lucide-react";
import type { Lead, LeadStatus } from "../../services/leadService";
import { useLeadService } from "../../services/leadService";
import {
  STATUS_CONFIG,
  formatDate,
  formatCurrency,
  getInitials,
  getAvatarColor,
} from "./LeadCard";
import OpenNegotiationButton from "./OpenNegotiationButton";

// ─────────────────────────────────────────────
// Opções de status disponíveis na lead
// ─────────────────────────────────────────────

const STATUS_OPTIONS: {
  value: LeadStatus;
  label: string;
  description: string;
  dotColor: string;
  bgColor: string;
  textColor: string;
}[] = [
  {
    value: "new",
    label: "Novo",
    description: "Aguardando primeiro contato",
    dotColor: "#2563EB",
    bgColor: "#EFF6FF",
    textColor: "#1D4ED8",
  },
  {
    value: "open",
    label: "Em andamento",
    description: "Lead em acompanhamento",
    dotColor: "#7C3AED",
    bgColor: "#F5F3FF",
    textColor: "#6D28D9",
  },
  {
    value: "won",
    label: "Ganho",
    description: "Lead convertido",
    dotColor: "#059669",
    bgColor: "#ECFDF5",
    textColor: "#047857",
  },
  {
    value: "lost",
    label: "Perdido",
    description: "Sem conversão",
    dotColor: "#DC2626",
    bgColor: "#FEF2F2",
    textColor: "#B91C1C",
  },
];

// ─────────────────────────────────────────────
// Cores suaves do ícone do bloco informativo
// ─────────────────────────────────────────────

const INFO_ICON_STYLE_BY_STATUS: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  new: {
    bg: "#EFF6FF",
    text: "#3B82F6",
    border: "#DBEAFE",
  },
  open: {
    bg: "#F5F3FF",
    text: "#8B5CF6",
    border: "#EDE9FE",
  },
  won: {
    bg: "#ECFDF5",
    text: "#10B981",
    border: "#D1FAE5",
  },
  lost: {
    bg: "#FEF2F2",
    text: "#EF4444",
    border: "#FEE2E2",
  },
};

// ─────────────────────────────────────────────
// Linha de informação reutilizável
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
        style={{
          background: highlight ? "#ECFDF5" : "#F8FAFC",
          color: highlight ? "#059669" : "#9CA3AF",
        }}
      >
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>

        <p
          className="text-sm font-medium mt-0.5 break-words"
          style={{ color: highlight ? "#059669" : "#111827" }}
        >
          {value ?? "Não informado"}
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Funções auxiliares
// ─────────────────────────────────────────────

function getDaysSince(date?: string | null) {
  if (!date) return null;

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return null;

  const createdDay = new Date(
    parsedDate.getFullYear(),
    parsedDate.getMonth(),
    parsedDate.getDate()
  );

  const today = new Date();
  const todayDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );

  const diffInMs = todayDay.getTime() - createdDay.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  return Math.max(0, diffInDays);
}

function getCreatedText(date?: string | null) {
  const days = getDaysSince(date);

  if (days === null) return "Sem data de criação";
  if (days === 0) return "Criado hoje";
  if (days === 1) return "Criado há 1 dia";

  return `Criado há ${days} dias`;
}

function getLeadAgeInDays(date?: string | null) {
  return getDaysSince(date) ?? 0;
}

function getStatusDescription(status: LeadStatus | string) {
  switch (status) {
    case "new":
      return "Aguardando primeiro contato";
    case "open":
      return "Lead em acompanhamento comercial";
    case "won":
      return "Lead convertido";
    case "lost":
      return "Lead perdido ou sem conversão";
    default:
      return "Status atual da oportunidade";
  }
}

function getInfoBoxTitle(status: LeadStatus | string, days: number) {
  if (status === "won") return "Resultado da lead";
  if (status === "lost") return "Resultado da lead";

  if (days >= 30) return "Lead há muito tempo na carteira";
  if (days >= 7) return "Acompanhar lead";

  return "Acompanhamento em dia";
}

function getInfoBoxText(
  status: LeadStatus | string,
  createdText: string,
  days: number
) {
  if (status === "won") {
    return `${createdText} • Oportunidade convertida com sucesso.`;
  }

  if (status === "lost") {
    return `${createdText} • Encerrado sem conversão.`;
  }

  if (days >= 30) {
    return `${days} dias na carteira • Reavaliar oportunidade.`;
  }

  if (days >= 7) {
    return `${days} dias na carteira • Verificar próxima interação.`;
  }

  if (status === "new") {
    return `${createdText} • Próxima ação: realizar primeiro contato.`;
  }

  if (status === "open") {
    return `${createdText} • Próxima ação: registrar interação ou avançar no funil.`;
  }

  return `${createdText} • Avaliar lead e definir próxima ação.`;
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  onAssign?: () => void;

  onLeadUpdated?: (lead: Lead) => void;
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function LeadDetailModal({
  lead,
  onClose,
  onAssign,
  onLeadUpdated,
}: LeadDetailModalProps) {
  const { updateLead } = useLeadService();

  const [currentLead, setCurrentLead] = useState<Lead>(lead);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState<string | null>(null);

  const statusMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!showStatusMenu) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (statusMenuRef.current && !statusMenuRef.current.contains(target)) {
        setShowStatusMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStatusMenu]);

  const status = STATUS_CONFIG[currentLead.status] ?? {
    bg: "#F1F5F9",
    text: "#6B7280",
    dot: "#9CA3AF",
    label: currentLead.status,
  };

  const infoIconStyle =
    INFO_ICON_STYLE_BY_STATUS[currentLead.status] ??
    INFO_ICON_STYLE_BY_STATUS.new;

  const name = currentLead.customers?.name ?? "Cliente não informado";
  const avatar = getAvatarColor(currentLead.id);

  const price = currentLead.interest_item?.value
    ? formatCurrency(currentLead.interest_item.value)
    : null;

  const interestDescription =
    currentLead.interest_item?.description ??
    (currentLead.interest_item?.reference_code
      ? `Produto Ref: ${currentLead.interest_item.reference_code}`
      : null);

  const createdBaseDate = currentLead.created_at;
  const createdText = getCreatedText(createdBaseDate);
  const daysInWallet = getLeadAgeInDays(createdBaseDate);

  const statusDescription = getStatusDescription(currentLead.status);
  const infoBoxTitle = getInfoBoxTitle(currentLead.status, daysInWallet);
  const infoBoxText = getInfoBoxText(
    currentLead.status,
    createdText,
    daysInWallet
  );

  async function handleChangeStatus(newStatus: LeadStatus) {
    if (newStatus === currentLead.status || savingStatus) {
      setShowStatusMenu(false);
      return;
    }

    try {
      setSavingStatus(true);
      setStatusError(null);

      const updatedLead = await updateLead(currentLead.id, {
        status: newStatus,
      });

      const mergedLead: Lead = {
        ...currentLead,
        ...updatedLead,
        status: updatedLead.status ?? newStatus,
        updated_at: updatedLead.updated_at ?? currentLead.updated_at,
        customers: updatedLead.customers ?? currentLead.customers,
        teams: updatedLead.teams ?? currentLead.teams,
        attendant: updatedLead.attendant ?? currentLead.attendant,
        interest_item: updatedLead.interest_item ?? currentLead.interest_item,
      };

      setCurrentLead(mergedLead);
      onLeadUpdated?.(mergedLead);
      setShowStatusMenu(false);
    } catch {
      setStatusError("Não foi possível atualizar o status da lead.");
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{
        background: "rgba(15,23,42,0.5)",
        backdropFilter: "blur(2px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "#FFFFFF" }}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-5 border-b border-gray-100">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-gray-200 sm:hidden" />

          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0"
              style={{ background: avatar.bg, color: avatar.text }}
            >
              {getInitials(name)}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-gray-900 truncate">
                {name}
              </h2>

              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <div ref={statusMenuRef} className="relative">
                  <button
                    type="button"
                    title="Clique para alterar o status"
                    onClick={() => {
                      setShowStatusMenu((prev) => !prev);
                      setStatusError(null);
                    }}
                    disabled={savingStatus}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border border-transparent transition-all hover:border-current hover:brightness-95 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ background: status.bg, color: status.text }}
                    aria-label="Alterar status da lead"
                  >
                    {savingStatus ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: status.dot }}
                      />
                    )}

                    {status.label}

                    <ChevronDown size={12} />
                  </button>

                  {showStatusMenu && (
                    <div className="absolute left-0 top-7 z-30 w-52 rounded-xl border border-gray-100 bg-white shadow-lg p-1">
                      {STATUS_OPTIONS.map((option) => {
                        const isActive = option.value === currentLead.status;

                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleChangeStatus(option.value)}
                            disabled={savingStatus || isActive}
                            className={`w-full flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors ${
                              isActive
                                ? "bg-gray-50 cursor-default"
                                : "hover:bg-gray-50"
                            } disabled:opacity-70 disabled:cursor-not-allowed`}
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ background: option.dotColor }}
                              />

                              <span
                                className="font-semibold truncate"
                                style={{ color: option.textColor }}
                              >
                                {option.label}
                              </span>
                            </span>

                            {isActive && (
                              <span className="text-[10px] font-semibold text-gray-400 shrink-0">
                                Atual
                              </span>
                            )}

                            {savingStatus && !isActive && (
                              <Loader2
                                size={12}
                                className="animate-spin text-gray-400 shrink-0"
                              />
                            )}
                          </button>
                        );
                      })}

                      {onAssign && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowStatusMenu(false);
                            onAssign();
                          }}
                          className="mt-1 w-full rounded-lg border-t border-gray-50 px-3 py-2 text-left text-xs font-medium text-gray-600 hover:bg-gray-50"
                        >
                          Atribuir atendente
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  <Calendar size={11} />
                  {formatDate(currentLead.created_at)}
                </span>
              </div>

              <p className="mt-2 text-xs text-gray-500">
                {statusDescription}
              </p>

              {statusError && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  {statusError}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100 text-gray-400 hover:text-gray-600 shrink-0"
              aria-label="Fechar modal"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 overflow-y-auto max-h-[68vh]">
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border"
                style={{
                  background: infoIconStyle.bg,
                  color: infoIconStyle.text,
                  borderColor: infoIconStyle.border,
                }}
              >
                <Clock3 size={17} />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-700">
                  {infoBoxTitle}
                </p>

                <p className="mt-0.5 text-xs text-slate-500">
                  {infoBoxText}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Dados do Cliente
            </p>

            <div className="space-y-3">
              <InfoRow
                icon={<User size={14} />}
                label="Nome completo"
                value={currentLead.customers?.name}
              />

              <InfoRow
                icon={<CreditCard size={14} />}
                label="CPF"
                value={currentLead.customers?.cpf}
              />

              <InfoRow
                icon={<Phone size={14} />}
                label="Telefone"
                value={currentLead.customers?.phone}
              />

              <InfoRow
                icon={<Mail size={14} />}
                label="E-mail"
                value={currentLead.customers?.email}
              />
            </div>
          </div>

          <div className="border-t border-gray-100" />

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Dados do Lead
            </p>

            <div className="space-y-3">
              <InfoRow
                icon={<MapPin size={14} />}
                label="Origem"
                value={currentLead.source}
              />

              <InfoRow
                icon={<Package size={14} />}
                label="Item de interesse"
                value={interestDescription}
              />

              {currentLead.interest_item?.reference_code && (
                <InfoRow
                  icon={<Tag size={14} />}
                  label="Código de referência"
                  value={currentLead.interest_item.reference_code}
                />
              )}

              {price && (
                <InfoRow
                  icon={<Tag size={14} />}
                  label="Valor estimado"
                  value={price}
                  highlight
                />
              )}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Preview do veículo/produto
            </p>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
              <div className="h-24 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                <div className="text-center">
                  <div className="mx-auto mb-1.5 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Car size={21} />
                  </div>

                  <div className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-medium text-gray-400 border border-gray-100">
                    <ImageIcon size={11} />
                    Imagem do veículo
                  </div>
                </div>
              </div>

              <div className="p-3.5">
                <p className="text-sm font-bold text-gray-900">
                  {interestDescription ?? "Produto não informado"}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  {currentLead.interest_item?.reference_code
                    ? `Ref: ${currentLead.interest_item.reference_code}`
                    : "Sem referência"}
                  {price ? ` • ${price}` : ""}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
              Responsáveis e acompanhamento
            </p>

            <div className="space-y-3">
              <InfoRow
                icon={<Building2 size={14} />}
                label="Equipe"
                value={currentLead.teams?.name}
              />

              <InfoRow
                icon={<User size={14} />}
                label="Atendente responsável"
                value={currentLead.attendant?.name ?? "Não atribuído"}
              />

              <InfoRow
                icon={<Clock3 size={14} />}
                label="Tempo na carteira"
                value={createdText}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex flex-col gap-2">
          <OpenNegotiationButton lead={currentLead} />
        </div>
      </div>
    </div>
  );
}