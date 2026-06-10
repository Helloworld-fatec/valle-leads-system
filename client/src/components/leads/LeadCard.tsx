// src/components/leads/LeadCard.tsx

import {
  MapPin,
  Tag,
  User,
  Package,
  Calendar,
  Clock,
  AlertTriangle,
  Users,
} from "lucide-react";
import type { Lead } from "../../services/leadService";

/**
 * Configuração visual dos status do lead.
 *
 * Os valores técnicos vêm do backend/banco:
 * - new
 * - open
 * - won
 * - lost
 *
 * A label é o texto exibido para o usuário final.
 */
export const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; dot: string; label: string }
> = {
  new: {
    bg: "#EFF6FF",
    text: "#1D4ED8",
    dot: "#3B82F6",
    label: "Novo",
  },
  open: {
    bg: "#F5F3FF",
    text: "#6D28D9",
    dot: "#8B5CF6",
    label: "Em andamento",
  },
  won: {
    bg: "#ECFDF5",
    text: "#065F46",
    dot: "#10B981",
    label: "Ganho",
  },
  lost: {
    bg: "#FEF2F2",
    text: "#991B1B",
    dot: "#EF4444",
    label: "Perdido",
  },
};

/**
 * Ícones visuais por origem do lead.
 *
 * A chave é comparada em lowercase.
 * Por isso existem algumas variações com e sem acento.
 */
export const SOURCE_ICONS: Record<string, string> = {
  instagram: "📸",
  whatsapp: "💬",
  facebook: "💙",
  site: "🌐",
  indicacao: "👤",
  indicação: "👤",
  "loja física": "🏪",
  google: "🔍",
  telefone: "📞",
  "mercado livre": "🛒",
};

/**
 * Paleta simples para os avatares com iniciais.
 *
 * Não depende do banco. A cor é escolhida com base no id do lead.
 */
const AVATAR_COLORS = [
  { bg: "#DBEAFE", text: "#1E40AF" },
  { bg: "#EDE9FE", text: "#5B21B6" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#CFFAFE", text: "#164E63" },
  { bg: "#FFE4E6", text: "#9F1239" },
];

/**
 * Gera as iniciais do cliente.
 *
 * Exemplo:
 * "Maria Silva" → "MS"
 * "Cliente Exemplo" → "CE"
 */
export function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/**
 * Escolhe uma cor de avatar com base no id do lead.
 *
 * Isso mantém uma variação visual entre cards/linhas sem precisar salvar
 * uma cor específica no banco.
 */
export function getAvatarColor(id: string) {
  const idx = id.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

/**
 * Formata data para o padrão brasileiro.
 */
export function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

/**
 * Formata valor monetário.
 *
 * O Prisma Decimal normalmente chega no frontend como string.
 * Por isso a função recebe string e converte com parseFloat.
 */
export function formatCurrency(value?: string) {
  if (!value) return null;

  const num = parseFloat(value);

  if (isNaN(num)) return value;

  return num.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Calcula quantos dias se passaram desde uma data.
 *
 * Usado para definir se o lead está recente, parado ou crítico.
 */
function getDaysSince(date?: string) {
  if (!date) return 0;

  const dateValue = new Date(date).getTime();

  if (Number.isNaN(dateValue)) return 0;

  const today = new Date().getTime();
  const diff = today - dateValue;

  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Define a tag de atenção do lead.
 *
 * Regra atual:
 * - won/lost: finalizado;
 * - 30+ dias sem atualização: crítico;
 * - 7 a 29 dias sem atualização: parado;
 * - 3 a 6 dias sem atualização: sem avanço;
 * - 0 a 2 dias: recente.
 *
 * A data usada é updated_at quando existir.
 * Se não existir, usa created_at.
 */
function getLeadAttentionInfo(lead: Lead) {
  const referenceDate = lead.updated_at ?? lead.created_at;
  const days = getDaysSince(referenceDate);

  if (lead.status === "won" || lead.status === "lost") {
    return {
      label: "Finalizado",
      detail: "Lead encerrado",
      className: "bg-gray-50 text-gray-500 border-gray-100",
      icon: Calendar,
    };
  }

  if (days >= 30) {
    return {
      label: `Crítico há ${days} dias`,
      detail: "Sem movimentação há muito tempo",
      className: "bg-red-50 text-red-700 border-red-100",
      icon: AlertTriangle,
    };
  }

  if (days >= 7) {
    return {
      label: `Parado há ${days} dias`,
      detail: "Precisa de atenção",
      className: "bg-red-50 text-red-700 border-red-100",
      icon: AlertTriangle,
    };
  }

  if (days >= 3) {
    return {
      label: `Sem avanço há ${days} dias`,
      detail: "Acompanhar lead",
      className: "bg-amber-50 text-amber-700 border-amber-100",
      icon: Clock,
    };
  }

  return {
    label: "Recente",
    detail: "Atualizado recentemente",
    className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    icon: Clock,
  };
}

/**
 * Skeleton usado enquanto os cards carregam.
 */
export function LeadCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gray-100 shrink-0" />

        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-gray-100 rounded-full w-3/4" />
          <div className="h-3 bg-gray-50 rounded-full w-1/2" />
        </div>

        <div className="h-5 w-16 bg-gray-100 rounded-full" />
      </div>

      <div className="space-y-2.5">
        <div className="h-3 bg-gray-50 rounded-full w-full" />
        <div className="h-3 bg-gray-50 rounded-full w-5/6" />
        <div className="h-3 bg-gray-50 rounded-full w-2/3" />
      </div>
    </div>
  );
}

/**
 * Skeleton usado enquanto a visualização em lista carrega.
 */
export function LeadRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-50 animate-pulse">
      <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />

      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-gray-100 rounded-full w-48" />
        <div className="h-3 bg-gray-50 rounded-full w-32" />
      </div>

      <div className="h-5 w-20 bg-gray-100 rounded-full" />
      <div className="h-3 bg-gray-50 rounded-full w-24" />
      <div className="h-3 bg-gray-50 rounded-full w-32" />
      <div className="h-3 bg-gray-50 rounded-full w-20" />
    </div>
  );
}

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
  showAttendant?: boolean;
  showCheckbox?: boolean;
  checked?: boolean;
  onCheckChange?: (id: string, checked: boolean) => void;
}

