import { orderedPages } from "./pages";
import { normalizeTabName } from "@aux/contracts/tab-name-rule";
import { bridge } from "../bridge";
import { featureStage } from "../feature-availability";
import { errToast, toast } from "../store";
import {
  assignFolder,
  assignSpace,
  createFolder,
  createSpace,
  reconcileSpaces,
  rememberActiveTab,
  removeFolder,
  removeSpace,
  renameFolder,
  renameSpace,
  reorderGroup,
  reorderInSpace,
  reorderPin,
  setActiveSpace,
  splitForPage,
  tabsInSpace,
  toggleFolder,
  togglePin,
  updateFolder,
} from "../workspace";
import { initialLayout, persistLayout } from "./persistence";
import { call, sendTabCommand, syncCatalogOrder } from "./shared";
import type { LayoutKeys, Slice } from "./types";

export const createLayoutSlice: Slice<LayoutKeys> = (set, get) => ({
  splitPageId: null,
  layout: initialLayout,
  tidyUndo: initialLayout.tidyUndo ?? null,

  // ---- layout ----
  reorderTabs: (spaceId, from, to) =>
    set((s) => {
      const layout = reorderInSpace(s.layout, spaceId, from, to, orderedPages(s.pages));
      persistLayout(layout);
      syncCatalogOrder(layout.order, orderedPages(s.pages), s.catalogVersion);
      return { layout };
    }),
  moveTabs: (pageIds, spaceId, folder, beforeId) => {
    let folderId = typeof folder === "object" && folder ? undefined : folder;
    const newFolderName = typeof folder === "object" && folder ? folder.name.trim().slice(0, 200) : undefined;
    if (newFolderName === "") throw new Error("Give the folder a name.");
    const state = get();
    if (!state.layout.spaces.some((space) => space.id === spaceId))
      throw new Error("This Space is no longer available.");
    if (
      folderId &&
      !state.layout.folders.some((folder) => folder.id === folderId && folder.spaceId === spaceId)
    )
      throw new Error("This folder is no longer available.");
    const ids = new Set(pageIds);
    const targets = [...ids].flatMap((id) => {
      const page = state.pages.byId[id ?? ""];
      return page && !page.ownedByRuntime && page.viewStatus !== "detached" ? [page] : [];
    });
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
      const moving = new Set(targets.map((page) => page.pageId));
      const order = layout.order.filter((id) => !moving.has(id));
      const index = beforeId === null ? order.length : order.indexOf(beforeId);
      order.splice(index < 0 ? order.length : index, 0, ...moving);
      layout = { ...layout, order };
    }
    if (folderId)
      layout = {
        ...layout,
        folders: layout.folders.map((folder) =>
          folder.id === folderId ? { ...folder, collapsed: false } : folder,
        ),
      };
    const activePageId =
      state.activePageId &&
      targets.some((page) => page.pageId === state.activePageId) &&
      spaceId !== layout.activeSpaceId
        ? (tabsInSpace(layout, orderedPages(state.pages), layout.activeSpaceId)[0]?.pageId ?? null)
        : state.activePageId;
    persistLayout(layout);
    set({ layout, activePageId, splitPageId: splitForPage(layout, orderedPages(state.pages), activePageId) });
    if (!bridge.privateMode && featureStage("spaces") === "on")
      for (const page of targets) void bridge.bindTabSpace(page.pageId, spaceId).catch(errToast);
    if (activePageId && activePageId !== state.activePageId)
      void sendTabCommand(get, { kind: "activate", pageId: activePageId }).catch(errToast);
    if (beforeId !== undefined)
      syncCatalogOrder(layout.order, orderedPages(state.pages), state.catalogVersion);
  },
  setTabName: (pageId, expectedUrl, name) => {
    const state = get();
    const page = state.pages.byId[pageId ?? ""];
    if (
      !page ||
      page.url !== expectedUrl ||
      page.ownedByRuntime ||
      page.viewStatus === "detached" ||
      page.controller === "agent" ||
      page.controller === "external"
    )
      throw new Error("The tab changed or is controlled by an agent. Review it and try again.");
    const tabNames = { ...state.layout.tabNames };
    if (name === null) delete tabNames[pageId];
    else {
      const normalized = normalizeTabName(name);
      if (!normalized) throw new Error("Use a tab label of 2–60 characters without control characters.");
      tabNames[pageId] = { title: normalized, url: expectedUrl };
    }
    const layout = { ...state.layout, tabNames };
    persistLayout(layout);
    set({ layout });
  },
  moveTabToSpace: (pageId, spaceId) => {
    set((s) => {
      const layout = assignSpace(s.layout, pageId, spaceId);
      persistLayout(layout);
      const activePageId =
        s.activePageId === pageId && spaceId !== layout.activeSpaceId
          ? (tabsInSpace(layout, orderedPages(s.pages), layout.activeSpaceId)[0]?.pageId ?? null)
          : s.activePageId;
      if (activePageId && activePageId !== s.activePageId)
        void sendTabCommand(get, { kind: "activate", pageId: activePageId }).catch(errToast);
      return { layout, activePageId, splitPageId: splitForPage(layout, orderedPages(s.pages), activePageId) };
    });
    if (!bridge.privateMode && featureStage("spaces") === "on")
      void bridge.bindTabSpace(pageId, spaceId).catch(errToast);
  },
  syncBrowserSpaces: (spaces) => {
    const previous = get().layout.activeSpaceId;
    const layout = reconcileSpaces(get().layout, spaces);
    persistLayout(layout);
    set({ layout });
    if (previous !== layout.activeSpaceId) get().switchSpace(layout.activeSpaceId);
  },
  refreshSpaces: async (valid = () => true) => {
    if (bridge.privateMode || !valid()) return;
    const spaces = await call("spaces.list");
    if (valid()) get().syncBrowserSpaces(spaces);
  },
  addSpace: async (name, color = "slate", grain = 0, theme) => {
    if (bridge.privateMode) {
      const layout = createSpace(get().layout, name, color, grain, theme);
      persistLayout(layout);
      set({ layout });
      get().switchSpace(layout.activeSpaceId);
      return;
    }
    const previous = new Set(get().layout.spaces.map((space) => space.id));
    const spaces = await call("spaces.create", { name, color, grain, ...(theme ? { theme } : {}) });
    get().syncBrowserSpaces(spaces);
    const created = spaces.find((space) => !space.archived && !previous.has(space.id));
    if (created) get().switchSpace(created.id);
  },
  editSpace: async (spaceId, name, color, grain, theme) => {
    if (bridge.privateMode) {
      const layout = renameSpace(get().layout, spaceId, name, color, grain, theme);
      persistLayout(layout);
      set({ layout });
      return;
    }
    get().syncBrowserSpaces(await call("spaces.update", { id: spaceId, name, color, grain, theme }));
  },
  deleteSpace: async (spaceId) => {
    if (bridge.privateMode) {
      const layout = removeSpace(get().layout, spaceId);
      persistLayout(layout);
      set({ layout });
      get().switchSpace(layout.activeSpaceId);
      return;
    }
    get().syncBrowserSpaces(await call("spaces.update", { id: spaceId, archived: true }));
    toast("Space archived. Its tabs and saved work are kept for you.");
  },
  restoreSpace: async (spaceId, activate = true) => {
    get().syncBrowserSpaces(await call("spaces.update", { id: spaceId, archived: false }));
    if (activate) get().switchSpace(spaceId);
  },
  switchSpace: (spaceId) => {
    const state = get();
    let layout = setActiveSpace(rememberActiveTab(state.layout, state.activePageId), spaceId);
    const tabs = tabsInSpace(layout, orderedPages(state.pages), layout.activeSpaceId);
    const activePageId =
      tabs.find((page) => page.pageId === layout.activeTabs?.[layout.activeSpaceId])?.pageId ??
      tabs.find((page) => page.pageId === state.activePageId)?.pageId ??
      tabs[0]?.pageId ??
      null;
    layout = rememberActiveTab(layout, activePageId);
    persistLayout(layout);
    set({
      layout,
      activePageId,
      splitPageId: splitForPage(layout, orderedPages(state.pages), activePageId),
      mode: "focus",
      overlay: null,
    });
    void bridge.overlay(false);
    if (activePageId) void sendTabCommand(get, { kind: "activate", pageId: activePageId }).catch(errToast);
  },
  togglePin: (pin, spaceId) =>
    set((s) => {
      const layout = togglePin(s.layout, spaceId ?? s.layout.activeSpaceId, pin);
      persistLayout(layout);
      return { layout };
    }),
  reorderPin: (spaceId, url, beforeUrl) =>
    set((state) => {
      const layout = reorderPin(state.layout, spaceId, url, beforeUrl);
      if (layout === state.layout) return state;
      persistLayout(layout);
      return { layout };
    }),
  reorderGroup: (spaceId, folderId, from, to) =>
    set((s) => {
      const layout = reorderGroup(s.layout, spaceId, folderId, from, to, orderedPages(s.pages));
      persistLayout(layout);
      syncCatalogOrder(layout.order, orderedPages(s.pages), s.catalogVersion);
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
