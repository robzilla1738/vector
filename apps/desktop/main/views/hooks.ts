import { type TabPatchOp, originOfAddress } from "@aux/contracts";
import { dialog } from "electron";
import { randomUUID } from "node:crypto";
import { PRIMARY_WINDOW_ID, log } from "../app/bootstrap.js";
import { closingRegularWindows, exitApproved } from "../app/exit.js";
import { isWebUrl } from "../app/external-urls.js";
import { browserHealth, offscreen, registry, siteZoom } from "../app/services.js";
import { offerExternalLink } from "../external-links.js";
import { runAutofill } from "../features/autofill.js";
import { translator } from "../features/translate.js";
import { noteCredentialOffer, pendingVaultSaves, runVaultFill } from "../features/vault.js";
import { createPageView, markDocument } from "../native-views.js";
import { exitPageFullscreen, wirePageFullscreen } from "../page-fullscreen.js";
import { cssCursor } from "../page-pointer.js";
import { httpsFirst, privacy, trackersAllowed } from "../privacy/state.js";
import { channel, notifyRuntime, runtimeInvoke } from "../runtime/supervisor.js";
import { newTabRecord } from "../tabs/catalog.js";
import { discarding, forgetPageLifecycle, scheduleIdleFreeze, wakePage } from "../tabs/lifecycle-controller.js";
import { tabPorts } from "../tabs/ports.js";
import { controllerClosing, noteTab, publishTabPatch } from "../tabs/publish.js";
import { tabCatalog } from "../tabs/store.js";
import type { ViewEntry } from "../target-registry.js";
import { pageWindowOwners, shellForPage, stateForEntry, stateForWindowId } from "../windows/registry.js";
import { applyStage, forgetPlacement, updateWindowTitle } from "../windows/stage.js";

export function unloadPrompt(entry: ViewEntry): Electron.MessageBoxSyncOptions {
  let site = "this page";
  try { const origin = new URL(entry.view.webContents.getURL()).origin; if (origin !== "null") site = origin; } catch { /* no page-supplied message */ }
  return {
    type: "warning", title: "Leave website?", message: `Leave ${site}?`,
    detail: "Changes you made may not be saved.", buttons: ["Stay", "Leave"],
    defaultId: 0, cancelId: 0, noLink: true,
  };
}

