// src/modules/dashboards/dashboard-manager/dashboardManager.repository.ts

import { prisma, Prisma } from '../../../config/prisma.js';
import type {
  ManagerDashboardFilterDTO,
  AttendantLeadsRow,
  TeamConversionData,
  TeamEvolutionPoint,
  TeamFunnelItem,
} from './dashboardManager.dto.js';

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD MANAGER REPOSITORY
// ─────────────────────────────────────────────────────────────────────────────
// Padrão Singleton — uma única instância para todo o ciclo de vida da aplicação.
// Todas as consultas recebem o teamId já resolvido (após validação de
// autorização no service) — o repository não faz controle de acesso.
//
// Nota sobre groupBy e tipagem:
// O Prisma infere o tipo de retorno do groupBy a partir dos campos declarados
// em `by`. Anotar o retorno diretamente como Promise<AttendantLeadsRow[]>
// causa erro TS2345 porque o compilador tenta intersectar o tipo inferido
// pelo Prisma com AttendantLeadsRow[], e os dois são incompatíveis.
// Solução: deixar o Prisma inferir o resultado, e mapear explicitamente
// para AttendantLeadsRow[] antes de retornar — sem nenhum cast `as`.
// ─────────────────────────────────────────────────────────────────────────────

/** Status de leads "finalizados" que não entram no cálculo de estagnação. */
const FINISHED_STATUSES: string[] = ['CONVERTIDO', 'PERDIDO', 'CANCELADO'];

/** Status que marca um lead como convertido. */
const CONVERTED_STATUS = 'CONVERTIDO';

export class DashboardManagerRepository {
  private static instance: DashboardManagerRepository;

  private constructor() {}

  public static getInstance(): DashboardManagerRepository {
    if (!DashboardManagerRepository.instance) {
      DashboardManagerRepository.instance = new DashboardManagerRepository();
    }
    return DashboardManagerRepository.instance;
  }

  // ─── WHERE CLAUSE BASE ───────────────────────────────────────────────────

  /**
   * Monta a cláusula WHERE compartilhada por todas as queries.
   * Filtra sempre por team_id e, opcionalmente, por janela de datas
   * aplicada sobre created_at.
   */
  private buildBaseWhere(
    teamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Prisma.LeadsWhereInput {
    const where: Prisma.LeadsWhereInput = {
      team_id: teamId,
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

  /**
   * 1. Total de leads da equipa + total convertidos.
   *    Executados em paralelo para minimizar latência.
   */
  public async getTeamConversionData(
    teamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Promise<TeamConversionData> {
    const baseWhere = this.buildBaseWhere(teamId, filters);

    const [totalLeads, convertedLeads] = await Promise.all([
      prisma.leads.count({ where: baseWhere }),
      prisma.leads.count({ where: { ...baseWhere, status: CONVERTED_STATUS } }),
    ]);

    return { totalLeads, convertedLeads };
  }

  /**
   * 2. Leads sem movimentação há mais de 7 dias e cujo status não é final.
   *    O filtro de data dos filtros se aplica ao created_at (janela de análise);
   *    o corte dos 7 dias é sempre relativo ao momento da consulta.
   */
  public async countStagnantLeads(
    teamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return prisma.leads.count({
      where: {
        ...this.buildBaseWhere(teamId, filters),
        updated_at: { lt: sevenDaysAgo },
        status: { notIn: FINISHED_STATUSES },
      },
    });
  }

  // ─── CHARTS ──────────────────────────────────────────────────────────────

  /**
   * 3. Contagem de todos os leads agrupada por atendente.
   *    Inclui leads sem atendente (attendant_id = null).
   *
   *    O Prisma infere o tipo de retorno do groupBy internamente; mapear para
   *    AttendantLeadsRow[] aqui garante o contrato com o service sem forçar
   *    um cast `as` nem declarar o tipo no retorno do groupBy diretamente.
   */
  public async getLeadsByAttendant(
    teamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Promise<AttendantLeadsRow[]> {
    const rows = await prisma.leads.groupBy({
      by: ['attendant_id'],
      _count: { id: true },
      where: this.buildBaseWhere(teamId, filters),
    });

    return rows.map((r) => ({
      attendant_id: r.attendant_id,
      _count: { id: r._count.id },
    }));
  }

  /**
   * 4. Contagem de leads convertidos agrupada por atendente, ordenada
   *    de forma descendente (usado também para determinar o top atendente).
   */
  public async getConversionsByAttendant(
    teamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Promise<AttendantLeadsRow[]> {
    const rows = await prisma.leads.groupBy({
      by: ['attendant_id'],
      _count: { id: true },
      where: { ...this.buildBaseWhere(teamId, filters), status: CONVERTED_STATUS },
      orderBy: { _count: { id: 'desc' } },
    });

    return rows.map((r) => ({
      attendant_id: r.attendant_id,
      _count: { id: r._count.id },
    }));
  }

  /**
   * 5. Datas de criação dos leads da equipa — base para o gráfico de evolução.
   *    A agregação por dia é feita pelo helper puro `groupDatesByDay`.
   */
  public async getTeamLeadsCreatedDates(
    teamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Promise<Date[]> {
    const rows = await prisma.leads.findMany({
      where: this.buildBaseWhere(teamId, filters),
      select: { created_at: true },
      orderBy: { created_at: 'asc' },
    });

    return rows.map((r) => r.created_at);
  }

  /** 6. Contagem de leads da equipa agrupada por status (funil). */
  public async getTeamFunnel(
    teamId: string,
    filters?: ManagerDashboardFilterDTO,
  ): Promise<TeamFunnelItem[]> {
    const grouped = await prisma.leads.groupBy({
      by: ['status'],
      _count: { id: true },
      where: this.buildBaseWhere(teamId, filters),
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
 * Mesmo helper do attendant — extraído aqui para evitar dependência cruzada
 * entre módulos de dashboard.
 */
export function groupDatesByDay(dates: Date[]): TeamEvolutionPoint[] {
  const map = new Map<string, number>();

  for (const date of dates) {
    const key = date.toISOString().split('T')[0] as string;
    map.set(key, (map.get(key) ?? 0) + 1);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
}