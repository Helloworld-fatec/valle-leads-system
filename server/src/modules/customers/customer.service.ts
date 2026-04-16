import { CustomersRepository } from "./customer.repository";
import {
  CreateCustomerDTO,
  UpdateCustomerDTO,
  QueryCustomerDTO,
} from "./customer.dtos";
import {
  RecursoNaoEncontradoError,
  ConflitoDeDadosError,
  RequisicaoInvalidaError,
} from "../../middlewares/errors/globalError.middleware";

// ─────────────────────────────────────────────
// CUSTOMER SERVICE
// ─────────────────────────────────────────────

export const CustomersService = {
  async findAll(filters: QueryCustomerDTO) {
    return CustomersRepository.findAll(filters);
  },

  async findById(id: string) {
    const customer = await CustomersRepository.findById(id);

    if (!customer) {
      throw new RecursoNaoEncontradoError("Cliente não encontrado.");
    }

    return customer;
  },

  async create(data: CreateCustomerDTO) {
    // CPF é opcional, mas se informado deve ser único no sistema
    if (data.cpf) {
      const existing = await CustomersRepository.findByCpf(data.cpf);

      if (existing) {
        throw new ConflitoDeDadosError("Já existe um cliente cadastrado com esse CPF.");
      }
    }

    return CustomersRepository.create(data);
  },

  async update(id: string, data: UpdateCustomerDTO) {
    const customer = await CustomersRepository.findById(id);

    if (!customer) {
      throw new RecursoNaoEncontradoError("Cliente não encontrado.");
    }

    // Só verifica duplicidade de CPF se um novo CPF foi informado
    // e é diferente do CPF atual do cliente
    if (data.cpf && data.cpf !== customer.cpf) {
      const existing = await CustomersRepository.findByCpf(data.cpf);

      if (existing) {
        throw new ConflitoDeDadosError("Já existe um cliente cadastrado com esse CPF.");
      }
    }

    return CustomersRepository.update(id, data);
  },

  async softDelete(id: string) {
    const customer = await CustomersRepository.findById(id);

    if (!customer) {
      throw new RecursoNaoEncontradoError("Cliente não encontrado.");
    }

    // Evita operação desnecessária no banco se já estiver inativo
    if (!customer.is_active) {
      throw new RequisicaoInvalidaError("Cliente já está inativo.");
    }

    return CustomersRepository.softDelete(id);
  },
};