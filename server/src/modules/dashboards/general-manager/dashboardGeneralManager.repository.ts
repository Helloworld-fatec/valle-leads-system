// src/modules/dashboards/dashboard-general-manager/dashboardGeneralManager.repository.ts

import { prisma, Prisma } from '../../../config/prisma.js';
import { CLOSED_STATUSES, type NegotiationStatus } from '../../negotiation-status/status.dto.js';
import {
  NegotiationStageEnum,
  type NegotiationStage,
} from '../../negotiation-stage-history/negotiationStageHistory.dto.js';
import type {
  GeneralManagerDashboardFilterDTO,
  GlobalEvolutionPoint,
  GlobalIdleLeadsResponse,
  GlobalStageFunnelItem,
  PipelineValueResponse,
  SalesByStoreItem,
  SalesByTeamItem,
  SalesValueResponse,
} from './dashboardGeneralManager.dto.js';

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD GENERAL MANAGER REPOSITORY — negociação-cêntrico
// ─────────────────────────────────────────────────────────────────────────────
// Padrão Singleton. Visão GLOBAL: sem parâmetro de escopo.
//
// ESCALA: este é o módulo de maior volume (todas as equipes), então as
// agregações pesadas — funil, valores em R$, vendas por equipe/loja — são
// resolvidas inteiramente no Postgres via $queryRaw, com COUNT/SUM/GROUP BY
// e DISTINCT ON. Os casts ::int e ::float8 garantem que o driver entregue
// number ao JS (sem BigInt/Decimal para tratar na aplicação).
//
// DINHEIRO: interest_items.value é Decimal(15,2); o cast ::float8 é
// suficiente para exibição em dashboard (não é cálculo contábil).
// ─────────────────────────────────────────────────────────────────────────────

/** Status que marca uma negociação encerrada COM venda. */
const WON_STATUS: NegotiationStatus = 'won';

/** Filtro Prisma reutilizável: "negociação ativa (sem status terminal)". */
const ACTIVE_NEGOTIATION_FILTER: Prisma.NegotiationsWhereInput = {
  status_history: {
    none: { status_negotiation: { in: [...CLOSED_STATUSES] } },
  },
};

/** Fragmento SQL equivalente ao ACTIVE_NEGOTIATION_FILTER (alias n). */
const SQL_NEGOTIATION_IS_ACTIVE = Prisma.sql`
  NOT EXISTS (
    SELECT 1
    FROM negotiation_status_history s_term
    WHERE s_term.negotiation_id = n.id
      AND s_term.status_negotiation IN (${Prisma.join([...CLOSED_STATUSES])})
  )
`;

export class DashboardGeneralManagerRepository {
  private static instance: DashboardGeneralManagerRepository;

  private constructor() {}

