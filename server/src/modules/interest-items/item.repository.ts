import { prisma } from "../../config/prisma";
import {
  CreateInterestItemDTO,
  UpdateInterestItemDTO,
  QueryInterestItemDTO,
} from "./item.dtos";

// ─────────────────────────────────────────────
// INTEREST ITEMS REPOSITORY
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

  async create(dto: CreateInterestItemDTO) {
    return prisma.interestItems.create({
      data: {
        description: dto.description,
        reference_code: dto.reference_code ?? null,
        value: dto.value ?? null,
      },
    });
  },

  async update(id: string, dto: UpdateInterestItemDTO) {
    return prisma.interestItems.update({
      where: { id },
      data: {
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.reference_code !== undefined && {
          reference_code: dto.reference_code ?? null,
        }),
        ...(dto.value !== undefined && { value: dto.value ?? null }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
      },
    });
  },

  async softDelete(id: string) {
    return prisma.interestItems.update({
      where: { id },
      data: { is_active: false },
    });
  },
};
