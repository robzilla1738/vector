import { z } from "zod";

export const OutboundMcpServerSchema = z.object({
  serverId: z.string().uuid(), workspaceId: z.string().min(1), name: z.string().trim().min(1).max(200),
  source: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("local"), command: z.string().trim().min(1).max(1000), args: z.array(z.string().max(2000)).max(32), cwd: z.string().min(1).max(4096) }).strict(),
    z.object({ kind: z.literal("remote"), url: z.string().url().max(2048).refine(value => new URL(value).protocol === "https:", "HTTPS is required"), auth: z.enum(["oauth", "none"]) }).strict(),
    z.object({ kind: z.literal("bundle"), path: z.string().min(1).max(4096), sha256: z.string().regex(/^[a-f0-9]{64}$/), format: z.enum(["mcpb", "dxt"]) }).strict(),
  ]),
  state: z.enum(["pending", "approved", "revoked"]),
  sourceDigest: z.string().regex(/^[a-f0-9]{64}$/),
  createdAt: z.number(), updatedAt: z.number(),
});
export const OutboundMcpRegisterParams = OutboundMcpServerSchema.pick({ workspaceId: true, name: true, source: true });
export const OutboundMcpBundleInspectionSchema = z.object({ path: z.string(), sha256: z.string().regex(/^[a-f0-9]{64}$/),
  format: z.enum(["mcpb", "dxt"]), name: z.string().max(200), server: z.record(z.string(), z.unknown()) });
export const OutboundMcpGrantSchema = z.object({
  grantId: z.string().uuid(), serverId: z.string().uuid(), toolName: z.string().min(1).max(200),
  scope: z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("workspace"), workspaceId: z.string().min(1) }).strict(),
    z.object({ kind: z.literal("task"), taskId: z.string().min(1), revision: z.number().int().positive() }).strict(),
  ]),
  mode: z.enum(["once", "standing"]),
  outputTokenLimit: z.number().int().min(1).max(32_000),
  createdAt: z.number(), revokedAt: z.number().optional(), consumedAt: z.number().optional(),
});
export const OutboundMcpGrantParams = OutboundMcpGrantSchema.pick({ serverId: true, toolName: true, scope: true, mode: true, outputTokenLimit: true });
export const OutboundMcpToolSchema = z.object({ name: z.string(), description: z.string().optional(), inputSchema: z.record(z.string(), z.unknown()) });
export const OutboundMcpCallResultSchema = z.object({ callId: z.string().uuid(), status: z.enum(["completed", "uncertain"]), output: z.string().max(128_000), isError: z.boolean() });
export type OutboundMcpServer = z.infer<typeof OutboundMcpServerSchema>;
export type OutboundMcpGrant = z.infer<typeof OutboundMcpGrantSchema>;
export type OutboundMcpTool = z.infer<typeof OutboundMcpToolSchema>;
export type OutboundMcpCallResult = z.infer<typeof OutboundMcpCallResultSchema>;
