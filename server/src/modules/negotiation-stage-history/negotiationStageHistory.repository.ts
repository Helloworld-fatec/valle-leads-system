import { prisma } from "../../config/prisma.js"
import type { CreateNegotiationStageHistoryDTO } from "./negotiationStageHistory.dto.js"

export const negotiationStageHistoryRepository = {
  // Registra uma nova entrada de histórico ao mover o lead entre estágios do funil (RN16)
  async create(negotiationId: string, data: CreateNegotiationStageHistoryDTO, changedBy: string) {
    return await prisma.negotiationStageHistory.create({
      data: {
        negotiation_id: negotiationId,
        old_status: data.old_status ?? null,
        new_status: data.new_status,
        notes: data.notes ?? null,
        created_by_user_id: changedBy,
      },
    })
  },

  // Retorna todo o histórico de uma negociação em ordem cronológica crescente
  async findByNegotiationId(negotiationId: string) {
    return await prisma.negotiationStageHistory.findMany({
      where: { negotiation_id: negotiationId },
      orderBy: { created_at: "asc" },
    })
  },
}