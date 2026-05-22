// src/services/userService.ts
import { useApi } from "./api";

// ─────────────────────────────────────────────
// Tipos — alinhados a users.dto.ts (backend)
// ─────────────────────────────────────────────
export type UserRole = "ATTENDANT" | "MANAGER" | "GENERAL_MANAGER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  phone_1_ddd?: string | null;
  phone_1_number?: string | null;
  phone_2_ddd?: string | null;
  phone_2_number?: string | null;
  address_street?: string | null;
  address_number?: string | null;
  address_complement?: string | null;
  address_neighborhood?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip?: string | null;
  user_teams?: Array<{ id: string; team_id: string }>;
}

// createUserSchema: name, email, password, role obrigatórios; team_ids + contato opcionais
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  team_ids?: string[];
  phone_1_ddd?: string;
  phone_1_number?: string;
  phone_2_ddd?: string;
  phone_2_number?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
}

// updateUserAdminSchema: inclui campos sensíveis (role, is_active, team_ids)
export interface UpdateUserAdminDTO {
  name?: string;
  email?: string;
  role?: UserRole;
  is_active?: boolean;
  team_ids?: string[];
  phone_1_ddd?: string;
  phone_1_number?: string;
  phone_2_ddd?: string;
  phone_2_number?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
}

// listUsersQuerySchema
export interface ListUsersQuery {
  page?: number;
  pageSize?: number;
  role?: UserRole;
  team_id?: string;
  search?: string;
  is_active?: boolean;
}

export interface PaginatedUsers {
  data: User[];
  total?: number;
  page?: number;
  pageSize?: number;
}

function unwrap<T>(json: any): T {
  return (json && typeof json === "object" && "data" in json ? json.data : json) as T;
}

export const useUserService = () => {
  const { apiFetch } = useApi();

  // GET /api/users → MANAGER, GENERAL_MANAGER ou ADMIN
  // Retorna o objeto bruto para preservar metadados de paginação.
  const getUsers = async (query?: ListUsersQuery): Promise<PaginatedUsers> => {
    const p = new URLSearchParams();
    if (query?.page) p.append("page", String(query.page));
    if (query?.pageSize) p.append("pageSize", String(query.pageSize));
    if (query?.role) p.append("role", query.role);
    if (query?.team_id) p.append("team_id", query.team_id);
    if (query?.search) p.append("search", query.search);
    if (query?.is_active !== undefined) p.append("is_active", String(query.is_active));
    const qs = p.toString();
    const res = await apiFetch(`/api/users${qs ? `?${qs}` : ""}`);
    const json = await res.json();
    // Normaliza: se já vier { data, total, ... } repassa; se vier array puro, embrulha.
    if (Array.isArray(json)) return { data: json };
    return json as PaginatedUsers;
  };

  // GET /api/users/:id → qualquer autenticado
  const getUserById = async (id: string): Promise<User> => {
    const res = await apiFetch(`/api/users/${id}`);
    return unwrap<User>(await res.json());
  };

  // POST /api/users → somente ADMIN
  const createUser = async (data: CreateUserDTO): Promise<User> => {
    const res = await apiFetch("/api/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return unwrap<User>(await res.json());
  };

  // PUT /api/users/:id → ADMIN (qualquer) ou próprio id
  const updateUser = async (id: string, data: UpdateUserAdminDTO): Promise<User> => {
    const res = await apiFetch(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return unwrap<User>(await res.json());
  };

  // DELETE /api/users/:id → soft delete (ADMIN)
  const deleteUser = async (id: string): Promise<void> => {
    await apiFetch(`/api/users/${id}`, { method: "DELETE" });
  };

  // DELETE /api/users/:id/hard → hard delete (ADMIN)
  const hardDeleteUser = async (id: string): Promise<void> => {
    await apiFetch(`/api/users/${id}/hard`, { method: "DELETE" });
  };

  return {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    hardDeleteUser,
  };
};
