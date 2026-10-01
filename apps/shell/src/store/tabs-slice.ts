import type { PageTarget, TabPlacement } from "@aux/contracts";
import { newPageId } from "@aux/contracts/ids";
import { bridge } from "../bridge";
import { rememberMovedSelection } from "../features/window-sync/moved-selection";
import { canClaim, inSharedSidebar, isLocal } from "../tab-window-transfer";
import { featureStage } from "../use-feature";
import { readClosedTabs } from "../closed-tabs";
import { errToast, toast } from "../store";
import { type Folder, type Space, type SpaceColor, assignFolder, assignSpace, isTab, rememberActiveTab, setActiveSpace, splitForPage, syncLayout, syncOrder, withSyncedOrder } from "../workspace";
import { CLOSED_TABS_KEY, persistClosedTabs, persistLayout, storage } from "./persistence";
import { applyRemoval, call, closingGroups, closingOptimistic, mergeTabInto, openingOptimistic, pageFromTab, sendTabCommand } from "./shared";
import type { Slice, TabKeys, Workspace } from "./types";

/** Space/folder snapshot carried on a move so the destination window can file the tab. */
const tabPlacementFor = (state: Pick<Workspace, "layout" | "pages">, pageId: string): TabPlacement | undefined => {
  const spaceId = state.layout.tabSpace[pageId] ?? state.layout.activeSpaceId;
  const space = [...state.layout.spaces, ...(state.layout.archivedSpaces ?? [])].find(item => item.id === spaceId);
  if (!space) return undefined;
  const folder = state.layout.folders.find(item => item.id === state.layout.tabFolder[pageId]);
  const page = state.pages.find(item => item.pageId === pageId);
  const tabName = state.layout.tabNames?.[pageId];
  return {
    space: { id: space.id, name: space.name, color: space.color, grain: space.grain, ...(space.theme ? { theme: space.theme } : {}), ...(space.workspaceId ? { workspaceId: space.workspaceId } : {}) },
    ...(folder ? { folder: { id: folder.id, name: folder.name, spaceId: folder.spaceId, collapsed: folder.collapsed, ...(folder.color ? { color: folder.color } : {}), ...(folder.emoji ? { emoji: folder.emoji } : {}) } } : {}),
    ...(page && tabName?.url === page.url ? { tabName } : {}),
  };
};

/** Strip order after a window op: catalog order wins, uncataloged ids keep their relative tail. */
const reconcileWindowOrder = (order: string[], catalogOrder: string[], pages: Pick<PageTarget, "pageId">[], preservedIds: string[]) => {
  const live = new Set(pages.map(page => page.pageId));
  // Ids the catalog owns but the page list has not caught up with yet keep
  // their catalog position — otherwise a window op processed before its
  // sibling upsert would re-append them at the end.
  const pending = catalogOrder.filter(id => !live.has(id));
  const known = new Set(catalogOrder);
  return syncOrder([...catalogOrder, ...order.filter(id => !known.has(id))], pages, [...preservedIds, ...pending]);
};

/** one in-flight catalog resync per shell — gap storms collapse into a single fetch */
let tabsResyncing = false;

function syncBatterySaverState(active: boolean | undefined) {
  if (active !== undefined) document.documentElement.dataset.batterySaver = String(active);
}

