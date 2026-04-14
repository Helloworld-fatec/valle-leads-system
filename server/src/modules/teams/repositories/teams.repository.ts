import { prisma } from "../../../config/prisma.js";

export class TeamsRepository {

  // 🔍 LISTAR (com filtro is_active)
  async findAll(isActive?: boolean) {
    return prisma.team.findMany({
      where: isActive !== undefined ? { is_active: isActive } : {},
    });
  }

  // 🔍 BUSCAR POR ID (com users e stores + leads)
  async findById(id: string) {
    return prisma.team.findUnique({
      where: { id },
      include: {
        users: true,
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
    return prisma.team.create({
      data
    });
  }

  // ✏️ ATUALIZAR
  async update(id: string, data: any) {
    return prisma.team.update({
      where: { id },
      data
    });
  }

  // ❌ SOFT DELETE
  async softDelete(id: string) {
    return prisma.team.update({
      where: { id },
      data: {
        is_active: false
      }
    });
  }
}