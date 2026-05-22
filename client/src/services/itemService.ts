// src/services/itemService.ts
import { useApi } from "./api";

// ─────────────────────────────────────────────
// Tipos — alinhados a item.dto.ts (backend: interest-items)
// value é serializado como string (Prisma Decimal) ou null.
// ─────────────────────────────────────────────
export interface InterestItem {
  id: string;
  description: string;
  reference_code?: string | null;
  value?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// createInterestItemSchema: description obrigatório; reference_code e value opcionais
export interface CreateInterestItemDTO {
  description: string;
  reference_code?: string;
  // aceita string ou number — o backend normaliza para string/null
  value?: string | number | null;
}

// updateInterestItemSchema: todos opcionais + is_active
export interface UpdateInterestItemDTO {
  description?: string;
  reference_code?: string;
  value?: string | number | null;
  is_active?: boolean;
}

// queryInterestItemSchema
export interface ListInterestItemsQuery {
  description?: string;
  reference_code?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedInterestItems {
  data: InterestItem[];
  total?: number;
  page?: number;
  limit?: number;
}

// Helper: aceita resposta { data: ... } ou corpo direto
function unwrap<T>(json: any): T {
  return (json && typeof json === "object" && "data" in json ? json.data : json) as T;
}

export const useItemService = () => {
  const { apiFetch } = useApi();

  // GET /api/interest-items → qualquer autenticado
  const getItems = async (query?: ListInterestItemsQuery): Promise<PaginatedInterestItems> => {
    const p = new URLSearchParams();
    if (query?.description) p.append("description", query.description);
    if (query?.reference_code) p.append("reference_code", query.reference_code);
    if (query?.is_active !== undefined) p.append("is_active", String(query.is_active));
    if (query?.page) p.append("page", String(query.page));
    if (query?.limit) p.append("limit", String(query.limit));
    const qs = p.toString();
    const res = await apiFetch(`/api/interest-items${qs ? `?${qs}` : ""}`);
    const json = await res.json();
    if (Array.isArray(json)) return { data: json };
    return json as PaginatedInterestItems;
  };

  // GET /api/interest-items/:id → qualquer autenticado
  const getItemById = async (id: string): Promise<InterestItem> => {
    const res = await apiFetch(`/api/interest-items/${id}`);
    return unwrap<InterestItem>(await res.json());
  };

  // POST /api/interest-items → GENERAL_MANAGER ou ADMIN
  const createItem = async (data: CreateInterestItemDTO): Promise<InterestItem> => {
    const res = await apiFetch("/api/interest-items", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return unwrap<InterestItem>(await res.json());
  };

  // PATCH /api/interest-items/:id → GENERAL_MANAGER ou ADMIN
  const updateItem = async (id: string, data: UpdateInterestItemDTO): Promise<InterestItem> => {
    const res = await apiFetch(`/api/interest-items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return unwrap<InterestItem>(await res.json());
  };

  // DELETE /api/interest-items/:id → soft delete (GENERAL_MANAGER ou ADMIN)
  const deleteItem = async (id: string): Promise<void> => {
    await apiFetch(`/api/interest-items/${id}`, { method: "DELETE" });
  };

  // DELETE /api/interest-items/:id/hard → hard delete (somente ADMIN)
  const hardDeleteItem = async (id: string): Promise<void> => {
    await apiFetch(`/api/interest-items/${id}/hard`, { method: "DELETE" });
  };

  return {
    getItems,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
    hardDeleteItem,
  };
};
