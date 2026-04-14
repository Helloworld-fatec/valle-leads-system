import { prisma } from "../../../config/prisma.js";

export class StoresRepository {

  // 🔍 LISTAR POR TEAM
  async findByTeamId(teamId: string) {
    return prisma.store.findMany({
      where: {
        team_id: teamId,
        is_active: true
      }
    });
  }

  // 🔍 BUSCAR POR ID (com leads)
  async findById(id: string) {
    return prisma.store.findUnique({
      where: { id },
      include: {
        leads: true // 🔥 necessário pro service
      }
    });
  }

  // ➕ CRIAR
  async create(data: any) {
    return prisma.store.create({
      data
    });
  }

  // ✏️ ATUALIZAR
  async update(id: string, data: any) {
    return prisma.store.update({
      where: { id },
      data
    });
  }

  // ❌ SOFT DELETE
  async softDelete(id: string) {
    return prisma.store.update({
      where: { id },
      data: {
        is_active: false
      }
    });
  }
}