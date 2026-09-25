import { z } from "zod";

export const MemoryPipelinePolicySchema = z.object({ workspaceId: z.string().min(1), enabled: z.boolean() }).strict();
export const MemoryClaimSchema = z.object({ claimId: z.string().uuid(), sourceRunId: z.string().min(1),
  text: z.string().min(1).max(2000), capturedAt: z.number().int().nonnegative() });
export const MemoryPipelineOverviewSchema = z.object({ workspaceId: z.string().min(1), enabled: z.boolean(),
  summary: z.string().max(10_000), claimCount: z.number().int().nonnegative(), sourceCount: z.number().int().nonnegative() });
export const MemoryPipelineForgetParams = z.object({ workspaceId: z.string().min(1),
  sourceRunId: z.string().min(1).optional(), claimId: z.string().uuid().optional(), all: z.literal(true).optional() }).strict()
  .refine(value => [value.sourceRunId, value.claimId, value.all].filter(Boolean).length === 1, "Choose one source, claim, or all memory to forget");
export const MemoryPipelineForgetResultSchema = z.object({ forgotten: z.number().int().nonnegative(), remaining: z.number().int().nonnegative() });
export type MemoryClaim = z.infer<typeof MemoryClaimSchema>;
export type MemoryPipelineOverview = z.infer<typeof MemoryPipelineOverviewSchema>;
