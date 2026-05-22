// src/modules/stores/stores.repository.ts
import { prisma, Prisma } from "../../config/prisma.js";
import type { CreateStoreDTO, UpdateStoreDTO } from "./stores.dto.js";

// ─────────────────────────────────────────────
// STORES REPOSITORY
// ─────────────────────────────────────────────
// Camada de acesso a dados — não conhece regras de negócio.
//
// Nota sobre o schema:
//   Stores NÃO tem team_id. A relação é inversa:
//   Teams.store_id → Stores. Portanto CreateStoreDTO e UpdateStoreDTO
//   não devem incluir team_id.
// ─────────────────────────────────────────────

// Select padrão — enxuto para listagem
const storeSelect = {
  id: true,
  name: true,
  address: true,
  is_active: true,
  created_at: true,
  updated_at: true,
  created_by_user_id: true,
  updated_by_user_id: true,
} as const satisfies Prisma.StoresSelect;

export type StoreRow = Prisma.StoresGetPayload<{ select: typeof storeSelect }>;

export class StoresRepository {

  async findAll(isActive?: boolean): Promise<StoreRow[]> {
    return prisma.stores.findMany({
      where: isActive !== undefined ? { is_active: isActive } : {},
      select: storeSelect,
      orderBy: { created_at: "desc" },
    });
  }

  async findById(id: string): Promise<StoreRow | null> {
    return prisma.stores.findUnique({
      where: { id },
      select: storeSelect,
    });
  }

  // Lookup leve para validações no service
  async findLightById(
    id: string
  ): Promise<{ id: string; is_active: boolean } | null> {
    return prisma.stores.findUnique({
      where: { id },
      select: { id: true, is_active: true },
    });
  }

  async create(params: {
    dto: CreateStoreDTO;
    actorId: string;
  }): Promise<StoreRow> {
    const { dto, actorId } = params;

    return prisma.stores.create({
      data: {
        name: dto.name,
        // address é String? no schema — Prisma aceita string | null, não undefined
        address: dto.address ?? null,
        created_by_user_id: actorId,
        updated_by_user_id: actorId,
      },
      select: storeSelect,
    });
  }

  async update(params: {
    id: string;
    dto: UpdateStoreDTO;
    actorId: string;
  }): Promise<StoreRow> {
    const { id, dto, actorId } = params;

    // Constrói o UpdateInput explicitamente — com exactOptionalPropertyTypes,
    // o spread do DTO passaria `string | undefined` onde Prisma exige `string`
    // (name) ou `string | null` (address). Cada campo é atribuído somente se
    // presente no DTO.
    const data: Prisma.StoresUpdateInput = {
      updated_by_user_id: actorId,
    };

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.address !== undefined) data.address = dto.address ?? null;

    return prisma.stores.update({
      where: { id },
      data,
      select: storeSelect,
    });
  }

  // Soft delete — registra quem desativou
  async softDelete(params: {
    id: string;
    actorId: string;
  }): Promise<StoreRow> {
    const { id, actorId } = params;

    return prisma.stores.update({
      where: { id },
      data: { is_active: false, updated_by_user_id: actorId },
      select: storeSelect,
    });
  }

  // Hard delete — sem FKs com Restrict em Stores (teams usa onDelete: Restrict
  // na direção Teams→Stores, então o Prisma rejeita se houver times vinculados).
  // O service captura P2003 e devolve BusinessRuleError.
  async hardDelete(id: string): Promise<void> {
    await prisma.stores.delete({ where: { id } });
  }
}