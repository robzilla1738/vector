import { splitRatio } from "@aux/contracts/split-layout";
import { bridge } from "../bridge";
import { errToast, toast } from "../store";
import { assignFolder, assignSpace, canSplitPage, createFolder, createSpace, reconcileSpaces, rememberActiveTab, removeFolder, removeSpace, renameFolder, renameSpace, reorderGroup, reorderInSpace, reorderPin, setActiveSpace, splitForPage, tabsInSpace, toggleFolder, togglePin, updateFolder } from "../workspace";
import { initialLayout, persistLayout } from "./persistence";
import { call, sendTabCommand, syncCatalogOrder } from "./shared";
import type { LayoutKeys, Slice } from "./types";

export const createLayoutSlice: Slice<LayoutKeys> = (set, get) => ({
  splitPageId: null,
  setSplitRatio: (value, persist = true) => {
    const layout = { ...get().layout, splitRatio: splitRatio(value) };
    if (persist) persistLayout(layout);
    set({ layout });
  },
  setSplitPage: (pageId) => {
    const state = get();
    if (!state.activePageId) return;
    if (pageId && (!canSplitPage(state.pages.find(page => page.pageId === pageId)) || !canSplitPage(state.pages.find(page => page.pageId === state.activePageId)))) {
      toast("Open two available browser pages in this Space to use split view."); return;
    }
    const splits = { ...state.layout.splits };
    if (pageId) splits[state.activePageId] = pageId;
    else delete splits[state.activePageId];
    const layout = { ...state.layout, splits };
    const splitPageId = splitForPage(layout, state.pages, state.activePageId);
    if (pageId && !splitPageId) return;
    persistLayout(layout);
    set({ layout, splitPageId });
  },
  layout: initialLayout,

  // ---- layout ----
  reorderTabs: (spaceId, from, to) =>
    set((s) => {
      const layout = reorderInSpace(s.layout, spaceId, from, to, s.pages);
      persistLayout(layout);
      syncCatalogOrder(layout.order, s.pages, s.catalogVersion);
      return { layout };
    }),
  moveTabs: (pageIds, spaceId, folder, beforeId) => {
    let folderId = typeof folder === "object" && folder ? undefined : folder;
    const newFolderName = typeof folder === "object" && folder ? folder.name.trim().slice(0, 200) : undefined;
    if (newFolderName === "") throw new Error("Give the folder a name.");
    const state = get();
    if (!state.layout.spaces.some(space => space.id === spaceId)) throw new Error("This Space is no longer available.");
    if (folderId && !state.layout.folders.some(folder => folder.id === folderId && folder.spaceId === spaceId)) throw new Error("This folder is no longer available.");
    const ids = new Set(pageIds);
    const targets = [...ids].flatMap(id => { const page = state.pages.find(item => item.pageId === id); return page && !page.ownedByRuntime && page.viewStatus !== "detached" ? [page] : []; });
    let layout = state.layout;
    if (newFolderName !== undefined) {
      if (!targets.length) throw new Error("The selected tabs are no longer available.");
      layout = createFolder(layout, spaceId, newFolderName);
      folderId = layout.folders.at(-1)!.id;
    }
    for (const page of targets) {
      layout = assignSpace(layout, page.pageId, spaceId);
      if (folderId !== undefined) layout = assignFolder(layout, page.pageId, folderId);
    }
    if (beforeId !== undefined) {
      const moving = new Set(targets.map(page => page.pageId));
      const order = layout.order.filter(id => !moving.has(id));
      const index = beforeId === null ? order.length : order.indexOf(beforeId);
      order.splice(index < 0 ? order.length : index, 0, ...moving);
      layout = {...layout, order};
    }
    if (folderId) layout = { ...layout, folders: layout.folders.map(folder => folder.id === folderId ? { ...folder, collapsed: false } : folder) };
    const activePageId = state.activePageId && targets.some(page => page.pageId === state.activePageId) && spaceId !== layout.activeSpaceId
      ? tabsInSpace(layout, state.pages, layout.activeSpaceId)[0]?.pageId ?? null : state.activePageId;
    persistLayout(layout);
    set({ layout, activePageId, splitPageId: splitForPage(layout, state.pages, activePageId) });
    if (activePageId && activePageId !== state.activePageId) void sendTabCommand(get, { kind: "activate", pageId: activePageId }).catch(errToast);
    if (beforeId !== undefined) syncCatalogOrder(layout.order, state.pages, state.catalogVersion);
  },
  moveTabToSpace: (pageId, spaceId) =>
    set((s) => {
      const layout = assignSpace(s.layout, pageId, spaceId);
      persistLayout(layout);
      const activePageId = s.activePageId === pageId && spaceId !== layout.activeSpaceId
        ? tabsInSpace(layout, s.pages, layout.activeSpaceId)[0]?.pageId ?? null : s.activePageId;
      if (activePageId && activePageId !== s.activePageId) void sendTabCommand(get, { kind: "activate", pageId: activePageId }).catch(errToast);
      return { layout, activePageId, splitPageId: splitForPage(layout, s.pages, activePageId) };
    }),
  syncBrowserSpaces: (spaces) => {
    const previous = get().layout.activeSpaceId;
    const layout = reconcileSpaces(get().layout, spaces);
    persistLayout(layout);
    set({ layout });
    if (previous !== layout.activeSpaceId) get().switchSpace(layout.activeSpaceId);
  },
  refreshSpaces: async () => {
    if (!bridge.privateMode) get().syncBrowserSpaces(await call("spaces.list"));
  },
  addSpace: async (name, color = "slate") => {
    if (bridge.privateMode) {
      const layout = createSpace(get().layout, name, color);
      persistLayout(layout); set({ layout });
      get().switchSpace(layout.activeSpaceId);
      return;
    }
    const previous = new Set(get().layout.spaces.map(space => space.id));
    const spaces = await call("spaces.create", { name, color });
    get().syncBrowserSpaces(spaces);
    const created = spaces.find(space => !space.archived && !previous.has(space.id));
    if (created) get().switchSpace(created.id);
  },
  editSpace: async (spaceId, name, color) => {
    if (bridge.privateMode) {
      const layout = renameSpace(get().layout, spaceId, name, color);
      persistLayout(layout); set({ layout });
      return;
    }
    get().syncBrowserSpaces(await call("spaces.update", { id: spaceId, name, color }));
  },
  deleteSpace: async (spaceId) => {
    if (bridge.privateMode) {
      const layout = removeSpace(get().layout, spaceId);
      persistLayout(layout); set({ layout });
      get().switchSpace(layout.activeSpaceId);
      return;
    }
    get().syncBrowserSpaces(await call("spaces.update", { id: spaceId, archived: true }));
    toast("Space archived. Its tabs and saved work are kept for you.");
  },
  restoreSpace: async (spaceId, activate = true) => {
    get().syncBrowserSpaces(await call("spaces.update", { id: spaceId, archived: false }));
    if(activate)get().switchSpace(spaceId);
  },
  switchSpace: (spaceId) => {
    const state = get();
    let layout = setActiveSpace(rememberActiveTab(state.layout, state.activePageId), spaceId);
    const tabs = tabsInSpace(layout, state.pages, layout.activeSpaceId);
    const activePageId = tabs.find(page => page.pageId === layout.activeTabs?.[layout.activeSpaceId])?.pageId
      ?? tabs.find(page => page.pageId === state.activePageId)?.pageId ?? tabs[0]?.pageId ?? null;
    layout = rememberActiveTab(layout, activePageId);
    persistLayout(layout);
    set({ layout, activePageId, splitPageId: splitForPage(layout, state.pages, activePageId), mode: "focus", overlay: null });
    void bridge.overlay(false);
    if (activePageId) void sendTabCommand(get, { kind: "activate", pageId: activePageId }).catch(errToast);
  },
  togglePin: (pin, spaceId) =>
    set((s) => {
      const layout = togglePin(s.layout, spaceId ?? s.layout.activeSpaceId, pin);
      persistLayout(layout);
      return { layout };
    }),
  reorderPin: (spaceId, url, beforeUrl) => set(state => {
    const layout = reorderPin(state.layout, spaceId, url, beforeUrl);
    if (layout === state.layout) return state;
    persistLayout(layout);
    return { layout };
  }),
  reorderGroup: (spaceId, folderId, from, to) =>
    set((s) => {
      const layout = reorderGroup(s.layout, spaceId, folderId, from, to, s.pages);
      persistLayout(layout);
      syncCatalogOrder(layout.order, s.pages, s.catalogVersion);
      return { layout };
    }),
  addFolder: (name) => {
    let id = "";
    set((s) => {
      const layout = createFolder(s.layout, s.layout.activeSpaceId, name);
      id = layout.folders[layout.folders.length - 1]?.id ?? "";
      persistLayout(layout);
      return { layout };
    });
    return id;
  },
  renameFolder: (folderId, name) =>
    set((s) => {
      const layout = renameFolder(s.layout, folderId, name);
      persistLayout(layout);
      return { layout };
    }),
  updateFolder: (folderId, patch) =>
    set((s) => {
      const layout = updateFolder(s.layout, folderId, patch);
      persistLayout(layout);
      return { layout };
    }),
  deleteFolder: (folderId) =>
    set((s) => {
      const layout = removeFolder(s.layout, folderId);
      persistLayout(layout);
      return { layout };
    }),
  toggleFolder: (folderId) =>
    set((s) => {
      const layout = toggleFolder(s.layout, folderId);
      persistLayout(layout);
      return { layout };
    }),
  moveTabToFolder: (pageId, folderId) =>
    set((s) => {
      const layout = assignFolder(s.layout, pageId, folderId);
      persistLayout(layout);
      return { layout };
    }),
});
