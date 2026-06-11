import { useApi } from "./api";

// ─────────────────────────────────────────────
// TIPOS
// "client" no frontend == "customer" no backend (/api/customers)
// ─────────────────────────────────────────────

export interface Client {
  id: string;
  name: string;
  email?: string | null;
  cpf?: string | null;
  phone: string;
  team_id?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  address_street?: string | null;
  address_number?: string | null;
  address_complement?: string | null;
  address_neighborhood?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip?: string | null;
}

export interface CreateClientDTO {
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
  team_id?: string;
  is_active?: boolean;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
}

export interface UpdateClientDTO {
  name?: string;
  email?: string;
  cpf?: string;
  phone?: string;
  is_active?: boolean;
  team_id?: string | null;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
}

export interface ListClientsQuery {
  team_id?: string;
  is_active?: boolean;
  name?: string;
  cpf?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedClients {
  success?: boolean;
  data: Client[];
  total?: number;
  page?: number;
  limit?: number;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function unwrap<T>(json: unknown): T {
  if (json && typeof json === "object" && "data" in json) {
    return (json as { data: T }).data;
  }

  return json as T;
}

function unwrapList(json: unknown): PaginatedClients {
  if (Array.isArray(json)) {
    return { data: json };
  }

  if (json && typeof json === "object" && "data" in json) {
    const response = json as PaginatedClients;

    return {
      success: response.success,
      data: response.data ?? [],
      total: response.total,
      page: response.page,
      limit: response.limit,
    };
  }

  return { data: [] };
}

// ─────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────

export const useClientService = () => {
  const { apiFetch } = useApi();

  // GET /api/customers
  const getClients = async (
    query?: ListClientsQuery
  ): Promise<PaginatedClients> => {
    const params = new URLSearchParams();

    if (query?.team_id) {
      params.append("team_id", query.team_id);
    }

    if (query?.is_active !== undefined) {
      params.append("is_active", String(query.is_active));
    }

    if (query?.name) {
      params.append("name", query.name);
    }

    if (query?.cpf) {
      params.append("cpf", query.cpf);
    }

    if (query?.page) {
      params.append("page", String(query.page));
    }

    if (query?.limit) {
      params.append("limit", String(query.limit));
    }

    const queryString = params.toString();

    const res = await apiFetch(
      `/api/customers${queryString ? `?${queryString}` : ""}`
    );

    const json = await res.json();

    return unwrapList(json);
  };

  // GET /api/customers/:id
  const getClientById = async (id: string): Promise<Client> => {
    const res = await apiFetch(`/api/customers/${id}`);
    const json = await res.json();

    return unwrap<Client>(json);
  };

  // POST /api/customers
  const createClient = async (data: CreateClientDTO): Promise<Client> => {
    const res = await apiFetch("/api/customers", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const json = await res.json();

    return unwrap<Client>(json);
  };

  // PATCH /api/customers/:id
  const updateClient = async (
    id: string,
    data: UpdateClientDTO
  ): Promise<Client> => {
    const res = await apiFetch(`/api/customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    const json = await res.json();

    return unwrap<Client>(json);
  };

  // DELETE /api/customers/:id
  const deleteClient = async (id: string): Promise<void> => {
    await apiFetch(`/api/customers/${id}`, {
      method: "DELETE",
    });
  };

  // DELETE /api/customers/:id/hard
  const hardDeleteClient = async (id: string): Promise<void> => {
    await apiFetch(`/api/customers/${id}/hard`, {
      method: "DELETE",
    });
  };

  return {
    getClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    hardDeleteClient,
  };
};