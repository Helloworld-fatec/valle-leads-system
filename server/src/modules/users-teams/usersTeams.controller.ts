// server/src/modules/users-teams/usersTeams.controller.ts
import type { Request, Response, NextFunction } from "express";
import { UsersTeamsService } from "./usersTeams.service.js";

const service = new UsersTeamsService();

// Função auxiliar para garantir que o parâmetro seja uma string simples
function getParam(param: string | string[] | undefined): string | null {
  if (!param || Array.isArray(param)) return null;
  return param;
}

export class UsersTeamsController {

  // 🔍 LISTAR TODOS OS VÍNCULOS
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userTeams = await service.findAll();

      return res.status(200).json({
        success: true,
        data: userTeams
      });

    } catch (err) {
      next(err);
    }
  }

  // 🔍 BUSCAR VÍNCULO POR ID
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params.id);

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: "ID inválido ou não informado" 
        });
      }

      const userTeam = await service.findById(id);

      return res.status(200).json({
        success: true,
        data: userTeam
      });

    } catch (err) {
      next(err);
    }
  }

  // ➕ CRIAR VÍNCULO (Adicionar usuário a um time)
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userTeam = await service.create(req.body);

      return res.status(201).json({
        success: true,
        data: userTeam
      });

    } catch (err) {
      next(err);
    }
  }

  // ✏️ ATUALIZAR VÍNCULO
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params.id);

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: "ID inválido ou não informado" 
        });
      }

      const userTeam = await service.update(id, req.body);

      return res.status(200).json({
        success: true,
        data: userTeam
      });

    } catch (err) {
      next(err);
    }
  }

  // ❌ DELETAR VÍNCULO (Remover usuário do time)
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params.id);

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: "ID inválido ou não informado" 
        });
      }

      await service.delete(id);

      // 204 No Content é o padrão RESTful para deleções bem-sucedidas sem payload de retorno
      return res.status(204).send(); 

    } catch (err) {
      next(err);
    }
  }
}