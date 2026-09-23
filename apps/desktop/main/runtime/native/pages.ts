import { RpcChannel, TabCommandEnvelopeSchema, type TabPatchOp } from "@aux/contracts";
import { shell } from "electron";
import { PRIMARY_WINDOW_ID } from "../../app/bootstrap.js";
import { isWebUrl } from "../../app/external-urls.js";
import { offscreen, pageFinder, registry, siteZoom } from "../../app/services.js";
import { createPageView, destroyPageView } from "../../native-views.js";
import { printPage } from "../../page-output.js";
import { setPageZoom } from "../../page-zoom.js";
import { newTabRecord } from "../../tabs/catalog.js";
import { forgetPageLifecycle, scheduleIdleFreeze, wakePage } from "../../tabs/lifecycle-controller.js";
import { rememberClosedHistory } from "../../tabs/materialize.js";
import { movePageToWindow, tabController } from "../../tabs/ports.js";
import { flushTabPatches, publishTabPatch } from "../../tabs/publish.js";
import { tabCatalog } from "../../tabs/store.js";
import { viewHooks } from "../../views/hooks.js";
import { createRegularWindow } from "../../windows/create.js";
import { broadcastToShells, pageWindowOwners, regularWindows, stateForEntry } from "../../windows/registry.js";
import { applyStage, forgetPlacement } from "../../windows/stage.js";
import { notifyRuntime } from "../supervisor.js";

