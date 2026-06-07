// server/src/modules/negotiation-status/status.service.ts
import {
  NegotiationStatusRepository,
  type StatusListItem,
  type StatusDetail,
} from "./status.repository";
import { NegotiationsRepository } from "../negotiation/negotiation.repository";
import type {
  CreateNegotiationStatusDTO,
  UpdateNegotiationStatusDTO,
  QueryNegotiationStatusDTO,
} from "./status.dto";
import { ALLOWED_STATUS_TRANSITIONS, isClosedStatus } from "./status.dto";
import {
  RecursoNaoEncontradoError,
  BusinessRuleError,
  AcessoNaoAutorizadoError,
} from "../../middlewares/errors/domainErrors.middleware";
import type { ActorContext } from "../negotiation/negotiation.service";

// ─────────────────────────────────────────────
// NEGOTIATION STATUS SERVICE
// ─────────────────────────────────────────────

// ──────────────────────────────────────────────────────
// MATRIZ DE PERMISSÕES
// ──────────────────────────────────────────────────────
//
// | Operação        | ATTENDANT      | MANAGER          | GENERAL_MANAGER | ADMIN |
// |-----------------|----------------|------------------|-----------------|-------|
// | Listar          | só suas neg.   | só do time       | tudo            | tudo  |
// | Ler por ID      | só suas neg.   | só do time       | tudo            | tudo  |
// | Criar status    | só suas neg.   | só do time       | tudo            | tudo  |
// | Editar (notas)  | só suas neg.   | só do time       | tudo            | tudo  |
// | Deletar         | ✗              | ✗                | ✗               | sim   |
//
// Observação: o caminho normal de fechamento (won/lost) é disparado
// automaticamente pelo módulo de ESTÁGIOS ao registrar fechamento_com_venda /
// fechamento_sem_venda (createWithAutoClose). Este endpoint cobre os ajustes
// manuais de status: abrir (new→open) e reabrir (won/lost→open, privilegiado).

// ──────────────────────────────────────────────────────
// SHAPE MÍNIMO PARA GUARDS DE ESCOPO
// ──────────────────────────────────────────────────────

interface NegotiationScopeSnapshot {
  id: string;
  team_id: string;
  attendant_id: string | null;
  lead_id: string;
  // Último status — usado para validações de regra de negócio.
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

export const NegotiationStatusService = {
  // ──────────────────────────────────────────────────────
  // LISTAGEM
  // ──────────────────────────────────────────────────────

  async findAll(
    filters: QueryNegotiationStatusDTO,
    actor: ActorContext
  ): Promise<StatusListItem[]> {
    if (filters.negotiation_id) {
      const negotiation = await loadNegotiationOrThrow(filters.negotiation_id);
      assertCanRead(negotiation, actor);
    }

    return NegotiationStatusRepository.findAll(filters);
  },

  // ──────────────────────────────────────────────────────
  // LEITURA POR ID
  // ──────────────────────────────────────────────────────

  async findById(id: string, actor: ActorContext): Promise<StatusDetail> {
    const statusRecord = await NegotiationStatusRepository.findById(id);

    if (!statusRecord) {
      throw new RecursoNaoEncontradoError("Histórico de status não encontrado.");
    }

    const snap = buildSnapshot(statusRecord);
    assertCanRead(snap, actor);

    return statusRecord;
  },

  // ──────────────────────────────────────────────────────
  // CRIAR NOVO STATUS
  // ──────────────────────────────────────────────────────
  //
  // Regras de negócio aplicadas em ordem:
  //   1. Negociação deve existir
  //   2. Actor deve ter escopo sobre ela
  //   3. [RN] Não pode repetir o status atual (registro duplicado seguido)
  //   4. [RN] A transição precisa ser válida (ver ALLOWED_STATUS_TRANSITIONS)
  //   5. [RN] Reabrir (won/lost → open) é privilégio de MANAGER ou acima
  //   6. Cria o registro com lead_id derivado da negociação (sync 1:1 no repo)

  async create(
    data: CreateNegotiationStatusDTO,
    actor: ActorContext
  ): Promise<StatusDetail> {
    // 1. Carrega a negociação pai com o status mais recente
    const negotiation = await loadNegotiationOrThrow(data.negotiation_id);

    // 2. Valida escopo do actor
    assertCanWrite(negotiation, actor);

    const current = lastStatus(negotiation);
    const target = data.status_negotiation;

    // 3. [RN] Impede registro duplicado seguido
    if (current === target) {
      throw new BusinessRuleError(
        `A negociação já possui o status "${target}". Nenhuma alteração foi necessária.`
      );
    }

    // 4. [RN] Transição precisa ser permitida pela máquina de estados
    const from = current ?? "__none__";
    const allowed = ALLOWED_STATUS_TRANSITIONS[from] ?? [];
    if (!allowed.includes(target)) {
      throw new BusinessRuleError(
        `Transição de status inválida: "${current ?? "indefinido"}" → "${target}".`
      );
    }

    // 5. [RN] Reabertura de negociação encerrada é operação privilegiada
    if (
      current &&
      isClosedStatus(current) &&
      target === "open" &&
      actor.role === "ATTENDANT"
    ) {
      throw new AcessoNaoAutorizadoError(
        "Atendentes não podem reabrir uma negociação encerrada. Solicite a um gerente."
      );
    }

    // 6. Cria o registro — lead_id derivado da negociação
    return NegotiationStatusRepository.create({
      ...data,
      lead_id: negotiation.lead_id,
      created_by_user_id: actor.id,
    });
  },

  // ──────────────────────────────────────────────────────
  // ATUALIZAR REGISTRO (apenas notas)
  // ──────────────────────────────────────────────────────

  async update(
    id: string,
    data: UpdateNegotiationStatusDTO,
    actor: ActorContext
  ): Promise<StatusDetail> {
    const statusRecord = await NegotiationStatusRepository.findById(id);

    if (!statusRecord) {
      throw new RecursoNaoEncontradoError("Histórico de status não encontrado.");
    }

    const snap = buildSnapshot(statusRecord);
    assertCanWrite(snap, actor);

    return NegotiationStatusRepository.update(id, {
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
        "Apenas administradores podem excluir registros do histórico de status."
      );
    }

    const statusRecord = await NegotiationStatusRepository.findById(id);

    if (!statusRecord) {
      throw new RecursoNaoEncontradoError("Histórico de status não encontrado.");
    }

    return NegotiationStatusRepository.delete(id);
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

// Reconstrói o snapshot a partir de um StatusDetail já carregado.
function buildSnapshot(statusRecord: StatusDetail): NegotiationScopeSnapshot {
  const n = statusRecord.negotiations;
  return {
    id: n.id,
    team_id: n.team_id,
    attendant_id: n.attendant_id,
    lead_id: n.lead_id,
    // StatusDetail inclui stage_history (não status_history) no include da
    // negociação. Os guards de escopo só precisam de team_id/attendant_id;
    // passamos array vazio para satisfazer o tipo.
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
        "Você só pode visualizar histórico de status de negociações dos times que gerencia."
      );
    }
    return;
  }

  // ATTENDANT
  if (negotiation.attendant_id !== actor.id) {
    throw new AcessoNaoAutorizadoError(
      "Você só pode visualizar o histórico de status das suas próprias negociações."
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
        "Você só pode registrar status em negociações dos times que gerencia."
      );
    }
    return;
  }

  // ATTENDANT
  if (negotiation.attendant_id !== actor.id) {
    throw new AcessoNaoAutorizadoError(
      "Você só pode registrar status nas suas próprias negociações."
    );
  }
}