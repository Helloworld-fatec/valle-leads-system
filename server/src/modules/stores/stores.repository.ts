// server/src/modules/stores/stores.repository.ts
import { prisma } from "../../config/prisma.js";

export class StoresRepository {

  // 📋 LISTAR TODOS
  async findAll() {
    return prisma.stores.findMany({
      where: { is_active: true }
    });
  }


  // 🔍 BUSCAR POR ID 
  async findById(id: string) {
    return prisma.stores.findUnique({
      where: { id }
    });
  }

  // ➕ CRIAR
  async create(data: any) {
    return prisma.stores.create({
      data
    });
  }

  // ✏️ ATUALIZAR
  async update(id: string, data: any) {
    return prisma.stores.update({
      where: { id },
      data
    });
  }

  // ❌ SOFT DELETE
  async softDelete(id: string) {
    return prisma.stores.update({
      where: { id },
      data: {
        is_active: false
      }
    });
  }
}