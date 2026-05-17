// src/services/profileService.ts
import { useCallback } from "react";
import { useApi } from "./api";

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

// Compatível com AuthContext.tsx: "ATTENDANT" | "MANAGER" | "GENERAL_MANAGER" | "ADMIN"
export type UserRole = "ATTENDANT" | "MANAGER" | "GENERAL_MANAGER" | "ADMIN";

export interface TeamInfo {
  id: string;
  name: string;
  is_active: boolean;
}

export interface UserTeamInfo {
  id: string;
  user_id: string;
  team_id: string;
  team: TeamInfo;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  // Telefones
  phone_1_ddd?: string | null;
  phone_1_number?: string | null;
  phone_2_ddd?: string | null;
  phone_2_number?: string | null;
  // Endereço
  address_street?: string | null;
  address_number?: string | null;
  address_complement?: string | null;
  address_neighborhood?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip?: string | null;
  // Vínculos com times (retornado pelo backend via include)
  user_teams?: UserTeamInfo[];
}

export interface UpdateProfileDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  // Telefones
  phone_1_ddd?: string | null;
  phone_1_number?: string | null;
  phone_2_ddd?: string | null;
  phone_2_number?: string | null;
  // Endereço
  address_street?: string | null;
  address_number?: string | null;
  address_complement?: string | null;
  address_neighborhood?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip?: string | null;
}

// ─────────────────────────────────────────────
// Hook do serviço
// ─────────────────────────────────────────────

export const useProfileService = () => {
  const { apiFetch } = useApi();

  /**
   * Busca o perfil do usuário pelo ID, incluindo os dados do time (user_teams).
   * O endpoint GET /api/users/:id já retorna user_teams via include no repositório.
   *
   * Exemplo de uso:
   *   const profile = await getProfileWithTeam(userId);
   */
  const getProfileWithTeam = useCallback(
    async (userId: string): Promise<UserProfile> => {
      const response = await apiFetch(`/api/users/${userId}`, {
        method: "GET",
      });

      return response.json() as Promise<UserProfile>;
    },
    [apiFetch]
  );

  /**
   * Atualiza os dados do perfil do usuário autenticado.
   * Apenas os campos informados serão enviados (PATCH semântico via PUT).
   *
   * Exemplo de uso:
   *   await updateProfile(userId, { phone_1_ddd: "11", address_city: "SP" });
   */
  const updateProfile = useCallback(
    async (userId: string, data: UpdateProfileDTO): Promise<UserProfile> => {
      const response = await apiFetch(`/api/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });

      return response.json() as Promise<UserProfile>;
    },
    [apiFetch]
  );

  /**
   * Atualiza apenas a senha do usuário autenticado.
   *
   * Exemplo de uso:
   *   await updatePassword(userId, "novaSenha123");
   */
  const updatePassword = useCallback(
    async (userId: string, password: string): Promise<UserProfile> => {
      const response = await apiFetch(`/api/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({ password }),
      });

      return response.json() as Promise<UserProfile>;
    },
    [apiFetch]
  );

  return {
    getProfileWithTeam,
    updateProfile,
    updatePassword,
  };
};