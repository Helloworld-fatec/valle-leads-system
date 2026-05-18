import { InterestItemsRepository } from "./item.repository";
import {
  CreateInterestItemDTO,
  UpdateInterestItemDTO,
  QueryInterestItemDTO,
} from "./item.dtos";
import {
  RecursoNaoEncontradoError,
  RequisicaoInvalidaError,
} from "../../middlewares/errors/domainErrors.middleware";

// ─────────────────────────────────────────────
// INTEREST ITEMS SERVICE
// ─────────────────────────────────────────────

export const InterestItemsService = {
  async findAll(filters: QueryInterestItemDTO) {
    return InterestItemsRepository.findAll(filters);
  },

  async findById(id: string) {
    const item = await InterestItemsRepository.findById(id);

    if (!item) {
      throw new RecursoNaoEncontradoError("Item de interesse não encontrado.");
    }

    return item;
  },

  async create(data: CreateInterestItemDTO) {
    // Regra: reference_code deve ser único quando informado
    if (data.reference_code) {
      const existing = await InterestItemsRepository.findByReferenceCode(
        data.reference_code
      );

      if (existing) {
        throw new RequisicaoInvalidaError(
          `Já existe um item com o código de referência "${data.reference_code}".`
        );
      }
    }

    return InterestItemsRepository.create(data);
  },

  async update(id: string, data: UpdateInterestItemDTO) {
    const item = await InterestItemsRepository.findById(id);

    if (!item) {
      throw new RecursoNaoEncontradoError("Item de interesse não encontrado.");
    }

    // Regra: ao trocar o reference_code, garante que o novo também é único
    if (data.reference_code && data.reference_code !== item.reference_code) {
      const existing = await InterestItemsRepository.findByReferenceCode(
        data.reference_code
      );

      if (existing) {
        throw new RequisicaoInvalidaError(
          `Já existe um item com o código de referência "${data.reference_code}".`
        );
      }
    }

    return InterestItemsRepository.update(id, data);
  },

  async softDelete(id: string) {
    const item = await InterestItemsRepository.findById(id);

    if (!item) {
      throw new RecursoNaoEncontradoError("Item de interesse não encontrado.");
    }

    if (!item.is_active) {
      throw new RequisicaoInvalidaError("Item de interesse já está inativo.");
    }

    return InterestItemsRepository.softDelete(id);
  },
};
