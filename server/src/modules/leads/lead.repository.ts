import { prisma } from "../../config/prisma";
import { CreateLeadDTO, UpdateLeadDTO, QueryLeadDTO } from "./lead.dtos";

// ─────────────────────────────────────────────
// LEADS REPOSITORY
// ─────────────────────────────────────────────

// Select reutilizável para o atendente — evita expor password_hash
const attendantSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
} as const;

export const LeadsRepository = {
  async findAll(filters: QueryLeadDTO) {
    const {
      team_id,
      status,
      attendant_id,
      customer_id,
      interest_item_id,
      is_active,
      page = 1,
      limit = 20,
    } = filters;

    return prisma.leads.findMany({
      where: {
        ...(team_id && { team_id }),
        ...(status && { status }),
        ...(attendant_id && { attendant_id }),
        ...(customer_id && { customer_id }),
        ...(interest_item_id && { interest_item_id }),
        ...(is_active !== undefined && { is_active }),
      },
      include: {
        customers: true,
        attendant: { select: attendantSelect },
        interest_item: true,
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
        attendant: { select: attendantSelect },
        interest_item: true,
        negotiations: true,
      },
    });
  },

  async create(dto: CreateLeadDTO) {
    return prisma.leads.create({
      data: {
        status: dto.status,
        customer_id: dto.customer_id,
        team_id: dto.team_id,
        source: dto.source ?? null,
        attendant_id: dto.attendant_id ?? null,
        interest_item_id: dto.interest_item_id ?? null,
      },
      include: {
        customers: true,
        attendant: { select: attendantSelect },
        interest_item: true,
      },
    });
  },

  async update(id: string, dto: UpdateLeadDTO) {
    return prisma.leads.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
        ...(dto.source !== undefined && { source: dto.source ?? null }),
        ...(dto.attendant_id !== undefined && { attendant_id: dto.attendant_id ?? null }),
        ...(dto.interest_item_id !== undefined && { interest_item_id: dto.interest_item_id ?? null }),
      },
      include: {
        customers: true,
        attendant: { select: attendantSelect },
        interest_item: true,
      },
    });
  },

  async softDelete(id: string) {
    return prisma.leads.update({
      where: { id },
      data: { is_active: false },
    });
  },
};
