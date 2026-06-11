// src/modules/dashboards/attendant/dashboardAttendant.repository.ts

import { prisma, Prisma } from '../../../config/prisma.js';
import { CLOSED_STATUSES, type NegotiationStatus } from '../../negotiation-status/status.dto.js';
import {
  NegotiationStageEnum,
  type NegotiationStage,
} from '../../negotiation-stage-history/negotiationStageHistory.dto.js';
import type {
  AttendantDashboardFilterDTO,
  ClosingData,
  EvolutionPoint,
  IdleLeadsResponse,
  NegotiationsBySourceItem,
  SaleEvent,
  StageFunnelItem,
  TemperatureItem,
} from './dashboardAttendant.dto.js';

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD ATTENDANT REPOSITORY — negociação-cêntrico
// ─────────────────────────────────────────────────────────────────────────────
// Padrão Singleton. Recebe o attendantId já autorizado pelo service.
//
// MODELO MENTAL (refactor):
//   - Entidade-âncora: NEGOTIATIONS (não mais Leads).
//   - Snapshot ("carteira atual"): negociações ativas, funil, temperatura,
//     leads parados → IGNORAM a janela de datas.
//   - Período ("atividade"): vendas, taxa de fechamento, tempo médio,
//     evolução, por origem → janela aplicada sobre a data do EVENTO
//     (criação da negociação ou registro won/lost), nunca sobre o lead.
//
// DEFINIÇÃO DE "NEGOCIAÇÃO ATIVA":
//   Negociação sem NENHUM registro terminal (won/lost) no histórico de status.
//   Statuses terminais são imutáveis e gravados uma única vez pelo
//   stage-history service (CLOSING_STAGE_TO_STATUS), então
//   `status_history: { none: { terminal } }` é um teste exato de "em aberto"
//   resolvido inteiramente no banco — sem reduções em memória.
//
// ESCALA: as reduções "último registro por negociação" (funil/temperatura)
//   são proporcionais à carteira de UM atendente — aceitável. Nos passos 3/5
//   (manager/GM) migrar para DISTINCT ON via $queryRaw.
// ─────────────────────────────────────────────────────────────────────────────

/** Status que marca uma negociação encerrada COM venda. */
const WON_STATUS: NegotiationStatus = 'won';

/** Status que marca uma negociação encerrada SEM venda. */
const LOST_STATUS: NegotiationStatus = 'lost';

/** Filtro reutilizável: "esta negociação está ativa (sem status terminal)". */
const ACTIVE_NEGOTIATION_FILTER: Prisma.NegotiationsWhereInput = {
  status_history: {
    none: { status_negotiation: { in: [...CLOSED_STATUSES] } },
  },
};

export class DashboardAttendantRepository {
  private static instance: DashboardAttendantRepository;

  private constructor() {}

  public static getInstance(): DashboardAttendantRepository {
    if (!DashboardAttendantRepository.instance) {
      DashboardAttendantRepository.instance = new DashboardAttendantRepository();
    }
    return DashboardAttendantRepository.instance;
  }

  // ─── WHERE BUILDERS ──────────────────────────────────────────────────────

  /** Janela de datas opcional sobre um campo created_at qualquer. */
  private buildDateWindow(
    filters?: AttendantDashboardFilterDTO,
  ): Prisma.DateTimeFilter | undefined {
    const hasDateFilter = filters?.startDate ?? filters?.endDate;
    if (!hasDateFilter) return undefined;

    return {
      ...(filters?.startDate ? { gte: filters.startDate } : {}),
      ...(filters?.endDate ? { lte: filters.endDate } : {}),
    };
  }

