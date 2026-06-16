// src/pages/DashboardAttendant.tsx
// REFACTOR negociação-cêntrico:
//   - KPIs e charts agora medem NEGOCIAÇÕES (aberturas, vendas, fechamento),
//     não mais leads criados.
//   - Snapshot (carteira atual): negociações ativas, funil, temperatura,
//     leads parados → não mudam com o filtro de período.
//   - Janela: vendas, taxa de fechamento, tempo médio, evolução, por origem.
//   - BUGFIX: TODAS as chamadas usam finalFilters (a versão antiga passava
//     `filters` da closure nos charts, perdendo o targetAttendantId e as
//     datas atualizadas).
import { useState, useEffect, useCallback } from "react";
import { useDashboardService, DashboardFilters } from "../services/dashboardService";
import type {
  ActiveNegotiationsResponse,
  SalesResponse,
  ClosingRateResponse,
  AvgClosingTimeResponse,
  StageFunnelResponse,
  NegotiationsEvolutionResponse,
  TemperatureResponse,
  NegotiationsBySourceResponse,
  IdleLeadsResponse,
} from "../services/dashboardService";

import { useAuth } from "../hook/useAuth";

// Child components
import KpiCard from "../components/dashboards/attendant/KpiCard";
import DateRangeFilter from "../components/dashboards/attendant/DateRangeFilter";
import EvolutionChart from "../components/dashboards/attendant/EvolutionChart";
import StageFunnelChart from "../components/dashboards/attendant/StageFunnelChart";
import TemperatureChart from "../components/dashboards/attendant/TemperatureChart";
import NegotiationsBySourceChart from "../components/dashboards/attendant/NegotiationsBySourceChart";
import IdleLeadsChart from "../components/dashboards/attendant/IdleLeadsChart";
import DashboardError from "../components/dashboards/attendant/DashboardError";

