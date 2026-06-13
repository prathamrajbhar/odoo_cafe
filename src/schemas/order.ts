import { z } from "zod";

export const orderLineSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  qty: z.number().int().positive("Quantity must be positive"),
  unitPrice: z.number().positive("Unit price must be positive"),
  appliedPromoId: z.string().uuid("Invalid promo ID").optional().nullable(),
});

export const orderCreateSchema = z.object({
  sessionId: z.string().uuid("Invalid session ID"),
  tableId: z.string().uuid("Invalid table ID").optional().nullable(),
  customerId: z.string().uuid("Invalid customer ID").optional().nullable(),
  lines: z.array(orderLineSchema).min(1, "Order must have at least one line"),
  couponCode: z.string().optional().nullable(),
});

export const orderPaySchema = z.object({
  method: z.enum(["CASH", "CARD", "UPI"], { errorMap: () => ({ message: "Method must be CASH, CARD, or UPI" }) }),
  amountTendered: z.number().positive("Amount must be positive").optional().nullable(),
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

export type OrderLineInput = z.infer<typeof orderLineSchema>;
export type OrderCreateInput = z.infer<typeof orderCreateSchema>;
export type OrderPayInput = z.infer<typeof orderPaySchema>;
