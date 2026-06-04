// src/components/sales-funnel/kanbanBoard.tsx
import { useState } from "react";
import { useNegotiationsService } from "../../services/negotiationsService";
import NegotiationCard from "./NegotiationCard";
import type { Negotiation, NegotiationStage, ImportanceLevel } from "../../types/negotiations";
import { AlertCircle, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

type StageDef = {
  key: NegotiationStage;
  label: string;
  color: string;
  bg: string;
  border: string;
};

const STAGES: StageDef[] = [
  { key: "contato_inicial",      label: "Contato Inicial",      color: "#6366F1", bg: "#EEF2FF", border: "#C7D2FE" },
  { key: "qualificacao",         label: "Qualificação",         color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A" },
  { key: "visita",               label: "Visita",               color: "#3B82F6", bg: "#EFF6FF", border: "#BFDBFE" },
  { key: "proposta",             label: "Proposta",             color: "#8B5CF6", bg: "#F5F3FF", border: "#DDD6FE" },
  { key: "negociacao",           label: "Negociação",           color: "#F97316", bg: "#FFF7ED", border: "#FFEDD5" },
  { key: "fechamento_com_venda", label: "Fechamento c/ Venda",  color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0" },
  { key: "fechamento_sem_venda", label: "Fechamento s/ Venda",  color: "#EF4444", bg: "#FEF2F2", border: "#FECACA" },
];

const CLOSING_STAGES = new Set<NegotiationStage>(["fechamento_com_venda", "fechamento_sem_venda"]);

// STAGES continua sendo a fonte de verdade para indexação/avanço;
// estas listas são usadas apenas na renderização para separar visualmente.
const PIPELINE_STAGES = STAGES.filter((s) => !CLOSING_STAGES.has(s.key));
const CLOSING_STAGE_LIST = STAGES.filter((s) => CLOSING_STAGES.has(s.key));

interface Props {
  negotiations: Negotiation[];
  onUpdate: React.Dispatch<React.SetStateAction<Negotiation[]>>;
  onChangeImportance?: (id: string, level: ImportanceLevel) => void;
}

interface DroppableColumnProps {
  stage: StageDef;
  negotiations: Negotiation[];
  onAdvance?: (id: string, stageKey: NegotiationStage) => void;
  onDropCard: (id: string, stageKey: NegotiationStage) => void;
  onChangeImportance?: (id: string, level: ImportanceLevel) => void;
  variant?: "pipeline" | "closing";
}

function DroppableColumn({ 
  stage, 
  negotiations, 
  onAdvance, 
  onDropCard,
  onChangeImportance,
  variant = "pipeline",
}: DroppableColumnProps) {
  const isClosing = variant === "closing";
  const [isOver, setIsOver] = useState(false);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move";
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault();
    setIsOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsOver(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsOver(false);
    const cardId = e.dataTransfer.getData("application/json");
    if (cardId) {
      onDropCard(cardId, stage.key);
    }
  }

  return (
    <div
      className={`relative shrink-0 flex flex-col min-h-[65vh] transition-all duration-300 group ${isClosing ? "w-72" : "w-85"}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Fundo: trapezoidal no pipeline, retângulo arredondado no fechamento */}
      <div
        className={`absolute inset-0 transition-all duration-300 shadow-sm ${
          isClosing ? "rounded-2xl" : "rounded-l-2xl"
        } ${
          isOver ? "opacity-100 ring-2 ring-blue-400 ring-inset bg-blue-50/50" : "opacity-70"
        }`}
        style={{
          background: stage.bg,
          clipPath: isClosing ? undefined : "polygon(0 0, 100% 0, 94% 100%, 0% 100%)",
          border: isClosing ? `1px dashed ${stage.border}` : undefined,
          borderLeft: isClosing ? undefined : `1px solid ${stage.border}`,
          borderTop: isClosing ? undefined : `1px solid ${stage.border}`,
          borderBottom: isClosing ? undefined : `1px solid ${stage.border}`,
        }}
      />

      {/* Conteúdo da Coluna */}
      <div className={`relative z-10 flex flex-col h-full p-4 ${isClosing ? "" : "pr-6"}`}>
        <div className="flex justify-between items-center mb-5 px-1">
          <h3 className="font-semibold text-sm tracking-wide flex items-center gap-1.5" style={{ color: stage.color }}>
            {isClosing && (stage.key === "fechamento_com_venda" ? <CheckCircle2 size={14} /> : <XCircle size={14} />)}
            {stage.label}
          </h3>
          <span className="text-xs font-bold px-2.5 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-slate-700 shadow-sm border border-slate-100">
            {negotiations.length}
          </span>
        </div>
        <div className="flex flex-col gap-3 flex-1 pb-4">
          {negotiations.map((n: Negotiation) => (
            <NegotiationCard
              key={n.id}
              negotiation={n}
              color={stage.color}
              onAdvance={onAdvance ? () => onAdvance(n.id, stage.key) : undefined}
              onChangeImportance={onChangeImportance}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function KanbanBoard({ 
  negotiations, 
  onUpdate,
  onChangeImportance
}: Props) {
  const { createStageHistory } = useNegotiationsService();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Movimento pendente de confirmação ao entrar num estágio de fechamento.
  const [pendingMove, setPendingMove] = useState<
    { id: string; oldStage: NegotiationStage; newStage: NegotiationStage } | null
  >(null);

  function groupByStage(items: Negotiation[]): Record<NegotiationStage, Negotiation[]> {
    const groups = Object.fromEntries(STAGES.map((s) => [s.key, [] as Negotiation[]])) as Record<NegotiationStage, Negotiation[]>;
    for (const neg of items) {
      const history = neg.stage_history ?? [];
      const lastStage: NegotiationStage = history.length > 0 ? history[history.length - 1].new_stage : "contato_inicial";
      if (groups[lastStage]) groups[lastStage].push(neg);
      else groups["contato_inicial"].push(neg);
    }
    return groups;
  }

  const columns = groupByStage(negotiations);

  // Executa de fato a movimentação (optimistic update + persistência).
  async function commitMove(negotiationId: string, oldStage: NegotiationStage, newStage: NegotiationStage) {
    if (oldStage === newStage || CLOSING_STAGES.has(oldStage)) return;

    onUpdate((prev) =>
      prev.map((n) =>
        n.id === negotiationId
          ? {
              ...n,
              stage_history: [
                ...(n.stage_history ?? []),
                {
                  id: "temp",
                  negotiation_id: negotiationId,
                  old_stage: oldStage,
                  new_stage: newStage,
                  notes: null,
                  created_at: new Date().toISOString(),
                },
              ],
            }
          : n
      )
    );

    try {
      // Chamada única: ao registrar um estágio de fechamento, o backend cria
      // o status terminal (won/lost) e sincroniza o lead na mesma transação.
      await createStageHistory({ negotiation_id: negotiationId, old_stage: oldStage, new_stage: newStage });
      setErrorMsg(null);
    } catch {
      onUpdate((prev) =>
        prev.map((n) =>
          n.id === negotiationId ? { ...n, stage_history: (n.stage_history ?? []).filter((h) => h.id !== "temp") } : n
        )
      );
      setErrorMsg("Erro ao mover card. Tente novamente.");
    }
  }

  // Decide se a movimentação pode ocorrer direto ou precisa de confirmação.
  function requestMove(negotiationId: string, oldStage: NegotiationStage, newStage: NegotiationStage) {
    if (oldStage === newStage || CLOSING_STAGES.has(oldStage)) return;
    if (CLOSING_STAGES.has(newStage)) {
      setPendingMove({ id: negotiationId, oldStage, newStage });
      return;
    }
    commitMove(negotiationId, oldStage, newStage);
  }

  function confirmPendingMove() {
    if (!pendingMove) return;
    commitMove(pendingMove.id, pendingMove.oldStage, pendingMove.newStage);
    setPendingMove(null);
  }

  function handleNativeDrop(negotiationId: string, newStage: NegotiationStage) {
    const card = negotiations.find((n) => n.id === negotiationId);
    if (!card) return;

    const history = card.stage_history ?? [];
    const oldStage: NegotiationStage = history.length > 0 ? history[history.length - 1].new_stage : "contato_inicial";
    
    requestMove(negotiationId, oldStage, newStage);
  }

  function handleAdvance(negotiationId: string, currentStageKey: NegotiationStage) {
    const currentIndex = STAGES.findIndex(s => s.key === currentStageKey);
    if (currentIndex >= 0 && currentIndex < STAGES.length - 1) {
      const nextStage = STAGES[currentIndex + 1].key;
      requestMove(negotiationId, currentStageKey, nextStage);
    }
  }

  return (
    <div className="flex flex-col h-full w-full">
      {errorMsg && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-red-700 bg-red-50 border border-red-200">
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-6 h-full custom-scrollbar items-stretch snap-x snap-mandatory">
        {/* Etapas do pipeline (avançáveis) */}
        {PIPELINE_STAGES.map((stage) => {
          const canAdvance = !CLOSING_STAGES.has(stage.key);
          return (
            <div key={stage.key} className="snap-start">
              <DroppableColumn
                stage={stage}
                variant="pipeline"
                negotiations={columns[stage.key]}
                onAdvance={canAdvance ? handleAdvance : undefined}
                onDropCard={handleNativeDrop}
                onChangeImportance={onChangeImportance}
              />
            </div>
          );
        })}

        {/* Divisor + zona de fechamento (estágios terminais) */}
        <div className="flex items-stretch shrink-0 snap-start">
          <div className="flex flex-col items-center justify-center px-3">
            <div className="w-px flex-1 bg-linear-to-b from-transparent via-slate-300 to-transparent" />
            <span className="my-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 [writing-mode:vertical-rl] rotate-180">
              Encerramento
            </span>
            <div className="w-px flex-1 bg-linear-to-b from-transparent via-slate-300 to-transparent" />
          </div>

          <div className="flex gap-2 rounded-2xl bg-slate-100/60 p-2 border border-slate-200/80">
            {CLOSING_STAGE_LIST.map((stage) => (
              <DroppableColumn
                key={stage.key}
                stage={stage}
                variant="closing"
                negotiations={columns[stage.key]}
                onAdvance={undefined}
                onDropCard={handleNativeDrop}
                onChangeImportance={onChangeImportance}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Aviso antes de encerrar a negociação */}
      {pendingMove && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-60 p-4"
          onClick={() => setPendingMove(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-amber-500" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-800">Encerrar negociação?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Mover para{" "}
                  <span className="font-medium text-slate-700">
                    {STAGES.find((s) => s.key === pendingMove.newStage)?.label}
                  </span>{" "}
                  encerra a negociação. Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPendingMove(null)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmPendingMove}
                className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
              >
                Confirmar encerramento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}