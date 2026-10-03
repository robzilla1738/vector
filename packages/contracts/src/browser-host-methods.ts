import { z } from "zod";
import { OrganizationCommitSchema, OrganizationSnapshotSchema } from "./organization.js";
import { TabCatalogSnapshotSchema, TabCommandAckSchema, TabCommandSchema, TabPatchSchema, TabPlacementSchema } from "./tabs.js";
import { DownloadSchema, PageQuickActionSchema } from "./entities.js";
import { AgentClientSchema, AgentConnectionCreateParams, AgentConnectionSchema } from "./agent-connections.js";
import { EventSchema } from "./events.js";
import { AutofillProfileSchema } from "./autofill.js";
import { NativeAppearanceSnapshotSchema } from "./native-appearance.js";
import type { AuxFeature } from "./aux-features.js";
import { WindowControlsVisibleSchema } from "./minimal-ui.js";
import { PictureInPictureOperationSchema, PictureInPictureResultSchema } from "./pip.js";
import { LinkRoutesSchema, LinkRouteSourceSchema, LinkRouteDestinationSchema } from "./link-routing.js";
import { SpaceColorSchema } from "./spaces.js";
import { HostCapabilitiesSchema } from "./host-capabilities.js";

type Owner = "browser" | "runtime";
type Trust = "aux-webui" | "authenticated-runtime";

function method<A extends z.ZodType, R extends z.ZodType>(
  owner: Owner, feature: AuxFeature | "core", trusted: Trust, args: A, result: R,
) {
  return { owner, feature, profileScoped: true, trusted, args, result } as const;
}

const shell = <A extends z.ZodType, R extends z.ZodType>(feature: AuxFeature | "core", args: A, result: R) =>
  method("browser", feature, "aux-webui", args, result);
const noArgs = z.tuple([]);
const bool = z.boolean();
const str = z.string();
const number = z.number();
const nullableString = str.nullable();
const noResult = z.union([z.undefined(), z.null()]);
const token = z.object({ contentHash: str, manifestSha256: str }).strict();
const migrationProgress = z.object({ status: z.literal("importing"), folders: number, bookmarks: number, tabs: number }).strict();
const migrationReview = z.object({
  status: z.enum(["ready", "interrupted", "applied"]), contentHash: str, manifestSha256: str,
  tabs: number, bookmarks: number, bookmarkFolders: number, spaces: number, vaultPending: bool,
  omitted: z.object({ unsafeTabs: number, unsafeBookmarks: number, missingArtifacts: number,
    vaultMetadata: number, layoutMissing: bool }).strict(),
  progress: migrationProgress.optional(),
}).strict();
const filterSource = z.object({
  id: str, name: str, url: str, enabled: bool, kind: z.enum(["hosts", "cookie_banner"]),
  meta: z.object({ fetchedAt: number, etag: str.optional(), hosts: number,
    selectors: number.optional(), sha256: str, error: str.optional() }).strict().optional(),
}).strict();
const filterStatus = z.object({
  sources: z.array(filterSource), hosts: number, cookieSelectors: number, builtinHosts: number,
  backend: z.enum(["electron_web_request", "subresource_filter", "declarative_net_request", "preview"]),
  cosmeticBackend: z.enum(["document_start_stylesheet", "unavailable"]).optional(),
}).strict();
const extension = z.object({
  key: str, id: str.optional(), name: str, version: str, permissions: z.array(str),
  enabled: bool, loaded: bool, managed: bool,
  source: z.enum(["managed", "environment", "store"]), error: str.optional(),
}).strict();
const routeFallbackReason = z.enum(["profile-unavailable", "space-unavailable"]);
const routedOpen = z.object({ pageId: str, profileId: str, spaceId: str.optional(), ruleId: str.optional(), fallbackReason: routeFallbackReason.optional() }).strict();
const routePrompt = z.object({ id: str, url: z.string().url().max(8192), expiresAt: number.int().nonnegative() }).strict();
const browserProfile = z.object({ id: str, name: str, current: bool, archived: bool.optional(),
  color: SpaceColorSchema.optional(), icon: str.max(32).optional(),
  spaces: z.array(z.object({ id: str, name: str, color: SpaceColorSchema }).strict()).max(200).optional(),
}).strict();
const extensionAction = z.object({ id: str, name: str, iconPng: str, badgeText: str, badgeColor: str,
  enabled: bool, pinned: bool, hasPopup: bool }).strict();