  public static getInstance(): DashboardGeneralManagerRepository {
    if (!DashboardGeneralManagerRepository.instance) {
      DashboardGeneralManagerRepository.instance = new DashboardGeneralManagerRepository();
    }
    return DashboardGeneralManagerRepository.instance;
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────

  /** Janela de datas opcional sobre um campo created_at qualquer (Prisma). */
  private buildDateWindow(
    filters?: GeneralManagerDashboardFilterDTO,
  ): Prisma.DateTimeFilter | undefined {
    const hasDateFilter = filters?.startDate ?? filters?.endDate;
    if (!hasDateFilter) return undefined;

    return {
      ...(filters?.startDate ? { gte: filters.startDate } : {}),
      ...(filters?.endDate ? { lte: filters.endDate } : {}),
    };
  }

  /**
   * Fragmento SQL da janela sobre uma coluna qualificada (ex: 's.created_at').
   * Retorna Prisma.empty quando não há filtro — concatenável sem condicionais
   * no call-site.
   */
  private sqlDateWindow(
    column: Prisma.Sql,
    filters?: GeneralManagerDashboardFilterDTO,
  ): Prisma.Sql {
    const start = filters?.startDate
      ? Prisma.sql`AND ${column} >= ${filters.startDate}`
      : Prisma.empty;
    const end = filters?.endDate
      ? Prisma.sql`AND ${column} <= ${filters.endDate}`
      : Prisma.empty;
    return Prisma.sql`${start} ${end}`;
  }

  // ─── KPIs ────────────────────────────────────────────────────────────────

  /** 1. Negociações ativas globais (snapshot — ignora janela). */
  public async countActiveNegotiations(): Promise<number> {
    return prisma.negotiations.count({ where: ACTIVE_NEGOTIATION_FILTER });
  }

  /** 2. Vendas no período: eventos 'won' na janela (contagem). */
  public async countSales(filters?: GeneralManagerDashboardFilterDTO): Promise<number> {
    const window = this.buildDateWindow(filters);
    return prisma.negotiationStatus.count({
      where: {
        status_negotiation: WON_STATUS,
        ...(window ? { created_at: window } : {}),
      },
    });
  }

  /**
   * 3. Valor vendido (R$) na janela: soma de interest_items.value dos leads
   *    das negociações ganhas. LEFT JOIN preserva vendas sem item/valor —
   *    contadas em sales_without_value para o gestor calibrar a leitura.
   */
  public async getSalesValue(
    filters?: GeneralManagerDashboardFilterDTO,
  ): Promise<SalesValueResponse> {
    const rows = await prisma.$queryRaw<
      Array<{ sales_value: number; sales_without_value: number }>
    >(Prisma.sql`
      SELECT
        COALESCE(SUM(ii.value), 0)::float8                          AS sales_value,
        COUNT(*) FILTER (WHERE ii.value IS NULL)::int               AS sales_without_value
      FROM negotiation_status_history s
      JOIN negotiations n   ON n.id  = s.negotiation_id
      JOIN leads l          ON l.id  = n.lead_id
      LEFT JOIN interest_items ii ON ii.id = l.interest_item_id
      WHERE s.status_negotiation = ${WON_STATUS}
        ${this.sqlDateWindow(Prisma.sql`s.created_at`, filters)}
    `);

    const row = rows[0];
    return {
      salesValue: row?.sales_value ?? 0,
      salesWithoutValue: row?.sales_without_value ?? 0,
    };
  }

  /**
   * 4. Valor em pipeline (R$): soma dos valores de interesse das negociações
   *    ATIVAS (snapshot) — quanto há "na mesa" agora.
   */
  public async getPipelineValue(): Promise<PipelineValueResponse> {
    const rows = await prisma.$queryRaw<
      Array<{ pipeline_value: number; without_value: number }>
    >(Prisma.sql`
      SELECT
        COALESCE(SUM(ii.value), 0)::float8            AS pipeline_value,
        COUNT(*) FILTER (WHERE ii.value IS NULL)::int AS without_value
      FROM negotiations n
      JOIN leads l ON l.id = n.lead_id
      LEFT JOIN interest_items ii ON ii.id = l.interest_item_id
      WHERE ${SQL_NEGOTIATION_IS_ACTIVE}
    `);

    const row = rows[0];
    return {
      pipelineValue: row?.pipeline_value ?? 0,
      negotiationsWithoutValue: row?.without_value ?? 0,
    };
  }

  // ─── CHARTS ──────────────────────────────────────────────────────────────

  /**
   * 5. Funil global (snapshot): estágio ATUAL das negociações ativas.
   *    DISTINCT ON pega o registro mais recente por negociação; a contagem
   *    por estágio também fica no banco. Retorna os 7 estágios com zeros.
   */
  public async getStageFunnel(): Promise<GlobalStageFunnelItem[]> {
    const rows = await prisma.$queryRaw<Array<{ new_stage: string; count: number }>>(Prisma.sql`
      SELECT x.new_stage, COUNT(*)::int AS count
      FROM (
        SELECT DISTINCT ON (h.negotiation_id) h.negotiation_id, h.new_stage
        FROM negotiation_stage_history h
        JOIN negotiations n ON n.id = h.negotiation_id
        WHERE ${SQL_NEGOTIATION_IS_ACTIVE}
        ORDER BY h.negotiation_id, h.created_at DESC
      ) x
      GROUP BY x.new_stage
    `);

    const counts = new Map<NegotiationStage, number>(
      NegotiationStageEnum.options.map((stage) => [stage, 0]),
    );
    for (const row of rows) {
      counts.set(row.new_stage as NegotiationStage, row.count);
    }

    return NegotiationStageEnum.options.map((stage) => ({
      stage,
      count: counts.get(stage) ?? 0,
    }));
  }

  /** 6. Ranking de vendas por equipe na janela (nome resolvido no JOIN). */
  public async getSalesByTeam(
    filters?: GeneralManagerDashboardFilterDTO,
  ): Promise<SalesByTeamItem[]> {
    const rows = await prisma.$queryRaw<
      Array<{ team_id: string; team_name: string; sales: number }>
    >(Prisma.sql`
      SELECT t.id AS team_id, t.name AS team_name, COUNT(*)::int AS sales
      FROM negotiation_status_history s
      JOIN negotiations n ON n.id = s.negotiation_id
      JOIN teams t        ON t.id = n.team_id
      WHERE s.status_negotiation = ${WON_STATUS}
        ${this.sqlDateWindow(Prisma.sql`s.created_at`, filters)}
      GROUP BY t.id, t.name
      ORDER BY sales DESC
    `);

    return rows.map((r) => ({
      teamId: r.team_id,
      teamName: r.team_name,
      sales: r.sales,
    }));
  }

  /**
   * 7. Vendas por loja na janela (Stores → Teams → Negotiations) —
   *    contagem E valor, aproveitando a hierarquia de lojas do schema.
   */
  public async getSalesByStore(
    filters?: GeneralManagerDashboardFilterDTO,
  ): Promise<SalesByStoreItem[]> {
    const rows = await prisma.$queryRaw<
      Array<{ store_id: string; store_name: string; sales: number; sales_value: number }>
    >(Prisma.sql`
      SELECT
        st.id   AS store_id,
        st.name AS store_name,
        COUNT(*)::int                       AS sales,
        COALESCE(SUM(ii.value), 0)::float8  AS sales_value
      FROM negotiation_status_history s
      JOIN negotiations n   ON n.id  = s.negotiation_id
      JOIN teams t          ON t.id  = n.team_id
      JOIN stores st        ON st.id = t.store_id
      JOIN leads l          ON l.id  = n.lead_id
      LEFT JOIN interest_items ii ON ii.id = l.interest_item_id
      WHERE s.status_negotiation = ${WON_STATUS}
        ${this.sqlDateWindow(Prisma.sql`s.created_at`, filters)}
      GROUP BY st.id, st.name
      ORDER BY sales DESC
    `);

    return rows.map((r) => ({
      storeId: r.store_id,
      storeName: r.store_name,
      sales: r.sales,
      salesValue: r.sales_value,
    }));
  }

  /** 8a. Datas de abertura das negociações na janela (global). */
  public async getNegotiationsCreatedDates(
    filters?: GeneralManagerDashboardFilterDTO,
  ): Promise<Date[]> {
    const window = this.buildDateWindow(filters);
    const rows = await prisma.negotiations.findMany({
      where: window ? { created_at: window } : {},
      select: { created_at: true },
      orderBy: { created_at: 'asc' },
    });

    return rows.map((r) => r.created_at);
  }

  /** 8b. Datas dos eventos 'won' na janela (global). */
  public async getWonDates(
    filters?: GeneralManagerDashboardFilterDTO,
  ): Promise<Date[]> {
    const window = this.buildDateWindow(filters);
    const rows = await prisma.negotiationStatus.findMany({
      where: {
        status_negotiation: WON_STATUS,
        ...(window ? { created_at: window } : {}),
      },
      select: { created_at: true },
      orderBy: { created_at: 'asc' },
    });

    return rows.map((r) => r.created_at);
  }

  /** 9. Leads parados globais (snapshot): sem nenhuma negociação aberta. */
  public async getIdleLeads(): Promise<GlobalIdleLeadsResponse> {
    const baseLeadWhere: Prisma.LeadsWhereInput = { is_active: true };

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
// Mesmo helper dos módulos attendant/manager — duplicado para evitar
// dependência cruzada entre módulos de dashboard (convenção do projeto).

/**
 * Mescla as séries diárias (aberturas × vendas) em pontos únicos por dia,
 * ordenados cronologicamente, com zeros nos dias presentes em só uma série.
 */
export function mergeEvolution(
  openedDates: Date[],
  wonDates: Date[],
): GlobalEvolutionPoint[] {
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
