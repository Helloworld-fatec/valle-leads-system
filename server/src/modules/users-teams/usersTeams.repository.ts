import { prisma } from "../../config/prisma.js";
import type { CreateUserTeamDTO, UpdateUserTeamDTO } from "./usersTeams.dto.js";

export class UsersTeamsRepository {
  
  // 🔍 Buscar todos os vínculos (trazendo informações resumidas do user e do team)
  async findAll() {
    return prisma.userTeams.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        team: {
          select: { id: true, name: true, is_active: true },
        },
      },
    });
  }

  // 🔍 Buscar vínculo específico por ID
  async findById(id: string) {
    return prisma.userTeams.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        team: {
          select: { id: true, name: true, is_active: true },
        },
      },
    });
  }

  // 🔍 Buscar vínculo por Usuário e Time (Útil para evitar duplicidade no Service)
  async findByUserAndTeam(user_id: string, team_id: string) {
    return prisma.userTeams.findUnique({
      where: {
        user_id_team_id: {
          user_id,
          team_id,
        },
      },
    });
  }

  // ➕ Criar novo vínculo entre usuário e time
  async create(data: CreateUserTeamDTO) {
    return prisma.userTeams.create({
      data,
    });
  }

 // ✏️ Atualizar um vínculo existente
  async update(id: string, data: UpdateUserTeamDTO) {
    // 1. Remove qualquer propriedade que seja 'undefined'
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    // 2. Passa o objeto limpo para o Prisma
    return prisma.userTeams.update({
      where: { id },
      data: cleanData, 
    });
  }

  // ❌ Deletar vínculo (Hard delete, pois a tabela pivô não possui is_active)
  async delete(id: string) {
    return prisma.userTeams.delete({
      where: { id },
    });
  }
}