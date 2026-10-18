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
  catalogDigest: z
    .string()
    .regex(/^[a-f0-9]{64}$/)
    .optional(),
  /** Successful structural discovery only; not current OAuth/account or write authority. */
  fileUpload: z
    .object({
      catalogDigest: z.string().regex(/^[a-f0-9]{64}$/),
      allocationTool: z.enum(["notion-create-file-upload", "slack_get_file_upload_url"]),
      completionTool: z.literal("slack_complete_file_upload").optional(),
    })
    .strict()
    .optional(),
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
  outputSchema: z.record(z.string(), z.unknown()).optional(),
  annotations: z
    .object({
      readOnlyHint: z.boolean().optional(),
      destructiveHint: z.boolean().optional(),
      idempotentHint: z.boolean().optional(),
      openWorldHint: z.boolean().optional(),
    })
    .optional(),
  effect: z.enum(["read", "write", "unknown"]).optional(),
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

/** Public endpoints owned by the provider; client credentials belong in the Profile Keychain. */
export const OFFICIAL_MCP_CONNECTORS = [
  {
    id: "notion",
    name: "Notion",
    url: "https://mcp.notion.com/mcp",
    registrationUrl: "https://developers.notion.com/guides/mcp/build-mcp-client",
    help: "Notion supports automatic native client registration. Tools and filters depend on workspace permissions and plan; Aux preserves returned restrictions and notices.",
  },
  {
    id: "slack",
    name: "Slack",
    url: "https://mcp.slack.com/mcp",
    registrationUrl: "https://docs.slack.dev/ai/slack-mcp-server/",
    help: "Requires your real eligible internal or Marketplace app registration, client ID and secret, exact callback and approved user scopes. Unlisted apps and automatic registration are unsupported. This connection is separate from Slack bot channels.",
  },
  {
    id: "github",
    name: "GitHub",
    url: "https://api.githubcopilot.com/mcp/",
    registrationUrl: "https://github.com/settings/developers",
    help: "Register an Aux OAuth app with its exact loopback callback. GitHub requires your app's client ID and secret.",
  },
  {
    id: "vercel",
    name: "Vercel",
    url: "https://mcp.vercel.com",
    registrationUrl: "https://vercel.com/docs/agent-resources/vercel-mcp",
    help: "Vercel requires an approved Aux client. Use the client registration issued to Aux after Vercel's review.",
  },
  {
    id: "sentry",
    name: "Sentry",
    url: "https://mcp.sentry.dev/mcp",
    registrationUrl: "https://mcp.sentry.dev/",
    help: "Sentry supports automatic registration during sign-in.",
  },
] as const;
const McpScopesSchema = z
  .array(
    z
      .string()
      .min(1)
      .max(200)
      .regex(/^[^\s,]+$/),
  )
  .max(128);
export const McpOAuthAccountSchema = z
  .object({
    provider: z.enum(["notion", "slack"]),
    userId: z.string().min(1).max(200).optional(),
    workspaceId: z.string().min(1).max(200).optional(),
    workspaceName: z.string().min(1).max(200).optional(),
  })
  .strict();
export const McpOAuthStatusSchema = z
  .object({
    connected: z.boolean(),
    expiresAt: z.number().int().optional(),
    grantedScopes: McpScopesSchema.optional(),
    account: McpOAuthAccountSchema.optional(),
  })
  .strict();
export const McpOAuthClientSetupSchema = z
  .object({
    serverId: z.string().uuid(),
    issuer: z.string().url().max(2048),
    clientId: z.string().trim().min(1).max(2048),
    clientSecret: z.string().min(1).max(8192).optional(),
    requestedScopes: McpScopesSchema.optional(),
    redirectUrl: z
      .string()
      .url()
      .max(2048)
      .refine((value) => {
        const url = new URL(value);
        return (
          url.protocol === "http:" &&
          url.hostname === "127.0.0.1" &&
          !!url.port &&
          url.pathname === "/oauth/mcp" &&
          !url.username &&
          !url.password &&
          !url.search &&
          !url.hash
        );
      }, "Use an exact http://127.0.0.1:PORT/oauth/mcp callback."),
  })
  .strict();
export const McpOAuthRequirementsSchema = z
  .object({
    issuer: z.string().url(),
    authorizationUrl: z.string().url(),
    automaticRegistration: z.boolean(),
    configured: z.boolean(),
    supportedScopes: McpScopesSchema.optional(),
    requestedScopes: McpScopesSchema.optional(),
    clientSecretRequired: z.boolean().optional(),
    tokenAuthMethods: z.array(z.string().max(100)).max(32).optional(),
    officialProvider: z.enum(["notion", "slack"]).optional(),
    redirectUrl: z.string().url().optional(),
  })
  .strict();
export type McpOAuthClientSetup = z.infer<typeof McpOAuthClientSetupSchema>;
