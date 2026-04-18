// src/service/useApi.ts
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

// ─────────────────────────────────────────────
// Hook principal
// ─────────────────────────────────────────────

export const useApi = () => {
  const { accessToken, user, login, logout } = useAuth();
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  // Monta e executa a requisição HTTP com o token informado
  const makeRequest = async (
    url: string,
    options: RequestInit = {},
    token: string | null
  ): Promise<Response> => {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Não define Content-Type para FormData (o browser define automaticamente com boundary)
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(`${BASE_URL}${url}`, { ...options, headers });
  };

  /**
   * Fetch personalizado com:
   * - Injeção automática do Bearer token
   * - Renovação automática via refresh token em caso de 401
   * - Erros HTTP convertidos em `ApiError` com status, campo e tipo
   *
   * Exemplo de uso num service:
   *   const { apiFetch } = useApi();
   *   const res = await apiFetch("/leads", { method: "GET" });
   *   const data = await res.json();
   */
  const apiFetch = useCallback(
    async (url: string, options: RequestInit = {}): Promise<Response> => {
      const currentRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      let response = await makeRequest(url, options, accessToken);

      // ── 401: tenta renovar o access token ──────────────────────────
      if (response.status === 401 && currentRefreshToken) {
        console.warn("🔁 Access Token expirado. Tentando renovar...");
        try {
          const refreshResponse = await fetch(`${BASE_URL}/api/login/refresh-token`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${currentRefreshToken}`,
            },
            body: JSON.stringify({}),
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            const newAccessToken: string = data.newAccessToken;
            const newRefreshToken: string = data.newRefreshToken ?? currentRefreshToken;

            // Atualiza contexto e repete a requisição original com o novo token
            login(user!, newAccessToken, newRefreshToken);
            response = await makeRequest(url, options, newAccessToken);
          } else {
            console.error("❌ Refresh Token inválido ou expirado. Forçando logout.");
            logout();
            navigate("/login");
            throw new ApiError({
              message: "Sessão expirada. Faça login novamente.",
              status: 401,
              type: "auth",
            });
          }
        } catch (error) {
          // Se já é ApiError (lançado acima), apenas repassa
          if (error instanceof ApiError) throw error;

          console.error("💥 Erro inesperado durante renovação do token:", error);
          logout();
          navigate("/login");
          throw new ApiError({
            message: "Sessão expirada. Faça login novamente.",
            status: 401,
            type: "auth",
          });
        }
      } else if (response.status === 401 && !currentRefreshToken) {
        console.error("❌ Sem token de sessão. Redirecionando para login.");
        logout();
        navigate("/login");
        throw new ApiError({
          message: "Acesso não autorizado. Faça login.",
          status: 401,
          type: "auth",
        });
      }

      // ── Qualquer outro erro HTTP ────────────────────────────────────
      if (!response.ok) {
        let errorBody: { message?: string; field?: string } = {};
        try {
          errorBody = await response.json();
        } catch {
          // Body não é JSON (ex: 502 Bad Gateway em HTML) — ignora
        }

        const status = response.status;
        const type = resolveErrorType(status);
        const message =
          status >= 500
            ? "Ocorreu um erro interno. Tente novamente em instantes."
            : errorBody.message ?? `Erro ${status} na requisição.`;
        const field = errorBody.field ?? null;

        throw new ApiError({ message, status, field, type });
      }

      return response;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accessToken, user, login, logout, navigate, BASE_URL]
  );

  return { apiFetch };
};
