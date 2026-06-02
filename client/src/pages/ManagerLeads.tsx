// src/pages/ManagerLeads.tsx
//
// Visão de atribuição de leads para MANAGER (gerente de equipe).
// O usuário atribui atendentes da SUA equipe aos leads da SUA equipe,
// individualmente ou em lote. Pode também desativar leads.
//
// Importante: o backend (lead.service.ts) já restringe automaticamente o
// gerente aos seus times via team_ids_scope. Não precisamos filtrar por
// team_id no fetch — o servidor já entrega só o que pode ver.

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Inbox, Search, UserPlus, X } from "lucide-react";
import { useLeadService } from "../services/leadService";
import type { LeadStatus } from "../services/leadService";
import { useUserService } from "../services/userService";
import type { User } from "../services/userService";
import { useAuth } from "../hook/useAuth";
import {
  BulkToolbar,
  ConfirmDialog,
  EmptyState,
  LeadCard,
  LeadListHeader,
  LeadRow,
  ViewToggle,
  sortByPriority,
  type LeadFull,
  type ViewMode,
} from "../components/leads/LeadsShared";

// ─── AssignAttendantModal ───────────────────────────────────────────────────
//
// Atribui um atendente para 1+ leads. Usa bulkAssignLeads do leadService
// (que internamente faz Promise.allSettled de PATCHs individuais — o
// endpoint dedicado /bulk/assign-attendant ainda não está exposto no
// service do front).
//
// Regra do backend: o atendente precisa pertencer a TODOS os times dos
// leads selecionados. Pré-filtramos os atendentes elegíveis aqui para
// evitar requisições destinadas ao fracasso.