const extensionCommand = z.object({ extensionId: str, name: str, description: str, shortcut: str }).strict();
const screenRect = z.object({ x: number, y: number, width: number.positive(), height: number.positive() }).strict();
const autocompleteMatch = z.object({ id: str, type: z.enum(["history", "bookmark", "search", "typed"]),
  title: str, url: str, description: str.optional() }).strict();
const httpAuthRequest = z.object({ id: str, origin: str, proxy: bool, realm: str, retry: bool }).strict();
const downloadFolderResult = z.object({ path: str, custom: bool, error: str.optional() }).strict();
const startupMode = z.enum(["new-tab", "continue", "pages", "continue-and-pages"]);
const startupPreferences = z.object({ mode: startupMode, urls: z.array(str).max(20) }).strict();
export type HostReaderNode = string | { tag: string; href?: string; sourceId?: string; children: HostReaderNode[] };
const readerNode: z.ZodType<HostReaderNode> = z.lazy(() => z.union([str,
  z.object({ tag: str, href: str.optional(), sourceId: str.optional(),
    children: z.array(readerNode) }).strict()]));
const stats = z.object({ p50: number, p95: number, max: number }).strict();
const healthSummary = z.object({
  recordingSince: number.optional(), latestAt: number.optional(), samples: number, sessions: number,
  observedMinutes: number, spanDays: number, sevenDaySpan: bool, startupMs: number.optional(),
  cpuPercent: stats, memoryMb: stats, eventLoopLagMs: stats,
  maxWindows: number, maxPages: number, maxSuspendedPages: number,
  swallowed: z.record(str, number).optional(),
  pageCrashes: number, pageUnresponsive: number, suspensionFailures: number,
}).strict();
const runtimeBackup = z.object({ path: str, bytes: number, sha256: str,
  artifactFiles: number, missingArtifacts: number }).strict();
