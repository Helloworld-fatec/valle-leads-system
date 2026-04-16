// server/src/modules/users-teams/usersTeams.service.ts
import { UsersTeamsRepository } from "./usersTeams.repository.js";
import { AppError } from "../../middlewares/errors/domainErrors.middleware.js";
import type { CreateUserTeamDTO, UpdateUserTeamDTO } from "./usersTeams.dto.js";

// Importando repositórios auxiliares (caso queira garantir que User e Team existem)
import { UsersRepository } from "../users/users.repository.js";
import { TeamsRepository } from "../teams/teams.repository.js";

export class UsersTeamsService {
  private repo = new UsersTeamsRepository();
  private usersRepo = new UsersRepository();
  private teamsRepo = new TeamsRepository();

  // 🔍 Listar todos os vínculos
  async findAll() {
    return this.repo.findAll();
  }

  // 🔍 Buscar vínculo por ID
  async findById(id: string) {
    if (!id) {
      throw new AppError("ID não informado", 400);
    }

    const userTeam = await this.repo.findById(id);

    if (!userTeam) {
      throw new AppError("Vínculo não encontrado", 404);
    }

    return userTeam;
  }

  // ➕ Criar novo vínculo (Regras de Negócio)
  async create(data: CreateUserTeamDTO) {
    const { user_id, team_id } = data;

    // 1. Opcional, mas recomendado: Verificar se o User existe
    const user = await this.usersRepo.findById(user_id);
    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    // 2. Opcional, mas recomendado: Verificar se o Team existe
    const team = await this.teamsRepo.findById(team_id);
    if (!team) {
      throw new AppError("Time não encontrado", 404);
    }

    // 3. Regra Core: Garantir que o vínculo não exista (evitar erro do banco de dados)
    const existingLink = await this.repo.findByUserAndTeam(user_id, team_id);
    if (existingLink) {
      throw new AppError("O usuário já pertence a este time", 409); // 409 Conflict
    }

    return this.repo.create(data);
  }

  // ✏️ Atualizar vínculo (Cuidado: Geralmente em tabelas pivô apenas apagamos e recriamos)
  async update(id: string, data: UpdateUserTeamDTO) {
    if (!id) {
      throw new AppError("ID não informado", 400);
    }

    // 1. Verifica se o vínculo existe
    const userTeam = await this.repo.findById(id);
    if (!userTeam) {
      throw new AppError("Vínculo não encontrado", 404);
    }

    // 2. Se tentarmos mudar o user_id ou team_id, devemos garantir que a nova combinação não colida
    if (data.user_id || data.team_id) {
      const newUser = data.user_id || userTeam.user_id;
      const newTeam = data.team_id || userTeam.team_id;

      // Se mudou algo, checa colisão (mas ignora se for o próprio ID que estamos atualizando)
      if (newUser !== userTeam.user_id || newTeam !== userTeam.team_id) {
        const collision = await this.repo.findByUserAndTeam(newUser, newTeam);
        if (collision && collision.id !== id) {
          throw new AppError("A nova combinação de usuário e time já existe", 409);
        }
      }
    }

    return this.repo.update(id, data);
  }

  // ❌ Deletar vínculo (Hard delete)
  async delete(id: string) {
    if (!id) {
      throw new AppError("ID não informado", 400);
    }

    const userTeam = await this.repo.findById(id);

    if (!userTeam) {
      throw new AppError("Vínculo não encontrado", 404);
    }

    return this.repo.delete(id);
  }
}