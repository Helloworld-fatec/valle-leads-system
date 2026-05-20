// src/modules/stores/stores.dto.ts
import { z } from "zod";

// Stores NÃO tem team_id — a relação é inversa: Teams.store_id → Stores.
// team_id foi removido dos schemas de criação e atualização.

// ─── CREATE ───────────────────────────────────────────
export const createStoreSchema = z.object({
  name: z.string().trim().min(1, "name é obrigatório").max(200),
  address: z.string().trim().max(300).optional(),
});

// ─── UPDATE ───────────────────────────────────────────
export const updateStoreSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    address: z.string().trim().max(300).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Nenhum campo enviado para atualização",
  });

// ─── PARAMS (:id) ─────────────────────────────────────
export const storeIdParamSchema = z.object({
  id: z.string().uuid("id deve ser um UUID válido"),
});

// ─── Tipos derivados ──────────────────────────────────
export type CreateStoreDTO = z.infer<typeof createStoreSchema>;
export type UpdateStoreDTO = z.infer<typeof updateStoreSchema>;
export type StoreIdParamDTO = z.infer<typeof storeIdParamSchema>;