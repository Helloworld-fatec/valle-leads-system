// src/components/sales-funnel/NegotiationModal.tsx
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNegotiationsService } from "../../services/negotiationsService";
import { X, Clock, TrendingUp, ArrowRight, CheckCircle2, XCircle, Circle, Loader2 } from "lucide-react";
import type {
  StatusHistoryItem,
  StageHistoryItem,
} from "../../types/negotiations";

// ─── Mapeamentos de rótulos ───────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  new:  "Novo",
  open: "Aberta",
  won:  "Ganho",
  lost: "Perdido",
};

const STAGE_LABEL: Record<string, string> = {
  contato_inicial:      "Contato Inicial",
  qualificacao:         "Qualificação",
  visita:               "Visita",
  proposta:             "Proposta",
  negociacao:           "Negociação",
  fechamento_com_venda: "Fechamento c/ Venda",
  fechamento_sem_venda: "Fechamento s/ Venda",
};

// ─── Configuração visual por status ──────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  won: {
    label: "Ganho",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    icon: <CheckCircle2 size={13} />,
  },
  lost: {
    label: "Perdido",
    className: "bg-red-50 text-red-600 ring-1 ring-red-200",
    icon: <XCircle size={13} />,
  },
  open: {
    label: "Aberta",
    className: "bg-blue-50 text-blue-600 ring-1 ring-blue-200",
    icon: <Circle size={13} />,
  },
  new: {
    label: "Novo",
    className: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
    icon: <Circle size={13} />,
  },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  negotiationId: string;
  onClose: () => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function NegotiationModal({ negotiationId, onClose }: Props) {
  const { getStatusHistory, getStageHistory } = useNegotiationsService();

  const [statusHistory, setStatusHistory] = useState<StatusHistoryItem[]>([]);
  const [stageHistory, setStageHistory]   = useState<StageHistoryItem[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  // Busca histórico de status e etapas em paralelo
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
      .catch(() => setError("Não foi possível carregar os detalhes. Tente novamente."))
      .finally(() => setLoading(false));

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negotiationId]);

  // Fecha o modal ao pressionar ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // ─── Render ──────────────────────────────────────────────────────────────────

  // createPortal garante que o modal seja renderizado direto no document.body,
  // independente de onde o componente pai esteja na árvore — evita que o overlay
  // fique preso dentro de outro modal ou container com overflow/z-index limitado.
  return createPortal(
    // Overlay — z-[200] garante que fique acima de outros modais (ex: modal do lead com z-50)
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center bg-slate-900/60 backdrop-blur-md px-4 pb-4 pt-24"
      onClick={onClose}
    >
      {/* Container do modal */}
      <div
        className="relative w-full max-w-xl max-h-[78vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ boxShadow: "0 24px 64px -12px rgba(15,23,42,0.28), 0 0 0 1px rgba(15,23,42,0.06)" }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {/* Ícone com gradiente azul */}
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <TrendingUp size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-800 leading-tight">
                Detalhes da Negociação
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Histórico completo de etapas e status
              </p>
            </div>
          </div>

          {/* Botão fechar */}
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Corpo ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">

          {/* Estado: carregando */}
          {loading && (
            <div className="flex flex-col items-center justify-center h-48 gap-3">
              <Loader2 size={20} className="text-blue-500 animate-spin" />
              <p className="text-xs text-slate-400">Carregando informações...</p>
            </div>
          )}

          {/* Estado: erro */}
          {!loading && error && (
            <div className="m-5 p-4 bg-red-50 border border-red-100 rounded-xl text-center">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Estado: conteúdo */}
          {!loading && !error && (
            <div className="divide-y divide-slate-100">

              {/* ── Seção: Histórico de Etapas ── */}
              <div className="px-5 py-5">

                {/* Título da seção */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center">
                    <Clock size={11} className="text-slate-500" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Histórico de Etapas
                  </span>
                </div>

                {stageHistory.length === 0 ? (
                  <p className="text-sm text-slate-400 py-2">Nenhuma movimentação registrada.</p>
                ) : (
                  // Timeline vertical com linha conectora
                  <div className="relative">
                    {/* Linha vertical da timeline */}
                    <div className="absolute left-[7px] top-2 bottom-2 w-px bg-slate-100" />

                    <div className="space-y-1">
                      {stageHistory.map((h, index) => (
                        <div key={h.id} className="relative flex items-start gap-4 py-2.5">

                          {/* Ponto da timeline — primeiro item destaca em azul sólido */}
                          <div className={`
                            relative z-10 w-3.5 h-3.5 rounded-full shrink-0 mt-0.5
                            ${index === 0
                              ? "bg-blue-500 ring-2 ring-blue-100"
                              : "bg-white border-2 border-slate-200"}
                          `} />

                          <div className="flex-1 min-w-0">
                            {/* Etapas: origem → destino */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-sm text-slate-400 font-medium">
                                {h.old_stage
                                  ? (STAGE_LABEL[h.old_stage] ?? h.old_stage)
                                  : "Início"}
                              </span>
                              <ArrowRight size={11} className="text-slate-300 shrink-0" />
                              <span className={`text-sm font-semibold ${index === 0 ? "text-blue-600" : "text-slate-700"}`}>
                                {STAGE_LABEL[h.new_stage] ?? h.new_stage}
                              </span>
                            </div>

                            {/* Data e hora */}
                            <span className="text-xs text-slate-400 mt-0.5 block">
                              {new Date(h.created_at).toLocaleString("pt-BR", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* ── Seção: Histórico de Status ── */}
              <div className="px-5 py-5">

                {/* Título da seção */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center">
                    <TrendingUp size={11} className="text-slate-500" />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Histórico de Status
                  </span>
                </div>

                {statusHistory.length === 0 ? (
                  <p className="text-sm text-slate-400 py-2">Nenhum status registrado.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {statusHistory.map((s) => {
                      const config = STATUS_CONFIG[s.status_negotiation];
                      return (
                        <div
                          key={s.id}
                          className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50/80 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          {/* Badge de status com ícone semântico */}
                          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${config?.className ?? "bg-slate-100 text-slate-500 ring-1 ring-slate-200"}`}>
                            {config?.icon}
                            {config?.label ?? s.status_negotiation}
                          </span>

                          {/* Data e hora */}
                          <span className="text-xs text-slate-400 tabular-nums">
                            {new Date(s.created_at).toLocaleString("pt-BR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}