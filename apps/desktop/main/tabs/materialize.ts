import { offscreen, registry } from "../app/services.js";
import { createPageView, destroyPageView } from "../native-views.js";
import { captureScrollPosition, restoreScrollPosition } from "../page-suspension.js";
import type { ViewEntry } from "../target-registry.js";
import { viewHooks } from "../views/hooks.js";
import { type RegularWindowState, pageWindowOwners, stateForEntry, stateForWindowId } from "../windows/registry.js";
import { applyStage, clearPreviewWatch } from "../windows/stage.js";
import { forgetPageLifecycle } from "./lifecycle-controller.js";
import { controllerClosing, noteTab } from "./publish.js";
import { tabCatalog } from "./store.js";

/** Navigation history of recently closed tabs (BR-01: reopen restores real
 *  history, not just the last URL). In-memory only — reopening after a restart
 *  falls back to the recorded URL, matching every mainstream browser. */
export const CLOSED_HISTORY_LIMIT = 50;
export const closedHistory = new Map<string, { entries: Electron.NavigationEntry[]; index: number }>();
export function rememberClosedHistory(entry: ViewEntry) {
  const wc = entry.view.webContents;
  if (wc.isDestroyed() || entry.popup) return;
  const entries = wc.navigationHistory.getAllEntries();
  if (!entries.length) return;
  closedHistory.delete(entry.pageId);
  closedHistory.set(entry.pageId, { entries, index: wc.navigationHistory.getActiveIndex() });
  while (closedHistory.size > CLOSED_HISTORY_LIMIT) closedHistory.delete(closedHistory.keys().next().value!);
}

/**
 * Create the view for a known pageId in `state`'s window, restoring the
 * navigation stack and scroll offset a discard/close captured. The initial
 * load is skipped when a history stack will be restored — the two navigations
 * would race and the restore would lose.
 */
export function materializeView(state: RegularWindowState, pageId: string, url: string, options: { background: boolean; ownedByRuntime?: boolean }): ViewEntry {
  const history = closedHistory.get(pageId);
  const entry = createPageView({
    win: state.win, registry, pageId, windowId: state.id,
    marker: `atab-${pageId}`, url: history ? "" : url, background: options.background,
    ownedByRuntime: options.ownedByRuntime, hooks: viewHooks,
  });
  pageWindowOwners.set(pageId, state.id);
  if (history) {
    closedHistory.delete(pageId);
    void entry.view.webContents.navigationHistory.restore({ entries: history.entries, index: history.index })
      .catch(() => void entry.view.webContents.loadURL(url).catch(() => {}));
  }
  const scroll = scrollPositions.get(pageId);
  if (scroll) {
    scrollPositions.delete(pageId);
    entry.view.webContents.once("did-finish-load", () => void restoreScrollPosition(entry.view.webContents, scroll));
  }
  return entry;
}

/**
 * Close a tab's view for the typed controller (human and agent commands).
 * The controller publishes its own remove (+window) patch, so onDestroyed
 * must not race a second remove.
 */
export async function closeTab(pageId: string): Promise<boolean> {
  const entry = registry.get(pageId);
  const state = stateForEntry(entry);
  if (!entry) return true;
  if (!state) return false;
  controllerClosing.add(pageId);
  rememberClosedHistory(entry);
  // A hung renderer must not hold ⌘W — scroll capture gets a short budget.
  rememberScroll(entry, await captureScrollPosition(entry.view.webContents, 400));
  let closed: boolean;
  try {
    closed = await destroyPageView(entry, state.win);
  } finally {
    controllerClosing.delete(pageId);
  }
  if (!closed) return false;
  if (registry.get(pageId) === entry) registry.remove(pageId);
  // A closed page can't stay focused, split, previewed or hold the stage
  // lease — stale pointers would leave every other view hidden.
  if (state.focusedPageId === pageId) state.focusedPageId = null;
  if (state.splitPageId === pageId) state.splitPageId = null;
  if (state.previewWatch?.pageId === pageId) clearPreviewWatch(state);
  offscreen.forget(pageId);
  forgetPageLifecycle(pageId);
  applyStage(state);
  return true;
}

/**
 * Catalog records can outlive their views (restored session, runtime
 * restart). Materialize on demand — the tab's saved URL loads lazily the
 * first time the user actually touches it.
 */
export function ensureTabView(pageId: string): ViewEntry | undefined {
  const existing = registry.get(pageId);
  if (existing && !existing.view.webContents.isDestroyed()) return existing;
  const record = tabCatalog.tab(pageId);
  if (!record) return undefined;
  const state = stateForWindowId(record.windowId);
  if (!state || state.win.isDestroyed()) return undefined;
  const entry = materializeView(state, pageId, record.url, { background: true, ownedByRuntime: record.runtimeOwned });
  // Materializing a fresh WebContents for a known tab bumps its instance
  // generation — stale commands aimed at the previous instance stay rejected.
  noteTab(pageId, { generation: tabCatalog.nextGeneration(pageId), lifecycle: "live" });
  return entry;
}

/** Last scroll offsets for discarded/closed tabs — LRU like closedHistory. */
export const scrollPositions=new Map<string,{x:number;y:number}>();
export function rememberScroll(entry:ViewEntry,position:{x:number;y:number}|null){
  if(!position||entry.popup)return;
  scrollPositions.delete(entry.pageId);scrollPositions.set(entry.pageId,position);
  while(scrollPositions.size>CLOSED_HISTORY_LIMIT)scrollPositions.delete(scrollPositions.keys().next().value!);
}
