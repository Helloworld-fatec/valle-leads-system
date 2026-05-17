// src/pages/DashboardGeneralManager.tsx
import { useState, useCallback, useEffect } from "react";
import { useDashboardService } from "../services/dashboardService";
import type {
  DashboardFilters,
  GlobalKpisResponse,
  TopTeamResponse,
  LeadsByTeamResponse,
  TeamRankingResponse,
  GlobalEvolutionResponse,
  GlobalFunnelResponse,
} from "../services/dashboardService";

// Child components
import GlobalKpiCards from "../components/dashboards/general-manager/GlobalKpiCards";
import LeadsByTeamChart from "../components/dashboards/general-manager/LeadsByTeamChart";
import TeamRankingChart from "../components/dashboards/general-manager/TeamRankingChart";
import GlobalEvolutionChart from "../components/dashboards/general-manager/GlobalEvolutionChart";
import GlobalFunnelChart from "../components/dashboards/general-manager/GlobalFunnelChart";
import DashboardFilterBar from "../components/dashboards/general-manager/DashboardFilterBar";

// ─────────────────────────────────────────────
// State shape
// ─────────────────────────────────────────────
interface DashboardState {
  kpis: GlobalKpisResponse | null;
  topTeam: TopTeamResponse | null;
  leadsByTeam: LeadsByTeamResponse | null;
  teamRanking: TeamRankingResponse | null;
  evolution: GlobalEvolutionResponse | null;
  funnel: GlobalFunnelResponse | null;
}

const INITIAL_STATE: DashboardState = {
  kpis: null,
  topTeam: null,
  leadsByTeam: null,
  teamRanking: null,
  evolution: null,
  funnel: null,
};

// ─────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────
export default function DashboardGeneralManager() {
  const svc = useDashboardService();

  const [filters, setFilters] = useState<DashboardFilters>({});
  const [pendingFilters, setPendingFilters] = useState<DashboardFilters>({});
  const [data, setData] = useState<DashboardState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(
    async (f: DashboardFilters) => {
      setLoading(true);
      setError(null);
      try {
        const [kpis, topTeam, leadsByTeam, teamRanking, evolution, funnel] =
          await Promise.all([
            svc.generalManager.getGlobalKpis(f),
            svc.generalManager.getTopTeam(f),
            svc.generalManager.getLeadsByTeam(f),
            svc.generalManager.getTeamRanking(f),
            svc.generalManager.getGlobalEvolution(f),
            svc.generalManager.getGlobalFunnel(f),
          ]);
        setData({ kpis, topTeam, leadsByTeam, teamRanking, evolution, funnel });
      } catch (err) {
        console.error("DashboardGeneralManager fetch error:", err);
        setError("Não foi possível carregar os dados. Tente novamente.");
      } finally {
        setLoading(false);
      }
    },
    [svc]
  );

  // Initial load
  useEffect(() => {
    fetchAll({});
  }, [fetchAll]);

  function handleApplyFilters() {
    setFilters(pendingFilters);
    fetchAll(pendingFilters);
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: "#111827" }}>
            Dashboard — Gerência Geral
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
            Visão consolidada de todas as equipes e leads
          </p>
        </div>
        <span
          className="self-start sm:self-center text-xs px-3 py-1.5 rounded-full font-semibold"
          style={{ background: "#F5F3FF", color: "#7C3AED" }}
        >
          🌐 Gerente Geral
        </span>
      </div>

      {/* Filter Bar */}
      <DashboardFilterBar
        filters={pendingFilters}
        onChange={setPendingFilters}
        onApply={handleApplyFilters}
        loading={loading}
      />

      {/* Error Banner */}
      {error && (
        <div
          className="rounded-xl px-5 py-4 flex items-center gap-3 border"
          style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#DC2626" }}
        >
          <span className="text-lg">⚠️</span>
          <span className="text-sm font-medium">{error}</span>
          <button
            onClick={handleApplyFilters}
            className="ml-auto text-xs font-semibold underline"
            style={{ color: "#DC2626" }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <GlobalKpiCards
        kpis={data.kpis}
        topTeam={data.topTeam}
        loading={loading}
      />

      {/* Charts Row 1: Evolution + Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <GlobalEvolutionChart data={data.evolution} loading={loading} />
        <GlobalFunnelChart data={data.funnel} loading={loading} />
      </div>

      {/* Charts Row 2: Leads by Team + Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <LeadsByTeamChart data={data.leadsByTeam} loading={loading} />
        <TeamRankingChart data={data.teamRanking} loading={loading} />
      </div>
    </div>
  );
}
