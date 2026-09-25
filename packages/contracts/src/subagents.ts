import { z } from "zod";

const id = z.string().min(1);
export const SubagentProfileSchema = z.enum(["explorer", "read_only", "default"]);
export const SubagentGroupCreateParams = z.object({ parentRunId: id, tokenBudget: z.number().int().min(1_000).max(1_000_000),
  costBudgetUsd: z.number().positive().max(50), timeBudgetMs: z.number().int().min(1_000).max(86_400_000) }).strict();
export const SubagentGroupSchema = SubagentGroupCreateParams.extend({ groupId: z.string().uuid(), workspaceId: id,
  deadlineAt: z.number().int().positive(), createdAt: z.number().int().positive(), state: z.enum(["active", "closed"]) });
export const SubagentSpawnParams = z.object({ groupId: z.string().uuid(), goal: z.string().trim().min(1).max(10_000),
  profile: SubagentProfileSchema, pageIds: z.array(id).min(1).max(9), tokenAllocation: z.number().int().min(1_000).max(1_000_000),
  costAllocationUsd: z.number().positive().max(50), maxModelCalls: z.number().int().min(1).max(20).default(4),
  sourceRunId: id.optional() }).strict();
export const SubagentSchema = SubagentSpawnParams.omit({ sourceRunId: true }).extend({ agentId: z.string().uuid(),
  runId: id.optional(), state: z.enum(["starting", "running", "completed", "failed", "cancelled", "interrupted"]),
  sourceRunId: id, createdAt: z.number().int().positive(), endedAt: z.number().int().positive().optional() });
export const SubagentGroupViewSchema = z.object({ group: SubagentGroupSchema, agents: z.array(SubagentSchema),
  reservedTokens: z.number().int().nonnegative(), reservedCostUsd: z.number().nonnegative(),
  usedTokens: z.number().int().nonnegative(), usedCostUsd: z.number().nonnegative() });
export const SubagentMessageParams = z.object({ agentId: z.string().uuid(), expectedRunId: id,
  text: z.string().trim().min(1).max(8_000) }).strict();
export type SubagentProfile = z.infer<typeof SubagentProfileSchema>;
export type SubagentGroup = z.infer<typeof SubagentGroupSchema>;
export type Subagent = z.infer<typeof SubagentSchema>;
