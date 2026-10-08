/**
 * Typed access to the native host bridge. In a plain browser (Vite preview)
 * we expose a stub so the UI renders for visual development; in
 * `--mode mock` main.tsx installs a scripted bridge before this module reads
 * window.aux (see mock/bridge.ts).
 *
 * Method and event members come from the generated host client
 * (`host/client.generated.ts`, emitted by scripts/gen-host-bindings.mjs from
 * packages/contracts/src/host-methods.ts). Members the adapter composes
 * locally are declared in ComposedBridgeMembers below.
 */
import type {
  HostMethodResult,
  HostEventPayload,
  MethodName,
  MethodResult,
  RpcArgs,
  TabCatalogSnapshot,
  TabPatch,
} from "@aux/contracts";
import type { createHostClient } from "./host/client.generated";

export type TabsSinceResult =
  { kind: "patches"; patches: TabPatch[] } | { kind: "snapshot"; snapshot: TabCatalogSnapshot };

export type BrowserProfile = HostMethodResult<"browserProfiles">[number];
export interface HttpAuthRequest {
  id: string;
  origin: string;
  proxy: boolean;
  realm: string;
  retry: boolean;
}
export interface BrowserExtension {
  key: string;
  id?: string;
  name: string;
  version: string;
  permissions: string[];
  enabled: boolean;
  loaded: boolean;
  managed: boolean;
  source: "managed" | "environment" | "store";
  error?: string;
}
export interface BrowserSiteInfo {
  pageId: string;
  url: string;
  origin: string;
  title: string;
  security: "secure" | "local" | "insecure";
  cookieCount: number;
  permissions: Record<string, "allow" | "deny">;
  trackersAllowed: boolean;
  blockedCount: number;
}
export type FilterListStatus = HostMethodResult<"filterLists">;
export type FilterSourceStatus = FilterListStatus["sources"][number];
export interface BrowserHealthSummary {
  recordingSince?: number;
  latestAt?: number;
  samples: number;
  sessions: number;
  observedMinutes: number;
  spanDays: number;
  sevenDaySpan: boolean;
  startupMs?: number;
  cpuPercent: { p50: number; p95: number; max: number };
  memoryMb: { p50: number; p95: number; max: number };
  eventLoopLagMs: { p50: number; p95: number; max: number };
  maxWindows: number;
  maxPages: number;
  maxSuspendedPages: number;
  swallowed?: Record<string, number>;
  pageCrashes: number;
  pageUnresponsive: number;
  suspensionFailures: number;
}
export const emptyBrowserHealthSummary = (): BrowserHealthSummary => ({
  samples: 0,
  sessions: 0,
  observedMinutes: 0,
  spanDays: 0,
  sevenDaySpan: false,
  cpuPercent: { p50: 0, p95: 0, max: 0 },
  memoryMb: { p50: 0, p95: 0, max: 0 },
  eventLoopLagMs: { p50: 0, p95: 0, max: 0 },
  maxWindows: 0,
  maxPages: 0,
  maxSuspendedPages: 0,
  pageCrashes: 0,
  pageUnresponsive: 0,
  suspensionFailures: 0,
});

export type ReaderNode = string | { tag: string; href?: string; sourceId?: string; children: ReaderNode[] };
export interface ReaderArticle {
  title: string;
  byline: string;
  site: string;
  url: string;
  minutes: number;
  content: ReaderNode;
}

export interface VaultOffer {
  pageId: string;
  username: string;
  origin: string;
  kind: "save" | "update";
  itemId?: string;
  offerId?: string;
  locked?: boolean;
}
export type OmniboxMatch = HostEventPayload<"onOmniboxResult">["items"][number];
export type OmniboxResult = HostEventPayload<"onOmniboxResult">;

