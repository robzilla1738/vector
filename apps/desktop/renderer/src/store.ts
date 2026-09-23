import { create } from "zustand";
import type { BrowserSession, BrowserSpace, Download, PageSet, PageTarget, Run, SavedProgram, SetMember, TabCommand } from "@aux/contracts";
import { bridge } from "./bridge";
import { assignFolder, assignSpace, setActiveSpace, syncLayout, tabsInSpace, splitForPage, type Layout } from "./workspace";
import { createBookmarksSlice } from "./store/bookmarks-slice";
import { createDraftsSlice } from "./store/drafts-slice";
import { eventEffects, reduceLibraryEvent, reducePageEvent, reduceRunEvent } from "./store/events";
import { createLayoutSlice } from "./store/layout-slice";
import { LAYOUT_KEY, persistLayout, storage } from "./store/persistence";
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
export const useStore = create<Workspace>((set, get, api) => ({
  ...createUiSlice(set, get, api),
  ...createDraftsSlice(set, get, api),
  ...createBookmarksSlice(set, get, api),
  ...createLayoutSlice(set, get, api),
  ...createTabsSlice(set, get, api),
  ...createRunsSlice(set, get, api),

  refresh: async () => {
    // The main-owned catalog converges independently of runtime health.
    void bridge.tabsSnapshot().then(snapshot => get().syncTabsSnapshot(snapshot)).catch(() => {});
    try {
      const ws = await call<{
        pages: PageTarget[];
        restoringTabs?: boolean;
        pendingRestoreTabs?: {pageId:string;windowId:string}[];
        tabPlacements?: Record<string, { spaceId: string; folder?: Layout["folders"][number] }>;
        sets: PageSet[];
        members: SetMember[];
        runs: Run[];
        sessions: BrowserSession[];
        activePageId: string | null;
        lastSeq: number;
      }>("workspace.get");
      const [bookmarks, settings, downloads, programs] = await Promise.all([
        call<{ url: string; title: string }[]>("bookmarks.list").catch(() => [] as { url: string; title: string }[]),
        call<Record<string, unknown>>("settings.get").catch(() => ({}) as Record<string, unknown>),
        call<Download[]>("downloads.list").catch(() => [] as Download[]),
        call<SavedProgram[]>("programs.list").catch(() => [] as SavedProgram[]),
      ]);
      if (!bridge.privateMode) {
        const layout = get().layout;
        const legacySpaces = layout.spaces.filter(space => !space.workspaceId);
        if (legacySpaces.length && storage && !storage.getItem(`${LAYOUT_KEY}:before-spaces`)) {
          storage.setItem(`${LAYOUT_KEY}:before-spaces`, JSON.stringify(layout));
        }
        const spaces = await call<BrowserSpace[]>("spaces.import", { spaces: legacySpaces.map(space => ({
          id: space.id, name: space.name.slice(0, 100) || "Untitled", color: space.color ?? "slate",
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
      void bridge.setShortcutOverrides(settings.shortcutOverrides ?? {}).catch(() => {});
    } catch {
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

/** Typed human tab command (§7.2) — main actuates, the patch stream confirms. */
export const tabCommand = (command: TabCommand) => sendTabCommand(useStore.getState, command);

/** Field update for one page from a side channel (loading, audio…) — a no-op when unchanged. */
export const patchPageFields = (pageId: string, fields: Partial<PageTarget>) => useStore.setState(st => patchPage(st, pageId, fields));

/** Fire-and-forget helper for UI actions — surfaces API errors as toasts. */
export const toast = (text: string, kind: "info" | "error" = "info") => useStore.getState().toast(text, kind);
export const errToast = (e: unknown) => toast(e instanceof Error ? e.message.replace(/^\w+Error:\s*/, "") : String(e), "error");
