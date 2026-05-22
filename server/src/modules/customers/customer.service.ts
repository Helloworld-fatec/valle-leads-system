// src/modules/customers/customer.service.ts
import { Prisma } from "../../config/prisma.js";
import { CustomersRepository, type CustomerWithRelations, type CustomerRow } from "./customer.repository.js";
import type {
  CreateCustomerDTO,
  UpdateCustomerDTO,
  QueryCustomerDTO,
} from "./customer.dto.js";
import {
  RecursoNaoEncontradoError,
  ConflitoDeDadosError,
  BusinessRuleError,
} from "../../middlewares/errors/domainErrors.middleware.js";

export const CustomersService = {
  async findAll(filters: QueryCustomerDTO): Promise<CustomerRow[]> {
    return CustomersRepository.findAll(filters);
  },

  async findById(id: string): Promise<CustomerWithRelations> {
    const customer = await CustomersRepository.findById(id);
    if (!customer) {
      throw new RecursoNaoEncontradoError("Cliente não encontrado.");
    }
    return customer;
  },

  async create(data: CreateCustomerDTO, actorId: string): Promise<CustomerRow> {
    if (data.cpf) {
      const existing = await CustomersRepository.findByCpf(data.cpf);
      if (existing) {
        throw new ConflitoDeDadosError(
          "Já existe um cliente cadastrado com esse CPF."
        );
      }
    }

    const existingPhone = await CustomersRepository.findByPhone(data.phone);
    if (existingPhone) {
      throw new ConflitoDeDadosError(
        "Já existe um cliente cadastrado com esse telefone."
      );
    }

    return CustomersRepository.create({ dto: data, actorId });
  },

  async update(
    id: string,
    data: UpdateCustomerDTO,
    actorId: string
  ): Promise<CustomerRow> {
    const customer = await CustomersRepository.findLightById(id);
    if (!customer) {
      throw new RecursoNaoEncontradoError("Cliente não encontrado.");
    }

    if (data.cpf !== undefined && data.cpf !== null && data.cpf !== customer.cpf) {
      const existing = await CustomersRepository.findByCpf(data.cpf);
      if (existing) {
        throw new ConflitoDeDadosError(
          "Já existe um cliente cadastrado com esse CPF."
        );
      }
    }

    return CustomersRepository.update({ id, dto: data, actorId });
  },

  async softDelete(id: string, actorId: string): Promise<void> {
    const customer = await CustomersRepository.findLightById(id);
    if (!customer) {
      throw new RecursoNaoEncontradoError("Cliente não encontrado.");
    }
    if (!customer.is_active) {
      throw new BusinessRuleError("Cliente já está inativo.");
    }

    await CustomersRepository.softDelete({ id, actorId });
  },

  async hardDelete(id: string): Promise<void> {
    const customer = await CustomersRepository.findLightById(id);
    if (!customer) {
      throw new RecursoNaoEncontradoError("Cliente não encontrado.");
    }

    try {
      await CustomersRepository.hardDelete(id);
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2003"
      ) {
        throw new BusinessRuleError(
          "Não é possível excluir o cliente permanentemente pois existem leads ou negociações vinculados."
        );
      }
      throw err;
    }
  },
};