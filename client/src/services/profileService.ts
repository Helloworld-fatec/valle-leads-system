// src/services/profileService.ts
import { useCallback } from "react";
import { useApi } from "./api";

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

export type UserRole = "ADMIN" | "MANAGER" | "ATTENDANT";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team_id?: number | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface UpdateProfileDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  team_id?: number;
}

// ─────────────────────────────────────────────
// Hook do serviço
// ─────────────────────────────────────────────

export const useProfileService = () => {
  const { apiFetch } = useApi();

  /**
   * Busca o perfil do usuário autenticado pelo ID.
   *
   * Exemplo de uso:
   *   const profile = await getProfile(userId);
   */
  const getProfile = useCallback(
    async (userId: string): Promise<UserProfile> => {
      const response = await apiFetch(`/api/users/${userId}`, {
        method: "GET",
      });

      return response.json() as Promise<UserProfile>;
    },
    [apiFetch]
  );

  /**
   * Lista todos os usuários (útil para ADMIN/MANAGER).
   *
   * Exemplo de uso:
   *   const users = await getAllUsers();
   */
  const getAllUsers = useCallback(async (): Promise<UserProfile[]> => {
    const response = await apiFetch("/api/users", {
      method: "GET",
    });

    return response.json() as Promise<UserProfile[]>;
  }, [apiFetch]);

  /**
   * Atualiza os dados do perfil do usuário autenticado.
   * Apenas os campos informados serão enviados (PATCH semântico via PUT).
   *
   * Exemplo de uso:
   *   await updateProfile(userId, { name: "Novo Nome" });
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
   * Realiza o soft delete do usuário pelo ID.
   * O registro não é removido do banco — apenas marcado como deletado.
   *
   * Exemplo de uso:
   *   await deleteProfile(userId);
   */
  const deleteProfile = useCallback(
    async (userId: string): Promise<void> => {
      await apiFetch(`/api/users/${userId}`, {
        method: "DELETE",
      });
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
    getProfile,
    getAllUsers,
    updateProfile,
    deleteProfile,
    updatePassword,
  };
};