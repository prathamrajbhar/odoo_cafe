import { z } from "zod";

export const orderLineSchema = z.object({
  productId: z.string().uuid(),
  qty: z.number().int().positive(),
  unitPrice: z.number().positive(),
  appliedPromoId: z.string().uuid().optional().nullable(),
});

export const orderCreateSchema = z.object({
  sessionId: z.string().uuid(),
  tableId: z.string().uuid().optional().nullable(),
  customerId: z.string().uuid().optional().nullable(),
  lines: z.array(orderLineSchema).min(1, "Order must have at least one line"),
  couponCode: z.string().optional().nullable(),
});

export const orderPaySchema = z.object({
  method: z.enum(["CASH", "CARD", "UPI"]),
  amountTendered: z.number().positive().optional().nullable(),
  reference: z.string().optional().nullable(),
}).superRefine((data, ctx) => {
  if (data.method === "CASH") {
    if (data.amountTendered === undefined || data.amountTendered === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "amountTendered is required for CASH payment method",
        path: ["amountTendered"],
      });
    }
  } else if (data.method === "CARD") {
    if (!data.reference || data.reference.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "reference number is required for CARD payment method",
        path: ["reference"],
      });
    }
  }
});
