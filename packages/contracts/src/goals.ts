import { z } from "zod";

export const GoalBudgetSchema = z.object({
  maxTokens: z.number().int().positive().max(10_000_000).optional(),
  maxCostUsd: z.number().positive().max(50).optional(),
  deadlineMs: z.number().int().min(60_000).max(30 * 24 * 60 * 60_000).optional(),
}).strict().refine(value => value.maxTokens !== undefined || value.maxCostUsd !== undefined || value.deadlineMs !== undefined,
  "Set a token, cost or time limit.");

export const GoalSchema = z.object({
  goalId: z.string().uuid(),
  workspaceId: z.string().min(1),
  objective: z.string().trim().min(1).max(10_000),
  budget: GoalBudgetSchema,
  status: z.enum(["draft", "starting", "active", "paused", "needs_input", "completed", "failed", "cancelled"]),
  runId: z.string().optional(),
  usedTokens: z.number().nonnegative(),
  knownCostUsd: z.number().nonnegative(),
  costComplete: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export const GoalCreateParams = GoalSchema.pick({ workspaceId: true, objective: true, budget: true });
export type Goal = z.infer<typeof GoalSchema>;