  /** Negociações do atendente ABERTAS na janela (âncora: negotiations.created_at). */
  private buildOpenedInWindowWhere(
    attendantId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Prisma.NegotiationsWhereInput {
    const window = this.buildDateWindow(filters);
    return {
      attendant_id: attendantId,
      ...(window ? { created_at: window } : {}),
    };
  }

  /**
   * Eventos de status do atendente na janela (âncora: status_history.created_at).
   * O escopo do atendente entra pela relação `negotiations`.
   */
  private buildStatusEventWhere(
    attendantId: string,
    status: NegotiationStatus,
    filters?: AttendantDashboardFilterDTO,
  ): Prisma.NegotiationStatusWhereInput {
    const window = this.buildDateWindow(filters);
    return {
      status_negotiation: status,
      negotiations: { attendant_id: attendantId },
      ...(window ? { created_at: window } : {}),
    };
  }

  // ─── KPIs ────────────────────────────────────────────────────────────────

  /** 1. Negociações ativas (snapshot da carteira — ignora janela). */
  public async countActiveNegotiations(attendantId: string): Promise<number> {
    return prisma.negotiations.count({
      where: {
        attendant_id: attendantId,
        ...ACTIVE_NEGOTIATION_FILTER,
      },
    });
  }

  /** 2. Vendas no período: eventos 'won' dentro da janela. */
  public async countSales(
    attendantId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<number> {
    return prisma.negotiationStatus.count({
      where: this.buildStatusEventWhere(attendantId, WON_STATUS, filters),
    });
  }

  /** 3. Eventos terminais (won + lost) da janela — base da taxa de fechamento. */
  public async getClosingData(
    attendantId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<ClosingData> {
    const [wonCount, lostCount] = await Promise.all([
      prisma.negotiationStatus.count({
        where: this.buildStatusEventWhere(attendantId, WON_STATUS, filters),
      }),
      prisma.negotiationStatus.count({
        where: this.buildStatusEventWhere(attendantId, LOST_STATUS, filters),
      }),
    ]);

    return { wonCount, lostCount };
  }

  /**
   * 4. Eventos de venda da janela com a data de abertura da NEGOCIAÇÃO —
   *    base do tempo médio de fechamento (e reaproveitável na evolução).
   */
  public async getSaleEvents(
    attendantId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<SaleEvent[]> {
    const rows = await prisma.negotiationStatus.findMany({
      where: this.buildStatusEventWhere(attendantId, WON_STATUS, filters),
      select: {
        created_at: true,
        negotiations: { select: { created_at: true } },
      },
      orderBy: { created_at: 'asc' },
    });

    return rows.map((r) => ({
      negotiationCreatedAt: r.negotiations.created_at,
      wonAt: r.created_at,
    }));
  }

  // ─── CHARTS ──────────────────────────────────────────────────────────────

  /**
   * 5. Funil: estágio ATUAL das negociações ATIVAS do atendente (snapshot).
   *    Estágio atual = new_stage do registro mais recente por negociação.
   *    Retorna sempre os 7 estágios na ordem do pipeline (com zeros).
   */
  public async getStageFunnel(attendantId: string): Promise<StageFunnelItem[]> {
    const rows = await prisma.negotiationStageHistory.findMany({
      where: {
        negotiations: {
          attendant_id: attendantId,
          ...ACTIVE_NEGOTIATION_FILTER,
        },
      },
      select: { negotiation_id: true, new_stage: true },
      orderBy: { created_at: 'desc' },
    });

    // Primeiro registro visto por negociação = o mais recente (ordenado desc).
    const currentStageByNegotiation = new Map<string, NegotiationStage>();
    for (const row of rows) {
      if (!currentStageByNegotiation.has(row.negotiation_id)) {
        currentStageByNegotiation.set(row.negotiation_id, row.new_stage as NegotiationStage);
      }
    }

    const counts = new Map<NegotiationStage, number>(
      NegotiationStageEnum.options.map((stage) => [stage, 0]),
    );
    for (const stage of currentStageByNegotiation.values()) {
      counts.set(stage, (counts.get(stage) ?? 0) + 1);
    }

    return NegotiationStageEnum.options.map((stage) => ({
      stage,
      count: counts.get(stage) ?? 0,
    }));
  }

  /**
   * 6a. Datas de abertura das negociações na janela — série "opened".
   */
  public async getNegotiationsCreatedDates(
    attendantId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<Date[]> {
    const rows = await prisma.negotiations.findMany({
      where: this.buildOpenedInWindowWhere(attendantId, filters),
      select: { created_at: true },
      orderBy: { created_at: 'asc' },
    });

    return rows.map((r) => r.created_at);
  }

  /**
   * 7. Temperatura: importância MAIS RECENTE das negociações ATIVAS (snapshot).
   */
  public async getTemperature(attendantId: string): Promise<TemperatureItem[]> {
    const rows = await prisma.negotiationImportance.findMany({
      where: {
        negotiations: {
          attendant_id: attendantId,
          ...ACTIVE_NEGOTIATION_FILTER,
        },
      },
      select: { negotiation_id: true, importance: true },
      orderBy: { created_at: 'desc' },
    });

    const currentByNegotiation = new Map<string, string>();
    for (const row of rows) {
      if (!currentByNegotiation.has(row.negotiation_id)) {
        currentByNegotiation.set(row.negotiation_id, row.importance);
      }
    }

    const counts = new Map<string, number>();
    for (const importance of currentByNegotiation.values()) {
      counts.set(importance, (counts.get(importance) ?? 0) + 1);
    }

    // Ordem fixa de exibição; valores fora do vocabulário vão para o fim.
    const DISPLAY_ORDER = ['quente', 'morno', 'frio'];
    return Array.from(counts.entries())
      .map(([importance, count]) => ({ importance, count }))
      .sort((a, b) => {
        const ia = DISPLAY_ORDER.indexOf(a.importance);
        const ib = DISPLAY_ORDER.indexOf(b.importance);
        return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
      });
  }

  /**
   * 8. Negociações abertas na janela agrupadas pela ORIGEM do lead.
   *    groupBy não atravessa relações no Prisma → select da relação + redução
   *    em memória (volume de um atendente).
   */
  public async getNegotiationsBySource(
    attendantId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<NegotiationsBySourceItem[]> {
    const rows = await prisma.negotiations.findMany({
      where: this.buildOpenedInWindowWhere(attendantId, filters),
      select: { leads: { select: { source: true } } },
    });

    const counts = new Map<string, number>();
    for (const row of rows) {
      const source = row.leads.source ?? 'Desconhecido';
      counts.set(source, (counts.get(source) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * 9. Leads parados (snapshot): leads ativos do atendente SEM negociação aberta.
   *    - neverNegotiated: `negotiations: { none: {} }` — nunca trabalhados;
   *    - closedOnly: têm negociações, mas NENHUMA ativa — tudo encerrado;
   *    - bySource: origem dos nunca-negociados (onde agir primeiro).
   */
  public async getIdleLeads(attendantId: string): Promise<IdleLeadsResponse> {
    const baseLeadWhere: Prisma.LeadsWhereInput = {
      attendant_id: attendantId,
      is_active: true,
    };

    const neverNegotiatedWhere: Prisma.LeadsWhereInput = {
      ...baseLeadWhere,
      negotiations: { none: {} },
    };

    const closedOnlyWhere: Prisma.LeadsWhereInput = {
      AND: [
        baseLeadWhere,
        { negotiations: { some: {} } },
        // nenhuma negociação satisfaz "ativa" → todas encerradas
        { negotiations: { none: ACTIVE_NEGOTIATION_FILTER } },
      ],
    };

    const [neverNegotiated, closedOnly, bySourceRows] = await Promise.all([
      prisma.leads.count({ where: neverNegotiatedWhere }),
      prisma.leads.count({ where: closedOnlyWhere }),
      prisma.leads.groupBy({
        by: ['source'],
        _count: { id: true },
        where: neverNegotiatedWhere,
        orderBy: { _count: { id: 'desc' } },
      }),
    ]);

    return {
      idleLeads: {
        total: neverNegotiated + closedOnly,
        neverNegotiated,
        closedOnly,
        bySource: bySourceRows.map((r) => ({
          source: r.source ?? 'Desconhecido',
          count: r._count.id,
        })),
      },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS PUROS (exportados para reutilização e testabilidade)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Mescla as duas séries diárias (aberturas × vendas) em pontos únicos por dia,
 * ordenados cronologicamente. Dias presentes em apenas uma série recebem 0
 * na outra — o gráfico de linha dupla nunca tem buracos assimétricos.
 */
export function mergeEvolution(openedDates: Date[], wonDates: Date[]): EvolutionPoint[] {
  const toDay = (d: Date): string => d.toISOString().split('T')[0] as string;

  const opened = new Map<string, number>();
  for (const d of openedDates) {
    const key = toDay(d);
    opened.set(key, (opened.get(key) ?? 0) + 1);
  }

  const won = new Map<string, number>();
  for (const d of wonDates) {
    const key = toDay(d);
    won.set(key, (won.get(key) ?? 0) + 1);
  }

  const allDays = new Set<string>([...opened.keys(), ...won.keys()]);

  return Array.from(allDays)
    .sort((a, b) => a.localeCompare(b))
    .map((date) => ({
      date,
      opened: opened.get(date) ?? 0,
      won: won.get(date) ?? 0,
    }));
}

/**
 * Tempo médio de fechamento em horas: média de (wonAt − negotiationCreatedAt).
 * Retorna 0 quando não há vendas na janela.
 */
export function calcAvgClosingTimeHours(events: SaleEvent[]): number {
  if (events.length === 0) return 0;

  const totalMs = events.reduce(
    (acc, e) => acc + (e.wonAt.getTime() - e.negotiationCreatedAt.getTime()),
    0,
  );

  return totalMs / events.length / (1000 * 60 * 60);
}
