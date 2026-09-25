import { z } from "zod";

/** Profile-owned integrations are visible here; access is always derived from their original grants. */
export const ConnectorEntrySchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("calendar"), connectorId: z.string(), connectionId: z.string().uuid(),
    label: z.string(), accountKey: z.string(), state: z.enum(["active", "needs_reauth"]),
    authority: z.literal("calendar_account") }).strict(),
  z.object({ kind: z.literal("github"), connectorId: z.literal("github"), label: z.string(),
    account: z.string().optional(), state: z.enum(["connected", "disconnected"]),
    authority: z.literal("saved_credential_and_task_project") }).strict(),
  z.object({ kind: z.literal("mcp"), connectorId: z.string(), serverId: z.string().uuid(),
    label: z.string(), state: z.enum(["pending", "approved", "revoked"]),
    authority: z.literal("reviewed_server_and_tool_grant") }).strict(),
]);
export type ConnectorEntry = z.infer<typeof ConnectorEntrySchema>;

export const ConnectorAccessSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("calendar"), connectorId: z.string(), taskId: z.string().uuid(),
    taskRevision: z.number().int().positive(), grantId: z.string().uuid(),
    authority: z.literal("calendar_task_grant") }).strict(),
  z.object({ kind: z.literal("github"), connectorId: z.literal("github"), taskId: z.string().uuid(),
    taskRevision: z.number().int().positive(), projectId: z.string().uuid(),
    authority: z.literal("task_project_resource") }).strict(),
  z.object({ kind: z.literal("mcp"), connectorId: z.string(), taskId: z.string().uuid(),
    taskRevision: z.number().int().positive(), grantId: z.string().uuid(), toolName: z.string(),
    authority: z.literal("mcp_tool_grant") }).strict(),
]);
export type ConnectorAccess = z.infer<typeof ConnectorAccessSchema>;

export const ConnectorCatalogSchema = z.object({
  entries: z.array(ConnectorEntrySchema), access: z.array(ConnectorAccessSchema),
}).strict();
export type ConnectorCatalog = z.infer<typeof ConnectorCatalogSchema>;
