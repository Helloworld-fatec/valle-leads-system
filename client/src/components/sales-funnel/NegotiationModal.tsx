// src/components/sales-funnel/NegotiationModal.tsx
import { useEffect, useState } from "react";
import { useNegotiationsService } from "../../services/negotiationsService";
import type {
  StatusHistoryItem,
  StageHistoryItem,
  ImportanceItem,
  ImportanceLevel,
} from "../../types/negotiations";

const IMPORTANCE_CONFIG: Record<ImportanceLevel, { label: string; color: string }> = {
  frio:   { label: "Frio",   color: "bg-blue-100 text-blue-700"    },
  morno:  { label: "Morno",  color: "bg-yellow-100 text-yellow-700" },
  quente: { label: "Quente", color: "bg-red-100 text-red-700"      },
};

const STATUS_LABEL: Record<string, string> = {
  open:   "Aberta",
  closed: "Encerrada",
};

const STAGE_LABEL: Record<string, string> = {
  qualificacao:          "Qualificação",
  contato_inicial:       "Contato Inicial",
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

export default function NegotiationModal({ negotiationId, onClose }: Props) {
  const { getStatusHistory, getStageHistory, getImportanceHistory } =
    useNegotiationsService();

  const [statusHistory,     setStatusHistory]     = useState<StatusHistoryItem[]>([]);
  const [stageHistory,      setStageHistory]       = useState<StageHistoryItem[]>([]);
  const [currentImportance, setCurrentImportance] = useState<ImportanceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      getStatusHistory(negotiationId),
      getStageHistory(negotiationId),
      getImportanceHistory(negotiationId),
    ])
      .then(([status, stage, importance]) => {
        setStatusHistory(status);
        setStageHistory(stage);
        // Importância é histórico — o estado atual é o último item
        setCurrentImportance(
          importance.length > 0 ? importance[importance.length - 1] : null
        );
      })
      .catch(() => setError("Erro ao carregar detalhes da negociação."))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [negotiationId]);

  const imp = currentImportance
    ? IMPORTANCE_CONFIG[currentImportance.importance]
    : null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">Detalhes da Negociação</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Carregando...</p>
        ) : error ? (
          <p className="text-sm text-red-500 text-center py-8">{error}</p>
        ) : (
          <div className="flex flex-col gap-6">

            {/* Importância atual */}
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Importância
              </h3>
              {imp ? (
                <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${imp.color}`}>
                  🔥 {imp.label}
                </span>
              ) : (
                <p className="text-xs text-gray-400">Não definida.</p>
              )}
            </section>

            {/* Histórico de Status */}
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Histórico de Status
              </h3>
              <ul className="flex flex-col gap-2">
                {statusHistory.length === 0 ? (
                  <li className="text-xs text-gray-400">Nenhum status registrado.</li>
                ) : (
                  statusHistory.map((s) => (
                    <li key={s.id} className="flex justify-between items-center text-sm border-b pb-1">
                      <span className="text-gray-700 font-medium">
                        {/* campo real: status_negotiation */}
                        {STATUS_LABEL[s.status_negotiation] ?? s.status_negotiation}
                      </span>
                      <span className="text-gray-400 text-xs">
                        {new Date(s.created_at).toLocaleString("pt-BR")}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </section>

            {/* Histórico de Etapas */}
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Histórico de Etapas
              </h3>
              <ul className="flex flex-col gap-2">
                {stageHistory.length === 0 ? (
                  <li className="text-xs text-gray-400">Nenhuma mudança de etapa registrada.</li>
                ) : (
                  stageHistory.map((h) => (
                    <li key={h.id} className="text-sm border-b pb-2">
                      <div className="flex items-center gap-2 text-gray-700">
                        <span className="text-gray-400">
                          {/* campo real: old_stage */}
                          {h.old_stage ? (STAGE_LABEL[h.old_stage] ?? h.old_stage) : "—"}
                        </span>
                        <span>→</span>
                        <span className="font-medium">
                          {/* campo real: new_stage */}
                          {STAGE_LABEL[h.new_stage] ?? h.new_stage}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(h.created_at).toLocaleString("pt-BR")}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </section>

          </div>
        )}
      </div>
    </div>
  );
}