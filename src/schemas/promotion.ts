import { z } from "zod";

const promotionBaseObject = z.object({
  name: z.string().min(1),
  discountValue: z.number().positive(),
  discountType: z.enum(["PERCENT", "FIXED"]),
  isActive: z.boolean().default(true).optional(),
});

export const promotionBaseSchema = promotionBaseObject.superRefine((data, ctx) => {
  if (data.discountType === "PERCENT" && data.discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Percentage discount cannot exceed 100%",
      path: ["discountValue"],
    });
  }
});

export const couponSchema = promotionBaseObject.extend({
  code: z.string().min(1),
}).superRefine((data, ctx) => {
  if (data.discountType === "PERCENT" && data.discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Percentage discount cannot exceed 100%",
      path: ["discountValue"],
    });
  }
});

export const productPromoSchema = promotionBaseObject.extend({
  productId: z.string().uuid(),
  minQty: z.number().int().positive(),
}).superRefine((data, ctx) => {
  if (data.discountType === "PERCENT" && data.discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Percentage discount cannot exceed 100%",
      path: ["discountValue"],
    });
  }
});

export const orderPromoSchema = promotionBaseObject.extend({
  minOrderAmount: z.number().positive(),
}).superRefine((data, ctx) => {
  if (data.discountType === "PERCENT" && data.discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Percentage discount cannot exceed 100%",
      path: ["discountValue"],
    });
  }
});

export const createPromotionSchema = z.object({
  name: z.string().min(1),
  promoType: z.enum(["COUPON", "PRODUCT_BASED", "ORDER_BASED"]),
  code: z.string().min(1).optional(),
  productId: z.string().uuid().optional(),
  minQty: z.number().int().positive().optional(),
  minOrderAmount: z.number().positive().optional(),
  discountValue: z.number().positive(),
  discountType: z.enum(["PERCENT", "FIXED"]),
  isActive: z.boolean().default(true).optional(),
}).superRefine((data, ctx) => {
  if (data.discountType === "PERCENT" && data.discountValue > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Percentage discount cannot exceed 100%",
      path: ["discountValue"],
    });
  }
  if (data.promoType === "COUPON") {
    if (!data.code || data.code.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Coupon code is required for COUPON type",
        path: ["code"],
      });
    }
  } else if (data.promoType === "PRODUCT_BASED") {
    if (!data.productId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "productId is required for PRODUCT_BASED type",
        path: ["productId"],
      });
    }
    if (data.minQty === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "minQty is required for PRODUCT_BASED type",
        path: ["minQty"],
      });
    }
  } else if (data.promoType === "ORDER_BASED") {
    if (data.minOrderAmount === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "minOrderAmount is required for ORDER_BASED type",
        path: ["minOrderAmount"],
      });
    }
  }
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
}).superRefine((data, ctx) => {
  if (data.discountValue !== undefined) {
    if (data.discountType === "PERCENT" && data.discountValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Percentage discount cannot exceed 100%",
        path: ["discountValue"],
      });
    }
  }
});

export const validatePromosSchema = z.object({
  code: z.string().optional().nullable(),
  subtotal: z.number().nonnegative(),
  lines: z.array(
    z.object({
      productId: z.string().uuid(),
      qty: z.number().int().positive(),
    })
  ),
});

export const validatePromoSchema = validatePromosSchema;

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;
export type UpdatePromotionInput = z.infer<typeof updatePromotionSchema>;
export type ValidatePromosInput = z.infer<typeof validatePromosSchema>;
