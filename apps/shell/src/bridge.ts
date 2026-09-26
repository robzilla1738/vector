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
import type { MethodName, MethodResult, RpcArgs, TabCatalogSnapshot, TabPatch } from "@aux/contracts";
import type { createHostClient } from "./host/client.generated";

export type TabsSinceResult = { kind: "patches"; patches: TabPatch[] } | { kind: "snapshot"; snapshot: TabCatalogSnapshot };

export interface BrowserProfile { id:string;name:string;current:boolean;archived?:boolean }
export interface MigrationReview {
  status:"ready"|"interrupted"|"applied";
  contentHash:string;manifestSha256:string;
  tabs:number;bookmarks:number;bookmarkFolders:number;spaces:number;vaultPending:boolean;
  omitted:{unsafeTabs:number;unsafeBookmarks:number;missingArtifacts:number;vaultMetadata:number;layoutMissing:boolean};
  progress?:{status:"importing";folders:number;bookmarks:number;tabs:number};
}
export type MigrationToken = Pick<MigrationReview,"contentHash"|"manifestSha256">;
export type MigrationProgress = NonNullable<MigrationReview["progress"]>;
export interface HttpAuthRequest { id:string; origin:string;  proxy:boolean; realm:string; retry:boolean }
export interface BrowserExtension { key:string;id?:string;name:string;version:string;permissions:string[];enabled:boolean;loaded:boolean;managed:boolean;source:"managed"|"environment"|"store";error?:string }
export interface BrowserSiteInfo {
  pageId:string;url:string;origin:string;title:string;
  security:"secure"|"local"|"insecure";
  cookieCount:number;
  permissions:Record<string,"allow"|"deny">;
  trackersAllowed:boolean;
  blockedCount:number;
}
export interface FilterSourceStatus { id:string;name:string;url:string;enabled:boolean;kind:"hosts"|"cookie_banner";meta?:{fetchedAt:number;etag?:string;hosts:number;selectors?:number;sha256:string;error?:string} }
export interface FilterListStatus { sources:FilterSourceStatus[];hosts:number;cookieSelectors:number;builtinHosts:number;
  backend:"electron_web_request"|"subresource_filter"|"declarative_net_request"|"preview";
  cosmeticBackend?:"document_start_stylesheet"|"unavailable" }
export interface BrowserHealthSummary {
  recordingSince?:number;latestAt?:number;samples:number;sessions:number;observedMinutes:number;spanDays:number;sevenDaySpan:boolean;startupMs?:number;
  cpuPercent:{p50:number;p95:number;max:number};memoryMb:{p50:number;p95:number;max:number};eventLoopLagMs:{p50:number;p95:number;max:number};maxWindows:number;maxPages:number;maxSuspendedPages:number;swallowed?:Record<string,number>;pageCrashes:number;pageUnresponsive:number;suspensionFailures:number;
}
export const emptyBrowserHealthSummary=():BrowserHealthSummary=>({samples:0,sessions:0,observedMinutes:0,spanDays:0,sevenDaySpan:false,cpuPercent:{p50:0,p95:0,max:0},memoryMb:{p50:0,p95:0,max:0},eventLoopLagMs:{p50:0,p95:0,max:0},maxWindows:0,maxPages:0,maxSuspendedPages:0,pageCrashes:0,pageUnresponsive:0,suspensionFailures:0});

export type ReaderNode = string | {tag:string;href?:string;sourceId?:string;children:ReaderNode[]};
export interface ReaderArticle { title:string;byline:string;site:string;url:string;minutes:number;content:ReaderNode }

export interface VaultOffer { pageId:string; username:string; origin:string; kind:"save"|"update"; itemId?:string; locked?:boolean }
export interface AutocompleteMatch {
  id: string;
  type: "history" | "bookmark" | "search" | "typed";
  title: string;
  url: string;
  description?: string;
}

