// src/pages/DashboardManager.tsx
import { useState, useEffect, useCallback } from "react";
import { useDashboardService } from "../services/dashboardService";
import type {
  DashboardFilters,
  TeamKpisResponse,
  TopAttendantResponse,
  LeadsByAttendantResponse,
  ConversionsByAttendantResponse,
  TeamEvolutionResponse,
  TeamFunnelResponse,
} from "../services/dashboardService";

import ManagerKpiCards from "../components/dashboards/manager/ManagerKpiCards";
import ManagerFunnelChart from "../components/dashboards/manager/ManagerFunnelChart";
import ManagerEvolutionChart from "../components/dashboards/manager/ManagerEvolutionChart";
import ManagerLeadsByAttendantChart from "../components/dashboards/manager/ManagerLeadsByAttendantChart";
import ManagerConversionsByAttendantChart from "../components/dashboards/manager/ManagerConversionsByAttendantChart";
import ManagerDateFilter from "../components/dashboards/manager/ManagerDateFilter";

// ─────────────────────────────────────────────
// Estado centralizado dos dados
// ─────────────────────────────────────────────
interface DashboardData {
  teamKpis: TeamKpisResponse | null;
  topAttendant: TopAttendantResponse | null;
  leadsByAttendant: LeadsByAttendantResponse | null;
  conversionsByAttendant: ConversionsByAttendantResponse | null;
  teamEvolution: TeamEvolutionResponse | null;
  teamFunnel: TeamFunnelResponse | null;
}

const INITIAL_DATA: DashboardData = {
  teamKpis: null,
  topAttendant: null,
  leadsByAttendant: null,
  conversionsByAttendant: null,
  teamEvolution: null,
  teamFunnel: null,
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

      // Mescla os filtros de data com o targetTeamId recebido por prop
      const finalFilters: DashboardFilters = {
        ...f,
        targetTeamId,
      };

      try {
        const [
          teamKpis,
          topAttendant,
          leadsByAttendant,
          conversionsByAttendant,
          teamEvolution,
          teamFunnel,
        ] = await Promise.all([
          service.manager.getTeamKpis(finalFilters),
          service.manager.getTopAttendant(finalFilters),
          service.manager.getLeadsByAttendant(finalFilters),
          service.manager.getConversionsByAttendant(finalFilters),
          service.manager.getTeamEvolution(finalFilters),
          service.manager.getTeamFunnel(finalFilters),
        ]);

        setData({
          teamKpis,
          topAttendant,
          leadsByAttendant,
          conversionsByAttendant,
          teamEvolution,
          teamFunnel,
        });
      } catch (err) {
        console.error("Erro ao carregar dashboard do gerente:", err);
        setError("Não foi possível carregar os dados. Tente novamente.");
      } finally {
        setLoading(false);
      }
    },
    // O useCallback agora depende do targetTeamId para recriar a função se a equipe mudar
    [service, targetTeamId]
  );

  useEffect(() => {
    fetchAll(filters);
  }, [filters, fetchAll]);

  function handleFiltersChange(newFilters: DashboardFilters) {
    setFilters(newFilters);
  }

  return (
    <div className="w-full min-h-screen px-4 py-6 sm:px-6 lg:px-8" style={{ background: "#F8FAFC" }}>
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold" style={{ color: "#111827" }}>
            Dashboard — Equipe
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>
            {targetTeamId ? "Visão de desempenho da equipe selecionada" : "Visão geral de desempenho da sua equipe"}
          </p>
        </div>
        <span
          className="self-start sm:self-auto text-xs px-3 py-1.5 rounded-full font-medium"
          style={{ background: "#F0FDF4", color: "#166534" }}
        >
          Visão Gerencial
        </span>
      </div>

      {/* Filtro de datas */}
      <div className="mb-5">
        <ManagerDateFilter
          filters={filters}
          onChange={handleFiltersChange}
          loading={loading}
        />
      </div>

      {/* Erro global */}
      {error && (
        <div
          className="mb-5 rounded-xl px-4 py-3 text-sm border"
          style={{ background: "#FEF2F2", borderColor: "#FECACA", color: "#DC2626" }}
        >
          {error}{" "}
          <button
            onClick={() => fetchAll(filters)}
            className="underline font-medium ml-1"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="mb-5">
        <ManagerKpiCards
          teamKpis={data.teamKpis}
          topAttendant={data.topAttendant}
          loading={loading}
        />
      </div>

      {/* Row 2: Evolution (wide) + Funnel */}
      <div className="grid grid-cols-1 gap-4 mb-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ManagerEvolutionChart data={data.teamEvolution} loading={loading} />
        </div>
        <div className="lg:col-span-2">
          <ManagerFunnelChart data={data.teamFunnel} loading={loading} />
        </div>
      </div>

      {/* Row 3: Leads por atendente + Conversões por atendente */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ManagerLeadsByAttendantChart data={data.leadsByAttendant} loading={loading} />
        <ManagerConversionsByAttendantChart data={data.conversionsByAttendant} loading={loading} />
      </div>
    </div>
  );
}