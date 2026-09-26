import { expect, it, vi } from "vitest";
import type { AuxBridge, MigrationReview } from "../../apps/shell/src/bridge";
import { applyReviewedMigration } from "../../apps/shell/src/migration-import";

const review: MigrationReview = {
  status: "ready",
  contentHash: "a".repeat(64),
  manifestSha256: "b".repeat(64),
  tabs: 205,
  bookmarks: 101,
  bookmarkFolders: 1,
  spaces: 2,
  vaultPending: true,
  omitted: { unsafeTabs: 1, unsafeBookmarks: 0, missingArtifacts: 0, vaultMetadata: 0, layoutMissing: false },
};

it("awaits each reviewed native batch in folder, bookmark, tab order before completion", async () => {
  const calls: string[] = [];
  const host = {
    migrationBegin: vi.fn(async () => {
      calls.push("begin");
      return review;
    }),
    migrationBatch: vi.fn(async ({ section, offset }: { section: string; offset: number }) => {
      calls.push(`${section}:${offset}`);
      return { status: "importing" as const, folders: 1, bookmarks: 101, tabs: 205 };
    }),
    migrationFinish: vi.fn(async () => {
      calls.push("finish");
      return { ...review, status: "applied" as const };
    }),
  } as unknown as Pick<AuxBridge, "migrationBegin" | "migrationBatch" | "migrationFinish">;
  const progress = vi.fn();
  expect((await applyReviewedMigration(host, review, progress)).status).toBe("applied");
  expect(calls).toEqual([
    "begin",
    "folders:0",
    "bookmarks:0",
    "bookmarks:100",
    "tabs:0",
    "tabs:100",
    "tabs:200",
    "finish",
  ]);
  expect(progress).toHaveBeenCalledTimes(6);
  expect(host.migrationBegin).toHaveBeenCalledWith({
    contentHash: review.contentHash,
    manifestSha256: review.manifestSha256,
    confirmed: true,
  });
});

it("replays bounded batches from zero on resume and never writes a completion receipt after a failed batch", async () => {
  const host = {
    migrationBegin: vi.fn(async () => review),
    migrationBatch: vi.fn(async ({ section, offset }: { section: string; offset: number }) => {
      if (section === "tabs" && offset === 100) throw new Error("native tab failed");
      return { status: "importing" as const, folders: 1, bookmarks: 101, tabs: 100 };
    }),
    migrationFinish: vi.fn(async () => ({ ...review, status: "applied" as const })),
  } as unknown as Pick<AuxBridge, "migrationBegin" | "migrationBatch" | "migrationFinish">;
  await expect(applyReviewedMigration(host, { ...review, status: "interrupted" }, () => {})).rejects.toThrow(
    "native tab failed",
  );
  expect(host.migrationBatch).toHaveBeenNthCalledWith(1, {
    contentHash: review.contentHash,
    manifestSha256: review.manifestSha256,
    section: "folders",
    offset: 0,
  });
  expect(host.migrationFinish).not.toHaveBeenCalled();
});
