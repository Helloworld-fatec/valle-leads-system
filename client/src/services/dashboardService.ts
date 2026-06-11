// src/services/dashboardService.ts
// VERSÃO FINAL DO REFACTOR — as três visões (atendente, gerente, gerente
// geral) no contrato negociação-cêntrico.
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
// Metadados de exibição — Estágios do funil
// (chaves espelham NegotiationStageEnum do backend)
// ─────────────────────────────────────────────
export const FUNNEL_STAGE_META: Record<string, { label: string; color: string }> = {
  qualificacao:         { label: "Qualificação",     color: "#3B82F6" },
  contato_inicial:      { label: "Contato Inicial",  color: "#8B5CF6" },
  visita:               { label: "Visita",           color: "#06B6D4" },
  proposta:             { label: "Proposta",         color: "#F97316" },
  negociacao:           { label: "Negociação",       color: "#F59E0B" },
  fechamento_com_venda: { label: "Fechado c/ Venda", color: "#10B981" },
  fechamento_sem_venda: { label: "Fechado s/ Venda", color: "#EF4444" },
};

export function getStageLabel(stage: string): string {
  return FUNNEL_STAGE_META[stage]?.label ?? stage;
}

export function getStageColor(stage: string): string {
  return FUNNEL_STAGE_META[stage]?.color ?? "#6B7280";
}

// ─────────────────────────────────────────────
// Metadados de exibição — Temperatura (importância)
// ─────────────────────────────────────────────
export const TEMPERATURE_META: Record<string, { label: string; color: string }> = {
  quente: { label: "Quente", color: "#EF4444" },
  morno:  { label: "Morno",  color: "#F59E0B" },
  frio:   { label: "Frio",   color: "#3B82F6" },
};

export function getTemperatureLabel(importance: string): string {
  return TEMPERATURE_META[importance]?.label ?? importance;
}

export function getTemperatureColor(importance: string): string {
  return TEMPERATURE_META[importance]?.color ?? "#6B7280";
}

// ─────────────────────────────────────────────
// Formatação monetária (pt-BR / BRL)
// ─────────────────────────────────────────────
const brlFull = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const brlCompact = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  notation: "compact",
  maximumFractionDigits: 1,
});

/** R$ 1.234,56 */
export function formatBRL(value: number): string {
  return brlFull.format(value);
}

/** R$ 1,2 mi — para KPIs onde o número completo não cabe. */
export function formatBRLCompact(value: number): string {
  return brlCompact.format(value);
}

// ─────────────────────────────────────────────
// Tipos compartilhados entre visões
// ─────────────────────────────────────────────
export interface StageFunnelItem { stage: string; count: number; }
export interface EvolutionPoint { date: string; opened: number; won: number; }
export interface IdleLeadsBySourceItem { source: string; count: number; }
export interface IdleLeadsResponse {
  idleLeads: {
    total: number;
    neverNegotiated: number;
    closedOnly: number;
    bySource: IdleLeadsBySourceItem[];
  };
}

// ─────────────────────────────────────────────
// Interfaces de Resposta - Atendente
// ─────────────────────────────────────────────
export interface ActiveNegotiationsResponse { activeNegotiations: number; }
export interface SalesResponse { sales: number; }
export interface ClosingRateResponse {
  closingRate: number; // 0–100
  wonCount: number;
  lostCount: number;
}
export interface AvgClosingTimeResponse { avgClosingTimeHours: number; }

export interface StageFunnelResponse { funnel: StageFunnelItem[]; }
export interface NegotiationsEvolutionResponse { evolution: EvolutionPoint[]; }

export interface TemperatureItem { importance: string; count: number; }
export interface TemperatureResponse { temperature: TemperatureItem[]; }

export interface NegotiationsBySourceItem { source: string; count: number; }
export interface NegotiationsBySourceResponse { sources: NegotiationsBySourceItem[]; }

// ─────────────────────────────────────────────
// Interfaces de Resposta - Manager
// ─────────────────────────────────────────────
export interface TeamActiveNegotiationsResponse { activeNegotiations: number; }
export interface TeamSalesResponse { sales: number; }
export interface TeamClosingRateResponse {
  closingRate: number;
  wonCount: number;
  lostCount: number;
}
export interface StagnantNegotiationsResponse { stagnantNegotiations: number; }

export interface TeamStageFunnelResponse { funnel: StageFunnelItem[]; }
export interface TeamEvolutionResponse { evolution: EvolutionPoint[]; }

export interface SalesByAttendantItem {
  attendantId: string | null;
  attendantName: string;
  sales: number;
}
export interface SalesByAttendantResponse { salesByAttendant: SalesByAttendantItem[]; }

export interface WorkloadByAttendantItem {
  attendantId: string | null;
  attendantName: string;
  active: number;
}
export interface WorkloadByAttendantResponse { workloadByAttendant: WorkloadByAttendantItem[]; }

