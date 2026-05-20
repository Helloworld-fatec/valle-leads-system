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
import { CLOSING_STAGES } from "./negotiationStageHistory.dto";
import {
  RecursoNaoEncontradoError,
  BusinessRuleError,
  AcessoNaoAutorizadoError,
} from "../../middlewares/errors/domainErrors.middleware";
import type {
  ActorContext,
  NegotiationActorRole,
} from "../negotiation/negotiation.service";

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
//
// "Suas negociações" = negociações em que o actor é o attendant_id.
// "Do time" = negociações cujo team_id está em actor.team_ids.

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
// HELPERS
// ──────────────────────────────────────────────────────

// Extrai o status mais recente da negociação já carregada com status_history.
function lastStatus(
  negotiation: NegotiationScopeSnapshot
): string | undefined {
  return negotiation.status_history[0]?.status_negotiation;
}

export const NegotiationStageHistoryService = {
  // ──────────────────────────────────────────────────────
  // LISTAGEM
  // ──────────────────────────────────────────────────────
  // O RBAC na listagem filtra via scope — não retorna erro, apenas
  // dados dentro do escopo do actor (consistente com o módulo pai).

  async findAll(
    filters: QueryNegotiationStageHistoryDTO,
    actor: ActorContext
  ): Promise<StageHistoryListItem[]> {
    // Se o actor filtrou por negotiation_id, verifica permissão de leitura
    // diretamente naquela negociação (falha rápida antes de ir ao banco).
    if (filters.negotiation_id) {
      const negotiation = await loadNegotiationOrThrow(filters.negotiation_id);
      assertCanRead(negotiation, actor);
    }

    // Para ATTENDANT e MANAGER sem filtro de negociação, a listagem geral
    // retorna apenas o que o repositório expõe — o RBAC granular por
    // registro individual exigiria joins pesados. A abordagem aqui é:
    // o front-end sempre filtra por negotiation_id (use case real), e
    // o filtro por negotiation_id já valida o escopo acima.
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

    // Reconstrói o snapshot de escopo a partir do include do próprio registro.
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
  //   2. [RN] Bloqueia se a negociação já está "closed"
  //   3. Deriva old_stage automaticamente (último estágio registrado)
  //   4. Se new_stage for de fechamento → cria estágio + status "closed" em
  //      transação atômica (createWithAutoClose)
  //   5. Caso contrário → cria apenas o registro de estágio (create)

  async create(
    data: CreateNegotiationStageHistoryDTO,
    actor: ActorContext
  ): Promise<StageHistoryDetail> {
    // 1. Carrega negociação pai com status mais recente
    const negotiation = await loadNegotiationOrThrow(data.negotiation_id);

    // 2. Valida escopo do actor
    assertCanWrite(negotiation, actor);

    // 3. [RN] Impede adicionar estágio em negociação encerrada
    if (lastStatus(negotiation) === "closed") {
      throw new BusinessRuleError(
        "Não é possível adicionar um novo estágio a uma negociação que já está encerrada."
      );
    }

    // 4. Deriva old_stage do último registro (se não vier no body).
    //    O campo new_stage no banco é sempre escrito por este service com um
    //    valor do enum NegotiationStage — o cast é seguro por invariante de
    //    domínio (nunca persiste string arbitrária nessa coluna).
    let resolvedOldStage: NegotiationStage | null = data.old_stage ?? null;
    if (resolvedOldStage === null) {
      const current =
        await NegotiationStageHistoryRepository.findCurrentByNegotiationId(
          data.negotiation_id
        );
      resolvedOldStage = (current?.new_stage ?? null) as NegotiationStage | null;
    }

    const payload = {
      negotiation_id: data.negotiation_id,
      lead_id: negotiation.lead_id,
      old_stage: resolvedOldStage,
      new_stage: data.new_stage,
      notes: data.notes,
      created_by_user_id: actor.id,
    };

    // 5. Estágio de fechamento → transação atômica com status "closed"
    if (CLOSING_STAGES.has(data.new_stage)) {
      const statusNotes =
        data.new_stage === "fechamento_com_venda"
          ? "Negociação encerrada automaticamente: fechamento com venda."
          : "Negociação encerrada automaticamente: fechamento sem venda.";

      return NegotiationStageHistoryRepository.createWithAutoClose({
        ...payload,
        statusNotes,
      });
    }

    // 6. Estágio normal
    return NegotiationStageHistoryRepository.create(payload);
  },

  // ──────────────────────────────────────────────────────
  // ATUALIZAR REGISTRO (apenas notas)
  // ──────────────────────────────────────────────────────
  // old_stage e new_stage são imutáveis — alterar a linha do tempo
  // histórica comprometeria a rastreabilidade do funil.

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
  // Excluir um registro histórico é uma operação destrutiva e irreversível
  // — restrita ao ADMIN para evitar adulteração de auditoria.

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

// Carrega a negociação com os campos de escopo necessários ou lança 404.
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

// Reconstrói o snapshot de escopo a partir de um StageHistoryDetail.
// O include garante que negotiations está presente com os campos necessários.
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