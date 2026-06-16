// server/src/middlewares/log/log.middleware.ts
import type { Response, NextFunction, RequestHandler } from "express";
import type { AuthRequest } from "../auth/auth.middleware.js";
import { prisma } from "../../config/prisma.js";

// ─────────────────────────────────────────────
// LOG MIDDLEWARE
// ─────────────────────────────────────────────
// Grava registros assíncronos na tabela `system_logs` (model SystemLogs).
//
// Design:
//   - Não-bloqueante: erros de log NUNCA interrompem a resposta ao cliente.
//     A gravação usa `.catch()` e falha silenciosa com log no console.
//   - Lazy: o log só é inserido DEPOIS que a resposta é enviada, usando
//     o evento `res.on("finish")`. Isso garante que:
//       a) o `user_id` já foi resolvido (authMiddleware rodou);
//       b) não atrasa o tempo de resposta percebido pelo cliente.
//   - Flexível: `createLogMiddleware(options)` é uma factory — cada rota
//     define seu próprio `action` e `module`. A `description` pode ser
//     estática ou uma função que recebe `req` para gerar texto dinâmico.
//   - IP real: tenta extrair o IP do header `x-forwarded-for` (proxies/load
//     balancers) antes de cair no `socket.remoteAddress`.
//
// Campos gravados (mapeados para schema.prisma → SystemLogs):
//   action             → string livre, ex.: "CREATE_USER", "DELETE_LEAD"
//   module             → string livre, ex.: "users", "leads", "negotiations"
//   description        → texto opcional; pode ser dinâmico via função
//   ip_address         → IP extraído da requisição
//   user_id            → req.user.id (se autenticado); null em rotas públicas
//   created_by_user_id → mesmo valor que user_id (convenção do projeto)
//
// Uso:
//   router.post(
//     "/",
//     authMiddleware,
//     checkRole("ADMIN"),
//     validateBody(createUserSchema),
//     createLogMiddleware({ action: "CREATE_USER", module: "users" }),
//     controller.create,
//   );
//
//   // Com descrição dinâmica:
//   createLogMiddleware({
//     action: "UPDATE_USER",
//     module: "users",
//     description: (req) => `Usuário ${req.params.id} atualizado`,
//   })
// ─────────────────────────────────────────────

// ─── TIPOS ─────────────────────────────────────────────

export interface LogOptions {
  /** Identificador da ação, ex.: "CREATE_USER", "SOFT_DELETE_LEAD". */
  action: string;

  /** Módulo/domínio da ação, ex.: "users", "leads", "negotiations". */
  module: string;

  /**
   * Descrição opcional. Pode ser:
   *   - string estática: "Criação de usuário"
   *   - função que recebe req e retorna string: (req) => `ID: ${req.params.id}`
   */
  description?: string | ((req: AuthRequest) => string);
}

// ─── HELPER: extração de IP ────────────────────────────

function extractIp(req: AuthRequest): string | null {
  // x-forwarded-for pode ter múltiplos IPs (client, proxy1, proxy2...)
  // O primeiro é o IP real do cliente.
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    const first = Array.isArray(forwarded)
      ? forwarded[0]
      : forwarded.split(",")[0];
    return first?.trim() ?? null;
  }

  return req.socket?.remoteAddress ?? null;
}

// ─── HELPER: resolução da descrição ───────────────────

function resolveDescription(
  req: AuthRequest,
  description: LogOptions["description"]
): string | null {
  if (!description) return null;
  if (typeof description === "function") return description(req);
  return description;
}

// ─── FACTORY PRINCIPAL ────────────────────────────────

/**
 * Retorna um middleware Express que grava um registro em `system_logs`
 * de forma assíncrona e não-bloqueante após a resposta ser enviada.
 *
 * @param options - Configuração do log (action, module, description).
 */
export function createLogMiddleware(options: LogOptions): RequestHandler {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Aguarda o envio da resposta para não bloquear o cliente
    res.on("finish", () => {
      const userId = req.user?.id ?? null;
      const ipAddress = extractIp(req);
      const description = resolveDescription(req, options.description);

      prisma.systemLogs
        .create({
          data: {
            action: options.action,
            module: options.module,
            description,
            ip_address: ipAddress,
            user_id: userId,
            created_by_user_id: userId,
          },
        })
        .catch((err: unknown) => {
          // Log nunca deve derrubar a aplicação — falha silenciosa + aviso
          console.error(
            `[log.middleware] Falha ao gravar log "${options.action}":`,
            err
          );
        });
    });

    next();
  };
}

// ─── AÇÕES PRÉ-DEFINIDAS (constantes opcionais) ────────
// Centraliza os nomes de action para evitar typos espalhados pelas routes.
// Use se preferir; não é obrigatório.
//
// Exemplo de uso nas routes:
//   createLogMiddleware({ action: LOG_ACTIONS.users.CREATE, module: LOG_MODULES.USERS })

export const LOG_MODULES = {
  USERS: "users",
  STORES: "stores",
  TEAMS: "teams",
  USERS_TEAMS: "users_teams",
  CUSTOMERS: "customers",
  LEADS: "leads",
  INTEREST_ITEMS: "interest_items",
  NEGOTIATIONS: "negotiations",
  NEGOTIATION_STATUS: "negotiation_status",
  NEGOTIATION_STAGE: "negotiation_stage",
  NEGOTIATION_IMPORTANCE: "negotiation_importance",
  AUTH: "auth",
} as const;

export const LOG_ACTIONS = {
  users: {
    LIST:        "LIST_USERS",
    GET:         "GET_USER",
    CREATE:      "CREATE_USER",
    UPDATE:      "UPDATE_USER",
    SOFT_DELETE: "SOFT_DELETE_USER",
    HARD_DELETE: "HARD_DELETE_USER",
  },
  stores: {
    LIST:        "LIST_STORES",
    GET:         "GET_STORE",
    CREATE:      "CREATE_STORE",
    UPDATE:      "UPDATE_STORE",
    SOFT_DELETE: "SOFT_DELETE_STORE",
    HARD_DELETE: "HARD_DELETE_STORE",
  },
  teams: {
    LIST:        "LIST_TEAMS",
    GET:         "GET_TEAM",
    CREATE:      "CREATE_TEAM",
    UPDATE:      "UPDATE_TEAM",
    SOFT_DELETE: "SOFT_DELETE_TEAM",
    HARD_DELETE: "HARD_DELETE_TEAM",
  },
  customers: {
    LIST:        "LIST_CUSTOMERS",
    GET:         "GET_CUSTOMER",
    CREATE:      "CREATE_CUSTOMER",
    UPDATE:      "UPDATE_CUSTOMER",
    SOFT_DELETE: "SOFT_DELETE_CUSTOMER",
  },
  leads: {
    LIST:        "LIST_LEADS",
    GET:         "GET_LEAD",
    CREATE:      "CREATE_LEAD",
    UPDATE:      "UPDATE_LEAD",
    SOFT_DELETE: "SOFT_DELETE_LEAD",
  },
  negotiations: {
    LIST:        "LIST_NEGOTIATIONS",
    GET:         "GET_NEGOTIATION",
    CREATE:      "CREATE_NEGOTIATION",
    UPDATE:      "UPDATE_NEGOTIATION",
  },
  auth: {
    LOGIN:         "LOGIN",
    LOGOUT:        "LOGOUT",
    REFRESH_TOKEN: "REFRESH_TOKEN",
  },
} as const;