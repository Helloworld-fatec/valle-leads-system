// server/src/modules/users/users.repository.ts
import { prisma } from "../../config/prisma.js";

export class UsersRepository {

    async findAll() {
        return prisma.users.findMany({
            where: { is_active: true },
            include: {
                user_teams: {
                    include: {
                        team: true // Traz os dados do time associado através da tabela pivô
                    }
                }
            }
        });
    }

    async findById(id: string) {
        return prisma.users.findUnique({
            where: { id },
            include: {
                user_teams: {
                    include: {
                        team: true // Traz os dados do time associado através da tabela pivô
                    }
                }
            }
        });
    }

    async findByEmail(email: string) {
        return prisma.users.findUnique({
            where: { email },
            include: {
                user_teams: {
                    include: {
                        team: true
                    }
                }
            }
        });
    }

    async create(data: any) {
        return prisma.users.create({
            data
        });
    }

    async update(id: string, data: any) {
        return prisma.users.update({
            where: { id },
            data
        });
    }

    async softDelete(id: string) {
        return prisma.users.update({
            where: { id },
            data: { is_active: false }
        });
    }
}