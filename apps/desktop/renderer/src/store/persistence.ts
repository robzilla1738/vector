import { bridge } from "../bridge";
import type { ClosedTab } from "../closed-tabs";
import { createEntryWriter } from "../conversation-drafts";
import { toast } from "../store";
import { type Layout, emptyLayout, parseLayout } from "../workspace";

export const LAYOUT_KEY = `aux.layout.v1:${bridge.windowId}`;
export const CLOSED_TABS_KEY=`aux.closed-tabs.v1:${bridge.windowId}`;
export const storage = typeof localStorage !== "undefined" ? localStorage : null;
export let lastPersistedLayout = storage?.getItem(LAYOUT_KEY) ?? null;
export let pendingLayout: Layout | null = null;
export let layoutTimer: ReturnType<typeof setTimeout> | undefined;
/** Write the latest scheduled layout now — also runs before the window unloads. */
export const flushLayout = () => {
  clearTimeout(layoutTimer); layoutTimer = undefined;
  const layout = pendingLayout; pendingLayout = null;
  if (!layout) return;
  const json = JSON.stringify(layout);
  if (json === lastPersistedLayout) return;
  lastPersistedLayout = json;
  try { storage?.setItem(LAYOUT_KEY, json); } catch { /* The live layout stays in memory. */ }
};
/** Layout writes coalesce: bursts of patches serialize and store once. */
export const persistLayout = (l: Layout) => {
  pendingLayout = l;
  layoutTimer ??= setTimeout(flushLayout, 250);
};
if (typeof window !== "undefined") window.addEventListener("pagehide", flushLayout);
export const persistClosedTabs=(tabs:ClosedTab[])=>{if(bridge.privateMode)return;try{storage?.setItem(CLOSED_TABS_KEY,JSON.stringify(tabs));}catch{/* Recovery remains available for this window. */}};
export const initialLayout = (() => {
  if (!storage) return emptyLayout();
  const current = storage.getItem(LAYOUT_KEY);
  const legacy = bridge.windowId === "main" ? storage.getItem("aux.layout.v1") : null;
  const layout = parseLayout(current ?? legacy);
  if (!current && legacy) persistLayout(layout);
  return layout;
})();

let draftStorageWarned = false;
/** One error toast per window when drafts stop reaching storage — the in-memory copy stays. */
export const warnDraftStorage = (text: string) => { if (!draftStorageWarned) { draftStorageWarned = true; toast(text, "error"); } };
export const draftWriter = createEntryWriter(storage, () => warnDraftStorage("Your draft is kept in this window, but could not be saved for restart."));
if (typeof window !== "undefined") window.addEventListener("pagehide", draftWriter.flush);
