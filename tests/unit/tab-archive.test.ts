import { describe, expect, it } from "vitest";
import { OrganizationLayoutSchema, type PageTarget } from "@aux/contracts";
import { confirmArchiveClose, finishTabArchive, reconcilePendingArchives, removeTabArchive, stageTabArchive } from "../../apps/shell/src/tab-archive.js";
import { emptyLayout } from "../../apps/shell/src/workspace.js";
import { fromOrganizationLayout, toOrganizationLayout } from "../../apps/shell/src/store/organization-layout.js";

const page = { pageId: "p1", url: "https://example.test/article", title: "Reading",
  controller: "human", viewStatus: "visible", ownedByRuntime: false } as PageTarget;

describe("Profile tab archive", () => {
  it("persists a pending native close and resolves it from the restored catalog", () => {
    const before = { ...emptyLayout(), order: ["p1"], tabSpace: { p1: "space-personal" } };
    const { layout, entry } = stageTabArchive(before, page, 100);
    const saved = OrganizationLayoutSchema.parse(toOrganizationLayout(layout));
    const restarted = fromOrganizationLayout({ ...saved, window: toOrganizationLayout(emptyLayout()).window });
    expect(restarted.archivedTabs).toEqual([entry]);
    expect(reconcilePendingArchives(restarted, new Set(["p1"])).archivedTabs).toEqual([]);
    const closed = reconcilePendingArchives(restarted, new Set());
    expect(closed.archivedTabs?.[0]?.state).toBe("archived");
    expect(removeTabArchive(finishTabArchive(layout, entry.archiveId), entry.archiveId).archivedTabs).toEqual([]);
  });

  it("refuses an agent tab, non-web URL and duplicate archive", () => {
    const { layout } = stageTabArchive(emptyLayout(), page);
    expect(() => stageTabArchive(layout, page)).toThrow(/already/);
    expect(() => stageTabArchive(emptyLayout(), { ...page, controller: "agent" })).toThrow(/cannot/);
    expect(() => stageTabArchive(emptyLayout(), { ...page, url: "chrome://settings" })).toThrow(/cannot/);
  });

  it("resolves a lost close acknowledgement from the native catalog without losing the pending entry", async () => {
    const lost = async (): Promise<{ status: string }> => { throw new Error("connection reset"); };
    expect(await confirmArchiveClose("p1", lost, async () => ({ tabs: [] }))).toBe(true);
    expect(await confirmArchiveClose("p1", lost, async () => ({ tabs: [{ pageId: "p1" }] }))).toBe(false);
    await expect(confirmArchiveClose("p1", lost, async () => { throw new Error("catalog unavailable"); }))
      .rejects.toThrow(/pending archive/);
  });
});
