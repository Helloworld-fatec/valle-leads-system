// server/src/modules/negotiation-stage-history/negotiationStageHistory.service.ts
import {
  NegotiationStageHistoryRepository,
  type StageHistoryListItem,
  type StageHistoryDetail,
} from "./negotiationStageHistory.repository";
import { NegotiationsRepository } from "../negotiation/negotiation.repository";
import type {
  CreateNegotiationStageHistoryDTO,
  UpdateNegotiationStageHistoryDTO,
  QueryNegotiationStageHistoryDTO,
  NegotiationStage,
} from "./negotiationStageHistory.dto";
import { isClosingStage, CLOSING_STAGE_TO_STATUS } from "./negotiationStageHistory.dto";
import { isClosedStatus } from "../negotiation-status/status.dto";
import {
  RecursoNaoEncontradoError,
  BusinessRuleError,
  AcessoNaoAutorizadoError,
} from "../../middlewares/errors/domainErrors.middleware";
import type { ActorContext } from "../negotiation/negotiation.service";

// ─────────────────────────────────────────────
// NEGOTIATION STAGE HISTORY SERVICE
// ─────────────────────────────────────────────

// ──────────────────────────────────────────────────────
// MATRIZ DE PERMISSÕES
// ──────────────────────────────────────────────────────
//
// | Operação        | ATTENDANT      | MANAGER          | GENERAL_MANAGER | ADMIN |
// |-----------------|----------------|------------------|-----------------|-------|
// | Listar          | só suas neg.   | só do time       | tudo            | tudo  |
// | Ler por ID      | só suas neg.   | só do time       | tudo            | tudo  |
// | Criar estágio   | só suas neg.   | só do time       | tudo            | tudo  |
// | Editar (notas)  | só suas neg.   | só do time       | tudo            | tudo  |
// | Deletar         | ✗              | ✗                | ✗               | sim   |

// ──────────────────────────────────────────────────────
// SHAPE MÍNIMO PARA GUARDS DE ESCOPO
// ──────────────────────────────────────────────────────

interface NegotiationScopeSnapshot {
  id: string;
  team_id: string;
  attendant_id: string | null;
  lead_id: string;
  // Último status — usado para checar se a negociação já está encerrada.
  status_history: { status_negotiation: string }[];
}

// ──────────────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────────────

function lastStatus(
  negotiation: NegotiationScopeSnapshot
): string | undefined {
  return negotiation.status_history[0]?.status_negotiation;
}

