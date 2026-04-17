// server/src/modules/negotiation-status/status.service.ts
import { NegotiationStatusRepository } from "./status.repository";
import { NegotiationsRepository } from "../negotiation/negotiation.repository";
import {
  CreateNegotiationStatusDTO,
  UpdateNegotiationStatusDTO,
  QueryNegotiationStatusDTO,
} from "./status.dto";
import { RecursoNaoEncontradoError } from "../../middlewares/errors/domainErrors.middleware";

// ─────────────────────────────────────────────
// NEGOTIATION STATUS SERVICE
// ─────────────────────────────────────────────

export const NegotiationStatusService = {
  async findAll(filters: QueryNegotiationStatusDTO) {
    return NegotiationStatusRepository.findAll(filters);
  },

  async findById(id: string) {
    const statusHistory = await NegotiationStatusRepository.findById(id);

    if (!statusHistory) {
      throw new RecursoNaoEncontradoError("Histórico de status não encontrado.");
    }

    return statusHistory;
  },

  async create(data: CreateNegotiationStatusDTO & { created_by_user_id: string }) {
    // Regra de integridade: a negociação precisa existir para receber um novo status
    const negotiation = await NegotiationsRepository.findById(data.negotiation_id);

    if (!negotiation) {
      throw new RecursoNaoEncontradoError("Negociação pai não encontrada.");
    }

    return NegotiationStatusRepository.create(data);
  },

  async update(
    id: string,
    data: UpdateNegotiationStatusDTO & { updated_by_user_id: string }
  ) {
    const statusHistory = await NegotiationStatusRepository.findById(id);

    if (!statusHistory) {
      throw new RecursoNaoEncontradoError("Histórico de status não encontrado.");
    }

    return NegotiationStatusRepository.update(id, data);
  },

  async delete(id: string) {
    const statusHistory = await NegotiationStatusRepository.findById(id);

    if (!statusHistory) {
      throw new RecursoNaoEncontradoError("Histórico de status não encontrado.");
    }

    return NegotiationStatusRepository.delete(id);
  },
};