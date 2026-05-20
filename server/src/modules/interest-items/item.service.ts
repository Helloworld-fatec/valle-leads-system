// server/src/modules/interest-items/item.service.ts
import { InterestItemsRepository } from "./item.repository.js";
import type {
  CreateInterestItemDTO,
  UpdateInterestItemDTO,
  QueryInterestItemDTO,
} from "./item.dto.js";
import {
  RecursoNaoEncontradoError,
  RequisicaoInvalidaError,
} from "../../middlewares/errors/domainErrors.middleware.js";

// ─────────────────────────────────────────────
// INTEREST ITEMS SERVICE
// ─────────────────────────────────────────────
// Regras de negócio do módulo.
// Recebe `actorId` do controller (de req.user) para preencher
// campos de auditoria sem acessar req diretamente.
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

  async create(data: CreateInterestItemDTO, actorId: string) {
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

    return InterestItemsRepository.create({
      ...data,
      created_by_user_id: actorId,
    });
  },

  async update(id: string, data: UpdateInterestItemDTO, actorId: string) {
    const item = await InterestItemsRepository.findById(id);
    if (!item) {
      throw new RecursoNaoEncontradoError("Item de interesse não encontrado.");
    }

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

    return InterestItemsRepository.update(id, {
      ...data,
      updated_by_user_id: actorId,
    });
  },

  async softDelete(id: string, actorId: string) {
    const item = await InterestItemsRepository.findById(id);
    if (!item) {
      throw new RecursoNaoEncontradoError("Item de interesse não encontrado.");
    }
    if (!item.is_active) {
      throw new RequisicaoInvalidaError("Item de interesse já está inativo.");
    }

    return InterestItemsRepository.softDelete(id, actorId);
  },

  // Hard delete — chamado apenas por ADMIN (garantido pela rota)
  async hardDelete(id: string) {
    const item = await InterestItemsRepository.findById(id);
    if (!item) {
      throw new RecursoNaoEncontradoError("Item de interesse não encontrado.");
    }

    return InterestItemsRepository.hardDelete(id);
  },
};
