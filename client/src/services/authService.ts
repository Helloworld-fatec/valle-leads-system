// src/services/storesService.ts
import { useApi } from "./api";

// ─────────────────────────────────────────────
// Tipo de uma Loja
// ─────────────────────────────────────────────

export interface Store {
  id: string;
  name: string;
  address: string;
  is_active: boolean;
}

// ─────────────────────────────────────────────
// Hook com todas as funções de Lojas
// ─────────────────────────────────────────────

export const useStoresService = () => {
  const { apiFetch } = useApi();

  // Busca todas as lojas
  const getStores = async (): Promise<Store[]> => {
    const res = await apiFetch("/stores");
    return res.json();
  };

  // Cria uma nova loja
  const createStore = async (data: { name: string; address: string }): Promise<Store> => {
    const res = await apiFetch("/stores", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return res.json();
  };

  // Edita nome ou endereço de uma loja
  const updateStore = async (
    id: string,
    data: { name?: string; address?: string; is_active?: boolean }
  ): Promise<Store> => {
    const res = await apiFetch(`/stores/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return res.json();
  };

  return { getStores, createStore, updateStore };
};