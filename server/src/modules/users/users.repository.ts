import { prisma } from "../../config/prisma.js";

export class UsersRepository {

    async findAll() {
        return prisma.users.findMany({
            where: { is_active: true }
        });
    }

    async findById(id: string) {
        return prisma.users.findUnique({
            where: { id }
        });
    }

    async findByEmail(email: string) {
        return prisma.users.findUnique({
            where: { email }
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