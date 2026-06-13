import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1),
  categoryId: z.string().uuid(),
  price: z.number().positive(),
  taxRate: z.union([z.literal(5), z.literal(18), z.literal(28)]),
  description: z.string().optional(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  categoryId: z.string().uuid().optional(),
  price: z.number().positive().optional(),
  taxRate: z.union([z.literal(5), z.literal(18), z.literal(28)]).optional(),
  description: z.string().optional(),
});
