// server/src/middlewares/auth/permission.middleware.ts
import type { Response, NextFunction, RequestHandler } from "express";
import type { AuthRequest } from "./auth.middleware.js";
import { AcessoNaoAutorizadoError } from "../errors/domainErrors.middleware.js";

// ─────────────────────────────────────────────
// PERMISSION MIDDLEWARE
// ─────────────────────────────────────────────
// Aplica o controle de acesso baseado em papéis (RBAC — RF02) no backend.
// SEMPRE deve vir DEPOIS do authMiddleware na pipeline da rota
// (precisa de req.user populado).
//
// Dois modos de uso:
//
//   1) checkPermission(level)  — verificação HIERÁRQUICA
//      "tem nível pelo menos X". Útil quando a regra é monotônica
//      (quem tem mais privilégios também tem os menores).
//      Ex.: GET /users   → checkPermission("MANAGER")
//           qualquer um a partir de MANAGER lê (MANAGER, GENERAL_MANAGER, ADMIN)
//
//   2) checkRole(...roles)     — verificação EXPLÍCITA
//      "tem QUALQUER UM destes roles". Útil quando a hierarquia
//      não resolve — por exemplo, GENERAL_MANAGER NÃO pode criar
//      usuários, mas MANAGER e ADMIN podem. Hierarquia pura falha aqui.
//      Ex.: POST /users  → checkRole("MANAGER", "ADMIN")
//
// Importante: estes middlewares fazem o "grosso" da filtragem;
// os services ainda aplicam regras granulares (escopo por times,
// edição apenas do próprio team etc.) — defesa em profundidade,
// conforme implementado na Etapa 1.
// ─────────────────────────────────────────────

// Hierarquia dos 4 perfis do desafio (RF02).
// Quanto MAIOR o número, maior o nível de acesso.
const ACCESS_LEVELS_RANKING = {
  ADMIN: 4,
  GENERAL_MANAGER: 3,
  MANAGER: 2,
  ATTENDANT: 1,
} as const;

export type AccessLevel = keyof typeof ACCESS_LEVELS_RANKING;

// ─── checkPermission (HIERÁRQUICO) ─────────────────────
/**
 * Retorna um middleware que checa se o usuário autenticado tem o nível
 * de acesso HIERARQUICAMENTE igual ou superior ao exigido.
 *
 * @param requiredLevel Nível mínimo (ATTENDANT | MANAGER | GENERAL_MANAGER | ADMIN)
 *
 * Exemplo:
 *   router.get("/dashboard", authMiddleware, checkPermission("MANAGER"), ctrl.get);
 *   → ADMIN, GENERAL_MANAGER e MANAGER passam; ATTENDANT recebe 403.
 */
export function checkPermission(requiredLevel: AccessLevel): RequestHandler {
  const requiredRank = ACCESS_LEVELS_RANKING[requiredLevel];

  // Salvaguarda de configuração — se alguém passar um nível inexistente,
  // retorna um middleware que SEMPRE bloqueia (com 500), para que o erro
  // apareça já na primeira chamada e não passe despercebido.
  if (!requiredRank) {
    console.error(`Nível de permissão inválido configurado: ${requiredLevel}`);
    return (_req, res, _next) => {
      res.status(500).json({
        status: "error",
        message: "Erro interno de configuração de permissão.",
      });
    };
  }

  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    // 1. Sanidade: authMiddleware deveria ter rodado antes
    if (!req.user || !req.user.role) {
      next(new AcessoNaoAutorizadoError("Autenticação necessária."));
      return;
    }

    const userRole = req.user.role as AccessLevel;
    const userRank = ACCESS_LEVELS_RANKING[userRole];

    if (!userRank) {
      // Token traz role desconhecida — trata como negação por segurança
      next(
        new AcessoNaoAutorizadoError(
          "Perfil de acesso inválido."
        )
      );
      return;
    }

    if (userRank >= requiredRank) {
      next();
      return;
    }

    next(
      new AcessoNaoAutorizadoError(
        "Acesso negado. Nível de permissão insuficiente."
      )
    );
  };
}

// ─── checkRole (EXPLÍCITO / NÃO HIERÁRQUICO) ───────────
/**
 * Retorna um middleware que aprova somente se o role do usuário estiver
 * exatamente na lista fornecida. Usado quando a hierarquia não cabe.
 *
 * Exemplo (caso do desafio):
 *   // GENERAL_MANAGER é hierarquicamente acima de MANAGER, mas NÃO pode
 *   // criar usuários — então não dá pra usar checkPermission("MANAGER").
 *   router.post("/users", authMiddleware, checkRole("MANAGER", "ADMIN"), ctrl.create);
 *
 * @param allowedRoles Lista de roles que podem acessar a rota.
 */
export function checkRole(...allowedRoles: AccessLevel[]): RequestHandler {
  if (allowedRoles.length === 0) {
    console.error("checkRole foi chamado sem nenhum role.");
    return (_req, res, _next) => {
      res.status(500).json({
        status: "error",
        message: "Erro interno de configuração de permissão.",
      });
    };
  }

  // Valida na inicialização que todos os roles fornecidos existem
  const invalid = allowedRoles.filter((r) => !(r in ACCESS_LEVELS_RANKING));
  if (invalid.length > 0) {
    console.error(`Roles inválidos em checkRole: ${invalid.join(", ")}`);
    return (_req, res, _next) => {
      res.status(500).json({
        status: "error",
        message: "Erro interno de configuração de permissão.",
      });
    };
  }

  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.role) {
      next(new AcessoNaoAutorizadoError("Autenticação necessária."));
      return;
    }

    if (allowedRoles.includes(req.user.role as AccessLevel)) {
      next();
      return;
    }

    next(
      new AcessoNaoAutorizadoError(
        "Acesso negado. Seu perfil não tem permissão para esta operação."
      )
    );
  };
}
