// server/src/modules/negotiation-importance/importance.service.ts
import {
  NegotiationImportanceRepository,
  type ImportanceListItem,
  type ImportanceDetail,
} from "./importance.repository";
import { NegotiationsRepository } from "../negotiation/negotiation.repository";
import type {
  CreateNegotiationImportanceDTO,
  UpdateNegotiationImportanceDTO,
  QueryNegotiationImportanceDTO,
} from "./importance.dto";
import {
  RecursoNaoEncontradoError,
  BusinessRuleError,
  AcessoNaoAutorizadoError,
} from "../../middlewares/errors/domainErrors.middleware";
import type { ActorContext } from "../negotiation/negotiation.service";

// ─────────────────────────────────────────────
// NEGOTIATION IMPORTANCE SERVICE
// ─────────────────────────────────────────────

// ──────────────────────────────────────────────────────
// MATRIZ DE PERMISSÕES
// ──────────────────────────────────────────────────────
//
// | Operação          | ATTENDANT      | MANAGER          | GENERAL_MANAGER | ADMIN |
// |-------------------|----------------|------------------|-----------------|-------|
// | Listar            | só suas neg.   | só do time       | tudo            | tudo  |
// | Ler por ID        | só suas neg.   | só do time       | tudo            | tudo  |
// | Criar importância | só suas neg.   | só do time       | tudo            | tudo  |
// | Editar (notas)    | só suas neg.   | só do time       | tudo            | tudo  |
// | Deletar           | ✗              | ✗                | ✗               | sim   |

// ──────────────────────────────────────────────────────
// SHAPE MÍNIMO PARA GUARDS DE ESCOPO
// ──────────────────────────────────────────────────────

interface NegotiationScopeSnapshot {
  id: string;
  team_id: string;
  attendant_id: string | null;
  lead_id: string;
  // Último status — usado para checar se a negociação está fechada.
  status_history: { status_negotiation: string }[];
}

// ──────────────────────────────────────────────────────
// HELPER
// ──────────────────────────────────────────────────────

function lastStatus(
  negotiation: NegotiationScopeSnapshot
): string | undefined {
  return negotiation.status_history[0]?.status_negotiation;
}

export const NegotiationImportanceService = {
  // ──────────────────────────────────────────────────────
  // LISTAGEM
  // ──────────────────────────────────────────────────────
  // Se o actor filtrar por negotiation_id, valida o escopo antes de consultar.

  async findAll(
    filters: QueryNegotiationImportanceDTO,
    actor: ActorContext
  ): Promise<ImportanceListItem[]> {
    if (filters.negotiation_id) {
      const negotiation = await loadNegotiationOrThrow(filters.negotiation_id);
      assertCanRead(negotiation, actor);
    }

    return NegotiationImportanceRepository.findAll(filters);
  },

  // ──────────────────────────────────────────────────────
  // LEITURA POR ID
  // ──────────────────────────────────────────────────────

  async findById(id: string, actor: ActorContext): Promise<ImportanceDetail> {
    const importanceRecord =
      await NegotiationImportanceRepository.findById(id);

    if (!importanceRecord) {
      throw new RecursoNaoEncontradoError(
        "Histórico de importância não encontrado."
      );
    }

    const snap = buildSnapshot(importanceRecord);
    assertCanRead(snap, actor);

    return importanceRecord;
  },

  // ──────────────────────────────────────────────────────
  // CRIAR NOVO NÍVEL DE IMPORTÂNCIA
  // ──────────────────────────────────────────────────────
  //
  // Regras de negócio aplicadas em ordem:
  //   1. Negociação deve existir
  //   2. Actor deve ter escopo sobre ela
  //   3. [RN] Não pode alterar importância de negociação encerrada
  //   4. [RN17] Impede registro duplicado seguido (mesmo nível do atual)
  //   5. Cria o registro com lead_id derivado da negociação

  async create(
    data: CreateNegotiationImportanceDTO,
    actor: ActorContext
  ): Promise<ImportanceDetail> {
    // 1. Carrega a negociação pai com o status mais recente
    const negotiation = await loadNegotiationOrThrow(data.negotiation_id);

    // 2. Valida escopo do actor
    assertCanWrite(negotiation, actor);

    // 3. [RN] Impede alteração de importância em negociação encerrada
    if (lastStatus(negotiation) === "closed") {
      throw new BusinessRuleError(
        "Não é possível alterar a importância de uma negociação que já está encerrada."
      );
    }

    // 4. [RN17] Impede registro duplicado seguido
    const current =
      await NegotiationImportanceRepository.findCurrentByNegotiationId(
        data.negotiation_id
      );

    if (current && current.importance === data.importance) {
      throw new BusinessRuleError(
        `A negociação já possui a importância "${data.importance}". Nenhuma alteração foi necessária.`
      );
    }

    // 5. Cria o registro — lead_id derivado da negociação
    return NegotiationImportanceRepository.create({
      ...data,
      lead_id: negotiation.lead_id,
      created_by_user_id: actor.id,
    });
  },

  // ──────────────────────────────────────────────────────
  // ATUALIZAR REGISTRO (apenas notas)
  // ──────────────────────────────────────────────────────
  // importance é imutável após o registro — alterar retroativamente
  // distorceria a linha do tempo e a lógica de "último = atual".

  async update(
    id: string,
    data: UpdateNegotiationImportanceDTO,
    actor: ActorContext
  ): Promise<ImportanceDetail> {
    const importanceRecord =
      await NegotiationImportanceRepository.findById(id);

    if (!importanceRecord) {
      throw new RecursoNaoEncontradoError(
        "Histórico de importância não encontrado."
      );
    }

    const snap = buildSnapshot(importanceRecord);
    assertCanWrite(snap, actor);

    return NegotiationImportanceRepository.update(id, {
      notes: data.notes,
      updated_by_user_id: actor.id,
    });
  },

  // ──────────────────────────────────────────────────────
  // DELETAR (apenas ADMIN)
  // ──────────────────────────────────────────────────────
  // Excluir um registro histórico pode adulterar o nível atual da negociação
  // (se for o mais recente). Restrito ao ADMIN por segurança.

  async delete(id: string, actor: ActorContext): Promise<void> {
    if (actor.role !== "ADMIN") {
      throw new AcessoNaoAutorizadoError(
        "Apenas administradores podem excluir registros do histórico de importância."
      );
    }

    const importanceRecord =
      await NegotiationImportanceRepository.findById(id);

    if (!importanceRecord) {
      throw new RecursoNaoEncontradoError(
        "Histórico de importância não encontrado."
      );
    }

    return NegotiationImportanceRepository.delete(id);
  },
};

