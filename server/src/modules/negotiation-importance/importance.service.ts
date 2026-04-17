// server/src/modules/negotiation-importance/importance.service.ts
import { NegotiationImportanceRepository } from "./importance.repository";
import { NegotiationsRepository } from "../negotiation/negotiation.repository";
import {
  CreateNegotiationImportanceDTO,
  UpdateNegotiationImportanceDTO,
  QueryNegotiationImportanceDTO,
} from "./importance.dto";
import { 
  RecursoNaoEncontradoError, 
  BusinessRuleError 
} from "../../middlewares/errors/domainErrors.middleware";

// ─────────────────────────────────────────────
// NEGOTIATION IMPORTANCE SERVICE
// ─────────────────────────────────────────────

export const NegotiationImportanceService = {
  async findAll(filters: QueryNegotiationImportanceDTO) {
    return NegotiationImportanceRepository.findAll(filters);
  },

  async findById(id: string) {
    const importanceHistory = await NegotiationImportanceRepository.findById(id);

    if (!importanceHistory) {
      throw new RecursoNaoEncontradoError("Histórico de importância não encontrado.");
    }

    return importanceHistory;
  },

  // Equivalente ao seu antigo "updateImportance" (pois no banco é um insert de histórico)
  async create(data: CreateNegotiationImportanceDTO & { created_by_user_id: string }) {
    // 1. Verifica se a negociação existe
    const negotiation = await NegotiationsRepository.findById(data.negotiation_id);

    if (!negotiation) {
      throw new RecursoNaoEncontradoError("Negociação pai não encontrada.");
    }

    // 2. Busca a importância atual usando a função customizada do repositório
    const currentImportance = await NegotiationImportanceRepository.findCurrentByNegotiationId(
      data.negotiation_id
    );

    // 3. Aplica a sua Regra de Negócio: Impede criar um registro duplicado seguido
    if (currentImportance && currentImportance.importance === data.importance) {
      throw new BusinessRuleError(
        `A negociação já possui a importância "${data.importance}". Nenhuma alteração foi necessária.`
      );
    }

    // 4. Cria o novo registro na linha do tempo
    return NegotiationImportanceRepository.create(data);
  },

  async update(
    id: string,
    data: UpdateNegotiationImportanceDTO & { updated_by_user_id: string }
  ) {
    const importanceHistory = await NegotiationImportanceRepository.findById(id);

    if (!importanceHistory) {
      throw new RecursoNaoEncontradoError("Histórico de importância não encontrado.");
    }

    return NegotiationImportanceRepository.update(id, data);
  },

  async delete(id: string) {
    const importanceHistory = await NegotiationImportanceRepository.findById(id);

    if (!importanceHistory) {
      throw new RecursoNaoEncontradoError("Histórico de importância não encontrado.");
    }

    return NegotiationImportanceRepository.delete(id);
  },
};