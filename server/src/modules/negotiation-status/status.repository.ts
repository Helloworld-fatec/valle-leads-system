// server/src/modules/negotiation-status/status.repository.ts
import { prisma } from "../../config/prisma";
import {
  CreateNegotiationStatusDTO,
  UpdateNegotiationStatusDTO,
  QueryNegotiationStatusDTO,
} from "./status.dto";

export const NegotiationStatusRepository = {
  async findAll(filters: QueryNegotiationStatusDTO) {
    const { negotiation_id, status_negotiation, page = 1, limit = 20 } = filters;

    return prisma.negotiationStatus.findMany({
      where: {
        ...(negotiation_id && { negotiation_id }),
        ...(status_negotiation && { status_negotiation }),
      },
      // Trazendo dados básicos da negociação pai como conveniência
      include: {
        negotiations: {
          select: { id: true, team_id: true, lead_id: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
    });
  },

  async findById(id: string) {
    return prisma.negotiationStatus.findUnique({
      where: { id },
      include: {
        negotiations: true,
      },
    });
  },

  async create(data: CreateNegotiationStatusDTO & { created_by_user_id: string }) {
    return prisma.negotiationStatus.create({
      data: {
        negotiation_id: data.negotiation_id,
        status_negotiation: data.status_negotiation,
        notes: data.notes ?? null,
        created_by_user_id: data.created_by_user_id,
      },
    });
  },

  async update(
    id: string,
    data: UpdateNegotiationStatusDTO & { updated_by_user_id: string }
  ) {
    return prisma.negotiationStatus.update({
      where: { id },
      data: {
        ...(data.status_negotiation !== undefined && { status_negotiation: data.status_negotiation }),
        ...(data.notes !== undefined && { notes: data.notes ?? null }),
        updated_by_user_id: data.updated_by_user_id,
      },
    });
  },

  // Delete físico, pois não temos is_active no schema para o histórico
  async delete(id: string) {
    return prisma.negotiationStatus.delete({
      where: { id },
    });
  },
};