export const createTabsSlice: Slice<TabKeys> = (set, get, api) => ({
  pages: [],
  activePageId: null,
  previewVersion: 0,
  closedTabs: bridge.privateMode?[]:readClosedTabs(storage,CLOSED_TABS_KEY),
  reopeningTab: false,
  tabAudio: {},
  restoringTabs: true,
  pendingRestoreIds: [],
  catalogVersion: 0,

  /**
   * Main-owned catalog patches (§7.2). Ops apply in order inside one state
   * transition; a base-version gap or a reconnect routes through resyncTabs,
   * which replays the retained log or falls back to a snapshot — a suspended
   * renderer never has to guess.
   */
  applyTabsPatch: (patch) => {
    let resyncNeeded = false;
    let windowChoseActive = false;
    set((st) => {
      if (patch.baseVersion !== st.catalogVersion) { resyncNeeded = true; return {}; }
      syncBatterySaverState(patch.batterySaverActive);
      let pages = st.pages;
      let layout = st.layout;
      let layoutDirty = false;
      let closedTabs = st.closedTabs;
      let previewVersion = st.previewVersion;
      let zoomLevels = st.zoomLevels;
      let activePageId = st.activePageId;
      let splitPageId = st.splitPageId;
      for (const op of patch.ops) {
        if (op.op === "upsert") {
          const tab = op.tab;
          if (activePageId === tab.pageId && tab.windowId !== bridge.windowId && pages.some(page => page.pageId === tab.pageId && isLocal(page))) rememberMovedSelection({ pageId: tab.pageId, windowId: tab.windowId });
          const shared = featureStage("windowSync") === "on" && bridge.windowKind === "normal";
          const local = isLocal(pageFromTab(tab));
          const worker = tab.runtimeOwned && pages.some(page => page.pageId === tab.pageId && page.ownedByRuntime);
          if (!local && !worker && !(shared && inSharedSidebar(pageFromTab(tab)))) {
            if (pages.some(page => page.pageId === tab.pageId)) {
              pages = pages.filter(page => page.pageId !== tab.pageId);
              layout = withSyncedOrder(layout, pages, st.pendingRestoreIds);
              if (activePageId === tab.pageId) activePageId = null;
              splitPageId = splitForPage(layout, pages, activePageId);
              layoutDirty = true;
            }
            continue;
          }
          if (tab.spaceId && [...layout.spaces, ...(layout.archivedSpaces ?? [])].some(space => space.id === tab.spaceId)
            && layout.tabSpace[tab.pageId] !== tab.spaceId) {
            layout = assignSpace(layout, tab.pageId, tab.spaceId);
            layoutDirty = true;
          }
          openingOptimistic.delete(tab.pageId);
          const index = pages.findIndex(page => page.pageId === tab.pageId);
          if (index < 0 && closingOptimistic.has(tab.pageId)) continue;
          if (index >= 0) {
            const merged = mergeTabInto(pages[index]!, tab);
            if (merged !== pages[index]) pages = pages.with(index, merged);
          } else {
            pages = [...pages, pageFromTab(tab)];
            if (!st.restoringTabs) {
              const synced = syncLayout(layout, pages, st.pendingRestoreIds);
              if (synced !== layout) { layout = synced; layoutDirty = true; }
            }
          }
        } else if (op.op === "remove") {
          const applied = applyRemoval({ ...st, pages, layout, closedTabs, previewVersion, zoomLevels, activePageId, splitPageId }, op.pageId, null);
          ({ pages, closedTabs, previewVersion, zoomLevels, layout, activePageId, splitPageId } = applied.next);
          // No activateNext: a catalog remove is always followed by main's own
          // successor (a same-patch or focusPage window op) — commanding a local
          // neighbour pick races the runtime's return-target choice.
          layoutDirty = true;
        } else if (op.op === "window" && op.window.windowId === bridge.windowId) {
          windowChoseActive = true;
          const order = featureStage("windowSync") === "on" && bridge.windowKind === "normal" ? syncOrder(layout.order, pages, st.pendingRestoreIds) : reconcileWindowOrder(layout.order, op.window.order, pages, st.pendingRestoreIds);
          if (order.join() !== layout.order.join()) { layout = { ...layout, order }; layoutDirty = true; }
          activePageId = op.window.activePageId;
          if (pages.some(page => page.pageId === activePageId && isLocal(page))) rememberMovedSelection(null);
        }
      }
      if (windowChoseActive) {
        const remembered = rememberActiveTab(layout, activePageId);
        if (remembered !== layout) { layout = remembered; layoutDirty = true; }
        splitPageId = splitForPage(layout, pages, activePageId);
      }
      if (layoutDirty) persistLayout(layout);
      return { pages, layout, closedTabs, previewVersion, zoomLevels, activePageId, splitPageId, catalogVersion: patch.version };
    });
    if (resyncNeeded) void get().resyncTabs();
  },

  syncTabsSnapshot: (snapshot) => {
    set((st) => {
      // A resync can land an older snapshot after newer patches — keep the newer truth.
      if (snapshot.version < st.catalogVersion) return {};
      syncBatterySaverState(snapshot.batterySaverActive);
      const shared = featureStage("windowSync") === "on" && bridge.windowKind === "normal";
      const tabs = snapshot.tabs.filter(tab => isLocal(pageFromTab(tab)) || (shared && inSharedSidebar(pageFromTab(tab))) || (tab.runtimeOwned && st.pages.some(page => page.pageId === tab.pageId && page.ownedByRuntime)));
      const known = new Set(tabs.map(tab => tab.pageId));
      // The catalog is authoritative for this window's human tab set; pages it
      // does not own (runtime workers, other windows) are left to the runtime.
      const pages = st.pages.filter(page => known.has(page.pageId) || st.pendingRestoreIds.includes(page.pageId) || page.ownedByRuntime);
      for (const tab of tabs) {
        const existing = pages.find(page => page.pageId === tab.pageId);
        if (!existing) pages.push(pageFromTab(tab));
        else pages[pages.indexOf(existing)] = mergeTabInto(existing, tab);
      }
      const mine = snapshot.windows.find(window => window.windowId === bridge.windowId);
      let layout = st.layout;
      if (!st.restoringTabs) layout = syncLayout(layout, pages, st.pendingRestoreIds);
      for (const tab of tabs) if (tab.spaceId && [...layout.spaces, ...(layout.archivedSpaces ?? [])].some(space => space.id === tab.spaceId)
        && layout.tabSpace[tab.pageId] !== tab.spaceId) layout = assignSpace(layout, tab.pageId, tab.spaceId);
      if (mine) layout = rememberActiveTab({ ...layout, order: shared ? syncOrder(layout.order, pages, st.pendingRestoreIds) : reconcileWindowOrder(layout.order, mine.order, pages, st.pendingRestoreIds) }, mine.activePageId);
      persistLayout(layout);
      const activePageId = mine ? mine.activePageId : st.activePageId;
      return { pages, layout, activePageId, splitPageId: splitForPage(layout, pages, activePageId), catalogVersion: snapshot.version };
    });
  },

  applyTabsPlacement: ({ pageId, windowId, placement }) => {
    if (windowId !== bridge.windowId) return;
    set(s => {
      const page = s.pages.find(item => item.pageId === pageId);
      if (!page) return {};
      const space: Space = { id: placement.space.id, name: placement.space.name, color: placement.space.color as SpaceColor, grain: placement.space.grain ?? 0, ...(placement.space.theme ? { theme: placement.space.theme } : {}), ...(placement.space.workspaceId ? { workspaceId: placement.space.workspaceId } : {}) };
      let layout = s.layout.spaces.some(item => item.id === space.id) ? s.layout
        : { ...s.layout, spaces: [...s.layout.spaces, space], archivedSpaces: s.layout.archivedSpaces?.filter(item => item.id !== space.id) };
      layout = assignSpace(layout, pageId, space.id);
      if (placement.folder) {
        const folder: Folder = { ...placement.folder, color: placement.folder.color as SpaceColor | undefined };
        if (!layout.folders.some(item => item.id === folder.id)) layout = { ...layout, folders: [...layout.folders, folder] };
        layout = assignFolder(layout, pageId, folder.id);
      }
      if (placement.tabName?.url === page.url) layout = { ...layout, tabNames: { ...layout.tabNames, [pageId]: placement.tabName } };
      persistLayout(layout);
      return { layout };
    });
  },

  resyncTabs: async (valid = () => true) => {
    if (!valid() || tabsResyncing) return;
    tabsResyncing = true;
    try {
      const result = await bridge.tabsSince(get().catalogVersion);
      if(!valid())return;
      if (result.kind === "snapshot") get().syncTabsSnapshot(result.snapshot);
      else for (const patch of result.patches) get().applyTabsPatch(patch);
    } catch {
      /* the next patch re-triggers the resync */
    } finally {
      tabsResyncing = false;
    }
  },

  activate: async (pageId) => {
    if (get().pendingRestoreIds.includes(pageId)) {
      try {
        await call("browser.recovery.retry", { pageId });
        set(st => ({ pendingRestoreIds: st.pendingRestoreIds.filter(id => id !== pageId) }));
      } catch (error) { errToast(error); return; }
    }
    const page = get().pages.find(item => item.pageId === pageId);
    const claim = page && !isLocal(page) && featureStage("windowSync") === "on" && bridge.windowKind === "normal";
    if (claim) {
      if (!canClaim(page)) {
        rememberMovedSelection({ pageId, windowId: page.windowId ?? "main" });
        return;
      }
      const ack = await bridge.tabCommand({ kind: "claim", pageId, activate: true });
      if (ack.status === "rejected") throw new Error(ack.error?.message ?? "Aux could not move this tab here.");
    }
    rememberMovedSelection(null);
    const spaceId = get().layout.tabSpace[pageId];
    if (spaceId && spaceId !== get().layout.activeSpaceId) {
      if (get().layout.archivedSpaces?.some(space => space.id === spaceId)) await get().restoreSpace(spaceId);
      const layout = setActiveSpace(get().layout, spaceId);
      persistLayout(layout); set({ layout });
    }
    const remembered = rememberActiveTab(get().layout, pageId);
    const folderId = remembered.tabFolder[pageId];
    const selectionLayout = folderId ? { ...remembered, folders: remembered.folders.map(folder => folder.id === folderId && folder.collapsed ? { ...folder, collapsed: false } : folder) } : remembered;
    persistLayout(selectionLayout);
    set({ layout: selectionLayout });
    if (get().overlay !== "find") get().setOverlay(null);
    set({ activePageId: pageId, mode: "focus", splitPageId: splitForPage(get().layout, get().pages, pageId) });
    if (!claim) await sendTabCommand(get, { kind: "activate", pageId });
  },

  navigatePage: async (pageId, url) => {
    // Reveal the destination before loading. A failure belongs in the browser,
    // and a slow response must never select this tab over a newer user selection.
    await get().activate(pageId);
    try { await sendTabCommand(get, { kind: "navigate", pageId, url }); }
    catch (reason) {
      const page = get().pages.find(page => page.pageId === pageId);
      if (page?.navigationError?.url !== url) throw reason;
      // The native failure is already presented with retry/edit/back controls.
    }
  },

  newTab: async (url = "about:blank", reuseId?: string, index?: number) => {
    if (bridge.windowKind === "little") {
      const state = get();
      const page = state.pages.find(item => item.pageId === state.activePageId && isLocal(item));
      if (!page) throw new Error("Wait for this Little window to finish opening, then try again.");
      state.setOverlay(null);
      set({ mode: "focus" });
      await state.navigatePage(page.pageId, url);
      if (url === "about:blank") get().focusCommandBar("toolbar");
      return get().pages.find(item => item.pageId === page.pageId) ?? null;
    }
    // Optimistic: the row and the start page appear now under a renderer-minted
    // id that main adopts; a refused open removes the placeholder again.
    const pageId = reuseId ?? newPageId();
    const before = get();
    const optimistic = !before.pages.some(page => page.pageId === pageId);
    const observed = new Set(before.pages.map(page => page.pageId));
    const unsubscribe = api.subscribe(state => { for (const page of state.pages) observed.add(page.pageId); });
    const stub = (id: string) => pageFromTab({ pageId: id, windowId: bridge.windowId, url, title: "", loading: url !== "about:blank", muted: false, audible: false, canGoBack: false, canGoForward: false, popup: false, crashed: false, runtimeOwned: false, generation: 0, createdAt: Date.now(), lastActiveAt: Date.now() });
    const dropPlaceholder = () => {
      if (!optimistic || !openingOptimistic.has(pageId)) return;
      openingOptimistic.delete(pageId);
      set((s) => {
        const pages = s.pages.filter(page => page.pageId !== pageId);
        const layout = withSyncedOrder(s.layout, pages, s.pendingRestoreIds);
        persistLayout(layout);
        const activePageId = s.activePageId === pageId ? before.activePageId : s.activePageId;
        return { pages, layout, activePageId, splitPageId: splitForPage(layout, pages, activePageId) };
      });
    };
    get().setOverlay(null);
    if (optimistic) {
      openingOptimistic.add(pageId);
      set((s) => {
        const pages = [...s.pages, stub(pageId)];
        const layout = assignSpace(withSyncedOrder(s.layout, pages, s.pendingRestoreIds), pageId, s.layout.activeSpaceId);
        persistLayout(layout);
        return { pages, layout, activePageId: pageId, mode: "focus" as const, overlay: null, splitPageId: splitForPage(layout, pages, pageId) };
      });
      if (url === "about:blank") get().focusCommandBar("hero");
    } else set({ mode: "focus" });
    try {
      const ack = await bridge.tabCommand({ kind: "open", url, activate: true, pageId, ...(index == null ? {} : { index }) }, get().catalogVersion);
      if (ack.status === "rejected" || !ack.pageId) throw new Error(ack.error?.message ?? "The tab could not be opened.");
      const confirmed = ack.pageId;
      if (confirmed !== pageId) {
        // Main chose its own id: retire the placeholder and file the real tab.
        dropPlaceholder();
        set((s) => {
          const existing = s.pages.some(x => x.pageId === confirmed);
          if (!existing && observed.has(confirmed)) return {}; // Closed while the open response was pending.
          const pages = existing ? s.pages : [...s.pages, stub(confirmed)];
          const layout = assignSpace(withSyncedOrder(s.layout, pages, s.pendingRestoreIds), confirmed, s.layout.activeSpaceId);
          persistLayout(layout);
          return { pages, layout, ...(!existing ? { activePageId: confirmed, mode: "focus" as const, overlay: null } : {}) };
        });
        if (url === "about:blank" && get().activePageId === confirmed) get().focusCommandBar("hero");
      }
      if (!bridge.privateMode && featureStage("spaces") === "on" && get().pages.some(page => page.pageId === confirmed))
        void bridge.bindTabSpace(confirmed, get().layout.tabSpace[confirmed] ?? get().layout.activeSpaceId).catch(errToast);
      return get().pages.find(page => page.pageId === confirmed) ?? null;
    } catch (e) {
      dropPlaceholder();
      errToast(e);
      return null;
    } finally { openingOptimistic.delete(pageId); unsubscribe(); }
  },

  openBackgroundTab: async (url, spaceId, reuseExisting = true, reuseId?: string, index?: number) => {
    if (!get().layout.spaces.some(space => space.id === spaceId)) throw new Error("This Space is no longer available.");
    const existing = get().pages.find(page => page.url === url && isTab(page) && page.viewStatus !== "crashed" && get().layout.tabSpace[page.pageId] === spaceId);
    if (reuseExisting && existing) return existing;
    const observed = new Set(get().pages.map(page => page.pageId));
    const unsubscribe = api.subscribe(state => { for (const page of state.pages) observed.add(page.pageId); });
    try {
      const ack = await bridge.tabCommand({ kind: "open", url, background: true, activate: false, ...(reuseId ? { pageId: reuseId } : {}), ...(index == null ? {} : { index }) }, get().catalogVersion);
      if (ack.status === "rejected" || !ack.pageId) throw new Error(ack.error?.message ?? "The tab could not be opened.");
      const pageId = ack.pageId;
      const stub = pageFromTab({ pageId, windowId: bridge.windowId, url, title: "", loading: true, muted: false, audible: false, canGoBack: false, canGoForward: false, popup: false, crashed: false, runtimeOwned: false, generation: 0, createdAt: Date.now(), lastActiveAt: Date.now() });
      set(state => {
        const existing = state.pages.some(item => item.pageId === pageId);
        if (!existing && observed.has(pageId)) return {};
        const pages = existing ? state.pages : [...state.pages, stub];
        // Preserve the requested destination even if the user switches Spaces while loading.
        const destination = [...state.layout.spaces, ...(state.layout.archivedSpaces ?? [])].some(space => space.id === spaceId) ? spaceId : state.layout.activeSpaceId;
        const layout = { ...state.layout, order: syncOrder(state.layout.order, pages,state.pendingRestoreIds), tabSpace: { ...state.layout.tabSpace, [pageId]: destination } };
        persistLayout(layout);
        return { pages, layout };
      });
      if (!bridge.privateMode && featureStage("spaces") === "on") await bridge.bindTabSpace(pageId, get().layout.tabSpace[pageId] ?? spaceId);
      return get().pages.find(item => item.pageId === pageId) ?? stub;
    } finally { unsubscribe(); }
  },

  reopenClosedTab: async (pageId, group = false) => {
    const latest = pageId ? get().closedTabs.find(tab => tab.pageId === pageId) : get().closedTabs.at(-1);
    if (!latest || get().reopeningTab) return;
    const entries = (!pageId || group) && latest.groupId ? get().closedTabs.filter(tab => tab.groupId === latest.groupId).sort((a, b) => a.index - b.index) : [latest];
    const selectionBefore = get().activePageId;
    const spaceBefore = get().layout.activeSpaceId;
    let foreground: string | undefined;
    let lastOpened: string | undefined;
    set({ reopeningTab: true });
    // The catalog patch can lag behind a resolved open — the page may take a
    // moment to land in `pages`. Wait for it (bounded) before writing order,
    // else an interim syncOrder drops the id and the tab ends up appended
    // instead of at its recorded position.
    const awaitPage = (id: string) => new Promise<boolean>(resolve => {
      if (get().pages.some(item => item.pageId === id)) return resolve(true);
      const timer = setTimeout(() => { unsub(); resolve(false); }, 3000);
      const unsub = api.subscribe(state => { if (state.pages.some(item => item.pageId === id)) { clearTimeout(timer); unsub(); resolve(true); } });
    });
    try {
      for (const entry of entries) {
        if (get().layout.archivedSpaces?.some(space => space.id === entry.spaceId)) {
          get().syncBrowserSpaces(await call("spaces.update", { id: entry.spaceId, archived: false }));
        }
        const destinationSpace = get().layout.spaces.some(space => space.id === entry.spaceId) ? entry.spaceId : get().layout.activeSpaceId;
        // Reopen into the recorded Space at the catalog boundary. Opening in
        // the current Space first lets a later catalog patch overwrite the
        // restored placement after the renderer assigns it locally.
        let page: PageTarget | null = await get().openBackgroundTab(entry.url, destinationSpace, false, entry.pageId, entry.index);
        if (!page && entry.pageId && await awaitPage(entry.pageId)) {
          // The catalog acknowledged the open while its patch was still in
          // flight — the tab did land, it just wasn't visible yet.
          page = get().pages.find(item => item.pageId === entry.pageId) ?? null;
        }
        if (!page) return; // Keep the entry available if opening failed.
        lastOpened = page.pageId;
        if (entry.wasActive) foreground = page.pageId;
        await awaitPage(page.pageId);
        set(state => {
          const spaceId = state.layout.spaces.some(space => space.id === entry.spaceId) ? entry.spaceId : state.layout.activeSpaceId;
          let layout = assignSpace(state.layout, page.pageId, spaceId);
          const folder = layout.folders.find(folder => folder.id === entry.folderId && folder.spaceId === spaceId);
          if (folder) {
            layout = assignFolder(layout, page.pageId, folder.id);
            layout = { ...layout, folders: layout.folders.map(item => item.id === folder.id ? { ...item, collapsed: false } : item) };
          }
          const order = layout.order.filter(id => id !== page.pageId);
          order.splice(Math.max(0, Math.min(entry.index, order.length)), 0, page.pageId);
          const selected = state.activePageId === page.pageId;
          layout = { ...layout, activeSpaceId: selected ? spaceId : layout.activeSpaceId, order };
          if (selected) layout = rememberActiveTab(layout, page.pageId);
          persistLayout(layout);
          const closedTabs=state.closedTabs.filter(tab => tab !== entry);persistClosedTabs(closedTabs);
          return { layout, closedTabs, splitPageId: splitForPage(layout, state.pages, state.activePageId) };
        });
      }
      // Reopen Closed Tab is a foreground command even when the tab was
      // closed from a background row. For a group, restore its prior active
      // member when one exists; otherwise show the last reopened member.
      const focus = foreground ?? lastOpened;
      if (focus && get().activePageId === selectionBefore && get().layout.activeSpaceId === spaceBefore
        && get().pages.some(page => page.pageId === focus)) await get().activate(focus);
    } catch (error) { errToast(error); }
    finally { set({ reopeningTab: false }); }
  },

  duplicateTab: async pageId => {
    const original = get();
    const source = original.pages.find(page => page.pageId === pageId);
    if (!source || !/^https?:/.test(source.url) || source.ownedByRuntime) throw new Error("This tab cannot be duplicated.");
    const spaceId = original.layout.tabSpace[pageId] ?? original.layout.activeSpaceId;
    const folderId = original.layout.tabFolder[pageId];
    const duplicate = await get().openBackgroundTab(source.url, spaceId, false);
    set(state => {
      if (!state.pages.some(page => page.pageId === duplicate.pageId)) return {};
      let layout = state.layout;
      if (folderId && layout.folders.some(folder => folder.id === folderId && folder.spaceId === spaceId)) layout = assignFolder(layout, duplicate.pageId, folderId);
      const order = layout.order.filter(id => id !== duplicate.pageId);
      const sourceIndex = order.indexOf(pageId);
      order.splice(sourceIndex < 0 ? order.length : sourceIndex + 1, 0, duplicate.pageId);
      layout = { ...layout, order };
      persistLayout(layout);
      return { layout };
    });
    if (get().pages.some(page => page.pageId === duplicate.pageId)) await get().activate(duplicate.pageId);
  },

  closingTabs: false,
  closeTabs: async (pageIds, options) => {
    if (get().closingTabs) return false;
    set({closingTabs: true});
    const ids = [...new Set(pageIds)];
    let closed = 0;
    const groupId = crypto.randomUUID();
    const originalOrder = get().layout.order;
    const originalActive = get().activePageId;
    try {
      for (const pageId of ids) {
        if (options?.shouldStop?.()) return false;
        const page = get().pages.find(item => item.pageId === pageId);
        if (!page) continue;
        if (page.ownedByRuntime || page.controller === "agent" || page.controller === "external") {
          toast("Closing stopped. Take control of the remaining tab first."); return false;
        }
        if (ids.length > 1) {
          closingGroups.set(pageId, {groupId, index: Math.max(0, originalOrder.indexOf(pageId)), wasActive: originalActive === pageId});
          if (closingGroups.size > 200) closingGroups.delete(closingGroups.keys().next().value!);
        }
        let ok: boolean;
        try { ok = (await bridge.tabCommand({ kind: "close", pageId }, get().catalogVersion)).status !== "rejected"; }
        catch (error) { closingGroups.delete(pageId); throw error; }
        if (!ok) closingGroups.delete(pageId);
        if (!ok) { toast(`Closing stopped. ${closed} ${closed === 1 ? "tab" : "tabs"} closed.`); return false; }
        closed++;
        options?.onClosed?.(pageId, closed);
      }
      if (closed > 1) toast(`${closed} tabs closed. Reopen the group with ⌘⇧T.`);
      return true;
    } finally { set({closingTabs: false}); }
  },
  closeTab: async (pageId) => {
    // Optimistic: the row leaves now; main's remove op confirms, a refusal
    // (kept by beforeunload, agent-held) puts it back where it was.
    const before = get();
    const page = before.pages.find(item => item.pageId === pageId);
    const optimistic = !!page && isTab(page) && page.controller !== "agent" && page.controller !== "external" && !closingOptimistic.has(pageId);
    if (optimistic) {
      closingOptimistic.add(pageId);
      set(st => applyRemoval(st, pageId, null).next);
    }
    try {
      await sendTabCommand(get, { kind: "close", pageId });
    } catch (e) {
      if (optimistic && page) set(st => {
        if (st.pages.some(item => item.pageId === pageId)) return st;
        const pages = [...st.pages, page];
        const order = st.layout.order.filter(id => id !== pageId);
        order.splice(Math.max(0, Math.min(before.layout.order.indexOf(pageId), order.length)), 0, pageId);
        const layout = { ...st.layout, order };
        persistLayout(layout);
        const closedTabs = st.closedTabs.filter(tab => tab.pageId !== pageId || before.closedTabs.includes(tab));
        if (closedTabs.length !== st.closedTabs.length) persistClosedTabs(closedTabs);
        const activePageId = before.activePageId === pageId ? pageId : st.activePageId;
        const zoom = before.zoomLevels[pageId];
        return { pages, layout, closedTabs, activePageId, splitPageId: splitForPage(layout, pages, activePageId), ...(zoom === undefined ? {} : { zoomLevels: { ...st.zoomLevels, [pageId]: zoom } }) };
      });
      errToast(e);
    } finally { closingOptimistic.delete(pageId); }
  },

  moveTabToWindow: async (pageId, windowId) => {
    const page = get().pages.find(item => item.pageId === pageId);
    if (!page || page.viewStatus === "detached" || page.ownedByRuntime || page.controller === "agent" || page.controller === "external") {
      throw new Error("Take control of the tab before moving it.");
    }
    const placement = tabPlacementFor(get(), pageId);
    const ack = await bridge.tabCommand({
      kind: "move", pageId, activate: get().activePageId === pageId,
      ...(windowId ? { windowId } : {}),
      ...(placement ? { placement } : {}),
    }, get().catalogVersion);
    if (ack.status === "rejected") throw new Error(ack.error?.message ?? "Aux could not move the tab.");
  },
  moveTabsToWindow: async (pageIds, windowId) => {
    const state = get();
    const placements = [...new Set(pageIds)].map(pageId => {
      const page = state.pages.find(item => item.pageId === pageId);
      if (!page || page.viewStatus === "detached" || page.ownedByRuntime || page.controller === "agent" || page.controller === "external") {
        throw new Error("Take control of every selected tab before moving the group.");
      }
      return {pageId, placement: tabPlacementFor(state, pageId)};
    });
    let destination = windowId;
    const foreground = placements.find(item => item.pageId === state.activePageId)?.pageId ?? placements[0]?.pageId;
    let moved = 0;
    for (const placement of placements) {
      try {
        const ack = await bridge.tabCommand({
          kind: "move", pageId: placement.pageId, activate: placement.pageId === foreground,
          ...(destination ? { windowId: destination } : {}),
          ...(placement.placement ? { placement: placement.placement } : {}),
        }, get().catalogVersion);
        // The first transfer creates the window; every subsequent transfer reuses it.
        if (ack.status === "rejected" || !ack.windowId) throw new Error(ack.error?.message ?? "Aux could not confirm the destination window. Check your windows before trying again.");
        destination = ack.windowId;
        moved++;
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        throw new Error(`Window transfer stopped after confirming ${moved} of ${placements.length} tabs. Check both windows before trying again. ${reason}`);
      }
    }
  },
});
