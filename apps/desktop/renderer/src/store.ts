import { create } from "zustand";
import type { Download, PageTarget, SavedProgram, TabCommand } from "@aux/contracts";
import { bridge } from "./bridge";
import { assignFolder, assignSpace, setActiveSpace, syncLayout, tabsInSpace, splitForPage } from "./workspace";
import { createBookmarksSlice } from "./store/bookmarks-slice";
import { createDraftsSlice } from "./store/drafts-slice";
import { eventEffects, reduceLibraryEvent, reducePageEvent, reduceRunEvent } from "./store/events";
import { createLayoutSlice } from "./store/layout-slice";
import { loadOrganizationLayout, persistLayout, reloadOrganizationLayout } from "./store/persistence";
import { createRunsSlice } from "./store/runs-slice";
import { call, lastEventSeq, noteEventSeq, patchPage, sendTabCommand } from "./store/shared";
import { createTabsSlice } from "./store/tabs-slice";
import type { Workspace } from "./store/types";
import { createUiSlice } from "./store/ui-slice";

export type { CommandSlot, Mode, Overlay, RailView, RunModelStats, SidebarMode } from "./store/types";
export { isLive, LIVE_RUN } from "./store/types";
export { flushLayout } from "./store/persistence";
export { call, decodeBase64Json, lastEventSeq, pagePreview, pageRevision } from "./store/shared";

/**
 * The shell's single store, composed from domain slices (./store). Runtime
 * events apply through per-domain reducers plus one effects pass.
 */