/** Bridge members composed by the adapter instead of dispatched as host methods. */
export interface ComposedBridgeMembers {
  windowId: string;
  platform: string;
  privateMode: boolean;
  quickAskMode: boolean;
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
const stub: AuxBridge = {
  capabilities:async()=>{throw new Error("Aux capabilities require the native browser.");},
  browserProfiles:async()=>[],
  openBrowserProfileUrl:async()=>false,
  defaultBrowser:async()=>({isDefault:false}),
  autofill:async()=>0,
  vaultFill:async()=>false,
  vaultSave:async()=>({ok:false,updated:false}),
  vaultDismiss:async()=>false,
  vaultExport:async()=>null,
  vaultImport:async()=>null,
  onVaultOffer:noop,
  setDefaultBrowser:async()=>({isDefault:false}),
  createBrowserProfile:async()=>{throw new Error("Profiles require the native browser.");},
  renameBrowserProfile:async()=>{throw new Error("Profiles require the native browser.");},
  archiveBrowserProfile:async()=>{throw new Error("Profiles require the native browser.");},
  deleteBrowserProfile:async()=>{throw new Error("Profiles require the native browser.");},
  openBrowserProfile:async()=>false,
  quickAskShortcut: async enabled => ({enabled:!!enabled,registered:!!enabled,error:""}),
  quickAskMode: false,
  quickAsk: async () => false,
  onQuickAskState: noop,
  privateMode: false,
  windowId: "main",
  platform: "darwin",
  setShortcutOverrides: async () => ({}),
  invoke: async () => {
    throw new Error("Aux bridge unavailable — running outside the native host");
  },
  onEvent: noop,
  onRuntimeStatus: noop,
  onShortcut: noop,
  onToolbarEdge: noop,
  onSidebarEdge: noop,
  onPageAction: noop,
  onDownload: noop,
  onLoading: noop,
  retryDownload: async()=>{throw new Error("Download retry requires Aux desktop");},
  tabAudio:async()=>({}),
  tabsUnsavedWork:async()=>({}),
  tabCommand:async()=>({commandId:"",status:"rejected",catalogVersion:0,error:{code:"no_bridge",message:"Tab commands require Aux desktop"}}),
  bindTabSpace:async()=>{throw new Error("Space binding requires Aux desktop");},
  migrateTabSpaces:async()=>({migrated:0}),
  tabsSnapshot:async()=>({version:0,tabs:[],windows:[]}),
  organizationSnapshot:async()=>({revision:0,layout:null}),
  organizationCommit:async()=>{throw new Error("Organization storage requires Aux desktop");},
  migrationReview:async()=>{throw new Error("Chromium Profile migration requires Aux Chromium");},
  migrationBegin:async()=>{throw new Error("Chromium Profile migration requires Aux Chromium");},
  migrationBatch:async()=>{throw new Error("Chromium Profile migration requires Aux Chromium");},
  migrationFinish:async()=>{throw new Error("Chromium Profile migration requires Aux Chromium");},
  migrationRollback:async()=>{throw new Error("Chromium Profile migration requires Aux Chromium");},
  onOrganizationChanged:noop,
  tabsSince:async()=>({kind:"snapshot",snapshot:{version:0,tabs:[],windows:[]}}),
  onTabsPatch:noop,
  onTabsPlacement:noop,
  onAudio:noop,
  downloadFolder: async()=>{throw new Error("Download folders require Aux desktop");},
  chooseDownloadFolder: async()=>{throw new Error("Download folders require Aux desktop");},
  downloadsSnapshot: async () => [],
  controlDownload: async () => { throw new Error("Download control requires Aux desktop"); },
  surfaceContentId: async () => null,
  autocomplete: async () => [],
  resolveSearch: async () => { throw new Error("Profile search requires the native browser."); },
  overlay: async () => true,
  focusShell: async () => null,
  preview: async () => null,
  createResultPreview: async () => { throw new Error("Interactive previews require Aux desktop."); },
  releaseResultPreview: async () => true,
  contextMenu: async () => true,
  openExternal: async (url) => window.open(url, "_blank"),
  revealPath: async () => true,
  openPath: async () => "",
  saveFile: async () => null,
  saveWorkbook: async () => null,
  saveStoredArtifact:async()=>{throw new Error('Artifact export requires Aux desktop');},
  savePagePdf: async () => { throw new Error("PDF export requires the desktop browser"); },
  printPage: async () => true,
  devTools: async () => true,
  readArticle:async()=>{throw new Error("Reader view requires Aux desktop");},
  navigationMenu: async()=>false,
  hardReload: async () => true,
  closeWindow: async () => true,
  windows: async () => [],
  openFile: async () => null,
  openPluginDirectory: async () => null,
  pickEvidenceImage: async () => null,
  pickEvidenceDocument: async () => null,
  agentConfig: async () => { throw new Error("Agent connection setup requires the Aux desktop app"); },
  agentConnections:async()=>[],
  agentClients:async()=>[],
  revokeAgentConnection: async()=>{throw new Error("Agent connection setup requires the Aux desktop app");},
  dictationStatus:async()=>({available:false,reason:"Dictation requires the Aux macOS app."}),
  startDictation:async()=>false,
  stopDictation:async()=>false,
  cancelDictation:async()=>null,
  onDictation:()=>()=>{},
  extensions:async()=>[],
  installStoreExtension:async()=>{throw new Error("Store installation requires Aux Browser");},
  checkStoreExtensionUpdate:async()=>{throw new Error("Store updates require Aux Browser");},
  reloadExtension:async()=>{throw new Error("Extension reload requires Aux Browser");},
  showExtensionAction:async()=>false,
  installUnpackedExtension:async()=>{throw new Error("Extension installation requires Aux desktop");},
  updateUnpackedExtension:async()=>{throw new Error("Extension updates require Aux desktop");},
  setExtensionEnabled:async()=>{throw new Error("Extension management requires Aux desktop");},
  removeExtension:async()=>false,
  dataDir: async () => "",
  exportDiagnostics:async()=>null,
  exportRuntimeBackup:async()=>null,
  exportMigrationLayout:async()=>null,
  stageRuntimeRestore:async()=>null,
  cancelRuntimeRestore:async()=>({cancelled:true}),
  runtimeRestoreStatus:async()=>({pending:false}),
  healthSummary:async()=>emptyBrowserHealthSummary(),
  clearHealth:async()=>emptyBrowserHealthSummary(),
  httpAuthRequests: async()=>[],
  respondHttpAuth: async()=>false,
  onHttpAuthChanged: noop,
  clearSiteData: async () => false,
  siteInfo: async () => { throw new Error("Site controls require Aux desktop"); },
  siteZoom: async () => [],
  onSiteZoomChanged: noop,
  sitePermissions: async () => ({}),
  clearSitePermission: async () => true,
  privacy: async () => ({ trackerBlock: true, blocked: 0, allowedHosts: [] }),
  setTrackerBlock: async () => ({ trackerBlock: true, blocked: 0 }),
  setHttpsUpgrade: async () => true,
  setSiteTrackers: async () => { throw new Error("Site controls require Aux desktop"); },
  removeAllowedHost: async () => { throw new Error("Site controls require Aux desktop"); },
  filterLists: async () => ({ sources: [], hosts: 0, cookieSelectors: 0, builtinHosts: 0, backend: "preview" }),
  updateFilters: async () => { throw new Error("Filter updates require Aux desktop"); },
  addFilterSource: async () => { throw new Error("Filter lists require Aux desktop"); },
  removeFilterSource: async () => { throw new Error("Filter lists require Aux desktop"); },
  setFilterSourceEnabled: async () => { throw new Error("Filter lists require Aux desktop"); },
  proceedInsecure: async () => true,
  useHttp: async () => true,
  translatePage: async () => { throw new Error("Translation requires Aux desktop"); },
  showOriginal: async () => 0,
  onTranslationChanged: () => () => {},
  setAppearance: async () => true,
  setShortcuts: async () => false,
};

type W = Window & { aux?: AuxBridge; auxHostProof?: { host?: string }; __auxMock?: boolean };
const w = window as unknown as W;

export const bridge: AuxBridge = w.aux ?? stub;
export const inNativeHost = !!w.aux && w.auxHostProof?.host === "chromium-fork" &&
  location.protocol === "chrome:" && location.hostname === "aux";
/** scripted bridge for visual development and screenshots */
export const inMock = !!w.__auxMock;
