// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { TabCatalogSnapshot } from "@aux/contracts";
import { bridge } from "../bridge";
import { tabCommand, useStore } from "../store";
import { emptyLayout } from "../workspace";
import { normalizePages } from "./pages";

vi.mock("../feature-availability", () => ({ featureStage: () => "on" }));
type TabsSinceResult = Awaited<ReturnType<typeof bridge.tabsSince>>;
const syncTabsSnapshot = useStore.getState().syncTabsSnapshot;
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
const snapshot = (version: number): TabCatalogSnapshot => ({ version, tabs: [], windows: [] });
const result = (version: number): TabsSinceResult => ({ kind: "snapshot", snapshot: snapshot(version) });
function reads() {
  const pending: ReturnType<typeof deferred<TabsSinceResult>>[] = [];
  const fetch = vi.spyOn(bridge, "tabsSince").mockImplementation(() => {
    const next = deferred<TabsSinceResult>();
    pending.push(next);
    return next.promise;
  });
  return { pending, fetch };
}
beforeEach(() => {
  useStore.setState({
    pages: normalizePages([]),
    layout: emptyLayout(),
    activePageId: null,
    catalogVersion: 1,
    restoringTabs: false,
    pendingRestoreIds: [],
    connected: false,
    syncTabsSnapshot,
  });
});
afterEach(() => vi.restoreAllMocks());

it("repairs a patch that precedes an older snapshot response while the runtime is unavailable", async () => {
  const f = reads(),
    command = vi.spyOn(bridge, "tabCommand");
  const first = useStore.getState().resyncTabs();
  for (let version = 4; version <= 10; version++)
    useStore.getState().applyTabsPatch({ baseVersion: version - 1, version, ts: version, ops: [] });
  expect(f.fetch).toHaveBeenCalledTimes(1);
  f.pending[0]!.resolve(result(3));
  await first;
  await vi.waitFor(() => expect(f.fetch).toHaveBeenCalledTimes(2));
  const publish = vi.spyOn(useStore.getState(), "syncTabsSnapshot");
  f.pending[1]!.resolve(result(10));
  await vi.waitFor(() => expect(useStore.getState().catalogVersion).toBe(10));
  expect(publish).toHaveBeenCalledTimes(1);
  expect(f.fetch.mock.calls.map(([version]) => version)).toEqual([1, 3]);
  expect(command).not.toHaveBeenCalled();
});

it.each(["first", "last"])("keeps another valid queued owner when the %s owner retires", async (retired) => {
  const f = reads();
  const first = useStore.getState().resyncTabs();
  let a = true,
    b = true;
  const ownerA = useStore.getState().resyncTabs(() => a);
  const ownerB = useStore.getState().resyncTabs(() => b);
  if (retired === "first") a = false;
  else b = false;
  f.pending[0]!.resolve(result(3));
  await first;
  await vi.waitFor(() => expect(f.fetch).toHaveBeenCalledTimes(2));
  f.pending[1]!.resolve(result(4));
  await Promise.all([ownerA, ownerB]);
  expect(useStore.getState().catalogVersion).toBe(4);
  expect(f.fetch).toHaveBeenCalledTimes(2);
});

it("lets a surviving coalesced owner publish when the owner who started the follow-up retires", async () => {
  const f = reads();
  const first = useStore.getState().resyncTabs();
  let a = true;
  const ownerA = useStore.getState().resyncTabs(() => a);
  const ownerB = useStore.getState().resyncTabs(() => true);
  f.pending[0]!.resolve(result(3));
  await first;
  await vi.waitFor(() => expect(f.fetch).toHaveBeenCalledTimes(2));
  a = false;
  f.pending[1]!.resolve(result(4));
  await Promise.all([ownerA, ownerB]);
  expect(useStore.getState().catalogVersion).toBe(4);
  expect(f.fetch).toHaveBeenCalledTimes(2);
});

it("does not publish an original owner's result after retirement, but preserves a new valid read", async () => {
  const f = reads();
  let alive = true;
  const first = useStore.getState().resyncTabs(() => alive);
  const next = useStore.getState().resyncTabs(() => true);
  alive = false;
  f.pending[0]!.resolve(result(3));
  await first;
  await vi.waitFor(() => expect(f.fetch).toHaveBeenCalledTimes(2));
  expect(useStore.getState().catalogVersion).toBe(1);
  f.pending[1]!.resolve(result(4));
  await next;
  expect(useStore.getState().catalogVersion).toBe(4);
});

it("starts no follow-up if every queued owner retires", async () => {
  const f = reads();
  const first = useStore.getState().resyncTabs();
  let a = true,
    b = true;
  const ownerA = useStore.getState().resyncTabs(() => a),
    ownerB = useStore.getState().resyncTabs(() => b);
  a = b = false;
  f.pending[0]!.resolve(result(3));
  await Promise.all([first, ownerA, ownerB]);
  expect(f.fetch).toHaveBeenCalledTimes(1);
  expect(useStore.getState().catalogVersion).toBe(3);
});

it("does not publish a follow-up whose coalesced owners all retire before the response", async () => {
  const f = reads();
  const first = useStore.getState().resyncTabs();
  let a = true,
    b = true;
  const ownerA = useStore.getState().resyncTabs(() => a),
    ownerB = useStore.getState().resyncTabs(() => b);
  f.pending[0]!.resolve(result(3));
  await first;
  await vi.waitFor(() => expect(f.fetch).toHaveBeenCalledTimes(2));
  a = b = false;
  f.pending[1]!.resolve(result(4));
  await Promise.all([ownerA, ownerB]);
  expect(useStore.getState().catalogVersion).toBe(3);
  expect(f.fetch).toHaveBeenCalledTimes(2);
});

it("does not retry failed reads without a genuine queued request", async () => {
  const f = reads();
  const first = useStore.getState().resyncTabs();
  const queued = [useStore.getState().resyncTabs(), useStore.getState().resyncTabs()];
  f.pending[0]!.reject(new Error("native reply unavailable"));
  await first;
  await vi.waitFor(() => expect(f.fetch).toHaveBeenCalledTimes(2));
  f.pending[1]!.reject(new Error("native reply still unavailable"));
  await Promise.all(queued);
  expect(f.fetch).toHaveBeenCalledTimes(2);
  expect(useStore.getState().catalogVersion).toBe(1);
});

it("retains a newer applied patch when the coalesced snapshot is older", async () => {
  const f = reads();
  const first = useStore.getState().resyncTabs();
  useStore.getState().applyTabsPatch({ baseVersion: 1, version: 2, ts: 1, ops: [] });
  f.pending[0]!.resolve(result(1));
  await first;
  expect(useStore.getState().catalogVersion).toBe(2);
});

it("keeps stale mutating command rejection and never refreshes then replays the command", async () => {
  const f = reads();
  const command = vi.spyOn(bridge, "tabCommand").mockResolvedValue({
    commandId: "original-command",
    status: "rejected",
    catalogVersion: 4,
    error: { code: "stale_tab", message: "The tab catalog changed; refresh before retrying" },
  });
  await expect(tabCommand({ kind: "reload", pageId: "original-page" })).rejects.toThrow(
    "The tab catalog changed",
  );
  expect(command).toHaveBeenCalledExactlyOnceWith({ kind: "reload", pageId: "original-page" }, 1);
  expect(f.fetch).not.toHaveBeenCalled();
});
