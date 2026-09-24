import { PRIMARY_WINDOW_ID } from "../app/bootstrap.js";
import { TabSpaceMigrationSchema, type BrowserSpace } from "@aux/contracts";
import { registry, siteZoom } from "../app/services.js";
import { translator } from "../features/translate.js";
import { showNavigationMenu } from "../navigation-menu.js";
import { printPage, savePagePdf } from "../page-output.js";
import { readArticle } from "../read-article.js";
import { tabController } from "../tabs/ports.js";
import { flushTabPatches, noteTab, publishTabPatch } from "../tabs/publish.js";
import { runtimeInvoke } from "../runtime/supervisor.js";
import { tabCatalog } from "../tabs/store.js";
import { viewHooks } from "../views/hooks.js";
import { broadcastToShells, handleShell, requireOwnedEntry } from "../windows/registry.js";

export function wireTabsIpc() {
  const bindingVersions = new Map<string, number>();
  handleShell("ui.bindTabSpace", async (state, pageId: unknown, spaceId: unknown) => {
    if (typeof pageId !== "string" || typeof spaceId !== "string") throw new Error("Choose a tab and Space.");
    const tab = tabCatalog.tab(pageId);
    if (!tab || tab.windowId !== state.id || tab.popup || tab.runtimeOwned) throw new Error("That tab is unavailable for Space memory.");
    const version = (bindingVersions.get(pageId) ?? 0) + 1;
    bindingVersions.set(pageId, version);
    const spaces = await runtimeInvoke("spaces.list", {}) as BrowserSpace[];
    const space = spaces.find(item => item.id === spaceId && !item.archived && !!item.workspaceId);
    const current = tabCatalog.tab(pageId);
    if (!space || !current || current.windowId !== state.id || current.generation !== tab.generation || bindingVersions.get(pageId) !== version)
      throw new Error("The tab or Space changed. Select it again.");
    noteTab(pageId, { spaceId: space.id, workspaceId: space.workspaceId });
    flushTabPatches();
    return { spaceId: space.id, workspaceId: space.workspaceId };
  });
  handleShell("ui.migrateTabSpaces", async (state, raw: unknown) => {
    const requested = TabSpaceMigrationSchema.parse(raw);
    if (!requested.length) return { migrated: 0 };
    const spaces = await runtimeInvoke("spaces.list", {}) as BrowserSpace[];
    const allowed = new Map(spaces.filter(space => !space.archived && !!space.workspaceId).map(space => [space.id, space]));
    const seen = new Set<string>();
    const ops = requested.flatMap(({ pageId, spaceId }) => {
      if (seen.has(pageId)) return [];
      seen.add(pageId);
      const tab = tabCatalog.tab(pageId), space = allowed.get(spaceId);
      if (!tab || tab.windowId !== state.id || tab.popup || tab.runtimeOwned || tab.spaceId || !space?.workspaceId) return [];
      return [{ op: "upsert" as const, tab: { ...tab, spaceId: space.id, workspaceId: space.workspaceId } }];
    });
    if (ops.length) { publishTabPatch(tabCatalog.apply(ops)); flushTabPatches(); }
    return { migrated: ops.length };
  });
  handleShell('ui.tabAudio', state => Object.fromEntries(registry.all().filter(entry=>(entry.windowId??PRIMARY_WINDOW_ID)===state.id&&!entry.view.webContents.isDestroyed()).map(entry=>[entry.pageId,{muted:entry.view.webContents.isAudioMuted(),audible:entry.view.webContents.isCurrentlyAudible()}])));

  // Typed human tab commands (§7.2) — actuated in main; no runtime round trip.
  handleShell("ui.tabCommand", async (state, envelope: unknown) => {
    const ack = await tabController.execute(envelope, state.id);
    flushTabPatches();
    return ack;
  });
  handleShell("ui.tabsSnapshot", () => {
    flushTabPatches();
    return tabCatalog.snapshot();
  });
  handleShell("ui.tabsSince", (_, version: unknown) => {
    flushTabPatches();
    return tabCatalog.since(typeof version === "number" ? version : -1);
  });
  handleShell('ui.setTabMuted', (state, pageId:unknown,muted:unknown) => {
    const entry=requireOwnedEntry(state,pageId,'This tab is not available for audio control.');
    if(typeof muted!=='boolean')throw new Error('This tab is not available for audio control.');
    entry.view.webContents.setAudioMuted(muted);
    viewHooks.onAudio(entry.pageId,{muted:entry.view.webContents.isAudioMuted(),audible:entry.view.webContents.isCurrentlyAudible()});
  });

  handleShell("ui.savePagePdf", async (state, pageId: unknown) => {
    if (typeof pageId !== "string") throw new Error("Select a browser page to export.");
    const entry=requireOwnedEntry(state,pageId);
    return savePagePdf(entry.view.webContents, state.win, false, entry.showBlankDocument);
  });
  handleShell("ui.print", (state, pageId: string) => {const entry=requireOwnedEntry(state,pageId);return printPage(entry.view.webContents,entry.showBlankDocument);});
  handleShell("ui.devTools", (state, pageId: string) => {
    requireOwnedEntry(state, pageId).view.webContents.openDevTools({ mode: "detach" });
    return true;
  });
  handleShell("ui.navigationMenu", (state,pageId:string,direction:unknown) =>{
    const entry=requireOwnedEntry(state,pageId);
    if(direction!=="back"&&direction!=="forward")throw new Error("Choose a history direction.");
    return showNavigationMenu(entry.view.webContents,direction);
  });
  handleShell("ui.hardReload", (state, pageId: string) => {
    requireOwnedEntry(state, pageId).view.webContents.reloadIgnoringCache();
    return true;
  });

  handleShell("ui.translatePage", async (state, pageId: unknown) => {
    requireOwnedEntry(state, pageId);
    return translator.page(String(pageId));
  });
  handleShell("ui.showOriginal", async (state, pageId: unknown) => {
    requireOwnedEntry(state, pageId);
    return translator.showOriginal(String(pageId));
  });
  handleShell("ui.readArticle", async (state, pageId: unknown) => {
    const entry = typeof pageId === "string" ? requireOwnedEntry(state, pageId) : undefined;
    if (!entry) throw new Error("Open a webpage to use Reader view.");
    return readArticle(entry.view.webContents, () => registry.get(entry.pageId) === entry);
  });
  handleShell("app.siteZoom", (_, origin?: unknown) => {
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
