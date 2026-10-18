import { z } from "zod";
import { AgentModeSchema } from "./agent-policy.js";
import { CapturedSourceSchema } from "./captured-source.js";
import { ExecutionTargetSchema } from "./cloud-execution.js";
import { MentionRefsSchema } from "./mentions.js";
import { PageContextRefSchema } from "./page-context.js";

export const RunsStartParams = z
  .object({
    /** Original native composer delivery; the runtime still owns its run ID. */
    requestId: z.string().uuid().optional(),
    projectRoot: z.string().min(1).max(4096).optional(),
    packageNames: z.array(z.string().min(1).max(128)).max(32).optional(),
    profile: z
      .string()
      .regex(/^[a-z][a-z0-9_-]{0,63}$/)
      .optional(),
    agentMode: AgentModeSchema.optional(),
    taskId: z.string().min(1).optional(),
    expectedRevision: z.number().int().positive().optional(),
    mentions: MentionRefsSchema.optional(),
    goal: z.string().min(1),
    pageId: z.string().optional(),
    pageIds: z.array(z.string()).optional(),
    contextPageRefs: z.array(PageContextRefSchema).optional(),
    setId: z.string().optional(),
    modelId: z.string().optional(),
    reasoning: z.enum(["low", "medium", "high"]).optional(),
    privateTask: z.boolean().default(false),
    executionTarget: ExecutionTargetSchema.default("local"),
    maxSteps: z.number().int().nonnegative().optional(),
    maxCostUsd: z.number().nonnegative().optional(),
    /** `0` = no per-run cap. */
    maxModelCalls: z.number().int().min(0).optional(),
    deadlineMs: z.number().int().positive().optional(),
    /** prior turns / notes the planner should see ("EARLIER IN THIS SESSION") */
    context: z.string().max(20_000).optional(),
    /** Desktop default for a new conversation; never reassigns an existing conversation. */
    defaultWorkspaceId: z.string().min(1).optional(),
    /** Explicitly chosen protected articles. Only Aux's local window may request model use. */
    contextMemoryRefs: z.array(CapturedSourceSchema).optional(),
    /** chat thread this run belongs to — groups turns into conversations */
    chatId: z.string().optional(),
  })
  .strict();
export const RunsReconcileStartParams = RunsStartParams.required({ requestId: true });
