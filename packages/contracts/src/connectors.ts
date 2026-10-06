import { z } from "zod";

/** Profile-owned integrations are visible here; access follows their original connection and current tool settings. */
export const ConnectorEntrySchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("calendar"),
      connectorId: z.string(),
      connectionId: z.string().uuid(),
      label: z.string(),
      accountKey: z.string(),
      state: z.enum(["active", "needs_reauth"]),
      authority: z.literal("calendar_account"),
    })
    .strict(),
  z
    .object({
      kind: z.literal("mcp"),
      connectorId: z.string(),
      serverId: z.string().uuid(),
      label: z.string(),
      state: z.enum(["active", "revoked"]),
      authority: z.literal("connected_server"),
    })
    .strict(),
]);
export type ConnectorEntry = z.infer<typeof ConnectorEntrySchema>;

export const ConnectorAccessSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("calendar"),
      connectorId: z.string(),
      taskId: z.string().uuid(),
      taskRevision: z.number().int().positive(),
      grantId: z.string().uuid(),
      authority: z.literal("calendar_task_grant"),
    })
    .strict(),
  z
    .object({
      kind: z.literal("mcp"),
      connectorId: z.string(),
      taskId: z.string().uuid(),
      taskRevision: z.number().int().positive(),
      toolsRevision: z.number().int().nonnegative(),
      toolName: z.string(),
      authority: z.literal("enabled_mcp_tool"),
    })
    .strict(),
]);
export type ConnectorAccess = z.infer<typeof ConnectorAccessSchema>;

export const ConnectorCatalogSchema = z
  .object({
    entries: z.array(ConnectorEntrySchema),
    access: z.array(ConnectorAccessSchema),
  })
  .strict();
export type ConnectorCatalog = z.infer<typeof ConnectorCatalogSchema>;
