import { newPageId } from "@aux/contracts";
import { PRIMARY_WINDOW_ID } from "../app/bootstrap.js";
import { registry } from "../app/services.js";
import { channel, runtimeInvoke } from "../runtime/supervisor.js";
import { viewHooks } from "../views/hooks.js";
import { createRegularWindow } from "../windows/create.js";
import { broadcastToShells, notifyHttpAuthChanged, pageWindowOwners, regularWindows, stateForEntry, stateForWindowId } from "../windows/registry.js";
import { applyStage, clearPreviewWatch, forgetPlacement } from "../windows/stage.js";
import { TabController, type TabPorts } from "./controller.js";
import { wakePage } from "./lifecycle-controller.js";
import { closeTab, ensureTabView, materializeView } from "./materialize.js";
import { noteTab, publishTabPatch } from "./publish.js";
import { tabCatalog } from "./store.js";

export const tabPorts: TabPorts = {
  mintPageId: () => newPageId(),
  windowOf: pageId => pageWindowOwners.get(pageId) ?? registry.get(pageId)?.windowId,
  open: ({ pageId, windowId, url, background, activate }) => {
    const state = stateForWindowId(windowId);
    if (!state || state.win.isDestroyed()) throw new Error("window gone");
    if (!registry.get(pageId)) {
      materializeView(state, pageId, url, { background });
      // A placeholder record whose view now exists is live again.
      noteTab(pageId, { lifecycle: "live" });
    }
    if (activate) tabPorts.focus(pageId);
    else applyStage(state);
  },
  close: closeTab,
  focus: pageId => {
    const entry = ensureTabView(pageId);
    const state = stateForEntry(entry);
    if (!entry || !state) return;
    wakePage(entry);
    if (entry.popup) { entry.popup.show(); entry.popup.focus(); return; }
    state.focusedPageId = pageId;
    state.win.contentView.addChildView(entry.view);
    forgetPlacement(entry);
    applyStage(state);
    state.win.show();
    state.win.focus();
    entry.view.webContents.focus();
  },
  navigate: (pageId, url) => {
    const entry = ensureTabView(pageId);
    if (!entry) throw new Error("tab gone");
    void wakePage(entry);
    void entry.view.webContents.loadURL(url).catch(() => {});
  },
  back: pageId => {
    const entry = registry.get(pageId);
    if (entry?.view.webContents.navigationHistory.canGoBack()) { void wakePage(entry); entry.view.webContents.navigationHistory.goBack(); }
  },
  forward: pageId => {
    const entry = registry.get(pageId);
    if (entry?.view.webContents.navigationHistory.canGoForward()) { void wakePage(entry); entry.view.webContents.navigationHistory.goForward(); }
  },
  reload: async (pageId, hard) => {
    const entry = ensureTabView(pageId);
    if (!entry) throw new Error("tab gone");
    const wc = entry.view.webContents;
    if (wc.isCrashed() && channel) {
      // A dead renderer has no live driver — the runtime reload path recovers
      // the view and re-attaches its CDP session, which `wc.reload` cannot do.
      await runtimeInvoke("pages.reload", { pageId, hard });
      return;
    }
    await wakePage(entry);
    if (hard) wc.reloadIgnoringCache(); else wc.reload();
  },
  stop: pageId => {
    const entry = registry.get(pageId);
    if (!entry) return;
    void wakePage(entry);
    entry.view.webContents.stop();
  },
  setMuted: (pageId, muted) => {
    const entry = registry.get(pageId);
    entry?.view.webContents.setAudioMuted(muted);
    if (entry) viewHooks.onAudio(entry.pageId, { muted: entry.view.webContents.isAudioMuted(), audible: entry.view.webContents.isCurrentlyAudible() });
  },
  move: (pageId, windowId, activate) => movePageToWindow(pageId, windowId, activate),
};

/**
 * Reparent a live view between regular windows — the single actuation path
 * for typed `move` commands and the runtime's `native.movePage`. Catalog ops
 * are the caller's job so each issuer publishes through its own channel.
 */
export async function movePageToWindow(pageId: string, windowId: string | undefined, activate: boolean) {
  // A discarded/placeholder tab materializes in its home window first — the
  // physical view move below then works like any other live tab.
  const entry = registry.get(pageId) ?? ensureTabView(pageId);
  const source = stateForEntry(entry);
  if (!entry || entry.popup || !source || entry.runtimeOwned) throw new Error("This tab cannot be moved to another window.");
  const destination = windowId ? regularWindows.get(windowId) : await createRegularWindow();
  if (!destination || destination.win.isDestroyed() || source.win.isDestroyed() || entry.view.webContents.isDestroyed()) throw new Error("The source or destination window was closed.");
  if (source.id === destination.id) return { windowId: destination.id, sourceWindowId: source.id, sourceActivePageId: source.focusedPageId, activePageId: source.focusedPageId, moved: false };
  source.win.contentView.removeChildView(entry.view);
  forgetPlacement(entry);
  try { destination.win.contentView.addChildView(entry.view); }
  catch (error) { source.win.contentView.addChildView(entry.view); throw error; }
  entry.windowId = destination.id;
  pageWindowOwners.set(pageId, destination.id);
  notifyHttpAuthChanged();
  if (source.previewWatch?.pageId === pageId) clearPreviewWatch(source);
  if (source.focusedPageId === pageId) source.focusedPageId = registry.all().find(candidate => !candidate.popup && !candidate.runtimeOwned && (candidate.windowId ?? PRIMARY_WINDOW_ID) === source.id)?.pageId ?? null;
  if (source.splitPageId === pageId) source.splitPageId = null;
  if (activate || !destination.focusedPageId) { destination.focusedPageId = pageId; destination.splitPageId = null; }
  applyStage(source); applyStage(destination);
  if (activate) { destination.win.show(); destination.win.focus(); }
  return { windowId: destination.id, sourceWindowId: source.id, sourceActivePageId: source.focusedPageId, activePageId: destination.focusedPageId, moved: true };
}

export const tabController = new TabController({
  catalog: tabCatalog,
  ports: tabPorts,
  publish: patch => publishTabPatch(patch),
  placement: payload => broadcastToShells("tabs.placement", payload),
});
