import { z } from "zod";

export const createFloorSchema = z.object({
  name: z.string().min(1),
});

export const updateFloorSchema = z.object({
  name: z.string().min(1).optional(),
});
