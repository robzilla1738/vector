import { z } from "zod";
import { CoderWorktreeSchema, CoderWorktreeRecoverySchema } from "./coder-worktrees.js";

const id = z.string().min(1);
export const SubagentProfileSchema = z.string().regex(/^[a-z][a-z0-9_-]{0,63}$/);
export const SubagentGroupCreateParams = z
  .object({
    parentRunId: id,
    tokenBudget: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    costBudgetUsd: z.number().nonnegative(),
    timeBudgetMs: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  })
  .strict();
export const SubagentGroupSchema = SubagentGroupCreateParams.extend({
  groupId: z.string().uuid(),
  workspaceId: id,
  deadlineAt: z.number().int().nonnegative(),
  createdAt: z.number().int().positive(),
  state: z.enum(["active", "closed"]),
});
export const SubagentSpawnParams = z
  .object({
    groupId: z.string().uuid(),
    goal: z.string().trim().min(1).max(10_000),
    profile: SubagentProfileSchema,
    pageIds: z.array(id).default([]),
    tokenAllocation: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    costAllocationUsd: z.number().nonnegative(),
    maxModelCalls: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).default(0),
    sourceRunId: id.optional(),
  })
  .strict();
export const SubagentSchema = SubagentSpawnParams.omit({ sourceRunId: true }).extend({
  agentId: z.string().uuid(),
  runId: id.optional(),
  state: z.enum(["starting", "running", "completed", "failed", "cancelled", "interrupted"]),
  sourceRunId: id,
  spawnActionId: id.optional(),
  createdAt: z.number().int().positive(),
  endedAt: z.number().int().positive().optional(),
  worktree: CoderWorktreeSchema.optional(),
  recovery: CoderWorktreeRecoverySchema.optional(),
});
export const SubagentGroupViewSchema = z.object({
  group: SubagentGroupSchema,
  agents: z.array(SubagentSchema),
  reservedTokens: z.number().int().nonnegative(),
  reservedCostUsd: z.number().nonnegative(),
  usedTokens: z.number().int().nonnegative(),
  usedCostUsd: z.number().nonnegative(),
});
export const SubagentMessageParams = z
  .object({ agentId: z.string().uuid(), expectedRunId: id, text: z.string().trim().min(1).max(8_000) })
  .strict();
export type SubagentProfile = z.infer<typeof SubagentProfileSchema>;
export type SubagentGroup = z.infer<typeof SubagentGroupSchema>;
export type Subagent = z.infer<typeof SubagentSchema>;