// ─── Icons ──────────────────────────────────────────────────────────────────
function IconBriefcase({ color = "#2563EB" }: { color?: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <rect x={2} y={7} width={20} height={14} rx={2} stroke={color} strokeWidth={2} />
      <path
        d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconCheck({ color = "#16A34A" }: { color?: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <path
        d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <polyline
        points="22 4 12 14.01 9 11.01"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconPercent({ color = "#F59E0B" }: { color?: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <line x1={19} y1={5} x2={5} y2={19} stroke={color} strokeWidth={2} strokeLinecap="round" />
      <circle cx={6.5} cy={6.5} r={2.5} stroke={color} strokeWidth={2} />
      <circle cx={17.5} cy={17.5} r={2.5} stroke={color} strokeWidth={2} />
    </svg>
  );
}

function IconClock({ color = "#8B5CF6" }: { color?: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <circle cx={12} cy={12} r={10} stroke={color} strokeWidth={2} />
      <polyline
        points="12 6 12 12 16 14"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Data shape ──────────────────────────────────────────────────────────────
interface DashboardData {
  activeNegotiations: ActiveNegotiationsResponse | null;
  sales: SalesResponse | null;
  closingRate: ClosingRateResponse | null;
  avgClosingTime: AvgClosingTimeResponse | null;
  stageFunnel: StageFunnelResponse | null;
  evolution: NegotiationsEvolutionResponse | null;
  temperature: TemperatureResponse | null;
  sources: NegotiationsBySourceResponse | null;
  idleLeads: IdleLeadsResponse | null;
}

const EMPTY_DATA: DashboardData = {
  activeNegotiations: null,
  sales: null,
  closingRate: null,
  avgClosingTime: null,
  stageFunnel: null,
  evolution: null,
  temperature: null,
  sources: null,
  idleLeads: null,
};

// ─── Default filter: últimos 30 dias ─────────────────────────────────────────
function defaultFilters(): DashboardFilters {
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 30);
  start.setHours(0, 0, 0, 0);
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
}

// ─── Props do Componente ─────────────────────────────────────────────────────
interface DashboardAttendantProps {
  targetAttendantId?: string;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function DashboardAttendant({ targetAttendantId }: DashboardAttendantProps) {
  const { user } = useAuth();
  const dashboard = useDashboardService();

  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters());
  const [data, setData] = useState<DashboardData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(
    async (f: DashboardFilters) => {
      setLoading(true);
      setError(null);

      // Mescla as datas com o targetAttendantId do drill-down.
      // TODAS as chamadas usam finalFilters — os endpoints de snapshot
      // aproveitam só o attendantId (o service descarta as datas).
      const finalFilters: DashboardFilters = {
        ...f,
        targetAttendantId,
      };

      try {
        const [
          activeNegotiations,
          sales,
          closingRate,
          avgClosingTime,
          stageFunnel,
          evolution,
          temperature,
          sources,
          idleLeads,
        ] = await Promise.all([
          dashboard.attendant.getActiveNegotiations(finalFilters),
          dashboard.attendant.getSales(finalFilters),
          dashboard.attendant.getClosingRate(finalFilters),
          dashboard.attendant.getAvgClosingTime(finalFilters),
          dashboard.attendant.getStageFunnel(finalFilters),
          dashboard.attendant.getEvolution(finalFilters),
          dashboard.attendant.getTemperature(finalFilters),
          dashboard.attendant.getNegotiationsBySource(finalFilters),
          dashboard.attendant.getIdleLeads(finalFilters),
        ]);
        setData({
          activeNegotiations,
          sales,
          closingRate,
          avgClosingTime,
          stageFunnel,
          evolution,
          temperature,
          sources,
          idleLeads,
        });
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar o dashboard. Verifique sua conexão e tente novamente.");
      } finally {
        setLoading(false);
      }
    },
    [dashboard, targetAttendantId],
  );

  useEffect(() => {
    fetchAll(filters);
    // fetchAll é recriado quando targetAttendantId muda → refetch automático
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchAll]);

  function handleFilterChange(newFilters: DashboardFilters) {
    setFilters(newFilters);
    fetchAll(newFilters);
  }

  // ─── Derived values ──────────────────────────────────────────────────────
  const avgHours = data.avgClosingTime?.avgClosingTimeHours ?? 0;
  const avgTimeLabel =
    avgHours >= 24
      ? `${(avgHours / 24).toFixed(1)}d`
      : avgHours >= 1
        ? `${avgHours.toFixed(1)}h`
        : `${Math.round(avgHours * 60)}min`;

  const closingRate = data.closingRate?.closingRate ?? 0;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#111827" }}>
            Dashboard
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>
            {targetAttendantId && targetAttendantId !== user?.id ? (
              "Visualizando o desempenho do atendente selecionado."
            ) : (
              <>Olá, <span className="font-medium">{user?.name ?? "Atendente"}</span> — veja seu desempenho abaixo.</>
            )}
          </p>
        </div>
        <span
          className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-full font-medium"
          style={{ background: "#EFF6FF", color: "#1E3A8A" }}
        >
          Visão Atendente
        </span>
      </div>

      {/* Filter — aplica-se às métricas de período (vendas, taxa, tempo,
          evolução, origem). Carteira ativa, funil, temperatura e leads
          parados são snapshots do estado atual. */}
      <DateRangeFilter onFilterChange={handleFilterChange} loading={loading} />

      {/* Error */}
      {error && <DashboardError message={error} onRetry={() => fetchAll(filters)} />}

      {/* KPIs */}
      {!error && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Negociações Ativas"
              value={data.activeNegotiations?.activeNegotiations ?? "—"}
              icon={<IconBriefcase />}
              iconBg="#EFF6FF"
              loading={loading}
              subtitle="carteira atual"
            />
            <KpiCard
              title="Vendas"
              value={data.sales?.sales ?? "—"}
              icon={<IconCheck />}
              iconBg="#F0FDF4"
              loading={loading}
              subtitle="no período"
            />
            <KpiCard
              title="Taxa de Fechamento"
              value={loading ? "—" : `${closingRate.toFixed(1)}%`}
              icon={<IconPercent />}
              iconBg="#FFFBEB"
              loading={loading}
              subtitle={
                data.closingRate
                  ? `${data.closingRate.wonCount} ganhas / ${data.closingRate.lostCount} perdidas`
                  : undefined
              }
            />
            <KpiCard
              title="Tempo Médio"
              value={loading ? "—" : avgTimeLabel}
              icon={<IconClock />}
              iconBg="#F5F3FF"
              loading={loading}
              subtitle="abertura → venda"
            />
          </div>

          {/* Charts row 1: atividade do período */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <EvolutionChart data={data.evolution?.evolution ?? []} loading={loading} />
            <StageFunnelChart
              data={data.stageFunnel?.funnel ?? []}
              loading={loading}
              wonCount={data.closingRate?.wonCount ?? 0}
              lostCount={data.closingRate?.lostCount ?? 0}
            />
          </div>

          {/* Charts row 2: composição da carteira */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <TemperatureChart data={data.temperature?.temperature ?? []} loading={loading} />
            <NegotiationsBySourceChart data={data.sources?.sources ?? []} loading={loading} />
          </div>

          {/* Charts row 3: backlog acionável */}
          <div className="grid grid-cols-1 gap-4">
            <IdleLeadsChart data={data.idleLeads?.idleLeads ?? null} loading={loading} />
          </div>
        </>
      )}
    </div>
  );
}
