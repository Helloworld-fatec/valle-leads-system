import { prisma } from '../../config/prisma';
import {
  CreateLeadDTO,
  UpdateLeadDTO,
  QueryLeadDTO,
} from "./lead.dtos";

// ─────────────────────────────────────────────
// LEADS REPOSITORY
// ─────────────────────────────────────────────

export const LeadsRepository = {
  async findAll(filters: QueryLeadDTO) {
    const {
      team_id,
      status,
      attendant_id,
      customer_id,
      is_active,
      page = 1,
      limit = 20,
    } = filters;

    return prisma.leads.findMany({
      where: {
        // Spread condicional — só adiciona o filtro se o valor foi informado
        ...(team_id && { team_id }),
        ...(status && { status }),
        ...(attendant_id && { attendant_id }),
        ...(customer_id && { customer_id }),
        // is_active usa !== undefined pois false é um valor válido e deve ser filtrado
        ...(is_active !== undefined && { is_active }),
      },
      include: {
        customers: true,
        // Seleciona apenas campos públicos do attendant — nunca expor password_hash
        attendant: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { created_at: "desc" },
    });
  },

  async findById(id: string) {
    return prisma.leads.findUnique({
      where: { id },
      include: {
        customers: true,
        teams: true,
        // Seleciona apenas campos públicos do attendant — nunca expor password_hash
        attendant: {
          select: { id: true, name: true, email: true, role: true },
        },
        // Inclui negotiations para exibir histórico completo do lead
        negotiations: true,
      },
    });
  },

  async create(data: CreateLeadDTO) {
    return prisma.leads.create({
      data,
    });
  },

  async update(id: string, data: UpdateLeadDTO) {
    return prisma.leads.update({
      where: { id },
      data,
    });
  },

  // Soft delete: mantém o registro no banco, apenas desativa o lead
  async softDelete(id: string) {
    return prisma.leads.update({
      where: { id },
      data: { is_active: false },
    });
  },
};