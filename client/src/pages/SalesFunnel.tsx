// src/pages/SalesFunnel.tsx
import { useEffect, useState } from "react";
import { useAuth } from "../hook/useAuth";
import { useNegotiationsService } from "../services/negotiationsService";
import { useLeadService } from "../services/leadService";
import KanbanBoard from "../components/sales-funnel/kanbanBoard";
import ClosedNegotiationsList from "../components/sales-funnel/ClosedNegotiationsList";
import type { Negotiation, ImportanceLevel } from "../types/negotiations";
import { RefreshCw, Plus, Search, Filter, AlertCircle } from "lucide-react";

export default function SalesFunnel() {
  const { user } = useAuth();
  const { getNegotiations, createImportance } = useNegotiationsService();
  const { getAllLeads } = useLeadService();

  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  
  // Estados para busca e criação de negociação
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    loadFunnel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  function loadFunnel() {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    Promise.all([
      getNegotiations({ attendant_id: user.id, is_open: true }),
      getAllLeads({ attendant_id: user.id }),
    ])
      .then(([negs, leads]) => {
        // O embed `lead` que vem em /negotiations costuma estar incompleto
        // (sem o interesse e, às vezes, sem customers). Mesclamos aqui os
        // dados completos vindos do leadService usando o lead_id.
        const leadMap = new Map(leads.map((l) => [l.id, l]));
        const enriched: Negotiation[] = negs.map((n) => {
          const fullLead = leadMap.get(n.lead_id);
          if (!fullLead) return n;
          // O interesse do lead vem em interest_item (descrição/código).
          // Normalizamos para o texto que o card consome via vehicle_interest.
          const vehicleInterest =
            fullLead.interest_item?.description ??
            fullLead.interest_item?.reference_code ??
            null;
          return {
            ...n,
            lead: {
              ...(n.lead ?? {}),
              id: fullLead.id,
              source: fullLead.source ?? undefined,
              customers: fullLead.customers ?? n.lead?.customers ?? undefined,
              vehicle_interest: vehicleInterest,
            },
          };
        });
        setNegotiations(enriched);
      })
      .catch(() => setError("Erro ao carregar as negociações. Tente novamente."))
      .finally(() => setLoading(false));
  }

  // --- HANDLERS DE AÇÃO (passados ao KanbanBoard) ---

  const handleChangeImportance = async (id: string, level: ImportanceLevel) => {
    // Optimistic Update
    setNegotiations(prev => prev.map(n => {
      if (n.id === id) {
        return {
          ...n,
          importance_history: [
            ...(n.importance_history ?? []),
            {
              id: "temp-importance",
              negotiation_id: id,
              importance: level,
              notes: null,
              created_at: new Date().toISOString()
            }
          ]
        };
      }
      return n;
    }));

    try {
      await createImportance({ negotiation_id: id, importance: level });
    } catch {
      // Reverter em caso de erro
      loadFunnel();
      alert("Erro ao alterar a importância.");
    }
  };

  const handleCreateNew = () => {
    setIsFormOpen(true);
  };

  // Filtro local pelo nome do cliente ou veículo
  const filteredNegotiations = negotiations.filter(n => {
    const clientName = n.lead?.customers?.name?.toLowerCase() || "";
    const vehicle = n.lead?.vehicle_interest?.toLowerCase() || "";
    const term = searchTerm.toLowerCase();
    return clientName.includes(term) || vehicle.includes(term);
  });

  // --- RENDERIZAÇÃO CONDICIONAL (LOADING / ERROR) ---

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <span className="text-sm text-slate-500 font-medium">Sincronizando funil de vendas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-red-100 max-w-sm">
          <AlertCircle className="mx-auto text-red-500 mb-3" size={32} />
          <p className="text-slate-700 text-sm font-medium mb-4">{error}</p>
          <button
            onClick={loadFunnel}
            className="flex items-center gap-2 mx-auto text-sm bg-red-50 text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-100 transition-colors"
          >
            <RefreshCw size={14} />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-2rem)] p-6 bg-slate-50 min-w-0">
      
      {/* Header Profissional (Estilo Linear / Jira) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Funil de Vendas
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {negotiations.length} negociaç{negotiations.length !== 1 ? "ões" : "ão"} em andamento
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Barra de Busca Rápida */}
          <div className="relative group hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Buscar cliente ou veículo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg w-64 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
            />
          </div>

          <button className="p-2 text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Filter size={18} />
          </button>

          <button 
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Nova Negociação
          </button>
        </div>
      </div>

      {/* Container Principal do Board */}
      <div className="h-[75vh] overflow-hidden min-h-0 bg-slate-50 shrink-0">
        {filteredNegotiations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center bg-white rounded-2xl border border-dashed border-slate-300 mx-2">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Search size={28} className="text-slate-400" />
            </div>
            <h3 className="text-slate-700 font-semibold mb-1">Nenhuma negociação encontrada</h3>
            <p className="text-slate-400 text-sm max-w-sm">
              {searchTerm ? "Tente buscar com outros termos." : "Crie uma nova negociação para começar a movimentar seu funil de vendas."}
            </p>
          </div>
        ) : (
          <KanbanBoard 
            negotiations={filteredNegotiations} 
            onUpdate={setNegotiations} 
            onChangeImportance={handleChangeImportance}
          />
        )}
      </div>

      {/* Lista de Negociações Encerradas (logo abaixo do board) */}
      <div className="mt-8">
        <ClosedNegotiationsList />
      </div>

      {/* Modal de Criação (Placeholder para o seu componente de formulário) */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold mb-4">
              Nova Negociação
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              Aqui entra o seu formulário de criação. Ao salvar, chame
              <code className="mx-1 px-1 rounded bg-slate-100 text-slate-700">openNegotiation</code>
              (do negotiationsService): ele cria a negociação e já registra o
              estágio inicial "Contato Inicial".
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}