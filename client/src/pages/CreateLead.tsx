// src/pages/CreateLead.tsx
// Página de criação de lead para MANAGER, GENERAL_MANAGER e ADMIN.
//
// MANAGER       → cria lead com team_id fixo (primeiro time do token),
//                 sem attendant_id (lead fica "solto na equipe").
// GENERAL_MANAGER / ADMIN → cria lead sem team_id e sem attendant_id
//                 (lead fica "solto no sistema"), com seletor de equipe
//                 opcional caso queiram já vincular.

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  IdCard,
  Package,
  Car,
  Image as ImageIcon,
  Search,
  Loader2,
  X,
  CheckCircle2,
  Building2,
} from "lucide-react";
import { useAuth } from "../hook/useAuth";
import { useClientService } from "../services/clientService";
import type { Client, CreateClientDTO } from "../services/clientService";
import { useLeadService } from "../services/leadService";
import type { InterestItem } from "../services/leadService";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const LEAD_ORIGINS = [
  "WhatsApp", "Instagram", "Facebook", "Indicação",
  "Loja Física", "Mercado Livre", "Site", "Google", "Telefone",
];

function onlyNumbers(v: string) { return v.replace(/\D/g, ""); }

function isInvalidCpf(cpf: string) {
  if (!cpf) return false;
  if (cpf.length !== 11) return true;
  if (/^(\d)\1{10}$/.test(cpf)) return true;
  return false;
}

function formatCurrency(value?: string | null) {
  if (!value) return null;
  const n = Number(value);
  if (Number.isNaN(n)) return value;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function normalizeList<T>(response: unknown): T[] {
  const data = response as any;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.data?.data)) return data.data.data;
  return [];
}

// ─── Tipos de step ────────────────────────────────────────────────────────────

type Step = "client" | "new-client" | "lead";

// ─── Componente ───────────────────────────────────────────────────────────────

