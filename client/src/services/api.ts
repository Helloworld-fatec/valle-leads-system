// src/services/api.ts
import { useCallback, useRef } from "react";
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

// ─────────────────────────────────────────────
// Hook principal
// ─────────────────────────────────────────────

export const useApi = () => {
  const { accessToken, user, login, logout } = useAuth();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  /**
   * Ref que guarda a Promise de refresh em andamento.
   * Garante que requisições paralelas que recebem 401 ao mesmo tempo
   * aguardem o mesmo refresh, sem disparar múltiplas chamadas ao backend.
   */
  const refreshPromiseRef = useRef<Promise<string> | null>(null);

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
  /**
   * Chama POST /api/auth/refresh com o refresh token do localStorage.
   * - Persiste o novo par de tokens no localStorage e no contexto.
   * - Retorna o novo access token para a requisição original ser repetida.
   * - Múltiplas chamadas simultâneas compartilham a mesma Promise (via ref),
   *   evitando race condition de refresh duplicado.
   */
  const refreshAccessToken = useCallback((): Promise<string> => {
    // Se já há um refresh em andamento, reutiliza a mesma Promise
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
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
      // O backend rotaciona o refresh token — sempre use o novo.
      // Se por algum motivo não vier (não deveria acontecer), mantém o atual.
      const newRefreshToken: string = data.refresh_token ?? storedRefreshToken;

      // Persiste os novos tokens
      localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

      // Atualiza o contexto React com os dados frescos do usuário vindos do backend
      const freshUser = data.user ?? user;
      if (!freshUser) {
        throw new ApiError({
          message: "Não foi possível recuperar os dados do usuário.",
          status: 401,
          type: "auth",
        });
      }
      login(freshUser, newAccessToken, newRefreshToken);

      return newAccessToken;
    };

    refreshPromiseRef.current = doRefresh().finally(() => {
      // Limpa a ref ao terminar (com sucesso ou erro) para que o próximo
      // 401 real (depois que o novo token também expirar) dispare um novo refresh
      refreshPromiseRef.current = null;
    });

    return refreshPromiseRef.current;
  }, [BASE_URL, user, login]);

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
   * - Deduplicação de refreshes paralelos (sem race condition)
   * - Erros HTTP convertidos em `ApiError` tipado
   */
  const apiFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      // Lê o accessToken do contexto (atualizado pelo AuthProvider)
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
        } catch (error) {
          // Refresh falhou (token inválido, expirado, rede, etc.)
          forceLogout("Sessão expirada. Faça login novamente.");
          // forceLogout sempre lança — linha abaixo só satisfaz o TS
          throw error;
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