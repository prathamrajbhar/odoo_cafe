import { z } from "zod";

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const categoryCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  colorHex: z.string().regex(hexColorRegex, "Invalid hex color format (must be #RRGGBB)"),
});

export const categoryUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  colorHex: z.string().regex(hexColorRegex, "Invalid hex color format (must be #RRGGBB)").optional(),
});

// Alias for compatibility
export const createCategorySchema = categoryCreateSchema;
export const updateCategorySchema = categoryUpdateSchema;
