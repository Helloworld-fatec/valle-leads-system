// server/src/modules/users/users.controller.ts
import type { Response, NextFunction } from "express";
import { UsersService, type ActorContext } from "./users.service.js";
import type { AuthRequest } from "../../middlewares/auth/auth.middleware.js";
import type { UserRole } from "./users.dto.js";

// ─────────────────────────────────────────────
// USERS CONTROLLER
// ─────────────────────────────────────────────
// Camada de apresentação (RNF12). Responsabilidade ÚNICA:
//   - Receber a request HTTP
//   - Extrair o ator autenticado (req.user injetado pelo auth.middleware)
//   - Delegar pro service
//   - Devolver a resposta HTTP no formato adequado
//
// Nenhuma regra de negócio aqui. Validação já aconteceu nos middlewares de Zod.
// Tratamento de erro também não — basta repassar via next(err).
// ─────────────────────────────────────────────

export class UsersController {
  private usersService = new UsersService();

  // Helper — monta o contexto do solicitante a partir do AuthRequest.
  // O auth.middleware garante que req.user existe; aqui só ajustamos o tipo.
  private getActor(req: AuthRequest): ActorContext {
    return {
      id: req.user!.id,
      role: req.user!.role as UserRole,
    };
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const actor = this.getActor(req);
      const user = await this.usersService.create(req.body, actor);
      return res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const actor = this.getActor(req);
      // req.query já foi normalizado pelo validateQuery (page e pageSize já são number)
      const result = await this.usersService.findAll(req.query as any, actor);
      return res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async findById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const actor = this.getActor(req);
      const user = await this.usersService.findById(req.params.id, actor);
      return res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async findMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const actor = this.getActor(req);
      const user = await this.usersService.findMe(actor);
      return res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const actor = this.getActor(req);
      const user = await this.usersService.update(req.params.id, req.body, actor);
      return res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateSelf(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const actor = this.getActor(req);
      const user = await this.usersService.updateSelf(req.body, actor);
      return res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async softDelete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const actor = this.getActor(req);
      await this.usersService.softDelete(req.params.id, actor);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
