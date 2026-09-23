import { describe, expect, it } from "vitest";
import type { TabPatchOp, TabRecord } from "@aux/contracts";
import { TabCatalog, newTabRecord } from "../../apps/desktop/main/tabs/catalog.js";

const tab = (pageId: string, windowId = "main", over: Partial<TabRecord> = {}): TabRecord =>
  ({ ...newTabRecord({ pageId, windowId, url: `https://a.test/${pageId}` }), ...over });
const upsert = (record: TabRecord): TabPatchOp => ({ op: "upsert", tab: record, origin: "human" });
const win = (windowId: string, order: string[], activePageId: string | null): TabPatchOp =>
  ({ op: "window", window: { windowId, order, activePageId } });
const asPatches = (result: ReturnType<TabCatalog["since"]>) => {
  if (result.kind !== "patches") throw new Error("expected retained patches");
  return result.patches;
};
const asSnapshot = (result: ReturnType<TabCatalog["since"]>) => {
  if (result.kind !== "snapshot") throw new Error("expected a snapshot fallback");
  return result.snapshot;
};

describe("TabCatalog versioning and patch log", () => {
  it("stamps ordered patches and serves them to lagging subscribers", () => {
    const catalog = new TabCatalog();
    const first = catalog.apply([upsert(tab("one"))]);
    const second = catalog.apply([upsert(tab("two")), win("main", ["one", "two"], "one")]);
    expect([first.version, first.baseVersion]).toEqual([1, 0]);
    expect([second.version, second.baseVersion]).toEqual([2, 1]);
    expect(catalog.currentVersion).toBe(2);
    const missed = catalog.since(0);
    expect(asPatches(missed).map(patch => patch.version)).toEqual([1, 2]);
    expect(catalog.since(2)).toEqual({ kind: "patches", patches: [] });
  });

  it("answers a snapshot when the requested version is unknown or future", () => {
    const catalog = new TabCatalog();
    catalog.apply([upsert(tab("one"))]);
    expect(asSnapshot(catalog.since(9)).version).toBe(1);
  });

  it("falls back to a snapshot once the needed patch leaves the retained log", () => {
    const catalog = new TabCatalog();
    catalog.apply([upsert(tab("one"))]);
    for (let i = 0; i < 300; i++) catalog.apply([upsert(tab(`t${i}`))]);
    expect(asSnapshot(catalog.since(1)).tabs.length).toBe(301);
    expect(catalog.since(catalog.currentVersion - 10).kind).toBe("patches");
  });
});

describe("TabCatalog ordering and activation ownership", () => {
  it("keeps an upserted tab inside its owning window order without a paired window op", () => {
    const catalog = new TabCatalog();
    catalog.apply([upsert(tab("one"))]);
    catalog.apply([upsert(tab("two"))]);
    expect(catalog.window("main")?.order).toEqual(["one", "two"]);
    expect(catalog.window("main")?.activePageId).toBeNull();
  });

  it("moves a tab between windows on upsert and drops it from the source order", () => {
    const catalog = new TabCatalog();
    catalog.apply([upsert(tab("one")), upsert(tab("two")), win("main", ["one", "two"], "one")]);
    catalog.apply([upsert(tab("one", "second"))]);
    expect(catalog.window("main")?.order).toEqual(["two"]);
    expect(catalog.window("main")?.activePageId).toBeNull();
    expect(catalog.window("second")?.order).toEqual(["one"]);
  });

  it("clears the active pointer on remove and filters foreign-owned order entries", () => {
    const catalog = new TabCatalog();
    catalog.apply([upsert(tab("one")), upsert(tab("two")), win("main", ["one", "two"], "two")]);
    catalog.apply([upsert(tab("one", "second")), win("main", ["one", "two"], "one")]);
    // "one" now belongs to "second" — the stale order entry is dropped, and
    // the stale active pointer falls back to the still-owned previous pick.
    expect(catalog.window("main")?.order).toEqual(["two"]);
    expect(catalog.window("main")?.activePageId).toBe("two");
    catalog.apply([{ op: "remove", pageId: "one" }]);
    expect(catalog.window("main")?.order).toEqual(["two"]);
  });

  it("snapshot reflects tabs, order, and the per-window active pointer", () => {
    const catalog = new TabCatalog();
    catalog.apply([upsert(tab("one")), upsert(tab("two")), win("main", ["two", "one"], "two")]);
    const snapshot = catalog.snapshot();
    expect(snapshot.windows).toEqual([{ windowId: "main", order: ["two", "one"], activePageId: "two" }]);
    expect(snapshot.tabs.map(record => record.pageId).sort()).toEqual(["one", "two"]);
  });
});

describe("TabCatalog restore and revisions", () => {
  it("restores persisted state without emitting patches and continues the version", () => {
    const catalog = new TabCatalog();
    catalog.apply([upsert(tab("one")), win("main", ["one"], "one")]);
    const restored = new TabCatalog();
    restored.restore(catalog.snapshot());
    expect(restored.currentVersion).toBe(1);
    expect(restored.window("main")?.order).toEqual(["one"]);
    const next = restored.apply([upsert(tab("two"))]);
    expect(next.baseVersion).toBe(1);
    expect(restored.since(1)).toEqual({ kind: "patches", patches: [next] });
  });

  it("bumps a tab's revision on structural change only — never on content updates", () => {
    const catalog = new TabCatalog();
    catalog.apply([upsert(tab("one"))]);
    expect(catalog.revisionOf("one")).toBe(1);
    catalog.apply([upsert(tab("one", "main", { title: "New title", loading: false }))]);
    expect(catalog.revisionOf("one")).toBe(1);
    catalog.apply([upsert(tab("one", "main", { generation: 1 }))]);
    expect(catalog.revisionOf("one")).toBe(3);
    catalog.apply([upsert(tab("one", "second"))]);
    expect(catalog.revisionOf("one")).toBe(4);
    catalog.apply([{ op: "remove", pageId: "one" }]);
    expect(catalog.revisionOf("one")).toBeUndefined();
  });
});
