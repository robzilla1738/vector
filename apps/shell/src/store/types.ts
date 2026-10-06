import type {
  AuxEvent,
  BrowserSession,
  BrowserSpace,
  CompactObservation,
  Download,
  PageSet,
  PageTarget,
  ResultRecord,
  Run,
  SavedProgram,
  SetMember,
  StepRecord,
  TabCatalogSnapshot,
  TabPatch,
  TabPlacement,
} from "@aux/contracts";
import type { SpaceTheme } from "@aux/contracts/spaces";
import type { StateCreator } from "zustand";
import type { ClosedTab } from "../closed-tabs";
import type { MentionRef, PageContextRef } from "@aux/contracts";
import type { RunAnswerDraft } from "../run-answer-drafts";
import type { SidebarMode } from "../sidebar-mode";
import type { Layout, Pin, SpaceColor } from "../workspace";
import type { PageCollection } from "./pages";

export type Mode = "focus" | "overview" | "table" | "conversation";
export type Overlay =
  | null
  | "reader"
  | "command-surface"
  | "settings"
  | "find"
  | "downloads"
  | "inline-assist"
  | "history"
  | "clear-history"
  | "observe"
  | "tasks"
  | "bookmarks"
  | "site"
  | "zap"
  | "capture";
export type { SidebarMode } from "../sidebar-mode";
export type CommandSlot = "sidebar" | "hero" | "toolbar";
export type RailView =
  | { kind: "home" }
  | { kind: "draft"; chatId: string }
  | { kind: "run"; runId: string }
  | { kind: "set"; setId: string };

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

