import { describe, expect, it } from "vitest";
import { OrganizationLayoutSchema, type PageTarget } from "@aux/contracts";
import {
  confirmArchiveClose,
  finishTabArchive,
  reconcilePendingArchives,
  removeTabArchive,
  stageTabArchive,
} from "../../apps/shell/src/tab-archive.js";
import {
  deleteArchivedTab,
  restoreAllArchivedTabs,
  restoreArchivedTab,
  withArchiveTransaction,
} from "../../apps/shell/src/archive-actions.js";
import { emptyLayout } from "../../apps/shell/src/workspace.js";
import {
  fromOrganizationLayout,
  toOrganizationLayout,
} from "../../apps/shell/src/store/organization-layout.js";

const page = {
  pageId: "p1",
  url: "https://example.test/article",
  title: "Reading",
  controller: "human",
  viewStatus: "visible",
  ownedByRuntime: false,
} as PageTarget;

describe("Profile tab archive", () => {
  it("persists a pending native close and resolves it from the restored catalog", () => {
    const before = { ...emptyLayout(), order: ["p1"], tabSpace: { p1: "space-personal" } };
    const { layout, entry } = stageTabArchive(before, page, 100);
    const saved = OrganizationLayoutSchema.parse(toOrganizationLayout(layout));
    const restarted = fromOrganizationLayout({
      ...saved,
      window: toOrganizationLayout(emptyLayout()).window,
    });
    expect(restarted.archivedTabs).toEqual([entry]);
    expect(reconcilePendingArchives(restarted, new Set(["p1"])).archivedTabs).toEqual([]);
    const closed = reconcilePendingArchives(restarted, new Set());
    expect(closed.archivedTabs?.[0]?.state).toBe("archived");
    expect(removeTabArchive(finishTabArchive(layout, entry.archiveId), entry.archiveId).archivedTabs).toEqual(
      [],
    );
  });

  it("refuses an agent tab, non-web URL and duplicate archive", () => {
    const { layout } = stageTabArchive(emptyLayout(), page);
    expect(() => stageTabArchive(layout, page)).toThrow(/already/);
    expect(() => stageTabArchive(emptyLayout(), { ...page, controller: "agent" })).toThrow(/cannot/);
    expect(() => stageTabArchive(emptyLayout(), { ...page, url: "chrome://settings" })).toThrow(/cannot/);
  });

  it("resolves a lost close acknowledgement from the native catalog without losing the pending entry", async () => {
    const lost = async (): Promise<{ status: string }> => {
      throw new Error("connection reset");
    };
    expect(await confirmArchiveClose("p1", lost, async () => ({ tabs: [] }))).toBe(true);
    expect(await confirmArchiveClose("p1", lost, async () => ({ tabs: [{ pageId: "p1" }] }))).toBe(false);
    await expect(
      confirmArchiveClose("p1", lost, async () => {
        throw new Error("catalog unavailable");
      }),
    ).rejects.toThrow(/pending archive/);
  });
});

it("reserves an automatic pending entry without pruning on refusal, then prunes only after confirmed close", () => {
  const layout = emptyLayout();
  layout.archivedTabs = Array.from({ length: 300 }, (_, i) => ({
    archiveId: `old-${i}`,
    pageId: `old-page-${i}`,
    url: "https://example.test/old",
    title: "Old",
    spaceId: layout.activeSpaceId,
    index: i,
    archivedAt: i,
    state: "archived" as const,
    reason: i === 0 ? ("auto" as const) : ("manual" as const),
    batchId: "old-batch",
  }));
  const staged = stageTabArchive(layout, page, 1000, { reason: "auto", batchId: "new-batch" });
  expect(staged.layout.archivedTabs).toHaveLength(301);
  expect(staged.layout.archivedTabs?.some((entry) => entry.archiveId === "old-0")).toBe(true);
  expect(removeTabArchive(staged.layout, staged.entry.archiveId).archivedTabs).toEqual(layout.archivedTabs);
  const finished = finishTabArchive(staged.layout, staged.entry.archiveId);
  expect(finished.archivedTabs).toHaveLength(300);
  expect(finished.archivedTabs?.some((entry) => entry.archiveId === "old-0")).toBe(false);
  expect(finished.archivedTabs?.find((entry) => entry.archiveId === staged.entry.archiveId)?.state).toBe(
    "archived",
  );
});

it("refuses a new batch at twenty pending receipts and preserves a full manual archive", () => {
  const layout = emptyLayout();
  layout.archivedTabs = Array.from({ length: 20 }, (_, i) => ({
    archiveId: `pending-${i}`,
    pageId: `pending-page-${i}`,
    url: "https://example.test/old",
    title: "Pending",
    spaceId: layout.activeSpaceId,
    index: i,
    archivedAt: i,
    state: "pending" as const,
    reason: "auto" as const,
    batchId: "pending-batch",
  }));
  expect(() => stageTabArchive(layout, page, 1000, { reason: "auto" })).toThrow(/in progress/);
  layout.archivedTabs = Array.from({ length: 300 }, (_, i) => ({
    ...layout.archivedTabs![0]!,
    archiveId: `manual-${i}`,
    pageId: `manual-page-${i}`,
    state: "archived" as const,
    reason: "manual" as const,
  }));
  expect(() => stageTabArchive(layout, page, 1000, { reason: "auto" })).toThrow(/full/);
  expect(layout.archivedTabs).toHaveLength(300);
});

it("reserves each required prune only once and reconciles a close at capacity", () => {
  const layout = emptyLayout();
  layout.archivedTabs = Array.from({ length: 300 }, (_, i) => ({
    archiveId: `old-${i}`,
    pageId: `old-${i}`,
    url: "https://example.test/old",
    title: "Old",
    spaceId: layout.activeSpaceId,
    index: i,
    archivedAt: i,
    state: "archived" as const,
    reason: i === 0 ? ("auto" as const) : ("manual" as const),
    batchId: "old-batch",
  }));
  const staged = stageTabArchive(layout, page, 1000, { reason: "auto" });
  expect(() => stageTabArchive(staged.layout, { ...page, pageId: "p2" }, 1001, { reason: "auto" })).toThrow(
    /full/,
  );
  const recovered = reconcilePendingArchives(staged.layout, new Set());
  expect(recovered.archivedTabs).toHaveLength(300);
  expect(
    recovered.archivedTabs?.some(
      (entry) => entry.archiveId === staged.entry.archiveId && entry.state === "archived",
    ),
  ).toBe(true);
});

it("rejects overlapping archive callers and releases the transaction after failure", async () => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  const first = withArchiveTransaction(async () => {
    await pending;
    throw new Error("native refusal");
  });
  await expect(withArchiveTransaction(async () => "overlap")).rejects.toThrow(/in progress/);
  await expect(deleteArchivedTab("receipt")).rejects.toThrow(/in progress/);
  await expect(restoreAllArchivedTabs()).rejects.toThrow(/in progress/);
  await expect(
    restoreArchivedTab({ archiveId: "receipt" } as Parameters<typeof restoreArchivedTab>[0]),
  ).rejects.toThrow(/in progress/);
  release();
  await expect(first).rejects.toThrow(/native refusal/);
  expect(await withArchiveTransaction(async () => "next batch")).toBe("next batch");
});
