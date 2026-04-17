// server/src/modules/negotiation-stage-history/negotiationStageHistory.repository.ts
import { prisma } from "../../config/prisma";
import { 
  CreateNegotiationStageHistoryDTO,
  UpdateNegotiationStageHistoryDTO,
  QueryNegotiationStageHistoryDTO
} from "./negotiationStageHistory.dto";

export const NegotiationStageHistoryRepository = {
  async findAll(filters: QueryNegotiationStageHistoryDTO) {
    const { negotiation_id, new_status, page = 1, limit = 20 } = filters;

    return prisma.negotiationStageHistory.findMany({
      where: {
        ...(negotiation_id && { negotiation_id }),
        ...(new_status && { new_status }),
      },
      include: {
        negotiations: {
          select: { id: true, team_id: true, lead_id: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" }, // Listagem geral costuma ser do mais recente para o mais antigo
    });
  },

  async findById(id: string) {
    return prisma.negotiationStageHistory.findUnique({
      where: { id },
      include: {
        negotiations: true,
      },
    });
  },

  // Retorna todo o histórico de uma negociação em ordem cronológica crescente (Como você havia feito!)
  async findByNegotiationId(negotiationId: string) {
    return prisma.negotiationStageHistory.findMany({
      where: { negotiation_id: negotiationId },
      orderBy: { created_at: "asc" },
    });
  },

  // Registra uma nova entrada de histórico ao mover o lead entre estágios do funil (RN16)
  async create(data: CreateNegotiationStageHistoryDTO & { created_by_user_id: string }) {
    return prisma.negotiationStageHistory.create({
      data: {
        negotiation_id: data.negotiation_id,
        old_status: data.old_status ?? null,
        new_status: data.new_status,
        notes: data.notes ?? null,
        created_by_user_id: data.created_by_user_id,
      },
    });
  },

  async update(
    id: string,
    data: UpdateNegotiationStageHistoryDTO & { updated_by_user_id: string }
  ) {
    return prisma.negotiationStageHistory.update({
      where: { id },
      data: {
        ...(data.old_status !== undefined && { old_status: data.old_status }),
        ...(data.new_status !== undefined && { new_status: data.new_status }),
        ...(data.notes !== undefined && { notes: data.notes }),
        updated_by_user_id: data.updated_by_user_id,
      },
    });
  },

  async delete(id: string) {
    return prisma.negotiationStageHistory.delete({
      where: { id },
    });
  },
};