/**
 * Card visual do lead.
 *
 * Usado na visualização "Cards".
 * Mostra dados principais do lead em formato mais visual e amigável.
 */
export default function LeadCard({
  lead,
  onClick,
  showAttendant = false,
  showCheckbox = false,
  checked = false,
  onCheckChange,
}: LeadCardProps) {
  const status = STATUS_CONFIG[lead.status] ?? {
    bg: "#F1F5F9",
    text: "#6B7280",
    dot: "#9CA3AF",
    label: lead.status,
  };

  const sourceKey = (lead.source ?? "").toLowerCase();
  const sourceIcon = SOURCE_ICONS[sourceKey] ?? "📌";
  const name = lead.customers?.name ?? "Cliente não informado";
  const avatar = getAvatarColor(lead.id);

  const attention = getLeadAttentionInfo(lead);
  const AttentionIcon = attention.icon;

  const interestLabel =
    lead.interest_item?.description ??
    (lead.interest_item?.reference_code
      ? `Ref: ${lead.interest_item.reference_code}`
      : null) ??
    "Não informado";

  const price = lead.interest_item?.value
    ? formatCurrency(lead.interest_item.value)
    : null;

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-4 cursor-pointer
                 transition-all duration-150 hover:border-blue-200 hover:shadow-md
                 hover:-translate-y-0.5 relative group"
      onClick={() => onClick(lead)}
    >
      {showCheckbox && (
        <div
          className="absolute top-3 right-3"
          onClick={(event) => event.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => onCheckChange?.(lead.id, event.target.checked)}
            className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
          />
        </div>
      )}

      {/* Cabeçalho do card: avatar, nome, status e atenção */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
          style={{ background: avatar.bg, color: avatar.text }}
        >
          {getInitials(name)}
        </div>

        <div className="flex-1 min-w-0 pr-6">
          <p
            title={name}
            className="text-sm font-semibold text-gray-900 truncate leading-tight"
          >
            {name}
          </p>

          <div className="flex items-center gap-1 mt-1 flex-wrap">
            <span
              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: status.bg, color: status.text }}
            >
              <span
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: status.dot }}
              />
              {status.label}
            </span>

            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${attention.className}`}
              title={attention.detail}
            >
              <AttentionIcon size={11} />
              {attention.label}
            </span>
          </div>
        </div>
      </div>

      {/* Informações principais do lead */}
      <div className="space-y-2">
        <div className="flex items-start gap-2 text-xs text-gray-500">
          <MapPin size={12} className="mt-0.5 shrink-0 text-gray-400" />
          <span>
            {sourceIcon} {lead.source ?? "Origem não informada"}
          </span>
        </div>

        <div className="flex items-start gap-2 text-xs text-gray-500">
          <Package size={12} className="mt-0.5 shrink-0 text-gray-400" />
          <span title={interestLabel} className="truncate">
            {interestLabel}
          </span>
        </div>

        {price && (
          <div className="flex items-start gap-2 text-xs">
            <Tag size={12} className="mt-0.5 shrink-0 text-emerald-500" />
            <span className="font-semibold text-emerald-700">{price}</span>
          </div>
        )}

        {/* Exibe apenas o nome da equipe para evitar repetição tipo "Equipe: Equipe PA" */}
        {lead.teams?.name && (
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Users size={12} className="mt-0.5 shrink-0 text-gray-400" />
            <span title={lead.teams.name} className="text-gray-600 truncate">
              {lead.teams.name}
            </span>
          </div>
        )}

        {showAttendant && (
          <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-50">
            <User size={12} className="shrink-0 text-gray-400" />
            <span>{lead.attendant?.name ?? "Não atribuído"}</span>
          </div>
        )}
      </div>

      {/* Rodapé do card: data de criação e indicação textual de atualização */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-gray-50">
        <div className="flex items-center gap-1.5">
          <Calendar size={11} className="text-gray-300" />
          <span className="text-[11px] text-gray-400">
            {formatDate(lead.created_at)}
          </span>
        </div>

        <span className="text-[11px] text-gray-400">{attention.detail}</span>
      </div>
    </div>
  );
}

/**
 * Linha do lead.
 *
 * Usada na visualização "Lista".
 * É mais compacta e melhor para análise rápida de muitos registros.
 */
export function LeadRow({
  lead,
  onClick,
  showAttendant = false,
  showCheckbox = false,
  checked = false,
  onCheckChange,
}: LeadCardProps) {
  const status = STATUS_CONFIG[lead.status] ?? {
    bg: "#F1F5F9",
    text: "#6B7280",
    dot: "#9CA3AF",
    label: lead.status,
  };

  const sourceKey = (lead.source ?? "").toLowerCase();
  const sourceIcon = SOURCE_ICONS[sourceKey] ?? "📌";
  const name = lead.customers?.name ?? "Cliente não informado";
  const avatar = getAvatarColor(lead.id);

  const attention = getLeadAttentionInfo(lead);
  const AttentionIcon = attention.icon;

  const interestLabel =
    lead.interest_item?.description ??
    (lead.interest_item?.reference_code
      ? `Ref: ${lead.interest_item.reference_code}`
      : null) ??
    "—";

  const price = lead.interest_item?.value
    ? formatCurrency(lead.interest_item.value)
    : null;

  return (
    <div
      className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-50 cursor-pointer
                 transition-colors hover:bg-blue-50/40 group"
      onClick={() => onClick(lead)}
    >
      {showCheckbox && (
        <div onClick={(event) => event.stopPropagation()}>
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => onCheckChange?.(lead.id, event.target.checked)}
            className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
          />
        </div>
      )}

      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
        style={{ background: avatar.bg, color: avatar.text }}
      >
        {getInitials(name)}
      </div>

      {/* Cliente com largura mínima para evitar corte excessivo na tabela */}
      <div className="flex-1 min-w-[220px]">
        <p
          title={name}
          className="text-sm font-semibold text-gray-900 truncate leading-tight"
        >
          {name}
        </p>

        {lead.customers?.email && (
          <p className="text-xs text-gray-400 truncate">
            {lead.customers.email}
          </p>
        )}
      </div>

      <div className="w-32 shrink-0">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
          style={{ background: status.bg, color: status.text }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ background: status.dot }}
          />
          {status.label}
        </span>
      </div>

      <div className="w-40 shrink-0 hidden lg:block">
        <span
          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${attention.className}`}
          title={attention.detail}
        >
          <AttentionIcon size={11} />
          {attention.label}
        </span>
      </div>

      <div className="w-32 shrink-0 text-xs text-gray-500 truncate hidden md:block">
        {sourceIcon} {lead.source ?? "—"}
      </div>

      <div
        title={interestLabel}
        className="w-48 shrink-0 text-xs text-gray-500 truncate hidden xl:block"
      >
        {interestLabel}
      </div>

      <div className="w-28 shrink-0 text-xs font-semibold text-emerald-700 hidden xl:block">
        {price ?? "—"}
      </div>

      <div className="w-24 shrink-0 text-xs text-gray-400 truncate hidden 2xl:block">
        {lead.teams?.name ?? "—"}
      </div>

      {showAttendant && (
        <div className="w-32 shrink-0 text-xs text-gray-500 truncate hidden lg:block">
          {lead.attendant?.name ?? "Não atribuído"}
        </div>
      )}

      <div className="w-28 shrink-0 text-xs text-gray-400 hidden sm:block text-right">
        {formatDate(lead.created_at)}
      </div>
    </div>
  );
}