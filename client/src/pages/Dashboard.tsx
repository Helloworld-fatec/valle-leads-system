// src/pages/Dashboard.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import DashboardAttendant from "./DashboardAttendant";
import DashboardManager from "./DashboardManager";
import DashboardGeneralManager from "./DashboardGeneralManager";
import Forbidden from "./Forbidden";

/**
 * Orquestra qual dashboard renderizar conforme o role do usuário autenticado.
 *
 * ATTENDANT       → DashboardAttendant  (só vê a própria performance)
 * MANAGER         → DashboardManager    (vê equipe + todos os atendentes da equipe)
 *                   → passa automaticamente o primeiro team_id do token como filtro
 *                      (evita o 400 "ID da equipa é obrigatório")
 * GENERAL_MANAGER → DashboardGeneralManager (visão global) + abas para:
 *                   • visão por equipe (seleciona teamId → DashboardManager)
 *                   • visão por atendente (seleciona attendantId → DashboardAttendant)
 * ADMIN           → idêntico ao GENERAL_MANAGER
 * qualquer outro  → Forbidden (403)
 */

// ── Tipos de visão ─────────────────────────────────────────────────────
type GmView   = "global" | "team" | "attendant";
type ManagerView = "team" | "attendant";

// ── Tipo mínimo para itens de seleção ───────────────────────────────────
interface SelectOption {
  id: string;
  name: string;
}

