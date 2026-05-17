// server/src/modules/negotiation/negotiation.repository.ts
import { prisma } from "../../config/prisma";
import {
  CreateNegotiationDTO,
  UpdateNegotiationDTO,
  QueryNegotiationDTO,
} from "./negotiation.dto";

export const NegotiationsRepository = {
  async findAll(filters: QueryNegotiationDTO) {
    const { team_id, lead_id, attendant_id, page = 1, limit = 20 } = filters;

    return prisma.negotiations.findMany({
      where: {
        ...(team_id && { team_id }),
        ...(lead_id && { lead_id }),
        ...(attendant_id && { created_by_user_id: attendant_id }), // <-- FILTRO APLICADO AQUI
      },
      include: {
        leads: { include: { customers: true } }, // Garante que traga o cliente para o card
        teams: true,
        status_history: { orderBy: { created_at: "desc" }, take: 1 },
        stage_history: { orderBy: { created_at: "desc" }, take: 1 },
        importance_history: { orderBy: { created_at: "desc" }, take: 1 },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
    });
  },

  async findById(id: string) {
    return prisma.negotiations.findUnique({
      where: { id },
      include: {
        leads: true,
        teams: true,
        // No detalhe, trazemos todo o histórico ordenado do mais recente para o mais antigo
        status_history: { orderBy: { created_at: "desc" } },
        stage_history: { orderBy: { created_at: "desc" } },
        importance_history: { orderBy: { created_at: "desc" } },
      },
    });
  },

  async create(data: CreateNegotiationDTO & { created_by_user_id: string }) {
    return prisma.negotiations.create({
      data: {
        team_id: data.team_id,
        lead_id: data.lead_id,
        created_by_user_id: data.created_by_user_id,
      },
    });
  },

  async update(
    id: string,
    data: UpdateNegotiationDTO & { updated_by_user_id: string }
  ) {
    return prisma.negotiations.update({
      where: { id },
      data: {
        ...(data.team_id && { team_id: data.team_id }),
        ...(data.lead_id && { lead_id: data.lead_id }),
        updated_by_user_id: data.updated_by_user_id,
      },
    });
  },

  // Como Negotiations não possui "is_active", usamos delete físico. 
  // (Cascade está configurado no schema para os históricos).
  async delete(id: string) {
    return prisma.negotiations.delete({
      where: { id },
    });
  },
};