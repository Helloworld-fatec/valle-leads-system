// server/src/modules/auth/login/login.service.ts
import bcrypt from "bcrypt";
import { LoginRepository } from "./login.repository.js";
import type { LoginDTO } from "./login.dto.js";
import {
  AcessoNaoAutorizadoError,
  RequisicaoInvalidaError,
} from "../../../middlewares/errors/domainErrors.middleware.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  TOKEN_CONFIG,
  type TokenPayload,
} from "../../../middlewares/auth/auth.middleware.js";

// ─────────────────────────────────────────────
// LOGIN SERVICE
// ─────────────────────────────────────────────
// Responsabilidade: regras de negócio do fluxo de autenticação.
//   - Verificar credenciais (bcrypt compare)
//   - Buscar dados atualizados do usuário (incluindo team_ids)
//   - Solicitar emissão dos tokens ao auth.middleware
//   - Validar refresh e renovar o par de tokens
//   - Encerrar a sessão (logout)
//
// IMPORTANTE: este service NÃO contém mais nenhuma lógica de JWT.
// Toda a parte de assinar/verificar token vive no auth.middleware.ts,
// que é o "dono" do ciclo de vida do JWT no sistema. Aqui só consumimos
// essas funções — single source of truth.
//
// Decisões herdadas (do auth.middleware):
//   - Dois segredos distintos (ACCESS e REFRESH)
//   - Payload do JWT: { id, email, role, team_ids } + claim `type`
//   - team_ids vai em AMBOS os tokens (requisito do desafio)
//
// Logout sem persistência de revogação: como não temos tabela de
// refresh_tokens, o logout é "soft" — o controller limpa o cookie.
// Pra revogação forte seria preciso uma tabela `refresh_tokens`
// (extensão futura, anotada no LoginRepository).
// ─────────────────────────────────────────────

export interface LoginResult {
  access_token: string;
  refresh_token: string;
  access_token_expires_in: string;
  refresh_token_expires_in: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    team_ids: string[];
  };
}

export class LoginService {
  private loginRepository = new LoginRepository();

  // ─── LOGIN ───────────────────────────────────────────
  /**
   * Autentica o usuário por e-mail + senha e emite os tokens.
   * Mensagem de erro genérica (mesmo texto para "email não existe" e
   * "senha incorreta") — não vazamos qual dos dois é o problema (RNF02).
   */
  async login(data: LoginDTO): Promise<LoginResult> {
    const user = await this.loginRepository.findUserForAuth(data.email);

    if (!user || !user.is_active) {
      throw new AcessoNaoAutorizadoError("Credenciais inválidas.");
    }

    const matches = await bcrypt.compare(data.password, user.password_hash);
    if (!matches) {
      throw new AcessoNaoAutorizadoError("Credenciais inválidas.");
    }

    const team_ids = await this.loginRepository.findActiveTeamIds(user.id);

    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      team_ids,
    };

    const access_token = signAccessToken(payload);
    const refresh_token = signRefreshToken(payload);

    // TODO (RF07): registrar log de login após o módulo SystemLogs estar disponível.

    return {
      access_token,
      refresh_token,
      access_token_expires_in: TOKEN_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
      refresh_token_expires_in: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        team_ids,
      },
    };
  }

  // ─── REFRESH ─────────────────────────────────────────
  /**
   * Valida o refresh token e emite um novo par (rotação).
   * - Reconsulta o usuário para garantir que ainda está ativo e pegar
   *   role/times atualizados (se o admin trocou o role ou removeu o usuário
   *   de um time, o novo access já reflete isso).
   * - Rotaciona também o refresh — boa prática, dificulta replay.
   */
  async refresh(refreshToken: string): Promise<LoginResult> {
    if (!refreshToken) {
      throw new RequisicaoInvalidaError("Refresh token ausente.");
    }

    const decoded = verifyToken(refreshToken, "refresh");

    // Re-leitura do estado atual do usuário
    const user = await this.loginRepository.findUserById(decoded.id);
    if (!user || !user.is_active) {
      throw new AcessoNaoAutorizadoError("Usuário não encontrado ou inativo.");
    }

    const team_ids = await this.loginRepository.findActiveTeamIds(user.id);

    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      team_ids,
    };

    const access_token = signAccessToken(payload);
    const new_refresh_token = signRefreshToken(payload);

    return {
      access_token,
      refresh_token: new_refresh_token,
      access_token_expires_in: TOKEN_CONFIG.ACCESS_TOKEN_EXPIRES_IN,
      refresh_token_expires_in: TOKEN_CONFIG.REFRESH_TOKEN_EXPIRES_IN,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        team_ids,
      },
    };
  }

  // ─── LOGOUT ──────────────────────────────────────────
  /**
   * Logout "soft": como não há persistência de refresh tokens, o melhor que
   * podemos fazer no backend é instruir o controller a limpar o cookie.
   *
   * Para revogação forte, seria preciso:
   *   - Tabela `refresh_tokens` com (id, user_id, token_hash, revoked_at)
   *   - Inserir no login, marcar revoked_at no logout
   *   - Checar no refresh se o token está revogado
   * Fica como extensão futura.
   */
  async logout(_userId: string | null | undefined): Promise<void> {
    // TODO (RF07): registrar log de logout
    return;
  }
}
