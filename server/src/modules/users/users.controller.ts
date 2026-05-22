// src/modules/users/users.controller.ts
import type { Response, NextFunction } from "express";
import { UsersService, type ActorContext } from "./users.service.js";
import type { AuthRequest } from "../../middlewares/auth/auth.middleware.js";
import type {
  CreateUserDTO,
  UpdateUserAdminDTO,
  UpdateSelfDTO,
  ListUsersQueryDTO,
  UserIdParamDTO,
  UserRole,
} from "./users.dto.js";

// ─────────────────────────────────────────────
// USERS CONTROLLER
// ─────────────────────────────────────────────
// Responsabilidade ÚNICA: extrair dados da request, delegar ao service,
// devolver a resposta HTTP. Nenhuma regra de negócio aqui.
//
// Dois fluxos de update:
//   PUT/PATCH /:id  com actor.role === "ADMIN"  → updateAdmin (campos completos)
//   PUT/PATCH /:id  com qualquer role, id=self  → updateSelf  (perfil próprio)
//
// O controller escolhe o fluxo; o service aplica as regras de cada um.
// ─────────────────────────────────────────────

const VALID_USER_ROLES: ReadonlyArray<UserRole> = [
  "ATTENDANT",
  "MANAGER",
  "GENERAL_MANAGER",
  "ADMIN",
];

function isUserRole(role: string): role is UserRole {
  return (VALID_USER_ROLES as ReadonlyArray<string>).includes(role);
}

export class UsersController {
  private service = new UsersService();

  private getActor(req: AuthRequest): ActorContext {
    const user = req.user!;
    if (!isUserRole(user.role)) {
      throw new Error(`Role desconhecido no token: ${user.role}`);
    }
    return { id: user.id, role: user.role };
  }

  // ─── POST /users ─────────────────────────────────
  create = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const body = req.body as CreateUserDTO;
      const user = await this.service.create(body, actor);
      res.status(201).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };

  // ─── GET /users ───────────────────────────────────
  findAll = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const query = req.query as unknown as ListUsersQueryDTO;
      const result = await this.service.findAll(query, actor);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  };

  // ─── GET /users/:id ───────────────────────────────
  findById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const { id } = req.params as unknown as UserIdParamDTO;
      const user = await this.service.findById(id, actor);
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };

  // ─── PUT/PATCH /users/:id ─────────────────────────
  // Lógica de roteamento entre os dois fluxos de update:
  //   - ADMIN editando qualquer ID   → updateAdmin (campos completos)
  //   - qualquer role no próprio ID  → updateSelf  (sem campos sensíveis)
  //   - qualquer outra combinação    → o service de updateAdmin rejeita (403)
  //
  // Para não-ADMIN editando id alheio, deixamos cair no updateAdmin que
  // lança AcessoNaoAutorizadoError imediatamente. Isso evita duplicar a
  // verificação de "id é o próprio" aqui no controller.
  update = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const { id } = req.params as unknown as UserIdParamDTO;

      if (actor.role === "ADMIN") {
        // ADMIN sempre usa o fluxo completo, independente de editar o próprio
        const body = req.body as UpdateUserAdminDTO;
        const user = await this.service.updateAdmin(id, body, actor);
        res.status(200).json({ success: true, data: user });
        return;
      }

      if (actor.id === id) {
        // Qualquer role editando o próprio cadastro
        const body = req.body as UpdateSelfDTO;
        const user = await this.service.updateSelf(body, actor);
        res.status(200).json({ success: true, data: user });
        return;
      }

      // Não-ADMIN tentando editar outro usuário → updateAdmin vai rejeitar com 403
      const body = req.body as UpdateUserAdminDTO;
      const user = await this.service.updateAdmin(id, body, actor);
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  };

  // ─── DELETE /users/:id ────────────────────────────
  softDelete = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const { id } = req.params as unknown as UserIdParamDTO;
      await this.service.softDelete(id, actor);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  // ─── DELETE /users/:id/hard ───────────────────────
  hardDelete = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const { id } = req.params as unknown as UserIdParamDTO;
      await this.service.hardDelete(id, actor);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
