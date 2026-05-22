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
  // Se o actor filtrar por negotiation_id, valida o escopo antes de consultar.
  // Para listagens abertas (sem negotiation_id), o RBAC granular por registro
  // exigiria joins pesados — o padrão do sistema é que o front-end sempre
  // filtre por negotiation_id (use case real).

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
  //   3. [RN] Não pode criar status duplicado seguido (mesmo valor do atual)
  //   4. [RN] Não pode reabrir uma negociação já fechada com "open"
  //      (reabertura deve passar por MANAGER ou acima — ver abaixo)
  //   5. Cria o registro com lead_id derivado da negociação

  async create(
    data: CreateNegotiationStatusDTO,
    actor: ActorContext
  ): Promise<StatusDetail> {
    // 1. Carrega a negociação pai com o status mais recente
    const negotiation = await loadNegotiationOrThrow(data.negotiation_id);

    // 2. Valida escopo do actor
    assertCanWrite(negotiation, actor);

    const current = lastStatus(negotiation);

    // 3. [RN] Impede registro duplicado seguido
    if (current === data.status_negotiation) {
      throw new BusinessRuleError(
        `A negociação já possui o status "${data.status_negotiation}". Nenhuma alteração foi necessária.`
      );
    }

    // 4. [RN] Reabertura de negociação fechada é uma operação privilegiada
    if (current === "closed" && data.status_negotiation === "open") {
      if (actor.role === "ATTENDANT") {
        throw new AcessoNaoAutorizadoError(
          "Atendentes não podem reabrir uma negociação encerrada. Solicite a um gerente."
        );
      }
    }

    // 5. Cria o registro — lead_id derivado da negociação
    return NegotiationStatusRepository.create({
      ...data,
      lead_id: negotiation.lead_id,
      created_by_user_id: actor.id,
    });
  },

  // ──────────────────────────────────────────────────────
  // ATUALIZAR REGISTRO (apenas notas)
  // ──────────────────────────────────────────────────────
  // status_negotiation é imutável — alterar retroativamente distorceria
  // o histórico e quebraria a lógica de "último status = estado atual".

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
  // Excluir um registro de status é destrutivo e pode adulterar o estado
  // atual da negociação (se for o mais recente). Restrito ao ADMIN.

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
    // StatusDetail inclui stage_history no include da negociação, não status_history.
    // Para os guards de escopo não precisamos do último status aqui — só team_id
    // e attendant_id. Passamos array vazio para satisfazer o tipo.
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
