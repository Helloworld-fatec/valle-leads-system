// src/services/login.service.ts
import type { AuthUser } from "../contexts/AuthContext";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  // ✅ refresh_token declarado corretamente — backend envia no body (não em cookie)
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

/**
 * Faz a requisição de login no backend.
 * Tanto o access token quanto o refresh token retornam no body JSON
 * e são persistidos no localStorage pelo AuthContext (via login()).
 */
export async function loginRequest(payload: LoginPayload): Promise<{
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}> {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let message = "Credenciais inválidas.";
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // ignora body não-JSON
    }
    throw new Error(message);
  }

  const data: LoginResponse = await response.json();

  const user: AuthUser = {
    id: data.user.id,
    name: data.user.name,
    email: data.user.email,
    role: data.user.role as AuthUser["role"],
    team_ids: data.user.team_ids,
  };

  return {
    user,
    accessToken: data.access_token,
    // ✅ sem cast as any — o tipo já declara refresh_token
    refreshToken: data.refresh_token,
  };
}

export async function logoutRequest(): Promise<void> {
  const accessToken = localStorage.getItem("accessToken");
  await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  }).catch(() => {
    // falha silenciosa — o estado local já será limpo pelo AuthContext
  });
}