// src/modules/dashboards/attendant/dashboardAttendant.repository.ts

import { prisma, Prisma } from '../../../config/prisma.js';
import type {
  AttendantDashboardFilterDTO,
  ConversionData,
  LeadsBySourceItem,
  LeadsEvolutionPoint,
  LeadTimestamps,
  SalesFunnelItem,
  ConversionsByPeriodPoint,
} from './dashboardAttendant.dto.js';

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD ATTENDANT REPOSITORY
// ─────────────────────────────────────────────────────────────────────────────
// Padrão Singleton — uma única instância para todo o ciclo de vida da aplicação.
// Todas as consultas recebem o attendantId já resolvido (após validação de
// autorização no service) — o repository não faz controle de acesso.
// ─────────────────────────────────────────────────────────────────────────────

/** Status que caracterizam um lead "em andamento" para efeito de KPI. */
const ACTIVE_LEAD_STATUSES: string[] = ['ATIVO', 'EM_ANDAMENTO', 'NOVO'];

/** Status que marca um lead como convertido. */
const CONVERTED_STATUS = 'CONVERTIDO';

export class DashboardAttendantRepository {
  private static instance: DashboardAttendantRepository;

  private constructor() {}

  public static getInstance(): DashboardAttendantRepository {
    if (!DashboardAttendantRepository.instance) {
      DashboardAttendantRepository.instance = new DashboardAttendantRepository();
    }
    return DashboardAttendantRepository.instance;
  }

  // ─── WHERE CLAUSE BASE ───────────────────────────────────────────────────

  /**
   * Monta a cláusula WHERE compartilhada por todas as queries.
   * Filtra sempre por attendant_id e, opcionalmente, por janela de datas
   * aplicada sobre created_at.
   */
  private buildBaseWhere(
    attendantId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Prisma.LeadsWhereInput {
    const where: Prisma.LeadsWhereInput = {
      attendant_id: attendantId,
    };

    const hasDateFilter = filters?.startDate ?? filters?.endDate;
    if (hasDateFilter) {
      where.created_at = {
        ...(filters?.startDate ? { gte: filters.startDate } : {}),
        ...(filters?.endDate ? { lte: filters.endDate } : {}),
      };
    }

    return where;
  }

  // ─── KPIs ────────────────────────────────────────────────────────────────

  /** 1. Contagem de leads com status "ativo" (ATIVO | EM_ANDAMENTO | NOVO). */
  public async countActiveLeads(
    attendantId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<number> {
    return prisma.leads.count({
      where: {
        ...this.buildBaseWhere(attendantId, filters),
        status: { in: ACTIVE_LEAD_STATUSES },
      },
    });
  }

  /** 2. Contagem de leads convertidos. */
  public async countConvertedLeads(
    attendantId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<number> {
    return prisma.leads.count({
      where: {
        ...this.buildBaseWhere(attendantId, filters),
        status: CONVERTED_STATUS,
      },
    });
  }

  /** 3. Total de leads + total convertidos — usados juntos para taxa de conversão. */
  public async getConversionData(
    attendantId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<ConversionData> {
    const baseWhere = this.buildBaseWhere(attendantId, filters);

    const [totalLeads, convertedLeads] = await Promise.all([
      prisma.leads.count({ where: baseWhere }),
      prisma.leads.count({ where: { ...baseWhere, status: CONVERTED_STATUS } }),
    ]);

    return { totalLeads, convertedLeads };
  }

  /**
   * 4. Timestamps dos leads convertidos, usados para calcular o tempo médio
   *    de atendimento no service. Retorna apenas os campos necessários
   *    (select mínimo para evitar overfetch).
   */
  public async getConvertedLeadTimestamps(
    attendantId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<LeadTimestamps[]> {
    return prisma.leads.findMany({
      where: {
        ...this.buildBaseWhere(attendantId, filters),
        status: CONVERTED_STATUS,
      },
      select: {
        created_at: true,
        updated_at: true,
      },
    });
  }

  // ─── CHARTS ──────────────────────────────────────────────────────────────

  /**
   * 5. Leads agrupados por data de criação (dia).
   *    A agregação em memória é aceitável para volumes de atendente único;
   *    migrar para GROUP BY via $queryRaw se surgir gargalo.
   */
  public async getLeadsCreatedDates(
    attendantId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<Date[]> {
    const rows = await prisma.leads.findMany({
      where: this.buildBaseWhere(attendantId, filters),
      select: { created_at: true },
      orderBy: { created_at: 'asc' },
    });

    return rows.map((r) => r.created_at);
  }

  /** 6. Contagem de leads agrupada por status (funil de vendas). */
  public async getSalesFunnel(
    attendantId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<SalesFunnelItem[]> {
    const grouped = await prisma.leads.groupBy({
      by: ['status'],
      _count: { id: true },
      where: this.buildBaseWhere(attendantId, filters),
    });

    return grouped.map((item) => ({
      status: item.status,
      count: item._count.id,
    }));
  }

  /** 7. Contagem de leads agrupada por origem. */
  public async getLeadsBySource(
    attendantId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<LeadsBySourceItem[]> {
    const grouped = await prisma.leads.groupBy({
      by: ['source'],
      _count: { id: true },
      where: this.buildBaseWhere(attendantId, filters),
    });

    return grouped.map((item) => ({
      source: item.source ?? 'Desconhecido',
      count: item._count.id,
    }));
  }

  /**
   * 8. Timestamps de updated_at dos leads convertidos — base para o gráfico
   *    de conversões por período.
   */
  public async getConvertedLeadUpdateDates(
    attendantId: string,
    filters?: AttendantDashboardFilterDTO,
  ): Promise<Date[]> {
    const rows = await prisma.leads.findMany({
      where: {
        ...this.buildBaseWhere(attendantId, filters),
        status: CONVERTED_STATUS,
      },
      select: { updated_at: true },
      orderBy: { updated_at: 'asc' },
    });

    return rows.map((r) => r.updated_at);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS PUROS (exportados para reutilização e testabilidade)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Agrupa um array de Dates por dia (YYYY-MM-DD) e retorna um array de pontos
 * ordenados cronologicamente.
 */
export function groupDatesByDay(dates: Date[]): LeadsEvolutionPoint[] {
  const map = new Map<string, number>();

  for (const date of dates) {
    const key = date.toISOString().split('T')[0] as string;
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}

/**
 * Calcula o tempo médio em horas entre created_at e updated_at
 * de uma lista de leads.
 */
export function calcAvgServiceTimeHours(leads: LeadTimestamps[]): number {
  if (leads.length === 0) return 0;

  const totalMs = leads.reduce((acc, lead) => {
    return acc + (lead.updated_at.getTime() - lead.created_at.getTime());
  }, 0);

  const avgMs = totalMs / leads.length;
  return avgMs / (1_000 * 60 * 60); // ms → horas
}