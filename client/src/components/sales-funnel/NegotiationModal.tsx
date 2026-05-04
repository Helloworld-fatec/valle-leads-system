import { useEffect, useState } from "react";
import { useNegotiationsService } from "../../services/negotiationsService";

type ImportanceLevel = "frio" | "morno" | "quente";

const IMPORTANCE_CONFIG: Record<ImportanceLevel, {label: string; color: string}> = {
  frio:   { label: "Frio",   color: "bg-blue-100 text-blue-700" },
  morno:  { label: "Morno",  color: "bg-yellow-100 text-yellow-700" },
  quente: { label: "Quente", color: "bg-red-100 text-red-700" },
};

interface Props {
    negotiationId: string;
    onClose: () => void;
}

export default function NegotiationModal({ negotiationId, onClose }: Props) {
    const { getStatusHistory, getStageHistory, getImportance } = useNegotiationsService();
    
    const [statusHistory, setStatusHistory]     = useState([]);
    const [stageHistory, setStageHistory]       = useState([]);
    const [importance, setImportance]           = useState<any>(null);
    const [loading, setLoading]                 = useState(true);

    useEffect(() => {
        Promise.all([
            getStatusHistory(negotiationId),
            getStageHistory(negotiationId),
            getImportance(negotiationId),
        ]).then(([status, stage, imp]) => {
            setStatusHistory(status.data ?? []);
            setStageHistory(stage.data ?? []);
            setImportance(imp.data ?? null);
        }).finally(() => setLoading(false));
    }, [negotiationId]);

    const imp = importance ? IMPORTANCE_CONFIG[importance.importance as ImportanceLevel] : null;

    return(
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400 text-center py-8">Carregando...</p>
        ) : (
          <div className="flex flex-col gap-6">

            {/* Importância */}
            {imp && (
              <section>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Importância</h3>
                <span className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${imp.color}`}>
                  🔥 {imp.label}
                </span>
              </section>
            )}

            {/* Histórico de Status */}
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Histórico de Status</h3>
              <ul className="flex flex-col gap-2">
                {statusHistory.length === 0 && (
                  <li className="text-xs text-gray-400">Nenhum status registrado.</li>
                )}
                {statusHistory.map((s: any) => (
                  <li key={s.id} className="flex justify-between text-sm border-b pb-1">
                    <span className="text-gray-700">{s.status}</span>
                    <span className="text-gray-400 text-xs">
                      {new Date(s.created_at).toLocaleString("pt-BR")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Histórico de Etapas */}
            <section>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Histórico de Etapas</h3>
              <ul className="flex flex-col gap-2">
                {stageHistory.length === 0 && (
                  <li className="text-xs text-gray-400">Nenhuma mudança de etapa registrada.</li>
                )}
                {stageHistory.map((h: any) => (
                  <li key={h.id} className="text-sm border-b pb-1">
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="text-gray-400">{h.old_status ?? "—"}</span>
                      <span>→</span>
                      <span className="font-medium">{h.new_status}</span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(h.created_at).toLocaleString("pt-BR")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

          </div>
        )}
      </div>
    </div>
    );
}