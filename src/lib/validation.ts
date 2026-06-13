import { z } from "zod";

// Authentication Schemas
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
});

// Category Schema
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Name cannot exceed 50 characters"),
  color: z
    .string()
    .min(4, "Color is required")
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color code"),
});

// Product Schema
export const productSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required")
    .max(100, "Name cannot exceed 100 characters"),
  price: z
    .number()
    .min(0, "Price cannot be negative")
    .or(z.string().transform((val) => parseFloat(val) || 0)),
  taxRate: z
    .number()
    .refine((val) => [5, 18, 28].includes(val), "Tax rate must be 5%, 18%, or 28%")
    .or(z.string().transform((val) => parseInt(val) || 5)),
  categoryId: z
    .string()
    .min(1, "Category is required"),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable(),
});

// Floor Schema
export const floorSchema = z.object({
  name: z
    .string()
    .min(1, "Floor name is required")
    .max(50, "Floor name cannot exceed 50 characters"),
});

// Table Schema
export const tableSchema = z.object({
  number: z
    .string()
    .min(1, "Table number/identifier is required"),
  seats: z
    .number()
    .min(1, "Table must have at least 1 seat")
    .or(z.string().transform((val) => parseInt(val) || 2)),
  isActive: z.boolean().default(true),
});

// Employee User Creation Schema
export const userSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  role: z.enum(["ADMIN", "EMPLOYEE"]),
  isActive: z.boolean().default(true),
});

// Promotion Schema
export const promotionSchema = z.object({
  name: z
    .string()
    .min(2, "Promotion name is required"),
  type: z.enum(["COUPON", "PRODUCT_BASED", "ORDER_BASED"]),
  code: z
    .string()
    .max(20, "Coupon code is too long")
    .optional()
    .nullable(),
  discountType: z.enum(["PERCENT", "FIXED"]),
  discountValue: z
    .number()
    .min(0, "Discount value cannot be negative")
    .or(z.string().transform((val) => parseFloat(val) || 0)),
  productId: z
    .string()
    .optional()
    .nullable(),
  minQty: z
    .number()
    .min(1)
    .optional()
    .nullable()
    .or(z.string().transform((val) => parseInt(val) || null)),
  minOrderAmount: z
    .number()
    .min(0)
    .optional()
    .nullable()
    .or(z.string().transform((val) => parseFloat(val) || null)),
  isActive: z.boolean().default(true),
});
