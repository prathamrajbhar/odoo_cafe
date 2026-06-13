import { z } from "zod";

const priceSchema = z.number({ required_error: "Price is required", invalid_type_error: "Price must be a number" }).positive("Price must be greater than 0").refine(
  (val) => {
    const parts = val.toString().split(".");
    return parts.length === 1 || parts[1].length <= 2;
  },
  { message: "Price must have at most 2 decimal places" }
);

export const productCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  categoryId: z.string().uuid("Invalid category ID"),
  price: priceSchema,
  taxRate: z.union([z.literal(5), z.literal(18), z.literal(28)], {
    errorMap: () => ({ message: "Tax rate must be 5, 18, or 28" })
  }),
  stock: z.number({ invalid_type_error: "Stock must be a number" }).int("Stock must be a whole number").min(0, "Stock cannot be negative").default(0),
  description: z.string().optional().nullable(),
});

export const productUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  categoryId: z.string().uuid("Invalid category ID").optional(),
  price: priceSchema.optional(),
  taxRate: z.union([z.literal(5), z.literal(18), z.literal(28)], {
    errorMap: () => ({ message: "Tax rate must be 5, 18, or 28" })
  }).optional(),
  stock: z.number({ invalid_type_error: "Stock must be a number" }).int("Stock must be a whole number").min(0, "Stock cannot be negative").optional(),
  description: z.string().optional().nullable(),
});

export const productRestockSchema = z.object({
  quantity: z.number({ required_error: "Quantity is required" }).int("Quantity must be a whole number").min(1, "Quantity must be at least 1"),
});

export const createProductSchema = productCreateSchema;
export const updateProductSchema = productUpdateSchema;

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
