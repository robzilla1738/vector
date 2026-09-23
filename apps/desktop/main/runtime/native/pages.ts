import { RpcChannel, type TabPatchOp } from "@aux/contracts";
import { PRIMARY_WINDOW_ID } from "../../app/bootstrap.js";
import { offscreen, pageFinder, registry, siteZoom } from "../../app/services.js";
import { setPageZoom } from "../../page-zoom.js";
import { wakePage } from "../../tabs/lifecycle-controller.js";
import { movePageToWindow, tabController } from "../../tabs/ports.js";
import { flushTabPatches, publishTabPatch } from "../../tabs/publish.js";
import { tabCatalog } from "../../tabs/store.js";
import { createRegularWindow } from "../../windows/create.js";
import { broadcastToShells, regularWindows, stateForEntry } from "../../windows/registry.js";
import { applyStage, forgetPlacement } from "../../windows/stage.js";
import { notifyRuntime } from "../supervisor.js";
import { onNative } from "./validate.js";

export function registerPageMethods(ch: RpcChannel) {
  onNative(ch, "native.listPages", () => ({
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
  onNative(ch, "native.movePage", async ({ pageId, windowId, activate = true }) => {
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
  onNative(ch, "native.tabCommand", async env => {
    // The runtime scopes its command to the window it names; an open into a
    // window that does not exist yet creates it.
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
  onNative(ch, "native.recoverPage", async ({ pageId, url }) => {
    const entry=registry.get(pageId);await wakePage(entry);const wc = entry?.view.webContents;
    if (!wc || wc.isDestroyed()) return { ok: false };
    await wc.loadURL(url);
    return { ok: true };
  });
  onNative(ch, "native.stopPage", ({ pageId }) => {
    const entry=registry.get(pageId);void wakePage(entry);const wc = entry?.view.webContents;
    if (!wc) return { ok: false };
    wc.stop();
    return { ok: true };
  });
  onNative(ch, "native.focusPage", ({ pageId }) => {
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
  onNative(ch, "native.acquireStage", ({ pageId }) => {
    const entry = registry.get(pageId);
    const state = stateForEntry(entry);
    if (!entry || !state) return { ok: false };
    offscreen.acquireStage(pageId);
    wakePage(entry);
    applyStage(state);
    return { ok: true };
  });
  onNative(ch, "native.releaseStage", ({ pageId }) => {
    const state = stateForEntry(registry.get(pageId));
    // A preview still capturing this page keeps it laid out.
    if (offscreen.releaseStage(pageId) && state) applyStage(state);
    return { ok: true };
  });

  onNative(ch, "native.findInPage", async ({ pageId, text, forward, findNext }) => {
    const entry = registry.get(pageId);
    if (!entry) return { matches: 0 };
    const bounds = entry.popup ? entry.popup.getContentBounds() : entry.view.getBounds();
    const visible = (entry.popup ? entry.popup.isVisible() : entry.view.getVisible()) && bounds.width > 0 && bounds.height > 0;
    return pageFinder.find(entry.view.webContents, text, { forward, findNext, visible });
  });
  onNative(ch, "native.stopFind", ({ pageId, action }) => {
    const entry = registry.get(pageId);
    if (entry) pageFinder.stop(entry.view.webContents, action);
    return { ok: true };
  });
  onNative(ch, "native.setZoom", ({ pageId, level, delta, reset, direction }) => {
    const entry = registry.get(pageId);
    if (!entry) throw new Error("This tab is no longer available.");
    const result = setPageZoom(entry.view.webContents, { level, delta, reset, direction });
    if (level !== undefined || delta !== undefined || reset || direction) {
      try { siteZoom.remember(entry.view.webContents.getURL(), result.level); broadcastToShells("site-zoom-changed", {}); }
      catch { throw new Error("Page size changed, but Aux could not save this site’s zoom preference."); }
    }
    return result;
  });
}
