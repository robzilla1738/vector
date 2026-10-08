import { hasNativeBookmarkAuthority } from "./native-bookmark-observer";
import { normalizePages } from "./store/pages";
import { errorMessage } from "./error-message";
import { create } from "zustand";
import type { Download, PageTarget, SavedProgram, TabCommand } from "@aux/contracts";
import { bridge } from "./bridge";
import {
  assignFolder,
  assignSpace,
  setActiveSpace,
  syncLayout,
  tabsInSpace,
  splitForPage,
} from "./workspace";
import { createBookmarksSlice } from "./store/bookmarks-slice";
import { createDraftsSlice } from "./store/drafts-slice";
import { eventEffects, reduceLibraryEvent, reducePageEvent, reduceRunEvent } from "./store/events";
import { createLayoutSlice } from "./store/layout-slice";
import { loadOrganizationLayout, persistLayout, reloadOrganizationLayout } from "./store/persistence";
import { createRunsSlice } from "./store/runs-slice";
import {
  call,
  eventStream,
  lastEventSeq,
  noteEventSeq,
  noteStream,
  patchPage,
  sendTabCommand,
} from "./store/shared";
import { retainNativeTabMetadata } from "./store/native-tab-metadata";
import { createTabsSlice } from "./store/tabs-slice";
import type { Workspace } from "./store/types";
import { createUiSlice } from "./store/ui-slice";
import { featureStage } from "./feature-availability";
import { reconcilePendingArchives } from "./tab-archive";

export type { CommandSlot, Mode, Overlay, RailView, RunModelStats, SidebarMode } from "./store/types";
export { isLive, LIVE_RUN } from "./store/types";
export { flushLayout } from "./store/persistence";
export { call, decodeBase64Json, lastEventSeq, pagePreview, pageRevision } from "./store/shared";

/**
 * The shell's single store, composed from domain slices (./store). Runtime
 * events apply through per-domain reducers plus one effects pass.
 */
