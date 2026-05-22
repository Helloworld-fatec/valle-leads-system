// server/src/modules/interest-items/item.repository.ts
import { prisma } from "../../config/prisma.js";
import type {
  CreateInterestItemDTO,
  UpdateInterestItemDTO,
  QueryInterestItemDTO,
} from "./item.dto.js";

// ─────────────────────────────────────────────
// INTEREST ITEMS REPOSITORY
// ─────────────────────────────────────────────
// Camada de acesso a dados — sem regras de negócio.
// Campos de auditoria recebidos prontos do service.
// ─────────────────────────────────────────────

export const InterestItemsRepository = {
  async findAll(filters: QueryInterestItemDTO) {
    const {
      description,
      reference_code,
      is_active,
      page = 1,
      limit = 20,
    } = filters;

    return prisma.interestItems.findMany({
      where: {
        ...(description && {
          description: { contains: description, mode: "insensitive" },
        }),
        ...(reference_code && {
          reference_code: { contains: reference_code, mode: "insensitive" },
        }),
        ...(is_active !== undefined && { is_active }),
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
    });
  },

  async findById(id: string) {
    return prisma.interestItems.findUnique({
      where: { id },
    });
  },

  async findByReferenceCode(reference_code: string) {
    return prisma.interestItems.findUnique({
      where: { reference_code },
    });
  },

  async create(
    dto: CreateInterestItemDTO & { created_by_user_id: string }
  ) {
    const { created_by_user_id, ...fields } = dto;
    return prisma.interestItems.create({
      data: {
        description: fields.description,
        reference_code: fields.reference_code ?? null,
        value: fields.value ?? null,
        created_by_user_id,
        updated_by_user_id: created_by_user_id,
      },
    });
  },

  async update(
    id: string,
    dto: UpdateInterestItemDTO & { updated_by_user_id: string }
  ) {
    const { updated_by_user_id, ...fields } = dto;
    return prisma.interestItems.update({
      where: { id },
      data: {
        ...(fields.description !== undefined && {
          description: fields.description,
        }),
        ...(fields.reference_code !== undefined && {
          reference_code: fields.reference_code ?? null,
        }),
        ...(fields.value !== undefined && { value: fields.value ?? null }),
        ...(fields.is_active !== undefined && { is_active: fields.is_active }),
        updated_by_user_id,
      },
    });
  },

  // Soft delete — marca como inativo, preserva o registro
  async softDelete(id: string, updated_by_user_id: string) {
    return prisma.interestItems.update({
      where: { id },
      data: { is_active: false, updated_by_user_id },
    });
  },

  // Hard delete — remoção física, exclusivo para ADMIN
  async hardDelete(id: string) {
    return prisma.interestItems.delete({
      where: { id },
    });
  },
};