function AssignAttendantModal({
  leads,
  attendants,
  onClose,
  onSuccess,
}: {
  leads: LeadFull[];
  attendants: User[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { bulkAssignLeads } = useLeadService();
  const [attendantId, setAttendantId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Times representados na seleção
  const teamIds = useMemo(
    () =>
      Array.from(
        new Set(leads.map((l) => l.team_id).filter((t): t is string => !!t)),
      ),
    [leads],
  );
  const multipleTeams = teamIds.length > 1;

  // Atendentes elegíveis: ATTENDANT ativos que pertencem a TODOS os times
  // dos leads selecionados.
  const eligibleAttendants = useMemo(() => {
    return attendants.filter((a) => {
      if (a.role !== "ATTENDANT" || !a.is_active) return false;
      const userTeams = a.user_teams ?? [];
      return teamIds.every((tid) =>
        userTeams.some((ut) => ut.team_id === tid),
      );
    });
  }, [attendants, teamIds]);

  async function handleSubmit() {
    if (!attendantId) {
      setError("Selecione um atendente.");
      return;
    }
    try {
      setSubmitting(true);
      setError(null);
      const results = await bulkAssignLeads(
        leads.map((l) => l.id),
        attendantId,
      );
      const failures = results.filter((r) => r.status === "rejected").length;
      if (failures > 0) {
        setError(`${failures} de ${leads.length} atribuições falharam.`);
        // Não fecha — usuário pode tentar de novo ou cancelar
        return;
      }
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao atribuir atendente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Atribuir atendente
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {leads.length === 1
              ? `Lead de ${leads[0].customers?.name ?? "Sem nome"}`
              : `Selecione o atendente que receberá ${leads.length} leads`}
          </p>
        </div>

        {multipleTeams && (
          <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2">
            Os leads selecionados pertencem a equipes diferentes. Só aparecem
            os atendentes vinculados a todas elas.
          </div>
        )}

        <label className="block">
          <span className="text-xs font-medium text-gray-700 block mb-1">
            Atendente *
          </span>
          <select
            value={attendantId}
            onChange={(e) => setAttendantId(e.target.value)}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">Selecione...</option>
            {eligibleAttendants.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
          {eligibleAttendants.length === 0 && (
            <span className="text-xs text-amber-600 mt-1 block">
              Nenhum atendente elegível para esta seleção.
            </span>
          )}
        </label>

        {error && (
          <div className="text-xs font-medium text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl py-2 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !attendantId}
            className="flex-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-xl py-2 transition-colors"
          >
            {submitting ? "Atribuindo..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ManagerLeads ───────────────────────────────────────────────────────────

export default function ManagerLeads() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getLeads, updateLead } = useLeadService();
  const { getUsers } = useUserService();

  // Proteção de rota — só MANAGER
  useEffect(() => {
    if (user && user.role !== "MANAGER") {
      navigate("/403");
    }
  }, [user, navigate]);

  // ── Estado ──
  const [leads, setLeads] = useState<LeadFull[]>([]);
  const [attendants, setAttendants] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [filterTeamId, setFilterTeamId] = useState("");
  const [filterAttendantId, setFilterAttendantId] = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "">("");
  const [onlyPending, setOnlyPending] = useState(false);

  // Visualização + seleção
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modais
  const [assignTarget, setAssignTarget] = useState<LeadFull[] | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeadFull[] | null>(null);

  // AuthUser tem team_ids (array). Acesso defensivo caso esteja vazio.
  const teamIds = useMemo(() => user?.team_ids ?? [], [user]);
  const hasMultipleTeams = teamIds.length > 1;

  // ── Carrega atendentes dos times do gerente ──
  // Faz uma requisição por time e deduplica por id (um atendente pode
  // pertencer a mais de um time do mesmo gerente).
  useEffect(() => {
    if (teamIds.length === 0) return;
    Promise.all(
      teamIds.map((tid) =>
        getUsers({ role: "ATTENDANT", team_id: tid }).then(
          (r) => r.data.filter((u) => u.is_active), // filtra ativos no client
        ),
      ),
    )
      .then((arrays) => {
        const map = new Map<string, User>();
        arrays.flat().forEach((u) => map.set(u.id, u));
        setAttendants(Array.from(map.values()));
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamIds.join(",")]);

  // ── Busca leads ──
  // Não precisamos passar team_id — o backend escopa o MANAGER automaticamente.
  async function fetchLeads() {
    setLoading(true);
    setError(null);
    setSelectedIds([]);
    try {
      const data = await getLeads({
        team_id: filterTeamId || undefined,
        attendant_id: filterAttendantId || undefined,
        status: (filterStatus as LeadStatus) || undefined,
      });
      setLeads(data as LeadFull[]);
    } catch {
      setError("Erro ao carregar leads. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTeamId, filterStatus, filterAttendantId]);

  // ── Filtro/sort local ──
  // Para o MANAGER os warnings de "sem equipe" não fazem sentido (todos
  // os leads que ele vê estão necessariamente em algum dos seus times),
  // então byTeam=false na ordenação.
  const visibleLeads = useMemo(() => {
    let result = leads;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((l) => {
        const name = (l.customers?.name ?? "").toLowerCase();
        const email = (l.customers?.email ?? "").toLowerCase();
        const cpf = l.customers?.cpf ?? "";
        const refCode = l.interest_item?.reference_code ?? "";
        return (
          name.includes(q) ||
          email.includes(q) ||
          cpf.includes(q) ||
          refCode.includes(q)
        );
      });
    }

    if (onlyPending) {
      result = result.filter((l) => !l.attendant_id);
    }

    return sortByPriority(result, { byTeam: false });
  }, [leads, search, onlyPending]);

  // ── Seleção ──
  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }
  function toggleSelectAll() {
    if (selectedIds.length === visibleLeads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleLeads.map((l) => l.id));
    }
  }
  const allSelected =
    visibleLeads.length > 0 && selectedIds.length === visibleLeads.length;

  // ── Ações ──
  function handleAssignSingle(lead: LeadFull) {
    setAssignTarget([lead]);
  }
  function handleAssignBulk() {
    const targets = leads.filter((l) => selectedIds.includes(l.id));
    if (targets.length > 0) setAssignTarget(targets);
  }
  function handleDeleteSingle(lead: LeadFull) {
    setDeleteTarget([lead]);
  }
  function handleDeleteBulk() {
    const targets = leads.filter((l) => selectedIds.includes(l.id));
    if (targets.length > 0) setDeleteTarget(targets);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    try {
      await Promise.all(
        deleteTarget.map((l) => updateLead(l.id, { is_active: false })),
      );
      setDeleteTarget(null);
      fetchLeads();
    } catch {
      alert("Erro ao desativar lead(s).");
    }
  }

  function clearFilters() {
    setSearch("");
    setFilterTeamId("");
    setFilterAttendantId("");
    setFilterStatus("");
    setOnlyPending(false);
  }

  // Times únicos derivados dos leads (para o select de filtro de equipe
  // quando o gerente cuida de mais de um time).
  const teamOptions = useMemo(() => {
    const map = new Map<string, string>();
    leads.forEach((l) => {
      if (l.teams) map.set(l.teams.id, l.teams.name);
    });
    return Array.from(map.entries());
  }, [leads]);

  const missingAttendant = leads.filter((l) => !l.attendant_id).length;

  const hasActiveFilter =
    !!search ||
    !!filterTeamId ||
    !!filterAttendantId ||
    !!filterStatus ||
    onlyPending;

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8 pb-32">

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads da Equipe</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading
              ? "Carregando..."
              : `${visibleLeads.length} lead${
                  visibleLeads.length !== 1 ? "s" : ""
                } visível${visibleLeads.length !== 1 ? "is" : ""}`}
          </p>
        </div>
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {/* Banner de pendência */}
      {missingAttendant > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setOnlyPending(true)}
            className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-3 py-2 text-xs font-medium hover:bg-amber-100 transition-colors"
          >
            <UserPlus size={13} />
            {missingAttendant} lead{missingAttendant > 1 ? "s" : ""} sem
            atendente
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3 mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-50">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, email, CPF ou item..."
            className="w-full text-sm pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-300"
          />
        </div>

        {hasMultipleTeams && (
          <select
            value={filterTeamId}
            onChange={(e) => setFilterTeamId(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 hover:bg-white"
          >
            <option value="">Todas minhas equipes</option>
            {teamOptions.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        )}

        <select
          value={filterAttendantId}
          onChange={(e) => setFilterAttendantId(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 hover:bg-white"
        >
          <option value="">Todos os atendentes</option>
          {attendants.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as LeadStatus | "")}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 hover:bg-white"
        >
          <option value="">Todos os status</option>
          <option value="novo">Novo</option>
          <option value="em_atendimento">Em atendimento</option>
          <option value="aguardando">Aguardando</option>
          <option value="finalizado">Finalizado</option>
          <option value="perdido">Perdido</option>
        </select>

        <label className="flex items-center gap-2 text-xs text-gray-600 px-2 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyPending}
            onChange={(e) => setOnlyPending(e.target.checked)}
            className="w-4 h-4 accent-amber-500"
          />
          Apenas sem atendente
        </label>

        {hasActiveFilter && (
          <button
            onClick={clearFilters}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 px-2"
          >
            <X size={12} /> Limpar
          </button>
        )}
      </div>

      {/* Selecionar todos */}
      {!loading && visibleLeads.length > 0 && (
        <div className="flex items-center gap-3 mb-3 px-1">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            className="w-4 h-4 accent-blue-600 cursor-pointer"
          />
          <span className="text-xs text-gray-500">
            {allSelected
              ? "Desmarcar todos"
              : `Selecionar todos (${visibleLeads.length})`}
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-xl p-4 mb-4 text-sm font-medium bg-red-50 text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-sm text-gray-400">Carregando leads...</div>
      )}

      {!loading && !error && visibleLeads.length === 0 && (
        <EmptyState
          icon={<Inbox size={24} />}
          title="Nenhum lead encontrado"
          message="Tente ajustar os filtros"
        />
      )}

      {/* Grid */}
      {!loading && visibleLeads.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              selected={selectedIds.includes(lead.id)}
              showTeamWarning={false}
              onSelect={toggleSelect}
              onAssign={handleAssignSingle}
              onDelete={handleDeleteSingle}
            />
          ))}
        </div>
      )}

      {/* Lista */}
      {!loading && visibleLeads.length > 0 && viewMode === "list" && (
        <div className="flex flex-col gap-2">
          <LeadListHeader />
          {visibleLeads.map((lead) => (
            <LeadRow
              key={lead.id}
              lead={lead}
              selected={selectedIds.includes(lead.id)}
              showTeamWarning={false}
              onSelect={toggleSelect}
              onAssign={handleAssignSingle}
              onDelete={handleDeleteSingle}
            />
          ))}
        </div>
      )}

      {/* Bulk toolbar */}
      <BulkToolbar
        count={selectedIds.length}
        primaryLabel="Atribuir atendente"
        onPrimary={handleAssignBulk}
        secondaryLabel="Desativar"
        onSecondary={handleDeleteBulk}
        onClear={() => setSelectedIds([])}
      />

      {/* Modal de atribuição */}
      {assignTarget && (
        <AssignAttendantModal
          leads={assignTarget}
          attendants={attendants}
          onClose={() => setAssignTarget(null)}
          onSuccess={() => {
            setAssignTarget(null);
            fetchLeads();
          }}
        />
      )}

      {/* Confirmação de desativação */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Desativar lead(s)?"
        message={
          deleteTarget?.length === 1 ? (
            <>
              Tem certeza que deseja desativar o lead de{" "}
              <span className="font-semibold">
                {deleteTarget[0].customers?.name ?? "Sem nome"}
              </span>
              ?
            </>
          ) : (
            <>
              Tem certeza que deseja desativar{" "}
              <span className="font-semibold">
                {deleteTarget?.length} leads
              </span>
              ?
            </>
          )
        }
        confirmLabel="Desativar"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}