// server/src/modules/negotiation-importance/importance.repository.ts
import { prisma } from "../../config/prisma";
import {
  CreateNegotiationImportanceDTO,
  UpdateNegotiationImportanceDTO,
  QueryNegotiationImportanceDTO,
} from "./importance.dto";

export const NegotiationImportanceRepository = {
  // ─────────────────────────────────────────────
  // MÉTODOS CUSTOMIZADOS (Baseados no seu código)
  // ─────────────────────────────────────────────

  // Busca a importância mais recente de uma negociação (último registro inserido)
  async findCurrentByNegotiationId(negotiationId: string) {
    return prisma.negotiationImportance.findFirst({
      where: { negotiation_id: negotiationId },
      orderBy: { created_at: "desc" },
    });
  },

  // Retorna todo o histórico de importância de uma negociação em ordem cronológica
  async findByNegotiationId(negotiationId: string) {
    return prisma.negotiationImportance.findMany({
      where: { negotiation_id: negotiationId },
      orderBy: { created_at: "asc" },
    });
  },

  // ─────────────────────────────────────────────
  // MÉTODOS CRUD PADRÃO
  // ─────────────────────────────────────────────

  async findAll(filters: QueryNegotiationImportanceDTO) {
    const { negotiation_id, importance, page = 1, limit = 20 } = filters;

    return prisma.negotiationImportance.findMany({
      where: {
        ...(negotiation_id && { negotiation_id }),
        ...(importance && { importance }),
      },
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
    return prisma.negotiationImportance.findUnique({
      where: { id },
      include: {
        negotiations: true,
      },
    });
  },

  // Registra um novo importance para a negociação (RN17) usando o DTO padronizado
  async create(data: CreateNegotiationImportanceDTO & { created_by_user_id: string }) {
    return prisma.negotiationImportance.create({
      data: {
        negotiation_id: data.negotiation_id,
        importance: data.importance,
        notes: data.notes ?? null,
        created_by_user_id: data.created_by_user_id,
      },
    });
  },

  async update(
    id: string,
    data: UpdateNegotiationImportanceDTO & { updated_by_user_id: string }
  ) {
    return prisma.negotiationImportance.update({
      where: { id },
      data: {
        ...(data.importance !== undefined && { importance: data.importance }),
        ...(data.notes !== undefined && { notes: data.notes }),
        updated_by_user_id: data.updated_by_user_id,
      },
    });
  },

  async delete(id: string) {
    return prisma.negotiationImportance.delete({
      where: { id },
    });
  },
};