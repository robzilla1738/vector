import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { BrowserStore, coalescePatches, durableTabKey } from "../../apps/desktop/main/tabs/browser-store.js";
import { newTabRecord } from "../../apps/desktop/main/tabs/catalog.js";
import type { TabPatch } from "@aux/contracts";

/**
 * Round-trip through the real persistence worker — the same bundled .cjs
 * shape the packaged app spawns. Proves patches commit durably and a cold
 * store restores the same catalog.
 */
const dirs: string[] = [];
let workerUrl: URL;

beforeAll(async () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-store-build-"));
  dirs.push(dir);
  const out = join(dir, "browser-store.cjs");
  // esbuild is a desktop devDependency — resolve it through that package.
  const esbuildPath = createRequire(join(import.meta.dirname, "../../apps/desktop/package.json")).resolve("esbuild");
  const { buildSync } = await import(esbuildPath);
  buildSync({
    entryPoints: [join(import.meta.dirname, "../../apps/desktop/main/tabs/browser-store.worker.ts")],
    outfile: out,
    bundle: true,
    platform: "node",
    format: "cjs",
  });
  workerUrl = pathToFileURL(out);
});

afterAll(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const store = (dir: string, onError?: (error: Error) => void) =>
  new BrowserStore({ dir, workerUrl, onError });

const patch = (version: number, ops: TabPatch["ops"]): TabPatch => ({ version, baseVersion: version - 1, ops, ts: version });

describe("coalescePatches", () => {
  it("merges a burst into one write and skips upserts a restore would discard", () => {
    const tab = newTabRecord({ pageId: "one", windowId: "main", url: "https://a.test/" });
    const durable = new Map([["one", durableTabKey(tab)]]);
    expect(coalescePatches([patch(2, [{ op: "upsert", tab: { ...tab, loading: true } }]), patch(3, [{ op: "upsert", tab: { ...tab, audible: true, crashed: true } }])], durable)).toBeNull();
    const merged = coalescePatches([
      patch(4, [{ op: "upsert", tab: { ...tab, loading: true } }]),
      patch(5, [{ op: "upsert", tab: { ...tab, title: "Title" } }]),
      patch(6, [{ op: "remove", pageId: "two" }]),
    ], durable);
    expect(merged).toMatchObject({ baseVersion: 3, version: 6 });
    expect(merged?.ops.map(op => op.op)).toEqual(["upsert", "remove"]);
    expect(coalescePatches([patch(7, [{ op: "upsert", tab: { ...tab, title: "Title", loading: false } }])], durable)).toBeNull();
  });
});

describe("BrowserStore durability", () => {
  it("commits patches in order and restores them after a cold start", async () => {
    const dir = mkdtempSync(join(tmpdir(), "aux-store-"));
    dirs.push(dir);
    const first = store(dir);
    await first.persist(patch(1, [
      { op: "upsert", tab: newTabRecord({ pageId: "one", windowId: "main", url: "https://a.test/" }) },
      { op: "window", window: { windowId: "main", order: ["one"], activePageId: "one" } },
    ]));
    await first.persist(patch(2, [
      { op: "upsert", tab: { ...newTabRecord({ pageId: "one", windowId: "main", url: "https://a.test/next" }), muted: true } },
    ]));
    await first.whenDurable(2);
    expect(first.durableVersion).toBe(2);
    await first.dispose();

    const restored = store(dir);
    const snapshot = await restored.load();
    expect(snapshot?.version).toBe(2);
    const tab = snapshot?.tabs.find(record => record.pageId === "one");
    expect(tab).toMatchObject({ url: "https://a.test/next", muted: true, loading: false, crashed: false });
    expect(snapshot?.windows).toEqual([{ windowId: "main", order: ["one"], activePageId: "one" }]);
    await restored.dispose();
  });

  it("applies removes and carries a navigation error through the round trip", async () => {
    const dir = mkdtempSync(join(tmpdir(), "aux-store-"));
    dirs.push(dir);
    const first = store(dir);
    await first.persist(patch(1, [
      { op: "upsert", tab: newTabRecord({ pageId: "one", windowId: "main" }) },
      { op: "upsert", tab: newTabRecord({ pageId: "two", windowId: "main" }) },
      { op: "window", window: { windowId: "main", order: ["one", "two"], activePageId: "two" } },
    ]));
    const withError = { ...newTabRecord({ pageId: "one", windowId: "main", url: "https://bad.test/" }), navigationError: { url: "https://bad.test/", code: -105, message: "Name not resolved" } };
    await first.persist(patch(2, [{ op: "upsert", tab: withError }]));
    await first.persist(patch(3, [
      { op: "remove", pageId: "two" },
      { op: "window", window: { windowId: "main", order: ["one"], activePageId: "one" } },
    ]));
    await first.dispose();

    const restored = store(dir);
    const snapshot = await restored.load();
    expect(snapshot?.tabs.map(record => record.pageId)).toEqual(["one"]);
    expect(snapshot?.tabs[0]?.navigationError).toEqual({ url: "https://bad.test/", code: -105, message: "Name not resolved" });
    expect(snapshot?.windows[0]?.activePageId).toBe("one");
    await restored.dispose();
  });

  it("degrades instead of throwing when the worker cannot start", async () => {
    const dir = mkdtempSync(join(tmpdir(), "aux-store-"));
    dirs.push(dir);
    const onError = vi.fn();
    const broken = new BrowserStore({ dir, workerUrl: pathToFileURL(join(dir, "missing.cjs")), onError });
    expect(await broken.load()).toBeNull();
    expect(onError).toHaveBeenCalled();
    // Persistence drops silently — durability reporting never blocks browsing.
    await broken.persist(patch(1, [{ op: "remove", pageId: "x" }]));
    expect(broken.durableVersion).toBe(0);
    await expect(broken.whenDurable(5)).rejects.toThrow();
    await broken.dispose();
  });
});
