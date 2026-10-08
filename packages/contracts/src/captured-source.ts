import { z } from "zod";

/** Identity of the saved capture the person selected, never its article text. */
export const CapturedSourceSchema = z
  .object({
    memoryId: z.string().min(1).max(200),
    profileId: z.string().min(1).max(200),
    workspaceId: z.string().min(1).max(200),
    pageId: z.string().min(1).max(200),
    documentEpoch: z.number().int().nonnegative(),
    url: z.string().url().max(8192),
    title: z.string(),
    capturedAt: z.number().int().nonnegative(),
  })
  .strict();
export type CapturedSource = z.infer<typeof CapturedSourceSchema>;

export const CapturedSourceSelectionSchema = z
  .object({
    workspaceId: z.string().min(1).max(200),
    sources: z.array(CapturedSourceSchema),
  })
  .strict()
  .refine(
    (value) =>
      value.sources.every((source) => source.workspaceId === value.workspaceId) &&
      new Set(value.sources.map((source) => source.memoryId)).size === value.sources.length,
    "Saved articles must be distinct captures from one Space.",
  );
export type CapturedSourceSelection = z.infer<typeof CapturedSourceSelectionSchema>;

export function sameCapturedSource(a: CapturedSource, b: CapturedSource): boolean {
  return (
    a.memoryId === b.memoryId &&
    a.workspaceId === b.workspaceId &&
    a.profileId === b.profileId &&
    a.pageId === b.pageId &&
    a.documentEpoch === b.documentEpoch &&
    a.url === b.url &&
    a.title === b.title &&
    a.capturedAt === b.capturedAt
  );
}
