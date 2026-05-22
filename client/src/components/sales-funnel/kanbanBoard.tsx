import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import { useNegotiationsService } from "../../services/negotiationsService";
import NegotiationCard from "./NegotiationCard";
import KanbanColumn from "../negotiations/KanbanColumn";
import type { Negotiation, NegotiationStage } from "../../types/negotiations";

const STAGES: { key: NegotiationStage; label: string; color: string; bg: string }[] = [
  { key: "contato_inicial",      label: "Contato Inicial",      color: "#6366F1", bg: "#EEF2FF" },
  { key: "qualificacao",         label: "Qualificação",         color: "#F59E0B", bg: "#FFFBEB" },
  { key: "visita",               label: "Visita",               color: "#3B82F6", bg: "#EFF6FF" },
  { key: "proposta",             label: "Proposta",             color: "#8B5CF6", bg: "#F5F3FF" },
  { key: "negociacao",           label: "Negociação",           color: "#F97316", bg: "#FFF7ED" },
  { key: "fechamento_com_venda", label: "Fechamento c/ Venda",  color: "#10B981", bg: "#ECFDF5" },
  { key: "fechamento_sem_venda", label: "Fechamento s/ Venda",  color: "#EF4444", bg: "#FEF2F2" },
];

const CLOSING_STAGES = new Set<NegotiationStage>([
  "fechamento_com_venda",
  "fechamento_sem_venda",
]);

interface Props {
  negotiations: Negotiation[];
  onUpdate: React.Dispatch<React.SetStateAction<Negotiation[]>>;
}

export default function KanbanBoard({ negotiations, onUpdate }: Props) {
  const { createStageHistory } = useNegotiationsService();
  const [activeCard, setActiveCard] = useState<Negotiation | null>(null);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);

  function groupByStage(items: Negotiation[]): Record<NegotiationStage, Negotiation[]> {
    const groups = Object.fromEntries(
      STAGES.map((s) => [s.key, [] as Negotiation[]])
    ) as Record<NegotiationStage, Negotiation[]>;

    for (const neg of items) {
      const history = neg.stage_history ?? [];
      const lastStage: NegotiationStage =
        history.length > 0
          ? history[history.length - 1].new_stage  // ← new_stage, não new_status
          : "contato_inicial";

      if (groups[lastStage]) {
        groups[lastStage].push(neg);
      } else {
        groups["contato_inicial"].push(neg);
      }
    }
    return groups;
  }

  const columns = groupByStage(negotiations);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const negotiationId = active.id as string;
    const newStage      = over.id as NegotiationStage;

    const card = negotiations.find((n) => n.id === negotiationId);
    if (!card) return;

    const history = card.stage_history ?? [];
    const oldStage: NegotiationStage =
      history.length > 0
        ? history[history.length - 1].new_stage
        : "contato_inicial";

    if (oldStage === newStage) return;
    if (CLOSING_STAGES.has(oldStage)) return; // encerrado — imutável

    // Optimistic update
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
      // Payload alinhado com CreateNegotiationStageHistorySchema —
      // negotiation_id, old_stage, new_stage. userId não vai no body.
      await createStageHistory({
        negotiation_id: negotiationId,
        old_stage: oldStage,
        new_stage: newStage,
      });
      setErrorMsg(null);
    } catch {
      onUpdate((prev) =>
        prev.map((n) =>
          n.id === negotiationId
            ? {
                ...n,
                stage_history: (n.stage_history ?? []).filter(
                  (h) => h.id !== "temp"
                ),
              }
            : n
        )
      );
      setErrorMsg("Erro ao mover card. Tente novamente.");
    }
  }

  return (
    <>
      {errorMsg && (
        <div className="mb-4 px-4 py-2 bg-red-100 text-red-700 rounded text-sm">
          {errorMsg}
        </div>
      )}

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={(e) =>
          setActiveCard(negotiations.find((n) => n.id === e.active.id) ?? null)
        }
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage.key}
              stageKey={stage.key}
              label={stage.label}
              color={stage.color}
              bg={stage.bg}
              negotiations={columns[stage.key]}
              isClosed={CLOSING_STAGES.has(stage.key)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeCard ? (
            <NegotiationCard negotiation={activeCard} color="#6366F1" isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
}