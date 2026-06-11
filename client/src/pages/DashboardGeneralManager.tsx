// src/pages/DashboardGeneralManager.tsx
// REFACTOR negociação-cêntrico:
//   - KPIs: negociações ativas, vendas, valor vendido (R$), valor em pipeline (R$).
//   - Charts: evolução global (abertas × ganhas), funil global, ranking de
//     equipes, vendas por loja, leads parados.
//   - Snapshot (estado atual): ativas, pipeline, funil, leads parados
//     → não mudam com o filtro de período.
//   - Janela (eventos da negociação): vendas, valor vendido, ranking,
//     lojas, evolução.
import { useState, useCallback, useEffect } from "react";
import { useDashboardService } from "../services/dashboardService";
import type {
  DashboardFilters,
  GlobalActiveNegotiationsResponse,
  GlobalSalesResponse,
  SalesValueResponse,
  PipelineValueResponse,
  GlobalStageFunnelResponse,
  GlobalEvolutionResponse,
  SalesByTeamResponse,
  SalesByStoreResponse,
  IdleLeadsResponse,
} from "../services/dashboardService";

// Child components
import GlobalKpiCards from "../components/dashboards/general-manager/GlobalKpiCards";
import GlobalFunnelChart from "../components/dashboards/general-manager/GlobalFunnelChart";
import GlobalEvolutionChart from "../components/dashboards/general-manager/GlobalEvolutionChart";
import SalesByTeamChart from "../components/dashboards/general-manager/SalesByTeamChart";
import SalesByStoreChart from "../components/dashboards/general-manager/SalesByStoreChart";
import GlobalIdleLeadsChart from "../components/dashboards/general-manager/GlobalIdleLeadsChart";
import DashboardFilterBar from "../components/dashboards/general-manager/DashboardFilterBar";

// ─────────────────────────────────────────────
// State shape
// ─────────────────────────────────────────────
interface DashboardState {
  activeNegotiations: GlobalActiveNegotiationsResponse | null;
  sales: GlobalSalesResponse | null;
  salesValue: SalesValueResponse | null;
  pipelineValue: PipelineValueResponse | null;
  funnel: GlobalStageFunnelResponse | null;
  evolution: GlobalEvolutionResponse | null;
  salesByTeam: SalesByTeamResponse | null;
  salesByStore: SalesByStoreResponse | null;
  idleLeads: IdleLeadsResponse | null;
}

const INITIAL_STATE: DashboardState = {
  activeNegotiations: null,
  sales: null,
  salesValue: null,
  pipelineValue: null,
  funnel: null,
  evolution: null,
  salesByTeam: null,
  salesByStore: null,
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

// ─────────────────────────────────────────────
// Page Component
// ─────────────────────────────────────────────
export default function DashboardGeneralManager() {
  const svc = useDashboardService();

  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [pendingFilters, setPendingFilters] = useState<DashboardFilters>(defaultFilters);
  const [data, setData] = useState<DashboardState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(
    async (f: DashboardFilters) => {
      setLoading(true);
      setError(null);
      try {
        // Snapshots (ativas, pipeline, funil, leads parados) não recebem
        // filtros — representam o estado ATUAL da empresa.
        const [
          activeNegotiations,
          sales,
          salesValue,
          pipelineValue,
          funnel,
          evolution,
          salesByTeam,
          salesByStore,
          idleLeads,
        ] = await Promise.all([
          svc.generalManager.getActiveNegotiations(),
          svc.generalManager.getSales(f),
          svc.generalManager.getSalesValue(f),
          svc.generalManager.getPipelineValue(),
          svc.generalManager.getStageFunnel(),
          svc.generalManager.getEvolution(f),
          svc.generalManager.getSalesByTeam(f),
          svc.generalManager.getSalesByStore(f),
          svc.generalManager.getIdleLeads(),
        ]);

        setData({
          activeNegotiations,
          sales,
          salesValue,
          pipelineValue,
          funnel,
          evolution,
          salesByTeam,
          salesByStore,
          idleLeads,
        });
      } catch (err) {
        console.error("DashboardGeneralManager fetch error:", err);
        setError("Não foi possível carregar os dados. Tente novamente.");
      } finally {
        setLoading(false);
      }
    },
    [svc],
  );

  // Initial load
  useEffect(() => {
    fetchAll(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAll]);

  function handleApply() {
    setFilters(pendingFilters);
    fetchAll(pendingFilters);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard Geral</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Desempenho das negociações em toda a empresa
          </p>
        </div>
        <span
          className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-full font-medium"
          style={{ background: "#FEF3C7", color: "#92400E" }}
        >
          Visão Gerente Geral
        </span>
      </div>

      {/* Filtro — aplica-se às métricas de período (vendas, valor vendido,
          ranking, lojas, evolução). Carteira ativa, pipeline, funil e leads
          parados são snapshots do estado atual. */}
      <DashboardFilterBar
        filters={pendingFilters}
        onChange={setPendingFilters}
        onApply={handleApply}
        loading={loading}
      />

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
          <GlobalKpiCards
            activeNegotiations={data.activeNegotiations}
            sales={data.sales}
            salesValue={data.salesValue}
            pipelineValue={data.pipelineValue}
            loading={loading}
          />

          {/* Row 1: atividade do período + composição da carteira */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <GlobalEvolutionChart data={data.evolution} loading={loading} />
            <GlobalFunnelChart data={data.funnel} loading={loading} />
          </div>

          {/* Row 2: hierarquia comercial */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <SalesByTeamChart data={data.salesByTeam} loading={loading} />
            <SalesByStoreChart data={data.salesByStore} loading={loading} />
          </div>

          {/* Row 3: backlog acionável */}
          <GlobalIdleLeadsChart data={data.idleLeads} loading={loading} />
        </>
      )}
    </div>
  );
}
