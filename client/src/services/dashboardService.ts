// src/services/dashboardService.ts
import { useCallback, useMemo } from "react";
import { useApi } from "./api";

// ─────────────────────────────────────────────
// Tipos de Filtros Compartilhados
// ─────────────────────────────────────────────
export interface DashboardFilters {
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  targetAttendantId?: string; // selecionado por Manager/GM (só dashboard do atendente)
  targetTeamId?: string; // selecionado por GM (só dashboard do manager)
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
  topAttendant: { id: string; name: string; conversions: number } | null;
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
  topTeam: { id: string; name: string; conversions: number } | null;
}
export interface LeadsByTeamItem { teamId: string; teamName: string; count: number; }
export interface LeadsByTeamResponse { leadsByTeam: LeadsByTeamItem[]; }
export interface TeamRankingItem { teamId: string; teamName: string; conversions: number; }
export interface TeamRankingResponse { teamRanking: TeamRankingItem[]; }
export interface GlobalEvolutionResponse { evolution: ChartEvolutionItem[]; }
export interface GlobalFunnelResponse { funnel: ChartFunnelItem[]; }

// ─────────────────────────────────────────────
// Hook do Serviço
// ─────────────────────────────────────────────
export function useDashboardService() {
  const { apiFetch } = useApi();

  // attendantDashboardFilterSchema aceita: startDate, endDate, attendantId
  const buildAttendantQuery = useCallback((f?: DashboardFilters) => {
    if (!f) return "";
    const p = new URLSearchParams();
    if (f.startDate) p.append("startDate", f.startDate);
    if (f.endDate) p.append("endDate", f.endDate);
    if (f.targetAttendantId) p.append("attendantId", f.targetAttendantId);
    const s = p.toString();
    return s ? `?${s}` : "";
  }, []);

  // managerDashboardFilterSchema aceita: startDate, endDate, teamId
  const buildManagerQuery = useCallback((f?: DashboardFilters) => {
    if (!f) return "";
    const p = new URLSearchParams();
    if (f.startDate) p.append("startDate", f.startDate);
    if (f.endDate) p.append("endDate", f.endDate);
    if (f.targetTeamId) p.append("teamId", f.targetTeamId);
    const s = p.toString();
    return s ? `?${s}` : "";
  }, []);

  // generalManagerDashboardFilterSchema aceita SOMENTE: startDate, endDate
  // (não há teamId/attendantId — os dashboards globais cobrem todas as equipes)
  const buildGlobalQuery = useCallback((f?: DashboardFilters) => {
    if (!f) return "";
    const p = new URLSearchParams();
    if (f.startDate) p.append("startDate", f.startDate);
    if (f.endDate) p.append("endDate", f.endDate);
    const s = p.toString();
    return s ? `?${s}` : "";
  }, []);

  return useMemo(
    () => ({
      // ── Visão do Atendente ──────────────────────────
      attendant: {
        getActiveLeads: async (f?: DashboardFilters): Promise<ActiveLeadsResponse> =>
          (await apiFetch(`/api/dashboards/attendant/kpi/active-leads${buildAttendantQuery(f)}`)).json(),
        getConvertedLeads: async (f?: DashboardFilters): Promise<ConvertedLeadsResponse> =>
          (await apiFetch(`/api/dashboards/attendant/kpi/converted-leads${buildAttendantQuery(f)}`)).json(),
        getConversionRate: async (f?: DashboardFilters): Promise<ConversionRateResponse> =>
          (await apiFetch(`/api/dashboards/attendant/kpi/conversion-rate${buildAttendantQuery(f)}`)).json(),
        getAvgServiceTime: async (f?: DashboardFilters): Promise<AvgServiceTimeResponse> =>
          (await apiFetch(`/api/dashboards/attendant/kpi/avg-service-time${buildAttendantQuery(f)}`)).json(),
        getLeadsEvolution: async (f?: DashboardFilters): Promise<EvolutionResponse> =>
          (await apiFetch(`/api/dashboards/attendant/charts/leads-evolution${buildAttendantQuery(f)}`)).json(),
        getSalesFunnel: async (f?: DashboardFilters): Promise<FunnelResponse> =>
          (await apiFetch(`/api/dashboards/attendant/charts/sales-funnel${buildAttendantQuery(f)}`)).json(),
        getLeadsBySource: async (f?: DashboardFilters): Promise<SourcesResponse> =>
          (await apiFetch(`/api/dashboards/attendant/charts/leads-by-source${buildAttendantQuery(f)}`)).json(),
        getConversionsByPeriod: async (f?: DashboardFilters): Promise<ConversionsPeriodResponse> =>
          (await apiFetch(`/api/dashboards/attendant/charts/conversions-by-period${buildAttendantQuery(f)}`)).json(),
      },

      // ── Visão Gerencial (Equipe) ────────────────────
      manager: {
        getTeamKpis: async (f?: DashboardFilters): Promise<TeamKpisResponse> =>
          (await apiFetch(`/api/dashboards/manager/kpi/team${buildManagerQuery(f)}`)).json(),
        getTopAttendant: async (f?: DashboardFilters): Promise<TopAttendantResponse> =>
          (await apiFetch(`/api/dashboards/manager/kpi/top-attendant${buildManagerQuery(f)}`)).json(),
        getLeadsByAttendant: async (f?: DashboardFilters): Promise<LeadsByAttendantResponse> =>
          (await apiFetch(`/api/dashboards/manager/charts/leads-by-attendant${buildManagerQuery(f)}`)).json(),
        getConversionsByAttendant: async (f?: DashboardFilters): Promise<ConversionsByAttendantResponse> =>
          (await apiFetch(`/api/dashboards/manager/charts/conversions-by-attendant${buildManagerQuery(f)}`)).json(),
        getTeamEvolution: async (f?: DashboardFilters): Promise<TeamEvolutionResponse> =>
          (await apiFetch(`/api/dashboards/manager/charts/team-evolution${buildManagerQuery(f)}`)).json(),
        getTeamFunnel: async (f?: DashboardFilters): Promise<TeamFunnelResponse> =>
          (await apiFetch(`/api/dashboards/manager/charts/team-funnel${buildManagerQuery(f)}`)).json(),
      },

      // ── Visão Global (Empresa) ──────────────────────
      // Os métodos globais (getGlobalKpis, getTopTeam, getLeadsByTeam,
      // getTeamRanking, getGlobalEvolution, getGlobalFunnel) usam os endpoints
      // /general-manager — só datas, sem teamId.
      // Para drill-down em UMA equipe selecionada pelo GM, use os métodos
      // getTeam* abaixo: batem nos endpoints /manager passando teamId
      // (checkPermission('MANAGER') deixa o GM passar por hierarquia).
      generalManager: {
        getGlobalKpis: async (f?: DashboardFilters): Promise<GlobalKpisResponse> =>
          (await apiFetch(`/api/dashboards/general-manager/kpi/global${buildGlobalQuery(f)}`)).json(),
        getTopTeam: async (f?: DashboardFilters): Promise<TopTeamResponse> =>
          (await apiFetch(`/api/dashboards/general-manager/kpi/top-team${buildGlobalQuery(f)}`)).json(),
        getLeadsByTeam: async (f?: DashboardFilters): Promise<LeadsByTeamResponse> =>
          (await apiFetch(`/api/dashboards/general-manager/charts/leads-by-team${buildGlobalQuery(f)}`)).json(),
        getTeamRanking: async (f?: DashboardFilters): Promise<TeamRankingResponse> =>
          (await apiFetch(`/api/dashboards/general-manager/charts/team-ranking${buildGlobalQuery(f)}`)).json(),
        getGlobalEvolution: async (f?: DashboardFilters): Promise<GlobalEvolutionResponse> =>
          (await apiFetch(`/api/dashboards/general-manager/charts/global-evolution${buildGlobalQuery(f)}`)).json(),
        getGlobalFunnel: async (f?: DashboardFilters): Promise<GlobalFunnelResponse> =>
          (await apiFetch(`/api/dashboards/general-manager/charts/global-funnel${buildGlobalQuery(f)}`)).json(),

        // ── Drill-down de equipe específica ─────────────
        // O endpoint /general-manager NÃO aceita teamId (só datas globais).
        // Quando o GM seleciona uma equipe, usamos os endpoints /manager
        // passando teamId — checkPermission('MANAGER') deixa o GM passar por
        // hierarquia. Retornam os mesmos shapes da visão Manager.
        getTeamKpis: async (f?: DashboardFilters): Promise<TeamKpisResponse> =>
          (await apiFetch(`/api/dashboards/manager/kpi/team${buildManagerQuery(f)}`)).json(),
        getTeamTopAttendant: async (f?: DashboardFilters): Promise<TopAttendantResponse> =>
          (await apiFetch(`/api/dashboards/manager/kpi/top-attendant${buildManagerQuery(f)}`)).json(),
        getTeamLeadsByAttendant: async (f?: DashboardFilters): Promise<LeadsByAttendantResponse> =>
          (await apiFetch(`/api/dashboards/manager/charts/leads-by-attendant${buildManagerQuery(f)}`)).json(),
        getTeamConversionsByAttendant: async (f?: DashboardFilters): Promise<ConversionsByAttendantResponse> =>
          (await apiFetch(`/api/dashboards/manager/charts/conversions-by-attendant${buildManagerQuery(f)}`)).json(),
        getTeamEvolution: async (f?: DashboardFilters): Promise<TeamEvolutionResponse> =>
          (await apiFetch(`/api/dashboards/manager/charts/team-evolution${buildManagerQuery(f)}`)).json(),
        getTeamFunnel: async (f?: DashboardFilters): Promise<TeamFunnelResponse> =>
          (await apiFetch(`/api/dashboards/manager/charts/team-funnel${buildManagerQuery(f)}`)).json(),
      },

      // ── Métodos Auxiliares ──────────────────────────
      auxiliary: {
        getUsers: async (): Promise<any[]> => {
          const res = await apiFetch(`/api/users`);
          const json = await res.json();
          return (json && typeof json === "object" && "data" in json ? json.data : json) ?? [];
        },
        getTeams: async (): Promise<any[]> => {
          const res = await apiFetch(`/api/teams`);
          const json = await res.json();
          return (json && typeof json === "object" && "data" in json ? json.data : json) ?? [];
        },
      },
    }),
    [apiFetch, buildAttendantQuery, buildManagerQuery, buildGlobalQuery]
  );
}
