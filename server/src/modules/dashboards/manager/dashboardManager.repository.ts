// src/modules/dashboards/dashboard-manager/dashboardManager.repository.ts

import { prisma, Prisma } from '../../../config/prisma.js';
import { CLOSED_STATUSES, type NegotiationStatus } from '../../negotiation-status/status.dto.js';
import {
  NegotiationStageEnum,
  type NegotiationStage,
} from '../../negotiation-stage-history/negotiationStageHistory.dto.js';
import type {
  ManagerDashboardFilterDTO,
  AttendantSalesRow,
  AttendantWorkloadRow,
  TeamClosingData,
  TeamEvolutionPoint,
  TeamIdleLeadsResponse,
  TeamStageFunnelItem,
} from './dashboardManager.dto.js';

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD MANAGER REPOSITORY — negociação-cêntrico
// ─────────────────────────────────────────────────────────────────────────────
// Padrão Singleton. Recebe o teamId já autorizado pelo service.
//
// MODELO MENTAL: idêntico ao módulo attendant (ver comentários lá), com o
// escopo trocado de attendant_id → team_id.
//
// DIFERENÇA DE ESCALA: aqui o volume é de uma EQUIPA inteira, então a busca
// do "registro mais recente por negociação" (funil) usa DISTINCT ON via
// $queryRaw — uma única passada no banco, sem trazer o histórico completo
// para reduzir em memória. Os índices @@index([negotiation_id]) e
// @@index([created_at]) já existentes suportam o plano.
// ─────────────────────────────────────────────────────────────────────────────

/** Status que marca uma negociação encerrada COM venda. */
const WON_STATUS: NegotiationStatus = 'won';

/** Status que marca uma negociação encerrada SEM venda. */
const LOST_STATUS: NegotiationStatus = 'lost';

/** Dias sem movimentação de estágio para considerar uma negociação estagnada. */
const STAGNATION_DAYS = 7;

/** Filtro reutilizável: "esta negociação está ativa (sem status terminal)". */
const ACTIVE_NEGOTIATION_FILTER: Prisma.NegotiationsWhereInput = {
  status_history: {
    none: { status_negotiation: { in: [...CLOSED_STATUSES] } },
  },
};

export class DashboardManagerRepository {
  private static instance: DashboardManagerRepository;

  private constructor() {}

  public static getInstance(): DashboardManagerRepository {
    if (!DashboardManagerRepository.instance) {
      DashboardManagerRepository.instance = new DashboardManagerRepository();
    }
    return DashboardManagerRepository.instance;
  }

  // ─── WHERE BUILDERS ──────────────────────────────────────────────────────

  /** Janela de datas opcional sobre um campo created_at qualquer. */
  private buildDateWindow(
    filters?: ManagerDashboardFilterDTO,
  ): Prisma.DateTimeFilter | undefined {
    const hasDateFilter = filters?.startDate ?? filters?.endDate;
    if (!hasDateFilter) return undefined;

    return {
      ...(filters?.startDate ? { gte: filters.startDate } : {}),
      ...(filters?.endDate ? { lte: filters.endDate } : {}),
    };
  }

