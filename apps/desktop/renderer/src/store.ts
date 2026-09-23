import { clearResultDrafts } from "./result-drafts";
import { bookmarkWebUrl } from "./bookmark-files";
import { readRunAnswerDrafts, writeRunAnswerDraft, clearSubmittedRunAnswer, type RunAnswerDraft } from "./run-answer-drafts";
import { splitRatio } from "@aux/contracts/split-layout";
import { newPageId } from "@aux/contracts/ids";
import { setDictationDraft } from "./dictation-drafts";
import { conversationFinder, readerFinder } from "./text-surface-find";
import { canSplitPage, splitForPage, rememberActiveTab } from "./workspace";
import { create } from "zustand";
import { createEntryWriter, writeConversationEntry, NEW_DRAFT_KEY, PENDING_CHAT_KEY, draftKey, readConversationContexts, readConversationDrafts } from "./conversation-drafts";
import {CLOSED_TAB_LIMIT,readClosedTabs,type ClosedTab} from "./closed-tabs";
import type {
  BrowserSession,
  BrowserSpace,
  CompactObservation,
  Download,
  ModelCall,
  PageSet,
  PageTarget,
  ResultRecord,
  Run,
  SavedProgram,
  SetMember,
  StepRecord,
  AuxEvent,
  TabCatalogSnapshot,
  TabCommand,
  TabPatch,
  TabPlacement,
  TabRecord,
} from "@aux/contracts";
import { nextSidebarMode, readSidebarMode, sidebarFocusSelector, type SidebarMode } from "./sidebar-mode";
import { bridge } from "./bridge";
import { isScrimOverlay } from "./chrome";
import {
  isTab,
  tabsInSpace,
  assignFolder,
  assignSpace,
  createFolder,
  createSpace,
  emptyLayout,
  parseLayout,
  reconcileSpaces,
  removeFolder,
  removeSpace,
  renameFolder,
  updateFolder,
  renameSpace,
  reorderGroup,
  reorderPin,
  reorderInSpace,
  setActiveSpace,
  syncLayout,
  syncOrder,
  withSyncedOrder,
  toggleFolder,
  togglePin,
  type Folder,
  type Layout,
  type Pin,
  type Space,
  type SpaceColor,
} from "./workspace";

let findSequence = 0;
const TOAST_LIMIT = 4;
/** Highest runtime event seq applied — refresh() ordering only, never rendered. */
let eventSeq = 0;
export const lastEventSeq = () => eventSeq;
const pageRevisions = new Map<string, number>();
const answerSeq = new Map<string, number>();
/** Tabs this window removed ahead of main's confirmation — late upserts must not resurrect them. */
const closingOptimistic = new Set<string>();
/** Tabs this window opened ahead of main's confirmation — removed again if the open is refused. */
const openingOptimistic = new Set<string>();
export const pageRevision = (pageId: string) => pageRevisions.get(pageId);
/** Page previews stay out of reactive state; `previewVersion` announces changes. */
const previewCache = new Map<string, string>();
export const pagePreview = (pageId: string) => previewCache.get(pageId);
const forgetPreview = (pageId: string) => {
  const url = previewCache.get(pageId);
  if (url === undefined) return false;
  if (url.startsWith("blob:")) URL.revokeObjectURL(url);
  previewCache.delete(pageId);
  pageRevisions.delete(pageId);
  return true;
};

/** IPC delivers fresh objects every time — small records compare by content. */
const sameValue = (a: unknown, b: unknown) => a === b || (!!a && !!b && typeof a === "object" && typeof b === "object" && JSON.stringify(a) === JSON.stringify(b));

/** Shallow-merge fields into one page; the same state when nothing changes. */
function patchPage<S extends { pages: PageTarget[] }>(st: S, pageId: string, fields: Partial<PageTarget>): S | { pages: PageTarget[] } {
  const index = st.pages.findIndex((p) => p.pageId === pageId);
  const page = index >= 0 ? st.pages[index]! : undefined;
  if (!page || Object.entries(fields).every(([key, value]) => sameValue(page[key as keyof PageTarget], value))) return st;
  return { pages: st.pages.with(index, { ...page, ...fields }) };
}
const zoomRequests = new Map<string,symbol>();

export type Mode = "focus" | "overview" | "table" | "conversation";
export type Overlay = null | "reader" | "palette" | "settings" | "find" | "downloads" | "history" | "clear-history" | "observe" | "tasks" | "bookmarks" | "site";
export type { SidebarMode } from "./sidebar-mode";
export type CommandSlot = "sidebar" | "hero" | "toolbar";
export type RailView = { kind: "home" } | { kind: "draft"; chatId: string } | { kind: "run"; runId: string } | { kind: "set"; setId: string };

export const LIVE_RUN = new Set(["queued", "planning", "running", "paused", "needs_input"]);
export const isLive = (r: Pick<Run, "status">) => LIVE_RUN.has(r.status);

export interface RunModelStats {
  calls: number;
  costUsd: number;
  costEstimated: boolean;
  inputTokens: number;
  outputTokens: number;
  modelIds: string[];
  providers: string[];
  destinations: string[];
  costComplete: boolean;
}

interface Workspace {
  pages: PageTarget[];
  sets: PageSet[];
  members: SetMember[];
  runs: Run[];
  sessions: BrowserSession[];
  programs: SavedProgram[];
  activePageId: string | null;

  mode: Mode;
  conversationId: string | null;
  conversationContexts: Record<string, string>;
  setConversationContext(id: string | null, pageId: string): void;
  openConversation(runId: string | null): void;
  openConversationDraft(chatId: string | null): void;
  showConversationInRail(chatId: string | null): void;
  overlay: Overlay;
  readerFindOpen: boolean;
  settingsCategory: string;
  memoryWorkspaceId: string | null;
  railOpen: boolean;
  railView: RailView;
  sidebar: SidebarMode;
  /** sidebar peeked open while collapsed to the thin rail */
  sidebarPeek: boolean;
  findText: string;
  findMatches: { matches: number; activeMatch?: number } | null;
  activeSetId: string | null;
  results: ResultRecord[];
  steps: Record<string, StepRecord[]>;
  modelStats: Record<string, RunModelStats>;
  /** latest compact observation seen per run (from step artifacts or live observe) */
  observations: Record<string, CompactObservation>;
  /** bumps when the non-reactive page preview cache changes (see pagePreview) */
  previewVersion: number;
  prompt: { runId: string; question: string } | null;
  runAnswerDrafts: Record<string, RunAnswerDraft>;
  setRunAnswerDraft(runId:string,question:string,text:string):void;
  runAnswerPending: Record<string, boolean>;
  retryingRuns: Record<string,boolean>;
  settings: Record<string, unknown>;
  agentDraft: string;
  setAgentDraft(text: string): void;
  conversationDrafts: Record<string, string>;
  setConversationDraft(id: string, text: string): void;
  bookmarkPending: Record<string, boolean>;
  toggleBookmark(url: string, title: string): Promise<void>;
  toggleReadingList(url: string, title: string): Promise<void>;
  bookmarks: { url: string; title: string; folderPath?: string[]; readingList?: boolean; readAt?: number; offline?: boolean }[];
  closedTabs: ClosedTab[];
  reopeningTab: boolean;
  downloads: Download[];
  tabAudio: Record<string,{muted:boolean;audible:boolean}>;
  toasts: { id: number; text: string; kind: "info" | "error" }[];
  dismissToast(id: number): void;
  vaultOffer: import("./bridge").VaultOffer | null;
  setVaultOffer(offer: Workspace["vaultOffer"]): void;
  /** Active in-place page translation for the focused tab. */
  translation: { pageId: string; lang: string; count: number; truncated: boolean } | null;
  setTranslation(translation: Workspace["translation"]): void;
  /** Page currently being translated — drives the bar's progress state. */
  translationPending: string | null;
  setTranslationPending(pageId: string | null): void;
  splitPageId: string | null;
  setSplitPage(pageId: string | null): void;
  setSplitRatio(value: number, persist?: boolean): void;
  resultPreview: string | null;
  inspectorObs: unknown | null;
  connected: boolean;
  restoringTabs: boolean;
  pendingRestoreIds: string[];
  /** bumps each time something asks the command bar to take focus */
  focusRequest: number;
  focusSlot: CommandSlot;
  /** `/query` from the omnibox seeds the command palette's shared registry. */
  paletteSeed: string;
  /** window is too narrow for sidebar + stage + agent rail side by side */
  narrow: boolean;
  layout: Layout;

