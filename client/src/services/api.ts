// src/services/api.ts
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hook/useAuth";

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

export interface ApiErrorOptions {
  message: string;
  status: number;
  field?: string | null;
  type?: "auth" | "validation" | "not_found" | "conflict" | "server" | "unknown";
}

// ─────────────────────────────────────────────
// Classe de erro customizada
// ─────────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  field: string | null;
  type: ApiErrorOptions["type"];

  constructor({ message, status, field = null, type = "unknown" }: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.field = field;
    this.type = type;
  }
}

function resolveErrorType(status: number): ApiErrorOptions["type"] {
  if (status === 401 || status === 403) return "auth";
  if (status === 404) return "not_found";
  if (status === 409) return "conflict";
  if (status === 422) return "validation";
  if (status >= 500) return "server";
  return "unknown";
}

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────

const REFRESH_TOKEN_KEY = "refreshToken";
const ACCESS_TOKEN_KEY = "accessToken";
const USER_KEY = "authUser";

// ─────────────────────────────────────────────
// Singleton de refresh (escopo de módulo)
// ─────────────────────────────────────────────
//
// ✅ CORREÇÃO: era um useRef dentro do hook, o que significa que cada
// instância de useApi() tinha seu próprio ref isolado. Com isso, dois
// componentes que recebem 401 ao mesmo tempo disparariam dois refreshes
// simultâneos — race condition real.
//
// Movido para o módulo garante que há exatamente UMA Promise de refresh
// em andamento em toda a aplicação, independente de quantos componentes
// estejam usando useApi() ao mesmo tempo.
//
let refreshPromise: Promise<string> | null = null;

// ─────────────────────────────────────────────
// Hook principal
// ─────────────────────────────────────────────

export const useApi = () => {
  const { accessToken, login, logout } = useAuth();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // ─── Montagem da requisição HTTP ─────────────────────────────────
  const makeRequest = useCallback(
    (url: string, options: RequestInit, token: string | null): Promise<Response> => {
      const headers: Record<string, string> = {
        ...(options.headers as Record<string, string>),
      };

      if (!(options.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
      }

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      return fetch(`${BASE_URL}${url}`, { ...options, headers });
    },
    [BASE_URL]
  );

  // ─── Renovação do access token via refresh token ──────────────────
  //
  // ✅ CORREÇÃO: `user` removido das dependências do useCallback.
  //    O refresh não precisa do user do contexto React — ele lê o
  //    refreshToken direto do localStorage e usa os dados frescos que
  //    o próprio backend devolve na resposta. Ter `user` como dep causava
  //    recriação da função logo após o refresh (quando o contexto atualizava),
  //    o que poderia invalidar a deduplicação em fluxos de retry encadeados.
  //
  const refreshAccessToken = useCallback((): Promise<string> => {
    // Reutiliza a Promise em andamento, se houver — deduplicação global
    if (refreshPromise) {
      return refreshPromise;
    }

    const doRefresh = async (): Promise<string> => {
      const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!storedRefreshToken) {
        throw new ApiError({
          message: "Sessão encerrada. Faça login novamente.",
          status: 401,
          type: "auth",
        });
      }

      const refreshResponse = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: storedRefreshToken }),
      });

      if (!refreshResponse.ok) {
        throw new ApiError({
          message: "Sessão expirada. Faça login novamente.",
          status: 401,
          type: "auth",
        });
      }

      const data = await refreshResponse.json();

      const newAccessToken: string = data.access_token;
      // Backend rotaciona o refresh — sempre persiste o novo.
      // Fallback para o atual caso o backend omita (não deveria ocorrer).
      const newRefreshToken: string = data.refresh_token ?? storedRefreshToken;

      // ✅ Persiste os novos tokens no localStorage
      localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

      // ✅ Usa os dados frescos do usuário vindos do backend.
      //    Se o backend não devolver `user`, lê do localStorage como fallback
      //    (o usuário não mudou — só o token expirou).
      const freshUser = data.user ?? JSON.parse(localStorage.getItem(USER_KEY) ?? "null");

      if (!freshUser) {
        throw new ApiError({
          message: "Não foi possível recuperar os dados do usuário.",
          status: 401,
          type: "auth",
        });
      }

      // Atualiza o contexto React com os dados frescos
      login(freshUser, newAccessToken, newRefreshToken);

      return newAccessToken;
    };

    refreshPromise = doRefresh().finally(() => {
      // Limpa o singleton ao terminar (sucesso ou erro) para que o próximo
      // 401 real dispare um novo refresh em vez de reutilizar uma Promise rejeitada
      refreshPromise = null;
    });

    return refreshPromise;
  }, [BASE_URL, login]);
  // ✅ `user` não é dependência — ver comentário acima

  // ─── Força logout e redireciona ──────────────────────────────────
  const forceLogout = useCallback(
    (message: string) => {
      logout();
      navigate("/login");
      throw new ApiError({ message, status: 401, type: "auth" });
    },
    [logout, navigate]
  );

  // ─────────────────────────────────────────────────────────────────
  /**
   * Fetch personalizado com:
   * - Injeção automática do Bearer token (do contexto de autenticação)
   * - Renovação automática via refresh token em caso de 401
   * - Retry automático da requisição original após refresh bem-sucedido
   * - Deduplicação global de refreshes paralelos (sem race condition)
   * - Erros HTTP convertidos em `ApiError` tipado
   */
  const apiFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      let response = await makeRequest(url, options, accessToken);

      // ── 401: tenta renovar e repetir ────────────────────────────
      if (response.status === 401) {
        const storedRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

        if (!storedRefreshToken) {
          forceLogout("Acesso não autorizado. Faça login.");
        }

        console.warn("🔁 Access token expirado. Renovando...");

        let newAccessToken: string;
        try {
          newAccessToken = await refreshAccessToken();
        } catch {
          // Refresh falhou (token inválido, expirado, rede, etc.)
          forceLogout("Sessão expirada. Faça login novamente.");
          // forceLogout sempre lança — linha abaixo só satisfaz o TS
          throw new ApiError({ message: "Sessão expirada.", status: 401, type: "auth" });
        }

        // Repete a requisição original com o token renovado
        response = await makeRequest(url, options, newAccessToken);
      }

      // ── Qualquer outro erro HTTP ─────────────────────────────────
      if (!response.ok) {
        let errorBody: { message?: string; field?: string } = {};
        try {
          errorBody = await response.json();
        } catch {
          // Body não é JSON — ignora
        }

        const status = response.status;
        const type = resolveErrorType(status);
        const message =
          status >= 500
            ? "Ocorreu um erro interno. Tente novamente em instantes."
            : (errorBody.message ?? `Erro ${status} na requisição.`);
        const field = errorBody.field ?? null;

        throw new ApiError({ message, status, field, type });
      }

      return response;
    },
    [accessToken, makeRequest, refreshAccessToken, forceLogout]
  );

  return { apiFetch };
};

