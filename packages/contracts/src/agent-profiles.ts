import { z } from "zod";

export const AgentProfileSchema = z
  .object({
    name: z.string().regex(/^[a-z][a-z0-9_-]{0,63}$/),
    prompt: z.string().min(1).max(32_000),
    tools: z.array(z.string().min(1).max(128)).min(1).max(128),
    workspace: z.enum(["shared", "isolated"]).default("shared"),
    limits: z
      .object({
        maxModelCalls: z.number().int().nonnegative().optional(),
        maxCostUsd: z.number().nonnegative().optional(),
        deadlineMs: z.number().int().nonnegative().optional(),
      })
      .strict()
      .optional(),
    packages: z.array(z.string().min(1).max(128)).max(32).default([]),
  })
  .strict();
export type AgentProfile = z.infer<typeof AgentProfileSchema>;
