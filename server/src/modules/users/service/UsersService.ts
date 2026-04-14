import { UsersRepository } from "../repository/UsersRepository.js";
import type { CreateUserDTO, UpdateUserDTO } from "../dtos/UsersDTO.js";
import bcrypt from "bcrypt";

export class UsersService {
    private usersRepository = new UsersRepository();

    async create(data: CreateUserDTO) {
        // 1. Verificar se email já existe
        const userExists = await this.usersRepository.findByEmail(data.email);

        if (userExists) {
            throw new Error("Email já cadastrado");
        }

        // 2. Criptografar senha
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // 3. Criar usuário
        return this.usersRepository.create({
            ...data,
            password: hashedPassword
        });
    }

    async findAll() {
        return this.usersRepository.findAll();
    }

    async findById(id: number) {
        return this.usersRepository.findById(id);
    }

    async update(id: number, data: UpdateUserDTO) {
        return this.usersRepository.update(id, data);
    }

    async softDelete(id: number) {
        return this.usersRepository.softDelete(id);
    }
}