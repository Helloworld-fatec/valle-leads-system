// server/src/modules/auth/login/login.repository.ts
import { UsersRepository } from "../../users/users.repository.js";

// ─────────────────────────────────────────────
// LOGIN REPOSITORY
// ─────────────────────────────────────────────
// Responsabilidade: acesso ao banco para o fluxo de autenticação.
//
// Optamos por DELEGAR ao UsersRepository em vez de duplicar a query
// `findUnique({ email })` — isso mantém o ponto único de verdade
// sobre como ler usuários (DRY / SRP).
//
// O repository continua existindo como camada própria porque, conforme
// o sistema evoluir, ele provavelmente vai ganhar responsabilidades
// próprias (ex.: tabela `refresh_tokens` para revogação, tabela de
// `login_attempts` para rate-limit, blacklist de JWT, etc.).
// Hoje ele é fino, mas dá lugar de extensão sem mudar o service.
// ─────────────────────────────────────────────

export class LoginRepository {
  private usersRepository = new UsersRepository();

  /**
   * Busca o usuário pelo e-mail trazendo o password_hash junto.
   * Uso restrito ao service de login (verificação de senha) e
   * ao fluxo de refresh (re-leitura do estado do usuário).
   */
  async findUserForAuth(email: string) {
    return this.usersRepository.findByEmailWithPassword(email);
  }

  /**
   * Re-busca o usuário pelo id (utilizado pelo refresh para verificar
   * se o usuário continua ativo e ler seus dados mais recentes).
   */
  async findUserById(id: string) {
    return this.usersRepository.findByIdWithPassword(id);
  }

  /**
   * Retorna os ids dos times ativos do usuário — embarcados no payload
   * do JWT (access e refresh) conforme requisito do desafio.
   */
  async findActiveTeamIds(userId: string): Promise<string[]> {
    return this.usersRepository.findActiveTeamIds(userId);
  }
}
