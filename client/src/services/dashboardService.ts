// src/services/dashboardService.ts
import { useCallback, useMemo } from "react";
import { useApi } from "./api";

// ─────────────────────────────────────────────
// Tipos de Filtros Compartilhados
// ─────────────────────────────────────────────
export interface DashboardFilters {
  startDate?: string;           // Formato ISO 8601
  endDate?: string;             // Formato ISO 8601
  targetAttendantId?: string;   // ID do atendente selecionado (pelo Manager/GM)
  targetTeamId?: string;        // ID da equipe selecionada (pelo GM)
}

// ─────────────────────────────────────────────
// Interfaces de Resposta - Atendente
// ─────────────────────────────────────────────
export interface ActiveLeadsResponse { activeLeads: number; }
export interface ConvertedLeadsResponse { convertedLeads: number; }
export interface ConversionRateResponse { 
  conversionRate: number; 
  totalLeads: number; 
  convertedLeads: number; 
}
export interface AvgServiceTimeResponse { avgServiceTimeHours: number; }
export interface ChartEvolutionItem { date: string; count: number; }
export interface ChartFunnelItem { status: string; count: number; }
export interface ChartSourceItem { source: string; count: number; }

export interface EvolutionResponse { evolution: ChartEvolutionItem[]; }
export interface FunnelResponse { funnel: ChartFunnelItem[]; }
export interface SourcesResponse { sources: ChartSourceItem[]; }
export interface ConversionsPeriodResponse { conversions: ChartEvolutionItem[]; }

// ─────────────────────────────────────────────
// Interfaces de Resposta - Manager
// ─────────────────────────────────────────────
export interface TeamKpisResponse {
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  stagnantLeads: number;
}
export interface TopAttendantResponse {
  topAttendant: {
    id: string;
    name: string;
    conversions: number;
  } | null;
}
export interface LeadsByAttendantItem {
  attendantId: string;
  attendantName: string;
  count: number;
}
export interface LeadsByAttendantResponse { leadsByAttendant: LeadsByAttendantItem[]; }
export interface ConversionsByAttendantResponse { conversionsByAttendant: LeadsByAttendantItem[]; }
export interface TeamEvolutionResponse { evolution: ChartEvolutionItem[]; }
export interface TeamFunnelResponse { funnel: ChartFunnelItem[]; }

// ─────────────────────────────────────────────
// Interfaces de Resposta - General Manager
// ─────────────────────────────────────────────
export interface GlobalKpisResponse {
  totalLeads: number;
  totalSales: number;
  globalConversionRate: number;
}
export interface TopTeamResponse {
  topTeam: {
    id: string;
    name: string;
    conversions: number;
  } | null;
}
export interface LeadsByTeamItem {
  teamId: string;
  teamName: string;
  count: number;
}
export interface LeadsByTeamResponse { leadsByTeam: LeadsByTeamItem[]; }
export interface TeamRankingItem {
  teamId: string;
  teamName: string;
  conversions: number;
}
export interface TeamRankingResponse { teamRanking: TeamRankingItem[]; }
export interface GlobalEvolutionResponse { evolution: ChartEvolutionItem[]; }
export interface GlobalFunnelResponse { funnel: ChartFunnelItem[]; }

