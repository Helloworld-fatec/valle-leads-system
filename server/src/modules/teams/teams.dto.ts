import { z } from "zod";

// TEAM
export const createTeamSchema = z.object({
  name: z.string().min(1, "Name é obrigatório"),
  is_active: z.boolean().optional()
});

export const updateTeamSchema = z.object({
  name: z.string().optional(),
  is_active: z.boolean().optional()
});

// STORE
export const createStoreSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  team_id: z.string().uuid("team_id deve ser UUID")
});

export const updateStoreSchema = z.object({
  name: z.string().optional(),
  address: z.string().optional(),
  team_id: z.string().uuid().optional()
});