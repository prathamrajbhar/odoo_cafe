import { z } from "zod";

export const reportFilterSchema = z
  .object({
    period: z.enum(["today", "week", "month", "custom"]),
    from: z.string().optional().nullable(),
    to: z.string().optional().nullable(),
    employeeId: z.string().uuid().optional().nullable(),
    sessionId: z.string().uuid().optional().nullable(),
    productId: z.string().uuid().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.period === "custom") {
      if (!data.from) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "from date is required for custom period",
          path: ["from"],
        });
      }
      if (!data.to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "to date is required for custom period",
          path: ["to"],
        });
      }
    }
  });
