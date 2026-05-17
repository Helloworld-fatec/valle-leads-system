// src/services/storesService.ts
import { useApi } from "./api";

export interface Store {
  id: string;
  name: string;
  address: string;
  is_active: boolean;
}

export const useStoresService = () => {
  const { apiFetch } = useApi();

  const getStores = async (): Promise<Store[]> => {
    const res = await apiFetch("/api/stores");
    const json = await res.json();
    return json.data;
  };

  const createStore = async (data: { name: string; address: string }): Promise<Store> => {
    const res = await apiFetch("/api/stores", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  };

  const updateStore = async (
    id: string,
    data: { name?: string; address?: string; is_active?: boolean }
  ): Promise<Store> => {
    const res = await apiFetch(`/api/stores/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data;
  };

  return { getStores, createStore, updateStore };
};