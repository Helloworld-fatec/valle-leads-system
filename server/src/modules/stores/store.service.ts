import { StoresRepository } from "./repositories/stores.repository.js";
import { TeamsRepository } from "../../teams/repositories/teams.repository.js";
import { AppError } from "../../middlewares/error.middleware.js";

export class StoresService {
  private repo = new StoresRepository();
  private teamsRepo = new TeamsRepository();

  // 🔍 LISTAR POR TEAM
  async findByTeamId(teamId: string) {
    if (!teamId) {
      throw new AppError("Team ID não informado", 400);
    }

    return this.repo.findByTeamId(teamId);
  }

  // ➕ CRIAR STORE
  async create(data: any) {
    const { team_id } = data;

    if (!team_id) {
      throw new AppError("Team ID é obrigatório", 400);
    }

    const team = await this.teamsRepo.findById(team_id);

    if (!team) {
      throw new AppError("Team não encontrada", 404);
    }

    if (!team.is_active) {
      throw new AppError("Não é possível criar store em team inativa", 400);
    }

    return this.repo.create(data);
  }

  // ✏️ ATUALIZAR STORE
  async update(id: string, data: any) {
    if (!id) {
      throw new AppError("ID não informado", 400);
    }

    const store = await this.repo.findById(id);

    if (!store) {
      throw new AppError("Store não encontrada", 404);
    }

    return this.repo.update(id, data);
  }

  // ❌ DELETAR STORE (SOFT DELETE + REGRA)
  async delete(id: string) {
    if (!id) {
      throw new AppError("ID não informado", 400);
    }

    const store = await this.repo.findById(id);

    if (!store) {
      throw new AppError("Store não encontrada", 404);
    }

    // 🚨 REGRA: não deletar se tiver leads ativos
    if (store.leads && store.leads.length > 0) {
      throw new AppError(
        "Não é possível deletar store com leads ativos",
        400
      );
    }

    await this.repo.softDelete(id);
  }
}