// ─────────────────────────────────────────────
// Interfaces de Resposta - General Manager
// ─────────────────────────────────────────────
export interface GlobalActiveNegotiationsResponse { activeNegotiations: number; }
export interface GlobalSalesResponse { sales: number; }

export interface SalesValueResponse {
  salesValue: number;        // R$ vendido na janela
  salesWithoutValue: number; // vendas sem item/valor cadastrado
}

export interface PipelineValueResponse {
  pipelineValue: number;            // R$ "na mesa" (carteira ativa)
  negotiationsWithoutValue: number; // ativas sem item/valor cadastrado
}

export interface GlobalStageFunnelResponse { funnel: StageFunnelItem[]; }
export interface GlobalEvolutionResponse { evolution: EvolutionPoint[]; }

export interface SalesByTeamItem { teamId: string; teamName: string; sales: number; }
export interface SalesByTeamResponse { salesByTeam: SalesByTeamItem[]; }

export interface SalesByStoreItem {
  storeId: string;
  storeName: string;
  sales: number;
  salesValue: number;
}
export interface SalesByStoreResponse { salesByStore: SalesByStoreItem[]; }

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

  // Endpoints de SNAPSHOT do atendente — só o alvo, sem datas.
  const buildAttendantSnapshotQuery = useCallback((f?: DashboardFilters) => {
    if (!f?.targetAttendantId) return "";
    return `?attendantId=${encodeURIComponent(f.targetAttendantId)}`;
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

  // Endpoints de SNAPSHOT do manager — só a equipe alvo, sem datas.
  const buildManagerSnapshotQuery = useCallback((f?: DashboardFilters) => {
    if (!f?.targetTeamId) return "";
    return `?teamId=${encodeURIComponent(f.targetTeamId)}`;
  }, []);

  // generalManagerDashboardFilterSchema aceita SOMENTE: startDate, endDate.
  // Snapshots globais não recebem parâmetro nenhum.
  const buildGlobalQuery = useCallback((f?: DashboardFilters) => {
    if (!f) return "";
    const p = new URLSearchParams();
    if (f.startDate) p.append("startDate", f.startDate);
    if (f.endDate) p.append("endDate", f.endDate);
    const s = p.toString();
    return s ? `?${s}` : "";
  }, []);

  return useMemo(() => {
    // Métodos da visão Manager — também expostos como
    // generalManager.team para o drill-down do GM.
    const managerApi = {
      getActiveNegotiations: async (f?: DashboardFilters): Promise<TeamActiveNegotiationsResponse> =>
        (await apiFetch(`/api/dashboards/manager/kpi/active-negotiations${buildManagerSnapshotQuery(f)}`)).json(),
      getSales: async (f?: DashboardFilters): Promise<TeamSalesResponse> =>
        (await apiFetch(`/api/dashboards/manager/kpi/sales${buildManagerQuery(f)}`)).json(),
      getClosingRate: async (f?: DashboardFilters): Promise<TeamClosingRateResponse> =>
        (await apiFetch(`/api/dashboards/manager/kpi/closing-rate${buildManagerQuery(f)}`)).json(),
      getStagnantNegotiations: async (f?: DashboardFilters): Promise<StagnantNegotiationsResponse> =>
        (await apiFetch(`/api/dashboards/manager/kpi/stagnant-negotiations${buildManagerSnapshotQuery(f)}`)).json(),
      getStageFunnel: async (f?: DashboardFilters): Promise<TeamStageFunnelResponse> =>
        (await apiFetch(`/api/dashboards/manager/charts/stage-funnel${buildManagerSnapshotQuery(f)}`)).json(),
      getSalesByAttendant: async (f?: DashboardFilters): Promise<SalesByAttendantResponse> =>
        (await apiFetch(`/api/dashboards/manager/charts/sales-by-attendant${buildManagerQuery(f)}`)).json(),
      getWorkloadByAttendant: async (f?: DashboardFilters): Promise<WorkloadByAttendantResponse> =>
        (await apiFetch(`/api/dashboards/manager/charts/workload-by-attendant${buildManagerSnapshotQuery(f)}`)).json(),
      getEvolution: async (f?: DashboardFilters): Promise<TeamEvolutionResponse> =>
        (await apiFetch(`/api/dashboards/manager/charts/evolution${buildManagerQuery(f)}`)).json(),
      getIdleLeads: async (f?: DashboardFilters): Promise<IdleLeadsResponse> =>
        (await apiFetch(`/api/dashboards/manager/charts/idle-leads${buildManagerSnapshotQuery(f)}`)).json(),
    };

    return {
      // ── Visão do Atendente ──────────────────────────
      attendant: {
        getActiveNegotiations: async (f?: DashboardFilters): Promise<ActiveNegotiationsResponse> =>
          (await apiFetch(`/api/dashboards/attendant/kpi/active-negotiations${buildAttendantSnapshotQuery(f)}`)).json(),
        getSales: async (f?: DashboardFilters): Promise<SalesResponse> =>
          (await apiFetch(`/api/dashboards/attendant/kpi/sales${buildAttendantQuery(f)}`)).json(),
        getClosingRate: async (f?: DashboardFilters): Promise<ClosingRateResponse> =>
          (await apiFetch(`/api/dashboards/attendant/kpi/closing-rate${buildAttendantQuery(f)}`)).json(),
        getAvgClosingTime: async (f?: DashboardFilters): Promise<AvgClosingTimeResponse> =>
          (await apiFetch(`/api/dashboards/attendant/kpi/avg-closing-time${buildAttendantQuery(f)}`)).json(),
        getStageFunnel: async (f?: DashboardFilters): Promise<StageFunnelResponse> =>
          (await apiFetch(`/api/dashboards/attendant/charts/stage-funnel${buildAttendantSnapshotQuery(f)}`)).json(),
        getEvolution: async (f?: DashboardFilters): Promise<NegotiationsEvolutionResponse> =>
          (await apiFetch(`/api/dashboards/attendant/charts/evolution${buildAttendantQuery(f)}`)).json(),
        getTemperature: async (f?: DashboardFilters): Promise<TemperatureResponse> =>
          (await apiFetch(`/api/dashboards/attendant/charts/temperature${buildAttendantSnapshotQuery(f)}`)).json(),
        getNegotiationsBySource: async (f?: DashboardFilters): Promise<NegotiationsBySourceResponse> =>
          (await apiFetch(`/api/dashboards/attendant/charts/negotiations-by-source${buildAttendantQuery(f)}`)).json(),
        getIdleLeads: async (f?: DashboardFilters): Promise<IdleLeadsResponse> =>
          (await apiFetch(`/api/dashboards/attendant/charts/idle-leads${buildAttendantSnapshotQuery(f)}`)).json(),
      },

      // ── Visão Gerencial (Equipe) ────────────────────
      manager: managerApi,

      // ── Visão Global (Empresa) ──────────────────────
      generalManager: {
        // KPIs
        getActiveNegotiations: async (): Promise<GlobalActiveNegotiationsResponse> =>
          (await apiFetch(`/api/dashboards/general-manager/kpi/active-negotiations`)).json(),
        getSales: async (f?: DashboardFilters): Promise<GlobalSalesResponse> =>
          (await apiFetch(`/api/dashboards/general-manager/kpi/sales${buildGlobalQuery(f)}`)).json(),
        getSalesValue: async (f?: DashboardFilters): Promise<SalesValueResponse> =>
          (await apiFetch(`/api/dashboards/general-manager/kpi/sales-value${buildGlobalQuery(f)}`)).json(),
        getPipelineValue: async (): Promise<PipelineValueResponse> =>
          (await apiFetch(`/api/dashboards/general-manager/kpi/pipeline-value`)).json(),

        // Charts
        getStageFunnel: async (): Promise<GlobalStageFunnelResponse> =>
          (await apiFetch(`/api/dashboards/general-manager/charts/stage-funnel`)).json(),
        getSalesByTeam: async (f?: DashboardFilters): Promise<SalesByTeamResponse> =>
          (await apiFetch(`/api/dashboards/general-manager/charts/sales-by-team${buildGlobalQuery(f)}`)).json(),
        getSalesByStore: async (f?: DashboardFilters): Promise<SalesByStoreResponse> =>
          (await apiFetch(`/api/dashboards/general-manager/charts/sales-by-store${buildGlobalQuery(f)}`)).json(),
        getEvolution: async (f?: DashboardFilters): Promise<GlobalEvolutionResponse> =>
          (await apiFetch(`/api/dashboards/general-manager/charts/evolution${buildGlobalQuery(f)}`)).json(),
        getIdleLeads: async (): Promise<IdleLeadsResponse> =>
          (await apiFetch(`/api/dashboards/general-manager/charts/idle-leads`)).json(),

        // Drill-down de equipe específica → endpoints /manager (teamId)
        team: managerApi,
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
    };
  }, [
    apiFetch,
    buildAttendantQuery,
    buildAttendantSnapshotQuery,
    buildManagerQuery,
    buildManagerSnapshotQuery,
    buildGlobalQuery,
  ]);
}

// src/services/dashboardService.ts

export interface LeadsByTeamItem {
  teamId: string;
  teamName: string;
  count: number;
}

export interface LeadsByTeamResponse {
  leadsByTeam: LeadsByTeamItem[];
}

export interface TeamRankingItem {
  teamId: string;
  teamName: string;
  conversions: number;
}

export interface TeamRankingResponse {
  teamRanking: TeamRankingItem[];
}

export interface ConversionsByAttendantItem {
  attendantId: string;
  attendantName: string;
  count: number;
}

export interface ConversionsByAttendantResponse {
  conversionsByAttendant: ConversionsByAttendantItem[];
}

export interface LeadsByAttendantItem {
  attendantId: string;
  attendantName: string;
  count: number;
}

export interface LeadsByAttendantResponse {
  leadsByAttendant: LeadsByAttendantItem[];
}