import { useState } from "react";
import { DndContext, DragEndEvent, DragOverlay, closestCenter } from "@dnd-kit/core";
import { useAuth } from "../../hook/useAuth";
import { useNegotiationsService } from "../../services/negotiationsService";
import KanbanColumn from "../negotiations/KanbanColumn";
import NegotiationCard from "./NegotiationCard";
import type { Negotiation, NegotiationStage } from "../../types/negotiations";

// Mapeamento de cores por estágio
const STAGES: { key: NegotiationStage; label: string; color: string; bg: string }[] = [
    { key: "contato_inicial", label: "Contato Inicial", color: "#6366F1", bg: "#EEF2FF" },
    { key: "visita", label: "Visita", color: "#F59E0B", bg: "#FFFBEB" },
    { key: "proposta", label: "Proposta", color: "#3B82F6", bg: "#EFF6FF" },
    { key: "negociacao", label: "Negociação", color: "#8B5CF6", bg: "#F5F3FF" },
    { key: "fechamento_com_venda", label: "Fechamento c/ Venda", color: "#10B981", bg: "#ECFDF5" },
    { key: "fechamento_sem_venda", label: "Fechamento s/ Venda", color: "#EF4444", bg: "#FEF2F2" },
];

interface Props {
    negotiations: Negotiation[];
    onUpdate: React.Dispatch<React.SetStateAction<Negotiation[]>>;
}

export default function KanbanBoard({ negotiations, onUpdate }: Props) {
    const { user } = useAuth();
    const { createStageHistory } = useNegotiationsService();
    const [activeCard, setActiveCard] = useState<Negotiation | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const groupByStage = (items: Negotiation[]): Record<NegotiationStage, Negotiation[]> => {
        const groups = {
            contato_inicial: [],
            visita: [],
            proposta: [],
            negociacao: [],
            fechamento_com_venda: [],
            fechamento_sem_venda: [],
        } as Record<NegotiationStage, Negotiation[]>;

        items.forEach((neg) => {
            // Pega o último estágio do histórico
            const stageHistory = neg.stage_history ?? [];
            const lastStage =
                stageHistory.length > 0
                    ? stageHistory[stageHistory.length - 1].new_status
                    : "contato_inicial";
            groups[lastStage].push(neg);
        });
        return groups;
    };

    const columns = groupByStage(negotiations);

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        setActiveCard(null);
        if (!over) return;

        const negotiationId = active.id as string;
        const newStage = over.id as NegotiationStage;

        const card = negotiations.find((n) => n.id === negotiationId);
        if (!card) return;

        const stageHistory = card.stage_history ?? [];
        const oldStage: NegotiationStage =
            stageHistory.length > 0
                ? stageHistory[stageHistory.length - 1].new_status
                : "contato_inicial";

        if (oldStage === newStage) return;

        // Optimistic update -> adiciona entrada no stage_history local
        onUpdate((prev) =>
            prev.map((n) =>
                n.id === negotiationId
                    ? {
                        ...n,
                        stage_history: [
                            ...(n.stage_history ?? []),
                            {
                                id: "temp",
                                old_status: oldStage,
                                new_status: newStage,
                                notes: null,
                                created_at: new Date().toISOString(),
                            },
                        ],
                    }
                    : n
            )
        );

        try {
            await createStageHistory(negotiationId, {
                old_status: oldStage,
                new_status: newStage,
                userId: user?.id,
            });
            setErrorMsg(null);
        } catch {
            // Reverte removando entrada provisória
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
            setErrorMsg("Erro ao mover card. tente novamente.");
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
                            stage={stage.label}
                            color={stage.color}
                            bg={stage.bg}
                            leads={columns[stage.key].map((neg) => ({
                                id: neg.id,
                                name: neg.lead?.customers?.name ?? "—",
                                email: "",
                                phone: "",
                                value: "—",
                                rawValue: 0,
                                importance: (neg.importance_history ?? []).length > 0
                                    ? (neg.importance_history![neg.importance_history!.length - 1].importance as "quente" | "morno" | "frio")
                                    : "morno",
                                source: "—",
                                attendant: user?.name ?? "—",
                            }))}
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