// server/src/modules/users/users.routes.ts
import { Router } from "express";
import { UsersController } from "./users.controller.js";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../../middlewares/validation/validate.middleware.js";
import {
  createUserSchema,
  updateUserSchema,
  updateSelfSchema,
  listUsersQuerySchema,
  userIdParamSchema,
} from "./users.dto.js";

// Os middlewares abaixo serão implementados na Etapa 3.
// Quando estiverem prontos, basta descomentar os imports e os usos nas rotas.
//
// import { authMiddleware } from "../../middlewares/auth/auth.middleware.js";
// import { checkPermission } from "../../middlewares/auth/permission.middleware.js";

// ─────────────────────────────────────────────
// USERS ROUTES
// ─────────────────────────────────────────────
// Ordem importa: rotas específicas (/me) ANTES de rotas com param (/:id).
//
// Pipeline padrão de cada rota:
//   1. authMiddleware            → injeta req.user a partir do JWT
//   2. checkPermission(role)     → garante o nível mínimo de acesso
//   3. validateParams/Body/Query → valida e tipa entrada (Zod)
//   4. controller                → orquestra e responde
//
// Toda regra de RBAC granular (ex.: "manager só vê o próprio time") fica
// duplicada no service por segurança — o middleware filtra o grosso, o service
// aplica o detalhe (princípio de defesa em profundidade).
// ─────────────────────────────────────────────

const router = Router();
const usersController = new UsersController();

// ─── ROTAS DO PRÓPRIO USUÁRIO AUTENTICADO ──────────────
// GET /users/me — qualquer usuário autenticado
router.get(
  "/me",
  // authMiddleware,
  usersController.findMe.bind(usersController)
);

// PATCH /users/me — qualquer usuário pode atualizar o próprio perfil (RF01)
router.patch(
  "/me",
  // authMiddleware,
  validateBody(updateSelfSchema),
  usersController.updateSelf.bind(usersController)
);

// ─── LISTAGEM / LEITURA ────────────────────────────────
// GET /users — listagem paginada (ADMIN, GENERAL_MANAGER, MANAGER)
router.get(
  "/",
  // authMiddleware,
  // checkPermission("MANAGER"),
  validateQuery(listUsersQuerySchema),
  usersController.findAll.bind(usersController)
);

// GET /users/:id — detalhe
router.get(
  "/:id",
  // authMiddleware,
  validateParams(userIdParamSchema),
  usersController.findById.bind(usersController)
);

// ─── ESCRITA (ADMIN / MANAGER) ─────────────────────────
// POST /users — criação (ADMIN ou MANAGER com restrições aplicadas no service)
router.post(
  "/",
  // authMiddleware,
  // checkPermission("MANAGER"),
  validateBody(createUserSchema),
  usersController.create.bind(usersController)
);

// PUT /users/:id — atualização administrativa
router.put(
  "/:id",
  // authMiddleware,
  // checkPermission("MANAGER"),
  validateParams(userIdParamSchema),
  validateBody(updateUserSchema),
  usersController.update.bind(usersController)
);

// ─── EXCLUSÃO (apenas ADMIN) ───────────────────────────
// DELETE /users/:id — soft delete
router.delete(
  "/:id",
  // authMiddleware,
  // checkPermission("ADMIN"),
  validateParams(userIdParamSchema),
  usersController.softDelete.bind(usersController)
);

export default router;
