import { TeamsRepository } from "../repositories/teams.repository.js";
import { AppError } from "../../../utils/appError.utils.js";

export class TeamsService {
  private repo = new TeamsRepository();

  // 🔍 LISTAR
  async findAll(isActive?: boolean) {
    return this.repo.findAll(isActive);
  }

  // 🔍 BUSCAR POR ID (com users e stores)
  async findById(id: string) {
    const team = await this.repo.findById(id);

    if (!team) {
      throw new AppError("Team não encontrada", 404);
    }

    return team;
  }

  // ➕ CRIAR
  async create(data: any) {
    return this.repo.create(data);
  }

  // ✏️ ATUALIZAR
  async update(id: string, data: any) {
    const team = await this.repo.findById(id);

    if (!team) {
      throw new AppError("Team não encontrada", 404);
    }

    return this.repo.update(id, data);
  }

  // ❌ DELETAR (soft delete + regra)
  async delete(id: string) {
    const team = await this.repo.findById(id);

    if (!team) {
      throw new AppError("Team não encontrada", 404);
    }

    // 🚨 REGRA: não deletar se tiver users ou leads ativos
    if (team.users?.length > 0) {
      throw new AppError("Team possui usuários vinculados", 400);
    }

    if (team.stores?.some((store: any) => store.leads?.length > 0)) {
      throw new AppError("Team possui leads ativos vinculados", 400);
    }

    await this.repo.softDelete(id);
  }
}