import * as z from "zod/mini";
/** Identity of a saved capture; canonical parser remains synchronous for first input and Forget. */
export const CapturedSourceSchema = z.strictObject({
  memoryId: z.string().check(z.minLength(1), z.maxLength(200)),
  profileId: z.string().check(z.minLength(1), z.maxLength(200)),
  workspaceId: z.string().check(z.minLength(1), z.maxLength(200)),
  pageId: z.string().check(z.minLength(1), z.maxLength(200)),
  documentEpoch: z.int().check(z.nonnegative()),
  url: z.url().check(z.maxLength(8192)),
  title: z.string(),
  capturedAt: z.int().check(z.nonnegative()),
});
export type CapturedSource = z.infer<typeof CapturedSourceSchema>;
export const CapturedSourceSelectionSchema = z
  .strictObject({
    workspaceId: z.string().check(z.minLength(1), z.maxLength(200)),
    sources: z.array(CapturedSourceSchema),
  })
  .check(
    z.refine(
      (value) =>
        value.sources.every((source) => source.workspaceId === value.workspaceId) &&
        new Set(value.sources.map((source) => source.memoryId)).size === value.sources.length,
      "Saved articles must be distinct captures from one Space.",
    ),
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