  /** Negociações da equipa ABERTAS na janela (âncora: negotiations.created_at). */
  private buildOpenedInWindowWhere(
    teamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Prisma.NegotiationsWhereInput {
    const window = this.buildDateWindow(filters);
    return {
      team_id: teamId,
      ...(window ? { created_at: window } : {}),
    };
  }

  /** Eventos de status da equipa na janela (âncora: status_history.created_at). */
  private buildStatusEventWhere(
    teamId: string,
    status: NegotiationStatus,
    filters?: ManagerDashboardFilterDTO,
  ): Prisma.NegotiationStatusWhereInput {
    const window = this.buildDateWindow(filters);
    return {
      status_negotiation: status,
      negotiations: { team_id: teamId },
      ...(window ? { created_at: window } : {}),
    };
  }

  // ─── KPIs ────────────────────────────────────────────────────────────────

  /** 1. Negociações ativas da equipa (snapshot — ignora janela). */
  public async countActiveNegotiations(teamId: string): Promise<number> {
    return prisma.negotiations.count({
      where: {
        team_id: teamId,
        ...ACTIVE_NEGOTIATION_FILTER,
      },
    });
  }

  /** 2. Vendas da equipa no período: eventos 'won' na janela. */
  public async countSales(
    teamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Promise<number> {
    return prisma.negotiationStatus.count({
      where: this.buildStatusEventWhere(teamId, WON_STATUS, filters),
    });
  }

  /** 3. Eventos terminais (won + lost) da janela — base da taxa de fechamento. */
  public async getClosingData(
    teamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Promise<TeamClosingData> {
    const [wonCount, lostCount] = await Promise.all([
      prisma.negotiationStatus.count({
        where: this.buildStatusEventWhere(teamId, WON_STATUS, filters),
      }),
      prisma.negotiationStatus.count({
        where: this.buildStatusEventWhere(teamId, LOST_STATUS, filters),
      }),
    ]);

    return { wonCount, lostCount };
  }

  /**
   * 4. Negociações estagnadas (snapshot): ativas, abertas há 7+ dias e sem
   *    NENHUM registro de estágio nos últimos 7 dias.
   *    - `created_at < cutoff` poupa negociações recém-abertas;
   *    - `stage_history: { none: recente }` cobre tanto as paradas quanto as
   *      que nunca tiveram movimentação.
   */
  public async countStagnantNegotiations(teamId: string): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - STAGNATION_DAYS);

    return prisma.negotiations.count({
      where: {
        team_id: teamId,
        ...ACTIVE_NEGOTIATION_FILTER,
        created_at: { lt: cutoff },
        stage_history: { none: { created_at: { gte: cutoff } } },
      },
    });
  }

  // ─── CHARTS ──────────────────────────────────────────────────────────────

  /**
   * 5. Funil: estágio ATUAL das negociações ATIVAS da equipa (snapshot).
   *
   *    DISTINCT ON (negotiation_id) + ORDER BY created_at DESC pega o
   *    registro mais recente por negociação numa única passada no banco —
   *    sem carregar o histórico inteiro. O NOT EXISTS replica o
   *    ACTIVE_NEGOTIATION_FILTER em SQL.
   *
   *    Retorna sempre os 7 estágios na ordem do pipeline (com zeros).
   */
  public async getStageFunnel(teamId: string): Promise<TeamStageFunnelItem[]> {
    const rows = await prisma.$queryRaw<Array<{ new_stage: string }>>(Prisma.sql`
      SELECT DISTINCT ON (h.negotiation_id) h.new_stage
      FROM negotiation_stage_history h
      JOIN negotiations n ON n.id = h.negotiation_id
      WHERE n.team_id = ${teamId}
        AND NOT EXISTS (
          SELECT 1
          FROM negotiation_status_history s
          WHERE s.negotiation_id = n.id
            AND s.status_negotiation IN (${Prisma.join([...CLOSED_STATUSES])})
        )
      ORDER BY h.negotiation_id, h.created_at DESC
    `);

    const counts = new Map<NegotiationStage, number>(
      NegotiationStageEnum.options.map((stage) => [stage, 0]),
    );
    for (const row of rows) {
      const stage = row.new_stage as NegotiationStage;
      counts.set(stage, (counts.get(stage) ?? 0) + 1);
    }

    return NegotiationStageEnum.options.map((stage) => ({
      stage,
      count: counts.get(stage) ?? 0,
    }));
  }

  /**
   * 6. Vendas por atendente na janela (ranking).
   *    groupBy do Prisma não atravessa relações; o volume de eventos 'won'
   *    de uma equipa numa janela é pequeno → select da relação + redução.
   */
  public async getSalesByAttendant(
    teamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Promise<AttendantSalesRow[]> {
    const rows = await prisma.negotiationStatus.findMany({
      where: this.buildStatusEventWhere(teamId, WON_STATUS, filters),
      select: { negotiations: { select: { attendant_id: true } } },
    });

    const counts = new Map<string | null, number>();
    for (const row of rows) {
      const id = row.negotiations.attendant_id;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .map(([attendant_id, sales]) => ({ attendant_id, sales }))
      .sort((a, b) => b.sales - a.sales);
  }

  /**
   * 7. Carga de trabalho: negociações ATIVAS agrupadas por atendente (snapshot).
   *    Aqui o groupBy serve direto — attendant_id é coluna de Negotiations.
   */
  public async getWorkloadByAttendant(teamId: string): Promise<AttendantWorkloadRow[]> {
    const rows = await prisma.negotiations.groupBy({
      by: ['attendant_id'],
      _count: { id: true },
      where: {
        team_id: teamId,
        ...ACTIVE_NEGOTIATION_FILTER,
      },
      orderBy: { _count: { id: 'desc' } },
    });

    return rows.map((r) => ({
      attendant_id: r.attendant_id,
      active: r._count.id,
    }));
  }

  /** 8a. Datas de abertura das negociações da equipa na janela. */
  public async getNegotiationsCreatedDates(
    teamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Promise<Date[]> {
    const rows = await prisma.negotiations.findMany({
      where: this.buildOpenedInWindowWhere(teamId, filters),
      select: { created_at: true },
      orderBy: { created_at: 'asc' },
    });

    return rows.map((r) => r.created_at);
  }

  /** 8b. Datas dos eventos 'won' da equipa na janela. */
  public async getWonDates(
    teamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Promise<Date[]> {
    const rows = await prisma.negotiationStatus.findMany({
      where: this.buildStatusEventWhere(teamId, WON_STATUS, filters),
      select: { created_at: true },
      orderBy: { created_at: 'asc' },
    });

    return rows.map((r) => r.created_at);
  }

  /**
   * 9. Leads parados da equipa (snapshot): leads ativos SEM negociação aberta.
   *    Mesma semântica do módulo attendant, escopo trocado para team_id.
   */
  public async getIdleLeads(teamId: string): Promise<TeamIdleLeadsResponse> {
    const baseLeadWhere: Prisma.LeadsWhereInput = {
      team_id: teamId,
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
// Mesmo helper do módulo attendant — duplicado aqui para evitar dependência
// cruzada entre módulos de dashboard (convenção já adotada no projeto).

/**
 * Mescla as séries diárias (aberturas × vendas) em pontos únicos por dia,
 * ordenados cronologicamente, com zeros nos dias presentes em só uma série.
 */
export function mergeEvolution(openedDates: Date[], wonDates: Date[]): TeamEvolutionPoint[] {
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
