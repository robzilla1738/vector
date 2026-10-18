import { z } from "zod";

export const AgentCliClientSchema = z.enum(["codex", "claude", "cursor"]);
export type AgentCliClient = z.infer<typeof AgentCliClientSchema>;
export const AgentClientSchema = z.enum([...AgentCliClientSchema.options, "slack", "telegram", "discord"]);
export const AgentConnectionScopeSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("workspace"), workspaceId: z.string().min(1) }).strict(),
  z.object({ kind: z.literal("task"), workspaceId: z.string().min(1), taskId: z.string().min(1) }).strict(),
  // A session scope is anchored to a workspace (tasks and MCP context stay
  // workspace-visible) but its page surface narrows to one browser session.
  z
    .object({
      kind: z.literal("session"),
      workspaceId: z.string().min(1),
      sessionId: z.string().min(1),
    })
    .strict(),
]);
export const AgentConnectionSchema = z.object({
  connectionId: z.string().uuid(),
  name: z.string().min(1).max(100),
  client: AgentClientSchema,
  scope: AgentConnectionScopeSchema,
  createdAt: z.number(),
  lastUsedAt: z.number().optional(),
  expiresAt: z.number().optional(),
  revokedAt: z.number().optional(),
});
export const AgentConnectionCreateParams = z
  .object({
    name: z.string().trim().min(1).max(100),
    client: AgentClientSchema,
    scope: AgentConnectionScopeSchema,
    expiresAt: z.number().int().positive().optional(),
  })
  .strict();

export type AgentConnection = z.infer<typeof AgentConnectionSchema>;
export type AgentConnectionScope = z.infer<typeof AgentConnectionScopeSchema>;
export const AgentCliConnectionCreateParams = AgentConnectionCreateParams.extend({
  client: AgentCliClientSchema,
});