// ────────────────────────────────────────────────────────────────────────
// Sub-wrapper para MANAGER
// Duas abas: "Equipe" e "Atendentes".
// - Equipe:      DashboardManager com o teamId do próprio token (nunca outro)
// - Atendentes:  lista só os usuários das equipes do token; ao selecionar
//                um, abre DashboardAttendant com targetAttendantId
// ────────────────────────────────────────────────────────────────────────
function ManagerWrapper() {
  const { user } = useAuth();
  const teamIds: string[] = user?.team_ids ?? [];
  const [view, setView] = useState<ManagerView>("team");
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teamIds[0] ?? "");
  const [selectedAttendant, setSelectedAttendant] = useState<SelectOption | null>(null);

  if (teamIds.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 text-sm">
          Você não está associado a nenhuma equipe. Contate o administrador.
        </p>
      </div>
    );
  }

  const managerTabs: { key: ManagerView; label: string }[] = [
    { key: "team",      label: "Minha Equipe" },
    { key: "attendant", label: "Atendentes"   },
  ];

  return (
    <div className="flex flex-col gap-0">
      {/* Tab bar */}
      <div className="px-6 pt-5 pb-0 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex gap-1">
          {managerTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setView(tab.key);
                // Volta para a lista ao trocar de aba
                if (tab.key === "attendant") setSelectedAttendant(null);
              }}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all border-b-2 -mb-px ${
                view === tab.key
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Aba: Equipe — só as equipes do próprio token */}
      {view === "team" && (
        <div className="flex flex-col gap-0">
          {teamIds.length > 1 && (
            <div className="px-6 pt-4 pb-2 flex items-center gap-3 border-b border-gray-100">
              <span className="text-sm text-gray-500 font-medium">Equipe:</span>
              <div className="flex gap-2 flex-wrap">
                {teamIds.map((tid) => (
                  <button
                    key={tid}
                    onClick={() => setSelectedTeamId(tid)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedTeamId === tid
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tid}
                  </button>
                ))}
              </div>
            </div>
          )}
          <DashboardManager targetTeamId={selectedTeamId} />
        </div>
      )}

      {/* Aba: Atendentes — filtrados pelas equipes do token */}
      {view === "attendant" && (
        <ManagerAttendantDrillDown
          teamIds={teamIds}
          selectedAttendant={selectedAttendant}
          onSelectAttendant={setSelectedAttendant}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Drill-down de atendente para MANAGER
// Usa /api/users filtrando pelo primeiro team_id do manager — o backend
// já aplica o escopo do token, então nunca retorna usuários de outras equipes.
// ────────────────────────────────────────────────────────────────────────
function ManagerAttendantDrillDown({
  teamIds,
  selectedAttendant,
  onSelectAttendant,
}: {
  teamIds: string[];
  selectedAttendant: SelectOption | null;
  onSelectAttendant: (a: SelectOption | null) => void;
}) {
  const dashSvc = useDashboardService();
  const [attendants, setAttendants] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca usuários — o backend filtra pelo escopo do token do manager,
    // então não precisamos (nem devemos) passar team_id de outra equipe.
    dashSvc.auxiliary
      .getUsers()
      .then((data: any[]) =>
        setAttendants(
          data
            .filter((u) => u.role === "ATTENDANT" && u.is_active !== false)
            .map((u) => ({ id: u.id, name: u.name }))
        )
      )
      .catch(() => setAttendants([]))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <LoadingSpinner label="Carregando atendentes..." />;

  if (!selectedAttendant) {
    return (
      <div className="p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          Selecione um atendente para ver o desempenho
        </h2>
        {attendants.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum atendente encontrado na sua equipe.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {attendants.map((att) => (
              <button
                key={att.id}
                onClick={() => onSelectAttendant(att)}
                className="p-4 rounded-xl border border-gray-200 bg-white hover:border-indigo-400 hover:shadow-md transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-tight">{att.name}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      <div className="px-6 py-3 flex items-center gap-2 bg-gray-50 border-b border-gray-200">
        <button
          onClick={() => onSelectAttendant(null)}
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Todos os atendentes
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-700">{selectedAttendant.name}</span>
      </div>
      <DashboardAttendant targetAttendantId={selectedAttendant.id} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Sub-wrapper para GENERAL_MANAGER / ADMIN
// Oferece 3 visões: Global, Por Equipe, Por Atendente
// ────────────────────────────────────────────────────────────────────────
function GeneralManagerWrapper() {
  const [view, setView] = useState<GmView>("global");
  const [selectedTeam, setSelectedTeam] = useState<SelectOption | null>(null);
  const [selectedAttendant, setSelectedAttendant] = useState<SelectOption | null>(null);

  const tabs: { key: GmView; label: string }[] = [
    { key: "global", label: "Visão Global" },
    { key: "team", label: "Por Equipe" },
    { key: "attendant", label: "Por Atendente" },
  ];

  return (
    <div className="flex flex-col gap-0">
      {/* Tab bar */}
      <div className="px-6 pt-5 pb-0 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all border-b-2 -mb-px ${
                view === tab.key
                  ? "border-blue-600 text-blue-600 bg-white"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conteúdo por aba */}
      {view === "global" && (
        <DashboardGeneralManager />
      )}

      {view === "team" && (
        <TeamDrillDown
          selectedTeam={selectedTeam}
          onSelectTeam={setSelectedTeam}
        />
      )}

      {view === "attendant" && (
        <AttendantDrillDown
          selectedAttendant={selectedAttendant}
          onSelectAttendant={setSelectedAttendant}
        />
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Drill-down de equipe para GM/Admin
// Carrega a lista de equipes via auxiliary.getTeams() e renderiza
// DashboardManager com o teamId selecionado.
// ────────────────────────────────────────────────────────────────────────
import { useEffect } from "react";
import { useDashboardService } from "../services/dashboardService";

function TeamDrillDown({
  selectedTeam,
  onSelectTeam,
}: {
  selectedTeam: SelectOption | null;
  onSelectTeam: (t: SelectOption | null) => void;
}) {
  const dashSvc = useDashboardService();
  const [teams, setTeams] = useState<SelectOption[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  useEffect(() => {
    dashSvc.auxiliary
      .getTeams()
      .then((data: any[]) =>
        setTeams(data.map((t) => ({ id: t.id, name: t.name })))
      )
      .catch(() => setTeams([]))
      .finally(() => setLoadingTeams(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loadingTeams) {
    return <LoadingSpinner label="Carregando equipes..." />;
  }

  if (!selectedTeam) {
    return (
      <div className="p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          Selecione uma equipe para ver o dashboard
        </h2>
        {teams.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma equipe encontrada.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {teams.map((team) => (
              <button
                key={team.id}
                onClick={() => onSelectTeam(team)}
                className="p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-400 hover:shadow-md transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-tight">{team.name}</p>
                <p className="text-xs text-gray-400 mt-1 truncate">{team.id}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Breadcrumb / voltar */}
      <div className="px-6 py-3 flex items-center gap-2 bg-gray-50 border-b border-gray-200">
        <button
          onClick={() => onSelectTeam(null)}
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Todas as equipes
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-700">{selectedTeam.name}</span>
      </div>
      <DashboardManager targetTeamId={selectedTeam.id} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Drill-down de atendente para GM/Admin
// Carrega a lista de usuários com role ATTENDANT e renderiza
// DashboardAttendant com o attendantId selecionado.
// ────────────────────────────────────────────────────────────────────────
function AttendantDrillDown({
  selectedAttendant,
  onSelectAttendant,
}: {
  selectedAttendant: SelectOption | null;
  onSelectAttendant: (a: SelectOption | null) => void;
}) {
  const dashSvc = useDashboardService();
  const [attendants, setAttendants] = useState<SelectOption[]>([]);
  const [loadingAttendants, setLoadingAttendants] = useState(true);

  useEffect(() => {
    dashSvc.auxiliary
      .getUsers()
      .then((data: any[]) =>
        setAttendants(
          data
            .filter((u) => u.role === "ATTENDANT" && u.is_active !== false)
            .map((u) => ({ id: u.id, name: u.name }))
        )
      )
      .catch(() => setAttendants([]))
      .finally(() => setLoadingAttendants(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loadingAttendants) {
    return <LoadingSpinner label="Carregando atendentes..." />;
  }

  if (!selectedAttendant) {
    return (
      <div className="p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          Selecione um atendente para ver o dashboard
        </h2>
        {attendants.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhum atendente encontrado.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {attendants.map((att) => (
              <button
                key={att.id}
                onClick={() => onSelectAttendant(att)}
                className="p-4 rounded-xl border border-gray-200 bg-white hover:border-indigo-400 hover:shadow-md transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center mb-3 group-hover:bg-indigo-100 transition-colors">
                  <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-800 leading-tight">{att.name}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Breadcrumb / voltar */}
      <div className="px-6 py-3 flex items-center gap-2 bg-gray-50 border-b border-gray-200">
        <button
          onClick={() => onSelectAttendant(null)}
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Todos os atendentes
        </button>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-medium text-gray-700">{selectedAttendant.name}</span>
      </div>
      <DashboardAttendant targetAttendantId={selectedAttendant.id} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Spinner reutilizável
// ────────────────────────────────────────────────────────────────────────
function LoadingSpinner({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="w-7 h-7 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-400">{label}</span>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
// Componente raiz
// ────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  switch (user.role) {
    case "ATTENDANT":
      // Atendente sempre vê o próprio dashboard; targetAttendantId não é
      // necessário porque o backend aplica o escopo pelo token.
      return <DashboardAttendant />;

    case "MANAGER":
      // ManagerWrapper injeta automaticamente o team_id do token,
      // corrigindo o 400 "ID da equipa é obrigatório".
      return <ManagerWrapper />;

    case "GENERAL_MANAGER":
    case "ADMIN":
      // GeneralManagerWrapper oferece abas: Global / Por Equipe / Por Atendente
      return <GeneralManagerWrapper />;

    default:
      return <Forbidden onNavigate={navigate} />;
  }
}