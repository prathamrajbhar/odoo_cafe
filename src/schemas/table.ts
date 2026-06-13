import { z } from "zod";

export const createTableSchema = z.object({
  floorId: z.string().uuid(),
  number: z.number().int().positive(),
  seats: z.number().int().positive(),
  isActive: z.boolean().default(true),
});

export const updateTableSchema = z.object({
  number: z.number().int().positive().optional(),
  seats: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});
