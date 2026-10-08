import { z } from "zod";
const amount = z.number().finite().nonnegative();
export const PrivateBudgetRequestSchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("status") }).strict(),
  z
    .object({
      operation: z.literal("reserve"),
      leaseId: z.string().uuid(),
      kind: z.enum(["model", "resource"]),
      amountUsd: amount.optional(),
    })
    .strict(),
  z
    .object({
      operation: z.literal("settle"),
      leaseId: z.string().uuid(),
      costUsd: amount.optional(),
      costEstimated: z.boolean(),
    })
    .strict(),
  z.object({ operation: z.literal("cancel"), leaseId: z.string().uuid() }).strict(),
]);
export type PrivateBudgetRequest = z.infer<typeof PrivateBudgetRequestSchema>;
export const PrivateBudgetWindowSchema = z
  .object({
    scope: z.enum(["day", "month"]),
    limitUsd: amount.optional(),
    spentUsd: amount,
    remainingUsd: amount.optional(),
    exceeded: z.boolean(),
    resourceCostComplete: z.boolean().optional(),
    unpricedModelCalls: z.number().int().nonnegative().optional(),
  })
  .strict();
export type PrivateBudgetWindow = z.infer<typeof PrivateBudgetWindowSchema>;
export const PrivateBudgetResultSchema = z
  .object({
    windows: PrivateBudgetWindowSchema.array().length(2),
    refusal: z
      .object({
        code: z.enum(["permission_denied", "needs_input"]),
        message: z.string().max(1000),
        scope: z.enum(["day", "month"]),
        limitUsd: amount.optional(),
        spentUsd: amount,
        requiredUsd: amount.optional(),
      })
      .strict()
      .optional(),
  })
  .strict();
export type PrivateBudgetResult = z.infer<typeof PrivateBudgetResultSchema>;
