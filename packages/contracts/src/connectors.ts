import { XAccountSchema, XOperationSchema } from "./x.js";
import { GoogleAccountSchema, GoogleOperationSchema } from "./google.js";
import { z } from "zod";

/** Profile-owned integrations are visible here; access follows their original connection and current tool settings. */
export const ConnectorEntrySchema = z.discriminatedUnion("kind", [
  XAccountSchema.omit({ createdAt: true, updatedAt: true }).extend({
    kind: z.literal("x"),
    connectorId: z.string(),
    authority: z.literal("x_account"),
  }),
  GoogleAccountSchema.omit({ createdAt: true, updatedAt: true }).extend({
    kind: z.literal("google"),
    connectorId: z.string(),
    authority: z.literal("google_account"),
  }),
  z
    .object({
      kind: z.literal("calendar"),
      connectorId: z.string(),
      connectionId: z.string().uuid(),
      label: z.string(),
      accountKey: z.string(),
      revision: z.string().regex(/^[a-f0-9]{64}$/),
      state: z.enum(["active", "needs_reauth"]),
      authority: z.literal("calendar_account"),
    })
    .strict(),
  z
    .object({
      kind: z.literal("mcp"),
      connectorId: z.string(),
      serverId: z.string().uuid(),
      sourceDigest: z.string().regex(/^[a-f0-9]{64}$/),
      toolsRevision: z.number().int().nonnegative(),
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
      kind: z.literal("x"),
      connectorId: z.string(),
      taskId: z.string().uuid(),
      taskRevision: z.number().int().positive(),
      grantId: z.string().uuid(),
      operations: z.array(XOperationSchema),
      authority: z.literal("x_task_grant"),
    })
    .strict(),
  z
    .object({
      kind: z.literal("google"),
      connectorId: z.string(),
      taskId: z.string().uuid(),
      taskRevision: z.number().int().positive(),
      grantId: z.string().uuid(),
      operations: z.array(GoogleOperationSchema),
      authority: z.literal("google_task_grant"),
    })
    .strict(),
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
    bindings: z.record(z.string(), z.string().regex(/^[a-f0-9]{64}$/)),
  })
  .strict();
export type ConnectorCatalog = z.infer<typeof ConnectorCatalogSchema>;

/** Canonical capture input shared by native runtime and browser-only preview. */
export function connectorAuthorityInput(
  entry: ConnectorEntry,
  access: readonly ConnectorAccess[],
  context: { workspaceId: string; taskId?: string; expectedRevision?: number },
): string {
  const canonical = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.entries(value)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, item]) => [key, canonical(item)]),
      );
    return value;
  };
  const grants = access
    .filter((item) => item.connectorId === entry.connectorId)
    .map((item) => JSON.stringify(canonical(item)))
    .sort();
  return JSON.stringify(["aux.connector-authority.v1", canonical(context), canonical(entry), grants]);
}
