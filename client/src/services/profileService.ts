// src/services/profileService.ts
import { useCallback } from "react";
import { useApi } from "./api";

// ─────────────────────────────────────────────
// Tipos
// Compatível com AuthContext: "ATTENDANT" | "MANAGER" | "GENERAL_MANAGER" | "ADMIN"
// ─────────────────────────────────────────────
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
  // Vínculos com times (retornado via include no backend)
  user_teams?: UserTeamInfo[];
}

// ─────────────────────────────────────────────
// DTO de auto-atualização — alinhado a updateSelfSchema do backend.
// IMPORTANTE: este endpoint NÃO aceita role, is_active nem team_ids.
// Para troca de senha o backend exige new_password + current_password.
// ─────────────────────────────────────────────
export interface UpdateSelfDTO {
  name?: string;
  email?: string;
  current_password?: string;
  new_password?: string;
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

// Helper: aceita resposta { data: ... } ou corpo direto
function unwrap<T>(json: any): T {
  return (json && typeof json === "object" && "data" in json ? json.data : json) as T;
}

export const useProfileService = () => {
  const { apiFetch } = useApi();

  /**
   * Busca o perfil do usuário pelo ID (inclui user_teams via include no backend).
   * GET /api/users/:id
   */
  const getProfileWithTeam = useCallback(
    async (userId: string): Promise<UserProfile> => {
      const res = await apiFetch(`/api/users/${userId}`, { method: "GET" });
      return unwrap<UserProfile>(await res.json());
    },
    [apiFetch]
  );

  /**
   * Atualiza o próprio perfil (campos não sensíveis).
   * PUT /api/users/:id  — body validado por updateSelfSchema no backend.
   * Não envie role/is_active/team_ids: o backend os rejeita nesta rota.
   */
  const updateProfile = useCallback(
    async (userId: string, data: UpdateSelfDTO): Promise<UserProfile> => {
      const res = await apiFetch(`/api/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
      return unwrap<UserProfile>(await res.json());
    },
    [apiFetch]
  );

  /**
   * Troca de senha do próprio usuário.
   * O backend exige current_password sempre que new_password é enviado
   * (refine em updateSelfSchema), então ambos são obrigatórios aqui.
   * PUT /api/users/:id
   */
  const updatePassword = useCallback(
    async (
      userId: string,
      currentPassword: string,
      newPassword: string
    ): Promise<UserProfile> => {
      const res = await apiFetch(`/api/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      return unwrap<UserProfile>(await res.json());
    },
    [apiFetch]
  );

  return { getProfileWithTeam, updateProfile, updatePassword };
};
