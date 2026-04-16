// server/src/modules/customers/customer.repository.ts
import { prisma } from '../../config/prisma.js';
import {
  CreateCustomerDTO,
  UpdateCustomerDTO,
  QueryCustomerDTO,
} from "./customer.dtos.js";

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
    // 1. Remove qualquer propriedade que seja 'undefined' para respeitar o TS estrito
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    return prisma.customers.create({
      data: cleanData as any, // O prisma aceita os campos opcionais mesmo sem o cleanData, mas o cast é necessário para evitar erro de tipo
    });
  },

  async update(id: string, data: UpdateCustomerDTO) {
    // 1. Remove qualquer propriedade que seja 'undefined' para respeitar o TS estrito
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );

    return prisma.customers.update({
      where: { id },
      data: cleanData,
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