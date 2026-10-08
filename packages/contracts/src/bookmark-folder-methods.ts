import { z } from "zod";

const nodeId = z.string().regex(/^[1-9]\d{0,18}$/);
const index = z.number().int().nonnegative();
export const BookmarkFolderSchema = z
  .object({
    nodeId,
    parentId: nodeId.nullable(),
    index,
    title: z.string(),
    path: z.array(z.string()),
    permanent: z.boolean(),
    childIds: z.array(nodeId),
  })
  .strict();
export const BookmarkFolderSnapshotSchema = z
  .object({
    rootId: nodeId,
    editable: z.boolean(),
    folders: z.array(BookmarkFolderSchema),
  })
  .strict();
const source = BookmarkFolderSchema.pick({ nodeId: true, parentId: true, index: true, title: true })
  .extend({ parentId: nodeId })
  .strict();
const destination = z
  .object({
    parentId: nodeId,
    index,
    expectedChildren: z.array(nodeId),
  })
  .strict();
// Inverse operations must preserve names already admitted by Chromium imports.
const title = z.string();
export const BookmarkFolderChangeSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("create"), destination, title, absentNodeId: nodeId.optional() }).strict(),
  z.object({ kind: z.literal("rename"), source, title }).strict(),
  z.object({ kind: z.literal("move"), source, destination }).strict(),
  z.object({ kind: z.literal("remove"), source }).strict(),
]);
export const BookmarkFolderChangeResultSchema = z
  .object({
    snapshot: BookmarkFolderSnapshotSchema,
    undo: BookmarkFolderChangeSchema.nullable(),
  })
  .strict();
export type BookmarkFolder = z.infer<typeof BookmarkFolderSchema>;
export type BookmarkFolderSnapshot = z.infer<typeof BookmarkFolderSnapshotSchema>;
export type BookmarkFolderChange = z.infer<typeof BookmarkFolderChangeSchema>;

export const BookmarkPlacementSchema = z
  .object({
    source: source.extend({ url: z.string() }).strict(),
    destination,
  })
  .strict();
export const BookmarkPlacementResultSchema = z
  .object({
    snapshot: BookmarkFolderSnapshotSchema,
    undo: BookmarkPlacementSchema.nullable(),
  })
  .strict();
export type BookmarkPlacement = z.infer<typeof BookmarkPlacementSchema>;
