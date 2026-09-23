import { registry } from "../app/services.js";
import { createPageView } from "../native-views.js";
import { restoreScrollPosition } from "../page-suspension.js";
import type { ViewEntry } from "../target-registry.js";
import { viewHooks } from "../views/hooks.js";
import { pageWindowOwners, stateForWindowId } from "../windows/registry.js";
import { noteTab } from "./publish.js";
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
  // A discarded tab restores its captured navigation stack; the initial load
  // is skipped so the two navigations don't race.
  const history = closedHistory.get(pageId);
  const entry = createPageView({
    win: state.win, registry, pageId, windowId: state.id,
    marker: `atab-${pageId}`, url: history ? "" : record.url, background: true,
    ownedByRuntime: record.runtimeOwned, hooks: viewHooks,
  });
  pageWindowOwners.set(pageId, state.id);
  if (history) {
    closedHistory.delete(pageId);
    void entry.view.webContents.navigationHistory.restore({ entries: history.entries, index: history.index })
      .catch(() => void entry.view.webContents.loadURL(record.url).catch(() => {}));
  }
  const scroll = scrollPositions.get(pageId);
  if (scroll) {
    scrollPositions.delete(pageId);
    entry.view.webContents.once("did-finish-load", () => void restoreScrollPosition(entry.view.webContents, scroll));
  }
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
