import { z } from "zod";

export const HookEventSchema = z.enum([
  "session.start",
  "session.end",
  "task.start",
  "task.end",
  "run.start",
  "run.end",
  "model.before",
  "model.after",
  "tool.before",
  "tool.after",
  "page.before",
  "page.after",
]);
export const HookHandlerSchema = z.discriminatedUnion("type", [
  z
    .object({
      type: z.literal("command"),
      command: z.string().trim().min(1).max(8000),
      workdir: z.string().min(1).max(4096),
    })
    .strict(),
  z
    .object({
      type: z.literal("mcp_tool"),
      serverId: z.string().min(1).max(200),
      grantId: z.string().uuid(),
      toolName: z.string().min(1).max(200),
      arguments: z.record(z.string(), z.unknown()).optional(),
    })
    .strict(),
  z.object({ type: z.literal("prompt"), template: z.string().trim().min(1).max(8000) }).strict(),
  z.object({ type: z.literal("agent"), objective: z.string().trim().min(1).max(8000) }).strict(),
]);
export const HookSchema = z.object({
  hookId: z.string().uuid(),
  workspaceId: z.string().min(1),
  event: HookEventSchema,
  handler: HookHandlerSchema,
  handlerDigest: z.string().regex(/^[a-f0-9]{64}$/),
  trust: z.enum(["untrusted", "approved", "revoked"]),
  sourcePluginId: z.string().uuid().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export const HookCreateParams = HookSchema.pick({
  workspaceId: true,
  event: true,
  handler: true,
  sourcePluginId: true,
});
export const HookDispatchContextSchema = z
  .object({
    eventId: z.string().min(1).max(200),
    workspaceId: z.string().min(1),
    event: HookEventSchema,
    runId: z.string().optional(),
    pageId: z.string().optional(),
    at: z.number().int().nonnegative(),
  })
  .strict();
export const HookInvocationSchema = z.object({
  invocationId: z.string().uuid(),
  hookId: z.string().uuid(),
  eventId: z.string().min(1).max(200),
  state: z.enum(["invoking", "completed", "failed", "uncertain"]),
  error: z.string().max(1000).optional(),
  createdAt: z.number(),
  endedAt: z.number().optional(),
});
export type Hook = z.infer<typeof HookSchema>;
export type HookHandler = z.infer<typeof HookHandlerSchema>;
export type HookDispatchContext = z.infer<typeof HookDispatchContextSchema>;
export type HookInvocation = z.infer<typeof HookInvocationSchema>;
