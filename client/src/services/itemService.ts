import { useApi } from "./api";

/**
 * Tipos alinhados ao backend: módulo interest-items.
 *
 * Observação:
 * O campo value pode vir como string porque o Prisma Decimal
 * geralmente é serializado dessa forma no JSON.
 */
export interface InterestItem {
  id: string;
  description: string;
  reference_code?: string | null;
  value?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * DTO para criação de item de interesse.
 *
 * No backend, description é obrigatório.
 * reference_code e value são opcionais.
 */
export interface CreateInterestItemDTO {
  description: string;
  reference_code?: string;
  value?: string | number | null;
}

/**
 * DTO para atualização de item de interesse.
 *
 * Todos os campos são opcionais.
 */
export interface UpdateInterestItemDTO {
  description?: string;
  reference_code?: string;
  value?: string | number | null;
  is_active?: boolean;
}

/**
 * Query da listagem de itens.
 *
 * Importante:
 * Mesmo que is_active exista aqui, alguns schemas do backend podem
 * rejeitar "is_active=true" se não transformarem string para boolean.
 *
 * Por isso o getItems possui fallback: se a busca com is_active falhar,
 * ele tenta buscar novamente sem esse filtro.
 */
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

/**
 * Aceita resposta no formato:
 * - { data: ... }
 * - corpo direto
 *
 * Usado em operações de item único.
 */
function unwrap<T>(json: any): T {
  return (json && typeof json === "object" && "data" in json
    ? json.data
    : json) as T;
}

/**
 * Normaliza respostas de listagem.
 *
 * Protege o frontend caso a API retorne:
 * - [...]
 * - { data: [...] }
 * - { success: true, data: [...] }
 * - { data: { data: [...] } }
 */
function normalizeItemsResponse(json: any): PaginatedInterestItems {
  if (Array.isArray(json)) {
    return {
      data: json,
    };
  }

  if (Array.isArray(json?.data)) {
    return {
      data: json.data,
      total: json.total,
      page: json.page,
      limit: json.limit,
    };
  }

  if (Array.isArray(json?.data?.data)) {
    return {
      data: json.data.data,
      total: json.data.total,
      page: json.data.page,
      limit: json.data.limit,
    };
  }

  return {
    data: [],
  };
}

/**
 * Monta a query string para a rota de interest-items.
 *
 * O parâmetro includeIsActive controla se is_active será enviado ou não.
 * Isso é importante porque alguns validators do backend podem rejeitar
 * boolean vindo da URL como string.
 */
function buildInterestItemsQuery(
  query?: ListInterestItemsQuery,
  includeIsActive = true
) {
  const params = new URLSearchParams();

  if (query?.description) {
    params.append("description", query.description);
  }

  if (query?.reference_code) {
    params.append("reference_code", query.reference_code);
  }

  if (includeIsActive && query?.is_active !== undefined) {
    params.append("is_active", String(query.is_active));
  }

  if (query?.page) {
    params.append("page", String(query.page));
  }

  if (query?.limit) {
    params.append("limit", String(query.limit));
  }

  const qs = params.toString();

  return `/api/interest-items${qs ? `?${qs}` : ""}`;
}

export const useItemService = () => {
  const { apiFetch } = useApi();

  /**
   * GET /api/interest-items
   *
   * Qualquer usuário autenticado pode consultar.
   *
   * Estratégia:
   * 1. Tenta buscar com os filtros recebidos.
   * 2. Se falhar e tiver is_active, tenta novamente sem is_active.
   *
   * Motivo:
   * Em Express, query params chegam como string.
   * Então is_active=true chega como "true".
   * Se o backend não converter isso no Zod, a validação pode falhar.
   */
  const getItems = async (
    query?: ListInterestItemsQuery
  ): Promise<PaginatedInterestItems> => {
    const urlWithActive = buildInterestItemsQuery(query, true);

    try {
      const res = await apiFetch(urlWithActive);
      const json = await res.json();

      return normalizeItemsResponse(json);
    } catch (error) {
      /**
       * Fallback:
       * Se a primeira tentativa falhar e a query tinha is_active,
       * tentamos novamente sem enviar is_active.
       */
      if (query?.is_active !== undefined) {
        const urlWithoutActive = buildInterestItemsQuery(query, false);

        const res = await apiFetch(urlWithoutActive);
        const json = await res.json();

        return normalizeItemsResponse(json);
      }

      throw error;
    }
  };

  /**
   * GET /api/interest-items/:id
   *
   * Busca um item específico pelo id.
   */
  const getItemById = async (id: string): Promise<InterestItem> => {
    const res = await apiFetch(`/api/interest-items/${id}`);
    return unwrap<InterestItem>(await res.json());
  };

  /**
   * POST /api/interest-items
   *
   * No backend, essa rota é restrita a GENERAL_MANAGER ou ADMIN.
   */
  const createItem = async (
    data: CreateInterestItemDTO
  ): Promise<InterestItem> => {
    const res = await apiFetch("/api/interest-items", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return unwrap<InterestItem>(await res.json());
  };

  /**
   * PATCH /api/interest-items/:id
   *
   * No backend, essa rota é restrita a GENERAL_MANAGER ou ADMIN.
   */
  const updateItem = async (
    id: string,
    data: UpdateInterestItemDTO
  ): Promise<InterestItem> => {
    const res = await apiFetch(`/api/interest-items/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });

    return unwrap<InterestItem>(await res.json());
  };

  /**
   * DELETE /api/interest-items/:id
   *
   * Soft delete.
   * No backend, essa rota é restrita a GENERAL_MANAGER ou ADMIN.
   */
  const deleteItem = async (id: string): Promise<void> => {
    await apiFetch(`/api/interest-items/${id}`, {
      method: "DELETE",
    });
  };

  /**
   * DELETE /api/interest-items/:id/hard
   *
   * Hard delete físico.
   * No backend, essa rota é somente ADMIN.
   */
  const hardDeleteItem = async (id: string): Promise<void> => {
    await apiFetch(`/api/interest-items/${id}/hard`, {
      method: "DELETE",
    });
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