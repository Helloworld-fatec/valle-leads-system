// src/components/sales-funnel/NegotiationModal.tsx
import { useEffect, useState } from "react";
import { useNegotiationsService } from "../../services/negotiationsService";
import { 
  X, 
  Clock, 
  Activity 
} from "lucide-react";
import type {
  StatusHistoryItem,
  StageHistoryItem,
} from "../../types/negotiations";

const STATUS_LABEL: Record<string, string> = {
  new:  "Novo",
  open: "Aberta",
  won:  "Ganho",
  lost: "Perdido",
};

const STAGE_LABEL: Record<string, string> = {
  contato_inicial:       "Contato Inicial",
  qualificacao:          "Qualificação",
  visita:                "Visita",
  proposta:              "Proposta",
  negociacao:            "Negociação",
  fechamento_com_venda:  "Fechamento c/ Venda",
  fechamento_sem_venda:  "Fechamento s/ Venda",
};

interface Props {
  negotiationId: string;
  onClose: () => void;
}

export default function NegotiationModal({ 
  negotiationId, 
  onClose
}: Props) {
  const { getStatusHistory, getStageHistory } = useNegotiationsService();

  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);
  const [stageHistory, setStageHistory]   = useState<StageHistoryItem[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      getStatusHistory(negotiationId),
      getStageHistory(negotiationId),
    ])
      .then(([status, stage]) => {
        setStatusHistory(status);
        setStageHistory(stage);
      })
      .catch(() => setError("Erro ao carregar detalhes da negociação."))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negotiationId]);

  // Fechar o modal com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Activity size={18} className="text-blue-500" />
            Detalhes da Negociação
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Corpo do Modal (Loading / Erro / Conteúdo) */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-400">Carregando informações...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              
              {/* Linha do Tempo (Timeline) de Etapas */}
              <section>
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-slate-400" />
                  Histórico de Etapas
                </h3>
                <div className="relative pl-4 border-l-2 border-slate-100 space-y-6">
                  {stageHistory.length === 0 ? (
                    <p className="text-sm text-slate-400 ml-2">Nenhuma movimentação registrada.</p>
                  ) : (
                    stageHistory.map((h) => (
                      <div key={h.id} className="relative">
                        {/* Timeline dot */}
                        <div className="absolute -left-5.25 top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
                        <div className="ml-2">
                          <p className="text-sm text-slate-700">
                            Movido de <span className="font-medium text-slate-900">{h.old_stage ? (STAGE_LABEL[h.old_stage] ?? h.old_stage) : "Início"}</span> para <span className="font-medium text-blue-600">{STAGE_LABEL[h.new_stage] ?? h.new_stage}</span>
                          </p>
                          <span className="text-xs text-slate-400 mt-0.5 block">
                            {new Date(h.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Histórico de Status */}
              <section>
                <h3 className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Activity size={16} className="text-slate-400" />
                  Histórico de Status
                </h3>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-3">
                  {statusHistory.length === 0 ? (
                    <p className="text-sm text-slate-400">Nenhum status registrado.</p>
                  ) : (
                    statusHistory.map((s) => (
                      <div key={s.id} className="flex justify-between items-center text-sm border-b border-slate-200/60 last:border-0 pb-2 last:pb-0">
                        <span className="text-slate-700 font-medium">
                          {STATUS_LABEL[s.status_negotiation] ?? s.status_negotiation}
                        </span>
                        <span className="text-slate-400 text-xs bg-white px-2 py-1 rounded-md border border-slate-100">
                          {new Date(s.created_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </section>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}