const stagedRestore = runtimeBackup.extend({ staged: z.literal(true), schemaVersion: number });
/** Methods handled by the native WebUI, without authenticated-runtime entries. */
export const BrowserHostMethods = {
  capabilities: shell("core", noArgs, HostCapabilitiesSchema),
  appearanceSnapshot: shell("core", noArgs, NativeAppearanceSnapshotSchema),
  defaultBrowser: shell("core", noArgs, z.object({ isDefault: bool }).strict()),
  setDefaultBrowser: shell("core", noArgs, z.object({ isDefault: bool }).strict()),
  tabCommand: {
    ...shell("core", z.tuple([TabCommandSchema, number.optional()]), TabCommandAckSchema),
    // The bootstrap supplies a command ID before forwarding to Mojo.
    wireArgs: z.tuple([str.min(8).max(128), TabCommandSchema, number.optional()]),
  },
  bindTabSpace: shell("spaces", z.tuple([str, str]), z.object({ spaceId: str, workspaceId: str }).strict()),
  migrateTabSpaces: shell("spaces", z.tuple([z.array(z.object({ pageId: str, spaceId: str }).strict())]), z.object({ migrated: number }).strict()),
  tabsSnapshot: shell("core", noArgs, TabCatalogSnapshotSchema),
  organizationSnapshot: shell("spaces", noArgs, OrganizationSnapshotSchema),
  organizationCommit: shell("spaces", z.tuple([OrganizationCommitSchema]), OrganizationSnapshotSchema),
  migrationReview: shell("browserImport", noArgs, migrationReview),
  migrationBegin: shell("browserImport", z.tuple([token.extend({ confirmed: z.literal(true) })]), z.union([migrationReview, migrationProgress])),
  migrationBatch: shell("browserImport", z.tuple([token.extend({ section: z.enum(["folders", "bookmarks", "tabs"]), offset: number })]), migrationProgress),
  migrationFinish: shell("browserImport", z.tuple([token]), migrationReview),
  migrationRollback: shell("browserImport", z.tuple([token.extend({ confirmed: z.literal(true) })]), migrationReview),
  tabsSince: shell("core", z.tuple([number]), z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("patches"), patches: z.array(TabPatchSchema) }).strict(),
    z.object({ kind: z.literal("snapshot"), snapshot: TabCatalogSnapshotSchema }).strict(),
  ])),
  surfaceContentId: shell("core", z.tuple([str]), nullableString),
  resolveSearch: shell("searchEngines", z.tuple([str]), str),
  focusShell: shell("core", noArgs, noResult),
  /** Browser picks fixed copy. No goal, page, question, or result text crosses this boundary. */
  showRunAttention: shell("core", z.tuple([z.object({
    kind: z.enum(["completed", "question", "handoff"]),
    runId: str.min(1).max(128), identity: str.min(1).max(128), windowId: str.min(1).max(128),
  }).strict()]), z.object({ queued: bool }).strict()),
  createResultPreview: shell("activeHtml", z.tuple([str]), str),
  releaseResultPreview: shell("activeHtml", z.tuple([str]), bool),
  savePagePdf: shell("reports", z.tuple([str]), nullableString),
  printPage: shell("core", z.tuple([str]), bool),
  devTools: shell("core", z.tuple([str, z.enum(["toggle", "inspect"]).optional()]), bool),
  hardReload: shell("core", z.tuple([str]), bool),
  closeWindow: shell("core", noArgs, bool),
  openFile: shell("core", noArgs, nullableString),
  dictationStatus: shell("dictation", noArgs, z.object({ available: bool, language: str.optional(), reason: str.optional() }).strict()),
  startDictation: shell("dictation", z.tuple([str]), bool),
  stopDictation: shell("dictation", z.tuple([str]), bool),
  cancelDictation: shell("dictation", z.tuple([str]), noResult),
  dataDir: shell("core", noArgs, str),
  siteInfo: shell("sitePermissions", z.tuple([str]), z.object({
    pageId: str, url: str, origin: str, title: str,
    security: z.enum(["secure", "local", "insecure"]), cookieCount: number,
    permissions: z.record(str, z.enum(["allow", "deny"])), trackersAllowed: bool, blockedCount: number,
  }).strict()),
  siteZoom: shell("pageZoom", z.tuple([str.optional()]), z.array(z.object({ origin: str, percentage: number }).strict())),
  privatePageZoom: shell("core", z.tuple([str, z.object({
    level: number.optional(), delta: number.optional(), reset: bool.optional(),
    direction: z.enum(["in", "out"]).optional(),
  }).strict()]), z.object({ level: number }).strict()),
  privacy: shell("contentBlocking", noArgs, z.object({ trackerBlock: bool, blocked: number,
    allowedHosts: z.array(str).optional(), httpsUpgrade: bool.optional() }).strict()),
  setTrackerBlock: shell("contentBlocking", z.tuple([bool]), z.object({ trackerBlock: bool, blocked: number,
    allowedHosts: z.array(str).optional() }).strict()),
  setSiteTrackers: shell("contentBlocking", z.tuple([str, bool]), z.object({ hostname: str, allowed: bool }).strict()),
  removeAllowedHost: shell("contentBlocking", z.tuple([str]), z.array(str)),
  filterLists: shell("contentBlocking", noArgs, filterStatus),
  updateFilters: shell("contentBlocking", noArgs, filterStatus),
  addFilterSource: shell("contentBlocking", z.tuple([str, str, z.enum(["hosts", "cookie_banner"]).optional()]), z.array(filterSource)),
  removeFilterSource: shell("contentBlocking", z.tuple([str]), z.array(filterSource)),
  setFilterSourceEnabled: shell("contentBlocking", z.tuple([str, bool]), z.array(filterSource)),
  setAppearance: shell("core", z.tuple([z.enum(["system", "dark", "light"]), bool.optional(), bool.optional(),
    z.enum(["liquid-glass", "titlebar", "sidebar", "under-window"]).optional()]), bool),
  dispatchCommand: shell("core", z.tuple([z.enum(["new-window", "new-private-window"])]), bool),
  setShortcuts: shell("core", z.tuple([z.array(z.object({
    commandId: str.max(64), key: str.min(1).max(32), meta: bool, ctrl: bool,
    shift: bool, alt: bool, focusShell: bool.optional(),
  }).strict()).max(512)]), bool),
  windowControlsVisible: shell("minimalUi", WindowControlsVisibleSchema, bool),
  extensions: shell("extensions", noArgs, z.array(extension)),
  installStoreExtension: shell("extensions", z.tuple([str]), extension),
  checkStoreExtensionUpdate: shell("extensions", z.tuple([str]), extension),
  reloadExtension: shell("extensions", z.tuple([str]), extension),
  showExtensionAction: shell("extensions", z.tuple([str, screenRect.optional()]), bool),
  extensionActions: shell("extensions", noArgs, z.array(extensionAction)),
  extensionSidePanel: shell("extensions", z.tuple([z.enum(["describe", "close"])]), z.object({ extensionId: str, windowId: str, pageId: str.nullable(), contentId: str.nullable(), title: str, open: bool }).strict().nullable()),
  pinExtensionAction: shell("extensions", z.tuple([str, bool]), bool),
  extensionCommands: shell("extensions", noArgs, z.array(extensionCommand)),
  setExtensionCommandShortcut: shell("extensions", z.tuple([str, str, str]), bool),
  setExtensionEnabled: shell("extensions", z.tuple([str, bool]), extension),
  removeExtension: shell("extensions", z.tuple([str]), bool),
  installUnpackedExtension: shell("extensions", noArgs, extension.nullable()),
  updateUnpackedExtension: shell("extensions", z.tuple([str]), extension.nullable()),
  // Profiles
  browserProfiles: shell("profiles", noArgs, z.array(browserProfile)),
  createBrowserProfile: shell("profiles", z.tuple([str]), browserProfile),
  renameBrowserProfile: shell("profiles", z.tuple([str, str]), z.array(browserProfile)),
  archiveBrowserProfile: shell("profiles", z.tuple([str, bool]), z.array(browserProfile)),
  deleteBrowserProfile: shell("profiles", z.tuple([str]), z.array(browserProfile)),
  openBrowserProfile: shell("profiles", z.tuple([str]), bool),
  openBrowserProfileUrl: shell("profiles", z.tuple([str, str]), bool),
  setBrowserProfileAppearance: shell("profiles", z.tuple([str, z.object({ color: SpaceColorSchema, icon: str.min(1).max(32) }).strict()]), bool),
  focusBrowserProfileSpace: shell("profiles", z.tuple([str, nullableString]), bool),
  moveTabToProfile: shell("profiles", z.tuple([str, str]), bool),
  linkRoutes: shell("linkRouting", noArgs, LinkRoutesSchema),
  setLinkRoutes: shell("linkRouting", z.tuple([number.int().nonnegative(), LinkRoutesSchema]), LinkRoutesSchema),
  testLinkRoute: shell("linkRouting", z.tuple([z.string().url().max(8192), LinkRouteSourceSchema]),
    z.object({ destination: LinkRouteDestinationSchema, ruleId: str.optional(), fallback: bool, fallbackReason: routeFallbackReason.optional() }).strict()),
  resolveRoutePrompt: shell("linkRouting", z.tuple([str, LinkRouteDestinationSchema, bool]), bool),
  routedOpens: shell("linkRouting", noArgs, z.array(routedOpen).max(128)),
  routePrompts: shell("linkRouting", noArgs, z.array(routePrompt).max(128)),
  // Credential vault
  autofillProfile: shell("core", noArgs, AutofillProfileSchema.nullable()),
  setAutofillProfile: shell("core", z.tuple([AutofillProfileSchema]), bool),
  autofill: shell("core", z.tuple([str]), number),
  vaultFill: shell("core", z.tuple([str]), bool),
  vaultSave: shell("core", z.tuple([str, str, str.optional()]), z.object({ ok: bool, updated: bool }).strict()),
  vaultDismiss: shell("core", z.tuple([str, str, str.optional()]), bool),
  passwordExport: shell("core", z.tuple([str]), z.object({ path: str, exported: number, skipped: number }).strict().nullable()),
  passwordImport: shell("core", z.tuple([str]), z.object({ added: number, skipped: number }).strict().nullable()),
  // Quick Ask
  quickAskShortcut: shell("quickAsk", z.tuple([bool.optional()]),
    z.object({ enabled: bool, registered: bool, error: str }).strict()),
  quickAsk: shell("quickAsk", z.tuple([z.enum(["open", "expand", "dismiss", "status"])]), bool),
  showTabWindow: shell("windowSync", z.tuple([str]), bool),
  littleWindow: shell("littleWindow", z.tuple([z.enum(["open", "promote", "close"]),
    z.object({ url: z.string().url().max(8192).optional(), spaceId: str.optional() }).strict()]), bool),
  externalLinkTarget: shell("littleWindow", z.tuple([z.enum(["little", "main"]).optional()]), z.enum(["little", "main"])),
  javascriptAppleEvents: shell("appleScript", z.tuple([bool.optional()]), z.object({ enabled: bool, managed: bool }).strict()),
  // Downloads and tab audio
  downloadFolder: shell("core", noArgs, downloadFolderResult),
  chooseDownloadFolder: shell("core", z.tuple([bool.optional()]), downloadFolderResult),
  spellCheck: shell("core", z.tuple([bool.optional()]), z.object({ enabled: bool, managed: bool }).strict()),
  startupPreferences: shell("core", z.tuple([startupPreferences.optional()]), startupPreferences.extend({ managed: bool }).strict()),
  languagePreferences: shell("core", z.tuple([z.array(str).min(1).max(20).optional()]),
    z.object({ selected: z.array(str), effective: z.array(str), forced: z.array(str), managed: bool }).strict()),
  automaticPictureInPicture: shell("core", z.tuple([z.enum(["ask", "allow", "block"]).optional()]),
    z.object({ mode: z.enum(["ask", "allow", "block"]), managed: bool }).strict()),
  keepRuntimeInBackground: shell("core", z.tuple([bool.optional()]),
    z.object({ enabled: bool, available: bool, managed: bool }).strict()),
  defaultPageZoom: shell("core", z.tuple([z.number().int().min(50).max(200).optional()]),
    z.object({ percentage: z.number().int(), managed: bool }).strict()),
  downloadsSnapshot: shell("core", noArgs, z.array(DownloadSchema)),
  controlDownload: shell("core", z.tuple([str, z.enum(["pause", "resume", "cancel"])]), noResult),
  retryDownload: shell("core", z.tuple([str]), noResult),
  tabAudio: shell("core", noArgs, z.record(str, z.object({ muted: bool, audible: bool, video: bool, pip: bool }).strict())),
  pictureInPicture: shell("pictureInPicture", z.tuple([str, PictureInPictureOperationSchema]), PictureInPictureResultSchema),
  setStageVisible: shell("core", z.tuple([z.array(str.min(1).max(256)).max(4)
    .refine(ids => new Set(ids).size === ids.length, "Stage pages must be unique")]), bool),
  tabsUnsavedWork: shell("core", z.tuple([z.array(z.object({ pageId: str, url: str }).strict())]),
    z.record(str, z.enum(["clean", "dirty", "unknown"]))),
  archiveTab: shell("autoArchive", z.tuple([str.min(1).max(128), z.string().url().max(8192), str.min(1).max(200), number.nonnegative()]), z.object({ archived: bool, reason: str.optional() }).strict()),
  tabSleep: shell("tabLifecycle", z.tuple([str, z.string().url().max(8192)]),
    z.object({ slept: bool, reason: str.optional(), estimatedSavedBytes: z.number().int().nonnegative().optional() }).strict()),
  // Page surfaces and menus
  preview: shell("core", z.tuple([str]), nullableString),
  contextMenu: shell("core", z.tuple([z.union([str, z.null()])]), bool),
  navigationMenu: shell("core", z.tuple([str, z.enum(["back", "forward"])]), bool),
  autocomplete: shell("commandBar", z.tuple([str]), z.array(autocompleteMatch)),
  readArticle: shell("reader", z.tuple([str]), z.object({ title: str, byline: str, site: str,
    url: str, minutes: number, content: readerNode }).strict()),
  // Files and system services
  openExternal: shell("core", z.tuple([str]), z.unknown()),
  revealPath: shell("core", z.tuple([str]), bool),
  openPath: shell("core", z.tuple([str]), str),
  saveFile: shell("core", z.tuple([str, str]), nullableString),
  saveWorkbook: shell("documentArtifacts", z.tuple([str, z.enum(["snapshot", "csv"]).optional()]), nullableString),
  saveStoredArtifact: shell("documentArtifacts", z.tuple([str, str]), nullableString),
  openPluginDirectory: shell("skills", noArgs, nullableString),
  pickEvidenceImage: shell("conversation", noArgs, z.object({ filename: str, dataUrl: str }).strict().nullable()),
  pickEvidenceDocument: shell("conversation", noArgs, z.object({ filename: str, content: str }).strict().nullable()),
  // External agents
  agentConfig: shell("inboundAgents", z.tuple([AgentConnectionCreateParams]), z.object({
    command: str, args: z.array(str), env: z.record(str, str), connection: AgentConnectionSchema }).strict()),
  agentConnections: shell("inboundAgents", noArgs, z.array(AgentConnectionSchema)),
  agentClients: shell("inboundAgents", noArgs, z.array(z.object({
    client: AgentClientSchema, installed: bool, version: str.optional(), error: str.optional() }).strict())),
  revokeAgentConnection: shell("inboundAgents", z.tuple([str]), AgentConnectionSchema),
  // Diagnostics, backup and restore
  exportDiagnostics: shell("core", noArgs, nullableString),
  exportRuntimeBackup: shell("electronMigration", noArgs, runtimeBackup.nullable()),
  exportMigrationLayout: shell("electronMigration", z.tuple([str]), z.object({ path: str }).strict().nullable()),
  stageRuntimeRestore: shell("electronMigration", noArgs, stagedRestore.nullable()),
  cancelRuntimeRestore: shell("electronMigration", noArgs, z.object({ cancelled: z.literal(true) }).strict()),
  runtimeRestoreStatus: shell("electronMigration", noArgs, z.object({
    pending: bool, lastAppliedAt: number.optional(),
    managedRecovery: z.object({ generation: number.int().nonnegative(), freshBackupIssued: bool }).strict(),
  }).strict()),
  healthSummary: shell("core", noArgs, healthSummary),
  clearHealth: shell("core", noArgs, healthSummary),
  // HTTP auth and site controls
  httpAuthRequests: shell("core", noArgs, z.array(httpAuthRequest)),
  respondHttpAuth: shell("core", z.tuple([str, z.object({ username: str, password: str }).strict().nullable()]), bool),
  clearSiteData: shell("sitePermissions", z.tuple([str]), bool),
  siteDataCount: shell("sitePermissions", z.tuple([str]), z.object({ domain: str, cookies: number.int().nonnegative() }).strict()),
  browsingDataPreview: shell("sitePermissions", z.tuple([number.int().nonnegative(), number.int().nonnegative()]),
    z.object({ cookies: number.int().nonnegative(), cacheBytes: number.int().nonnegative(), cacheEstimate: bool }).strict()),
  clearBrowsingData: shell("sitePermissions", z.tuple([number.int().nonnegative(), number.int().nonnegative(),
    z.object({ cookies: bool, cache: bool }).strict()]), bool),
  sitePermissions: shell("sitePermissions", noArgs, z.record(str, z.record(str, z.enum(["allow", "deny"])))),
  clearSitePermission: shell("sitePermissions", z.tuple([str, str.optional()]), bool),
  cookieControls: shell("sitePermissions", noArgs, z.object({ blockThirdParty: bool, managed: bool }).strict()),
  setCookieControls: shell("sitePermissions", z.tuple([bool]), bool),
  crashReporting: shell("core", noArgs, z.object({ available: bool, decided: bool, consent: bool }).strict()),
  setCrashReporting: shell("core", z.tuple([bool]), bool),
  httpsUpgrade: shell("httpsFirst", noArgs, z.object({ enabled: bool, available: bool, managed: bool }).strict()),
  setHttpsUpgrade: shell("httpsFirst", z.tuple([bool]), bool),
  proceedInsecure: shell("core", z.tuple([str, str]), bool),
  useHttp: shell("core", z.tuple([str, str]), bool),
  translatePage: shell("aiTranslate", z.tuple([str]), z.object({ lang: str, count: number, truncated: bool }).strict()),
  showOriginal: shell("aiTranslate", z.tuple([str]), number),

} as const;

