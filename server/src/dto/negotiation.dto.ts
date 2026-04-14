import { z } from 'zod';

export const NegotiationStatusEnum = z.enum(['NEW', 'IN_PROGRESS', 'WON', 'LOST', 'ON_HOLD']);

export const CREATE_NEGOTIATION_SCHEMA = z.object({
  lead_id: z.string().uuid(),
  team_id: z.string().uuid(),
  amount: z.number().positive().optional(),
  status: NegotiationStatusEnum.default('NEW'),
  is_open: z.boolean().default(true),
  first_interaction_at: z.string().datetime().optional(),
  finalization_reason: z.string().optional(),
});

export const UPDATE_NEGOTIATION_SCHEMA = z.object({
  amount: z.number().positive().optional(),
  status: NegotiationStatusEnum.optional(),
  is_open: z.boolean().optional(),
  finalization_reason: z.string().optional(),
});

export const UPDATE_STATUS_SCHEMA = z.object({
  status: NegotiationStatusEnum,
  notes: z.string().optional(),
});

export type CreateNegotiationDTO = z.infer<typeof CREATE_NEGOTIATION_SCHEMA>;
export type UpdateNegotiationDTO = z.infer<typeof UPDATE_NEGOTIATION_SCHEMA>;