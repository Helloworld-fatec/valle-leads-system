// server/src/modules/stores/stores.controller.ts
import type { Request, Response, NextFunction } from "express";
import { StoresService } from "./store.service.js";

const service = new StoresService();

// Função auxiliar para garantir que o parâmetro seja uma string simples
function getParam(param: string | string[] | undefined): string | null {
  if (!param || Array.isArray(param)) return null;
  return param;
}

export class StoresController {

  // 🔍 LISTAR TODAS AS STORES (Refatorado para coincidir com service.findAll)
  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const stores = await service.findAll();

      return res.status(200).json({
        success: true,
        data: stores
      });

    } catch (err) {
      next(err);
    }
  }

  // 🔍 BUSCAR POR ID
  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params.id);

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid id" 
        });
      }

      const store = await service.findById(id);

      if (!store) {
        return res.status(404).json({ 
          success: false, 
          message: "Store not found" 
        });
      }

      return res.status(200).json({
        success: true,
        data: store
      });

    } catch (err) {
      next(err);
    }
  }

  // ➕ CRIAR STORE
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const store = await service.create(req.body);

      return res.status(201).json({
        success: true,
        data: store
      });

    } catch (err) {
      next(err);
    }
  }

  // ✏️ ATUALIZAR STORE
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params.id);

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid id" 
        });
      }

      const store = await service.update(id, req.body);

      return res.status(200).json({
        success: true,
        data: store
      });

    } catch (err) {
      next(err);
    }
  }

  // ❌ DELETAR STORE (SOFT DELETE)
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = getParam(req.params.id);

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid id" 
        });
      }

      await service.delete(id);

      return res.status(204).send(); // 204 No Content é o padrão ideal para deleções com sucesso sem payload

    } catch (err) {
      next(err);
    }
  }
}