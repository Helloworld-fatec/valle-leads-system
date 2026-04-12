import { prisma } from '../../config/prisma';import {
  CreateCustomerDTO,
  UpdateCustomerDTO,
  QueryCustomerDTO,
} from "./customer.dtos";

// ─────────────────────────────────────────────
// CUSTOMER REPOSITORY
// ─────────────────────────────────────────────

export const CustomersRepository = {
  async findAll(filters: QueryCustomerDTO) {
    const { team_id, is_active, name, cpf, page = 1, limit = 20 } = filters;

    return prisma.customers.findMany({
      where: {
        // Spread condicional — só adiciona o filtro se o valor foi informado
        ...(team_id && { team_id }),
        // is_active usa !== undefined pois false é um valor válido e deve ser filtrado
        ...(is_active !== undefined && { is_active }),
        // Busca por nome case-insensitive (ex: "joao" encontra "João")
        ...(name && { name: { contains: name, mode: "insensitive" } }),
        ...(cpf && { cpf }),
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
    });
  },

  async findById(id: string) {
    return prisma.customers.findUnique({
      where: { id },
      // Inclui leads relacionados para exibir histórico do customer
      include: { leads: true },
    });
  },

  // Método dedicado para checagem de CPF duplicado no service
  async findByCpf(cpf: string) {
    return prisma.customers.findUnique({
      where: { cpf },
    });
  },

  async create(data: CreateCustomerDTO) {
    return prisma.customers.create({
      data,
    });
  },

  async update(id: string, data: UpdateCustomerDTO) {
    return prisma.customers.update({
      where: { id },
      data,
    });
  },

  // Soft delete: mantém o registro no banco, apenas desativa o customer
  async softDelete(id: string) {
    return prisma.customers.update({
      where: { id },
      data: { is_active: false },
    });
  },
};