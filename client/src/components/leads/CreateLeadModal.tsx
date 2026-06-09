import { useState, useEffect } from "react";
import { X, Loader2, User, Package } from "lucide-react";
import { useAuth } from "../../hook/useAuth";
import { useLeadService } from "../../services/leadService";
import type { CreateLeadDTO } from "../../services/leadService";
import { useClientService } from "../../services/clientService";
import type { Client, CreateClientDTO } from "../../services/clientService";
import { useItemService } from "../../services/itemService";
import type { InterestItem } from "../../services/itemService";

const SOURCES = [
  "Instagram",
  "WhatsApp",
  "Facebook",
  "Loja Física",
  "Indicação",
  "Mercado Livre",
  "Site",
  "Telefone",
];

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateLeadModal({ onClose, onCreated }: Props) {
  const { user } = useAuth();
  const { createLead } = useLeadService();
  const { getClients, createClient } = useClientService();
  const { getItems } = useItemService();

  const [source, setSource] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [interestItemId, setInterestItemId] = useState("");

  const [clientSearch, setClientSearch] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientList, setShowClientList] = useState(false);

  const [showNewClientForm, setShowNewClientForm] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientCpf, setNewClientCpf] = useState("");

  const [itemSearch, setItemSearch] = useState("");
  const [items, setItems] = useState<InterestItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InterestItem | null>(null);
  const [showItemList, setShowItemList] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedClient) return;

    if (clientSearch.trim().length < 2) {
      setClients([]);
      setShowClientList(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingClients(true);

        const res = await getClients({
          name: clientSearch.trim(),
          is_active: true,
          limit: 10,
        });

        setClients(res.data ?? []);
        setShowClientList(true);
      } catch {
        setClients([]);
        setShowClientList(true);
      } finally {
        setLoadingClients(false);
      }
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientSearch, selectedClient]);

  useEffect(() => {
    if (selectedItem) return;

    if (itemSearch.trim().length < 2) {
      setItems([]);
      setShowItemList(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoadingItems(true);

        const term = itemSearch.trim();
        const isOnlyNumbers = /^\d+$/.test(term);

        const res = await getItems({
          ...(isOnlyNumbers ? { reference_code: term } : { description: term }),
          limit: 10,
        });

        setItems(res.data ?? []);
        setShowItemList(true);
      } catch {
        setItems([]);
        setShowItemList(true);
      } finally {
        setLoadingItems(false);
      }
    }, 400);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemSearch, selectedItem]);

  async function handleCreateClient() {
  if (!newClientName.trim()) {
    setError("Informe o nome do cliente.");
    return;
  }

  if (!newClientPhone.trim()) {
    setError("Informe o telefone do cliente.");
    return;
  }

  const cleanPhone = newClientPhone.replace(/\D/g, "");
  const cleanCpf = newClientCpf.replace(/\D/g, "");
  const cleanEmail = newClientEmail.trim();

  if (cleanPhone.length < 10 || cleanPhone.length > 11) {
    setError("Informe um telefone válido com DDD.");
    return;
  }

  if (cleanCpf.length > 0) {
    if (cleanCpf.length !== 11 || /^(\d)\1{10}$/.test(cleanCpf)) {
      setError("Informe um CPF válido com 11 dígitos ou deixe o campo vazio.");
      return;
    }
  }

  const payload: CreateClientDTO = {
    name: newClientName.trim(),
    phone: cleanPhone,
    email: cleanEmail || undefined,
    cpf: cleanCpf || undefined,
    is_active: true,
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

    setClientSearch("");
    setClients([]);
    setShowClientList(false);
    setShowNewClientForm(false);

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

  async function handleSubmit() {
    if (!customerId) {
      setError("Selecione um cliente.");
      return;
    }

    if (selectedClient?.is_active === false) {
      setError("Não é possível criar um lead para um cliente inativo.");
      return;
    }

    const currentUser = user as any;
    const teamId = currentUser?.team_ids?.[0] ?? currentUser?.team_id;

    const payload: CreateLeadDTO = {
      source: source || undefined,
      customer_id: customerId,
      attendant_id: user?.id,
      interest_item_id: interestItemId || undefined,
      team_id: teamId || undefined,
    };

    try {
      setLoading(true);
      setError(null);

      await createLead(payload);

      onCreated();
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao criar lead.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Novo Lead</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Preencha os dados do lead
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-400"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Cliente */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Cliente <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                <User size={14} className="text-gray-400 shrink-0" />

                {selectedClient ? (
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedClient.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {selectedClient.phone ||
                          selectedClient.email ||
                          "Sem contato"}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClient(null);
                        setCustomerId("");
                        setClientSearch("");
                        setClients([]);
                        setShowClientList(false);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={clientSearch}
                    onChange={(e) => {
                      setClientSearch(e.target.value);
                      setError(null);
                    }}
                    placeholder="Buscar por nome..."
                    className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
                  />
                )}

                {loadingClients && (
                  <Loader2
                    size={14}
                    className="animate-spin text-blue-500 shrink-0"
                  />
                )}
              </div>

              {/* Dropdown clientes */}
              {showClientList && clients.length > 0 && !selectedClient && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden max-h-48 overflow-y-auto">
                  {clients.map((c) => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => {
                        setSelectedClient(c);
                        setCustomerId(c.id);
                        setShowClientList(false);
                        setClientSearch("");
                        setClients([]);
                        setError(null);
                      }}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-50 last:border-0"
                    >
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold shrink-0">
                        {c.name?.[0]?.toUpperCase() ?? "C"}
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {c.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {c.phone || c.email || "Sem contato"}
                          {c.cpf ? ` · ${c.cpf}` : ""}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Nenhum cliente encontrado */}
              {showClientList &&
                clients.length === 0 &&
                !loadingClients &&
                clientSearch.trim().length >= 2 &&
                !selectedClient && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4 text-center">
                    <p className="text-sm text-gray-400 mb-3">
                      Nenhum cliente encontrado
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        setShowNewClientForm(true);
                        setNewClientName(clientSearch);
                        setShowClientList(false);
                      }}
                      className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                    >
                      Cadastrar novo cliente
                    </button>
                  </div>
                )}
            </div>
          </div>

          {/* Formulário novo cliente */}
          {showNewClientForm && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Cadastrar novo cliente
                  </h3>
                  <p className="text-xs text-gray-500">
                    Nome e telefone são obrigatórios.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowNewClientForm(false)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Nome completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Ex: Maria Silva"
                  className="w-full text-sm py-2 px-3 border border-gray-200 rounded-lg bg-white text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="Ex: 11999999999"
                  className="w-full text-sm py-2 px-3 border border-gray-200 rounded-lg bg-white text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="cliente@email.com"
                    className="w-full text-sm py-2 px-3 border border-gray-200 rounded-lg bg-white text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    value={newClientCpf}
                    onChange={(e) => setNewClientCpf(e.target.value)}
                    placeholder="00000000000"
                    className="w-full text-sm py-2 px-3 border border-gray-200 rounded-lg bg-white text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateClient}
                disabled={creatingClient}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {creatingClient ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Cadastrando...
                  </>
                ) : (
                  "Salvar cliente"
                )}
              </button>
            </div>
          )}

          {/* Origem */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Origem
            </label>

            <select
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-full text-sm py-2.5 px-3 border border-gray-200 rounded-xl bg-white text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all appearance-none"
            >
              <option value="">Selecionar origem...</option>
              {SOURCES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Produto / Item de Interesse */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Veículo / Produto de Interesse
              <span className="text-gray-400 font-normal normal-case">
                {" "}
                opcional
              </span>
            </label>

            <div className="relative">
              <div className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                <Package size={14} className="text-gray-400 shrink-0" />

                {selectedItem ? (
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {selectedItem.description || "Item sem descrição"}
                      </p>

                      {selectedItem.reference_code && (
                        <p className="text-xs text-gray-400">
                          Ref: {selectedItem.reference_code}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedItem(null);
                        setInterestItemId("");
                        setItemSearch("");
                        setItems([]);
                        setShowItemList(false);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={itemSearch}
                    onChange={(e) => {
                      setItemSearch(e.target.value);
                      setError(null);
                    }}
                    placeholder="Digite a referência ou nome do produto..."
                    className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
                  />
                )}

                {loadingItems && (
                  <Loader2
                    size={14}
                    className="animate-spin text-blue-500 shrink-0"
                  />
                )}
              </div>

              {/* Dropdown itens */}
              {showItemList && items.length > 0 && !selectedItem && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden max-h-48 overflow-y-auto">
                  {items.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => {
                        setSelectedItem(item);
                        setInterestItemId(item.id);
                        setShowItemList(false);
                        setItemSearch("");
                        setItems([]);
                        setError(null);
                      }}
                      className="w-full flex items-start gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-50 last:border-0"
                    >
                      <Package
                        size={14}
                        className="text-gray-400 mt-0.5 shrink-0"
                      />

                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.description || "Item sem descrição"}
                        </p>

                        {item.reference_code && (
                          <p className="text-xs text-gray-400">
                            Ref: {item.reference_code}
                          </p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {showItemList &&
                items.length === 0 &&
                !loadingItems &&
                itemSearch.trim().length >= 2 &&
                !selectedItem && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4 text-center">
                    <p className="text-sm text-gray-400">
                      Nenhum item encontrado
                    </p>
                  </div>
                )}
            </div>
          </div>

          {/* Erro */}
          {error && (
            <div className="text-xs font-medium px-3 py-2 rounded-lg bg-red-50 text-red-600 border border-red-100">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!customerId || loading || showNewClientForm || creatingClient}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Criando...
              </>
            ) : showNewClientForm ? (
              "Salve o cliente"
            ) : !customerId ? (
              "Selecione cliente"
            ) : (
              "Criar Lead"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}