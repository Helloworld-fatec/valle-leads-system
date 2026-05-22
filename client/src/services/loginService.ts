// src/services/login.service.ts
import type { AuthUser } from "../contexts/AuthContext";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
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
 * O refresh token retorna em cookie httpOnly setado pelo servidor.
 * Aqui capturamos o access_token e os dados do usuário para persistir no contexto.
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
      // ignora
    }
    throw new Error(message);
  }

  const data: LoginResponse = await response.json();

  // refresh_token vem no body — salvo no localStorage para renovação automática.
  const refreshToken = (data as any).refresh_token ?? "";

 const user: AuthUser = {
  id: data.user.id,
  name: data.user.name,
  email: data.user.email,
  role: data.user.role as AuthUser["role"],
  team_ids: data.user.team_ids, // array completo — usuário pode pertencer a vários times
};

  return {
    user,
    accessToken: data.access_token,
    refreshToken,
  };
}

export async function logoutRequest(): Promise<void> {
  const accessToken = localStorage.getItem("accessToken");
  await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  }).catch(() => {
    // falha silenciosa — o estado local já será limpo
  });
}