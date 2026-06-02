// src/pages/GMLeads.tsx
//
// Visão de atribuição de leads para GENERAL_MANAGER e ADMIN.
// O GM pode atribuir leads a equipes E a atendentes (qualquer atendente ativo
// da equipe do lead). Suporta seleção individual e em lote.

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Inbox,
  Search,
  UserPlus,
  Users,
  X,
  Building2,
} from "lucide-react";
import { useLeadService } from "../services/leadService";
import type { LeadStatus } from "../services/leadService";
import { useTeamsService } from "../services/teamService";
import type { Team } from "../services/teamService";
import { useStoresService } from "../services/storesService";
import type { Store } from "../services/storesService";
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

// ─── Tab switcher interno ────────────────────────────────────────────────────

type AssignTab = "team" | "attendant";

function TabBtn({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-xl transition-colors ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── AssignGMModal ────────────────────────────────────────────────────────────
// Modal unificado: aba "Equipe" atribui via bulk/assign-team (zera atendente);
// aba "Atendente" chama assignLead individualmente (Promise.allSettled).
//
// Regra de negócio respeitada:
//   • Para atribuir atendente, o lead precisa ter equipe.
//   • O atendente precisa pertencer à equipe do lead.
//   • Se a seleção contém leads de times diferentes, só aparecem atendentes
//     presentes em TODOS eles (mesma lógica do ManagerLeads).

function AssignGMModal({
  leads,
  initialTab,
  teams,
  stores,
  onClose,
  onSuccess,
}: {
  leads: LeadFull[];
  initialTab: AssignTab;
  teams: Team[];
  stores: Store[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { bulkAssignTeam, bulkAssignLeads } = useLeadService();
  const { getUsers } = useUserService();

  const [tab, setTab] = useState<AssignTab>(initialTab);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Aba equipe ──
  const [storeId, setStoreId] = useState("");
  const [teamId, setTeamId] = useState("");

  const teamsForStore = useMemo(
    () =>
      storeId
        ? teams.filter((t) => t.store_id === storeId && t.is_active)
        : teams.filter((t) => t.is_active),
    [teams, storeId],
  );

  // ── Aba atendente ──
  const [attendants, setAttendants] = useState<User[]>([]);
  const [attendantsLoading, setAttendantsLoading] = useState(false);
  const [attendantId, setAttendantId] = useState("");

  // Leads que têm equipe (podem receber atendente)
  const leadsWithTeam = useMemo(
    () => leads.filter((l) => !!l.team_id),
    [leads],
  );
  const leadsWithoutTeam = leads.length - leadsWithTeam.length;

  // Times únicos dos leads selecionados (apenas leads com equipe)
  const teamIds = useMemo(
    () =>
      Array.from(
        new Set(
          leadsWithTeam
            .map((l) => l.team_id)
            .filter((t): t is string => !!t),
        ),
      ),
    [leadsWithTeam],
  );
  const multipleTeams = teamIds.length > 1;

  // Carrega atendentes ao abrir aba ou ao mudar leads
  useEffect(() => {
    if (tab !== "attendant" || teamIds.length === 0) return;
    setAttendantsLoading(true);
    setAttendantId("");

    // Busca por cada time, depois intersecta (atendentes que pertencem a todos)
    Promise.all(teamIds.map((tid) => getUsers({ role: "ATTENDANT", team_id: tid })))
      .then((results) => {
        // Filtra ativos client-side (evita enviar boolean na querystring)
        const byTeam = results.map((r) =>
          r.data.filter((u) => u.is_active).map((u) => u.id),
        );
        // Interseção: ids presentes em todos os arrays
        const intersection = byTeam.reduce(
          (acc, ids) => acc.filter((id) => ids.includes(id)),
          byTeam[0] ?? [],
        );
        // Reconstrói lista de User com os ids que passaram
        const allUsers = results.flatMap((r) => r.data.filter((u) => u.is_active));
        const uniqueMap = new Map(allUsers.map((u) => [u.id, u]));
        setAttendants(
          intersection
            .map((id) => uniqueMap.get(id))
            .filter((u): u is User => !!u),
        );
      })
      .catch(() => setAttendants([]))
      .finally(() => setAttendantsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, teamIds.join(",")]);

  // ── Submit ──
  async function handleSubmit() {
    setError(null);

    if (tab === "team") {
      if (!teamId) { setError("Selecione uma equipe."); return; }
      try {
        setSubmitting(true);
        await bulkAssignTeam(leads.map((l) => l.id), teamId);
        onSuccess();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao atribuir equipe.");
      } finally {
        setSubmitting(false);
      }
    } else {
      if (!attendantId) { setError("Selecione um atendente."); return; }
      if (leadsWithTeam.length === 0) {
        setError("Nenhum lead com equipe selecionado.");
        return;
      }
      try {
        setSubmitting(true);
        const results = await bulkAssignLeads(
          leadsWithTeam.map((l) => l.id),
          attendantId,
        );
        const failures = results.filter((r) => r.status === "rejected").length;
        if (failures > 0) {
          setError(`${failures} de ${leadsWithTeam.length} atribuições falharam.`);
          return;
        }
        onSuccess();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro ao atribuir atendente.");
      } finally {
        setSubmitting(false);
      }
    }
  }

  const count = leads.length;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-5">

        {/* Header */}
        <div>
          <h2 className="text-lg font-bold text-gray-900">Atribuir lead{count > 1 ? "s" : ""}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {count === 1
              ? leads[0].customers?.name ?? "Sem nome"
              : `${count} leads selecionados`}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
          <TabBtn
            active={tab === "team"}
            icon={<Building2 size={14} />}
            label="Equipe"
            onClick={() => { setTab("team"); setError(null); }}
          />
          <TabBtn
            active={tab === "attendant"}
            icon={<UserPlus size={14} />}
            label="Atendente"
            onClick={() => { setTab("attendant"); setError(null); }}
          />
        </div>

        {/* ── Conteúdo: Equipe ── */}
        {tab === "team" && (
          <div className="flex flex-col gap-3">
            <label className="block">
              <span className="text-xs font-medium text-gray-700 block mb-1">
                Loja (filtro)
              </span>
              <select
                value={storeId}
                onChange={(e) => { setStoreId(e.target.value); setTeamId(""); }}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Todas as lojas</option>
                {stores.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-xs font-medium text-gray-700 block mb-1">
                Equipe *
              </span>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Selecione...</option>
                {teamsForStore.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </label>

            <p className="text-[11px] text-gray-400">
              Ao trocar de equipe, o atendente atual de cada lead será removido.
            </p>
          </div>
        )}

        {/* ── Conteúdo: Atendente ── */}
        {tab === "attendant" && (
          <div className="flex flex-col gap-3">
            {/* Aviso: leads sem equipe serão ignorados */}
            {leadsWithoutTeam > 0 && (
              <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-3 py-2">
                {leadsWithoutTeam === count
                  ? "Nenhum lead selecionado tem equipe. Atribua uma equipe primeiro."
                  : `${leadsWithoutTeam} lead${leadsWithoutTeam > 1 ? "s" : ""} sem equipe será${leadsWithoutTeam > 1 ? "ão" : ""} ignorado${leadsWithoutTeam > 1 ? "s" : ""}.`}
              </div>
            )}

            {multipleTeams && (
              <div className="text-xs bg-blue-50 border border-blue-200 text-blue-800 rounded-lg px-3 py-2">
                Leads de equipes diferentes selecionados. Apenas atendentes vinculados
                a todas elas aparecem abaixo.
              </div>
            )}

            <label className="block">
              <span className="text-xs font-medium text-gray-700 block mb-1">
                Atendente *
              </span>
              {attendantsLoading ? (
                <p className="text-xs text-gray-400 py-2">Carregando atendentes...</p>
              ) : (
                <select
                  value={attendantId}
                  onChange={(e) => setAttendantId(e.target.value)}
                  disabled={leadsWithTeam.length === 0}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50"
                >
                  <option value="">Selecione...</option>
                  {attendants.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              )}
              {!attendantsLoading && attendants.length === 0 && leadsWithTeam.length > 0 && (
                <span className="text-xs text-amber-600 mt-1 block">
                  Nenhum atendente elegível encontrado para esta seleção.
                </span>
              )}
            </label>
          </div>
        )}

        {/* Erro */}
        {error && (
          <div className="text-xs font-medium text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {/* Ações */}
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
            disabled={
              submitting ||
              (tab === "team" && !teamId) ||
              (tab === "attendant" && (!attendantId || leadsWithTeam.length === 0))
            }
            className="flex-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-xl py-2 transition-colors"
          >
            {submitting ? "Atribuindo..." : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── GMBulkToolbar ─────────────────────────────────────────────────────────
// Toolbar com três ações: equipe, atendente, desativar.

function GMBulkToolbar({
  count,
  onAssignTeam,
  onAssignAttendant,
  onDelete,
  onClear,
}: {
  count: number;
  onAssignTeam: () => void;
  onAssignAttendant: () => void;
  onDelete: () => void;
  onClear: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-gray-900 text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-3 flex-wrap justify-center">
      <div className="flex items-center gap-2 text-sm">
        <span className="bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {count}
        </span>
        <span>selecionado{count > 1 ? "s" : ""}</span>
      </div>
      <div className="h-5 w-px bg-white/20" />
      <button
        onClick={onAssignTeam}
        className="text-sm font-medium bg-blue-600 hover:bg-blue-700 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1.5"
      >
        <Building2 size={14} />
        Equipe
      </button>
      <button
        onClick={onAssignAttendant}
        className="text-sm font-medium bg-indigo-600 hover:bg-indigo-700 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1.5"
      >
        <UserPlus size={14} />
        Atendente
      </button>
      <button
        onClick={onDelete}
        className="text-sm font-medium bg-red-600 hover:bg-red-700 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1.5"
      >
        Desativar
      </button>
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

// ─── GMLeads ─────────────────────────────────────────────────────────────────

export default function GMLeads() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { getLeads, updateLead } = useLeadService();
  const { getTeams } = useTeamsService();
  const { getStores } = useStoresService();

  // Proteção de rota
  useEffect(() => {
    if (user && user.role !== "GENERAL_MANAGER" && user.role !== "ADMIN") {
      navigate("/403");
    }
  }, [user, navigate]);

  // ── Estado ──
  const [leads, setLeads] = useState<LeadFull[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [filterStoreId, setFilterStoreId] = useState("");
  const [filterTeamId, setFilterTeamId] = useState("");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "">("");
  const [onlyPending, setOnlyPending] = useState(false);

  // Visualização + seleção
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modais — assignTarget carrega leads; assignTab define qual aba abre
  const [assignTarget, setAssignTarget] = useState<LeadFull[] | null>(null);
  const [assignTab, setAssignTab] = useState<AssignTab>("team");
  const [deleteTarget, setDeleteTarget] = useState<LeadFull[] | null>(null);

  // ── Carrega dados de referência ──
  useEffect(() => {
    getTeams().then(setTeams).catch(() => {});
    getStores().then(setStores).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Busca leads ──
  async function fetchLeads() {
    setLoading(true);
    setError(null);
    setSelectedIds([]);
    try {
      const data = await getLeads({
        team_id: filterTeamId || undefined,
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
  }, [filterTeamId, filterStatus]);

  function handleStoreChange(storeId: string) {
    setFilterStoreId(storeId);
    setFilterTeamId("");
  }

  const teamsForFilter = filterStoreId
    ? teams.filter((t) => t.store_id === filterStoreId)
    : teams;

  // ── Filtro + ordenação local ──
  const visibleLeads = useMemo(() => {
    let result = leads;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((l) => {
        const name = (l.customers?.name ?? "").toLowerCase();
        const email = (l.customers?.email ?? "").toLowerCase();
        const cpf = l.customers?.cpf ?? "";
        const refCode = l.interest_item?.reference_code ?? "";
        return name.includes(q) || email.includes(q) || cpf.includes(q) || refCode.includes(q);
      });
    }

    if (filterStoreId) {
      const storeTeamIds = new Set(
        teams.filter((t) => t.store_id === filterStoreId).map((t) => t.id),
      );
      result = result.filter((l) => l.team_id && storeTeamIds.has(l.team_id));
    }

    if (onlyPending) {
      result = result.filter((l) => !l.team_id || !l.attendant_id);
    }

    return sortByPriority(result, { byTeam: true });
  }, [leads, search, filterStoreId, teams, onlyPending]);

  // ── Seleção ──
  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }
  function toggleSelectAll() {
    setSelectedIds(
      selectedIds.length === visibleLeads.length ? [] : visibleLeads.map((l) => l.id),
    );
  }
  const allSelected = visibleLeads.length > 0 && selectedIds.length === visibleLeads.length;

  // ── Helpers para abrir modal ──
  function openAssign(targets: LeadFull[], tab: AssignTab) {
    setAssignTab(tab);
    setAssignTarget(targets);
  }

  // Individual: detecta tab ideal pelo estado do lead
  function handleAssignSingle(lead: LeadFull) {
    openAssign([lead], lead.team_id ? "attendant" : "team");
  }

  // Lote: botões explícitos no toolbar
  function handleAssignTeamBulk() {
    const targets = leads.filter((l) => selectedIds.includes(l.id));
    if (targets.length > 0) openAssign(targets, "team");
  }
  function handleAssignAttendantBulk() {
    const targets = leads.filter((l) => selectedIds.includes(l.id));
    if (targets.length > 0) openAssign(targets, "attendant");
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
      await Promise.all(deleteTarget.map((l) => updateLead(l.id, { is_active: false })));
      setDeleteTarget(null);
      fetchLeads();
    } catch {
      alert("Erro ao desativar lead(s).");
    }
  }

  function clearFilters() {
    setSearch("");
    setFilterStoreId("");
    setFilterTeamId("");
    setFilterStatus("");
    setOnlyPending(false);
  }

  const missingTeam = leads.filter((l) => !l.team_id).length;
  const missingAttendant = leads.filter((l) => l.team_id && !l.attendant_id).length;
  const hasActiveFilter = !!search || !!filterStoreId || !!filterTeamId || !!filterStatus || onlyPending;

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8 pb-32">

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Atribuição de Leads</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading
              ? "Carregando..."
              : `${visibleLeads.length} lead${visibleLeads.length !== 1 ? "s" : ""} visível${visibleLeads.length !== 1 ? "is" : ""}`}
          </p>
        </div>
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {/* Banners de pendência */}
      {(missingTeam > 0 || missingAttendant > 0) && (
        <div className="flex flex-wrap gap-3 mb-4">
          {missingTeam > 0 && (
            <button
              onClick={() => setOnlyPending(true)}
              className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-3 py-2 text-xs font-medium hover:bg-amber-100 transition-colors"
            >
              <Users size={13} />
              {missingTeam} sem equipe — atribuir
            </button>
          )}
          {missingAttendant > 0 && (
            <button
              onClick={() => setOnlyPending(true)}
              className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-3 py-2 text-xs font-medium hover:bg-amber-100 transition-colors"
            >
              <UserPlus size={13} />
              {missingAttendant} sem atendente
            </button>
          )}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-200 p-3 mb-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-50">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, email, CPF ou item..."
            className="w-full text-sm pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-blue-300"
          />
        </div>

        <select
          value={filterStoreId}
          onChange={(e) => handleStoreChange(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 hover:bg-white"
        >
          <option value="">Todas as lojas</option>
          {stores.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        <select
          value={filterTeamId}
          onChange={(e) => setFilterTeamId(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 hover:bg-white"
        >
          <option value="">Todas as equipes</option>
          {teamsForFilter.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
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
          Apenas pendentes
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
            {allSelected ? "Desmarcar todos" : `Selecionar todos (${visibleLeads.length})`}
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-xl p-4 mb-4 text-sm font-medium bg-red-50 text-red-600">{error}</div>
      )}

      {loading && <div className="text-sm text-gray-400">Carregando leads...</div>}

      {!loading && !error && visibleLeads.length === 0 && (
        <EmptyState icon={<Inbox size={24} />} title="Nenhum lead encontrado" message="Tente ajustar os filtros" />
      )}

      {/* Grid */}
      {!loading && visibleLeads.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              selected={selectedIds.includes(lead.id)}
              showTeamWarning={true}
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
              showTeamWarning={true}
              onSelect={toggleSelect}
              onAssign={handleAssignSingle}
              onDelete={handleDeleteSingle}
            />
          ))}
        </div>
      )}

      {/* Toolbar em lote — 3 ações */}
      <GMBulkToolbar
        count={selectedIds.length}
        onAssignTeam={handleAssignTeamBulk}
        onAssignAttendant={handleAssignAttendantBulk}
        onDelete={handleDeleteBulk}
        onClear={() => setSelectedIds([])}
      />

      {/* Modal unificado */}
      {assignTarget && (
        <AssignGMModal
          leads={assignTarget}
          initialTab={assignTab}
          teams={teams}
          stores={stores}
          onClose={() => setAssignTarget(null)}
          onSuccess={() => { setAssignTarget(null); fetchLeads(); }}
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
              <span className="font-semibold">{deleteTarget[0].customers?.name ?? "Sem nome"}</span>?
            </>
          ) : (
            <>
              Tem certeza que deseja desativar{" "}
              <span className="font-semibold">{deleteTarget?.length} leads</span>?
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