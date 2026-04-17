// server/src/modules/negotiation/negotiation.service.ts
import { prisma } from "../../config/prisma"; // Importação necessária para a transação
import { NegotiationsRepository } from "./negotiation.repository";
import {
  CreateNegotiationDTO,
  UpdateNegotiationDTO,
  QueryNegotiationDTO,
} from "./negotiation.dto";
import { RecursoNaoEncontradoError } from "../../middlewares/errors/domainErrors.middleware";

// ─────────────────────────────────────────────
// NEGOTIATION SERVICE
// ─────────────────────────────────────────────

export const NegotiationsService = {
  async findAll(filters: QueryNegotiationDTO) {
    return NegotiationsRepository.findAll(filters);
  },

  async findById(id: string) {
    const negotiation = await NegotiationsRepository.findById(id);

    if (!negotiation) {
      throw new RecursoNaoEncontradoError("Negociação não encontrada.");
    }

    return negotiation;
  },

  async create(data: CreateNegotiationDTO & { created_by_user_id: string }) {
    // ⚠️ TODO futuro: Validar se team_id e lead_id existem ativamente (opcional, dependendo do design do seu sistema,
    // pois o Prisma já vai disparar um erro de Foreign Key caso não existam).

    // Usando Interactive Transactions do Prisma para garantir ACID
    const newNegotiation = await prisma.$transaction(async (tx) => {
      // 1. Cria a negociação base
      const negotiation = await tx.negotiations.create({
        data: {
          team_id: data.team_id,
          lead_id: data.lead_id,
          created_by_user_id: data.created_by_user_id,
        },
      });

      // 2. Cria o histórico inicial de status: "open"
      await tx.negotiationStatus.create({
        data: {
          negotiation_id: negotiation.id,
          status_negotiation: "open",
          notes: "Status inicial gerado automaticamente.",
          created_by_user_id: data.created_by_user_id,
        },
      });

      // 3. Cria o histórico inicial de estágio: "qualificação"
      await tx.negotiationStageHistory.create({
        data: {
          negotiation_id: negotiation.id,
          new_status: "qualificação",
          notes: "Estágio inicial gerado automaticamente.",
          created_by_user_id: data.created_by_user_id,
        },
      });

      // 4. Cria o histórico inicial de importância: "morno"
      await tx.negotiationImportance.create({
        data: {
          negotiation_id: negotiation.id,
          importance: "morno",
          notes: "Importância inicial gerada automaticamente.",
          created_by_user_id: data.created_by_user_id,
        },
      });

      // 5. Retorna a negociação recém-criada populada com os filhos para o Controller devolver ao Frontend
      return tx.negotiations.findUnique({
        where: { id: negotiation.id },
        include: {
          status_history: true,
          stage_history: true,
          importance_history: true,
        },
      });
    });

    return newNegotiation;
  },

  async update(
    id: string,
    data: UpdateNegotiationDTO & { updated_by_user_id: string }
  ) {
    const negotiation = await NegotiationsRepository.findById(id);

    if (!negotiation) {
      throw new RecursoNaoEncontradoError("Negociação não encontrada.");
    }

    return NegotiationsRepository.update(id, data);
  },

  async delete(id: string) {
    const negotiation = await NegotiationsRepository.findById(id);

    if (!negotiation) {
      throw new RecursoNaoEncontradoError("Negociação não encontrada.");
    }

    // A deleção em cascata configurada no schema (onDelete: Cascade) 
    // vai limpar automaticamente os status, stages e importances vinculados a esta negociação.
    return NegotiationsRepository.delete(id);
  },
};