// ──────────────────────────────────────────────────────
// HELPERS INTERNOS
// ──────────────────────────────────────────────────────

async function loadNegotiationOrThrow(
  negotiationId: string
): Promise<NegotiationScopeSnapshot> {
  const repo = new NegotiationsRepository();
  const negotiation = await repo.findById(negotiationId);

  if (!negotiation) {
    throw new RecursoNaoEncontradoError("Negociação pai não encontrada.");
  }

  return {
    id: negotiation.id,
    team_id: negotiation.team_id,
    attendant_id: negotiation.attendant_id,
    lead_id: negotiation.lead_id,
    status_history: negotiation.status_history,
  };
}

// Reconstrói o snapshot a partir de um ImportanceDetail já carregado.
// O include traz negotiations com status_history vazio neste módulo —
// para os guards de escopo só precisamos de team_id e attendant_id,
// por isso passamos array vazio para satisfazer o tipo.
function buildSnapshot(
  importanceRecord: ImportanceDetail
): NegotiationScopeSnapshot {
  const n = importanceRecord.negotiations;
  return {
    id: n.id,
    team_id: n.team_id,
    attendant_id: n.attendant_id,
    lead_id: n.lead_id,
    status_history: [],
  };
}

// ──────────────────────────────────────────────────────
// GUARDS DE RBAC
// ──────────────────────────────────────────────────────

function assertCanRead(
  negotiation: NegotiationScopeSnapshot,
  actor: ActorContext
): void {
  if (actor.role === "ADMIN" || actor.role === "GENERAL_MANAGER") return;

  if (actor.role === "MANAGER") {
    if (!actor.team_ids.includes(negotiation.team_id)) {
      throw new AcessoNaoAutorizadoError(
        "Você só pode visualizar histórico de importância de negociações dos times que gerencia."
      );
    }
    return;
  }

  // ATTENDANT
  if (negotiation.attendant_id !== actor.id) {
    throw new AcessoNaoAutorizadoError(
      "Você só pode visualizar o histórico de importância das suas próprias negociações."
    );
  }
}

function assertCanWrite(
  negotiation: NegotiationScopeSnapshot,
  actor: ActorContext
): void {
  if (actor.role === "ADMIN" || actor.role === "GENERAL_MANAGER") return;

  if (actor.role === "MANAGER") {
    if (!actor.team_ids.includes(negotiation.team_id)) {
      throw new AcessoNaoAutorizadoError(
        "Você só pode registrar importância em negociações dos times que gerencia."
      );
    }
    return;
  }

  // ATTENDANT
  if (negotiation.attendant_id !== actor.id) {
    throw new AcessoNaoAutorizadoError(
      "Você só pode registrar importância nas suas próprias negociações."
    );
  }
}
