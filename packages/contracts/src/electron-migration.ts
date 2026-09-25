import { z } from "zod";
import { SpaceColorSchema } from "./spaces.js";

const id = z.string().min(1).max(200);
const title = z.string().max(500);
const url = z.string().url().max(8192).refine(value => {
  const parsed = new URL(value);
  return (parsed.protocol === "http:" || parsed.protocol === "https:") && !parsed.username && !parsed.password;
}, "Use an http(s) URL without embedded credentials");
const sha = z.string().regex(/^[a-f0-9]{64}$/);
export const ElectronMigrationSpaceSchema = z.object({
  id, workspaceId: id, name: z.string().min(1).max(100), color: SpaceColorSchema,
  archived: z.boolean(), grain: z.number().int().min(0).max(100).optional(),
}).strict();
export const ElectronMigrationTabSchema = z.object({
  sourcePageId: id, sourceWindowId: id, ordinal: z.number().int().nonnegative(),
  url, title, spaceId: id, folderId: id.optional(), active: z.boolean(),
  label: z.string().min(2).max(60).optional(),
}).strict();
export const ElectronMigrationBookmarkSchema = z.object({
  url, title, folderPath: z.array(z.string().min(1).max(200)).max(16),
  readingList: z.boolean(), readAt: z.number().nullable(), createdAt: z.number(),
}).strict();
export const ElectronMigrationLayoutSchema = z.object({
  activeSpaceId: id,
  spaces: z.array(ElectronMigrationSpaceSchema).min(1).max(200),
  order: z.array(id).max(20_000),
  pins: z.record(id, z.array(z.object({ url, title }).strict()).max(1_000)),
  folders: z.array(z.object({ id, name: z.string().min(1).max(100), spaceId: id, collapsed: z.boolean(), color: SpaceColorSchema.optional(), emoji: z.string().max(16).optional() }).strict()).max(2_000),
  activeTabs: z.record(id, id), splits: z.record(id, id),
  splitRatio: z.number().min(0.1).max(0.9),
}).strict();
export const ElectronMigrationManifestSchema = z.object({
  format: z.literal("aux-electron-to-chromium"), version: z.literal(1),
  contentHash: sha, createdAt: z.number(),
  source: z.object({ schemaVersion: z.number().int().positive(), snapshotSha256: sha }).strict(),
  database: z.object({ relativePath: z.literal("aux-state.sqlite"), sha256: sha, bytes: z.number().int().positive().max(2 * 1024 * 1024 * 1024) }).strict(),
  layout: ElectronMigrationLayoutSchema,
  tabs: z.array(ElectronMigrationTabSchema).max(20_000),
  bookmarks: z.array(ElectronMigrationBookmarkSchema).max(100_000),
  bookmarkFolders: z.array(z.array(z.string().min(1).max(200)).max(16)).max(10_000),
  artifacts: z.array(z.object({ artifactId: z.string().regex(/^[A-Za-z0-9_-]{1,128}$/), relativePath: z.string().regex(/^artifacts\/migrated\/[A-Za-z0-9_-]{1,128}(?:\.[A-Za-z0-9]{1,10})?$/), bytes: z.number().int().nonnegative().max(1024 * 1024 * 1024), sha256: sha }).strict()).max(10_000),
  omitted: z.object({ unsafeTabs: z.number().int().nonnegative(), unsafeBookmarks: z.number().int().nonnegative(), missingArtifacts: z.number().int().nonnegative(), vaultMetadata: z.number().int().nonnegative(), layoutMissing: z.boolean() }).strict(),
}).strict().superRefine((manifest, ctx) => {
  const unique = (values: string[], label: string) => {
    if (new Set(values).size !== values.length) ctx.addIssue({ code: "custom", message: `Duplicate ${label} in migration manifest` });
  };
  unique(manifest.layout.spaces.map(space => space.id), "Space id");
  unique(manifest.layout.spaces.map(space => space.workspaceId), "workspace id");
  unique(manifest.layout.order, "tab order id");
  unique(manifest.layout.folders.map(folder => folder.id), "folder id");
  unique(manifest.tabs.map(tab => tab.sourcePageId), "tab id");
  unique(manifest.bookmarks.map(bookmark => bookmark.url), "bookmark URL");
  unique(manifest.artifacts.map(artifact => artifact.artifactId), "artifact id");
  unique(manifest.artifacts.map(artifact => artifact.relativePath), "artifact path");
  const spaces = new Set(manifest.layout.spaces.map(space => space.id));
  const folders = new Map(manifest.layout.folders.map(folder => [folder.id, folder.spaceId]));
  if (!spaces.has(manifest.layout.activeSpaceId)) ctx.addIssue({ code: "custom", message: "Active Space is missing" });
  for (const spaceId of Object.keys(manifest.layout.pins)) if (!spaces.has(spaceId))
    ctx.addIssue({ code: "custom", message: `Pins refer to missing Space ${spaceId}` });
  for (const folder of manifest.layout.folders) if (!spaces.has(folder.spaceId))
    ctx.addIssue({ code: "custom", message: `Folder ${folder.id} refers to a missing Space` });
  for (const tab of manifest.tabs) {
    if (!spaces.has(tab.spaceId) || (tab.folderId && folders.get(tab.folderId) !== tab.spaceId))
      ctx.addIssue({ code: "custom", message: `Tab ${tab.sourcePageId} has an invalid Space or folder` });
  }
});
export type ElectronMigrationManifest = z.infer<typeof ElectronMigrationManifestSchema>;