// ─────────────────────────────────────────────
// Hook do Serviço
// ─────────────────────────────────────────────
export function useDashboardService() {
  const { apiFetch } = useApi();

  /**
   * Helper para construir a query string.
   * Mapeia os campos do frontend para os parâmetros esperados pelo backend refatorado.
   */
  const buildQuery = useCallback((filters?: DashboardFilters) => {
    if (!filters) return "";
    const params = new URLSearchParams();

    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    
    // O backend espera 'attendantId' e 'teamId'
    if (filters.targetAttendantId) params.append("attendantId", filters.targetAttendantId);
    if (filters.targetTeamId) params.append("teamId", filters.targetTeamId);

    const str = params.toString();
    return str ? `?${str}` : "";
  }, []);

  // O useMemo é FUNDAMENTAL para evitar que o React entre em loop infinito de renders
  return useMemo(() => ({
    
    // ─────────────────────────────────────────────
    // Visão do Atendente
    // ─────────────────────────────────────────────
    attendant: {
      getActiveLeads: async (f?: DashboardFilters): Promise<ActiveLeadsResponse> =>
        (await apiFetch(`/api/dashboards/attendant/kpi/active-leads${buildQuery(f)}`)).json(),

      getConvertedLeads: async (f?: DashboardFilters): Promise<ConvertedLeadsResponse> =>
        (await apiFetch(`/api/dashboards/attendant/kpi/converted-leads${buildQuery(f)}`)).json(),

      getConversionRate: async (f?: DashboardFilters): Promise<ConversionRateResponse> =>
        (await apiFetch(`/api/dashboards/attendant/kpi/conversion-rate${buildQuery(f)}`)).json(),

      getAvgServiceTime: async (f?: DashboardFilters): Promise<AvgServiceTimeResponse> =>
        (await apiFetch(`/api/dashboards/attendant/kpi/avg-service-time${buildQuery(f)}`)).json(),

      getLeadsEvolution: async (f?: DashboardFilters): Promise<EvolutionResponse> =>
        (await apiFetch(`/api/dashboards/attendant/charts/leads-evolution${buildQuery(f)}`)).json(),

      getSalesFunnel: async (f?: DashboardFilters): Promise<FunnelResponse> =>
        (await apiFetch(`/api/dashboards/attendant/charts/sales-funnel${buildQuery(f)}`)).json(),

      getLeadsBySource: async (f?: DashboardFilters): Promise<SourcesResponse> =>
        (await apiFetch(`/api/dashboards/attendant/charts/leads-by-source${buildQuery(f)}`)).json(),

      getConversionsByPeriod: async (f?: DashboardFilters): Promise<ConversionsPeriodResponse> =>
        (await apiFetch(`/api/dashboards/attendant/charts/conversions-by-period${buildQuery(f)}`)).json(),
    },

    // ─────────────────────────────────────────────
    // Visão Gerencial (Equipa)
    // ─────────────────────────────────────────────
    manager: {
      getTeamKpis: async (f?: DashboardFilters): Promise<TeamKpisResponse> =>
        (await apiFetch(`/api/dashboards/manager/kpi/team${buildQuery(f)}`)).json(),

      getTopAttendant: async (f?: DashboardFilters): Promise<TopAttendantResponse> =>
        (await apiFetch(`/api/dashboards/manager/kpi/top-attendant${buildQuery(f)}`)).json(),

      getLeadsByAttendant: async (f?: DashboardFilters): Promise<LeadsByAttendantResponse> =>
        (await apiFetch(`/api/dashboards/manager/charts/leads-by-attendant${buildQuery(f)}`)).json(),

      getConversionsByAttendant: async (f?: DashboardFilters): Promise<ConversionsByAttendantResponse> =>
        (await apiFetch(`/api/dashboards/manager/charts/conversions-by-attendant${buildQuery(f)}`)).json(),

      getTeamEvolution: async (f?: DashboardFilters): Promise<TeamEvolutionResponse> =>
        (await apiFetch(`/api/dashboards/manager/charts/team-evolution${buildQuery(f)}`)).json(),

      getTeamFunnel: async (f?: DashboardFilters): Promise<TeamFunnelResponse> =>
        (await apiFetch(`/api/dashboards/manager/charts/team-funnel${buildQuery(f)}`)).json(),
    },

    // ─────────────────────────────────────────────
    // Visão Global (Empresa)
    // ─────────────────────────────────────────────
    generalManager: {
      getGlobalKpis: async (f?: DashboardFilters): Promise<GlobalKpisResponse> =>
        (await apiFetch(`/api/dashboards/general-manager/kpi/global${buildQuery(f)}`)).json(),

      getTopTeam: async (f?: DashboardFilters): Promise<TopTeamResponse> =>
        (await apiFetch(`/api/dashboards/general-manager/kpi/top-team${buildQuery(f)}`)).json(),

      getLeadsByTeam: async (f?: DashboardFilters): Promise<LeadsByTeamResponse> =>
        (await apiFetch(`/api/dashboards/general-manager/charts/leads-by-team${buildQuery(f)}`)).json(),

      getTeamRanking: async (f?: DashboardFilters): Promise<TeamRankingResponse> =>
        (await apiFetch(`/api/dashboards/general-manager/charts/team-ranking${buildQuery(f)}`)).json(),

      getGlobalEvolution: async (f?: DashboardFilters): Promise<GlobalEvolutionResponse> =>
        (await apiFetch(`/api/dashboards/general-manager/charts/global-evolution${buildQuery(f)}`)).json(),

      getGlobalFunnel: async (f?: DashboardFilters): Promise<GlobalFunnelResponse> =>
        (await apiFetch(`/api/dashboards/general-manager/charts/global-funnel${buildQuery(f)}`)).json(),
    },

    // ─────────────────────────────────────────────
    // Métodos Auxiliares
    // ─────────────────────────────────────────────
    auxiliary: {
      getUsers: async (): Promise<any[]> => {
        const res = await apiFetch(`/api/users`);
        return res.json();
      },
      getTeams: async (): Promise<any[]> => {
        const res = await apiFetch(`/api/teams`);
        return res.json();
      }
    }
  }), [apiFetch, buildQuery]); 
}