import { useEffect, useMemo, useState } from "react";
import {
  X,
  User,
  Package,
  Phone,
  Mail,
  IdCard,
  Loader2,
  ArrowLeft,
  Search,
  Car,
  Image as ImageIcon,
} from "lucide-react";
import { useAuth } from "../../hook/useAuth";
import { useClientService } from "../../services/clientService";
import type { Client, CreateClientDTO } from "../../services/clientService";
import { useItemService } from "../../services/itemService";
import type { InterestItem } from "../../services/itemService";
import { useLeadService } from "../../services/leadService";

type Props = {
  /**
   * Fallback de equipe enviado pela página Leads.tsx.
   *
   * Alguns usuários não trazem team_id direto no objeto user.
   * Por isso usamos a equipe dos leads carregados como alternativa.
   */
  defaultTeamId?: string;

  onClose: () => void;
  onCreated: () => void;
};

/**
 * Origens padronizadas para evitar variações digitadas manualmente.
 */
const LEAD_ORIGINS = [
  "WhatsApp",
  "Instagram",
  "Facebook",
  "Indicação",
  "Loja Física",
  "Mercado Livre",
  "Site",
  "Google",
  "Telefone",
];

/**
 * Remove tudo que não for número.
 */
function onlyNumbers(value: string) {
  return value.replace(/\D/g, "");
}

/**
 * Validação simples de CPF.
 */
function isInvalidCpf(cpf: string) {
  if (!cpf) return false;
  if (cpf.length !== 11) return true;
  if (/^(\d)\1{10}$/.test(cpf)) return true;

  return false;
}

/**
 * Formata valores monetários vindos do backend.
 */
function formatCurrency(value?: string | null) {
  if (!value) return null;

  const numberValue = Number(value);

  if (Number.isNaN(numberValue)) return value;

  return numberValue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/**
 * Normaliza respostas de listagem.
 *
 * Isso protege o componente caso a API retorne:
 * - [...]
 * - { data: [...] }
 * - { success: true, data: [...] }
 * - { data: { data: [...] } }
 */
function normalizeList<T>(response: unknown): T[] {
  const data = response as any;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.data)) return data.data.data;

  return [];
}

/**
 * Modal de criação de lead.
 *
 * Fluxo:
 * 1. Buscar/selecionar cliente.
 * 2. Se não existir, cadastrar cliente.
 * 3. Selecionar origem.
 * 4. Opcionalmente selecionar veículo/produto.
 * 5. Criar lead.
 */
