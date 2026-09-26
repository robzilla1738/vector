import type { AuxBridge, MigrationProgress, MigrationReview, MigrationToken } from "./bridge";

const BATCH_SIZE = 100;

/** The native journal makes each batch idempotent; replay from zero after a restart. */
export async function applyReviewedMigration(
  host: Pick<AuxBridge, "migrationBegin" | "migrationBatch" | "migrationFinish">,
  review: MigrationReview,
  onProgress: (progress: MigrationProgress) => void,
): Promise<MigrationReview> {
  if (review.status === "applied") return review;
  const token: MigrationToken = { contentHash: review.contentHash, manifestSha256: review.manifestSha256 };
  await host.migrationBegin({ ...token, confirmed: true });
  for (const [section, count] of [
    ["folders", review.bookmarkFolders],
    ["bookmarks", review.bookmarks],
    ["tabs", review.tabs],
  ] as const) {
    for (let offset = 0; offset < count; offset += BATCH_SIZE) {
      onProgress(await host.migrationBatch({ ...token, section, offset }));
    }
  }
  return host.migrationFinish(token);
}
