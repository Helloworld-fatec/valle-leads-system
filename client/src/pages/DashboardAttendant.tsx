// src/pages/DashboardAttendant.tsx
import { useState, useEffect, useCallback } from "react";
import { useDashboardService, DashboardFilters } from "../services/dashboardService";
import type {
  ActiveLeadsResponse,
  ConvertedLeadsResponse,
  ConversionRateResponse,
  AvgServiceTimeResponse,
  EvolutionResponse,
  FunnelResponse,
  SourcesResponse,
  ConversionsPeriodResponse,
} from "../services/dashboardService";

import { useAuth } from "../hook/useAuth";

// Child components
import KpiCard from "../components/dashboards/attendant/KpiCard";
import DateRangeFilter from "../components/dashboards/attendant/DateRangeFilter";
import LeadsEvolutionChart from "../components/dashboards/attendant/LeadsEvolutionChart";
import SalesFunnelChart from "../components/dashboards/attendant/SalesFunnelChart";
import LeadsBySourceChart from "../components/dashboards/attendant/LeadsBySourceChart";
import ConversionsByPeriodChart from "../components/dashboards/attendant/ConversionsByPeriodChart";
import DashboardError from "../components/dashboards/attendant/DashboardError";

// ─── Icons ──────────────────────────────────────────────────────────────────
function IconUsers({ color = "#2563EB" }: { color?: string }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <path
        d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={9} cy={7} r={4} stroke={color} strokeWidth={2} />
      <path
        d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
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
      <line
        x1={19}
        y1={5}
        x2={5}
        y2={19}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
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

// ─── State shape ─────────────────────────────────────────────────────────────
interface DashboardData {
  activeLeads: ActiveLeadsResponse | null;
  convertedLeads: ConvertedLeadsResponse | null;
  conversionRate: ConversionRateResponse | null;
  avgServiceTime: AvgServiceTimeResponse | null;
  evolution: EvolutionResponse | null;
  funnel: FunnelResponse | null;
  sources: SourcesResponse | null;
  conversionsPeriod: ConversionsPeriodResponse | null;
}

const EMPTY_DATA: DashboardData = {
  activeLeads: null,
  convertedLeads: null,
  conversionRate: null,
  avgServiceTime: null,
  evolution: null,
  funnel: null,
  sources: null,
  conversionsPeriod: null,
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
      
      // Mescla os filtros de data com o targetAttendantId recebido por prop
      const finalFilters: DashboardFilters = {
        ...f,
        targetAttendantId,
      };

      try {
        const [
          activeLeads,
          convertedLeads,
          conversionRate,
          avgServiceTime,
          evolution,
          funnel,
          sources,
          conversionsPeriod,
        ] = await Promise.all([
          dashboard.attendant.getActiveLeads(finalFilters),
          dashboard.attendant.getConvertedLeads(finalFilters),
          dashboard.attendant.getConversionRate(finalFilters),
          dashboard.attendant.getAvgServiceTime(finalFilters),
          dashboard.attendant.getLeadsEvolution(filters),       
          dashboard.attendant.getSalesFunnel(filters),          
          dashboard.attendant.getLeadsBySource(filters),        
          dashboard.attendant.getConversionsByPeriod(filters),
        ]);
        setData({
          activeLeads,
          convertedLeads,
          conversionRate,
          avgServiceTime,
          evolution,
          funnel,
          sources,
          conversionsPeriod,
        });
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar o dashboard. Verifique sua conexão e tente novamente.");
      } finally {
        setLoading(false);
      }
    },
    // O useCallback agora depende do targetAttendantId. 
    // Se o gerente trocar o usuário no menu, a função é recriada.
    [dashboard, targetAttendantId]
  );

  // Como o fetchAll está nas dependências do useEffect, a tela vai atualizar 
  // automaticamente toda vez que o targetAttendantId mudar!
  useEffect(() => {
    fetchAll(filters);
  }, [fetchAll]);

  function handleFilterChange(newFilters: DashboardFilters) {
    setFilters(newFilters);
    fetchAll(newFilters);
  }

  // ─── Derived values ──────────────────────────────────────────────────────
  const avgHours = data.avgServiceTime?.avgServiceTimeHours ?? 0;
  const avgTimeLabel =
    avgHours >= 24
      ? `${(avgHours / 24).toFixed(1)}d`
      : avgHours >= 1
      ? `${avgHours.toFixed(1)}h`
      : `${Math.round(avgHours * 60)}min`;

  const convRate = data.conversionRate?.conversionRate ?? 0;

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

      {/* Filter */}
      <DateRangeFilter onFilterChange={handleFilterChange} loading={loading} />

      {/* Error */}
      {error && (
        <DashboardError message={error} onRetry={() => fetchAll(filters)} />
      )}

      {/* KPIs */}
      {!error && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              title="Leads Ativos"
              value={data.activeLeads?.activeLeads ?? "—"}
              icon={<IconUsers />}
              iconBg="#EFF6FF"
              loading={loading}
              subtitle="em andamento"
            />
            <KpiCard
              title="Leads Convertidos"
              value={data.convertedLeads?.convertedLeads ?? "—"}
              icon={<IconCheck />}
              iconBg="#F0FDF4"
              loading={loading}
              subtitle="no período"
            />
            <KpiCard
              title="Taxa de Conversão"
              value={loading ? "—" : `${convRate.toFixed(1)}%`}
              icon={<IconPercent />}
              iconBg="#FFFBEB"
              loading={loading}
              subtitle={
                data.conversionRate
                  ? `${data.conversionRate.convertedLeads} / ${data.conversionRate.totalLeads} leads`
                  : undefined
              }
            />
            <KpiCard
              title="Tempo Médio"
              value={loading ? "—" : avgTimeLabel}
              icon={<IconClock />}
              iconBg="#F5F3FF"
              loading={loading}
              subtitle="por atendimento"
            />
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LeadsEvolutionChart
              data={data.evolution?.evolution ?? []}
              loading={loading}
            />
            <SalesFunnelChart
              data={data.funnel?.funnel ?? []}
              loading={loading}
            />
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <LeadsBySourceChart
              data={data.sources?.sources ?? []}
              loading={loading}
            />
            <ConversionsByPeriodChart
              data={data.conversionsPeriod?.conversions ?? []}
              loading={loading}
            />
          </div>
        </>
      )}
    </div>
  );
}