export default function CreateLeadModal({
  defaultTeamId,
  onClose,
  onCreated,
}: Props) {
  const { user } = useAuth();
  const { getClients, createClient } = useClientService();
  const { getItems } = useItemService();
  const { createLead } = useLeadService();

  // ─────────────────────────────────────────────
  // Estados gerais
  // ─────────────────────────────────────────────

  const [error, setError] = useState<string | null>(null);
  const [creatingLead, setCreatingLead] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);

  // ─────────────────────────────────────────────
  // Estados do cliente
  // ─────────────────────────────────────────────

  const [clientSearch, setClientSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [showClientList, setShowClientList] = useState(false);
  const [clientSearchFinished, setClientSearchFinished] = useState(false);

  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [customerId, setCustomerId] = useState("");

  /**
   * Controla a etapa exclusiva de cadastro de cliente.
   */
  const [showNewClientForm, setShowNewClientForm] = useState(false);

  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientCpf, setNewClientCpf] = useState("");

  // ─────────────────────────────────────────────
  // Estados do lead
  // ─────────────────────────────────────────────

  const [source, setSource] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [items, setItems] = useState<InterestItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [showItemList, setShowItemList] = useState(false);
  const [itemSearchFinished, setItemSearchFinished] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InterestItem | null>(null);

  /**
   * Erro específico do campo de veículo/produto.
   *
   * Fica separado do erro geral para não criar alerta grande
   * e não causar pulo visual no modal.
   */
  const [itemError, setItemError] = useState<string | null>(null);

  const hasSelectedClient = Boolean(selectedClient && customerId);
  const canFillLeadData = hasSelectedClient && !showNewClientForm;
  const hasEnoughClientSearch = clientSearch.trim().length >= 2;

  /**
   * Texto do botão principal do rodapé.
   */
  const footerButtonText = useMemo(() => {
    if (showNewClientForm) {
      return creatingClient ? "Salvando cliente..." : "Salvar cliente";
    }

    if (!hasSelectedClient) {
      return "Cadastrar novo cliente";
    }

    if (!source) {
      return "Selecione a origem";
    }

    return creatingLead ? "Criando..." : "Criar Lead";
  }, [
    showNewClientForm,
    creatingClient,
    hasSelectedClient,
    source,
    creatingLead,
  ]);

  /**
   * Define quando o botão principal fica desabilitado.
   */
  const isFooterButtonDisabled = useMemo(() => {
    if (showNewClientForm) return creatingClient;

    if (!hasSelectedClient) {
      return !hasEnoughClientSearch;
    }

    return creatingLead || !source;
  }, [
    showNewClientForm,
    creatingClient,
    hasSelectedClient,
    hasEnoughClientSearch,
    creatingLead,
    source,
  ]);

  // ─────────────────────────────────────────────
  // Busca manual de clientes
  // ─────────────────────────────────────────────

  /**
   * Busca clientes sob demanda.
   *
   * Mantemos a busca de cliente manual porque o cadastro de cliente
   * é mais sensível e precisa ser controlado.
   */
  async function handleSearchClients() {
    const query = clientSearch.trim();

    if (query.length < 2) {
      setError("Digite pelo menos 2 caracteres para buscar cliente.");
      return;
    }

    try {
      setLoadingClients(true);
      setError(null);
      setClientSearchFinished(false);
      setSelectedClient(null);
      setCustomerId("");

      const onlyDigits = onlyNumbers(query);
      const isOnlyDigits = onlyDigits.length === query.length;

      const response = await getClients({
        name: isOnlyDigits ? undefined : query,
        cpf: isOnlyDigits ? onlyDigits : undefined,
        is_active: true,
        page: 1,
        limit: 8,
      });

      const result = normalizeList<Client>(response);

      setClients(result);
      setShowClientList(true);
    } catch {
      setClients([]);
      setShowClientList(true);
      setError("Não foi possível buscar clientes.");
    } finally {
      setLoadingClients(false);
      setClientSearchFinished(true);
    }
  }

  /**
   * Seleciona um cliente existente.
   */
  function handleSelectClient(client: Client) {
    setSelectedClient(client);
    setCustomerId(client.id);
    setClientSearch(client.name);

    setClients([]);
    setShowClientList(false);
    setClientSearchFinished(false);
    setShowNewClientForm(false);
    setError(null);
  }

  /**
   * Remove o cliente selecionado e limpa campos dependentes.
   */
  function handleClearSelectedClient() {
    setSelectedClient(null);
    setCustomerId("");
    setClientSearch("");
    setClients([]);
    setShowClientList(false);
    setClientSearchFinished(false);
    setShowNewClientForm(false);

    setSource("");
    setSelectedItem(null);
    setItemSearch("");
    setItems([]);
    setShowItemList(false);
    setItemSearchFinished(false);
    setItemError(null);
    setError(null);
  }

  /**
   * Abre a etapa de cadastro de novo cliente.
   */
  function handleOpenNewClientForm() {
    const searchedName = clientSearch.trim();

    setSelectedClient(null);
    setCustomerId("");
    setClients([]);
    setShowClientList(false);
    setClientSearchFinished(false);
    setShowNewClientForm(true);
    setError(null);

    setNewClientName(searchedName);
    setNewClientPhone("");
    setNewClientEmail("");
    setNewClientCpf("");
  }

  /**
   * Volta para a busca de cliente.
   */
  function handleCancelNewClientForm() {
    setShowNewClientForm(false);
    setError(null);
  }

  /**
   * Cadastra cliente novo e já seleciona ele no lead.
   */
  async function handleCreateClient() {
    if (!newClientName.trim()) {
      setError("Informe o nome do cliente.");
      return;
    }

    if (!newClientPhone.trim()) {
      setError("Informe o telefone do cliente.");
      return;
    }

    const cleanPhone = onlyNumbers(newClientPhone);
    const cleanCpf = onlyNumbers(newClientCpf);
    const cleanEmail = newClientEmail.trim();

    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      setError("Informe um telefone válido com DDD.");
      return;
    }

    if (isInvalidCpf(cleanCpf)) {
      setError("Informe um CPF válido com 11 dígitos ou deixe o campo vazio.");
      return;
    }

    const payload: CreateClientDTO = {
      name: newClientName.trim(),
      phone: cleanPhone,
      email: cleanEmail || undefined,
      cpf: cleanCpf || undefined,
    };

    try {
      setCreatingClient(true);
      setError(null);

      const createdClient = await createClient(payload);

      if (createdClient.is_active === false) {
        setError(
          "Cliente cadastrado, mas está inativo. Não é possível criar lead para cliente inativo."
        );
        return;
      }

      setSelectedClient(createdClient);
      setCustomerId(createdClient.id);
      setClientSearch(createdClient.name);

      setShowNewClientForm(false);
      setShowClientList(false);
      setClientSearchFinished(false);
      setClients([]);

      setNewClientName("");
      setNewClientPhone("");
      setNewClientEmail("");
      setNewClientCpf("");
    } catch {
      setError(
        "Não foi possível cadastrar o cliente. Verifique se telefone, CPF ou e-mail já estão cadastrados."
      );
    } finally {
      setCreatingClient(false);
    }
  }

  // ─────────────────────────────────────────────
  // Busca automática de produto/item de interesse
  // ─────────────────────────────────────────────

  /**
   * Busca veículos/produtos automaticamente.
   *
   * Ajuste de UX:
   * - Não exibimos "Buscando itens..." enquanto já existe lista na tela.
   * - Não limpamos a lista atual enquanto uma nova busca está em andamento.
   * - Só atualizamos os resultados quando a nova busca termina.
   */
  useEffect(() => {
    const query = itemSearch.trim();

    if (!canFillLeadData || query.length < 2 || selectedItem) {
      setItems([]);
      setShowItemList(false);
      setItemSearchFinished(false);
      setItemError(null);
      setLoadingItems(false);
      return;
    }

    let cancelled = false;

    const timeout = setTimeout(async () => {
      try {
        if (items.length === 0) {
          setLoadingItems(true);
        }

        setItemError(null);
        setItemSearchFinished(false);

        const isReferenceSearch = /^\d+$/.test(query);

        let result: InterestItem[] = [];

        if (isReferenceSearch) {
          const byReference = await getItems({
            reference_code: query,
            is_active: true,
            page: 1,
            limit: 8,
          });

          result = normalizeList<InterestItem>(byReference);

          if (result.length === 0) {
            const byDescription = await getItems({
              description: query,
              is_active: true,
              page: 1,
              limit: 8,
            });

            result = normalizeList<InterestItem>(byDescription);
          }
        } else {
          const byDescription = await getItems({
            description: query,
            is_active: true,
            page: 1,
            limit: 8,
          });

          result = normalizeList<InterestItem>(byDescription);
        }

        if (cancelled) return;

        setItems(result);
        setShowItemList(true);
        setItemSearchFinished(true);
      } catch {
        if (cancelled) return;

        setItems([]);
        setShowItemList(true);
        setItemSearchFinished(true);
        setItemError(
          "Não foi possível buscar produtos agora. Verifique a API de veículos/produtos."
        );
      } finally {
        if (!cancelled) {
          setLoadingItems(false);
        }
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [itemSearch, selectedItem, canFillLeadData, getItems, items.length]);

  /**
   * Seleciona item/produto de interesse.
   */
  function handleSelectItem(item: InterestItem) {
    setSelectedItem(item);

    setItemSearch(
      item.reference_code
        ? `${item.reference_code} - ${item.description}`
        : item.description
    );

    setItems([]);
    setShowItemList(false);
    setItemSearchFinished(false);
    setItemError(null);
    setError(null);
  }

  /**
   * Limpa item selecionado.
   */
  function handleClearSelectedItem() {
    setSelectedItem(null);
    setItemSearch("");
    setItems([]);
    setShowItemList(false);
    setItemSearchFinished(false);
    setItemError(null);
  }

  // ─────────────────────────────────────────────
  // Ação do botão principal
  // ─────────────────────────────────────────────

  function handleFooterAction() {
    if (showNewClientForm) {
      handleCreateClient();
      return;
    }

    if (!hasSelectedClient) {
      handleOpenNewClientForm();
      return;
    }

    handleCreateLead();
  }

  // ─────────────────────────────────────────────
  // Criação do lead
  // ─────────────────────────────────────────────

  async function handleCreateLead() {
    if (!selectedClient || !customerId) {
      setError("Selecione um cliente antes de criar o lead.");
      return;
    }

    if (!source) {
      setError("Selecione a origem do lead.");
      return;
    }

    /**
     * Produto é opcional.
     *
     * Porém, se a pessoa digitou algo no campo e não selecionou da lista,
     * bloqueamos a criação para evitar lead sem produto por acidente.
     */
    if (itemSearch.trim() && !selectedItem) {
      setError(
        "Você digitou um produto/referência, mas não selecionou um item da lista. Se o lead não tiver produto, limpe esse campo."
      );
      return;
    }

    const loggedUser = user as any;

    const teamId =
      loggedUser?.team_id ??
      loggedUser?.team?.id ??
      loggedUser?.teams?.[0]?.id ??
      loggedUser?.teams?.[0]?.team_id ??
      loggedUser?.user_teams?.[0]?.team_id ??
      loggedUser?.userTeams?.[0]?.team_id ??
      defaultTeamId;

    if (!teamId) {
      setError(
        "Não foi possível identificar a equipe do usuário logado para criar o lead."
      );
      return;
    }

    try {
      setCreatingLead(true);
      setError(null);

      await createLead({
        customer_id: customerId,
        team_id: teamId,
        attendant_id: loggedUser?.id,
        source,
        status: "new",
        interest_item_id: selectedItem?.id,
      });

      onCreated();
      onClose();
    } catch {
      setError("Não foi possível criar o lead. Tente novamente.");
    } finally {
      setCreatingLead(false);
    }
  }

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6">
      <div className="w-full max-w-2xl max-h-[88vh] rounded-2xl bg-white shadow-xl flex flex-col overflow-hidden">
        {/* Cabeçalho fixo */}
        <div className="flex items-start justify-between gap-4 px-6 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Novo Lead</h2>
            <p className="text-sm text-gray-400">Preencha os dados do lead</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Conteúdo com rolagem controlada */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-6 py-5">
          {showNewClientForm ? (
            <div className="space-y-5">
              <button
                type="button"
                onClick={handleCancelNewClientForm}
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                <ArrowLeft size={16} />
                Voltar para busca de cliente
              </button>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-gray-900">
                    Cadastrar novo cliente
                  </h3>

                  <p className="text-sm text-gray-500">
                    Salve o cliente para continuar o cadastro do lead.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Nome completo <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={newClientName}
                      onChange={(event) => setNewClientName(event.target.value)}
                      placeholder="Nome do cliente"
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">
                      Telefone <span className="text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <Phone
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="text"
                        value={newClientPhone}
                        onChange={(event) =>
                          setNewClientPhone(event.target.value)
                        }
                        placeholder="11999999999"
                        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-4 text-sm
                                   focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        E-mail
                      </label>

                      <div className="relative">
                        <Mail
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          type="email"
                          value={newClientEmail}
                          onChange={(event) =>
                            setNewClientEmail(event.target.value)
                          }
                          placeholder="cliente@email.com"
                          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-4 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">
                        CPF
                      </label>

                      <div className="relative">
                        <IdCard
                          size={14}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                          type="text"
                          value={newClientCpf}
                          onChange={(event) =>
                            setNewClientCpf(event.target.value)
                          }
                          placeholder="00000000000"
                          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-4 text-sm
                                     focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Cliente */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Cliente <span className="text-red-500">*</span>
                </label>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <User
                      size={15}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      type="text"
                      value={clientSearch}
                      onChange={(event) => {
                        setClientSearch(event.target.value);
                        setSelectedClient(null);
                        setCustomerId("");
                        setSource("");
                        setSelectedItem(null);
                        setItemSearch("");
                        setClients([]);
                        setShowClientList(false);
                        setClientSearchFinished(false);
                        setError(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleSearchClients();
                        }
                      }}
                      placeholder="Busque pelo nome ou CPF do cliente..."
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-10 text-sm text-gray-800
                                 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                    />

                    {selectedClient && (
                      <button
                        type="button"
                        onClick={handleClearSelectedClient}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label="Remover cliente selecionado"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleSearchClients}
                    disabled={loadingClients || clientSearch.trim().length < 2}
                    className="rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700
                               hover:bg-blue-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loadingClients ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      "Buscar"
                    )}
                  </button>
                </div>

                {selectedClient && (
                  <div className="mt-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedClient.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {selectedClient.phone}
                      {selectedClient.email ? ` • ${selectedClient.email}` : ""}
                    </p>
                  </div>
                )}

                {showClientList && !selectedClient && (
                  <div className="mt-2 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                    {loadingClients ? (
                      <div className="px-4 py-4 text-center text-sm text-gray-400">
                        Buscando clientes...
                      </div>
                    ) : clients.length > 0 ? (
                      clients.map((client) => (
                        <button
                          type="button"
                          key={client.id}
                          onClick={() => handleSelectClient(client)}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-b-0"
                        >
                          <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold">
                            {client.name.slice(0, 2).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {client.name}
                            </p>

                            <p className="text-xs text-gray-400 truncate">
                              {client.phone}
                              {client.email ? ` • ${client.email}` : ""}
                            </p>
                          </div>
                        </button>
                      ))
                    ) : clientSearchFinished ? (
                      <div className="px-4 py-4 text-center">
                        <p className="text-sm text-gray-400">
                          Nenhum cliente encontrado.
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          Você pode cadastrar um novo cliente para continuar.
                        </p>

                        <button
                          type="button"
                          onClick={handleOpenNewClientForm}
                          className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                        >
                          Cadastrar novo cliente
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>

              {!hasSelectedClient && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  <div className="flex items-start gap-2">
                    <Search size={16} className="mt-0.5 shrink-0" />
                    <span>
                      Busque e selecione um cliente existente. Se ele não existir,
                      use o botão de cadastrar novo cliente.
                    </span>
                  </div>
                </div>
              )}

              {canFillLeadData && (
                <>
                  {/* Origem */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                      Origem <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={source}
                      onChange={(event) => setSource(event.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800
                                 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                    >
                      <option value="">Selecionar origem...</option>

                      {LEAD_ORIGINS.map((origin) => (
                        <option key={origin} value={origin}>
                          {origin}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Produto / veículo */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                      Veículo / Produto de interesse{" "}
                      <span className="normal-case font-medium text-gray-400">
                        opcional
                      </span>
                    </label>

                    <div className="relative">
                      <Package
                        size={15}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      />

                      <input
                        type="text"
                        value={itemSearch}
                        onChange={(event) => {
                          const value = event.target.value;

                          setItemSearch(value);
                          setSelectedItem(null);
                          setItemSearchFinished(false);
                          setItemError(null);
                          setError(null);

                          if (value.trim().length >= 2) {
                            setShowItemList(true);
                          } else {
                            setItems([]);
                            setShowItemList(false);
                          }
                        }}
                        placeholder="Comece digitando a referência ou nome do produto..."
                        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-10 text-sm text-gray-800
                                   focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                      />

                      {loadingItems && items.length === 0 && (
                        <Loader2
                          size={16}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
                        />
                      )}

                      {selectedItem && (
                        <button
                          type="button"
                          onClick={handleClearSelectedItem}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          aria-label="Remover item selecionado"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    {/* Preview grande do veículo selecionado com placeholder */}
                    {selectedItem ? (
                      <div className="mt-2 overflow-hidden rounded-2xl border border-blue-100 bg-white">
                        <div className="h-36 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                          <div className="text-center">
                            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                              <Car size={28} />
                            </div>

                            <div className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-400 border border-gray-100">
                              <ImageIcon size={12} />
                              Imagem do veículo
                            </div>
                          </div>
                        </div>

                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {selectedItem.description}
                              </p>

                              <p className="mt-1 text-xs text-gray-500">
                                {selectedItem.reference_code
                                  ? `Ref: ${selectedItem.reference_code}`
                                  : "Sem referência"}
                                {selectedItem.value
                                  ? ` • ${formatCurrency(selectedItem.value)}`
                                  : ""}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={handleClearSelectedItem}
                              className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : itemSearch.trim().length >= 2 ? (
                      /*
                        Área fixa de resultados.

                        Ela só aparece depois que o usuário começa a digitar.
                        Antes disso, não aparece caixa grande vazia.
                      */
                      <div className="mt-2 h-44 rounded-xl border border-gray-100 bg-white overflow-hidden">
                        {showItemList && items.length > 0 ? (
                          <div
                            className="h-full overflow-y-auto"
                            onWheel={(event) => event.stopPropagation()}
                          >
                            {items.map((item) => (
                              <button
                                type="button"
                                key={item.id}
                                onClick={() => handleSelectItem(item)}
                                className="w-full min-h-[64px] flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-b-0"
                              >
                                <div className="w-9 h-9 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center shrink-0">
                                  <Package size={15} />
                                </div>

                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {item.description}
                                  </p>

                                  <p className="text-xs text-gray-400 truncate">
                                    {item.reference_code
                                      ? `Ref: ${item.reference_code}`
                                      : "Sem referência"}
                                    {item.value
                                      ? ` • ${formatCurrency(item.value)}`
                                      : ""}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : loadingItems ? (
                          <div className="h-full flex items-center justify-center text-sm text-gray-400">
                            <Loader2 size={16} className="animate-spin mr-2" />
                            Buscando itens...
                          </div>
                        ) : itemError ? (
                          <div className="h-full flex items-center justify-center px-4 text-center text-sm text-red-500">
                            {itemError}
                          </div>
                        ) : itemSearchFinished ? (
                          <div className="h-full flex items-center justify-center text-sm text-gray-400">
                            Nenhum item encontrado
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-sm text-gray-400">
                            Buscando itens...
                          </div>
                        )}
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          )}

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Rodapé fixo e contextual */}
        <div className="grid grid-cols-2 gap-3 px-6 py-4 border-t border-gray-100 bg-white shrink-0">
          <button
            type="button"
            onClick={showNewClientForm ? handleCancelNewClientForm : onClose}
            className="rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            {showNewClientForm ? "Voltar" : "Cancelar"}
          </button>

          <button
            type="button"
            onClick={handleFooterAction}
            disabled={isFooterButtonDisabled}
            className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white
                       hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {(creatingLead || creatingClient) && (
              <Loader2 size={16} className="inline mr-2 animate-spin" />
            )}
            {footerButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}