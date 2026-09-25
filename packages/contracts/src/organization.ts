import { z } from "zod";
import { SpaceColorSchema, SpaceGrainSchema } from "./spaces.js";

const Id = z.string().min(1).max(200);
const Space = z
  .object({
    id: Id,
    name: z.string().min(1).max(100),
    color: SpaceColorSchema,
    grain: SpaceGrainSchema,
    workspaceId: Id.optional(),
    archived: z.boolean().optional(),
  })
  .strict();
const Folder = z
  .object({
    id: Id,
    name: z.string().min(1).max(200),
    spaceId: Id,
    collapsed: z.boolean(),
    color: SpaceColorSchema.optional(),
    emoji: z.string().max(16).optional(),
  })
  .strict();
const Pin = z.object({ url: z.string().min(1).max(2048), title: z.string().max(500) }).strict();
export const MAX_ORGANIZATION_LAYOUT_BYTES = 256 * 1024;

/** The native host chooses the Profile and window; neither ID comes from renderer arguments. */
export const OrganizationLayoutSchema = z
  .object({
    shared: z
      .object({
        spaces: z.array(Space).min(1).max(200),
        archivedSpaces: z.array(Space).max(200),
        pins: z.record(Id, z.array(Pin).max(500)),
        folders: z.array(Folder).max(1000),
      })
      .strict(),
    window: z
      .object({
        activeSpaceId: Id,
        activeTabs: z.record(Id, Id),
        splitRatio: z.number().min(0.1).max(0.9),
        tabSpace: z.record(Id, Id),
        order: z.array(Id).max(5000),
        tabFolder: z.record(Id, Id),
        splits: z.record(Id, Id),
      })
      .strict(),
  })
  .strict()
  .refine(
    (value) => new TextEncoder().encode(JSON.stringify(value)).byteLength <= MAX_ORGANIZATION_LAYOUT_BYTES,
    "Profile organization exceeds 256 KiB.",
  );
export type OrganizationLayout = z.infer<typeof OrganizationLayoutSchema>;

export const OrganizationSnapshotSchema = z
  .object({
    revision: z.number().int().nonnegative(),
    layout: OrganizationLayoutSchema.nullable(),
  })
  .strict();
export type OrganizationSnapshot = z.infer<typeof OrganizationSnapshotSchema>;
export const OrganizationCommitSchema = z
  .object({
    expectedRevision: z.number().int().nonnegative(),
    layout: OrganizationLayoutSchema,
  })
  .strict();
export type OrganizationCommit = z.infer<typeof OrganizationCommitSchema>;
