// server/src/modules/teams/teams.repository.ts
import { prisma } from "../../config/prisma.js";

export class TeamsRepository {

  // 🔍 LISTAR (com filtro is_active)
  async findAll(isActive?: boolean) {
    return prisma.teams.findMany({
      where: isActive !== undefined ? { is_active: isActive } : {},
    });
  }

  // 🔍 BUSCAR POR ID (com users e stores + leads)
  async findById(id: string) {
    return prisma.teams.findUnique({
      where: { id },
      include: {
        user_teams: true,
        stores: {
          include: {
            leads: true
          }
        }
      }
    });
  }

  // ➕ CRIAR
  async create(data: any) {
    return prisma.teams.create({
      data
    });
  }

  // ✏️ ATUALIZAR
  async update(id: string, data: any) {
    return prisma.teams.update({
      where: { id },
      data
    });
  }

  // ❌ SOFT DELETE
  async softDelete(id: string) {
    return prisma.teams.update({
      where: { id },
      data: {
        is_active: false
      }
    });
  }
}