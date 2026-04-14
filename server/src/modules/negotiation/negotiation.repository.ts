import { prisma } from "../config/prisma.js";
import type { CreateNegotiationDTO, UpdateNegotiationDTO } from "../modules/negotiation/negotiation.dto.js";

export class NegotiationsRepository {
    async findAll(filters: { team_id?: string | undefined; status?: string | undefined; is_open?: boolean | undefined}) {
        return prisma.negotiations.findMany({
            where: {
                team_id: filters.team_id,
                status: filters.status,
                is_open: filters.is_open,
            },
            include: { leads: true },
            orderBy: { created_at: 'desc'},
        });
    }

    async findById(id: string){
        return prisma.negotiations.findUnique({
            where: {id},
            include: {
                leads: { include : {customers: true}},
                stage_history: { orderBy: { created_at: 'desc'}},
            },
        });
    }

    async create(data: CreateNegotiationDTO, userId: string) {
        return prisma.negotiations.create({
            data: {
                ...data,
                created_by_user_id: userId,
            },
        });
    }

    async update(id: string, data: UpdateNegotiationDTO, userId: string) {
        return prisma.negotiations.update({
            where: { id },
            data: {
                ...data,
                updated_by_user_id: userId,
            },
        });
    }

    async updateStatus(id: string, status: string, notes: string | undefined, userId: string) {
        return prisma.$transaction(async (tx) => {
            const current = await tx.negotiations.findUnique({ where: { id }});
            
            const updated = await tx.negotiations.update({
                where: {id},
                data: {
                    status,
                    updated_by_user_id: userId
                },
            });

            await tx.negotiationStageHistory.create({
                data: {
                    negotiation_id: id,
                    old_status: current?.status,
                    new_status: status,
                    notes,
                    created_by_user_id: userId,
                },
            });
            return updated;
        });
    }
}