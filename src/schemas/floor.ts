import { z } from "zod";

export const floorCreateSchema = z.object({
  name: z.string().min(1),
});

export const floorUpdateSchema = z.object({
  name: z.string().min(1).optional(),
});

export const createFloorSchema = floorCreateSchema;
export const updateFloorSchema = floorUpdateSchema;

