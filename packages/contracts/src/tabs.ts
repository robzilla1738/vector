import { z } from "zod";
import { TabNameSchema } from "./tab-name.js";
import { SpaceThemeSchema } from "./spaces.js";

/**
 * Human tab command + catalog protocol (§7.2). The desktop main process owns
 * the tab catalog and actuates commands locally — no runtime round trip sits
 * in the human navigation path. Every command carries a deduplicated
 * `commandId`, the issuing `windowId`, and an optional `catalogVersion` the
 * caller based its decision on; every accepted command receives an outcome
 * acknowledgment. Main publishes ordered, versioned patches; a subscriber
 * that detects a gap or reconnects requests a fresh snapshot.
 */

const id = z.string().min(1).max(128);

/**
 * Workspace placement a cross-window move carries to the destination window.
 * The catalog never stores it — main relays it verbatim to the shells so the
 * destination renderer can file the arriving tab into the right Space/folder.
 * `space` is a transport descriptor, not the runtime-owned record — the
 * destination maps it onto its own Space type.
 */
export const TabPlacementSchema = z.object({
  space: z.object({
    id: z.string().min(1).max(200),
    name: z.string().max(100),
    color: z.string().max(40),
    grain: z.number().int().min(0).max(100).optional(),
    theme: SpaceThemeSchema.optional(),
    workspaceId: z.string().max(200).optional(),
  }),
  folder: z.object({ id, name: z.string().max(200), spaceId: z.string().min(1).max(200), collapsed: z.boolean(), color: z.string().max(40).optional(), emoji: z.string().max(16).optional() }).optional(),
  tabName: z.object({ title: TabNameSchema, url: z.string().url().max(8192) }).optional(),
});
export type TabPlacement = z.infer<typeof TabPlacementSchema>;

export const TabCommandSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("open"),
    url: z.string().max(8192).optional(),
    /** renderer-minted optimistic id — main accepts or rejects it explicitly */
    pageId: id.optional(),
    background: z.boolean().optional(),
    activate: z.boolean().optional(),
    /** strip position — absent appends at the end */
    index: z.number().int().nonnegative().optional(),
    /** agent opens mark the tab runtime-owned — only honored for trusted issuers */
    runtimeOwned: z.boolean().optional(),
  }),
  z.object({ kind: z.literal("close"), pageId: id }),
  z.object({ kind: z.literal("activate"), pageId: id }),
  z.object({ kind: z.literal("navigate"), pageId: id, url: z.string().min(1).max(8192) }),
  z.object({ kind: z.literal("back"), pageId: id }),
  z.object({ kind: z.literal("forward"), pageId: id }),
  z.object({ kind: z.literal("reload"), pageId: id, hard: z.boolean().optional() }),
  z.object({ kind: z.literal("stop"), pageId: id }),
  z.object({ kind: z.literal("setMuted"), pageId: id, muted: z.boolean() }),
  /** drag reorder inside the strip — the envelope's windowId scopes it */
  z.object({ kind: z.literal("reorder"), order: z.array(id).min(1).max(512) }),
  /**
   * Cross-window transfer. `windowId` names the destination window; omitting
   * it asks main to create one. The envelope's windowId is the source — only
   * the owning window may send a tab away.
   */
  z.object({
    kind: z.literal("move"),
    pageId: id,
    windowId: id.optional(),
    activate: z.boolean().optional(),
    placement: TabPlacementSchema.optional(),
  }),
]);
export type TabCommand = z.infer<typeof TabCommandSchema>;
export type TabCommandKind = TabCommand["kind"];

export const TabCommandEnvelopeSchema = z.object({
  commandId: z.string().min(8).max(128),
  windowId: id,
  /**
   * The catalog version the caller observed before issuing the command.
   * Rejected with `stale_tab` when the targeted tab changed after it — a
   * repeated or delayed command cannot clobber a tab that moved on.
   */
  catalogVersion: z.number().int().nonnegative().optional(),
  command: TabCommandSchema,
});
export type TabCommandEnvelope = z.infer<typeof TabCommandEnvelopeSchema>;