export interface Workspace {
  pages: PageCollection;
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
  conversationBrowserSources: Record<string, PageContextRef[]>;
  setConversationBrowserSources(id: string | null, sources: PageContextRef[]): void;
  openConversation(runId: string | null): void;
  openConversationDraft(chatId: string | null): void;
  showConversationInRail(chatId: string | null): void;
  overlay: Overlay;
  skillSelection: { routineId: string; workspaceId: string } | null;
  readerFindOpen: boolean;
  settingsCategory: string;
  memoryWorkspaceId: string | null;
  railOpen: boolean;
  railView: RailView;
  sidebar: SidebarMode;
  /** sidebar peeked open while collapsed to the thin rail */
  sidebarPeek: boolean;
  tabPreviewOpen: boolean;
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
  /** A page action waiting for the person at the browser. */
  confirmation: import("../features/trust/confirmation").TrustConfirmation | null;
  runAnswerDrafts: Record<string, RunAnswerDraft>;
  setRunAnswerDraft(runId: string, question: string, text: string): void;
  runAnswerPending: Record<string, boolean>;
  retryingRuns: Record<string, boolean>;
  settings: Record<string, unknown>;
  agentDraft: string;
  setAgentDraft(text: string): void;
  conversationDrafts: Record<string, string>;
  setConversationDraft(id: string, text: string): void;
  bookmarkPending: Record<string, boolean>;
  toggleBookmark(url: string, title: string): Promise<void>;
  toggleReadingList(url: string, title: string): Promise<void>;
  bookmarks: {
    nodeId?: string;
    url: string;
    title: string;
    folderPath?: string[];
    readingList?: boolean;
    readAt?: number;
    offline?: boolean;
  }[];
  closedTabs: ClosedTab[];
  reopeningTab: boolean;
  downloads: Download[];
  tabAudio: Record<string, { muted: boolean; audible: boolean; video?: boolean; pip?: boolean }>;
  toasts: {
    id: number;
    text: string;
    kind: "info" | "error";
    action?: { label: string; run(): void; secondary?: { label: string; run(): void } };
  }[];
  dismissToast(id: number): void;
  vaultOffer: import("../bridge").VaultOffer | null;
  setVaultOffer(offer: Workspace["vaultOffer"]): void;
  /** Active in-place page translation for the focused tab. */
  translation: { pageId: string; lang: string; count: number; truncated: boolean } | null;
  setTranslation(translation: Workspace["translation"]): void;
  /** Page currently being translated — drives the bar's progress state. */
  translationPending: string | null;
  setTranslationPending(pageId: string | null): void;
  splitPageId: string | null;
  peekPageId: string | null;
  resultPreview: string | null;
  inspectorObs: unknown | null;
  connected: boolean;
  restoringTabs: boolean;
  pendingRestoreIds: string[];
  /** bumps each time something asks the command bar to take focus */
  focusRequest: number;
  focusSlot: CommandSlot;
  /** window is too narrow for sidebar + stage + agent rail side by side */
  narrow: boolean;
  layout: Layout;
  /** Latest AI Tidy change is stored with the Profile organization layout. */
  tidyUndo: Layout["tidyUndo"] | null;

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
  zoomPage(
    pageId: string,
    options?: { level?: number; delta?: number; reset?: boolean; direction?: "in" | "out" },
  ): Promise<void>;
  newTab(url?: string, reuseId?: string, index?: number): Promise<PageTarget | null>;
  openBackgroundTab(
    url: string,
    spaceId: string,
    reuseExisting?: boolean,
    reuseId?: string,
    index?: number,
  ): Promise<PageTarget>;
  closeTab(pageId: string): Promise<void>;
  duplicateTab(pageId: string): Promise<void>;
  closingTabs: boolean;
  closeTabs(
    pageIds: string[],
    options?: { shouldStop?(): boolean; onClosed?(pageId: string, count: number): void },
  ): Promise<boolean>;
  reopenClosedTab(pageId?: string, group?: boolean): Promise<void>;
  /** `ownsDraft`: the caller owns draft recovery. `reveal: false`: it also owns presentation after the ACK. */
  startRun(
    goal: string,
    opts?: {
      executionTarget?: import("@aux/contracts/cloud-execution").ExecutionTarget;
      pageId?: string | null;
      pageIds?: string[];
      contextPageRefs?: PageContextRef[];
      mentions?: import("@aux/contracts").MentionRef[];
      memorySource?: { workspaceId: string; memoryId: string };
      scope?: "page" | "new";
      chatId?: string;
      presentation?: "rail" | "conversation";
      ownsDraft?: boolean;
      reveal?: boolean;
    },
  ): Promise<Run | null>;
  /** Messages shown in the thread while their run is still being created. */
  pendingTurns: { id: string; chatId: string | null; goal: string; createdAt: number }[];
  /** Live answer text streamed by `run.answer.delta`, dropped once the run settles. */
  answerStreams: Record<string, string>;
  retryRun(runId: string, pageId?: string): Promise<Run | null>;
  answerRun(
    runId: string,
    answer: string,
    displayedQuestion: string,
    expectedSuspensionId: string,
    mentions?: MentionRef[],
  ): Promise<void>;
  returnControl(pageId: string): Promise<void>;
  loadRun(runId: string): Promise<void>;

  // layout
  reorderTabs(spaceId: string, from: number, to: number): void;
  reorderGroup(spaceId: string, folderId: string | null, from: number, to: number): void;
  moveTabToSpace(pageId: string, spaceId: string): void;
  moveTabs(
    pageIds: string[],
    spaceId: string,
    folderId?: string | { name: string } | null,
    beforeId?: string | null,
  ): void;
  setTabName(pageId: string, expectedUrl: string, name: string | null): void;
  moveTabToWindow(pageId: string, windowId?: string): Promise<void>;
  moveTabsToWindow(pageIds: string[], windowId?: string): Promise<void>;
  addSpace(name: string, color?: SpaceColor, grain?: number, theme?: SpaceTheme | null): Promise<void>;
  editSpace(
    spaceId: string,
    name: string,
    color?: SpaceColor,
    grain?: number,
    theme?: SpaceTheme | null,
  ): Promise<void>;
  deleteSpace(spaceId: string): Promise<void>;
  restoreSpace(spaceId: string, activate?: boolean): Promise<void>;
  syncBrowserSpaces(spaces: BrowserSpace[]): void;
  refreshSpaces(valid?: () => boolean): Promise<void>;
  switchSpace(spaceId: string): void;
  togglePin(pin: Pin, spaceId?: string): void;
  reorderPin(spaceId: string, url: string, beforeUrl: string | null): void;
  addFolder(name: string): string;
  renameFolder(folderId: string, name: string): void;
  updateFolder(
    folderId: string,
    patch: { name?: string; color?: SpaceColor | null; emoji?: string | null },
  ): void;
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
  resyncTabs(valid?: () => boolean): Promise<void>;
  toast(
    text: string,
    kind?: "info" | "error",
    action?: { label: string; run(): void; secondary?: { label: string; run(): void } },
  ): void;
  refresh(): Promise<void>;
  refreshResults(setId: string): Promise<void>;
}

