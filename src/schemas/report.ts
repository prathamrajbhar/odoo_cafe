import { z } from "zod";

export const reportFilterSchema = z
  .object({
    period: z.enum(["today", "week", "month", "custom"], { errorMap: () => ({ message: "Invalid period" }) }),
    from: z.string().optional().nullable(),
    to: z.string().optional().nullable(),
    employeeId: z.string().uuid("Invalid employee ID").optional().nullable(),
    sessionId: z.string().uuid("Invalid session ID").optional().nullable(),
    productId: z.string().uuid("Invalid product ID").optional().nullable(),
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

export type ReportFilterInput = z.infer<typeof reportFilterSchema>;
