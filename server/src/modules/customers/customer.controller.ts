// src/modules/customers/customer.controller.ts
import type { Response, NextFunction } from "express";
import { CustomersService } from "./customer.service.js";
import type { AuthRequest } from "../../middlewares/auth/auth.middleware.js";
import type {
  CreateCustomerDTO,
  UpdateCustomerDTO,
  QueryCustomerDTO,
  CustomerIdParamDTO,
} from "./customer.dto.js";

export const CustomersController = {
  // GET /customers
  async findAll(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const filters = req.query as unknown as QueryCustomerDTO;
      const customers = await CustomersService.findAll(filters);
      res.status(200).json({ success: true, data: customers });
    } catch (error) {
      next(error);
    }
  },

  // GET /customers/:id
  async findById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params as unknown as CustomerIdParamDTO;
      const customer = await CustomersService.findById(id);
      res.status(200).json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  },

  // POST /customers
  async create(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const body = req.body as CreateCustomerDTO;
      const customer = await CustomersService.create(body, req.user!.id);
      res.status(201).json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  },

  // PUT/PATCH /customers/:id
  async update(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params as unknown as CustomerIdParamDTO;
      const body = req.body as UpdateCustomerDTO;
      const customer = await CustomersService.update(id, body, req.user!.id);
      res.status(200).json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /customers/:id (soft)
  async softDelete(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params as unknown as CustomerIdParamDTO;
      await CustomersService.softDelete(id, req.user!.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  // DELETE /customers/:id/hard
  async hardDelete(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params as unknown as CustomerIdParamDTO;
      await CustomersService.hardDelete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};