export const NegotiationStageHistoryService = {
  // ──────────────────────────────────────────────────────
  // LISTAGEM
  // ──────────────────────────────────────────────────────

  async findAll(
    filters: QueryNegotiationStageHistoryDTO,
    actor: ActorContext
  ): Promise<StageHistoryListItem[]> {
    if (filters.negotiation_id) {
      const negotiation = await loadNegotiationOrThrow(filters.negotiation_id);
      assertCanRead(negotiation, actor);
    }

    return NegotiationStageHistoryRepository.findAll(filters);
  },

  // ──────────────────────────────────────────────────────
  // LEITURA POR ID
  // ──────────────────────────────────────────────────────

  async findById(id: string, actor: ActorContext): Promise<StageHistoryDetail> {
    const stageHistory =
      await NegotiationStageHistoryRepository.findById(id);

    if (!stageHistory) {
      throw new RecursoNaoEncontradoError(
        "Histórico de estágio não encontrado."
      );
    }

    const snap = buildSnapshot(stageHistory);
    assertCanRead(snap, actor);

    return stageHistory;
  },

  // ──────────────────────────────────────────────────────
  // CRIAR NOVO ESTÁGIO
  // ──────────────────────────────────────────────────────
  //
  // Fluxo:
  //   1. Carrega a negociação pai (valida existência + escopo do actor)
  //   2. [RN] Bloqueia se a negociação já está encerrada (won/lost)
  //   3. Deriva old_stage automaticamente (último estágio registrado)
  //   4. Estágio de fechamento → cria estágio + status terminal (won/lost) +
  //      sync do lead, tudo em transação atômica (createWithAutoClose)
  //   5. Caso contrário → cria apenas o registro de estágio (create)

  async create(
    data: CreateNegotiationStageHistoryDTO,
    actor: ActorContext
  ): Promise<StageHistoryDetail> {
    // 1. Carrega negociação pai com status mais recente
    const negotiation = await loadNegotiationOrThrow(data.negotiation_id);

    // 2. Valida escopo do actor
    assertCanWrite(negotiation, actor);

    // 3. [RN] Impede adicionar estágio em negociação encerrada (won/lost)
    const current = lastStatus(negotiation);
    if (current && isClosedStatus(current)) {
      throw new BusinessRuleError(
        "Não é possível adicionar um novo estágio a uma negociação já encerrada (ganha ou perdida)."
      );
    }

    // 4. Deriva old_stage do último registro (se não vier no body).
    //    O cast é seguro por invariante de domínio: a coluna new_stage só é
    //    escrita por este service com valores do enum NegotiationStage.
    let resolvedOldStage: NegotiationStage | null = data.old_stage ?? null;
    if (resolvedOldStage === null) {
      const lastStage =
        await NegotiationStageHistoryRepository.findCurrentByNegotiationId(
          data.negotiation_id
        );
      resolvedOldStage =
        (lastStage?.new_stage ?? null) as NegotiationStage | null;
    }

    const payload = {
      negotiation_id: data.negotiation_id,
      lead_id: negotiation.lead_id,
      old_stage: resolvedOldStage,
      new_stage: data.new_stage,
      notes: data.notes,
      created_by_user_id: actor.id,
    };

    // 5. Estágio de fechamento → derivação do status + transação atômica.
    //    isClosingStage estreita data.new_stage para ClosingStage, então o
    //    acesso a CLOSING_STAGE_TO_STATUS é totalmente tipado (won | lost).
    if (isClosingStage(data.new_stage)) {
      const closingStatus = CLOSING_STAGE_TO_STATUS[data.new_stage];
      const statusNotes =
        closingStatus === "won"
          ? "Negociação encerrada automaticamente: fechamento com venda."
          : "Negociação encerrada automaticamente: fechamento sem venda.";

      return NegotiationStageHistoryRepository.createWithAutoClose({
        ...payload,
        closingStatus,
        statusNotes,
      });
    }

    // 6. Estágio normal (não altera o status macro da negociação/lead)
    return NegotiationStageHistoryRepository.create(payload);
  },

  // ──────────────────────────────────────────────────────
  // ATUALIZAR REGISTRO (apenas notas)
  // ──────────────────────────────────────────────────────

  async update(
    id: string,
    data: UpdateNegotiationStageHistoryDTO,
    actor: ActorContext
  ): Promise<StageHistoryDetail> {
    const stageHistory =
      await NegotiationStageHistoryRepository.findById(id);

    if (!stageHistory) {
      throw new RecursoNaoEncontradoError(
        "Histórico de estágio não encontrado."
      );
    }

    const snap = buildSnapshot(stageHistory);
    assertCanWrite(snap, actor);

    return NegotiationStageHistoryRepository.update(id, {
      notes: data.notes,
      updated_by_user_id: actor.id,
    });
  },

  // ──────────────────────────────────────────────────────
  // DELETAR (apenas ADMIN)
  // ──────────────────────────────────────────────────────

  async delete(id: string, actor: ActorContext): Promise<void> {
    if (actor.role !== "ADMIN") {
      throw new AcessoNaoAutorizadoError(
        "Apenas administradores podem excluir registros do histórico de estágios."
      );
    }

    const stageHistory =
      await NegotiationStageHistoryRepository.findById(id);

    if (!stageHistory) {
      throw new RecursoNaoEncontradoError(
        "Histórico de estágio não encontrado."
      );
    }

    return NegotiationStageHistoryRepository.delete(id);
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

function buildSnapshot(
  stageHistory: StageHistoryDetail
): NegotiationScopeSnapshot {
  const n = stageHistory.negotiations;
  return {
    id: n.id,
    team_id: n.team_id,
    attendant_id: n.attendant_id,
    lead_id: n.lead_id,
    status_history: n.status_history,
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
        "Você só pode visualizar histórico de estágios de negociações dos times que gerencia."
      );
    }
    return;
  }

  // ATTENDANT
  if (negotiation.attendant_id !== actor.id) {
    throw new AcessoNaoAutorizadoError(
      "Você só pode visualizar o histórico de estágios das suas próprias negociações."
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
        "Você só pode registrar estágios em negociações dos times que gerencia."
      );
    }
    return;
  }

  // ATTENDANT
  if (negotiation.attendant_id !== actor.id) {
    throw new AcessoNaoAutorizadoError(
      "Você só pode registrar estágios nas suas próprias negociações."
    );
  }
}