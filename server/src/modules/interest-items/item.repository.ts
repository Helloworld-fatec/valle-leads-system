import { prisma } from "../../config/prisma.js";
import type {
  CreateInterestItemDTO,
  UpdateInterestItemDTO,
  QueryInterestItemDTO,
} from "./item.dto.js";

// ─────────────────────────────────────────────
// INTEREST ITEMS REPOSITORY
// ─────────────────────────────────────────────
// Camada de acesso a dados.
// Aqui não colocamos regra de negócio pesada.
// A função principal deste arquivo é conversar com o Prisma.
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

    /**
     * page e limit podem chegar como string pela URL.
     *
     * Exemplo:
     * /api/interest-items?page=1&limit=8
     *
     * O Prisma precisa receber números em skip/take,
     * então fazemos a conversão antes.
     */
    const parsedPage = Number(page) || 1;
    const parsedLimit = Number(limit) || 20;

    /**
     * is_active pode chegar de duas formas:
     *
     * - boolean true/false, se já vier tratado pelo DTO;
     * - string "true"/"false", se vier direto da query string.
     *
     * O erro que estava acontecendo era porque o Prisma recebia:
     * is_active: "true"
     *
     * Mas ele espera:
     * is_active: true
     */
    const rawIsActive = is_active as unknown;

    const parsedIsActive =
      rawIsActive === undefined || rawIsActive === null || rawIsActive === ""
        ? undefined
        : rawIsActive === true || rawIsActive === "true";

    /**
     * Montamos o where dinamicamente.
     *
     * Importante:
     * - Só adiciona description se foi enviada.
     * - Só adiciona reference_code se foi enviado.
     * - Só adiciona is_active se ele foi convertido para boolean.
     */
    const where = {
      ...(description && {
        description: {
          contains: String(description),
          mode: "insensitive" as const,
        },
      }),

      ...(reference_code && {
        reference_code: {
          contains: String(reference_code),
          mode: "insensitive" as const,
        },
      }),

      ...(parsedIsActive !== undefined && {
        is_active: parsedIsActive,
      }),
    };

    return prisma.interestItems.findMany({
      where,
      skip: (parsedPage - 1) * parsedLimit,
      take: parsedLimit,
      orderBy: {
        created_at: "desc",
      },
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

  async create(dto: CreateInterestItemDTO & { created_by_user_id: string }) {
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

        ...(fields.value !== undefined && {
          value: fields.value ?? null,
        }),

        ...(fields.is_active !== undefined && {
          is_active: fields.is_active,
        }),

        updated_by_user_id,
      },
    });
  },

  /**
   * Soft delete.
   *
   * Não apaga o registro do banco.
   * Apenas marca como inativo.
   */
  async softDelete(id: string, updated_by_user_id: string) {
    return prisma.interestItems.update({
      where: { id },
      data: {
        is_active: false,
        updated_by_user_id,
      },
    });
  },

  /**
   * Hard delete.
   *
   * Remove fisicamente do banco.
   * Deve ser usado apenas em casos restritos.
   */
  async hardDelete(id: string) {
    return prisma.interestItems.delete({
      where: { id },
    });
  },
};