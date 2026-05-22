// src/modules/dashboards/general-manager/dashboardGeneralManager.repository.ts

import { prisma, Prisma } from '../../../config/prisma.js';
import { GeneralManagerDashboardFilterDTO } from './dashboardGeneralManager.dto.js';

export class DashboardGeneralManagerRepository {
  private static instance: DashboardGeneralManagerRepository;

  private constructor() {}

  public static getInstance(): DashboardGeneralManagerRepository {
    if (!DashboardGeneralManagerRepository.instance) {
      DashboardGeneralManagerRepository.instance = new DashboardGeneralManagerRepository();
    }
    return DashboardGeneralManagerRepository.instance;
  }

  /**
   * Constrói a cláusula WHERE base apenas com filtros de data.
   * Como é uma visão global, não filtramos por team_id ou attendant_id.
   */
  private getBaseWhere(filters?: GeneralManagerDashboardFilterDTO): Prisma.LeadsWhereInput {
    const where: Prisma.LeadsWhereInput = {};

    if (filters?.startDate || filters?.endDate) {
      where.created_at = {};
      if (filters.startDate) where.created_at.gte = filters.startDate;
      if (filters.endDate) where.created_at.lte = filters.endDate;
    }

    return where;
  }

  // 1. Dados Globais (Total de Leads e Convertidos para calcular taxa e vendas)
  public async getGlobalConversionData(filters?: GeneralManagerDashboardFilterDTO) {
    const where = this.getBaseWhere(filters);
    const [totalLeads, convertedLeads] = await Promise.all([
      prisma.leads.count({ where }),
      prisma.leads.count({ where: { ...where, status: 'CONVERTIDO' } }),
    ]);

    return { totalLeads, convertedLeads };
  }

  // 2. Conversões por Equipe (Para Ranking e Melhor Equipe)
  public async getConversionsByTeam(filters?: GeneralManagerDashboardFilterDTO) {
    const where = this.getBaseWhere(filters);
    return prisma.leads.groupBy({
      by: ['team_id'],
      _count: { id: true },
      where: { ...where, status: 'CONVERTIDO' },
      orderBy: { _count: { id: 'desc' } }
    });
  }

  // 3. Total de Leads por Equipe
  public async getLeadsByTeam(filters?: GeneralManagerDashboardFilterDTO) {
    const where = this.getBaseWhere(filters);
    return prisma.leads.groupBy({
      by: ['team_id'],
      _count: { id: true },
      where,
      orderBy: { _count: { id: 'desc' } }
    });
  }

  // 4. Evolução Global (Agrupado por Data)
  public async getGlobalEvolution(filters?: GeneralManagerDashboardFilterDTO) {
    const where = this.getBaseWhere(filters);
    
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

  // 5. Funil Global (Agrupado por Status)
  public async getGlobalFunnel(filters?: GeneralManagerDashboardFilterDTO) {
    const where = this.getBaseWhere(filters);
    
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