export type BrowserHostMethodId = keyof typeof BrowserHostMethods;
export type BrowserHostMethodArgs<M extends BrowserHostMethodId> = z.input<(typeof BrowserHostMethods)[M]["args"]>;
export type BrowserHostMethodResult<M extends BrowserHostMethodId> = z.output<(typeof BrowserHostMethods)[M]["result"]>;

const event = <P extends z.ZodType>(feature: AuxFeature | "core", payload: P) => ({
  owner: "browser", feature, profileScoped: true, trusted: "aux-webui", payload,
} as const);

/** Events published by the native browser to an authorized Aux WebUI. */
export const HostEvents = {
  onEvent: event("core", EventSchema),
  onRunAttentionActivated: event("core", z.object({ runId: str.min(1).max(128), identity: str.min(1).max(128), windowId: str.min(1).max(128) }).strict()),
  onTabsPatch: event("core", TabPatchSchema),
  onDictation: event("dictation", z.object({ sessionId: str,
    type: z.enum(["recording", "finishing", "transcript", "final", "error"]),
    text: str.optional(), message: str.optional() }).strict()),
  onSidebarEdge: event("floatingSidebar", bool),
  onToolbarEdge: event("autoHideToolbar", bool),
  onOrganizationChanged: event("spaces", number),
  onShortcut: event("commandRegistry", z.object({ key: str, meta: bool, shift: bool,
    alt: bool, ctrl: bool.optional(), commandId: str.optional(), websitePassThrough: bool.optional() }).strict()),
  onSiteZoomChanged: event("pageZoom", z.object({}).strict()),
  onRuntimeStatus: event("core", z.object({ connected: bool, detail: str.optional() }).strict()),
  onLoading: event("core", z.object({ pageId: str, loading: bool }).strict()),
  onAudio: event("core", z.object({ pageId: str, muted: bool, audible: bool,
    removed: bool.optional(), video: bool.optional(), pip: bool.optional() }).strict()),
  onPictureInPicture: event("pictureInPicture", PictureInPictureResultSchema.extend({ pageId: str })),
  onExtensionActionsChanged: event("extensions", z.array(extensionAction)),
  onSidePanel: event("extensions", z.object({ extensionId: str, windowId: str, pageId: str.nullable(), contentId: str.nullable(), title: str, open: bool }).strict()),
  onFocusSpace: event("profiles", z.object({ spaceId: str.nullable(), windowId: str }).strict()),
  onRoutedOpen: event("linkRouting", routedOpen),
  onRoutePrompt: event("linkRouting", routePrompt),
  onLinkStatus: event("core", z.object({ pageId: str, text: str }).strict()),
  onDownload: event("core", DownloadSchema),
  onTabsPlacement: event("core", z.object({ pageId: str, windowId: str,
    placement: TabPlacementSchema }).strict()),
  onPageAction: event("extensions", PageQuickActionSchema),
  onVaultOffer: event("core", z.object({ pageId: str, username: str, origin: str,
    kind: z.enum(["save", "update"]), itemId: str.optional(), offerId: str.optional(),
    locked: bool.optional() }).strict()),
  onQuickAskState: event("quickAsk", bool),
  onHttpAuthChanged: event("core", z.object({}).strict()),
  onTranslationChanged: event("aiTranslate", z.object({ pageId: str, lang: nullableString.optional(),
    count: number.optional(), truncated: bool.optional(), pending: bool.optional(),
    error: str.optional() }).strict()),
} as const;

export type HostEventId = keyof typeof HostEvents;
export type HostEventPayload<E extends HostEventId> = z.output<(typeof HostEvents)[E]["payload"]>;