let organizationHydrated = false;
let lastRefreshError = "";
export const useStore = create<Workspace>((set, get, api) => ({
  ...createUiSlice(set, get, api),
  ...createDraftsSlice(set, get, api),
  ...createBookmarksSlice(set, get, api),
  ...createLayoutSlice(set, get, api),
  ...createTabsSlice(set, get, api),
  ...createRunsSlice(set, get, api),

  refresh: async () => {
    if (!bridge.privateMode && !bridge.quickAskMode && !organizationHydrated) {
      try {
        const layout = await loadOrganizationLayout();
        if (!organizationHydrated) { set({ layout }); organizationHydrated = true; }
      }
      catch (error) { errToast(error); set({ connected: false }); setTimeout(() => void get().refresh(), 1500); return; }
    }
    // The main-owned catalog converges independently of runtime health.
    void bridge.tabsSnapshot().then(snapshot => get().syncTabsSnapshot(snapshot)).catch(() => {});
    try {
      const ws = await call("workspace.get");
      const [bookmarks, settings, downloads, programs] = await Promise.all([
        call("bookmarks.list").catch(() => [] as { url: string; title: string }[]),
        call("settings.get").catch(() => ({}) as Record<string, unknown>),
        call("downloads.list").catch(() => [] as Download[]),
        call("programs.list").catch(() => [] as SavedProgram[]),
      ]);
      if (!bridge.privateMode && !bridge.quickAskMode) {
        const layout = get().layout;
        const legacySpaces = layout.spaces.filter(space => !space.workspaceId);
        const spaces = await call("spaces.import", { spaces: legacySpaces.map(space => ({
          id: space.id, name: space.name.slice(0, 100) || "Untitled", color: space.color ?? "slate", grain: space.grain,
        })) });
        get().syncBrowserSpaces(spaces);
      }
      // Events received while the supporting data loaded take precedence over this snapshot.
      if (lastEventSeq() > ws.lastSeq) { void get().refresh(); return; }
      const { lastSeq, ...snapshot } = ws;
      noteEventSeq(lastSeq);
      set((s) => {
        let restored = s.layout;
        for (const page of ws.pages) {
          const placement = ws.tabPlacements?.[page.pageId];
          if (!placement || restored.tabSpace[page.pageId]) continue;
          restored = assignSpace(restored, page.pageId, placement.spaceId);
          if (placement.folder && restored.spaces.some(space => space.id === placement.spaceId)) {
            if (!restored.folders.some(folder => folder.id === placement.folder!.id)) restored = { ...restored, folders: [...restored.folders, placement.folder] };
            restored = assignFolder(restored, page.pageId, placement.folder.id);
          }
          if (page.pageId === ws.activePageId) restored = setActiveSpace(restored, placement.spaceId);
        }
        const pendingRestoreIds=(ws.pendingRestoreTabs??[]).map(tab=>tab.pageId);
        const layout = ws.restoringTabs ? restored : syncLayout(restored, ws.pages, pendingRestoreIds);
        persistLayout(layout);
        // The catalog snapshot already merged this window's durable active
        // into layout.activeTabs — prefer it over the first tab in the space
        // when the runtime has no live focus to report yet (fresh boot).
        const remembered = layout.activeTabs?.[layout.activeSpaceId];
        const activePageId = ws.pages.some(page => page.pageId === ws.activePageId && layout.tabSpace[page.pageId] === layout.activeSpaceId)
          ? ws.activePageId
          : (remembered && ws.pages.some(page => page.pageId === remembered) ? remembered : tabsInSpace(layout, ws.pages, layout.activeSpaceId)[0]?.pageId ?? null);
        return { ...snapshot, pendingRestoreIds, activePageId, splitPageId: splitForPage(layout, ws.pages, activePageId), restoringTabs: !!ws.restoringTabs, bookmarks, settings, downloads, programs, connected: true, layout };
      });
      lastRefreshError = "";
      if (!bridge.privateMode && !bridge.quickAskMode) setTimeout(() => {
        void bridge.tabsSnapshot().then(async catalog => {
          get().syncTabsSnapshot(catalog);
          const layout = get().layout;
          const assignments = catalog.tabs.filter(tab => tab.windowId === bridge.windowId && !tab.runtimeOwned && !tab.popup && !tab.spaceId)
            .flatMap(tab => {
              const spaceId = layout.tabSpace[tab.pageId] ?? layout.activeSpaceId;
              return layout.spaces.some(space => space.id === spaceId && !!space.workspaceId) ? [{ pageId: tab.pageId, spaceId }] : [];
            });
          for (let offset = 0; offset < assignments.length; offset += 512)
            await bridge.migrateTabSpaces(assignments.slice(offset, offset + 512));
        }).catch(() => { /* The next runtime refresh can retry old placements. */ });
      }, 0);
      void bridge.setShortcutOverrides(settings.shortcutOverrides ?? {}).catch(() => {});
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message !== lastRefreshError) {
        console.error("Aux workspace refresh failed:", error);
        lastRefreshError = message;
      }
      set({ connected: false });
      setTimeout(() => void get().refresh(), 1500);
    }
  },

  applyEvent: (e) => {
    noteEventSeq(e.seq);
    const before = get();
    const next = reduceRunEvent(before, e) ?? reducePageEvent(before, e) ?? reduceLibraryEvent(before, e);
    if (next && Object.entries(next).some(([key, value]) => !Object.is(value, before[key as keyof Workspace]))) {
      if (next.layout && next.layout !== before.layout) persistLayout(next.layout);
      set(next);
    }
    eventEffects(e, before, set, get);
  },
}));

if (!bridge.privateMode && !bridge.quickAskMode) bridge.onOrganizationChanged(() => {
  if (!organizationHydrated) return;
  const before = useStore.getState().layout;
  void reloadOrganizationLayout().then(layout => {
    if (useStore.getState().layout === before) useStore.setState({ layout });
  }).catch(errToast);
});

/** Typed human tab command (§7.2) — main actuates, the patch stream confirms. */
export const tabCommand = (command: TabCommand) => sendTabCommand(useStore.getState, command);

/** Field update for one page from a side channel (loading, audio…) — a no-op when unchanged. */
export const patchPageFields = (pageId: string, fields: Partial<PageTarget>) => useStore.setState(st => patchPage(st, pageId, fields));

/** Fire-and-forget helper for UI actions — surfaces API errors as toasts. */
export const toast = (text: string, kind: "info" | "error" = "info") => useStore.getState().toast(text, kind);
export const errToast = (e: unknown) => toast(e instanceof Error ? e.message.replace(/^\w+Error:\s*/, "") : String(e), "error");
