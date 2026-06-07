// src/modules/dashboards/general-manager/dashboardGeneralManager.repository.ts

import { prisma, Prisma } from '../../../config/prisma.js';
import type {
  GeneralManagerDashboardFilterDTO,
  GlobalConversionData,
  GlobalEvolutionPoint,
  GlobalFunnelItem,
  TeamLeadsRow,
} from './dashboardGeneralManager.dto.js';

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD GENERAL MANAGER REPOSITORY
// ─────────────────────────────────────────────────────────────────────────────
// Padrão Singleton — uma única instância para todo o ciclo de vida da aplicação.
//
// Diferença central em relação aos outros dashboards: a cláusula WHERE base
// não filtra por team_id nem attendant_id — a visão é global por definição.
//
// Nota sobre groupBy e tipagem:
// Mesmo que `team_id` seja NOT NULL no schema, o Prisma infere o tipo de
// retorno do groupBy como `string | null` para campos que participam do `by`.
// Isso é um comportamento do gerador de tipos do Prisma — ele não consegue
// garantir em tempo de compilação que o banco não retornará null.
// Solução: filtrar as linhas com team_id null com `.filter()` antes do
// `.map()`. O TypeScript faz o narrowing automaticamente após o filtro,
// sem necessidade de cast `as`.
// ─────────────────────────────────────────────────────────────────────────────

/** Status que marca um lead como convertido. */
const CONVERTED_STATUS = 'CONVERTIDO';

export class DashboardGeneralManagerRepository {
  private static instance: DashboardGeneralManagerRepository;

  private constructor() {}

  public static getInstance(): DashboardGeneralManagerRepository {
    if (!DashboardGeneralManagerRepository.instance) {
      DashboardGeneralManagerRepository.instance = new DashboardGeneralManagerRepository();
    }
    return DashboardGeneralManagerRepository.instance;
  }

  // ─── WHERE CLAUSE BASE ───────────────────────────────────────────────────

  /**
   * Monta a cláusula WHERE com filtros de data opcionais.
   * Sem restrição de team_id ou attendant_id — visão global.
   */
  private buildBaseWhere(
    filters?: GeneralManagerDashboardFilterDTO,
  ): Prisma.LeadsWhereInput {
    const where: Prisma.LeadsWhereInput = {};

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

  /**
   * 1. Total global de leads + total convertidos.
   *    Executados em paralelo para minimizar latência.
   */
  public async getGlobalConversionData(
    filters?: GeneralManagerDashboardFilterDTO,
  ): Promise<GlobalConversionData> {
    const baseWhere = this.buildBaseWhere(filters);

    const [totalLeads, convertedLeads] = await Promise.all([
      prisma.leads.count({ where: baseWhere }),
      prisma.leads.count({ where: { ...baseWhere, status: CONVERTED_STATUS } }),
    ]);

    return { totalLeads, convertedLeads };
  }

  /**
   * 2. Leads convertidos agrupados por equipa, ordenados de forma descendente.
   *    Usado tanto para o ranking de equipas quanto para determinar a top equipa.
   *
   *    O `.filter()` descarta as raras linhas onde team_id é null no retorno
   *    do groupBy (comportamento do gerador de tipos do Prisma). Após o filtro
   *    o TS faz narrowing para `string` automaticamente.
   */
  public async getConversionsByTeam(
    filters?: GeneralManagerDashboardFilterDTO,
  ): Promise<TeamLeadsRow[]> {
    const rows = await prisma.leads.groupBy({
      by: ['team_id'],
      _count: { id: true },
      where: { ...this.buildBaseWhere(filters), status: CONVERTED_STATUS },
      orderBy: { _count: { id: 'desc' } },
    });

    return rows
      .filter((r) => r.team_id !== null)
      .map((r) => ({
        team_id: r.team_id as string, // narrowed pelo filter acima
        _count: { id: r._count.id },
      }));
  }

  /**
   * 3. Total de leads (todos os status) agrupado por equipa, ordenado de
   *    forma descendente.
   *
   *    Mesmo tratamento de null do método acima.
   */
  public async getLeadsByTeam(
    filters?: GeneralManagerDashboardFilterDTO,
  ): Promise<TeamLeadsRow[]> {
    const rows = await prisma.leads.groupBy({
      by: ['team_id'],
      _count: { id: true },
      where: this.buildBaseWhere(filters),
      orderBy: { _count: { id: 'desc' } },
    });

    return rows
      .filter((r) => r.team_id !== null)
      .map((r) => ({
        team_id: r.team_id as string, // narrowed pelo filter acima
        _count: { id: r._count.id },
      }));
  }

  /**
   * 4. Datas de criação de todos os leads — base para o gráfico de evolução global.
   *    A agregação por dia é feita pelo helper puro `groupDatesByDay`.
   */
  public async getGlobalLeadsCreatedDates(
    filters?: GeneralManagerDashboardFilterDTO,
  ): Promise<Date[]> {
    const rows = await prisma.leads.findMany({
      where: this.buildBaseWhere(filters),
      select: { created_at: true },
      orderBy: { created_at: 'asc' },
    });

    return rows.map((r) => r.created_at);
  }

  /** 5. Contagem global de leads agrupada por status (funil). */
  public async getGlobalFunnel(
    filters?: GeneralManagerDashboardFilterDTO,
  ): Promise<GlobalFunnelItem[]> {
    const grouped = await prisma.leads.groupBy({
      by: ['status'],
      _count: { id: true },
      where: this.buildBaseWhere(filters),
    });

    return grouped.map((item) => ({
      status: item.status,
      count: item._count.id,
    }));
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS PUROS (exportados para reutilização e testabilidade)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Agrupa um array de Dates por dia (YYYY-MM-DD) e retorna pontos
 * ordenados cronologicamente.
 * Mesmo helper do attendant e manager — redeclarado aqui para manter
 * os módulos de dashboard independentes entre si.
 */
export function groupDatesByDay(dates: Date[]): GlobalEvolutionPoint[] {
  const map = new Map<string, number>();

  for (const date of dates) {
    const key = date.toISOString().split('T')[0] as string;
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}