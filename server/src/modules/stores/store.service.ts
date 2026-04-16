// server/src/modules/stores/store.service.ts
import { StoresRepository } from "./stores.repository.js";
import { TeamsRepository } from "../teams/teams.repository.js";
import { AppError } from "../../middlewares/errors/domainErrors.middleware.js";

export class StoresService {
  private repo = new StoresRepository();
  private teamsRepo = new TeamsRepository();

  // 📋 LISTAR TODOS
  async findAll() {
    return this.repo.findAll();
  }

  // 🔍 BUSCAR POR ID
  async findById(id: string) {
    return this.repo.findById(id);
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
    } else if (!store.is_active) {    
      throw new AppError("Store já está inativa", 400);
    } 

    return this.repo.softDelete(id);
  }
}