export default function CreateLead() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getClients, createClient } = useClientService();
  const { createLead, getLeads } = useLeadService();

  const role = (user as any)?.role as string ?? "";
  const isGmOrAdmin = role === "GENERAL_MANAGER" || role === "ADMIN";
  const isManager   = role === "MANAGER";

  // Para MANAGER: extrai o primeiro team_id do token.
  const managerTeamId: string =
    (user as any)?.team_ids?.[0] ??
    (user as any)?.team_id ??
    "";

  // ─── Step ──────────────────────────────────────────────────────────────────

  const [step, setStep] = useState<Step>("client");

  // ─── Cliente ───────────────────────────────────────────────────────────────

  const [clientSearch, setClientSearch]           = useState("");
  const [clients, setClients]                     = useState<Client[]>([]);
  const [loadingClients, setLoadingClients]       = useState(false);
  const [clientSearchDone, setClientSearchDone]   = useState(false);
  const [showClientList, setShowClientList]       = useState(false);
  const [selectedClient, setSelectedClient]       = useState<Client | null>(null);

  // Novo cliente
  const [newName, setNewName]   = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newCpf, setNewCpf]     = useState("");
  const [savingClient, setSavingClient] = useState(false);

  // ─── Lead ──────────────────────────────────────────────────────────────────

  const [source, setSource]               = useState("");
  const [itemSearch, setItemSearch]       = useState("");
  const [items, setItems]                 = useState<InterestItem[]>([]);
  const [loadingItems, setLoadingItems]   = useState(false);
  const [showItemList, setShowItemList]   = useState(false);
  const [itemSearchDone, setItemSearchDone] = useState(false);
  const [selectedItem, setSelectedItem]   = useState<InterestItem | null>(null);
  const [itemError, setItemError]         = useState<string | null>(null);

  // ─── Equipe (opcional para GM/Admin) ───────────────────────────────────────

  const [teams, setTeams]             = useState<{ id: string; name: string }[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("");

  // ─── Estado geral ──────────────────────────────────────────────────────────

  const [error, setError]       = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [success, setSuccess]   = useState(false);

  // ─── Carrega equipes para GM/Admin ─────────────────────────────────────────

  useEffect(() => {
    if (!isGmOrAdmin) return;
    setLoadingTeams(true);
    fetch("/api/teams", {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    })
      .then((r) => r.json())
      .then((json) => {
        const list = Array.isArray(json) ? json : json?.data ?? [];
        setTeams(list.filter((t: any) => t.is_active !== false));
      })
      .catch(() => setTeams([]))
      .finally(() => setLoadingTeams(false));
  }, [isGmOrAdmin]);

  // ─── Busca automática de itens ─────────────────────────────────────────────

  useEffect(() => {
    const query = itemSearch.trim();
    if (step !== "lead" || query.length < 2 || selectedItem) {
      setItems([]);
      setShowItemList(false);
      setItemSearchDone(false);
      setItemError(null);
      setLoadingItems(false);
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        if (items.length === 0) setLoadingItems(true);
        setItemError(null);
        setItemSearchDone(false);

        const isRef = /^\d+$/.test(query);
        let result: InterestItem[] = [];

        const fetchItems = async (params: Record<string, string>) => {
          const qs = new URLSearchParams({ ...params, is_active: "true", page: "1", limit: "8" });
          const token = localStorage.getItem("access_token");
          const res = await fetch(`/api/interest-items?${qs}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const json = await res.json();
          return normalizeList<InterestItem>(json);
        };

        if (isRef) {
          result = await fetchItems({ reference_code: query });
          if (result.length === 0) result = await fetchItems({ description: query });
        } else {
          result = await fetchItems({ description: query });
        }

        if (cancelled) return;
        setItems(result);
        setShowItemList(true);
        setItemSearchDone(true);
      } catch {
        if (cancelled) return;
        setItems([]);
        setShowItemList(true);
        setItemSearchDone(true);
        setItemError("Não foi possível buscar itens.");
      } finally {
        if (!cancelled) setLoadingItems(false);
      }
    }, 400);

    return () => { cancelled = true; clearTimeout(timeout); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemSearch, selectedItem, step]);

  // ─── Handlers de cliente ───────────────────────────────────────────────────

  async function handleSearchClients() {
    const query = clientSearch.trim();
    if (query.length < 2) { setError("Digite pelo menos 2 caracteres."); return; }

    setLoadingClients(true);
    setError(null);
    setClientSearchDone(false);
    setSelectedClient(null);

    try {
      const digits = onlyNumbers(query);
      const isDigits = digits.length === query.length;
      const response = await getClients({
        name: isDigits ? undefined : query,
        cpf: isDigits ? digits : undefined,
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
      setClientSearchDone(true);
    }
  }

  function handleSelectClient(client: Client) {
    setSelectedClient(client);
    setClientSearch(client.name);
    setClients([]);
    setShowClientList(false);
    setClientSearchDone(false);
    setError(null);
  }

  function handleClearClient() {
    setSelectedClient(null);
    setClientSearch("");
    setClients([]);
    setShowClientList(false);
    setClientSearchDone(false);
    resetLeadFields();
    setError(null);
  }

  function resetLeadFields() {
    setSource("");
    setSelectedItem(null);
    setItemSearch("");
    setItems([]);
    setShowItemList(false);
    setItemSearchDone(false);
    setItemError(null);
  }

  async function handleSaveNewClient() {
    if (!newName.trim()) { setError("Informe o nome do cliente."); return; }
    if (!newPhone.trim()) { setError("Informe o telefone do cliente."); return; }

    const cleanPhone = onlyNumbers(newPhone);
    const cleanCpf   = onlyNumbers(newCpf);

    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      setError("Telefone inválido — informe DDD + número.");
      return;
    }
    if (isInvalidCpf(cleanCpf)) {
      setError("CPF inválido — informe 11 dígitos ou deixe em branco.");
      return;
    }

    const payload: CreateClientDTO = {
      name: newName.trim(),
      phone: cleanPhone,
      email: newEmail.trim() || undefined,
      cpf: cleanCpf || undefined,
    };

    try {
      setSavingClient(true);
      setError(null);
      const created = await createClient(payload);
      if (created.is_active === false) {
        setError("Cliente cadastrado, mas está inativo. Não é possível criar lead.");
        return;
      }
      handleSelectClient(created);
      setStep("lead");
      setNewName(""); setNewPhone(""); setNewEmail(""); setNewCpf("");
    } catch {
      setError("Não foi possível cadastrar o cliente. Verifique se telefone, CPF ou e-mail já existem.");
    } finally {
      setSavingClient(false);
    }
  }

  // ─── Handlers de item ──────────────────────────────────────────────────────

  function handleSelectItem(item: InterestItem) {
    setSelectedItem(item);
    setItemSearch(
      item.reference_code ? `${item.reference_code} - ${item.description}` : (item.description ?? "")
    );
    setItems([]);
    setShowItemList(false);
    setItemSearchDone(false);
    setItemError(null);
    setError(null);
  }

  function handleClearItem() {
    setSelectedItem(null);
    setItemSearch("");
    setItems([]);
    setShowItemList(false);
    setItemSearchDone(false);
    setItemError(null);
  }

  // ─── Criar lead ────────────────────────────────────────────────────────────

  async function handleCreateLead() {
    if (!selectedClient) { setError("Selecione um cliente."); return; }
    if (!source) { setError("Selecione a origem do lead."); return; }
    if (!selectedItem) { setError("Selecione o veículo / produto de interesse."); return; }
    if (itemSearch.trim() && !selectedItem) {
      setError("Selecione um item da lista ou limpe o campo de veículo.");
      return;
    }

    // Resolve team_id
    const resolvedTeamId = isManager
      ? managerTeamId
      : (selectedTeamId || undefined);

    if (isManager && !resolvedTeamId) {
      setError("Não foi possível identificar sua equipe. Contate o administrador.");
      return;
    }

    try {
      setCreating(true);
      setError(null);
      await createLead({
        customer_id: selectedClient.id,
        team_id: resolvedTeamId,
        source,
        status: "new",
        interest_item_id: selectedItem.id,
        // Sem attendant_id — lead fica solto na equipe (ou no sistema para GM/Admin)
      });
      setSuccess(true);
    } catch {
      setError("Não foi possível criar o lead. Tente novamente.");
    } finally {
      setCreating(false);
    }
  }

  // ─── Botão principal ───────────────────────────────────────────────────────

  const canProceed = useMemo(() => {
    if (step === "client") return Boolean(selectedClient);
    if (step === "new-client") return !savingClient;
    // step === "lead"
    return Boolean(source && selectedItem && !creating);
  }, [step, selectedClient, savingClient, source, selectedItem, creating]);

  // ─── Tela de sucesso ───────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-sm w-full text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            style={{ background: "#F0FDF4" }}
          >
            <CheckCircle2 size={32} style={{ color: "#16A34A" }} />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Lead criado!</h2>
          <p className="text-sm text-gray-500 mb-6">
            {isManager
              ? "O lead foi adicionado à equipe sem atendente. Atribua-o quando quiser."
              : "O lead foi criado no sistema sem equipe nem atendente."}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setSuccess(false);
                setSelectedClient(null);
                setClientSearch("");
                setStep("client");
                resetLeadFields();
              }}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              Criar outro lead
            </button>
            <button
              onClick={() => navigate(-1)}
              className="w-full rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={() => {
              if (step === "new-client") { setStep("client"); setError(null); return; }
              if (step === "lead") { setStep("client"); setError(null); return; }
              navigate(-1);
            }}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar
          </button>
          <div className="h-4 w-px bg-gray-200" />
          <div>
            <h1 className="text-base font-bold text-gray-900">Novo Lead</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {isManager
                ? "Lead sem atendente — será distribuído pela equipe"
                : "Lead sem equipe — será distribuído manualmente"}
            </p>
          </div>

          {/* Badge de contexto */}
          <div className="ml-auto">
            <span
              className="text-xs px-3 py-1.5 rounded-full font-semibold"
              style={
                isManager
                  ? { background: "#EFF6FF", color: "#1D4ED8" }
                  : { background: "#F5F3FF", color: "#6D28D9" }
              }
            >
              {isManager ? "Gerente" : "Gerente Geral / Admin"}
            </span>
          </div>
        </div>
      </div>

      {/* Progress ─────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-6 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-2">
          {(["client", "lead"] as const).map((s, i) => {
            const labels = ["Cliente", "Lead"];
            const isActive = (step === "new-client" && s === "client") || step === s;
            const isDone   =
              (s === "client" && (step === "lead")) ||
              false;
            return (
              <div key={s} className="flex items-center gap-2">
                {i > 0 && <div className="w-8 h-px bg-gray-200" />}
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                    style={
                      isDone
                        ? { background: "#16A34A", color: "#fff" }
                        : isActive
                        ? { background: "#2563EB", color: "#fff" }
                        : { background: "#F1F5F9", color: "#94A3B8" }
                    }
                  >
                    {isDone ? "✓" : i + 1}
                  </div>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: isActive ? "#111827" : "#9CA3AF" }}
                  >
                    {labels[i]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Conteúdo ─────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">

        {/* ── STEP: CLIENT ────────────────────────────────────── */}
        {(step === "client") && (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
                Cliente <span className="text-red-500">*</span>
              </h2>

              {selectedClient ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{selectedClient.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedClient.phone}
                      {selectedClient.email ? ` • ${selectedClient.email}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={handleClearClient}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                      <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={clientSearch}
                        onChange={(e) => {
                          setClientSearch(e.target.value);
                          setClients([]);
                          setShowClientList(false);
                          setClientSearchDone(false);
                          setError(null);
                        }}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearchClients(); } }}
                        placeholder="Nome ou CPF do cliente..."
                        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                      />
                    </div>
                    <button
                      onClick={handleSearchClients}
                      disabled={loadingClients || clientSearch.trim().length < 2}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loadingClients ? <Loader2 size={16} className="animate-spin" /> : "Buscar"}
                    </button>
                  </div>

                  {showClientList && (
                    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                      {loadingClients ? (
                        <div className="py-4 text-center text-sm text-gray-400">Buscando...</div>
                      ) : clients.length > 0 ? (
                        clients.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => handleSelectClient(c)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-b-0"
                          >
                            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                              {c.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                              <p className="text-xs text-gray-400 truncate">
                                {c.phone}{c.email ? ` • ${c.email}` : ""}
                              </p>
                            </div>
                          </button>
                        ))
                      ) : clientSearchDone ? (
                        <div className="px-4 py-4 text-center">
                          <p className="text-sm text-gray-400">Nenhum cliente encontrado.</p>
                          <button
                            onClick={() => setStep("new-client")}
                            className="mt-3 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                          >
                            Cadastrar novo cliente
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {!showClientList && (
                    <div className="mt-2 rounded-xl border border-gray-100 bg-slate-50 px-4 py-3 text-sm text-gray-400 flex items-center gap-2">
                      <Search size={14} className="shrink-0" />
                      Busque pelo nome ou CPF do cliente.
                    </div>
                  )}
                </>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                ⚠️ {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { if (selectedClient) { setStep("lead"); setError(null); } }}
                disabled={!selectedClient}
                className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Continuar
              </button>
            </div>
          </>
        )}

        {/* ── STEP: NEW CLIENT ─────────────────────────────────── */}
        {step === "new-client" && (
          <>
            <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">
                Cadastrar novo cliente
              </h2>
              <p className="text-xs text-gray-400 mb-5">
                Salve o cliente para continuar o cadastro do lead.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Nome completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nome do cliente"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">
                    Telefone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="11999999999"
                      className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">E-mail</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="cliente@email.com"
                        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">CPF</label>
                    <div className="relative">
                      <IdCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={newCpf}
                        onChange={(e) => setNewCpf(e.target.value)}
                        placeholder="00000000000"
                        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                ⚠️ {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setStep("client"); setError(null); }}
                className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleSaveNewClient}
                disabled={savingClient}
                className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingClient && <Loader2 size={14} className="inline mr-2 animate-spin" />}
                Salvar cliente
              </button>
            </div>
          </>
        )}

        {/* ── STEP: LEAD ───────────────────────────────────────── */}
        {step === "lead" && (
          <>
            {/* Cliente selecionado (readonly) */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {selectedClient?.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedClient?.name}</p>
                  <p className="text-xs text-gray-400">{selectedClient?.phone}</p>
                </div>
              </div>
              <button
                onClick={() => { setStep("client"); setError(null); }}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                Trocar
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

              {/* Equipe (opcional, só para GM/Admin) */}
              {isGmOrAdmin && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                    <Building2 size={12} className="inline mr-1 mb-0.5" />
                    Equipe{" "}
                    <span className="normal-case font-medium text-gray-400">opcional</span>
                  </label>
                  {loadingTeams ? (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Loader2 size={14} className="animate-spin" /> Carregando equipes...
                    </div>
                  ) : (
                    <select
                      value={selectedTeamId}
                      onChange={(e) => setSelectedTeamId(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                    >
                      <option value="">Sem equipe (lead solto no sistema)</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  )}
                  <p className="mt-1.5 text-xs text-gray-400">
                    Sem equipe: o lead ficará visível apenas para gerentes gerais e admins.
                  </p>
                </div>
              )}

              {/* Origem */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Origem <span className="text-red-500">*</span>
                </label>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                >
                  <option value="">Selecione a origem...</option>
                  {LEAD_ORIGINS.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              {/* Veículo / produto — obrigatório */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                  Veículo / Produto de interesse <span className="text-red-500">*</span>
                </label>

                <div className="relative">
                  <Package size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={itemSearch}
                    onChange={(e) => {
                      setItemSearch(e.target.value);
                      setSelectedItem(null);
                      setItemSearchDone(false);
                      setItemError(null);
                      setError(null);
                      if (e.target.value.trim().length >= 2) setShowItemList(true);
                      else { setItems([]); setShowItemList(false); }
                    }}
                    placeholder="Referência ou nome do veículo..."
                    className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                  />
                  {loadingItems && items.length === 0 && (
                    <Loader2 size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                  )}
                  {selectedItem && (
                    <button type="button" onClick={handleClearItem} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X size={16} />
                    </button>
                  )}
                </div>

                {selectedItem ? (
                  <div className="mt-2 overflow-hidden rounded-2xl border border-blue-100 bg-white">
                    <div className="h-28 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                      <div className="text-center">
                        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                          <Car size={24} />
                        </div>
                        <div className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-400 border border-gray-100">
                          <ImageIcon size={11} /> Imagem do veículo
                        </div>
                      </div>
                    </div>
                    <div className="p-4 flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{selectedItem.description}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {selectedItem.reference_code ? `Ref: ${selectedItem.reference_code}` : "Sem referência"}
                          {selectedItem.value ? ` • ${formatCurrency(selectedItem.value)}` : ""}
                        </p>
                      </div>
                      <button type="button" onClick={handleClearItem} className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50">
                        Remover
                      </button>
                    </div>
                  </div>
                ) : itemSearch.trim().length >= 2 ? (
                  <div className="mt-2 h-40 rounded-xl border border-gray-100 bg-white overflow-hidden">
                    {showItemList && items.length > 0 ? (
                      <div className="h-full overflow-y-auto" onWheel={(e) => e.stopPropagation()}>
                        {items.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleSelectItem(item)}
                            className="w-full min-h-14 flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-b-0"
                          >
                            <div className="w-8 h-8 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center shrink-0">
                              <Package size={14} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{item.description}</p>
                              <p className="text-xs text-gray-400 truncate">
                                {item.reference_code ? `Ref: ${item.reference_code}` : "Sem referência"}
                                {item.value ? ` • ${formatCurrency(item.value)}` : ""}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : loadingItems ? (
                      <div className="h-full flex items-center justify-center text-sm text-gray-400">
                        <Loader2 size={15} className="animate-spin mr-2" /> Buscando...
                      </div>
                    ) : itemError ? (
                      <div className="h-full flex items-center justify-center px-4 text-center text-sm text-red-500">{itemError}</div>
                    ) : itemSearchDone ? (
                      <div className="h-full flex items-center justify-center text-sm text-gray-400">Nenhum item encontrado</div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-sm text-gray-400">Buscando...</div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                ⚠️ {error}
              </div>
            )}

            {/* Info contextual */}
            <div
              className="rounded-xl px-4 py-3 text-xs flex items-start gap-2"
              style={{ background: "#F8FAFC", color: "#64748B" }}
            >
              <Building2 size={13} className="shrink-0 mt-0.5" />
              {isManager
                ? `Este lead será criado na equipe sem atendente específico. Você poderá atribuí-lo depois.`
                : selectedTeamId
                ? `Este lead será criado na equipe selecionada, sem atendente. Atribua-o depois.`
                : `Este lead ficará solto no sistema sem equipe. Atribua equipe e atendente depois.`
              }
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setStep("client"); setError(null); }}
                className="flex-1 rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleCreateLead}
                disabled={!canProceed}
                className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {creating && <Loader2 size={14} className="inline mr-2 animate-spin" />}
                Criar Lead
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}