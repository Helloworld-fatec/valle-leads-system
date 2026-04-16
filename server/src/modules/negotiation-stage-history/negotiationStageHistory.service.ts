import { BusinessRuleError } from "../../middlewares/errors/globalError.middleware.js"
import { negotiationStageHistoryRepository } from "./negotiationStageHistory.repository.js"
import type { NegotiationStage } from "./negotiationStageHistory.dto.js"

/**
 * Registra uma mudança de estágio no histórico da negociação (RN16).
 * Deve ser chamado pelo NegotiationsService antes de atualizar o status da negociação.
 *
 * @param negotiationId - ID da negociação sendo alterada
 * @param currentStatus - Status atual da negociação (antes da mudança)
 * @param newStatus     - Novo status desejado
 * @param changedBy     - ID do usuário responsável pela mudança
 */
async function recordStageChange(
  negotiationId: string,
  currentStatus: NegotiationStage,
  newStatus: NegotiationStage,
  changedBy: string,
) {
  // Garante que o novo status é diferente do atual (RN16 — toda mudança deve ser real)
  if (currentStatus === newStatus) {
    throw new BusinessRuleError(
      `The provided stage is already the current negotiation stage: "${newStatus}".`,
    )
  }

  return await negotiationStageHistoryRepository.create(
    negotiationId,
    { old_status: currentStatus, new_status: newStatus },
    changedBy,
  )
}

/**
 * Retorna o histórico completo de estágios de uma negociação em ordem cronológica (UC27).
 *
 * @param negotiationId - ID da negociação
 */
async function getHistoryByNegotiationId(negotiationId: string) {
  return await negotiationStageHistoryRepository.findByNegotiationId(negotiationId)
}

export const negotiationStageHistoryService = {
  recordStageChange,
  getHistoryByNegotiationId,
}