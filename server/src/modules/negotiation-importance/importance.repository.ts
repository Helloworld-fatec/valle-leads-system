import { prisma } from "../../config/prisma.js";
import type { NegotiationImportance } from "./importance.dto.js";

// Busca o importance mais recente de uma negociação (último registro inserido)
async function findCurrentByNegotiationId(negotiationId: string) {
    return await prisma.negotiationImportance.findFirst({
        where: { negotiation_id: negotiationId },
        orderBy: { created_at: "desc" },
        select: { id: true, importance: true, created_at: true },
    });
};

// Registra um novo importance para a negociação (RN17)
async function create(negotiationId: string, importance: NegotiationImportance, changedBy: string) {
    return await prisma.negotiationImportance.create({
        data: {
            negotiation_id: negotiationId,
            importance,
            created_by_user_id: changedBy,
        },
    });
};

export const importanceRepository = {
  findCurrentByNegotiationId,
  create,
};