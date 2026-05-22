// src/services/clientService.ts
import { useApi } from "./api";

// ─────────────────────────────────────────────
// Tipos — alinhados a customer.dto.ts (backend)
// "client" no frontend == "customer" no backend (/api/customers).
// phone é obrigatório e único; team_id é opcional (FK para Teams).
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

// createCustomerSchema: name + phone obrigatórios; resto opcional
export interface CreateClientDTO {
  name: string;
  phone: string;
  email?: string;
  cpf?: string;
  team_id?: string;
  address_street?: string;
  address_number?: string;
  address_complement?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
}

// updateCustomerSchema: todos opcionais; team_id pode ser null (desvincular); is_active editável
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

// queryCustomerSchema
export interface ListClientsQuery {
  team_id?: string;
  is_active?: boolean;
  name?: string;
  cpf?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedClients {
  data: Client[];
  total?: number;
  page?: number;
  limit?: number;
}

function unwrap<T>(json: any): T {
  return (json && typeof json === "object" && "data" in json ? json.data : json) as T;
}

export const useClientService = () => {
  const { apiFetch } = useApi();

  // GET /api/customers → qualquer autenticado
  const getClients = async (query?: ListClientsQuery): Promise<PaginatedClients> => {
    const p = new URLSearchParams();
    if (query?.team_id) p.append("team_id", query.team_id);
    if (query?.is_active !== undefined) p.append("is_active", String(query.is_active));
    if (query?.name) p.append("name", query.name);
    if (query?.cpf) p.append("cpf", query.cpf);
    if (query?.page) p.append("page", String(query.page));
    if (query?.limit) p.append("limit", String(query.limit));
    const qs = p.toString();
    const res = await apiFetch(`/api/customers${qs ? `?${qs}` : ""}`);
    const json = await res.json();
    if (Array.isArray(json)) return { data: json };
    return json as PaginatedClients;
  };

  // GET /api/customers/:id → qualquer autenticado
  const getClientById = async (id: string): Promise<Client> => {
    const res = await apiFetch(`/api/customers/${id}`);
    return unwrap<Client>(await res.json());
  };

  // POST /api/customers → qualquer autenticado
  const createClient = async (data: CreateClientDTO): Promise<Client> => {
    const res = await apiFetch("/api/customers", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return unwrap<Client>(await res.json());
  };

  // PATCH /api/customers/:id → qualquer autenticado
  const updateClient = async (id: string, data: UpdateClientDTO): Promise<Client> => {
    const res = await apiFetch(`/api/customers/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return unwrap<Client>(await res.json());
  };

  // DELETE /api/customers/:id → soft delete (qualquer autenticado)
  const deleteClient = async (id: string): Promise<void> => {
    await apiFetch(`/api/customers/${id}`, { method: "DELETE" });
  };

  // DELETE /api/customers/:id/hard → hard delete (somente ADMIN)
  const hardDeleteClient = async (id: string): Promise<void> => {
    await apiFetch(`/api/customers/${id}/hard`, { method: "DELETE" });
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