export function registerPageMethods(ch: RpcChannel) {
  ch.onMethod("native.listPages", () => ({
    pages: registry.all()
      .filter(entry => !entry.view.webContents.isDestroyed())
      .map(entry => ({
        pageId: entry.pageId,
        windowId: entry.windowId ?? PRIMARY_WINDOW_ID,
        marker: entry.marker,
        showBlankDocument: entry.showBlankDocument,
        url: entry.view.webContents.getURL() || "about:blank",
        title: entry.view.webContents.getTitle(),
        active: entry.popup ? entry.popup.isFocused() : entry.pageId === stateForEntry(entry)?.focusedPageId,
      })),
  }));
  ch.onMethod("native.createPage", async (p) => {
    const { pageId, windowId, marker, url, background,ownedByRuntime } = p as {
      pageId: string;
      windowId?: string;
      marker: string;
      url: string;
      background: boolean;
      ownedByRuntime?:boolean;
    };
    const requestedWindowId = windowId ?? PRIMARY_WINDOW_ID;
    const state = regularWindows.get(requestedWindowId) ?? await createRegularWindow(requestedWindowId);
    // The runtime may retry createPage after a dropped reply — one pageId must
    // never produce two live views.
    if (!registry.get(pageId)) {
      createPageView({ win: state.win, registry, pageId, windowId: state.id, marker, url, background,ownedByRuntime, hooks: viewHooks });
      pageWindowOwners.set(pageId, state.id);
      applyStage(state);
      const priorOrder = tabCatalog.window(state.id)?.order ?? [];
      // A re-materialized tab keeps its strip position — only genuinely new
      // pages append.
      const order = priorOrder.includes(pageId) ? priorOrder : [...priorOrder, pageId];
      publishTabPatch(tabCatalog.apply([
        { op: "upsert", tab: newTabRecord({ pageId, windowId: state.id, url, runtimeOwned: ownedByRuntime === true }), origin: "runtime" },
        ...(!background ? [{ op: "window", window: { windowId: state.id, order, activePageId: pageId } } satisfies TabPatchOp] : []),
      ]));
    }
    const wc = registry.get(pageId)?.view.webContents;
    if (wc) notifyRuntime("view.navState", { pageId, canGoBack: wc.navigationHistory.canGoBack(), canGoForward: wc.navigationHistory.canGoForward() });
    return { ok: true };
  });
  ch.onMethod("native.movePage", async (raw) => {
    const { pageId, windowId, activate = true } = raw as { pageId: string; windowId?: string; activate?: boolean };
    const moved = await movePageToWindow(pageId, windowId, activate);
    if (moved.moved) {
      const source = regularWindows.get(moved.sourceWindowId);
      const destination = regularWindows.get(moved.windowId);
      const movedTab = tabCatalog.tab(pageId);
      publishTabPatch(tabCatalog.apply([
        ...(movedTab ? [{ op: "upsert", tab: { ...movedTab, windowId: moved.windowId }, origin: "runtime" } satisfies TabPatchOp] : []),
        { op: "window", window: { windowId: moved.sourceWindowId, order: (source ? tabCatalog.window(source.id)?.order ?? [] : []).filter(id => id !== pageId), activePageId: moved.sourceActivePageId } },
        { op: "window", window: { windowId: moved.windowId, order: [...(destination ? tabCatalog.window(destination.id)?.order ?? [] : []).filter(id => id !== pageId), pageId], activePageId: moved.activePageId } },
      ]));
    }
    return { windowId: moved.windowId, sourceActivePageId: moved.sourceActivePageId, activePageId: moved.activePageId };
  });
  ch.onMethod("native.tabCommand", async raw => {
    const parsed = TabCommandEnvelopeSchema.safeParse(raw);
    if (!parsed.success) throw new Error("invalid tab command envelope");
    const env = parsed.data;
    // The runtime scopes its command to the window it names; an open into a
    // window that does not exist yet creates it, matching native.createPage.
    if (!regularWindows.has(env.windowId)) {
      if (env.command.kind !== "open") throw new Error("That window is not available.");
      await createRegularWindow(env.windowId);
    }
    const ack = await tabController.execute(env, env.windowId, { trusted: true });
    flushTabPatches();
    const wc = env.command.kind === "open" && ack.status === "applied" && ack.pageId ? registry.get(ack.pageId)?.view.webContents : undefined;
    const info = await wc?.debugger.sendCommand("Target.getTargetInfo").catch(() => undefined) as { targetInfo?: { targetId?: string } } | undefined;
    return info?.targetInfo?.targetId ? { ...ack, targetId: info.targetInfo.targetId } : ack;
  });
  ch.onMethod("native.closePage", async (p) => {
    const { pageId } = p as { pageId: string };
    const entry = registry.get(pageId);
    const state = stateForEntry(entry);
    if (entry && state) {
      rememberClosedHistory(entry);
      if (!await destroyPageView(entry, state.win)) return { ok: false };
      if (registry.get(pageId) === entry) registry.remove(pageId);
    }
    // a closed page can't stay focused, split, or hold the stage lease —
    // stale pointers would leave every other view hidden
    if (state?.focusedPageId === pageId) state.focusedPageId = null;
    if (state?.splitPageId === pageId) state.splitPageId = null;
    if (state?.previewWatch?.pageId === pageId) {
      state.previewWatch.stop();
      state.previewWatch = null;
    }
    offscreen.forget(pageId);
    forgetPageLifecycle(pageId);
    // destroyPageView already ran the catalog remove through onDestroyed —
    // the remaining case is a record with no live view left to destroy.
    if (tabCatalog.tab(pageId)) publishTabPatch(tabCatalog.apply([{ op: "remove", pageId }]));
    if (state) applyStage(state);
    return { ok: true };
  });
  ch.onMethod("native.showPage", (p) => {
    const { pageId, bounds } = p as { pageId: string; bounds: { x: number; y: number; width: number; height: number } | null };
    const entry = registry.get(pageId);
    const state = stateForEntry(entry);
    if (!entry || !state) return { ok: false };
    wakePage(entry);
    if (entry.popup) return { ok: true };
    if (bounds) {
      entry.visibleBounds = bounds;
      state.stageBounds = bounds;
      applyStage(state);
    }
    return { ok: true };
  });
  ch.onMethod("native.hidePage", (p) => {
    const { pageId } = p as { pageId: string };
    const entry = registry.get(pageId);
    if (entry && !entry.popup && !offscreen.holds(pageId)){entry.view.setVisible(false);forgetPlacement(entry);scheduleIdleFreeze(entry);}
    return { ok: true };
  });
  ch.onMethod("native.recoverPage", async (p) => {
    const { pageId, url } = p as { pageId: string; url: string };
    const entry=registry.get(pageId);await wakePage(entry);const wc = entry?.view.webContents;
    if (!wc || wc.isDestroyed()) return { ok: false };
    await wc.loadURL(url);
    return { ok: true };
  });
  ch.onMethod("native.stopPage", (p) => {
    const { pageId } = p as { pageId: string };
    const entry=registry.get(pageId);void wakePage(entry);const wc = entry?.view.webContents;
    if (!wc) return { ok: false };
    wc.stop();
    return { ok: true };
  });
  ch.onMethod("native.focusPage", (p) => {
    const { pageId } = p as { pageId: string };
    const entry = registry.get(pageId);
    const state = stateForEntry(entry);
    if (!entry || !state) return { ok: false };
    wakePage(entry);
    if (entry.popup) { entry.popup.show(); entry.popup.focus(); return { ok: true }; }
    state.focusedPageId = pageId;
    state.win.contentView.addChildView(entry.view); // re-add → top of z-order
    forgetPlacement(entry);
    applyStage(state);
    state.win.show();
    state.win.focus();
    entry.view.webContents.focus();
    const tab = tabCatalog.tab(pageId);
    if (tab) {
      publishTabPatch(tabCatalog.apply([
        { op: "upsert", tab: { ...tab, lastActiveAt: Date.now() }, origin: "runtime" },
        { op: "window", window: { windowId: state.id, order: tabCatalog.window(state.id)?.order ?? [pageId], activePageId: pageId } },
      ]));
    }
    const wc = entry.view.webContents;
    notifyRuntime("view.navState", { pageId, canGoBack: wc.navigationHistory.canGoBack(), canGoForward: wc.navigationHistory.canGoForward() });
    return { ok: true };
  });
  // A program with pointer/keyboard steps is starting on this page: keep the
  // view laid out (offscreen if it is not the focused tab). Returns at once —
  // parallel programs on different pages never wait on each other.
  ch.onMethod("native.acquireStage", (p) => {
    const { pageId } = p as { pageId: string };
    const entry = registry.get(pageId);
    const state = stateForEntry(entry);
    if (!entry || !state) return { ok: false };
    offscreen.acquireStage(pageId);
    wakePage(entry);
    applyStage(state);
    return { ok: true };
  });
  ch.onMethod("native.releaseStage", (p) => {
    const { pageId } = p as { pageId: string };
    const state = stateForEntry(registry.get(pageId));
    // A preview still capturing this page keeps it laid out.
    if (offscreen.releaseStage(pageId) && state) applyStage(state);
    return { ok: true };
  });

  ch.onMethod("native.openExternal", (p) => {
    const { url } = p as { url: unknown };
    if (!isWebUrl(url)) return { ok: false, error: "only http(s) URLs can be opened externally" };
    void shell.openExternal(url);
    return { ok: true };
  });
  ch.onMethod("native.findInPage", async (p) => {
    const { pageId, text, forward, findNext } = p as { pageId: string; text: string; forward: boolean; findNext: boolean };
    const entry = registry.get(pageId);
    if (!entry) return { matches: 0 };
    const bounds = entry.popup ? entry.popup.getContentBounds() : entry.view.getBounds();
    const visible = (entry.popup ? entry.popup.isVisible() : entry.view.getVisible()) && bounds.width > 0 && bounds.height > 0;
    return pageFinder.find(entry.view.webContents, text, { forward, findNext, visible });
  });
  ch.onMethod("native.stopFind", (p) => {
    const { pageId, action } = p as { pageId: string; action: "clear" | "keep" };
    const entry = registry.get(pageId);
    if (entry) pageFinder.stop(entry.view.webContents, action);
    return { ok: true };
  });
  ch.onMethod("native.setZoom", (p) => {
    const { pageId, level, delta, reset, direction } = p as { pageId: string; level?: number; delta?: number; reset?: boolean; direction?: "in" | "out" };
    const entry = registry.get(pageId);
    if (!entry) throw new Error("This tab is no longer available.");
    const result = setPageZoom(entry.view.webContents, { level, delta, reset, direction });
    if (level !== undefined || delta !== undefined || reset || direction) {
      try { siteZoom.remember(entry.view.webContents.getURL(), result.level); broadcastToShells("site-zoom-changed", {}); }
      catch { throw new Error("Page size changed, but Aux could not save this site’s zoom preference."); }
    }
    return result;
  });
  ch.onMethod("native.print", async (p) => {
    const { pageId } = p as { pageId: string };
    const entry = registry.get(pageId);
    if (!entry) throw new Error("This tab is no longer available.");
    return { ok: await printPage(entry.view.webContents, entry.showBlankDocument) };
  });
}
