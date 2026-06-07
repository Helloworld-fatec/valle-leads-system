// src/components/leads/LeadsShared.tsx
//
// Componentes e helpers compartilhados entre as páginas de leads.
// Usado tanto pela visão do gerente geral / admin (GMLeads) quanto pela
// visão do gerente de equipe (ManagerLeads).
//
// Mantemos tudo em um único arquivo porque as superfícies expostas são pequenas
// e estritamente ligadas ao domínio de leads — não há ganho real em quebrar
// em vários arquivos micro.

import {
  AlertCircle,
  Calendar,
  Grid3X3,
  List,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import type { Lead } from "../../services/leadService";

// ─── Tipos ──────────────────────────────────────────────────────────────────
//
// O `Lead` exportado pelo leadService tem `team_id: string` (não-nullable)
// e não declara `teams` nem `interest_item`. A API real retorna esses campos
// e `team_id` pode ser null. Por isso estendemos com o shape de fato.

export interface LeadFull extends Omit<Lead, "team_id"> {
  team_id: string | null;
  teams?: { id: string; name: string; store_id?: string | null } | null;
  interest_item?: {
    id: string;
    reference_code: string;
    description: string;
    value: string;
  } | null;
}

export type ViewMode = "grid" | "list";

// ─── Helpers ────────────────────────────────────────────────────────────────

export function formatBRL(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(n);
}

export function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Ordena com prioridade: sem equipe > sem atendente > restante (mais novo primeiro).
// `byTeam=true` ativa o primeiro nível (relevante apenas para GM/Admin).
export function sortByPriority(
  leads: LeadFull[],
  opts: { byTeam: boolean },
): LeadFull[] {
  return [...leads].sort((a, b) => {
    if (opts.byTeam) {
      const aNoTeam = !a.team_id;
      const bNoTeam = !b.team_id;
      if (aNoTeam !== bNoTeam) return aNoTeam ? -1 : 1;
    }
    const aNoAtt = !a.attendant_id;
    const bNoAtt = !b.attendant_id;
    if (aNoAtt !== bNoAtt) return aNoAtt ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

// ─── Status badge ───────────────────────────────────────────────────────────
//
// Aceita tanto valores pt-BR do enum oficial quanto "new"/"novo" do banco.

const STATUS_MAP: Record<string, { label: string; bg: string; text: string }> = {
  new:            { label: "Novo",            bg: "bg-blue-50",    text: "text-blue-700" },
  novo:           { label: "Novo",            bg: "bg-blue-50",    text: "text-blue-700" },
  em_atendimento: { label: "Em atendimento",  bg: "bg-amber-50",   text: "text-amber-700" },
  aguardando:     { label: "Aguardando",      bg: "bg-purple-50",  text: "text-purple-700" },
  finalizado:     { label: "Finalizado",      bg: "bg-emerald-50", text: "text-emerald-700" },
  perdido:        { label: "Perdido",         bg: "bg-red-50",     text: "text-red-700" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? {
    label: status,
    bg: "bg-gray-100",
    text: "text-gray-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}

// ─── Warning chip — "Sem equipe" / "Sem atendente" ──────────────────────────

export function WarningChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
      <AlertCircle size={11} />
      {label}
    </span>
  );
}

// ─── View toggle (grid / list) ──────────────────────────────────────────────

export function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onChange("grid")}
        title="Visualizar em cards"
        className={`p-1.5 rounded-md transition-colors ${
          value === "grid"
            ? "bg-white shadow-sm text-gray-700"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <Grid3X3 size={15} />
      </button>
      <button
        onClick={() => onChange("list")}
        title="Visualizar em lista"
        className={`p-1.5 rounded-md transition-colors ${
          value === "list"
            ? "bg-white shadow-sm text-gray-700"
            : "text-gray-400 hover:text-gray-600"
        }`}
      >
        <List size={15} />
      </button>
    </div>
  );
}

// ─── Lead card (grid view) ──────────────────────────────────────────────────

interface LeadActionProps {
  lead: LeadFull;
  selected: boolean;
  // showTeamWarning=true para GM (avisa quando lead está sem equipe).
  // Para Manager isso é sempre false (seus leads sempre têm time).
  showTeamWarning: boolean;
  onSelect: (id: string) => void;
  onAssign: (lead: LeadFull) => void;
  onDelete: (lead: LeadFull) => void;
}

export function LeadCard({
  lead,
  selected,
  showTeamWarning,
  onSelect,
  onAssign,
  onDelete,
}: LeadActionProps) {
  const noTeam = showTeamWarning && !lead.team_id;
  const noAttendant = !lead.attendant_id;
  const hasWarnings = noTeam || noAttendant;

  return (
    <div
      className={`relative bg-white rounded-2xl border transition-all p-4 flex flex-col gap-3 ${
        selected
          ? "border-blue-400 ring-2 ring-blue-100"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      }`}
    >
      {/* Barra lateral amarela para leads com pendências */}
      {hasWarnings && (
        <div className="absolute left-0 top-4 bottom-4 w-1 rounded-r bg-amber-400" />
      )}

      {/* Header: checkbox + status + source */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onSelect(lead.id)}
            className="w-4 h-4 accent-blue-600 cursor-pointer"
          />
          <StatusBadge status={lead.status} />
        </div>
        {lead.source && (
          <span className="text-[11px] text-gray-400 truncate max-w-25">
            {lead.source}
          </span>
        )}
      </div>

      {/* Cliente */}
      <div>
        <p className="font-semibold text-gray-900 text-sm leading-tight truncate">
          {lead.customers?.name ?? "Cliente sem nome"}
        </p>
        {lead.customers?.phone && (
          <p className="text-[11px] text-gray-400 mt-0.5">
            {lead.customers.phone}
          </p>
        )}
      </div>

      {/* Item de interesse */}
      <div className="text-xs">
        {lead.interest_item ? (
          <>
            <p
              className="text-gray-600 truncate"
              title={lead.interest_item.description}
            >
              {lead.interest_item.description}
            </p>
            <p className="font-semibold text-gray-900 mt-0.5">
              {formatBRL(lead.interest_item.value)}
            </p>
          </>
        ) : (
          <p className="text-gray-400 italic">Sem item de interesse</p>
        )}
      </div>

      {/* Equipe + atendente (com avisos quando faltam) */}
      <div className="flex flex-wrap gap-1.5">
        {lead.teams ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px]">
            <Users size={10} />
            {lead.teams.name}
          </span>
        ) : showTeamWarning ? (
          <WarningChip label="Sem equipe" />
        ) : null}

        {lead.attendant ? (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px]">
            {lead.attendant.name}
          </span>
        ) : (
          <WarningChip label="Sem atendente" />
        )}
      </div>

      {/* Footer: data + ações */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-auto">
        <span className="text-[11px] text-gray-400 flex items-center gap-1">
          <Calendar size={11} />
          {formatDate(lead.created_at)}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAssign(lead)}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 transition-colors"
          >
            Atribuir
          </button>
          <button
            onClick={() => onDelete(lead)}
            title="Desativar lead"
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Lead row (list view) ───────────────────────────────────────────────────

export function LeadRow({
  lead,
  selected,
  showTeamWarning,
  onSelect,
  onAssign,
  onDelete,
}: LeadActionProps) {
  const noTeam = showTeamWarning && !lead.team_id;
  const noAttendant = !lead.attendant_id;
  const hasWarnings = noTeam || noAttendant;

  return (
    <div
      className={`relative bg-white rounded-xl border transition-all p-3 grid grid-cols-12 gap-3 items-center ${
        selected
          ? "border-blue-400 ring-1 ring-blue-100"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {hasWarnings && (
        <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-amber-400" />
      )}

      {/* Checkbox */}
      <div className="col-span-1 flex items-center pl-2">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onSelect(lead.id)}
          className="w-4 h-4 accent-blue-600 cursor-pointer"
        />
      </div>

      {/* Cliente + source */}
      <div className="col-span-3 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">
          {lead.customers?.name ?? "—"}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <StatusBadge status={lead.status} />
          {lead.source && (
            <span className="text-[11px] text-gray-400 truncate">
              {lead.source}
            </span>
          )}
        </div>
      </div>

      {/* Interesse + valor */}
      <div className="col-span-3 min-w-0">
        {lead.interest_item ? (
          <>
            <p className="text-xs text-gray-700 truncate">
              {lead.interest_item.description}
            </p>
            <p className="text-xs font-semibold text-gray-900">
              {formatBRL(lead.interest_item.value)}
            </p>
          </>
        ) : (
          <p className="text-xs text-gray-400 italic">—</p>
        )}
      </div>

      {/* Equipe */}
      <div className="col-span-2 min-w-0">
        {lead.teams ? (
          <p className="text-xs text-gray-700 truncate">{lead.teams.name}</p>
        ) : showTeamWarning ? (
          <WarningChip label="Sem equipe" />
        ) : (
          <p className="text-xs text-gray-400">—</p>
        )}
      </div>

      {/* Atendente */}
      <div className="col-span-2 min-w-0">
        {lead.attendant ? (
          <p className="text-xs text-gray-700 truncate">
            {lead.attendant.name}
          </p>
        ) : (
          <WarningChip label="Sem atendente" />
        )}
      </div>

      {/* Ações */}
      <div className="col-span-1 flex items-center justify-end gap-1">
        <button
          onClick={() => onAssign(lead)}
          title="Atribuir"
          className="p-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
        >
          <UserPlus size={14} />
        </button>
        <button
          onClick={() => onDelete(lead)}
          title="Desativar"
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Bulk toolbar (sticky no rodapé) ────────────────────────────────────────

export function BulkToolbar({
  count,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  onClear,
}: {
  count: number;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onClear: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-gray-900 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4">
      <div className="flex items-center gap-2 text-sm">
        <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {count}
        </span>
        <span>selecionado{count > 1 ? "s" : ""}</span>
      </div>
      <div className="h-5 w-px bg-white/20" />
      <button
        onClick={onPrimary}
        className="text-sm font-medium bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1.5"
      >
        <UserPlus size={14} />
        {primaryLabel}
      </button>
      {secondaryLabel && onSecondary && (
        <button
          onClick={onSecondary}
          className="text-sm font-medium bg-red-600 hover:bg-red-700 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1.5"
        >
          <Trash2 size={14} />
          {secondaryLabel}
        </button>
      )}
      <button
        onClick={onClear}
        title="Limpar seleção"
        className="text-white/60 hover:text-white p-1 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}

// ─── Confirm dialog ─────────────────────────────────────────────────────────

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  variant = "primary",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 flex flex-col gap-5">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <div className="text-sm text-gray-600">{message}</div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl py-2 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 text-sm font-medium text-white rounded-xl py-2 transition-colors ${
              variant === "danger"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty state ────────────────────────────────────────────────────────────

export function EmptyState({
  icon,
  title,
  message,
}: {
  icon: React.ReactNode;
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-200">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 mb-4">
        {icon}
      </div>
      <p className="font-semibold text-gray-700">{title}</p>
      <p className="text-sm text-gray-400 mt-1">{message}</p>
    </div>
  );
}

// ─── List header (column titles) ────────────────────────────────────────────

export function LeadListHeader() {
  return (
    <div className="grid grid-cols-12 gap-3 px-4 py-2 text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
      <div className="col-span-1"></div>
      <div className="col-span-3">Cliente</div>
      <div className="col-span-3">Interesse</div>
      <div className="col-span-2">Equipe</div>
      <div className="col-span-2">Atendente</div>
      <div className="col-span-1 text-right">Ações</div>
    </div>
  );
}