export const TabCommandAckSchema = z.object({
  commandId: z.string(),
  status: z.enum(["applied", "duplicate", "rejected"]),
  catalogVersion: z.number().int().nonnegative(),
  pageId: z.string().optional(),
  /** the window the command landed on — populated for `move` */
  windowId: z.string().optional(),
  /** CDP target id of the tab an `open` created, so the runtime attaches without scanning tabs */
  targetId: z.string().optional(),
  error: z.object({ code: z.string(), message: z.string() }).optional(),
});
export type TabCommandAck = z.infer<typeof TabCommandAckSchema>;

/** One catalog row — the browser-domain truth about a tab. */
export const TabRecordSchema = z.object({
  pageId: id,
  windowId: id,
  /** Main-owned destination for page-derived memory; set only after Space validation. */
  spaceId: z.string().min(1).max(200).optional(),
  workspaceId: z.string().min(1).max(200).optional(),
  url: z.string(),
  title: z.string(),
  /** Browser-owned theme-color metadata, serialized as an opaque RGB value. */
  themeColor: z.string().regex(/^#[0-9a-f]{6}$/).optional(),
  favicon: z.string().optional(),
  loading: z.boolean(),
  muted: z.boolean(),
  audible: z.boolean(),
  canGoBack: z.boolean(),
  canGoForward: z.boolean(),
  popup: z.boolean(),
  crashed: z.boolean(),
  /** last main-frame load failure — the error surface must not depend on the runtime */
  navigationError: z.object({ url: z.string(), code: z.number(), message: z.string(), upgradedFrom: z.string().optional() }).optional(),
  /** agent-owned pages render in the catalog but outside the human strip */
  runtimeOwned: z.boolean(),
  /** tab-instance generation — bumps when the underlying WebContents is replaced */
  generation: z.number().int().nonnegative(),
  /** Resident-view lifecycle: placeholder = record only (restored, not yet
   *  materialized), frozen = WebContents held but suspended, discarded = view
   *  destroyed but the tab survives for lazy reload. Absent means live. */
  lifecycle: z.enum(["placeholder", "live", "frozen", "discarded"]).optional(),
  createdAt: z.number(),
  lastActiveAt: z.number(),
});
export type TabRecord = z.infer<typeof TabRecordSchema>;

/** One-time import from a window's older renderer layout; existing catalog bindings always win. */
export const TabSpaceMigrationSchema = z.array(z.object({ pageId: id, spaceId: z.string().min(1).max(200) }).strict()).max(512);

export const WindowTabsSchema = z.object({
  windowId: id,
  order: z.array(id),
  activePageId: id.nullable(),
});
export type WindowTabs = z.infer<typeof WindowTabsSchema>;

/**
 * Catalog mutations. `origin` tells subscribers which side already knows —
 * the runtime skips registering tabs it created itself; renderers ignore it.
 */
export const TabPatchOpSchema = z.discriminatedUnion("op", [
  z.object({
    op: z.literal("upsert"),
    tab: TabRecordSchema,
    origin: z.enum(["human", "runtime", "external"]).optional(),
  }),
  z.object({ op: z.literal("remove"), pageId: id }),
  z.object({ op: z.literal("window"), window: WindowTabsSchema }),
]);
export type TabPatchOp = z.infer<typeof TabPatchOpSchema>;

export const TabPatchSchema = z.object({
  version: z.number().int().positive(),
  baseVersion: z.number().int().nonnegative(),
  batterySaverActive: z.boolean().optional(),
  ops: z.array(TabPatchOpSchema).min(1),
  ts: z.number(),
});
export type TabPatch = z.infer<typeof TabPatchSchema>;

export const TabCatalogSnapshotSchema = z.object({
  version: z.number().int().nonnegative(),
  batterySaverActive: z.boolean().optional(),
  tabs: z.array(TabRecordSchema),
  windows: z.array(WindowTabsSchema),
});
export type TabCatalogSnapshot = z.infer<typeof TabCatalogSnapshotSchema>;