  setMode(m: Mode): void;
  setNarrow(v: boolean): void;
  setOverlay(o: Overlay): void;
  toggleRail(): void;
  openRail(view?: RailView): void;
  setRailView(v: RailView): void;
  setSidebar(m: SidebarMode): void;
  toggleSidebar(): void;
  setSidebarPeek(v: boolean): void;
  focusCommandBar(slot?: CommandSlot): void;
  activate(pageId: string): Promise<void>;
  navigatePage(pageId: string, url: string): Promise<void>;
  find(text: string, findNext?: boolean, forward?: boolean): Promise<void>;
  zoomLevels: Record<string, number>;
  zoomPage(pageId: string, options?: { level?: number; delta?: number; reset?: boolean; direction?: "in" | "out" }): Promise<void>;
  newTab(url?: string, reuseId?: string, index?: number): Promise<PageTarget | null>;
  openBackgroundTab(url: string, spaceId: string, reuseExisting?: boolean, reuseId?: string, index?: number): Promise<PageTarget>;
  closeTab(pageId: string): Promise<void>;
  duplicateTab(pageId: string): Promise<void>;
  closingTabs: boolean;
  closeTabs(pageIds: string[], options?: { shouldStop?(): boolean; onClosed?(pageId: string, count: number): void }): Promise<boolean>;
  reopenClosedTab(pageId?: string, group?: boolean): Promise<void>;
  /** `ownsDraft`: the caller already cleared its composer and restores it on failure. */
  startRun(goal: string, opts?: { pageId?: string | null; scope?: "page" | "new"; chatId?: string; presentation?: "rail" | "conversation"; ownsDraft?: boolean }): Promise<Run | null>;
  /** Messages shown in the thread while their run is still being created. */
  pendingTurns: { id: string; chatId: string | null; goal: string; createdAt: number }[];
  /** Live answer text streamed by `run.answer.delta`, dropped once the run settles. */
  answerStreams: Record<string, string>;
  retryRun(runId: string, pageId?: string): Promise<Run | null>;
  answerRun(runId: string, answer: string): Promise<void>;
  returnControl(pageId: string): Promise<void>;
  loadRun(runId: string): Promise<void>;

  // layout
  reorderTabs(spaceId: string, from: number, to: number): void;
  reorderGroup(spaceId: string, folderId: string | null, from: number, to: number): void;
  moveTabToSpace(pageId: string, spaceId: string): void;
  moveTabs(pageIds: string[], spaceId: string, folderId?: string | { name: string } | null, beforeId?: string | null): void;
  moveTabToWindow(pageId: string, windowId?: string): Promise<void>;
  moveTabsToWindow(pageIds: string[], windowId?: string): Promise<void>;
  addSpace(name: string, color?: SpaceColor): Promise<void>;
  editSpace(spaceId: string, name: string, color?: SpaceColor): Promise<void>;
  deleteSpace(spaceId: string): Promise<void>;
  restoreSpace(spaceId: string, activate?:boolean): Promise<void>;
  syncBrowserSpaces(spaces: BrowserSpace[]): void;
  refreshSpaces(): Promise<void>;
  switchSpace(spaceId: string): void;
  togglePin(pin: Pin, spaceId?: string): void;
  reorderPin(spaceId: string, url: string, beforeUrl: string | null): void;
  addFolder(name: string): string;
  renameFolder(folderId: string, name: string): void;
  updateFolder(folderId: string, patch: { name?: string; color?: SpaceColor | null; emoji?: string | null }): void;
  deleteFolder(folderId: string): void;
  toggleFolder(folderId: string): void;
  moveTabToFolder(pageId: string, folderId: string | null): void;

  sidebarWidth: number;
  sidebarSections: Record<"bookmarks" | "chats" | "tabs", boolean>;
  toggleSidebarSection(section: "bookmarks" | "chats" | "tabs"): void;
  railWidth: number;
  setSidebarWidth(w: number): void;
  setRailWidth(w: number): void;
  applyEvent(e: AuxEvent): void;
  applyDownload(d: Download): void;
  /** last applied catalog patch version — gap detection for the patch stream */
  catalogVersion: number;
  applyTabsPatch(patch: TabPatch): void;
  syncTabsSnapshot(snapshot: TabCatalogSnapshot): void;
  /** Workspace placement relayed with a `move` — the destination window files
   *  the arriving tab into the Space/folder the source window chose. */
  applyTabsPlacement(payload: { pageId: string; windowId: string; placement: TabPlacement }): void;
  resyncTabs(): Promise<void>;
  toast(text: string, kind?: "info" | "error"): void;
  refresh(): Promise<void>;
  refreshResults(setId: string): Promise<void>;
}

async function call<T>(method: string, params?: unknown): Promise<T> {
  return (await bridge.invoke(method, params)) as T;
}

/** Typed human tab command (§7.2) — main actuates, the patch stream confirms. */
export async function tabCommand(command: TabCommand): Promise<void> {
  // Focus is existence-only: an activate aimed at a tab this renderer just
  // opened must not bounce off the stale_tab gate while its upsert patch is
  // still in flight. Mutating commands keep the version guard.
  const catalogVersion = command.kind === "activate" ? undefined : useStore.getState().catalogVersion;
  const ack = await bridge.tabCommand(command, catalogVersion);
  if (ack.status === "rejected") throw new Error(ack.error?.message ?? "This tab command was rejected.");
}

/** Catalog → PageTarget for a tab the runtime has not announced yet. */
const pageFromTab = (tab: TabRecord): PageTarget => ({
  pageId: tab.pageId,
  windowId: tab.windowId,
  backend: "aux",
  targetId: `atab-${tab.pageId}`,
  url: tab.url,
  title: tab.title,
  favicon: tab.favicon,
  documentEpoch: 0,
  lastRevision: 0,
  viewStatus: tab.crashed ? "crashed" : "hidden",
  lifecycle: tab.lifecycle,
  controller: "none",
  controllerEpoch: 0,
  ownedByRuntime: tab.runtimeOwned,
  createdAt: tab.createdAt,
  lastActiveAt: tab.lastActiveAt,
  loading: tab.loading,
  canGoBack: tab.canGoBack,
  canGoForward: tab.canGoForward,
  navigationError: tab.navigationError ?? null,
});

/**
 * Overlay catalog-owned fields on a live target. Runtime-owned fields —
 * controller, epochs, documentEpoch, driver state — are never touched here.
 */
const mergeTabInto = (page: PageTarget, tab: TabRecord): PageTarget => {
  const merged = mergedTab(page, tab);
  for (const key in merged) if (!sameValue(merged[key as keyof PageTarget], page[key as keyof PageTarget])) return merged;
  return page;
};
const mergedTab = (page: PageTarget, tab: TabRecord): PageTarget => ({
  ...page,
  windowId: tab.windowId,
  url: tab.url,
  // The runtime owns the error-page title ("Page couldn't load") — the catalog
  // only knows Electron's last live title, which is stale once a page errors.
  title: tab.navigationError ? page.title || tab.title : tab.title,
  favicon: tab.favicon ?? page.favicon,
  loading: tab.loading,
  canGoBack: tab.canGoBack,
  canGoForward: tab.canGoForward,
  navigationError: tab.navigationError ?? null,
  lastActiveAt: tab.lastActiveAt,
  viewStatus: tab.crashed ? "crashed" : page.viewStatus === "crashed" ? "hidden" : page.viewStatus,
  lifecycle: tab.lifecycle ?? "live",
});

