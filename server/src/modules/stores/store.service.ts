// src/modules/stores/stores.service.ts
import { Prisma } from "../../config/prisma.js";
import { StoresRepository, type StoreRow } from "./stores.repository.js";
import type { CreateStoreDTO, UpdateStoreDTO } from "./stores.dto.js";
import {
  RecursoNaoEncontradoError,
  BusinessRuleError,
} from "../../middlewares/errors/domainErrors.middleware.js";

// ─────────────────────────────────────────────
// STORES SERVICE
// ─────────────────────────────────────────────
// Regras de negócio do módulo de lojas.
// Stores é uma entidade simples (name, address) sem relação direta com Teams
// no sentido Stores→Teams. A relação existe na direção oposta: Teams.store_id.
// ─────────────────────────────────────────────

export class StoresService {
  private repo = new StoresRepository();

  async findAll(isActive?: boolean): Promise<StoreRow[]> {
    return this.repo.findAll(isActive);
  }

  async findById(id: string): Promise<StoreRow> {
    const store = await this.repo.findById(id);
    if (!store) {
      throw new RecursoNaoEncontradoError("Loja não encontrada.");
    }
    return store;
  }

  async create(data: CreateStoreDTO, actorId: string): Promise<StoreRow> {
    return this.repo.create({ dto: data, actorId });
  }

  async update(
    id: string,
    data: UpdateStoreDTO,
    actorId: string
  ): Promise<StoreRow> {
    const store = await this.repo.findLightById(id);
    if (!store) {
      throw new RecursoNaoEncontradoError("Loja não encontrada.");
    }

    return this.repo.update({ id, dto: data, actorId });
  }

  async softDelete(id: string, actorId: string): Promise<void> {
    const store = await this.repo.findLightById(id);
    if (!store) {
      throw new RecursoNaoEncontradoError("Loja não encontrada.");
    }
    if (!store.is_active) {
      throw new BusinessRuleError("Loja já está inativa.");
    }

    await this.repo.softDelete({ id, actorId });
  }

  async hardDelete(id: string, actorId: string): Promise<void> {
    const store = await this.repo.findLightById(id);
    if (!store) {
      throw new RecursoNaoEncontradoError("Loja não encontrada.");
    }

    try {
      await this.repo.hardDelete(id);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2003"
      ) {
        throw new BusinessRuleError(
          "Não é possível excluir a loja permanentemente pois existem times vinculados."
        );
      }
      throw err;
    }
  }
}