import { bridge } from "../bridge";
import { isHomeAddress, isScrimOverlay } from "../chrome";
import { nextSidebarMode, readSidebarMode, sidebarFocusSelector } from "../sidebar-mode";
import { conversationFinder, readerFinder } from "../text-surface-find";
import { storage } from "./persistence";
import { call } from "./shared";
import type { CommandSlot, Slice, UiKeys } from "./types";

let findSequence = 0;
const TOAST_LIMIT = 4;

const zoomRequests = new Map<string, symbol>();

export const createUiSlice: Slice<UiKeys> = (set, get) => ({
  mode: "focus",
  overlay: null,
  skillSelection: null,
  readerFindOpen: false,
  settingsCategory: "General",
  memoryWorkspaceId: null,
  railOpen: false,
  railView: { kind: "home" },
  sidebar: readSidebarMode(storage?.getItem("aux.sidebar")),
  sidebarPeek: false,
  tabPreviewOpen: false,
  findText: "",
  findMatches: null,
  toasts: [],
  vaultOffer: null,
  setVaultOffer: (vaultOffer) => set({ vaultOffer }),
  translation: null,
  setTranslation: (translation) => set({ translation }),
  translationPending: null,
  peekPageId: null,
  setTranslationPending: (translationPending) => set({ translationPending }),
  resultPreview: null,
  inspectorObs: null,
  connected: false,
  focusRequest: 0,
  focusSlot: "sidebar" as CommandSlot,
  narrow: false,
  setMode: (mode) => set({ mode }),
  setNarrow: (narrow) => set({ narrow }),
  setOverlay: (overlay) => {
    if (overlay !== "find") findSequence++;
    // Zap keeps stage geometry live for the picker; its editor covers the
    // native page until picking begins.
    void bridge.overlay(isScrimOverlay(overlay) || overlay === "zap");
    if (overlay !== "reader") readerFinder.clear();
    set({ overlay, readerFindOpen: false });
  },
  showConversationInRail: (chatId) => {
    const latest = get()
      .runs.filter((run) => (run.config?.chatId ?? run.runId) === chatId)
      .sort((a, b) => b.createdAt - a.createdAt || b.runId.localeCompare(a.runId))[0];
    get().setOverlay(null);
    set({
      mode: "focus",
      railOpen: true,
      railView: latest
        ? { kind: "run", runId: latest.runId }
        : chatId
          ? { kind: "draft", chatId }
          : { kind: "home" },
    });
  },
  toggleRail: () => {
    const state = get();
    if (state.mode === "conversation" && state.conversationId !== "history")
      state.showConversationInRail(state.conversationId);
    else set({ railOpen: !state.railOpen });
  },
  openRail: (view) => set((s) => ({ railOpen: true, railView: view ?? s.railView })),
  setRailView: (railView) => set({ railView }),
  setSidebar: (sidebar) => {
    const focused = typeof document === "undefined" ? null : document.activeElement;
    // Focus relocates when the element holding it unmounts with the mode
    // change — sidebar surfaces, plus the toolbar's own reveal button.
    const moveFocus =
      focused &&
      focused instanceof HTMLElement &&
      !!focused.closest('.sidebar, .sidebar-reveal, .sidebar-rail, [aria-label="Show sidebar"]');
    storage?.setItem("aux.sidebar", sidebar);
    set({ sidebar, sidebarPeek: false });
    if (moveFocus)
      requestAnimationFrame(() => {
        const focusTarget = () => document.querySelector<HTMLElement>(sidebarFocusSelector(sidebar));
        const target = focusTarget();
        if (target) target.focus();
        // The reveal control mounts with the same render pass — wait one more
        // frame if it is not in the tree yet.
        else requestAnimationFrame(() => focusTarget()?.focus());
      });
  },
  toggleSidebar: () => {
    get().setSidebar(nextSidebarMode(get().sidebar));
  },
  setSidebarPeek: (sidebarPeek) => set({ sidebarPeek }),
  focusCommandBar: (slot) => {
    const s = get();
    const page = s.pages.byId[s.activePageId ?? ""];
    const onStart = s.mode === "focus" && !s.overlay && !page?.showBlankDocument && isHomeAddress(page?.url);
    const requested = slot ?? (onStart ? "hero" : "toolbar");
    const resolved: CommandSlot = requested === "sidebar" ? "toolbar" : requested;
    if (resolved === "toolbar" && (s.settings.tabLayout ?? "vertical") === "vertical") {
      set({ sidebar: "expanded", sidebarPeek: false });
    }
    set((st) => ({ focusRequest: st.focusRequest + 1, focusSlot: resolved }));
  },

  // Info toasts time out in <Toasts>; errors stay until dismissed.
  toast: (text, kind = "info", action) => {
    const id = Date.now() + Math.random();
    set((s) => {
      // Keep one visible notice for the same unresolved error. Action-bearing
      // notices retain their own callback and must not be merged.
      if (
        kind === "error" &&
        !action &&
        s.toasts.some((t) => t.kind === "error" && !t.action && t.text === text)
      )
        return s;
      return { toasts: [...s.toasts, { id, text, kind, ...(action ? { action } : {}) }].slice(-TOAST_LIMIT) };
    });
  },
  dismissToast: (id) =>
    set((s) => (s.toasts.some((t) => t.id === id) ? { toasts: s.toasts.filter((t) => t.id !== id) } : s)),

  zoomLevels: {},
  zoomPage: async (pageId, options = {}) => {
    const token = Symbol(pageId);
    zoomRequests.set(pageId, token);
    const origin = get().pages.byId[pageId ?? ""];
    try {
      const result = bridge.privateMode
        ? await bridge.privatePageZoom(pageId, options)
        : await call("pages.zoom", { pageId, ...options });
      const page = get().pages.byId[pageId ?? ""];
      if (
        zoomRequests.get(pageId) === token &&
        page &&
        page.url === origin?.url &&
        page.documentEpoch === origin?.documentEpoch
      )
        set((state) => ({ zoomLevels: { ...state.zoomLevels, [pageId]: result.level } }));
    } finally {
      if (zoomRequests.get(pageId) === token) zoomRequests.delete(pageId);
    }
  },

  find: async (text, findNext = false, forward = true) => {
    const id = get().activePageId;
    const sequence = ++findSequence;
    if (get().overlay === "reader") {
      const result = readerFinder.find(text, findNext, forward);
      set({ findText: text, findMatches: text ? result : null });
      return;
    }
    if (get().mode === "conversation") {
      const result = conversationFinder.find(text, findNext, forward);
      set({ findText: text, findMatches: text ? result : null });
      return;
    }
    conversationFinder.clear();
    const epoch = get().pages.byId[id ?? ""]?.documentEpoch;
    set({ findText: text, findMatches: null });
    if (!id || !text) {
      if (id) await call("pages.stopFind", { pageId: id, action: "clear" });
      return;
    }
    const r = await call("pages.find", { pageId: id, text, findNext, forward });
    if (
      sequence === findSequence &&
      get().mode !== "conversation" &&
      get().overlay === "find" &&
      get().activePageId === id &&
      get().findText === text &&
      get().pages.byId[id ?? ""]?.documentEpoch === epoch
    )
      set({ findMatches: r });
  },

  sidebarWidth: Number(storage?.getItem("aux.sb-w")) || 280,
  sidebarSections: {
    bookmarks: storage?.getItem("aux.sidebar.bookmarks") !== "closed",
    chats: storage?.getItem("aux.sidebar.chats") !== "closed",
    tabs: storage?.getItem("aux.sidebar.tabs") !== "closed",
  },
  toggleSidebarSection: (section) => {
    const open = !get().sidebarSections[section];
    storage?.setItem(`aux.sidebar.${section}`, open ? "open" : "closed");
    set({ sidebarSections: { ...get().sidebarSections, [section]: open } });
  },
  railWidth: Number(storage?.getItem("aux.rail-w")) || 400,
  setSidebarWidth: (w) => {
    storage?.setItem("aux.sb-w", String(w));
    set({ sidebarWidth: w });
  },
  setRailWidth: (w) => {
    storage?.setItem("aux.rail-w", String(w));
    set({ railWidth: w });
  },
});
