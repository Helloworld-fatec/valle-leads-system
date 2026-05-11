// src/modules/dashboards/attendant/dashboardAttendant.repository.ts

import { prisma, Prisma } from '../../../config/prisma.js';
import { AttendantDashboardFilterDTO } from './dashboardAttendant.dto.js';

export class DashboardAttendantRepository {
  private static instance: DashboardAttendantRepository;

  private constructor() {}

  public static getInstance(): DashboardAttendantRepository {
    if (!DashboardAttendantRepository.instance) {
      DashboardAttendantRepository.instance = new DashboardAttendantRepository();
    }
    return DashboardAttendantRepository.instance;
  }

  /**
   * Constrói a cláusula WHERE base para os filtros de data e atendente.
   * O attendantId recebido aqui já será o ID resolvido pelo Controller/Service.
   */
  private getBaseWhere(attendantId: string, filters?: AttendantDashboardFilterDTO): Prisma.LeadsWhereInput {
    const where: Prisma.LeadsWhereInput = {
      attendant_id: attendantId,
    };

    if (filters?.startDate || filters?.endDate) {
      where.created_at = {};
      if (filters.startDate) where.created_at.gte = filters.startDate;
      if (filters.endDate) where.created_at.lte = filters.endDate;
    }

    return where;
  }

  // 1. Contagem de Leads Ativos
  public async countActiveLeads(attendantId: string, filters?: AttendantDashboardFilterDTO): Promise<number> {
    const where = this.getBaseWhere(attendantId, filters);
    return prisma.leads.count({
      where: {
        ...where,
        status: { in: ['ATIVO', 'EM_ANDAMENTO', 'NOVO'] },
      },
    });
  }

  // 2. Contagem de Leads Convertidos
  public async countConvertedLeads(attendantId: string, filters?: AttendantDashboardFilterDTO): Promise<number> {
    const where = this.getBaseWhere(attendantId, filters);
    return prisma.leads.count({
      where: {
        ...where,
        status: 'CONVERTIDO',
      },
    });
  }

  // 3. Dados para Taxa de Conversão
  public async getConversionData(attendantId: string, filters?: AttendantDashboardFilterDTO) {
    const where = this.getBaseWhere(attendantId, filters);
    const [totalLeads, convertedLeads] = await Promise.all([
      prisma.leads.count({ where }),
      prisma.leads.count({ where: { ...where, status: 'CONVERTIDO' } }),
    ]);

    return { totalLeads, convertedLeads };
  }

  // 4. Tempo Médio de Atendimento (em horas)
  public async getAvgServiceTime(attendantId: string, filters?: AttendantDashboardFilterDTO): Promise<number> {
    const where = this.getBaseWhere(attendantId, filters);
    
    const leads = await prisma.leads.findMany({
      where: { ...where, status: 'CONVERTIDO' },
      select: { created_at: true, updated_at: true },
    });

    if (leads.length === 0) return 0;

    const totalDiffInMs = leads.reduce((acc, lead) => {
      const diff = lead.updated_at.getTime() - lead.created_at.getTime();
      return acc + diff;
    }, 0);

    const avgInMs = totalDiffInMs / leads.length;
    return avgInMs / (1000 * 60 * 60);
  }

  // 5. Evolução de Leads (Agrupado por Data)
  public async getLeadsEvolution(attendantId: string, filters?: AttendantDashboardFilterDTO) {
    const where = this.getBaseWhere(attendantId, filters);
    
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

  // 6. Funil de Vendas (Agrupado por Status)
  public async getSalesFunnel(attendantId: string, filters?: AttendantDashboardFilterDTO) {
    const where = this.getBaseWhere(attendantId, filters);
    
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

  // 7. Leads por Origem
  public async getLeadsBySource(attendantId: string, filters?: AttendantDashboardFilterDTO) {
    const where = this.getBaseWhere(attendantId, filters);
    
    const grouped = await prisma.leads.groupBy({
      by: ['source'],
      _count: { id: true },
      where,
    });

    return grouped.map((item) => ({
      source: item.source || 'Desconhecido',
      count: item._count.id,
    }));
  }

  // 8. Conversões por Período
  public async getConversionsByPeriod(attendantId: string, filters?: AttendantDashboardFilterDTO) {
    const where = this.getBaseWhere(attendantId, filters);
    
    const convertedLeads = await prisma.leads.findMany({
      where: { ...where, status: 'CONVERTIDO' },
      select: { updated_at: true },
      orderBy: { updated_at: 'asc' },
    });

    const grouped = convertedLeads.reduce((acc, lead) => {
      const dateStr = lead.updated_at.toISOString().split('T')[0] as string;
      acc[dateStr] = (acc[dateStr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }
}