export type UiKeys =
  | "mode"
  | "setMode"
  | "narrow"
  | "setNarrow"
  | "overlay"
  | "setOverlay"
  | "skillSelection"
  | "readerFindOpen"
  | "settingsCategory"
  | "memoryWorkspaceId"
  | "railOpen"
  | "railView"
  | "toggleRail"
  | "openRail"
  | "setRailView"
  | "showConversationInRail"
  | "sidebar"
  | "setSidebar"
  | "toggleSidebar"
  | "sidebarPeek"
  | "tabPreviewOpen"
  | "peekPageId"
  | "setSidebarPeek"
  | "focusRequest"
  | "focusSlot"
  | "focusCommandBar"
  | "toast"
  | "toasts"
  | "dismissToast"
  | "findText"
  | "findMatches"
  | "find"
  | "zoomLevels"
  | "zoomPage"
  | "sidebarWidth"
  | "sidebarSections"
  | "toggleSidebarSection"
  | "railWidth"
  | "setSidebarWidth"
  | "setRailWidth"
  | "vaultOffer"
  | "setVaultOffer"
  | "translation"
  | "setTranslation"
  | "translationPending"
  | "setTranslationPending"
  | "resultPreview"
  | "inspectorObs"
  | "connected";
export type DraftKeys =
  | "conversationContexts"
  | "setConversationContext"
  | "conversationBrowserSources"
  | "setConversationBrowserSources"
  | "agentDraft"
  | "setAgentDraft"
  | "conversationDrafts"
  | "setConversationDraft"
  | "runAnswerDrafts"
  | "setRunAnswerDraft";
export type BookmarkKeys =
  "bookmarks" | "bookmarkPending" | "toggleBookmark" | "toggleReadingList" | "downloads" | "applyDownload";
export type LayoutKeys =
  | "layout"
  | "tidyUndo"
  | "splitPageId"
  | "reorderTabs"
  | "reorderGroup"
  | "moveTabToSpace"
  | "moveTabs"
  | "setTabName"
  | "addSpace"
  | "editSpace"
  | "deleteSpace"
  | "restoreSpace"
  | "syncBrowserSpaces"
  | "refreshSpaces"
  | "switchSpace"
  | "togglePin"
  | "reorderPin"
  | "addFolder"
  | "renameFolder"
  | "updateFolder"
  | "deleteFolder"
  | "toggleFolder"
  | "moveTabToFolder";
export type TabKeys =
  | "pages"
  | "activePageId"
  | "closedTabs"
  | "reopeningTab"
  | "tabAudio"
  | "catalogVersion"
  | "applyTabsPatch"
  | "syncTabsSnapshot"
  | "applyTabsPlacement"
  | "resyncTabs"
  | "activate"
  | "navigatePage"
  | "newTab"
  | "openBackgroundTab"
  | "reopenClosedTab"
  | "duplicateTab"
  | "closingTabs"
  | "closeTabs"
  | "closeTab"
  | "moveTabToWindow"
  | "moveTabsToWindow"
  | "previewVersion"
  | "restoringTabs"
  | "pendingRestoreIds";
export type RunKeys =
  | "sets"
  | "members"
  | "runs"
  | "sessions"
  | "programs"
  | "conversationId"
  | "openConversation"
  | "openConversationDraft"
  | "activeSetId"
  | "results"
  | "steps"
  | "modelStats"
  | "observations"
  | "prompt"
  | "confirmation"
  | "runAnswerPending"
  | "retryingRuns"
  | "settings"
  | "pendingTurns"
  | "answerStreams"
  | "startRun"
  | "retryRun"
  | "answerRun"
  | "returnControl"
  | "loadRun"
  | "refreshResults";
export type Slice<K extends keyof Workspace> = StateCreator<Workspace, [], [], Pick<Workspace, K>>;
