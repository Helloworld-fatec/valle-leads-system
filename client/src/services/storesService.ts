// src/services/storesService.ts
import { useApi } from "./api";

// ─────────────────────────────────────────────
// Tipos — alinhados ao backend (stores.dto.ts / store.routes.ts)
// Stores NÃO possui team_id; address é opcional no schema.
// ─────────────────────────────────────────────
export interface Store {
  id: string;
  name: string;
  address?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// CREATE: name obrigatório, address opcional (createStoreSchema)
export interface CreateStoreDTO {
  name: string;
  address?: string;
}

// UPDATE: todos opcionais; is_active não está no updateStoreSchema do backend,
// portanto NÃO é enviável por aqui (o backend rejeitaria via strip do Zod).
export interface UpdateStoreDTO {
  name?: string;
  address?: string;
}

// Helper: aceita resposta { data: ... } ou corpo direto
function unwrap<T>(json: any): T {
  return (json && typeof json === "object" && "data" in json ? json.data : json) as T;
}

export const useStoresService = () => {
  const { apiFetch } = useApi();

  // GET /api/stores  → qualquer autenticado
  const getStores = async (): Promise<Store[]> => {
    const res = await apiFetch("/api/stores");
    return unwrap<Store[]>(await res.json());
  };

  // GET /api/stores/:id → qualquer autenticado
  const getStoreById = async (id: string): Promise<Store> => {
    const res = await apiFetch(`/api/stores/${id}`);
    return unwrap<Store>(await res.json());
  };

  // POST /api/stores → somente ADMIN
  const createStore = async (data: CreateStoreDTO): Promise<Store> => {
    const res = await apiFetch("/api/stores", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return unwrap<Store>(await res.json());
  };

  // PATCH /api/stores/:id → somente ADMIN
  const updateStore = async (id: string, data: UpdateStoreDTO): Promise<Store> => {
    const res = await apiFetch(`/api/stores/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return unwrap<Store>(await res.json());
  };

  // DELETE /api/stores/:id → soft delete (ADMIN)
  const deleteStore = async (id: string): Promise<void> => {
    await apiFetch(`/api/stores/${id}`, { method: "DELETE" });
  };

  // DELETE /api/stores/:id/hard → hard delete (ADMIN)
  const hardDeleteStore = async (id: string): Promise<void> => {
    await apiFetch(`/api/stores/${id}/hard`, { method: "DELETE" });
  };

  return {
    getStores,
    getStoreById,
    createStore,
    updateStore,
    deleteStore,
    hardDeleteStore,
  };
};
