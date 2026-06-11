// src/pages/DashboardManager.tsx
// REFACTOR negociação-cêntrico:
//   - KPIs: negociações ativas, vendas, taxa de fechamento, estagnadas.
//   - Charts: evolução (abertas × ganhas), funil da carteira ativa,
//     ranking de vendas, carga de trabalho, leads parados.
//   - Snapshot (carteira atual): ativas, estagnadas, funil, carga, parados
//     → não mudam com o filtro de período.
//   - Janela (eventos da negociação): vendas, taxa, ranking, evolução.
import { useState, useEffect, useCallback } from "react";
import { useDashboardService } from "../services/dashboardService";
import type {
  DashboardFilters,
  TeamActiveNegotiationsResponse,
  TeamSalesResponse,
  TeamClosingRateResponse,
  StagnantNegotiationsResponse,
  TeamStageFunnelResponse,
  TeamEvolutionResponse,
  SalesByAttendantResponse,
  WorkloadByAttendantResponse,
  IdleLeadsResponse,
} from "../services/dashboardService";

import ManagerKpiCards from "../components/dashboards/manager/ManagerKpiCards";
import ManagerFunnelChart from "../components/dashboards/manager/ManagerFunnelChart";
import ManagerEvolutionChart from "../components/dashboards/manager/ManagerEvolutionChart";
import ManagerSalesByAttendantChart from "../components/dashboards/manager/ManagerSalesByAttendantChart";
import ManagerWorkloadChart from "../components/dashboards/manager/ManagerWorkloadChart";
import ManagerIdleLeadsChart from "../components/dashboards/manager/ManagerIdleLeadsChart";
import ManagerDateFilter from "../components/dashboards/manager/ManagerDateFilter";

// ─────────────────────────────────────────────
// Estado centralizado dos dados
// ─────────────────────────────────────────────
interface DashboardData {
  activeNegotiations: TeamActiveNegotiationsResponse | null;
  sales: TeamSalesResponse | null;
  closingRate: TeamClosingRateResponse | null;
  stagnant: StagnantNegotiationsResponse | null;
  stageFunnel: TeamStageFunnelResponse | null;
  evolution: TeamEvolutionResponse | null;
  salesByAttendant: SalesByAttendantResponse | null;
  workload: WorkloadByAttendantResponse | null;
  idleLeads: IdleLeadsResponse | null;
}

const INITIAL_DATA: DashboardData = {
  activeNegotiations: null,
  sales: null,
  closingRate: null,
  stagnant: null,
  stageFunnel: null,
  evolution: null,
  salesByAttendant: null,
  workload: null,
  idleLeads: null,
};

// Filtro inicial: últimos 30 dias
function defaultFilters(): DashboardFilters {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 30);
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

// ─── Props do Componente ─────────────────────────────────────────────────────
interface DashboardManagerProps {
  targetTeamId?: string;
}

export default function DashboardManager({ targetTeamId }: DashboardManagerProps) {
  const service = useDashboardService();
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [data, setData] = useState<DashboardData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(
    async (f: DashboardFilters) => {
      setLoading(true);
      setError(null);

      // Mescla as datas com o targetTeamId do drill-down do GM.
      // TODAS as chamadas usam finalFilters — os endpoints de snapshot
      // aproveitam só o teamId (o service descarta as datas).
      const finalFilters: DashboardFilters = {
        ...f,
        targetTeamId,
      };

      try {
        const [
          activeNegotiations,
          sales,
          closingRate,
          stagnant,
          stageFunnel,
          evolution,
          salesByAttendant,
          workload,
          idleLeads,
        ] = await Promise.all([
          service.manager.getActiveNegotiations(finalFilters),
          service.manager.getSales(finalFilters),
          service.manager.getClosingRate(finalFilters),
          service.manager.getStagnantNegotiations(finalFilters),
          service.manager.getStageFunnel(finalFilters),
          service.manager.getEvolution(finalFilters),
          service.manager.getSalesByAttendant(finalFilters),
          service.manager.getWorkloadByAttendant(finalFilters),
          service.manager.getIdleLeads(finalFilters),
        ]);

        setData({
          activeNegotiations,
          sales,
          closingRate,
          stagnant,
          stageFunnel,
          evolution,
          salesByAttendant,
          workload,
          idleLeads,
        });
      } catch (err) {
        console.error("Erro ao carregar dashboard do gerente:", err);
        setError("Não foi possível carregar os dados. Tente novamente.");
      } finally {
        setLoading(false);
      }
    },
    [service, targetTeamId],
  );

  useEffect(() => {
    fetchAll(filters);
  }, [filters, fetchAll]);

  function handleFiltersChange(newFilters: DashboardFilters) {
    setFilters(newFilters);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard da Equipe</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Desempenho das negociações da equipe
          </p>
        </div>
        <span
          className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-full font-medium"
          style={{ background: "#EFF6FF", color: "#1E3A8A" }}
        >
          Visão Gerente
        </span>
      </div>

      {/* Filtro — aplica-se às métricas de período (vendas, taxa, ranking,
          evolução). Carteira ativa, estagnadas, funil, carga e leads
          parados são snapshots do estado atual. */}
      <ManagerDateFilter filters={filters} onChange={handleFiltersChange} loading={loading} />

      {/* Erro */}
      {error && (
        <div
          className="rounded-2xl p-5 border text-sm flex items-center justify-between"
          style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#B91C1C" }}
        >
          <span>{error}</span>
          <button
            onClick={() => fetchAll(filters)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ background: "#DC2626", color: "#FFFFFF" }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!error && (
        <>
          {/* KPIs */}
          <ManagerKpiCards
            activeNegotiations={data.activeNegotiations}
            sales={data.sales}
            closingRate={data.closingRate}
            stagnant={data.stagnant}
            loading={loading}
          />

          {/* Row 1: atividade do período + composição da carteira */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ManagerEvolutionChart data={data.evolution} loading={loading} />
            <ManagerFunnelChart data={data.stageFunnel} loading={loading} />
          </div>

          {/* Row 2: desempenho individual */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ManagerSalesByAttendantChart data={data.salesByAttendant} loading={loading} />
            <ManagerWorkloadChart data={data.workload} loading={loading} />
          </div>

          {/* Row 3: backlog acionável */}
          <ManagerIdleLeadsChart data={data.idleLeads} loading={loading} />
        </>
      )}
    </div>
  );
}