/** Push the window's strip order to the catalog — the window op echo converges the rest. */
const syncCatalogOrder = (order: string[], pages: PageTarget[], catalogVersion: number) =>
  void bridge.tabCommand({ kind: "reorder", order: order.filter(id => pages.some(page => page.pageId === id && (page.windowId ?? "main") === bridge.windowId)) }, catalogVersion).catch(() => {});

/** Space/folder snapshot carried on a move so the destination window can file the tab. */
const tabPlacementFor = (state: { layout: Workspace["layout"] }, pageId: string): TabPlacement | undefined => {
  const spaceId = state.layout.tabSpace[pageId] ?? state.layout.activeSpaceId;
  const space = [...state.layout.spaces, ...(state.layout.archivedSpaces ?? [])].find(item => item.id === spaceId);
  if (!space) return undefined;
  const folder = state.layout.folders.find(item => item.id === state.layout.tabFolder[pageId]);
  return {
    space: { id: space.id, name: space.name, color: space.color, ...(space.workspaceId ? { workspaceId: space.workspaceId } : {}) },
    ...(folder ? { folder: { id: folder.id, name: folder.name, spaceId: folder.spaceId, collapsed: folder.collapsed, ...(folder.color ? { color: folder.color } : {}), ...(folder.emoji ? { emoji: folder.emoji } : {}) } } : {}),
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

/**
 * Everything a removal touches — shared by the runtime `page.removed` event
 * and catalog `remove` ops. Returns the state pieces plus the tab the caller
 * should activate when nothing else already chose a successor.
 */
function applyRemoval(st: Workspace, id: string, activeHint: string | null) {
  const group = closingGroups.get(id);
  closingGroups.delete(id);
  const gone = st.pages.find(p => p.pageId === id);
  const closedTabs = gone && isTab(gone) && gone.url && gone.url !== "about:blank" && !st.closedTabs.some(tab => tab.pageId === id)
    ? [...st.closedTabs, {
      pageId: gone.pageId, url: gone.url, title: gone.title,
      spaceId: st.layout.tabSpace[id] ?? st.layout.activeSpaceId,
      folderId: st.layout.tabFolder[id], index: Math.max(0, st.layout.order.indexOf(id)), closedAt: Date.now(), ...group,
    }].slice(-CLOSED_TAB_LIMIT) : st.closedTabs;
  if (closedTabs !== st.closedTabs) persistClosedTabs(closedTabs);
  const previewVersion = forgetPreview(id) ? st.previewVersion + 1 : st.previewVersion;
  const zoomLevels = { ...st.zoomLevels };
  delete zoomLevels[id];
  const pages = st.pages.filter(p => p.pageId !== id);
  // closing the active tab focuses its neighbour, like every browser
  let activePageId = st.activePageId;
  let activateNext: string | undefined;
  if (activePageId === id) {
    if (activeHint && pages.some(page => page.pageId === activeHint && st.layout.tabSpace[activeHint] === st.layout.activeSpaceId)) {
      activePageId = activeHint;
    } else {
      const visible = tabsInSpace(st.layout, st.pages, st.layout.activeSpaceId).map(page => page.pageId);
      const order = visible.filter(pageId => pageId !== id);
      const idx = visible.indexOf(id);
      activePageId = order[Math.min(Math.max(idx, 0), order.length - 1)] ?? order[order.length - 1] ?? null;
      activateNext = activePageId ?? undefined;
    }
  }
  const layout = withSyncedOrder(st.layout, pages, st.pendingRestoreIds);
  persistLayout(layout);
  return {
    next: { pages, closedTabs, previewVersion, zoomLevels, layout, splitPageId: splitForPage(layout, pages, activePageId), activePageId },
    activateNext,
  };
}

/** artifacts.read returns base64 of UTF-8 bytes — atob alone would mangle anything outside Latin-1 */
export function decodeBase64Json<T>(b64: string): T {
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as T;
}

const LAYOUT_KEY = `aux.layout.v1:${bridge.windowId}`;
const CLOSED_TABS_KEY=`aux.closed-tabs.v1:${bridge.windowId}`;
const storage = typeof localStorage !== "undefined" ? localStorage : null;
let lastPersistedLayout = storage?.getItem(LAYOUT_KEY) ?? null;
let pendingLayout: Layout | null = null;
let layoutTimer: ReturnType<typeof setTimeout> | undefined;
/** Write the latest scheduled layout now — also runs before the window unloads. */
export const flushLayout = () => {
  clearTimeout(layoutTimer); layoutTimer = undefined;
  const layout = pendingLayout; pendingLayout = null;
  if (!layout) return;
  const json = JSON.stringify(layout);
  if (json === lastPersistedLayout) return;
  lastPersistedLayout = json;
  try { storage?.setItem(LAYOUT_KEY, json); } catch { /* The live layout stays in memory. */ }
};
/** Layout writes coalesce: bursts of patches serialize and store once. */
const persistLayout = (l: Layout) => {
  pendingLayout = l;
  layoutTimer ??= setTimeout(flushLayout, 250);
};
if (typeof window !== "undefined") window.addEventListener("pagehide", flushLayout);
const persistClosedTabs=(tabs:ClosedTab[])=>{if(bridge.privateMode)return;try{storage?.setItem(CLOSED_TABS_KEY,JSON.stringify(tabs));}catch{/* Recovery remains available for this window. */}};
const initialLayout = (() => {
  if (!storage) return emptyLayout();
  const current = storage.getItem(LAYOUT_KEY);
  const legacy = bridge.windowId === "main" ? storage.getItem("aux.layout.v1") : null;
  const layout = parseLayout(current ?? legacy);
  if (!current && legacy) persistLayout(layout);
  return layout;
})();

let draftStorageWarned = false;
const draftWriter = createEntryWriter(storage, () => { if (!draftStorageWarned) { draftStorageWarned = true; toast("Your draft is kept in this window, but could not be saved for restart.", "error"); } });
if (typeof window !== "undefined") window.addEventListener("pagehide", draftWriter.flush);
const emptyStats = (): RunModelStats => ({ calls: 0, costUsd: 0, costEstimated: false, inputTokens: 0, outputTokens: 0, modelIds: [], providers: [], destinations: [], costComplete: true });
const modelAuxValue = (call: Partial<ModelCall> | undefined, key: "provider" | "destination") => {
  const aux = call?.providerMetadata?.aux;
  if (!aux || typeof aux !== "object" || Array.isArray(aux)) return undefined;
  const value = (aux as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
};

const closingGroups = new Map<string, {groupId: string; index: number; wasActive: boolean}>();
/** one in-flight catalog resync per shell — gap storms collapse into a single fetch */
let tabsResyncing = false;

export const useStore = create<Workspace>((set, get) => ({
  pages: [],
  sets: [],
  members: [],
  runs: [],
  sessions: [],
  programs: [],
  activePageId: null,
  mode: "focus",
  conversationId: null,
  conversationContexts: readConversationContexts(storage),
  setConversationContext: (id,pageId) => {
    const contexts={...get().conversationContexts};const key=id?draftKey(id):"new";
    if(pageId)contexts[key]=pageId;else delete contexts[key];set({conversationContexts:contexts});
    try{writeConversationEntry(storage,"context",key,pageId??"");}
    catch{if(!draftStorageWarned){draftStorageWarned=true;toast("Your composer context is kept in this window, but could not be saved for restart.","error");}}
  },
  openConversation: (runId) => {
    const run = get().runs.find(r => r.runId === runId);
    void bridge.overlay(false);
    set({ resultPreview: null, mode: "conversation", conversationId: run ? run.config?.chatId ?? run.runId : null, railOpen: false, overlay: null, ...(run?{}:{railView:{kind:"home"} as RailView}) });
  },
  openConversationDraft: (chatId) => {
    try {
      if (chatId) storage?.setItem(PENDING_CHAT_KEY, chatId);
      else storage?.removeItem(PENDING_CHAT_KEY);
    } catch { /* Drafts remain available in this window. */ }
    void bridge.overlay(false);
    set({ resultPreview: null, mode: "conversation", conversationId: chatId, railOpen: false, overlay: null });
  },
  overlay: null,
  readerFindOpen: false,
  settingsCategory: "General",
  memoryWorkspaceId: null,
  railOpen: false,
  railView: { kind: "home" },
  sidebar: readSidebarMode(storage?.getItem("aux.sidebar")),
  sidebarPeek: false,
  findText: "",
  findMatches: null,
  activeSetId: null,
  results: [],
  steps: {},
  modelStats: {},
  observations: {},
  previewVersion: 0,
  prompt: null,
  runAnswerDrafts: readRunAnswerDrafts(bridge.privateMode ? null : storage),
  setRunAnswerDraft: (runId,question,text) => {
    const run=get().runs.find(item=>item.runId===runId);
    const draft={question,text:text.slice(0,20000),chatId:run?.config?.chatId ?? runId};
    set(state=>{const drafts={...state.runAnswerDrafts};if(draft.text)drafts[runId]=draft;else delete drafts[runId];return {runAnswerDrafts:drafts};});
    try { writeRunAnswerDraft(bridge.privateMode ? null : storage,runId,draft); }
    catch { if(!draftStorageWarned) { draftStorageWarned=true;toast("Your answer is kept in this window, but could not be saved for restart.","error"); } }
  },
  runAnswerPending: {},
  retryingRuns: {},
  settings: {},
  agentDraft: readConversationDrafts(storage)[NEW_DRAFT_KEY] ?? "",
  setAgentDraft: text => {
    const drafts={...get().conversationDrafts};if(text)drafts[NEW_DRAFT_KEY]=text;else delete drafts[NEW_DRAFT_KEY];set({agentDraft:text,conversationDrafts:drafts});
    draftWriter.write("draft",NEW_DRAFT_KEY,text);
  },
  conversationDrafts: readConversationDrafts(storage),
  setConversationDraft: (id, text) => {
    const drafts = { ...get().conversationDrafts };
    if (text) drafts[draftKey(id)] = text;
    else delete drafts[draftKey(id)];
    set({ conversationDrafts: drafts });
    draftWriter.write("draft",draftKey(id),text);
  },
  bookmarks: [],
  bookmarkPending: {},
  toggleBookmark: async (url, title) => {
    if (bridge.privateMode || !bookmarkWebUrl(url) || get().bookmarkPending[url]) return;
    const saved = get().bookmarks.some(item => item.url === url);
    set(state => ({bookmarkPending: {...state.bookmarkPending, [url]: true}}));
    try {
      await call(saved ? "bookmarks.remove" : "bookmarks.add", {url, title});
      // The runtime event owns the list, including folder placement and changes
      // from other windows. Appending here would duplicate an already applied event.
      get().toast(saved ? "Bookmark removed" : "Bookmarked");
    } finally {
      set(state => {const bookmarkPending = {...state.bookmarkPending}; delete bookmarkPending[url]; return {bookmarkPending};});
    }
  },
  toggleReadingList: async (url, title) => {
    if (bridge.privateMode || !bookmarkWebUrl(url) || get().bookmarkPending[url]) return;
    const saved = get().bookmarks.find(item => item.url === url);
    set(state => ({bookmarkPending: {...state.bookmarkPending, [url]: true}}));
    try {
      await call("bookmarks.readingList", {url, readingList: !saved?.readingList, title});
      // Same contract as toggleBookmark — the runtime event owns list updates.
      get().toast(saved?.readingList ? "Removed from reading list" : "Added to reading list");
    } finally {
      set(state => {const bookmarkPending = {...state.bookmarkPending}; delete bookmarkPending[url]; return {bookmarkPending};});
    }
  },
  closedTabs: bridge.privateMode?[]:readClosedTabs(storage,CLOSED_TABS_KEY),
  reopeningTab: false,
  downloads: [],
  tabAudio: {},
  toasts: [],
  vaultOffer: null,
  setVaultOffer: (vaultOffer) => set({ vaultOffer }),
  translation: null,
  setTranslation: (translation) => set({ translation }),
  translationPending: null,
  setTranslationPending: (translationPending) => set({ translationPending }),
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
  resultPreview: null,
  inspectorObs: null,
  connected: false,
  restoringTabs: true,
  pendingRestoreIds: [],
  focusRequest: 0,
  focusSlot: "sidebar" as CommandSlot,
  paletteSeed: "",
  narrow: false,
  layout: initialLayout,

  setMode: (mode) => set({ mode }),
  setNarrow: (narrow) => set({ narrow }),
  setOverlay: (overlay) => {
    if (overlay !== "find") findSequence++;
    void bridge.overlay(isScrimOverlay(overlay));
    if (overlay !== "reader") readerFinder.clear();
    set({ overlay, readerFindOpen: false });
  },
  showConversationInRail: chatId => {
    const latest = get().runs.filter(run => (run.config?.chatId ?? run.runId) === chatId)
      .sort((a, b) => b.createdAt - a.createdAt || b.runId.localeCompare(a.runId))[0];
    get().setOverlay(null);
    set({ mode: "focus", railOpen: true, railView: latest ? {kind:"run",runId:latest.runId}
      : chatId ? {kind:"draft",chatId} : {kind:"home"} });
  },
  toggleRail: () => {
    const state = get();
    if (state.mode === "conversation" && state.conversationId !== "history") state.showConversationInRail(state.conversationId);
    else set({railOpen:!state.railOpen});
  },
  openRail: (view) => set((s) => ({ railOpen: true, railView: view ?? s.railView })),
  setRailView: (railView) => set({ railView }),
  setSidebar: (sidebar) => {
    const focused = typeof document === 'undefined' ? null : document.activeElement;
    // Focus relocates when the element holding it unmounts with the mode
    // change — sidebar surfaces, plus the toolbar's own reveal button.
    const moveFocus = focused && focused instanceof HTMLElement && !!focused.closest('.sidebar, .sidebar-reveal, .sidebar-rail, [aria-label="Show sidebar"]');
    storage?.setItem("aux.sidebar", sidebar);
    set({ sidebar, sidebarPeek: false });
    if (moveFocus) requestAnimationFrame(() => {
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
    const page = s.pages.find((p) => p.pageId === s.activePageId);
    const onStart = s.mode === "focus" && !s.overlay && !page?.showBlankDocument && (!page?.url || page.url === "about:blank");
    const requested = slot ?? (onStart ? "hero" : "toolbar");
    const resolved: CommandSlot = requested === "sidebar" ? "toolbar" : requested;
    set((st) => ({ focusRequest: st.focusRequest + 1, focusSlot: resolved }));
  },

  // Info toasts time out in <Toasts>; errors stay until dismissed.
  toast: (text, kind = "info") => {
    const id = Date.now() + Math.random();
    set((s) => ({ toasts: [...s.toasts, { id, text, kind }].slice(-TOAST_LIMIT) }));
  },
  dismissToast: (id) => set((s) => (s.toasts.some((t) => t.id === id) ? { toasts: s.toasts.filter((t) => t.id !== id) } : s)),

  applyDownload: (d) =>
    set((s) => {
      const rest = s.downloads.filter((x) => x.id !== d.id);
      return { downloads: [d, ...rest].slice(0, 200) };
    }),

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
          if (tab.windowId !== bridge.windowId) {
            // The tab moved to another window — a transfer, not a close, so
            // no closed-tabs bookkeeping; the page.moved event does layout.
            if (pages.some(page => page.pageId === tab.pageId)) {
              pages = pages.filter(page => page.pageId !== tab.pageId);
              layout = withSyncedOrder(layout, pages, st.pendingRestoreIds);
              if (activePageId === tab.pageId) activePageId = tabsInSpace(layout, pages, layout.activeSpaceId)[0]?.pageId ?? null;
              splitPageId = splitForPage(layout, pages, activePageId);
              layoutDirty = true;
            }
            continue;
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
          const order = reconcileWindowOrder(layout.order, op.window.order, pages, st.pendingRestoreIds);
          if (order.join() !== layout.order.join()) { layout = { ...layout, order }; layoutDirty = true; }
          activePageId = op.window.activePageId;
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
      const tabs = snapshot.tabs.filter(tab => tab.windowId === bridge.windowId);
      const known = new Set(tabs.map(tab => tab.pageId));
      // The catalog is authoritative for this window's human tab set; pages it
      // does not own (runtime workers, other windows) are left to the runtime.
      const pages = st.pages.filter(page => known.has(page.pageId) || page.ownedByRuntime || (page.windowId ?? "main") !== bridge.windowId);
      for (const tab of tabs) {
        const existing = pages.find(page => page.pageId === tab.pageId);
        if (!existing) pages.push(pageFromTab(tab));
        else pages[pages.indexOf(existing)] = mergeTabInto(existing, tab);
      }
      const mine = snapshot.windows.find(window => window.windowId === bridge.windowId);
      let layout = st.layout;
      if (!st.restoringTabs) layout = syncLayout(layout, pages, st.pendingRestoreIds);
      if (mine) layout = rememberActiveTab({ ...layout, order: reconcileWindowOrder(layout.order, mine.order, pages, st.pendingRestoreIds) }, mine.activePageId);
      persistLayout(layout);
      const activePageId = mine ? mine.activePageId : st.activePageId;
      return { pages, layout, activePageId, splitPageId: splitForPage(layout, pages, activePageId), catalogVersion: snapshot.version };
    });
  },

  applyTabsPlacement: ({ pageId, windowId, placement }) => {
    if (windowId !== bridge.windowId) return;
    set(s => {
      if (!s.pages.some(page => page.pageId === pageId)) return {};
      const space: Space = { id: placement.space.id, name: placement.space.name, color: placement.space.color as SpaceColor, ...(placement.space.workspaceId ? { workspaceId: placement.space.workspaceId } : {}) };
      let layout = s.layout.spaces.some(item => item.id === space.id) ? s.layout
        : { ...s.layout, spaces: [...s.layout.spaces, space], archivedSpaces: s.layout.archivedSpaces?.filter(item => item.id !== space.id) };
      layout = assignSpace(layout, pageId, space.id);
      if (placement.folder) {
        const folder: Folder = { ...placement.folder, color: placement.folder.color as SpaceColor | undefined };
        if (!layout.folders.some(item => item.id === folder.id)) layout = { ...layout, folders: [...layout.folders, folder] };
        layout = assignFolder(layout, pageId, folder.id);
      }
      persistLayout(layout);
      return { layout };
    });
  },

  resyncTabs: async () => {
    if (tabsResyncing) return;
    tabsResyncing = true;
    try {
      const result = await bridge.tabsSince(get().catalogVersion);
      if (result.kind === "snapshot") get().syncTabsSnapshot(result.snapshot);
      else for (const patch of result.patches) get().applyTabsPatch(patch);
    } catch {
      /* the next patch re-triggers the resync */
    } finally {
      tabsResyncing = false;
    }
  },

  activate: async (pageId) => {
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
    await tabCommand({ kind: "activate", pageId });
  },

  navigatePage: async (pageId, url) => {
    // Reveal the destination before loading. A failure belongs in the browser,
    // and a slow response must never select this tab over a newer user selection.
    await get().activate(pageId);
    try { await tabCommand({ kind: "navigate", pageId, url }); }
    catch (reason) {
      const page = get().pages.find(page => page.pageId === pageId);
      if (page?.navigationError?.url !== url) throw reason;
      // The native failure is already presented with retry/edit/back controls.
    }
  },

  zoomLevels: {},
  zoomPage: async (pageId, options = {}) => {
    const token=Symbol(pageId);
    zoomRequests.set(pageId,token);
    const origin=get().pages.find(page=>page.pageId===pageId);
    try{
      const result = await call<{ level: number }>("pages.zoom", { pageId, ...options });
      const page=get().pages.find(page=>page.pageId===pageId);
      if(zoomRequests.get(pageId)===token&&page&&page.url===origin?.url&&page.documentEpoch===origin?.documentEpoch)
        set(state => ({ zoomLevels: { ...state.zoomLevels, [pageId]: result.level } }));
    }finally{if(zoomRequests.get(pageId)===token)zoomRequests.delete(pageId);}
  },

  newTab: async (url = "about:blank", reuseId?: string, index?: number) => {
    // Optimistic: the row and the start page appear now under a renderer-minted
    // id that main adopts; a refused open removes the placeholder again.
    const pageId = reuseId ?? newPageId();
    const before = get();
    const optimistic = !before.pages.some(page => page.pageId === pageId);
    const observed = new Set(before.pages.map(page => page.pageId));
    const unsubscribe = useStore.subscribe(state => { for (const page of state.pages) observed.add(page.pageId); });
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
    const unsubscribe = useStore.subscribe(state => { for (const page of state.pages) observed.add(page.pageId); });
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
      return get().pages.find(item => item.pageId === pageId) ?? stub;
    } finally { unsubscribe(); }
  },

  reopenClosedTab: async (pageId, group = false) => {
    const latest = pageId ? get().closedTabs.find(tab => tab.pageId === pageId) : get().closedTabs.at(-1);
    if (!latest || get().reopeningTab) return;
    const entries = (!pageId || group) && latest.groupId ? get().closedTabs.filter(tab => tab.groupId === latest.groupId).sort((a, b) => a.index - b.index) : [latest];
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
      const unsub = useStore.subscribe(state => { if (state.pages.some(item => item.pageId === id)) { clearTimeout(timer); unsub(); resolve(true); } });
    });
    try {
      for (const entry of entries) {
        if (get().layout.archivedSpaces?.some(space => space.id === entry.spaceId)) {
          get().syncBrowserSpaces(await call<BrowserSpace[]>("spaces.update", { id: entry.spaceId, archived: false }));
        }
        const destinationSpace = get().layout.spaces.some(space => space.id === entry.spaceId) ? entry.spaceId : get().layout.activeSpaceId;
        let page = entries.length > 1
          ? await get().openBackgroundTab(entry.url, destinationSpace, false, entry.pageId, entry.index)
          : await get().newTab(entry.url, entry.pageId, entry.index);
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
      const focus = foreground ?? (entries.length > 1 ? lastOpened : undefined);
      if (focus && get().pages.some(page => page.pageId === focus)) await get().activate(focus);
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
      await tabCommand({ kind: "close", pageId });
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

  find: async (text, findNext = false, forward = true) => {
    const id = get().activePageId;
    const sequence = ++findSequence;
    if (get().overlay === "reader") {
      const result = readerFinder.find(text, findNext, forward);
      set({findText:text,findMatches:text ? result : null});
      return;
    }
    if (get().mode === "conversation") {
      const result = conversationFinder.find(text, findNext, forward);
      set({findText:text,findMatches:text ? result : null});
      return;
    }
    conversationFinder.clear();
    const epoch = get().pages.find(page => page.pageId === id)?.documentEpoch;
    set({ findText: text, findMatches: null });
    if (!id || !text) {
      if (id) await call("pages.stopFind", { pageId: id, action: "clear" });
      return;
    }
    const r = await call<{ matches: number; activeMatch?: number }>("pages.find", { pageId: id, text, findNext, forward });
    if (sequence === findSequence && get().mode !== "conversation" && get().overlay === "find" && get().activePageId === id && get().findText === text
      && get().pages.find(page => page.pageId === id)?.documentEpoch === epoch) set({ findMatches: r });
  },

  pendingTurns: [],
  answerStreams: {},
  startRun: async (goal, opts = {}) => {
    const g = goal.trim();
    if (!g) return null;
    const before = get();
    const originPage = before.pages.find(page => page.pageId === before.activePageId);
    const stayed = () => {
      const current = get();
      const page = current.pages.find(page => page.pageId === before.activePageId);
      return current.mode === before.mode && current.conversationId === before.conversationId
        && current.activePageId === before.activePageId && current.railView === before.railView
        && current.overlay === before.overlay && current.railOpen === before.railOpen
        && current.layout.activeSpaceId === before.layout.activeSpaceId
        && page?.url === originPage?.url && page?.documentEpoch === originPage?.documentEpoch;
    };
    const existingChat = opts.chatId && before.runs.some(r => (r.config?.chatId ?? r.runId) === opts.chatId);
    const hasChatDraft = !!opts.chatId && Object.prototype.hasOwnProperty.call(before.conversationDrafts, draftKey(opts.chatId));
    const preserveDraft = () => {
      if (opts.ownsDraft) return;
      if ((existingChat || hasChatDraft) && opts.chatId) {
        const key = draftKey(opts.chatId);
        if (get().conversationDrafts[key] === before.conversationDrafts[key]) get().setConversationDraft(opts.chatId, g);
      } else if (get().agentDraft === before.agentDraft) get().setAgentDraft(g);
      else get().setConversationDraft(opts.chatId ?? crypto.randomUUID(), g);
    };
    if (before.settings.modelConfigured === false) {
      preserveDraft();
      set({ overlay: "settings", settingsCategory: "Models", railOpen: true });
      toast("Set up a model connection before starting the agent. Your prompt is kept.");
      return null;
    }
    const pending = { id: crypto.randomUUID(), chatId: opts.chatId ?? null, goal: g, createdAt: Date.now() };
    set(state => ({ pendingTurns: [...state.pendingTurns, pending] }));
    const settle = (runs?: (state: Workspace) => Run[]) => set(state => ({ pendingTurns: state.pendingTurns.filter(turn => turn !== pending), ...(runs ? { runs: runs(state) } : {}) }));
    try {
      let pageId = opts.pageId === undefined ? before.activePageId : opts.pageId;
      if (opts.scope === "new" || !pageId) {
        const page = await get().openBackgroundTab("about:blank", before.layout.activeSpaceId, false);
        pageId = page.pageId;
      }
      const n = Number(before.settings.maxModelCalls);
      const budget = n === 0 ? 0 : Math.min(256, Math.max(1, Number.isFinite(n) ? n : 8));
      const run = await call<Run>("runs.start", { goal: g, pageIds: pageId ? [pageId] : undefined,
        maxModelCalls: budget, chatId: opts.chatId,
        defaultWorkspaceId: bridge.privateMode ? undefined : before.layout.spaces.find(space => space.id === before.layout.activeSpaceId)?.workspaceId });
      const reveal = stayed();
      settle(state => state.runs.some(item => item.runId === run.runId) ? state.runs : [run, ...state.runs]);
      if (!opts.ownsDraft && !existingChat && !hasChatDraft && get().agentDraft === before.agentDraft) get().setAgentDraft("");
      if (reveal) {
        if (opts.presentation === "conversation") get().openConversation(run.runId);
        else set({ railOpen: true, railView: { kind: "run", runId: run.runId } });
      } else toast("Started in the background. Find it in Chats.");
      return run;
    } catch (error) {
      settle();
      preserveDraft();
      errToast(error);
      return null;
    }
  },

  retryRun: async (runId, pageId) => {
    if(get().retryingRuns[runId])return null;
    const before=get();
    set(state=>({retryingRuns:{...state.retryingRuns,[runId]:true}}));
    try {
      const run = await call<Run>("runs.retry", { runId, ...(pageId ? {pageId} : {}) });
      const current=get();
      const stayed=current.mode===before.mode && current.conversationId===before.conversationId
        && current.activePageId===before.activePageId && current.railView===before.railView
        && current.overlay===before.overlay && current.railOpen===before.railOpen;
      set((s) => ({ runs: s.runs.some((item) => item.runId === run.runId) ? s.runs : [run, ...s.runs] }));
      if(stayed) {
        set({railOpen:true,railView:{kind:"run",runId:run.runId}});
        get().openConversation(run.runId);
      } else toast("Retry started. It’s available in your conversation.");
      return run;
    } catch (error) {
      errToast(error);
      return null;
    } finally {
      set(state=>{const pending={...state.retryingRuns};delete pending[runId];return {retryingRuns:pending};});
    }
  },

  answerRun: async (runId, answer) => {
    if(get().runAnswerPending[runId])return;
    const prompt = get().prompt;
    const draft = get().runAnswerDrafts[runId];
    set(state=>({runAnswerPending:{...state.runAnswerPending,[runId]:true}}));
    try {
      await call("runs.answer", { runId, answer });
      try { clearSubmittedRunAnswer(bridge.privateMode ? null : storage,runId,draft); }
      catch { toast("Your answer was sent, but its saved draft could not be cleared.","error"); }
      set(state=>{
        const drafts={...state.runAnswerDrafts};
        if(drafts[runId]===draft)delete drafts[runId];
        return {runAnswerDrafts:drafts,...(state.prompt===prompt && prompt?.runId===runId ? {prompt:null} : {})};
      });
    } finally {
      set(state=>{const pending={...state.runAnswerPending};delete pending[runId];return {runAnswerPending:pending};});
    }
  },

  returnControl: async (pageId) => {
    await call("pages.resume", { pageId }).catch(errToast);
  },

  loadRun: async (runId) => {
    try {
      const d = await call<{ run: Run; steps: StepRecord[]; modelCalls?: number; usage?: { calls: number; modelIds: string[]; providers: string[]; destinations: string[]; inputTokens: number; outputTokens: number; knownCostUsd: number; costComplete: boolean } }>("runs.get", { runId });
      set((s) => ({
        runs: s.runs.some((r) => r.runId === runId) ? s.runs.map((r) => (r.runId === runId ? d.run : r)) : [d.run, ...s.runs],
        steps: { ...s.steps, [runId]: d.steps },
        modelStats:
          d.modelCalls != null && !s.modelStats[runId]
            ? { ...s.modelStats, [runId]: d.usage ? { calls: d.usage.calls, modelIds: d.usage.modelIds, providers: d.usage.providers, destinations: d.usage.destinations, inputTokens: d.usage.inputTokens, outputTokens: d.usage.outputTokens, costUsd: d.usage.knownCostUsd, costEstimated: !d.usage.costComplete, costComplete: d.usage.costComplete } : { ...emptyStats(), calls: d.modelCalls } }
            : s.modelStats,
      }));
    } catch (e) {
      errToast(e);
    }
  },

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
    if (activePageId && activePageId !== state.activePageId) void tabCommand({ kind: "activate", pageId: activePageId }).catch(errToast);
    if (beforeId !== undefined) syncCatalogOrder(layout.order, state.pages, state.catalogVersion);
  },
  moveTabToSpace: (pageId, spaceId) =>
    set((s) => {
      const layout = assignSpace(s.layout, pageId, spaceId);
      persistLayout(layout);
      const activePageId = s.activePageId === pageId && spaceId !== layout.activeSpaceId
        ? tabsInSpace(layout, s.pages, layout.activeSpaceId)[0]?.pageId ?? null : s.activePageId;
      if (activePageId && activePageId !== s.activePageId) void tabCommand({ kind: "activate", pageId: activePageId }).catch(errToast);
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
    if (!bridge.privateMode) get().syncBrowserSpaces(await call<BrowserSpace[]>("spaces.list"));
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
  addSpace: async (name, color = "slate") => {
    if (bridge.privateMode) {
      const layout = createSpace(get().layout, name, color);
      persistLayout(layout); set({ layout });
      get().switchSpace(layout.activeSpaceId);
      return;
    }
    const previous = new Set(get().layout.spaces.map(space => space.id));
    const spaces = await call<BrowserSpace[]>("spaces.create", { name, color });
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
    get().syncBrowserSpaces(await call<BrowserSpace[]>("spaces.update", { id: spaceId, name, color }));
  },
  deleteSpace: async (spaceId) => {
    if (bridge.privateMode) {
      const layout = removeSpace(get().layout, spaceId);
      persistLayout(layout); set({ layout });
      get().switchSpace(layout.activeSpaceId);
      return;
    }
    get().syncBrowserSpaces(await call<BrowserSpace[]>("spaces.update", { id: spaceId, archived: true }));
    toast("Space archived. Its tabs and saved work are kept for you.");
  },
  restoreSpace: async (spaceId, activate = true) => {
    get().syncBrowserSpaces(await call<BrowserSpace[]>("spaces.update", { id: spaceId, archived: false }));
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
    if (activePageId) void tabCommand({ kind: "activate", pageId: activePageId }).catch(errToast);
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

  sidebarWidth: Number(storage?.getItem("aux.sb-w")) || 280,
  sidebarSections: {
    bookmarks: storage?.getItem("aux.sidebar.bookmarks") !== "closed",
    chats: storage?.getItem("aux.sidebar.chats") !== "closed",
    tabs: storage?.getItem("aux.sidebar.tabs") !== "closed",
  },
  toggleSidebarSection: section => {
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
      if (eventSeq > ws.lastSeq) { void get().refresh(); return; }
      const { lastSeq, ...snapshot } = ws;
      eventSeq = Math.max(eventSeq, lastSeq);
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

  refreshResults: async (setId) => {
    const results = await call<ResultRecord[]>("sets.results", { setId });
    set({ results, activeSetId: setId });
  },

  applyEvent: (e) => {
    const s = get();
    if (e.seq > eventSeq) eventSeq = e.seq;

    switch (e.type) {
      case "conversation.deleted": {
        const chatId=e.payload.chatId;
        if(typeof chatId!=="string")break;
        const removed=new Set(s.runs.filter(run=>(run.config?.chatId??run.runId)===chatId).map(run=>run.runId));
        for(const [runId,draft] of Object.entries(s.runAnswerDrafts))if(draft.chatId===chatId)removed.add(runId);
        get().setConversationDraft(chatId,"");get().setConversationContext(chatId,"");
        if(!clearResultDrafts(chatId))toast("An edited result draft could not be removed from this browser.","error");
        setDictationDraft(draftKey(chatId), "");
        for(const runId of removed)try { writeRunAnswerDraft(bridge.privateMode ? null : storage,runId,null); } catch { toast("A saved answer draft could not be removed from this browser.","error"); }
        try { if(storage?.getItem(PENDING_CHAT_KEY)===chatId)storage.removeItem(PENDING_CHAT_KEY);if(storage?.getItem("aux.quick-ask.chat")===chatId)storage.removeItem("aux.quick-ask.chat"); } catch { /* The open view still discards the deleted identity. */ }
        const active=s.conversationId===chatId;
        set(state=>({runs:state.runs.filter(run=>!removed.has(run.runId)),
          runAnswerDrafts:Object.fromEntries(Object.entries(state.runAnswerDrafts).filter(([id])=>!removed.has(id))),
          steps:Object.fromEntries(Object.entries(state.steps).filter(([id])=>!removed.has(id))),
          observations:Object.fromEntries(Object.entries(state.observations).filter(([id])=>!removed.has(id))),
          ...(((state.railView.kind==="run"&&removed.has(state.railView.runId))||(state.railView.kind==="draft"&&state.railView.chatId===chatId))?{railView:{kind:"home" as const}}:{}),
          ...(active?{conversationId:crypto.randomUUID(),resultPreview:null,prompt:null}:{})}));
        if(active)toast("This conversation was deleted. You can start a new chat here.");
        break;
      }
      case "browser.recovery.changed":
        void get().refresh();
        break;
      case "spaces.updated":
        get().syncBrowserSpaces(e.payload.spaces as BrowserSpace[]);
        break;
      case "workspace.created":
        void get().refreshSpaces().catch(errToast);
        break;
      case "page.moved": {
        const moved = e.payload as { page: PageTarget; fromWindowId: string; toWindowId: string; sourceActivePageId: string | null; activePageId?: string | null; activate?: boolean; spaceId: string; space: BrowserSpace; folder?: Layout["folders"][number] };
        if (moved.toWindowId === bridge.windowId) {
          const pages = [...s.pages.filter(page => page.pageId !== moved.page.pageId), moved.page];
          const destinationLayout = s.layout.spaces.some(space => space.id === moved.spaceId) ? s.layout
            : { ...s.layout, spaces: [...s.layout.spaces, moved.space], archivedSpaces: s.layout.archivedSpaces?.filter(space => space.id !== moved.spaceId) };
          let layout = assignSpace(withSyncedOrder(destinationLayout, pages, get().pendingRestoreIds), moved.page.pageId, moved.spaceId);
          if (moved.folder) {
            if (!layout.folders.some(folder => folder.id === moved.folder!.id)) layout = { ...layout, folders: [...layout.folders, moved.folder] };
            layout = assignFolder(layout, moved.page.pageId, moved.folder.id);
          }
          const activePageId = moved.activePageId ?? moved.page.pageId;
          layout = setActiveSpace(layout, layout.tabSpace[activePageId] ?? moved.spaceId);
          persistLayout(layout);
          set({ pages, layout, activePageId, ...(moved.activate !== false ? {splitPageId: null, mode: "focus" as const, overlay: null} : {}) });
          if (moved.activate !== false) void bridge.overlay(false);
        } else if (moved.fromWindowId === bridge.windowId) {
          const pages = s.pages.filter(page => page.pageId !== moved.page.pageId);
          const layout = withSyncedOrder(s.layout, pages, s.pendingRestoreIds);
          persistLayout(layout);
          const activePageId = s.activePageId === moved.page.pageId
            ? tabsInSpace(layout, pages, layout.activeSpaceId).find(page => page.pageId === moved.sourceActivePageId)?.pageId
              ?? tabsInSpace(layout, pages, layout.activeSpaceId)[0]?.pageId ?? null : s.activePageId;
          set({ pages, layout, activePageId, splitPageId: splitForPage(layout, pages, activePageId) });
          if (activePageId && activePageId !== moved.sourceActivePageId) void tabCommand({ kind: "activate", pageId: activePageId }).catch(errToast);
        }
        break;
      }
      case "page.added":
      case "page.updated": {
        const p = e.payload.page as PageTarget | undefined;
        if (p) {
          set((st) => {
            const index = st.pages.findIndex((x) => x.pageId === p.pageId);
            // An update to a known page never changes order or Space assignment.
            if (index >= 0) return { pages: st.pages.with(index, p) };
            if (closingOptimistic.has(p.pageId)) return st;
            const pages = [...st.pages, p];
            const layout = st.restoringTabs ? st.layout : syncLayout(st.layout, pages, st.pendingRestoreIds);
            if (layout !== st.layout) persistLayout(layout);
            return { pages, layout };
          });
        } else if (typeof e.payload.pageId === "string") {
          const { pageId, ...patch } = e.payload as { pageId: string } & Partial<PageTarget>;
          const fields = Object.fromEntries(Object.entries(patch).filter(([k]) => k !== "activePageId")) as Partial<PageTarget>;
          if (Object.keys(fields).length) set((st) => patchPage(st, pageId, fields));
        } else {
          void s.refresh();
        }
        if ("activePageId" in e.payload) {
          const ap = e.payload.activePageId as string | null;
          const layout = rememberActiveTab(get().layout, ap);
          persistLayout(layout);
          set({ layout, activePageId: ap, splitPageId: splitForPage(layout, get().pages, ap) });
        }
        break;
      }
      case "page.removed": {
        const id = e.payload.pageId as string;
        const hint = typeof e.payload.activePageId === "string" ? e.payload.activePageId : null;
        let activateNext: string | undefined;
        set((st) => {
          const applied = applyRemoval(st, id, hint);
          activateNext = applied.activateNext;
          return applied.next;
        });
        if (activateNext) void tabCommand({ kind: "activate", pageId: activateNext }).catch(() => {});
        break;
      }
      case "page.crashed": {
        const { pageId } = e.payload as { pageId: string };
        set((st) => ({ pages: st.pages.map((p) => (p.pageId === pageId ? { ...p, viewStatus: "crashed", loading: false, error: "The renderer process crashed." } : p)) }));
        s.toast("A tab crashed", "error");
        break;
      }
      case "page.loading": {
        const { pageId, loading } = e.payload as { pageId: string; loading: boolean };
        set((st) => patchPage(st, pageId, { loading }));
        break;
      }
      case "page.takeover": {
        const { pageId, controller } = e.payload as { pageId: string; controller: string };
        set((st) => patchPage(st, pageId, { controller: controller as PageTarget["controller"] }));
        break;
      }
      case "routine.updated": {
        const run = e.payload.run as { status?: string; reason?: string } | undefined;
        const routine = e.payload.routine as { title?: string } | undefined;
        const title = routine?.title?.trim() || "Routine";
        if (run?.reason?.startsWith("Coalesced ")) s.toast(`${title}: ${run.reason}`);
        else if (run?.status === "needs_review") s.toast(`${title} is waiting for review before it writes.`);
        else if (run?.status === "missed") s.toast(run.reason ? `${title}: ${run.reason}` : `${title} missed a scheduled run.`);
        else if (run?.status === "uncertain") s.toast(`${title} recorded an uncertain write. Reconcile it before running again.`);
        else if (run?.status === "failed") s.toast(run.reason ? `${title}: ${run.reason}` : `${title} failed.`);
        break;
      }
      case "run.updated":
      case "run.status": {
        const run = e.payload.run as Run | undefined;
        if (run) {
          const settled = !isLive(run) && run.runId in get().answerStreams;
          if (settled) answerSeq.delete(run.runId);
          set((st) => ({
            runs: st.runs.some((r) => r.runId === run.runId) ? st.runs.map((r) => (r.runId === run.runId ? run : r)) : [run, ...st.runs],
            ...(settled ? { answerStreams: Object.fromEntries(Object.entries(st.answerStreams).filter(([id]) => id !== run.runId)) } : {}),
          }));
          if (run.status === "needs_input" && run.statusMessage) {
            set({ prompt: { runId: run.runId, question: run.statusMessage }, railOpen: true, railView: { kind: "run", runId: run.runId } });
          } else if (get().prompt?.runId === run.runId) {
            set({ prompt: null });
          }
        }
        break;
      }
      case "run.answer.delta": {
        const { runId, text, delta, seq } = e.payload as { runId?: unknown; text?: unknown; delta?: unknown; seq?: unknown };
        const id = typeof runId === "string" ? runId : e.runId;
        if (!id || (typeof text !== "string" && typeof delta !== "string")) break;
        const run = s.runs.find(item => item.runId === id);
        if (run && !isLive(run)) break;
        if (typeof seq === "number") { if (seq <= (answerSeq.get(id) ?? -Infinity)) break; answerSeq.set(id, seq); }
        set((st) => {
          const current = st.answerStreams[id] ?? "";
          const next = typeof text === "string" ? text : current + String(delta);
          return next === current ? st : { answerStreams: { ...st.answerStreams, [id]: next } };
        });
        break;
      }
      case "step.finished": {
        const step = e.payload.step as StepRecord | undefined;
        if (step) {
          set((st) => {
            const existing = st.steps[step.runId] ?? [];
            const merged = existing.some((x) => x.stepId === step.stepId) ? existing.map((x) => (x.stepId === step.stepId ? step : x)) : [...existing, step];
            return { steps: { ...st.steps, [step.runId]: merged } };
          });
        }
        break;
      }
      case "observation.new": {
        // keep the live run's observation fresh without a round trip when the payload carries it
        const { runId, observation, pageId, revision } = e.payload as {
          runId?: string;
          observation?: CompactObservation;
          pageId?: string;
          revision?: number;
        };
        // Revisions are bookkeeping, not UI — they never re-render the shell.
        if (typeof pageId === "string" && typeof revision === "number") pageRevisions.set(pageId, revision);
        if (runId && observation && typeof observation.text === "string") set((st) => ({ observations: { ...st.observations, [runId]: observation } }));
        break;
      }
      case "result.added": {
        const r = e.payload.result as ResultRecord | undefined;
        if (r) {
          if (s.activeSetId) void s.refreshResults(s.activeSetId);
        }
        break;
      }
      case "set.updated": {
        const st0 = e.payload.set as PageSet | undefined;
        if (st0) set((st) => ({ sets: st.sets.some((x) => x.setId === st0.setId) ? st.sets.map((x) => (x.setId === st0.setId ? st0 : x)) : [...st.sets, st0] }));
        break;
      }
      case "member.updated": {
        const m = e.payload.member as SetMember | undefined;
        if (m) set((st) => ({ members: st.members.some((x) => x.memberId === m.memberId) ? st.members.map((x) => (x.memberId === m.memberId ? m : x)) : [...st.members, m] }));
        break;
      }
      case "model.call": {
        const mc = e.payload as Partial<ModelCall> | undefined;
        const runId = mc?.runId ?? e.runId;
        if (runId) {
          set((st) => {
            const cur = st.modelStats[runId] ?? emptyStats();
            return {
              modelStats: {
                ...st.modelStats,
                [runId]: {
                  calls: cur.calls + 1,
                  costUsd: cur.costUsd + (mc?.costUsd ?? 0),
                  costEstimated: cur.costEstimated || !!mc?.costEstimated,
                  inputTokens: cur.inputTokens + (mc?.inputTokens ?? 0),
                  outputTokens: cur.outputTokens + (mc?.outputTokens ?? 0),
                  modelIds: [...new Set([...cur.modelIds, ...(mc?.modelId ? [mc.modelId] : [])])],
                  providers: [...new Set([...cur.providers, modelAuxValue(mc, "provider")].filter((value): value is string => !!value))],
                  destinations: [...new Set([...cur.destinations, modelAuxValue(mc, "destination")].filter((value): value is string => !!value))],
                  costComplete: cur.costComplete && mc?.costUsd !== undefined && !mc.costEstimated,
                },
              },
            };
          });
        }
        break;
      }
      case "downloads.removed": {
        const ids=new Set(Array.isArray(e.payload.ids)?e.payload.ids:[]);
        set(state=>({downloads:state.downloads.filter(item=>!ids.has(item.id))}));
        break;
      }
      case "download.started":
      case "download.finished": {
        const d = e.payload as Download;
        if (d.id) s.applyDownload(d);
        break;
      }
      case "session.changed": {
        const sess = e.payload.session as BrowserSession | undefined;
        if (sess) set((st) => ({ sessions: st.sessions.some((x) => x.sessionId === sess.sessionId) ? st.sessions.map((x) => (x.sessionId === sess.sessionId ? sess : x)) : [...st.sessions, sess] }));
        break;
      }
      case "settings.changed": {
        const settings = e.payload.settings as Record<string, unknown> | undefined;
        if (settings) {
          set({ settings });
          void bridge.setShortcutOverrides(settings.shortcutOverrides ?? {}).catch(() => {});
        }
        break;
      }
      case "bookmarks.changed": {
        const bookmarks = e.payload.bookmarks as { url: string; title: string }[] | undefined;
        if (bookmarks) set({ bookmarks });
        break;
      }
      case "page.preview": {
        const { pageId, dataUrl } = e.payload as { pageId: string; dataUrl: string };
        if (typeof pageId !== "string" || typeof dataUrl !== "string") break;
        forgetPreview(pageId);
        previewCache.set(pageId, dataUrl);
        set((st) => ({ previewVersion: st.previewVersion + 1 }));
        break;
      }
    }
  },
}));

export { call };

/** Field update for one page from a side channel (loading, audio…) — a no-op when unchanged. */
export const patchPageFields = (pageId: string, fields: Partial<PageTarget>) => useStore.setState(st => patchPage(st, pageId, fields));

/** Fire-and-forget helper for UI actions — surfaces API errors as toasts. */
export const toast = (text: string, kind: "info" | "error" = "info") => useStore.getState().toast(text, kind);
export const errToast = (e: unknown) => toast(e instanceof Error ? e.message.replace(/^\w+Error:\s*/, "") : String(e), "error");