let organizationHydrated = false;
let archiveRecoveryNeeded = true;
let lastRefreshError = "";
export const useStore = create<Workspace>((set, get, api) => ({
  ...createUiSlice(set, get, api),
  ...createDraftsSlice(set, get, api),
  ...createBookmarksSlice(set, get, api),
  ...createLayoutSlice(set, get, api),
  ...createTabsSlice(set, get, api),
  ...createRunsSlice(set, get, api),

  refresh: async () => {
    if (
      !bridge.privateMode &&
      bridge.windowKind === "normal" &&
      featureStage("spaces") === "on" &&
      !organizationHydrated
    ) {
      try {
        const layout = await loadOrganizationLayout();
        if (!organizationHydrated) {
          set({ layout, tidyUndo: layout.tidyUndo ?? null });
          organizationHydrated = true;
        }
      } catch (error) {
        errToast(error);
        set({ connected: false });
        setTimeout(() => void get().refresh(), 1500);
        return;
      }
    }
    // The main-owned catalog converges independently of runtime health.
    void bridge
      .tabsSnapshot()
      .then((snapshot) => get().syncTabsSnapshot(snapshot))
      .catch(() => {});
    try {
      if (bridge.privateMode) {
        const identity = await bridge.capabilities();
        if (!identity.privateSession) throw new Error("The private AI session is unavailable.");
        // This first unscoped request starts this OTR worker before Send needs
        // its authenticated window token. It never starts the regular worker.
        await call("settings.get");
      }
      const ws = await call("workspace.get");
      const [bookmarks, settings, downloads, programs] = await Promise.all([
        call("bookmarks.list").catch(() => [] as { url: string; title: string }[]),
        call("settings.get").catch(() => ({}) as Record<string, unknown>),
        call("downloads.list").catch(() => [] as Download[]),
        call("programs.list").catch(() => [] as SavedProgram[]),
      ]);
      if (!bridge.privateMode && bridge.windowKind === "normal" && featureStage("spaces") === "on") {
        const layout = get().layout;
        const legacySpaces = layout.spaces.filter((space) => !space.workspaceId);
        const spaces = await call("spaces.import", {
          spaces: legacySpaces.map((space) => ({
            id: space.id,
            name: space.name.slice(0, 100) || "Untitled",
            color: space.color ?? "slate",
            grain: space.grain,
            ...(space.theme ? { theme: space.theme } : {}),
          })),
        });
        get().syncBrowserSpaces(spaces);
      }
      // Events received while the supporting data loaded take precedence over this snapshot.
      if (lastEventSeq() > ws.lastSeq) {
        void get().refresh();
        return;
      }
      const { lastSeq, streamId, ...snapshot } = ws;
      snapshot.pages = snapshot.pages.map((page) => {
        const current = get().pages.byId[page.pageId ?? ""];
        return current ? retainNativeTabMetadata(current, page, get().catalogVersion) : page;
      });
      noteStream(streamId);
      noteEventSeq(lastSeq);
      set((s) => {
        let restored = s.layout;
        for (const page of ws.pages) {
          const placement = ws.tabPlacements?.[page.pageId];
          if (!placement || restored.tabSpace[page.pageId]) continue;
          restored = assignSpace(restored, page.pageId, placement.spaceId);
          if (placement.folder && restored.spaces.some((space) => space.id === placement.spaceId)) {
            if (!restored.folders.some((folder) => folder.id === placement.folder!.id))
              restored = { ...restored, folders: [...restored.folders, placement.folder] };
            restored = assignFolder(restored, page.pageId, placement.folder.id);
          }
          if (page.pageId === ws.activePageId) restored = setActiveSpace(restored, placement.spaceId);
        }
        const pendingRestoreIds = (ws.pendingRestoreTabs ?? []).map((tab) => tab.pageId);
        const synced = ws.restoringTabs ? restored : syncLayout(restored, ws.pages, pendingRestoreIds);
        const layout =
          archiveRecoveryNeeded && !ws.restoringTabs
            ? reconcilePendingArchives(synced, new Set(ws.pages.map((page) => page.pageId)))
            : synced;
        if (!ws.restoringTabs) archiveRecoveryNeeded = false;
        persistLayout(layout);
        // The catalog snapshot already merged this window's durable active
        // into layout.activeTabs — prefer it over the first tab in the space
        // when the runtime has no live focus to report yet (fresh boot).
        const remembered = layout.activeTabs?.[layout.activeSpaceId];
        const activePageId = ws.pages.some(
          (page) => page.pageId === ws.activePageId && layout.tabSpace[page.pageId] === layout.activeSpaceId,
        )
          ? ws.activePageId
          : remembered && ws.pages.some((page) => page.pageId === remembered)
            ? remembered
            : (tabsInSpace(layout, ws.pages, layout.activeSpaceId)[0]?.pageId ?? null);
        return {
          ...snapshot,
          pages: normalizePages(snapshot.pages, s.pages),
          pendingRestoreIds,
          activePageId,
          splitPageId: splitForPage(layout, ws.pages, activePageId),
          restoringTabs: !!ws.restoringTabs,
          bookmarks: hasNativeBookmarkAuthority() ? s.bookmarks : bookmarks,
          settings,
          downloads,
          programs,
          connected: true,
          layout,
          tidyUndo: layout.tidyUndo ?? null,
        };
      });
      lastRefreshError = "";
      if (!bridge.privateMode && bridge.windowKind === "normal")
        setTimeout(() => {
          void bridge
            .tabsSnapshot()
            .then(async (catalog) => {
              get().syncTabsSnapshot(catalog);
              const layout = get().layout;
              const assignments = catalog.tabs
                .filter(
                  (tab) =>
                    tab.windowId === bridge.windowId && !tab.runtimeOwned && !tab.popup && !tab.spaceId,
                )
                .flatMap((tab) => {
                  const spaceId = layout.tabSpace[tab.pageId] ?? layout.activeSpaceId;
                  return layout.spaces.some((space) => space.id === spaceId && !!space.workspaceId)
                    ? [{ pageId: tab.pageId, spaceId }]
                    : [];
                });
              for (let offset = 0; offset < assignments.length; offset += 512)
                await bridge.migrateTabSpaces(assignments.slice(offset, offset + 512));
            })
            .catch(() => {
              /* The next runtime refresh can retry old placements. */
            });
        }, 0);
      void bridge.setShortcutOverrides(settings.shortcutOverrides ?? {}).catch((error) => {
        console.error("Aux shortcut registration failed:", error);
      });
    } catch (error) {
      const message = errorMessage(error);
      if (message !== lastRefreshError) {
        console.error("Aux workspace refresh failed:", error);
        get().toast(`Couldn’t reconnect to the Aux runtime: ${message}`, "error");
        lastRefreshError = message;
      }
      set({ connected: false });
      setTimeout(() => void get().refresh(), 1500);
    }
  },

  applyEvent: (e) => {
    // D9: once connected, the shell's stream is unfiltered, so every event's
    // seq must be contiguous and on the snapshot's stream. A new streamId or
    // a forward hole means an event was lost — resync from a fresh snapshot
    // instead of applying a hole; replayed seqs (≤ head) are already applied.
    if (e.streamId && !eventStream()) noteStream(e.streamId);
    if (get().connected) {
      if (e.streamId && e.streamId !== eventStream()) {
        void get().refresh();
        return;
      }
      if (e.seq <= lastEventSeq()) return;
      if (lastEventSeq() > 0 && e.seq !== lastEventSeq() + 1) {
        void get().refresh();
        return;
      }
    }
    noteEventSeq(e.seq);
    const before = get();
    const next = reduceRunEvent(before, e) ?? reducePageEvent(before, e) ?? reduceLibraryEvent(before, e);
    if (
      next &&
      Object.entries(next).some(([key, value]) => !Object.is(value, before[key as keyof Workspace]))
    ) {
      if (next.layout && next.layout !== before.layout) persistLayout(next.layout);
      set(next);
    }
    eventEffects(e, before, set, get);
  },
}));

if (!bridge.privateMode && bridge.windowKind === "normal")
  bridge.onOrganizationChanged(() => {
    if (!organizationHydrated) return;
    const before = useStore.getState().layout;
    void reloadOrganizationLayout()
      .then((layout) => {
        if (useStore.getState().layout === before)
          useStore.setState({ layout, tidyUndo: layout.tidyUndo ?? null });
      })
      .catch(errToast);
  });

/** Typed human tab command (§7.2) — main actuates, the patch stream confirms. */
export const tabCommand = (command: TabCommand) => sendTabCommand(useStore.getState, command);

/** Field update for one page from a side channel (loading, audio…) — a no-op when unchanged. */
export const patchPageFields = (pageId: string, fields: Partial<PageTarget>) =>
  useStore.setState((st) => patchPage(st, pageId, fields));

/** Fire-and-forget helper for UI actions — surfaces API errors as toasts. */
export const toast: Workspace["toast"] = (text, kind = "info", action) =>
  useStore.getState().toast(text, kind, action);
export const errToast = (e: unknown) =>
  toast(e instanceof Error ? e.message.replace(/^\w+Error:\s*/, "") : String(e), "error");
