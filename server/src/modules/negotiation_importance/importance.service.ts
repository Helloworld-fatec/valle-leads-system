import { importanceRepository } from "./importance.repository.js";
import { RecursoNaoEncontradoError, BusinessRuleError } from "../../middlewares/error.middleware.js";
import type { NegotiationImportance } from "./importance.dto.js";

// Retorna o importance atual de uma negociação (registro mais recente)
async function getImportance(negotiationId: string) {
  const current = await importanceRepository.findCurrentByNegotiationId(negotiationId);
  if (!current)
        throw new RecursoNaoEncontradoError("No importance record found for this negotiation.");
    return current;
};

// Registra um novo importance para a negociação (RN17 — pode ser alterado a qualquer momento)
async function updateImportance(negotiationId: string, importance: NegotiationImportance, changedBy: string) {
  const current = await importanceRepository.findCurrentByNegotiationId(negotiationId);

  // Garante que o novo valor é diferente do atual
  if (current?.importance === importance) {
    throw new BusinessRuleError(
      `The negotiation importance is already "${importance}".`,
    );
  }
  return await importanceRepository.create(negotiationId, importance, changedBy);
};

export const importanceService = {
  getImportance,
  updateImportance,
};