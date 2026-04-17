// server/src/modules/negotiation-stage-history/negotiationStageHistory.service.ts
import { NegotiationStageHistoryRepository } from "./negotiationStageHistory.repository";
import { NegotiationsRepository } from "../negotiation/negotiation.repository";
import {
  CreateNegotiationStageHistoryDTO,
  UpdateNegotiationStageHistoryDTO,
  QueryNegotiationStageHistoryDTO,
} from "./negotiationStageHistory.dto";
import { 
  RecursoNaoEncontradoError, 
  BusinessRuleError 
} from "../../middlewares/errors/domainErrors.middleware";

// ─────────────────────────────────────────────
// NEGOTIATION STAGE HISTORY SERVICE
// ─────────────────────────────────────────────

export const NegotiationStageHistoryService = {
  async findAll(filters: QueryNegotiationStageHistoryDTO) {
    return NegotiationStageHistoryRepository.findAll(filters);
  },

  async findById(id: string) {
    const stageHistory = await NegotiationStageHistoryRepository.findById(id);

    if (!stageHistory) {
      throw new RecursoNaoEncontradoError("Histórico de estágio não encontrado.");
    }

    return stageHistory;
  },

  async create(data: CreateNegotiationStageHistoryDTO & { created_by_user_id: string }) {
    // 1. Busca a negociação pai (que já traz o histórico de status mais recente no índice 0)
    const negotiation = await NegotiationsRepository.findById(data.negotiation_id);

    if (!negotiation) {
      throw new RecursoNaoEncontradoError("Negociação pai não encontrada.");
    }

    // 2. Extrai o status atual (o mais recente). 
    // Como garantimos na criação da negociação que ela sempre nasce com um status, o array nunca deve ser vazio.
    const currentStatus = negotiation.status_history[0]?.status_negotiation;

    // 3. Aplica a Regra de Negócio: Não pode mudar estágio se estiver 'closed'
    if (currentStatus === "closed") {
      throw new BusinessRuleError(
        "Não é possível adicionar um novo estágio a uma negociação que já está encerrada ('closed')."
      );
    }

    // 4. Se passou pelas validações, cria o novo registro
    return NegotiationStageHistoryRepository.create(data);
  },

  async update(
    id: string,
    data: UpdateNegotiationStageHistoryDTO & { updated_by_user_id: string }
  ) {
    const stageHistory = await NegotiationStageHistoryRepository.findById(id);

    if (!stageHistory) {
      throw new RecursoNaoEncontradoError("Histórico de estágio não encontrado.");
    }

    // Nota: Dependendo da sua regra de negócio, você pode querer bloquear a atualização 
    // de um histórico passado se a negociação já estiver 'closed' também. 
    // Se for o caso, basta replicar a validação do `create` aqui!

    return NegotiationStageHistoryRepository.update(id, data);
  },

  async delete(id: string) {
    const stageHistory = await NegotiationStageHistoryRepository.findById(id);

    if (!stageHistory) {
      throw new RecursoNaoEncontradoError("Histórico de estágio não encontrado.");
    }

    return NegotiationStageHistoryRepository.delete(id);
  },
};