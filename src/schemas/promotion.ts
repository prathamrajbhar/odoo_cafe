import { z } from "zod";

export const createPromotionSchema = z.object({
  name: z.string().min(1),
  promoType: z.enum(["COUPON", "PRODUCT_BASED", "ORDER_BASED"]),
  code: z.string().min(1).optional(),
  productId: z.string().uuid().optional(),
  minQty: z.number().int().positive().optional(),
  minOrderAmount: z.number().positive().optional(),
  discountValue: z.number().positive(),
  discountType: z.enum(["PERCENT", "FIXED"]),
  isActive: z.boolean().default(true),
});

export const updatePromotionSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  productId: z.string().uuid().optional(),
  minQty: z.number().int().positive().optional(),
  minOrderAmount: z.number().positive().optional(),
  discountValue: z.number().positive().optional(),
  discountType: z.enum(["PERCENT", "FIXED"]).optional(),
  isActive: z.boolean().optional(),
});

export const validatePromoSchema = z.object({
  code: z.string().optional(),
  subtotal: z.number().nonnegative(),
  lines: z.array(
    z.object({
      productId: z.string().uuid(),
      qty: z.number().int().positive(),
    })
  ),
});