/** Bridge members composed by the adapter instead of dispatched as host methods. */
export interface ComposedBridgeMembers {
  windowId: string;
  platform: string;
  privateMode: boolean;
  windowKind: "normal" | "private" | "little" | "quick-ask";
  /** Keep the shell painted above the native page; applied natively on mount. */
  overlay(open: boolean): Promise<boolean>;
  /** Other browser windows, derived from the tab catalog. */
  windows(): Promise<{ id: string; title: string; tabCount: number }[]>;
  /** push saved binding overrides to main (menus + page interception) */
  setShortcutOverrides(overrides: unknown): Promise<unknown>;
  invoke<M extends MethodName>(method: M, ...params: RpcArgs<M>): Promise<MethodResult<M>>;
}

export type AuxBridge = ReturnType<typeof createHostClient> & ComposedBridgeMembers;

const noop = () => () => {};
const nativeRequired = async (): Promise<never> => {
  throw new Error("This action requires the Aux native browser.");
};
/** Each preview refusal retains its own async callable and fresh Error. */
const unavailable = (message: string) => async (): Promise<never> => {
  throw new Error(message);
};

const stub: AuxBridge = {
  appearanceSnapshot: nativeRequired,
  archiveTab: nativeRequired,
  dispatchCommand: nativeRequired,
  windowControlsVisible: nativeRequired,
  extensionActions: nativeRequired,
  extensionSidePanel: nativeRequired,
  pinExtensionAction: nativeRequired,
  extensionCommands: nativeRequired,
  setExtensionCommandShortcut: nativeRequired,
  setBrowserProfileAppearance: nativeRequired,
  focusBrowserProfileSpace: nativeRequired,
  moveTabToProfile: nativeRequired,
  linkRoutes: nativeRequired,
  setLinkRoutes: nativeRequired,
  testLinkRoute: nativeRequired,
  resolveRoutePrompt: nativeRequired,
  routedOpens: nativeRequired,
  routePrompts: nativeRequired,
  javascriptAppleEvents: nativeRequired,
  showTabWindow: nativeRequired,
  littleWindow: nativeRequired,
  externalLinkTarget: nativeRequired,
  pictureInPicture: nativeRequired,
  setStageVisible: nativeRequired,
  onPictureInPicture: noop,
  onExtensionActionsChanged: noop,
  onSidePanel: noop,
  onFocusSpace: noop,
  onRoutedOpen: noop,
  onRoutePrompt: noop,
  capabilities: unavailable("Aux capabilities require the native browser."),
  browserProfiles: async () => [],
  openBrowserProfileUrl: async () => false,
  defaultBrowser: async () => ({ isDefault: false }),
  autofillProfile: async () => null,
  setAutofillProfile: async () => false,
  autofill: async () => 0,
  vaultFill: async () => false,
  vaultSave: async () => ({ ok: false, updated: false }),
  vaultDismiss: async () => false,
  passwordExport: async () => null,
  passwordImport: async () => null,
  onVaultOffer: noop,
  onLinkStatus: noop,
  setDefaultBrowser: async () => ({ isDefault: false }),
  createBrowserProfile: unavailable("Profiles require the native browser."),
  renameBrowserProfile: unavailable("Profiles require the native browser."),
  archiveBrowserProfile: unavailable("Profiles require the native browser."),
  deleteBrowserProfile: unavailable("Profiles require the native browser."),
  openBrowserProfile: async () => false,
  quickAskShortcut: async (enabled) => ({ enabled: !!enabled, registered: !!enabled, error: "" }),
  windowKind: "normal",
  quickAsk: async () => false,
  onQuickAskState: noop,
  privateMode: false,
  windowId: "main",
  platform: "darwin",
  setShortcutOverrides: async () => ({}),
  invoke: unavailable("Aux bridge unavailable — running outside the native host"),
  onEvent: noop,
  onRunAttentionActivated: noop,
  onRuntimeStatus: noop,
  onShortcut: noop,
  onToolbarEdge: noop,
  onSidebarEdge: noop,
  onPageAction: noop,
  onDownload: noop,
  onDownloadsRemoved: noop,
  onLoading: noop,
  retryDownload: unavailable("Download retry requires Aux desktop"),
  tabAudio: async () => ({}),
  tabsUnsavedWork: async () => ({}),
  bookmarksInvoke: unavailable("Bookmarks require Aux desktop"),
  onBookmarksChanged: noop,
  historyInvoke: unavailable("History requires Aux desktop"),
  onHistoryChanged: noop,
  memorySaverGet: unavailable("Memory saver requires Aux desktop"),
  memorySaverSet: unavailable("Memory saver requires Aux desktop"),
  tabSleep: async () => ({ slept: false, reason: "Sleeping tabs requires Aux desktop" }),
  tabCommand: async () => ({
    commandId: "",
    status: "rejected",
    catalogVersion: 0,
    error: { code: "no_bridge", message: "Tab commands require Aux desktop" },
  }),
  bindTabSpace: unavailable("Space binding requires Aux desktop"),
  migrateTabSpaces: async () => ({ migrated: 0 }),
  tabsSnapshot: async () => ({ version: 0, tabs: [], windows: [] }),
  organizationSnapshot: async () => ({ revision: 0, layout: null }),
  organizationCommit: unavailable("Organization storage requires Aux desktop"),
  onOrganizationChanged: noop,
  tabsSince: async () => ({ kind: "snapshot", snapshot: { version: 0, tabs: [], windows: [] } }),
  onTabsPatch: noop,
  onTabsPlacement: noop,
  onAudio: noop,
  downloadFolder: unavailable("Download folders require Aux desktop"),
  chooseDownloadFolder: unavailable("Download folders require Aux desktop"),
  spellCheck: unavailable("Spell check requires Aux desktop"),
  startupPreferences: unavailable("Startup preferences require Aux desktop"),
  languagePreferences: unavailable("Language preferences require Aux desktop"),
  automaticPictureInPicture: unavailable("Picture-in-picture settings require Aux desktop"),
  keepRuntimeInBackground: unavailable("Background runtime settings require Aux desktop"),
  defaultPageZoom: unavailable("Default page zoom requires Aux desktop"),
  downloadsSnapshot: async () => [],
  dismissDownloads: unavailable("Download dismissal requires Aux desktop"),
  controlDownload: unavailable("Download control requires Aux desktop"),
  surfaceContentId: async () => null,
  "omnibox.start": async () => false,
  "omnibox.stop": async () => false,
  "omnibox.open": async () => false,
  preloadNavigation: async () => false,
  "auth.confirm": unavailable("Device confirmation"),
  onOmniboxResult: noop,
  resolveSearch: unavailable("Profile search requires the native browser."),
  overlay: async () => true,
  focusShell: async () => null,
  showRunAttention: async () => ({ queued: false }),
  preview: async () => null,
  createResultPreview: unavailable("Interactive previews require Aux desktop."),
  releaseResultPreview: async () => true,
  contextMenu: async () => true,
  openExternal: async (url) => window.open(url, "_blank"),
  revealPath: async () => true,
  openPath: async () => "",
  saveFile: async () => null,
  saveWorkbook: async () => null,
  saveStoredArtifact: unavailable("Artifact export requires Aux desktop"),
  copyStoredImage: unavailable("Image copy requires Aux desktop"),
  savePagePdf: unavailable("PDF export requires the desktop browser"),
  printPage: async () => true,
  devTools: async () => true,
  readArticle: unavailable("Reader view requires Aux desktop"),
  navigationMenu: async () => false,
  hardReload: async () => true,
  closeWindow: async () => true,
  windows: async () => [],
  openFile: async () => null,
  openPluginDirectory: async () => null,
  pickEvidenceImage: async () => null,
  pickEvidenceDocuments: async () => null,
  readEvidenceDocument: unavailable("Document selection requires Aux desktop"),
  releaseEvidenceDocuments: async () => undefined,
  agentConfig: unavailable("Agent connection setup requires the Aux desktop app"),
  agentConnections: async () => [],
  agentClients: async () => [],
  revokeAgentConnection: unavailable("Agent connection setup requires the Aux desktop app"),
  dictationStatus: async () => ({ available: false, reason: "Dictation requires the Aux macOS app." }),
  startDictation: async () => false,
  stopDictation: async () => false,
  cancelDictation: async () => null,
  onDictation: () => () => {},
  extensions: async () => [],
  installStoreExtension: unavailable("Store installation requires Aux Browser"),
  checkStoreExtensionUpdate: unavailable("Store updates require Aux Browser"),
  reloadExtension: unavailable("Extension reload requires Aux Browser"),
  showExtensionAction: async () => false,
  installUnpackedExtension: unavailable("Extension installation requires Aux desktop"),
  updateUnpackedExtension: unavailable("Extension updates require Aux desktop"),
  setExtensionEnabled: unavailable("Extension management requires Aux desktop"),
  removeExtension: async () => false,
  dataDir: async () => "",
  exportDiagnostics: async () => null,
  exportRuntimeBackup: async () => null,
  stageRuntimeRestore: async () => null,
  cancelRuntimeRestore: async () => ({ cancelled: true }),
  runtimeRestoreStatus: async () => ({
    pending: false,
    managedRecovery: { generation: 0, freshBackupIssued: false },
  }),
  healthSummary: async () => emptyBrowserHealthSummary(),
  clearHealth: async () => emptyBrowserHealthSummary(),
  httpAuthRequests: async () => [],
  respondHttpAuth: async () => false,
  onHttpAuthChanged: noop,
  clearSiteData: async () => false,
  siteDataCount: async () => ({ domain: "", cookies: 0 }),
  browsingDataPreview: async () => ({ cookies: 0, cacheBytes: 0, cacheEstimate: false }),
  clearBrowsingData: async () => false,
  siteInfo: unavailable("Site controls require Aux desktop"),
  siteZoom: async () => [],
  pageZoom: unavailable("Page zoom requires Aux desktop"),
  pageFind: unavailable("Page find requires Aux desktop"),
  pageStopFind: unavailable("Page find requires Aux desktop"),
  onSiteZoomChanged: noop,
  sitePermissions: async () => ({}),
  clearSitePermission: async () => true,
  cookieControls: async () => ({ blockThirdParty: false, managed: false }),
  setCookieControls: async (enabled) => enabled,
  crashReporting: async () => ({ available: false, decided: false, consent: false }),
  setCrashReporting: async (consent) => consent,
  privacy: async () => ({ trackerBlock: true, blocked: 0, allowedHosts: [] }),
  setTrackerBlock: async () => ({ trackerBlock: true, blocked: 0 }),
  httpsUpgrade: async () => ({ enabled: false, available: false, managed: false }),
  setHttpsUpgrade: async () => true,
  setSiteTrackers: unavailable("Site controls require Aux desktop"),
  removeAllowedHost: unavailable("Site controls require Aux desktop"),
  filterLists: async () => ({
    sources: [],
    networkRules: 0,
    cosmeticRules: 0,
    backend: "unavailable",
    compilationWarnings: [],
    cosmeticBackend: "unavailable",
  }),
  updateFilters: unavailable("Filter updates require Aux desktop"),
  addFilterSource: unavailable("Filter lists require Aux desktop"),
  removeFilterSource: unavailable("Filter lists require Aux desktop"),
  setFilterSourceEnabled: unavailable("Filter lists require Aux desktop"),
  proceedInsecure: async () => true,
  useHttp: async () => true,
  translatePage: unavailable("Translation requires Aux desktop"),
  showOriginal: async () => 0,
  onTranslationChanged: () => () => {},
  setAppearance: async () => true,
  setShortcuts: async () => false,
};

type W = Window & { aux?: AuxBridge; auxHostProof?: { host?: string }; __auxMock?: boolean };
const w = window as unknown as W;

export const bridge: AuxBridge = w.aux ?? stub;
export const inNativeHost =
  !!w.aux &&
  w.auxHostProof?.host === "chromium-fork" &&
  location.protocol === "chrome:" &&
  location.hostname === "aux";
/** scripted bridge for visual development and screenshots */
export const inMock = !!w.__auxMock;
