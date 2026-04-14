import { prisma } from "../../../config/prisma.js";

export class UsersRepository {

    async findAll() {
        return prisma.user.findMany({
            where: { is_active: true }
        });
    }

    async findById(id: number) {
        return prisma.user.findUnique({
            where: { id }
        });
    }

    async findByEmail(email: string) {
        return prisma.user.findUnique({
            where: { email }
        });
    }

    async create(data: any) {
        return prisma.user.create({
            data
        });
    }

    async update(id: number, data: any) {
        return prisma.user.update({
            where: { id },
            data
        });
    }

    async softDelete(id: number) {
        return prisma.user.update({
            where: { id },
            data: { is_active: false }
        });
    }
}