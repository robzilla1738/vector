import type { TabPatch, TabPatchOp, TabRecord } from "@aux/contracts";
import { notifyRuntime } from "../runtime/supervisor.js";
import { regularWindows } from "../windows/registry.js";
import { browserStore, tabCatalog } from "./store.js";

export let pendingTabPatches: TabPatch[] = [];
export let tabPatchFlush: NodeJS.Immediate | null = null;
/** Last window each shell was told owns a tab — moves and removes reach the source shell too. */
export const shellTabWindow = new Map<string, string>();
/** Tabs the runtime has registered — for those it reads only placement from upserts. */
export const runtimeLiveTabs = new Set<string>();
export const runtimeTabWindow = new Map<string, string>();

/**
 * One fan-out for every catalog patch: renderers, runtime, persistence worker.
 * Patches from one turn of the event loop leave as one merged patch; tab
 * commands flush before acknowledging so a shell sees the patch first.
 */
export function publishTabPatch(patch: TabPatch) {
  pendingTabPatches.push(patch);
  tabPatchFlush ??= setImmediate(flushTabPatches);
}

export function flushTabPatches() {
  if (tabPatchFlush) { clearImmediate(tabPatchFlush); tabPatchFlush = null; }
  const batch = pendingTabPatches;
  if (!batch.length) return;
  pendingTabPatches = [];
  const last = batch.at(-1)!;
  const merged: TabPatch = batch.length === 1 ? last : { version: last.version, baseVersion: batch[0]!.baseVersion, ops: batch.flatMap(item => item.ops), ts: last.ts };
  // Every shell gets every version (gap detection), carrying only its own ops.
  const opsFor = new Map([...regularWindows.keys()].map(id => [id, [] as TabPatchOp[]]));
  const runtimeOps: TabPatchOp[] = [];
  for (const op of merged.ops) {
    const targets = new Set<string>();
    if (op.op === "window") targets.add(op.window.windowId);
    else if (op.op === "upsert") {
      const previous = shellTabWindow.get(op.tab.pageId);
      targets.add(op.tab.windowId);
      if (previous) targets.add(previous);
      shellTabWindow.set(op.tab.pageId, op.tab.windowId);
    } else {
      const previous = shellTabWindow.get(op.pageId);
      if (previous) targets.add(previous); else for (const id of opsFor.keys()) targets.add(id);
      shellTabWindow.delete(op.pageId);
    }
    for (const id of targets) opsFor.get(id)?.push(op);
    if (op.op === "upsert" && runtimeLiveTabs.has(op.tab.pageId) && runtimeTabWindow.get(op.tab.pageId) === op.tab.windowId) continue;
    if (op.op === "upsert") runtimeTabWindow.set(op.tab.pageId, op.tab.windowId);
    else if (op.op === "remove") runtimeTabWindow.delete(op.pageId);
    runtimeOps.push(op);
  }
  for (const state of regularWindows.values()) state.shellView.webContents.send("tabs.patch", { ...merged, ops: opsFor.get(state.id) ?? [] });
  if (runtimeOps.length) notifyRuntime("tabs.catalog", { ...merged, ops: runtimeOps });
  browserStore.persist(merged).catch(() => {});
}

export const sameTabValue = (a: unknown, b: unknown) => a === b || (!!a && !!b && typeof a === "object" && typeof b === "object" && JSON.stringify(a) === JSON.stringify(b));

/**
 * Merge fields into a catalog record. Unknown pages are ignored — creation
 * always flows through a typed command or a native surface that knows the
 * window the tab belongs to. Fields that already hold the value publish nothing.
 */
export function noteTab(pageId: string, fields: Partial<TabRecord>, origin?: "runtime" | "external") {
  const current = tabCatalog.tab(pageId);
  if (!current) return;
  if (Object.entries(fields).every(([key, value]) => sameTabValue(current[key as keyof TabRecord], value))) return;
  publishTabPatch(tabCatalog.apply([{ op: "upsert", tab: { ...current, ...fields }, ...(origin ? { origin } : {}) }]));
}

/** Pages being closed by the typed controller — onDestroyed must not race
 *  its own remove patch against the controller's remove+window patch. */
export const controllerClosing = new Set<string>();
