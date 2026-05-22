// src/modules/dashboards/general-manager/dashboardGeneralManager.service.ts

import { DashboardGeneralManagerRepository } from './dashboardGeneralManager.repository.js';
import { GeneralManagerDashboardFilterDTO } from './dashboardGeneralManager.dto.js';
import { prisma } from '../../../config/prisma.js';
import { AcessoNaoAutorizadoError } from '../../../middlewares/errors/domainErrors.middleware.js';

export class DashboardGeneralManagerService {
  private repository: DashboardGeneralManagerRepository;

  constructor() {
    this.repository = DashboardGeneralManagerRepository.getInstance();
  }

  /**
   * VALIDAÇÃO DE SEGURANÇA:
   * Apenas utilizadores com cargo de ADMIN ou GENERAL_MANAGER podem aceder à visão global.
   */
  private validateAccess(requester: any): void {
    const rolesAutorizados = ['ADMIN', 'GENERAL_MANAGER'];
    
    if (!requester || !rolesAutorizados.includes(requester.role)) {
      throw new AcessoNaoAutorizadoError('Acesso restrito a administradores e gerentes gerais.');
    }
  }

  /**
   * Helper para buscar o nome das equipas a partir dos IDs.
   */
  private async getTeamsNames(teamIds: string[]) {
    const validIds = teamIds.filter((id) => id !== null);
    if (validIds.length === 0) return {};

    const teams = await prisma.teams.findMany({
      where: { id: { in: validIds } },
      select: { id: true, name: true }
    });

    return teams.reduce((acc, team) => {
      acc[team.id] = team.name;
      return acc;
    }, {} as Record<string, string>);
  }

  // 1. KPIs Globais
  public async getGlobalKpis(requester: any, filters?: GeneralManagerDashboardFilterDTO) {
    this.validateAccess(requester);
    const { totalLeads, convertedLeads } = await this.repository.getGlobalConversionData(filters);
    
    const rate = totalLeads === 0 ? 0 : (convertedLeads / totalLeads) * 100;

    return {
      totalLeads,
      totalSales: convertedLeads,
      globalConversionRate: Number(rate.toFixed(2))
    };
  }

  // 2. Melhor Equipa
  public async getTopTeam(requester: any, filters?: GeneralManagerDashboardFilterDTO) {
    this.validateAccess(requester);
    const conversions = await this.repository.getConversionsByTeam(filters);
    
    if (conversions.length === 0 || !conversions[0]?.team_id) {
      return { topTeam: null };
    }

    const topTeamId = conversions[0].team_id;
    const teamsMap = await this.getTeamsNames([topTeamId]);

    return {
      topTeam: {
        id: topTeamId,
        name: teamsMap[topTeamId] || 'Equipa Desconhecida',
        conversions: conversions[0]._count.id
      }
    };
  }

  // 3. Distribuição de Leads por Equipa
  public async getLeadsByTeam(requester: any, filters?: GeneralManagerDashboardFilterDTO) {
    this.validateAccess(requester);
    const data = await this.repository.getLeadsByTeam(filters);
    
    const teamIds = data.map(d => d.team_id).filter(Boolean) as string[];
    const namesMap = await this.getTeamsNames(teamIds);

    const formattedData = data.map(item => ({
      teamId: item.team_id,
      teamName: item.team_id ? (namesMap[item.team_id] || 'Desconhecida') : 'Sem Equipe',
      count: item._count.id
    }));

    return { leadsByTeam: formattedData };
  }

  // 4. Ranking de Equipes
  public async getTeamRanking(requester: any, filters?: GeneralManagerDashboardFilterDTO) {
    this.validateAccess(requester);
    const data = await this.repository.getConversionsByTeam(filters);
    
    const teamIds = data.map(d => d.team_id).filter(Boolean) as string[];
    const namesMap = await this.getTeamsNames(teamIds);

    const formattedData = data.map(item => ({
      teamId: item.team_id,
      teamName: item.team_id ? (namesMap[item.team_id] || 'Desconhecida') : 'Sem Equipe',
      conversions: item._count.id
    }));

    return { teamRanking: formattedData };
  }

  // 5. Evolução Global
  public async getGlobalEvolution(requester: any, filters?: GeneralManagerDashboardFilterDTO) {
    this.validateAccess(requester);
    const data = await this.repository.getGlobalEvolution(filters);
    return { evolution: data };
  }

  // 6. Funil Global
  public async getGlobalFunnel(requester: any, filters?: GeneralManagerDashboardFilterDTO) {
    this.validateAccess(requester);
    const data = await this.repository.getGlobalFunnel(filters);
    return { funnel: data };
  }
}