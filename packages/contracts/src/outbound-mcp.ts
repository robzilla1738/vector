import { z } from "zod";

export const OutboundMcpServerSchema = z.object({
  serverId: z.string().uuid(),
  workspaceId: z.string().min(1),
  name: z.string().trim().min(1).max(200),
  source: z.discriminatedUnion("kind", [
    z
      .object({
        kind: z.literal("local"),
        command: z.string().trim().min(1).max(1000),
        args: z.array(z.string().max(2000)).max(32),
        cwd: z.string().min(1).max(4096),
      })
      .strict(),
    z
      .object({
        kind: z.literal("remote"),
        url: z
          .string()
          .url()
          .max(2048)
          .refine((value) => new URL(value).protocol === "https:", "HTTPS is required"),
        auth: z.enum(["oauth", "none"]),
      })
      .strict(),
    z
      .object({
        kind: z.literal("bundle"),
        path: z.string().min(1).max(4096),
        sha256: z.string().regex(/^[a-f0-9]{64}$/),
        format: z.enum(["mcpb", "dxt"]),
      })
      .strict(),
  ]),
  state: z.enum(["active", "revoked"]),
  toolsRevision: z.number().int().nonnegative(),
  disabledTools: z.array(z.string().min(1).max(200)),
  toolNames: z.array(z.string().min(1).max(200)),
  sourceDigest: z.string().regex(/^[a-f0-9]{64}$/),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export const OutboundMcpRegisterParams = OutboundMcpServerSchema.pick({
  workspaceId: true,
  name: true,
  source: true,
});
export const OutboundMcpBundleInspectionSchema = z.object({
  path: z.string(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  format: z.enum(["mcpb", "dxt"]),
  name: z.string().max(200),
  server: z.record(z.string(), z.unknown()),
});
export const OutboundMcpToolToggleParams = z
  .object({
    serverId: z.string().uuid(),
    toolName: z.string().min(1).max(200),
    enabled: z.boolean(),
    expectedRevision: z.number().int().nonnegative(),
  })
  .strict();
export const OutboundMcpToolSchema = z.object({
  name: z.string().min(1).max(200),
  enabled: z.boolean(),
  description: z.string().optional(),
  inputSchema: z.record(z.string(), z.unknown()),
});
export const OutboundMcpCallResultSchema = z.object({
  callId: z.string().uuid(),
  status: z.enum(["completed", "uncertain"]),
  output: z.string().max(128_000),
  isError: z.boolean(),
});
/** Native-host attestation for one supervised stdio launch. The launcher consumes capabilityId before spawning. */
export const McpStdioLaunchPermitSchema = z
  .object({
    serverId: z.string().uuid(),
    sourceDigest: z.string().regex(/^[a-f0-9]{64}$/),
    capabilityId: z.string().min(16).max(512),
    launcherPath: z.string().min(1).max(4096),
    launcherArgs: z.array(z.string().max(2048)).max(16),
    cwd: z.string().min(1).max(4096),
    expiresAt: z.number().int().positive(),
    effectiveProfile: z
      .object({
        networkAllowed: z.literal(false),
        readableRoots: z.array(z.string().min(1).max(4096)).max(32),
        writableRoots: z.tuple([]),
      })
      .strict(),
  })
  .strict();
export const McpOAuthTokenSchema = z
  .object({
    serverId: z.string().uuid(),
    sourceDigest: z.string().regex(/^[a-f0-9]{64}$/),
    token: z
      .string()
      .min(1)
      .max(8192)
      .regex(/^[A-Za-z0-9\-._~+/]+={0,2}$/),
    expiresAt: z.number().int().positive(),
  })
  .strict();
export type OutboundMcpServer = z.infer<typeof OutboundMcpServerSchema>;
export type OutboundMcpTool = z.infer<typeof OutboundMcpToolSchema>;
export type OutboundMcpCallResult = z.infer<typeof OutboundMcpCallResultSchema>;
export type McpStdioLaunchPermit = z.infer<typeof McpStdioLaunchPermitSchema>;
export type McpOAuthToken = z.infer<typeof McpOAuthTokenSchema>;
