// src/modules/dashboards/dashboard-manager/dashboardManager.repository.ts

import { prisma, Prisma } from '../../../config/prisma.js';
import { ManagerDashboardFilterDTO } from './dashboardManager.dto.js';

export class DashboardManagerRepository {
  private static instance: DashboardManagerRepository;

  private constructor() {}

  public static getInstance(): DashboardManagerRepository {
    if (!DashboardManagerRepository.instance) {
      DashboardManagerRepository.instance = new DashboardManagerRepository();
    }
    return DashboardManagerRepository.instance;
  }

  /**
   * Constrói a cláusula WHERE base para os filtros de data e equipe.
   * O teamId recebido aqui já será o ID resolvido e validado pelo Controller/Service.
   */
  private getBaseWhere(teamId: string, filters?: ManagerDashboardFilterDTO): Prisma.LeadsWhereInput {
    const where: Prisma.LeadsWhereInput = {
      team_id: teamId,
    };

    if (filters?.startDate || filters?.endDate) {
      where.created_at = {};
      if (filters.startDate) where.created_at.gte = filters.startDate;
      if (filters.endDate) where.created_at.lte = filters.endDate;
    }

    return where;
  }

  // 1. Total Leads da Equipe e Convertidos (Para cálculo de taxa no service)
  public async getTeamConversionData(teamId: string, filters?: ManagerDashboardFilterDTO) {
    const where = this.getBaseWhere(teamId, filters);
    const [totalLeads, convertedLeads] = await Promise.all([
      prisma.leads.count({ where }),
      prisma.leads.count({ where: { ...where, status: 'CONVERTIDO' } }),
    ]);

    return { totalLeads, convertedLeads };
  }

  // 2. Leads Sem Movimentação (> 7 dias sem atualização e não finalizados)
  public async countStagnantLeads(teamId: string, filters?: ManagerDashboardFilterDTO): Promise<number> {
    const where = this.getBaseWhere(teamId, filters);
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return prisma.leads.count({
      where: {
        ...where,
        updated_at: { lt: sevenDaysAgo },
        status: { notIn: ['CONVERTIDO', 'PERDIDO', 'CANCELADO'] },
      },
    });
  }

  // 3. Leads por Atendente
  public async getLeadsByAttendant(teamId: string, filters?: ManagerDashboardFilterDTO) {
    const where = this.getBaseWhere(teamId, filters);
    
    return prisma.leads.groupBy({
      by: ['attendant_id'],
      _count: { id: true },
      where,
    });
  }

  // 4. Conversões por Atendente (Usado também para descobrir o "Melhor Atendente")
  public async getConversionsByAttendant(teamId: string, filters?: ManagerDashboardFilterDTO) {
    const where = this.getBaseWhere(teamId, filters);
    
    return prisma.leads.groupBy({
      by: ['attendant_id'],
      _count: { id: true },
      where: { ...where, status: 'CONVERTIDO' },
      orderBy: {
        _count: { id: 'desc' }
      }
    });
  }

  // 5. Evolução da Equipe
  public async getTeamEvolution(teamId: string, filters?: ManagerDashboardFilterDTO) {
    const where = this.getBaseWhere(teamId, filters);
    
    const leads = await prisma.leads.findMany({
      where,
      select: { created_at: true },
      orderBy: { created_at: 'asc' },
    });

    const grouped = leads.reduce((acc, lead) => {
      const dateStr = lead.created_at.toISOString().split('T')[0] as string;
      acc[dateStr] = (acc[dateStr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }

  // 6. Funil da Equipe
  public async getTeamFunnel(teamId: string, filters?: ManagerDashboardFilterDTO) {
    const where = this.getBaseWhere(teamId, filters);
    
    const grouped = await prisma.leads.groupBy({
      by: ['status'],
      _count: { id: true },
      where,
    });

    return grouped.map((item) => ({
      status: item.status,
      count: item._count.id,
    }));
  }
}