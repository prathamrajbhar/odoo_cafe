import { z } from "zod";

export const tableCreateSchema = z.object({
  floorId: z.string().uuid(),
  number: z.number().int().positive(),
  seats: z.number().int().positive(),
  isActive: z.boolean().default(true).optional(),
});

export const tableUpdateSchema = z.object({
  number: z.number().int().positive().optional(),
  seats: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export const createTableSchema = tableCreateSchema;
export const updateTableSchema = tableUpdateSchema;

