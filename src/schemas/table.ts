import { z } from "zod";

export const floorSchema = z.object({
  id: z.string().uuid("Invalid floor ID"),
  name: z.string().min(1, "Name is required"),
});

export const floorCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const floorUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
});

export const tableCreateSchema = z.object({
  floorId: z.string().uuid("Invalid floor ID"),
  number: z.number().int().positive("Table number must be positive"),
  seats: z.number().int().positive("Seats must be positive"),
  x: z.number().int().nonnegative().optional(),
  y: z.number().int().nonnegative().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  shape: z.string().optional(),
  isActive: z.boolean().default(true).optional(),
});

export const tableUpdateSchema = z.object({
  number: z.number().int().positive("Table number must be positive").optional(),
  seats: z.number().int().positive("Seats must be positive").optional(),
  x: z.number().int().nonnegative().optional(),
  y: z.number().int().nonnegative().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  shape: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const createFloorSchema = floorCreateSchema;
export const updateFloorSchema = floorUpdateSchema;
export const createTableSchema = tableCreateSchema;
export const updateTableSchema = tableUpdateSchema;

export type FloorCreateInput = z.infer<typeof floorCreateSchema>;
export type FloorUpdateInput = z.infer<typeof floorUpdateSchema>;
export type TableCreateInput = z.infer<typeof tableCreateSchema>;
export type TableUpdateInput = z.infer<typeof tableUpdateSchema>;
