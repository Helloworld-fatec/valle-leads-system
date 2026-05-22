// src/modules/leads/lead.controller.ts
import type { Response, NextFunction } from "express";
import type { ParsedQs } from "qs";
import {
  LeadsService,
  type ActorContext,
  type LeadActorRole,
} from "./lead.service.js";
import type { AuthRequest } from "../../middlewares/auth/auth.middleware.js";
import type {
  CreateLeadDTO,
  UpdateLeadDTO,
  QueryLeadDTO,
  LeadIdParamDTO,
  BulkAssignAttendantDTO,
  BulkAssignTeamDTO,
} from "./lead.dtos.js";

// Os middlewares validateBody/validateQuery/validateParams já parsearam e
// trocaram req.body, req.query e req.params pelos shapes tipados via Zod.
// Como Express tipa esses campos com generics genéricos, fazemos um cast
// pontual e centralizado nos helpers abaixo. Não é `any`: estamos refinando
// um tipo conhecido para outro tipo conhecido, com a validação Zod garantindo
// no runtime que o cast é seguro.

// Lista fechada de roles aceitos no JWT. Usado para validar o role recebido
// antes de tratá-lo como LeadActorRole no service.
const VALID_LEAD_ROLES: ReadonlyArray<LeadActorRole> = [
  "ATTENDANT",
  "MANAGER",
  "GENERAL_MANAGER",
  "ADMIN",
];

function isLeadActorRole(role: string): role is LeadActorRole {
  return (VALID_LEAD_ROLES as ReadonlyArray<string>).includes(role);
}

export class LeadsController {
  private leadsService = new LeadsService();

  // Extrai e tipa o ator a partir de req.user. authMiddleware garante
  // que req.user existe nas rotas protegidas, então o `!` é seguro aqui.
  // Validamos o role contra a lista fechada para falhar cedo caso um role
  // desconhecido apareça (defesa contra JWT manipulado / inconsistente).
  private getActor(req: AuthRequest): ActorContext {
    const user = req.user!;
    if (!isLeadActorRole(user.role)) {
      // Lança um erro genérico — o globalErrorHandler responde 500.
      // Em produção isso indicaria um JWT com role fora do enum esperado.
      throw new Error(`Role desconhecido no token: ${user.role}`);
    }
    return {
      id: user.id,
      role: user.role,
      team_ids: user.team_ids,
    };
  }

  // ──────────────────────────────────────────────────────
  // LISTAGEM
  // ──────────────────────────────────────────────────────
  // Tipamos req como AuthRequest<unknown, unknown, unknown, ParsedQs> e
  // depois fazemos um cast da query pelo unknown (passagem padrão segura
  // entre tipos não relacionados) para QueryLeadDTO, já que o validateQuery
  // garantiu o shape.
  findAll = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const query = req.query as unknown as QueryLeadDTO;
      const result = await this.leadsService.findAll(query, actor);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  // ──────────────────────────────────────────────────────
  // LEITURA POR ID
  // ──────────────────────────────────────────────────────
  findById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const { id } = req.params as unknown as LeadIdParamDTO;
      const lead = await this.leadsService.findById(id, actor);
      res.status(200).json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  };

  // ──────────────────────────────────────────────────────
  // CRIAÇÃO
  // ──────────────────────────────────────────────────────
  create = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const body = req.body as CreateLeadDTO;
      const lead = await this.leadsService.create(body, actor);
      res.status(201).json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  };

  // ──────────────────────────────────────────────────────
  // ATUALIZAÇÃO (PUT/PATCH)
  // ──────────────────────────────────────────────────────
  update = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const { id } = req.params as unknown as LeadIdParamDTO;
      const body = req.body as UpdateLeadDTO;
      const lead = await this.leadsService.update(id, body, actor);
      res.status(200).json({ success: true, data: lead });
    } catch (error) {
      next(error);
    }
  };

  // ──────────────────────────────────────────────────────
  // SOFT DELETE
  // ──────────────────────────────────────────────────────
  softDelete = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const { id } = req.params as unknown as LeadIdParamDTO;
      await this.leadsService.softDelete(id, actor);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // ──────────────────────────────────────────────────────
  // HARD DELETE (apenas ADMIN)
  // ──────────────────────────────────────────────────────
  hardDelete = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const { id } = req.params as unknown as LeadIdParamDTO;
      await this.leadsService.hardDelete(id, actor);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  // ──────────────────────────────────────────────────────
  // BULK — atribuir atendente
  // ──────────────────────────────────────────────────────
  bulkAssignAttendant = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const body = req.body as BulkAssignAttendantDTO;
      const result = await this.leadsService.bulkAssignAttendant(body, actor);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };

  // ──────────────────────────────────────────────────────
  // BULK — atribuir/transferir equipe
  // ──────────────────────────────────────────────────────
  bulkAssignTeam = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const actor = this.getActor(req);
      const body = req.body as BulkAssignTeamDTO;
      const result = await this.leadsService.bulkAssignTeam(body, actor);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  };
}

// Mantemos o import de ParsedQs aqui para deixar registrada a intenção de
// tipagem da query (mesmo que o uso concreto seja via cast). Se o módulo
// crescer, esse tipo pode passar a aparecer em assinaturas dedicadas.
export type { ParsedQs };
