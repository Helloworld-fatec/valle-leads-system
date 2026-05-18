import { LeadsRepository } from "./lead.repository";
import { CustomersRepository } from "../customers/customer.repository";
import { InterestItemsRepository } from "../interest-items/item.repository";
import { CreateLeadDTO, UpdateLeadDTO, QueryLeadDTO } from "./lead.dtos";
import {
  RecursoNaoEncontradoError,
  RequisicaoInvalidaError,
} from "../../middlewares/errors/domainErrors.middleware";

// ─────────────────────────────────────────────
// LEADS SERVICE
// ─────────────────────────────────────────────

export const LeadsService = {
  async findAll(filters: QueryLeadDTO) {
    return LeadsRepository.findAll(filters);
  },

  async findById(id: string) {
    const lead = await LeadsRepository.findById(id);

    if (!lead) {
      throw new RecursoNaoEncontradoError("Lead não encontrado.");
    }

    return lead;
  },

  async create(data: CreateLeadDTO) {
    // Regra: lead só pode ser criado para um customer ativo
    const customer = await CustomersRepository.findById(data.customer_id);

    if (!customer) {
      throw new RecursoNaoEncontradoError("Cliente não encontrado.");
    }

    if (!customer.is_active) {
      throw new RequisicaoInvalidaError(
        "Não é possível criar um lead para um cliente inativo."
      );
    }

    // Regra: se informado, o item de interesse deve existir e estar ativo
    if (data.interest_item_id) {
      const item = await InterestItemsRepository.findById(data.interest_item_id);

      if (!item) {
        throw new RecursoNaoEncontradoError("Item de interesse não encontrado.");
      }

      if (!item.is_active) {
        throw new RequisicaoInvalidaError(
          "Não é possível vincular um item de interesse inativo ao lead."
        );
      }
    }

    // ⚠️ TODO: validar se team_id existe e está ativo.
    // Aguardando TeamsRepository para importar e checar aqui.
    // Enquanto isso, erros de FK do Prisma são capturados pelo error.middleware.ts.

    return LeadsRepository.create(data);
  },

  async update(id: string, data: UpdateLeadDTO) {
    const lead = await LeadsRepository.findById(id);

    if (!lead) {
      throw new RecursoNaoEncontradoError("Lead não encontrado.");
    }

    // Regra: se estiver trocando o item de interesse, valida o novo
    if (data.interest_item_id) {
      const item = await InterestItemsRepository.findById(data.interest_item_id);

      if (!item) {
        throw new RecursoNaoEncontradoError("Item de interesse não encontrado.");
      }

      if (!item.is_active) {
        throw new RequisicaoInvalidaError(
          "Não é possível vincular um item de interesse inativo ao lead."
        );
      }
    }

    return LeadsRepository.update(id, data);
  },

  async softDelete(id: string) {
    const lead = await LeadsRepository.findById(id);

    if (!lead) {
      throw new RecursoNaoEncontradoError("Lead não encontrado.");
    }

    // Evita operação desnecessária no banco se já estiver inativo
    if (!lead.is_active) {
      throw new RequisicaoInvalidaError("Lead já está inativo.");
    }

    return LeadsRepository.softDelete(id);
  },
};
