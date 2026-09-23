import { ipcMain } from "electron";
import { PRIMARY_WINDOW_ID } from "../app/bootstrap.js";
import { registry, siteZoom } from "../app/services.js";
import { runPageTranslate, runShowOriginal } from "../features/translate.js";
import { showNavigationMenu } from "../navigation-menu.js";
import { printPage, savePagePdf } from "../page-output.js";
import { readArticle } from "../read-article.js";
import { tabController } from "../tabs/ports.js";
import { flushTabPatches } from "../tabs/publish.js";
import { tabCatalog } from "../tabs/store.js";
import { viewHooks } from "../views/hooks.js";
import { broadcastToShells, requireOwnedEntry, requireShellUi } from "../windows/registry.js";

export function wireTabsIpc() {
  ipcMain.handle('ui.tabAudio',event=>{const state=requireShellUi(event);return Object.fromEntries(registry.all().filter(entry=>(entry.windowId??PRIMARY_WINDOW_ID)===state.id&&!entry.view.webContents.isDestroyed()).map(entry=>[entry.pageId,{muted:entry.view.webContents.isAudioMuted(),audible:entry.view.webContents.isCurrentlyAudible()}]));});

  // Typed human tab commands (§7.2) — actuated in main; no runtime round trip.
  ipcMain.handle("ui.tabCommand", async (event, envelope: unknown) => {
    const state = requireShellUi(event);
    const ack = await tabController.execute(envelope, state.id);
    flushTabPatches();
    return ack;
  });
  ipcMain.handle("ui.tabsSnapshot", event => {
    requireShellUi(event);
    flushTabPatches();
    return tabCatalog.snapshot();
  });
  ipcMain.handle("ui.tabsSince", (event, version: unknown) => {
    requireShellUi(event);
    flushTabPatches();
    return tabCatalog.since(typeof version === "number" ? version : -1);
  });
  ipcMain.handle('ui.setTabMuted',(event,pageId:unknown,muted:unknown)=>{
    const state=requireShellUi(event);const entry=requireOwnedEntry(state,pageId,'This tab is not available for audio control.');
    if(typeof muted!=='boolean')throw new Error('This tab is not available for audio control.');
    entry.view.webContents.setAudioMuted(muted);
    viewHooks.onAudio(entry.pageId,{muted:entry.view.webContents.isAudioMuted(),audible:entry.view.webContents.isCurrentlyAudible()});
  });

  ipcMain.handle("ui.savePagePdf", async (event, pageId: unknown) => {
    const state = requireShellUi(event);
    if (typeof pageId !== "string") throw new Error("Select a browser page to export.");
    const entry=requireOwnedEntry(state,pageId);
    return savePagePdf(entry.view.webContents, state.win, false, entry.showBlankDocument);
  });
  ipcMain.handle("ui.print", (event, pageId: string) => {const entry=requireOwnedEntry(requireShellUi(event),pageId);return printPage(entry.view.webContents,entry.showBlankDocument);});
  ipcMain.handle("ui.devTools", (event, pageId: string) => {
    requireOwnedEntry(requireShellUi(event), pageId).view.webContents.openDevTools({ mode: "detach" });
    return true;
  });
  ipcMain.handle("ui.navigationMenu",(event,pageId:string,direction:unknown)=>{
    const entry=requireOwnedEntry(requireShellUi(event),pageId);
    if(direction!=="back"&&direction!=="forward")throw new Error("Choose a history direction.");
    return showNavigationMenu(entry.view.webContents,direction);
  });
  ipcMain.handle("ui.hardReload", (event, pageId: string) => {
    requireOwnedEntry(requireShellUi(event), pageId).view.webContents.reloadIgnoringCache();
    return true;
  });

  ipcMain.handle("ui.translatePage", async (event, pageId: unknown) => {
    const state = requireShellUi(event);
    requireOwnedEntry(state, pageId);
    return runPageTranslate(String(pageId));
  });
  ipcMain.handle("ui.showOriginal", async (event, pageId: unknown) => {
    const state = requireShellUi(event);
    requireOwnedEntry(state, pageId);
    return runShowOriginal(String(pageId));
  });
  ipcMain.handle("ui.readArticle", async (event, pageId: unknown) => {
    const state = requireShellUi(event);
    const entry = typeof pageId === "string" ? requireOwnedEntry(state, pageId) : undefined;
    if (!entry) throw new Error("Open a webpage to use Reader view.");
    return readArticle(entry.view.webContents, () => registry.get(entry.pageId) === entry);
  });
  ipcMain.handle("app.siteZoom", (event, origin?: unknown) => {
    requireShellUi(event);
    if (origin !== undefined) {
      if (typeof origin !== "string") throw new Error("Choose a saved website size.");
      siteZoom.reset(origin);
      for (const entry of registry.all()) {
        const contents = entry.view.webContents;
        if (contents.isDestroyed()) continue;
        try { if (new URL(contents.getURL()).origin === origin) siteZoom.apply(contents, origin); } catch {}
      }
      broadcastToShells("site-zoom-changed", {});
    }
    return siteZoom.list();
  });
}
