import { z } from "zod";

export const AgentClientSchema = z.enum(["codex", "claude"]);
export const AgentConnectionScopeSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("workspace"), workspaceId: z.string().min(1) }).strict(),
  z.object({ kind: z.literal("task"), workspaceId: z.string().min(1), taskId: z.string().min(1) }).strict(),
]);
export const AgentConnectionSchema = z.object({
  connectionId: z.string().uuid(),
  name: z.string().min(1).max(100),
  client: AgentClientSchema,
  scope: AgentConnectionScopeSchema,
  createdAt: z.number(),
  lastUsedAt: z.number().optional(),
  revokedAt: z.number().optional(),
});
export const AgentConnectionCreateParams = z.object({
  name: z.string().trim().min(1).max(100),
  client: AgentClientSchema,
  scope: AgentConnectionScopeSchema,
}).strict();

export type AgentConnection = z.infer<typeof AgentConnectionSchema>;
export type AgentConnectionScope = z.infer<typeof AgentConnectionScopeSchema>;
