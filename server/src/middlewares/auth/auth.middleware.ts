// server/src/middlewares/auth/auth.middleware.ts
import type { Request, Response, NextFunction } from "express";
import type { ParamsDictionary } from "express-serve-static-core";
import jwt, { type SignOptions, type JwtPayload } from "jsonwebtoken";
import { AcessoNaoAutorizadoError } from "../errors/domainErrors.middleware.js";

// ─────────────────────────────────────────────
// AUTH MIDDLEWARE
// ─────────────────────────────────────────────
// Dono completo do ciclo de vida do JWT no sistema.
//
// Responsabilidades expostas:
//   - signAccessToken / signRefreshToken → emitir tokens
//   - verifyToken                         → validar tokens
//   - TOKEN_CONFIG                        → expor tempos de expiração
//   - authMiddleware                      → exigir autenticação numa rota
//   - optionalAuthMiddleware              → autenticação opcional
//   - AuthRequest                         → tipagem do req.user pros controllers
//
// Decisões de segurança:
//   - Dois segredos DIFERENTES (ACCESS e REFRESH) — invalidar um não
//     compromete o outro.
//   - Claim `type` embarcada → defesa contra reuso de refresh como access.
//   - Erros do `jsonwebtoken` são traduzidos em AcessoNaoAutorizadoError
//     → globalErrorHandler responde 403.
// ─────────────────────────────────────────────

// ─── MODULE AUGMENTATION ──────────────────────────────
// Estende o namespace global do Express para que `req.user` seja tipado
// corretamente em TODOS os lugares sem criar uma interface filha que
// conflita com `Request` quando `exactOptionalPropertyTypes: true` está ativo.
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      role: string;
      team_ids: string[];
    }
  }
}

// ─── ENV VARS (validadas uma única vez no boot) ───────
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN ?? "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d";

if (!ACCESS_TOKEN_SECRET) {
  throw new Error("ACCESS_TOKEN_SECRET não definida no .env");
}
if (!REFRESH_TOKEN_SECRET) {
  throw new Error("REFRESH_TOKEN_SECRET não definida no .env");
}
if (ACCESS_TOKEN_SECRET === REFRESH_TOKEN_SECRET) {
  throw new Error(
    "ACCESS_TOKEN_SECRET e REFRESH_TOKEN_SECRET devem ser diferentes"
  );
}

// ─── TIPOS PÚBLICOS ────────────────────────────────────
export type TokenKind = "access" | "refresh";

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  team_ids: string[];
}

export interface FullPayload extends TokenPayload {
  type: TokenKind;
}

// AuthRequest repassa o parâmetro genérico de Params do Express.
// Isso permite que os controllers usem AuthRequest<{ id: string }>
// para tipar req.params sem intersections manuais, mantendo req.user
// garantido via module augmentation acima.
//
// Parâmetros do genérico de Request (na ordem):
//   P  = Params    (req.params)
//   B  = ReqBody   (req.body)   — não usamos; deixamos never p/ forçar cast explícito
//   Q  = ReqQuery  (req.query)  — idem
//   L  = Locals    (res.locals) — idem
export type AuthRequest<
  P = ParamsDictionary,
  B = unknown,
  Q = qs.ParsedQs,
  L extends Record<string, unknown> = Record<string, unknown>,
> = Request<P, unknown, B, Q, L>;

// Configuração exposta pra quem precisar (ex.: controller devolvendo `expires_in`)
export const TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
} as const;

// ─── SIGN ──────────────────────────────────────────────

export function signAccessToken(payload: TokenPayload): string {
  return signToken(payload, "access");
}

export function signRefreshToken(payload: TokenPayload): string {
  return signToken(payload, "refresh");
}

function signToken(payload: TokenPayload, kind: TokenKind): string {
  const secret =
    kind === "access" ? ACCESS_TOKEN_SECRET! : REFRESH_TOKEN_SECRET!;

  // Com `exactOptionalPropertyTypes: true`, montar um objeto `SignOptions`
  // inline falha porque `expiresIn` é `number | StringValue | undefined` na
  // definição do tipo — e `undefined` não é assignable quando a flag está ativa.
  // Solução: passar as opções diretamente no jwt.sign com cast pontual,
  // evitando a criação de um objeto intermediário tipado como SignOptions.
  const expiresIn =
    kind === "access" ? ACCESS_TOKEN_EXPIRES_IN : REFRESH_TOKEN_EXPIRES_IN;

  const fullPayload: FullPayload = { ...payload, type: kind };

  return jwt.sign(fullPayload, secret, {
    expiresIn,
    subject: payload.id,
  } as SignOptions);
}

// ─── VERIFY ────────────────────────────────────────────

/**
 * Verifica assinatura, expiração e o claim "type" do token.
 * Lança AcessoNaoAutorizadoError em qualquer falha — globalErrorHandler
 * responde com HTTP 403 e mensagem padronizada.
 */
export function verifyToken(
  token: string,
  expectedKind: TokenKind
): FullPayload {
  const secret =
    expectedKind === "access" ? ACCESS_TOKEN_SECRET! : REFRESH_TOKEN_SECRET!;

  let decoded: JwtPayload | string;
  try {
    decoded = jwt.verify(token, secret);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new AcessoNaoAutorizadoError(`Token expirado (${expectedKind}).`);
    }
    throw new AcessoNaoAutorizadoError(`Token inválido (${expectedKind}).`);
  }

  if (typeof decoded === "string" || !decoded || decoded.type !== expectedKind) {
    throw new AcessoNaoAutorizadoError("Token inválido: tipo incorreto.");
  }

  const { id, email, role, team_ids } = decoded as FullPayload;
  if (!id || !email || !role || !Array.isArray(team_ids)) {
    throw new AcessoNaoAutorizadoError("Token mal formado.");
  }

  return decoded as FullPayload;
}

// ─── HELPER INTERNO ────────────────────────────────────
function extractBearerToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header) return null;

  // Aceita "Bearer <token>" — case-insensitive no esquema
  const [scheme, token] = header.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer") return null;
  if (!token) return null;

  return token.trim();
}

// ─── MIDDLEWARE OBRIGATÓRIO ────────────────────────────
/**
 * Exige autenticação. Sem token válido, a rota não é acessada.
 * Usado em todas as rotas protegidas.
 */
export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      throw new AcessoNaoAutorizadoError(
        "Token de acesso ausente ou mal formado."
      );
    }

    const payload = verifyToken(token, "access");

    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      team_ids: payload.team_ids,
    };

    next();
  } catch (error) {
    next(error);
  }
}

// ─── MIDDLEWARE OPCIONAL ───────────────────────────────
/**
 * Versão "branda": se houver token válido, injeta req.user; se não houver,
 * deixa passar sem erro. Útil em endpoints públicos que mudam de comportamento
 * conforme o usuário esteja autenticado ou não.
 */
export function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const token = extractBearerToken(req);
  if (!token) return next();

  try {
    const payload = verifyToken(token, "access");
    req.user = {
      id: payload.id,
      email: payload.email,
      role: payload.role,
      team_ids: payload.team_ids,
    };
  } catch {
    // Token inválido em rota opcional → ignora e segue como anônimo
  }

  next();
}