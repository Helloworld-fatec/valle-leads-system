// src/modules/customers/customer.repository.ts
import { prisma, Prisma } from "../../config/prisma.js";
import type {
  CreateCustomerDTO,
  UpdateCustomerDTO,
  QueryCustomerDTO,
} from "./customer.dto.js";

// ─────────────────────────────────────────────
// CUSTOMER REPOSITORY
// ─────────────────────────────────────────────
// Usa Prisma.CustomersUncheckedCreateInput / UncheckedUpdateInput para poder
// passar team_id como string direta (FK escalar), em vez de precisar do
// objeto de relação { teams: { connect: { id } } } exigido pelo CreateInput.
// Com exactOptionalPropertyTypes, spreads de DTOs com campos opcionais
// passariam `undefined` onde o Prisma exige `string | null` — por isso
// cada campo é atribuído explicitamente com ?? null.
// ─────────────────────────────────────────────

// Select padrão — sem campos pesados
const customerSelect = {
  id: true,
  name: true,
  email: true,
  cpf: true,
  phone: true,
  address_street: true,
  address_number: true,
  address_complement: true,
  address_neighborhood: true,
  address_city: true,
  address_state: true,
  address_zip: true,
  is_active: true,
  team_id: true,
  created_at: true,
  updated_at: true,
  created_by_user_id: true,
  updated_by_user_id: true,
} as const satisfies Prisma.CustomersSelect;

export type CustomerRow = Prisma.CustomersGetPayload<{
  select: typeof customerSelect;
}>;

// Tipo rico — retornado pelo findById (inclui leads)
const customerInclude = {
  leads: true,
  teams: { select: { id: true, name: true, is_active: true } },
} as const satisfies Prisma.CustomersInclude;

export type CustomerWithRelations = Prisma.CustomersGetPayload<{
  include: typeof customerInclude;
}>;

export const CustomersRepository = {
  async findAll(filters: QueryCustomerDTO): Promise<CustomerRow[]> {
    const where: Prisma.CustomersWhereInput = {};

    if (filters.team_id !== undefined) where.team_id = filters.team_id;
    if (filters.is_active !== undefined) where.is_active = filters.is_active;
    if (filters.cpf !== undefined) where.cpf = filters.cpf;
    if (filters.name !== undefined) {
      where.name = { contains: filters.name, mode: "insensitive" };
    }

    return prisma.customers.findMany({
      where,
      select: customerSelect,
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      orderBy: { created_at: "desc" },
    });
  },

  async findById(id: string): Promise<CustomerWithRelations | null> {
    return prisma.customers.findUnique({
      where: { id },
      include: customerInclude,
    });
  },

  // Lookup leve para validações no service
  async findLightById(
    id: string
  ): Promise<{ id: string; is_active: boolean; cpf: string | null } | null> {
    return prisma.customers.findUnique({
      where: { id },
      select: { id: true, is_active: true, cpf: true },
    });
  },

  async findByCpf(cpf: string): Promise<{ id: string } | null> {
    return prisma.customers.findUnique({
      where: { cpf },
      select: { id: true },
    });
  },

  async findByPhone(phone: string): Promise<{ id: string } | null> {
    return prisma.customers.findUnique({
      where: { phone },
      select: { id: true },
    });
  },

  async create(params: {
    dto: CreateCustomerDTO;
    actorId: string;
  }): Promise<CustomerRow> {
    const { dto, actorId } = params;

    // UncheckedCreateInput: team_id passado como scalar string (não como objeto de relação).
    // Campos String? exigem string | null — usamos ?? null para converter undefined.
    const data: Prisma.CustomersUncheckedCreateInput = {
      name: dto.name,
      phone: dto.phone,
      email: dto.email ?? null,
      cpf: dto.cpf ?? null,
      team_id: dto.team_id ?? null,
      address_street: dto.address_street ?? null,
      address_number: dto.address_number ?? null,
      address_complement: dto.address_complement ?? null,
      address_neighborhood: dto.address_neighborhood ?? null,
      address_city: dto.address_city ?? null,
      address_state: dto.address_state ?? null,
      address_zip: dto.address_zip ?? null,
      created_by_user_id: actorId,
      updated_by_user_id: actorId,
    };

    return prisma.customers.create({ data, select: customerSelect });
  },

  async update(params: {
    id: string;
    dto: UpdateCustomerDTO;
    actorId: string;
  }): Promise<CustomerRow> {
    const { id, dto, actorId } = params;

    // UncheckedUpdateInput: constrói explicitamente para não passar undefined.
    const data: Prisma.CustomersUncheckedUpdateInput = {
      updated_by_user_id: actorId,
    };

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email !== undefined) data.email = dto.email ?? null;
    if (dto.cpf !== undefined) data.cpf = dto.cpf ?? null;
    if (dto.phone !== undefined) data.phone = dto.phone;
    if (dto.is_active !== undefined) data.is_active = dto.is_active;
    // team_id aceita null para desvincular o cliente de um time
    if (dto.team_id !== undefined) data.team_id = dto.team_id ?? null;
    if (dto.address_street !== undefined) data.address_street = dto.address_street ?? null;
    if (dto.address_number !== undefined) data.address_number = dto.address_number ?? null;
    if (dto.address_complement !== undefined) data.address_complement = dto.address_complement ?? null;
    if (dto.address_neighborhood !== undefined) data.address_neighborhood = dto.address_neighborhood ?? null;
    if (dto.address_city !== undefined) data.address_city = dto.address_city ?? null;
    if (dto.address_state !== undefined) data.address_state = dto.address_state ?? null;
    if (dto.address_zip !== undefined) data.address_zip = dto.address_zip ?? null;

    return prisma.customers.update({ where: { id }, data, select: customerSelect });
  },

  async softDelete(params: {
    id: string;
    actorId: string;
  }): Promise<CustomerRow> {
    const { id, actorId } = params;
    return prisma.customers.update({
      where: { id },
      data: { is_active: false, updated_by_user_id: actorId },
      select: customerSelect,
    });
  },

  async hardDelete(id: string): Promise<void> {
    await prisma.customers.delete({ where: { id } });
  },
};