// server/src/modules/leads/lead.repository.ts
import { prisma } from '../../config/prisma';
import {
  CreateLeadDTO,
  UpdateLeadDTO,
  QueryLeadDTO,
} from "./lead.dtos";

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
        ...(team_id && { team_id }),
        ...(status && { status }),
        ...(attendant_id && { attendant_id }),
        ...(customer_id && { customer_id }),
        ...(is_active !== undefined && { is_active }),
      },
      include: {
        customers: true,
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
        attendant: {
          select: { id: true, name: true, email: true, role: true },
        },
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

        // 👇 normalização obrigatória
        source: dto.source ?? null,
        vehicle_interest: dto.vehicle_interest ?? null,
        attendant_id: dto.attendant_id ?? null,
      },
    });
  },

  async update(id: string, dto: UpdateLeadDTO) {
    return prisma.leads.update({
      where: { id },
      data: {
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),

        // 👇 normalização obrigatória
        ...(dto.source !== undefined && { source: dto.source ?? null }),
        ...(dto.vehicle_interest !== undefined && {
          vehicle_interest: dto.vehicle_interest ?? null,
        }),
        ...(dto.attendant_id !== undefined && {
          attendant_id: dto.attendant_id ?? null,
        }),
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