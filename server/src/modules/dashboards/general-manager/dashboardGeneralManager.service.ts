// src/modules/dashboards/general-manager/dashboardGeneralManager.service.ts

import { prisma } from '../../../config/prisma.js';
import type { AccessLevel } from '../../../middlewares/auth/permission.middleware.js';
import { AcessoNaoAutorizadoError } from '../../../middlewares/errors/domainErrors.middleware.js';
import {
  DashboardGeneralManagerRepository,
  groupDatesByDay,
} from './dashboardGeneralManager.repository.js';
import type {
  GeneralManagerDashboardFilterDTO,
  TeamLeadsRow,
  GlobalKpisResponse,
  TopTeamResponse,
  LeadsByTeamResponse,
  TeamRankingResponse,
  GlobalEvolutionResponse,
  GlobalFunnelResponse,
} from './dashboardGeneralManager.dto.js';

// ─────────────────────────────────────────────────────────────────────────────
// REQUESTER TYPE
// Mesmo contrato dos outros módulos de dashboard — representa o subconjunto
// de req.user necessário para a verificação de papel neste service.
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthenticatedRequester {
  id: string;
  role: AccessLevel;
  team_ids: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD GENERAL MANAGER SERVICE
// ─────────────────────────────────────────────────────────────────────────────

export class DashboardGeneralManagerService {
  private readonly repository: DashboardGeneralManagerRepository;

  constructor() {
    this.repository = DashboardGeneralManagerRepository.getInstance();
  }

  // ─── AUTORIZAÇÃO ─────────────────────────────────────────────────────────

  /**
   * Garante que apenas ADMIN e GENERAL_MANAGER acedem à visão global.
   *
   * Nota: o checkPermission('GENERAL_MANAGER') na rota já bloqueia papéis
   * inferiores com 403. Esta verificação é uma segunda camada de defesa —
   * garante que nenhuma refatoração futura que remova o middleware de rota
   * exponha dados globais a papéis não autorizados.
   */
  private assertCanAccess(requester: AuthenticatedRequester): void {
    if (requester.role !== 'ADMIN' && requester.role !== 'GENERAL_MANAGER') {
      throw new AcessoNaoAutorizadoError(
        'Acesso restrito a administradores e gerentes gerais.',
      );
    }
  }

  // ─── HELPERS PRIVADOS ────────────────────────────────────────────────────

  /**
   * Busca o nome das equipas a partir de uma lista de IDs válidos.
   * Retorna um mapa { id → name } para lookups O(1) nas formatações.
   */
  private async fetchTeamNames(
    teamIds: string[],
  ): Promise<Record<string, string>> {
    if (teamIds.length === 0) return {};

    const teams = await prisma.teams.findMany({
      where: { id: { in: teamIds } },
      select: { id: true, name: true },
    });

    return teams.reduce<Record<string, string>>((acc, team) => {
      acc[team.id] = team.name;
      return acc;
    }, {});
  }

  /**
   * Extrai IDs de equipa não-nulos de um array de linhas de groupBy.
   * team_id em Leads é NOT NULL no schema, mas o tipo do Prisma após o
   * mapeamento pode ser string | null dependendo da versão — o filter
   * garante segurança em qualquer cenário.
   */
  private extractTeamIds(rows: TeamLeadsRow[]): string[] {
    return rows.map((r) => r.team_id).filter((id): id is string => id !== null);
  }

  // ─── KPIs ────────────────────────────────────────────────────────────────

  /** 1. KPIs globais: total de leads, vendas e taxa de conversão. */
  public async getGlobalKpis(
    requester: AuthenticatedRequester,
    filters?: GeneralManagerDashboardFilterDTO,
  ): Promise<GlobalKpisResponse> {
    this.assertCanAccess(requester);

    const { totalLeads, convertedLeads } =
      await this.repository.getGlobalConversionData(filters);

    const rate = totalLeads === 0 ? 0 : (convertedLeads / totalLeads) * 100;

    return {
      totalLeads,
      totalSales: convertedLeads,
      globalConversionRate: Number(rate.toFixed(2)),
    };
  }

  /** 2. Equipa com mais conversões no período. */
  public async getTopTeam(
    requester: AuthenticatedRequester,
    filters?: GeneralManagerDashboardFilterDTO,
  ): Promise<TopTeamResponse> {
    this.assertCanAccess(requester);

    const conversions = await this.repository.getConversionsByTeam(filters);

    // Sem conversões no período → retorna null
    const topRow = conversions[0];
    if (!topRow?.team_id) {
      return { topTeam: null };
    }

    const namesMap = await this.fetchTeamNames([topRow.team_id]);

    return {
      topTeam: {
        id: topRow.team_id,
        name: namesMap[topRow.team_id] ?? 'Equipa Desconhecida',
        conversions: topRow._count.id,
      },
    };
  }

  // ─── CHARTS ──────────────────────────────────────────────────────────────

  /** 3. Distribuição do total de leads por equipa. */
  public async getLeadsByTeam(
    requester: AuthenticatedRequester,
    filters?: GeneralManagerDashboardFilterDTO,
  ): Promise<LeadsByTeamResponse> {
    this.assertCanAccess(requester);

    const rows = await this.repository.getLeadsByTeam(filters);
    const namesMap = await this.fetchTeamNames(this.extractTeamIds(rows));

    return {
      leadsByTeam: rows.map((item) => ({
        teamId: item.team_id,
        teamName: item.team_id
          ? (namesMap[item.team_id] ?? 'Desconhecida')
          : 'Sem Equipa',
        count: item._count.id,
      })),
    };
  }

  /** 4. Ranking de equipas por número de conversões (ordem descendente). */
  public async getTeamRanking(
    requester: AuthenticatedRequester,
    filters?: GeneralManagerDashboardFilterDTO,
  ): Promise<TeamRankingResponse> {
    this.assertCanAccess(requester);

    const rows = await this.repository.getConversionsByTeam(filters);
    const namesMap = await this.fetchTeamNames(this.extractTeamIds(rows));

    return {
      teamRanking: rows.map((item) => ({
        teamId: item.team_id,
        teamName: item.team_id
          ? (namesMap[item.team_id] ?? 'Desconhecida')
          : 'Sem Equipa',
        conversions: item._count.id,
      })),
    };
  }

  /** 5. Evolução do volume de leads global ao longo do período. */
  public async getGlobalEvolution(
    requester: AuthenticatedRequester,
    filters?: GeneralManagerDashboardFilterDTO,
  ): Promise<GlobalEvolutionResponse> {
    this.assertCanAccess(requester);

    const dates = await this.repository.getGlobalLeadsCreatedDates(filters);
    return { evolution: groupDatesByDay(dates) };
  }

  /** 6. Funil global — contagem de leads por status em todas as equipas. */
  public async getGlobalFunnel(
    requester: AuthenticatedRequester,
    filters?: GeneralManagerDashboardFilterDTO,
  ): Promise<GlobalFunnelResponse> {
    this.assertCanAccess(requester);

    const funnel = await this.repository.getGlobalFunnel(filters);
    return { funnel };
  }
}