export const viewHooks = {
  onExternalLink: (entry: ViewEntry, url: string) => {
    const state=stateForEntry(entry);
    // Hidden task pages cannot open applications over the user's current work.
    if(entry.runtimeOwned || (!entry.popup && state?.stagePageId!==entry.pageId))return offerExternalLink(entry.view.webContents,undefined,url);
    return offerExternalLink(entry.view.webContents,entry.popup??state?.win,url);
  },
  onFullscreenReady: (entry: ViewEntry) => {
    if(entry.popup)return;
    wirePageFullscreen(entry.view.webContents,()=>{
      const state=stateForEntry(entry);
      return state?{window:state.win,canEnter:()=>!state.overlayOpen&&state.stagePageId===entry.pageId&&!entry.runtimeOwned,changed:()=>applyStage(state)}:undefined;
    });
  },
  onBrowserShortcut: (entry: ViewEntry) => {const state=stateForEntry(entry);if(state&&!entry.popup)exitPageFullscreen(state.win);},
  onNavigated: (pageId: string, url: string) => {
    const entry = registry.get(pageId);
    if (entry) siteZoom.apply(entry.view.webContents, url);
    noteTab(pageId, { url, navigationError: undefined, crashed: false });
    translator.forget(pageId);
    notifyRuntime("view.navigated", { pageId, url });
  },
  onTitle: (pageId: string, title: string) => {
    noteTab(pageId, { title });
    notifyRuntime("view.titleChanged", { pageId, title });
    const state = stateForEntry(registry.get(pageId));
    if (state?.focusedPageId === pageId) updateWindowTitle(state, title);
  },
  onFavicon: (pageId: string, favicon: string) => {
    noteTab(pageId, { favicon });
    notifyRuntime("view.faviconChanged", { pageId, favicon });
  },
  confirmUnload: (entry: ViewEntry) => {
    if (exitApproved || stateForEntry(entry)?.closeApproved) return true;
    const owner = entry.popup ?? stateForEntry(entry)?.win;
    return (owner ? dialog.showMessageBoxSync(owner, unloadPrompt(entry)) : 0) === 1;
  },
  confirmUnloadAsync: async (entry: ViewEntry) => {
    if (exitApproved || stateForEntry(entry)?.closeApproved) return true;
    const owner = entry.popup ?? stateForEntry(entry)?.win;
    if (!owner) return false;
    return (await dialog.showMessageBox(owner, unloadPrompt(entry))).response === 1;
  },
  onAudio: (pageId:string,state:{muted:boolean;audible:boolean})=>{noteTab(pageId,{muted:state.muted,audible:state.audible});shellForPage(pageId)?.webContents.send('view.audio',{pageId,...state});},
  onCursor: (pageId: string, cursor: string) => {
    const state = stateForEntry(registry.get(pageId));
    if (!state?.toolbarOverlay || state.shellView.webContents.isDestroyed()) return;
    state.shellView.webContents.send("page-cursor", cssCursor(cursor));
  },
  onLoading: (pageId: string, loading: boolean) => {
    const entry=registry.get(pageId);if(loading)void wakePage(entry);else if(entry){const state=stateForEntry(entry);if(state&&state.focusedPageId!==pageId&&state.splitPageId!==pageId&&!offscreen.holds(pageId))scheduleIdleFreeze(entry);}
    noteTab(pageId, { loading });
    shellForPage(pageId)?.webContents.send("view.loading", { pageId, loading });
    notifyRuntime("view.loading", { pageId, loading });
  },
  onNavState: (pageId: string, canGoBack: boolean, canGoForward: boolean) => {
    noteTab(pageId, { canGoBack, canGoForward });
    notifyRuntime("view.navState", { pageId, canGoBack, canGoForward });
  },
  onNavigationError: (pageId: string, error: { url: string; code: number; message: string } | null) => {
    const record = error ? { ...error, upgradedFrom: httpsFirst.httpFallback(error.url, error.code) } : null;
    noteTab(pageId, { navigationError: record ?? undefined, ...(error ? { loading: false } : {}) });
    notifyRuntime("view.navigationError", { pageId, error: record });
  },
  onCrashed: (pageId: string) => { noteTab(pageId, { crashed: true, loading: false }); browserHealth.notePageCrash(); notifyRuntime("view.crashed", { pageId }); },
  onUnresponsive:()=>browserHealth.notePageUnresponsive(),
  onDestroyed: (pageId: string, wc: Electron.WebContents) => { const owner=shellForPage(pageId);const ownerState=stateForWindowId(pageWindowOwners.get(pageId));
    // A stale destroy from a superseded instance must not touch the current
    // view's bookkeeping — the pageId already has a fresh view registered.
    const registered = registry.get(pageId);
    // Electron hands out a fresh webContents wrapper per access, so === is
    // meaningless — compare the stable wc id through byWcId instead. A stale
    // destroy from a superseded view no longer owns a byWcId slot and must not
    // touch the fresh entry's bookkeeping.
    if (registered && registry.byWebContentsId(wc.id) !== registered) return;
    forgetPageLifecycle(pageId); registry.remove(pageId); pageWindowOwners.delete(pageId);
    for (const [key, pending] of pendingVaultSaves) if (pending.pageId === pageId) { clearTimeout(pending.timer); pendingVaultSaves.delete(key); }
    // view.removed must land before the catalog remove: the catalog path skips
    // the runtime's successor pick by contract, and deleting the live page
    // there first would leave a removed stage page with no restore.
    notifyRuntime("view.removed", { pageId, discarded: discarding.has(pageId) });
    // A discarded tab keeps its record — it reloads lazily on activation.
    // Teardown destroys (window close, app quit) are not tab closes either —
    // the record stays so the session restores the tab on next launch.
    const teardown = exitApproved || ownerState?.closeApproved === true || closingRegularWindows.has(ownerState?.id ?? "");
    if (discarding.has(pageId) && tabCatalog.tab(pageId)) noteTab(pageId, { lifecycle: "discarded" });
    else if (!teardown && !controllerClosing.has(pageId) && tabCatalog.tab(pageId)) publishTabPatch(tabCatalog.apply([{ op: "remove", pageId }]));
    owner?.webContents.send('view.audio',{pageId,muted:false,audible:false,removed:true}); },
  onPopup: (entry: ViewEntry, activate = false) => {
    registry.add(entry);
    pageWindowOwners.set(entry.pageId, entry.windowId ?? PRIMARY_WINDOW_ID);
    const state = stateForEntry(entry);
    if (!entry.popup && state) { state.win.contentView.addChildView(entry.view); forgetPlacement(entry); applyStage(state); }
    const windowId = entry.windowId ?? PRIMARY_WINDOW_ID;
    const url = entry.view.webContents.getURL() || "about:blank";
    publishTabPatch(tabCatalog.apply([
      { op: "upsert", tab: newTabRecord({ pageId: entry.pageId, windowId, url, title: entry.view.webContents.getTitle(), popup: !!entry.popup }), origin: "external" },
      ...(activate ? [{ op: "window", window: { windowId, order: tabCatalog.window(windowId)?.order.filter(id => id !== entry.pageId).concat(entry.pageId) ?? [entry.pageId], activePageId: entry.pageId } } satisfies TabPatchOp] : []),
    ]));
    notifyRuntime("view.popup", { showBlankDocument: entry.showBlankDocument, pageId: entry.pageId, windowId, marker: entry.marker, url, title: entry.view.webContents.getTitle(), activate });
  },
  onTakeover: (pageId: string) => {
    // acquireStage is held for the whole program, including when the human is
    // watching the same tab. Playwright clicks land as mouseDown/keyDown and
    // must not steal the page. A real click after the program still takeovers.
    if (offscreen.holds(pageId)) return;
    notifyRuntime("view.takeover", { pageId });
  },
  onNavGesture: (pageId: string, direction: "back" | "forward") => {
    const entry = registry.get(pageId);
    if (!entry || entry.view.webContents.isDestroyed()) return;
    // A swipe/overscroll that becomes navigation is a deliberate drive —
    // it takes the page back from an idle agent the way a real click does.
    if (entry.runtimeOwned) viewHooks.onTakeover(pageId);
    if (direction === "back") tabPorts.back(pageId); else tabPorts.forward(pageId);
  },
  onAutofill: (frame: Electron.WebFrameMain) => { void runAutofill(frame); },
  onCredentials: async (frame: Electron.WebFrameMain) => {
    if (!channel) return [];
    const origin = originOfAddress(frame.url);
    if (!origin) return [];
    try {
      return await runtimeInvoke("vault.itemsForOrigin", { origin }) as { itemId: string; label: string; username?: string }[];
    } catch { return []; }
  },
  onCredentialOffer: (pageId: string, offer: { username: string; origin: string }) => { void noteCredentialOffer(pageId, offer); },
  cosmeticFiltered: (hostname: string) => privacy.trackerBlock && !trackersAllowed(hostname),
  onTranslatePage: (pageId: string) => {
    void translator.page(pageId).catch(error => translator.failed(pageId, error));
  },
  onTranslateSelection: (pageId: string, text: string, x: number, y: number) => {
    void translator.selection(pageId, text, x, y).catch(error => translator.failed(pageId, error));
  },
  onVaultFill: (pageId: string, frame: Electron.WebFrameMain, itemId: string) => { void runVaultFill(pageId, frame, itemId); },
  openAsTab: (url: string, options?: { windowId?: string; background?: boolean; referrer?: Electron.Referrer }) => {
    if (!isWebUrl(url)) return;
    setImmediate(() => {
      const state = stateForWindowId(options?.windowId);
      if (!state) return;
      const pageId = `pop_${randomUUID()}`;
      const marker = `atab-${pageId}`;
      const entry = createPageView({
        win: state.win,
        registry,
        pageId,
        windowId: state.id,
        marker,
        url,
        background: options?.background === true,
        referrer: options?.referrer,
        hooks: viewHooks,
      });
      pageWindowOwners.set(pageId, state.id);
      applyStage(state);
      const activate = options?.background !== true;
      publishTabPatch(tabCatalog.apply([
        { op: "upsert", tab: newTabRecord({ pageId, windowId: state.id, url }), origin: "external" },
        ...(activate ? [{ op: "window", window: { windowId: state.id, order: tabCatalog.window(state.id)?.order.filter(id => id !== pageId).concat(pageId) ?? [pageId], activePageId: pageId } } satisfies TabPatchOp] : []),
      ]));
      // The marker is installed with the view; announce once a document carries it.
      let announced = false;
      const announce = (ready: boolean) => {
        if (!ready || announced || entry.view.webContents.isDestroyed()) return;
        announced = true;
        notifyRuntime("view.popup", {
          pageId,
          windowId: entry.windowId,
          marker,
          url: entry.view.webContents.getURL() || url,
          title: entry.view.webContents.getTitle(),
          activate: options?.background !== true,
        });
      };
      void markDocument(entry.view.webContents, marker).then(announce);
      entry.view.webContents.once("dom-ready", () => void markDocument(entry.view.webContents, marker).then(ready => {
        if (!ready && !announced) log("tab marker unavailable", new URL(url).origin);
        announce(ready);
      }));
      if (options?.background !== true) entry.view.webContents.focus();
    });
  },
  sendShortcut: (s: { key: string; meta: boolean; shift: boolean; alt: boolean; ctrl?: boolean }, pageId: string) =>
    shellForPage(pageId)?.webContents.send("shortcut", s),
  onPageAction: (action: import("@aux/contracts").PageQuickAction) => {
    const shell = shellForPage(action.pageId);
    if (!shell || shell.webContents.isDestroyed()) return;
    shell.webContents.send("page.quickAction", action);
    shell.webContents.focus();
  },
};
