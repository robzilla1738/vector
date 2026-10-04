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
const strictObject = <Shape extends z.ZodRawShape>(shape: Shape) => z.object(shape).strict();
const tuple = z.tuple;
const noArgs = tuple([]);
const bool = z.boolean();
const str = z.string();
const number = z.number();
const nullableString = str.nullable();
const noResult = z.union([z.undefined(), z.null()]);
const token = strictObject({ contentHash: str, manifestSha256: str });
const migrationProgress = strictObject({ status: z.literal("importing"), folders: number, bookmarks: number, tabs: number });
const migrationReview = strictObject({
  status: z.enum(["ready", "interrupted", "applied"]), contentHash: str, manifestSha256: str,
  tabs: number, bookmarks: number, bookmarkFolders: number, spaces: number, vaultPending: bool,
  omitted: strictObject({ unsafeTabs: number, unsafeBookmarks: number, missingArtifacts: number,
    vaultMetadata: number, layoutMissing: bool }),
  progress: migrationProgress.optional(),
});
const filterSource = strictObject({
  id: str, name: str, url: str, enabled: bool, kind: z.enum(["hosts", "cookie_banner"]),
  meta: strictObject({ fetchedAt: number, etag: str.optional(), hosts: number,
    selectors: number.optional(), sha256: str, error: str.optional() }).optional(),
});
const filterStatus = strictObject({
  sources: z.array(filterSource), hosts: number, cookieSelectors: number, builtinHosts: number,
  backend: z.enum(["electron_web_request", "subresource_filter", "declarative_net_request", "preview"]),
  cosmeticBackend: z.enum(["document_start_stylesheet", "unavailable"]).optional(),
});
const extension = strictObject({
  key: str, id: str.optional(), name: str, version: str, permissions: z.array(str),
  enabled: bool, loaded: bool, managed: bool,
  source: z.enum(["managed", "environment", "store"]), error: str.optional(),
});
const routeFallbackReason = z.enum(["profile-unavailable", "space-unavailable"]);
const routedOpen = strictObject({ pageId: str, profileId: str, spaceId: str.optional(), ruleId: str.optional(), fallbackReason: routeFallbackReason.optional() });
const routePrompt = strictObject({ id: str, url: z.string().url().max(8192), expiresAt: number.int().nonnegative() });
const browserProfile = strictObject({ id: str, name: str, current: bool, archived: bool.optional(),
  color: SpaceColorSchema.optional(), icon: str.max(32).optional(),
  spaces: z.array(strictObject({ id: str, name: str, color: SpaceColorSchema })).max(200).optional(),
});
const extensionAction = strictObject({ id: str, name: str, iconPng: str, badgeText: str, badgeColor: str,
  enabled: bool, pinned: bool, hasPopup: bool });
const extensionCommand = strictObject({ extensionId: str, name: str, description: str, shortcut: str });
const screenRect = strictObject({ x: number, y: number, width: number.positive(), height: number.positive() });
const autocompleteMatch = strictObject({ id: str, type: z.enum(["history", "bookmark", "search", "typed"]),
  title: str, url: str, description: str.optional() });
const httpAuthRequest = strictObject({ id: str, origin: str, proxy: bool, realm: str, retry: bool });
const downloadFolderResult = strictObject({ path: str, custom: bool, error: str.optional() });
const startupMode = z.enum(["new-tab", "continue", "pages", "continue-and-pages"]);
const startupPreferences = strictObject({ mode: startupMode, urls: z.array(str).max(20) });
export type HostReaderNode = string | { tag: string; href?: string; sourceId?: string; children: HostReaderNode[] };
const readerNode: z.ZodType<HostReaderNode> = z.lazy(() => z.union([str,
  strictObject({ tag: str, href: str.optional(), sourceId: str.optional(),
    children: z.array(readerNode) })]));
const stats = strictObject({ p50: number, p95: number, max: number });
const healthSummary = strictObject({
  recordingSince: number.optional(), latestAt: number.optional(), samples: number, sessions: number,
  observedMinutes: number, spanDays: number, sevenDaySpan: bool, startupMs: number.optional(),
  cpuPercent: stats, memoryMb: stats, eventLoopLagMs: stats,
  maxWindows: number, maxPages: number, maxSuspendedPages: number,
  swallowed: z.record(str, number).optional(),
  pageCrashes: number, pageUnresponsive: number, suspensionFailures: number,
});
const runtimeBackup = strictObject({ path: str, bytes: number, sha256: str,
  artifactFiles: number, missingArtifacts: number });
const stagedRestore = runtimeBackup.extend({ staged: z.literal(true), schemaVersion: number });
/** Methods handled by the native WebUI, without authenticated-runtime entries. */
export const BrowserHostMethods = {
  capabilities: shell("core", noArgs, HostCapabilitiesSchema),
  appearanceSnapshot: shell("core", noArgs, NativeAppearanceSnapshotSchema),
  defaultBrowser: shell("core", noArgs, strictObject({ isDefault: bool })),
  setDefaultBrowser: shell("core", noArgs, strictObject({ isDefault: bool })),
  tabCommand: {
    ...shell("core", tuple([TabCommandSchema, number.optional()]), TabCommandAckSchema),
    // The bootstrap supplies a command ID before forwarding to Mojo.
    wireArgs: tuple([str.min(8).max(128), TabCommandSchema, number.optional()]),
  },
  bindTabSpace: shell("spaces", tuple([str, str]), strictObject({ spaceId: str, workspaceId: str })),
  migrateTabSpaces: shell("spaces", tuple([z.array(strictObject({ pageId: str, spaceId: str }))]), strictObject({ migrated: number })),
  tabsSnapshot: shell("core", noArgs, TabCatalogSnapshotSchema),
  organizationSnapshot: shell("spaces", noArgs, OrganizationSnapshotSchema),
  organizationCommit: shell("spaces", tuple([OrganizationCommitSchema]), OrganizationSnapshotSchema),
  migrationReview: shell("browserImport", noArgs, migrationReview),
  migrationBegin: shell("browserImport", tuple([token.extend({ confirmed: z.literal(true) })]), z.union([migrationReview, migrationProgress])),
  migrationBatch: shell("browserImport", tuple([token.extend({ section: z.enum(["folders", "bookmarks", "tabs"]), offset: number })]), migrationProgress),
  migrationFinish: shell("browserImport", tuple([token]), migrationReview),
  migrationRollback: shell("browserImport", tuple([token.extend({ confirmed: z.literal(true) })]), migrationReview),
  tabsSince: shell("core", tuple([number]), z.discriminatedUnion("kind", [
    strictObject({ kind: z.literal("patches"), patches: z.array(TabPatchSchema) }),
    strictObject({ kind: z.literal("snapshot"), snapshot: TabCatalogSnapshotSchema }),
  ])),
  surfaceContentId: shell("core", tuple([str]), nullableString),
  resolveSearch: shell("searchEngines", tuple([str]), str),
  focusShell: shell("core", noArgs, noResult),
  /** Browser picks fixed copy. No goal, page, question, or result text crosses this boundary. */
  showRunAttention: shell("core", tuple([strictObject({
    kind: z.enum(["completed", "question", "handoff"]),
    runId: str.min(1).max(128), identity: str.min(1).max(128), windowId: str.min(1).max(128),
  })]), strictObject({ queued: bool })),
  createResultPreview: shell("activeHtml", tuple([str]), str),
  releaseResultPreview: shell("activeHtml", tuple([str]), bool),
  savePagePdf: shell("reports", tuple([str]), nullableString),
  printPage: shell("core", tuple([str]), bool),
  devTools: shell("core", tuple([str, z.enum(["toggle", "inspect"]).optional()]), bool),
  hardReload: shell("core", tuple([str]), bool),
  closeWindow: shell("core", noArgs, bool),
  openFile: shell("core", noArgs, nullableString),
  dictationStatus: shell("dictation", noArgs, strictObject({ available: bool, language: str.optional(), reason: str.optional() })),
  startDictation: shell("dictation", tuple([str]), bool),
  stopDictation: shell("dictation", tuple([str]), bool),
  cancelDictation: shell("dictation", tuple([str]), noResult),
  dataDir: shell("core", noArgs, str),
  siteInfo: shell("sitePermissions", tuple([str]), strictObject({
    pageId: str, url: str, origin: str, title: str,
    security: z.enum(["secure", "local", "insecure"]), cookieCount: number,
    permissions: z.record(str, z.enum(["allow", "deny"])), trackersAllowed: bool, blockedCount: number,
  })),
  siteZoom: shell("pageZoom", tuple([str.optional()]), z.array(strictObject({ origin: str, percentage: number }))),
  privatePageZoom: shell("core", tuple([str, strictObject({
    level: number.optional(), delta: number.optional(), reset: bool.optional(),
    direction: z.enum(["in", "out"]).optional(),
  })]), strictObject({ level: number })),
  privacy: shell("contentBlocking", noArgs, strictObject({ trackerBlock: bool, blocked: number,
    allowedHosts: z.array(str).optional(), httpsUpgrade: bool.optional() })),
  setTrackerBlock: shell("contentBlocking", tuple([bool]), strictObject({ trackerBlock: bool, blocked: number,
    allowedHosts: z.array(str).optional() })),
  setSiteTrackers: shell("contentBlocking", tuple([str, bool]), strictObject({ hostname: str, allowed: bool })),
  removeAllowedHost: shell("contentBlocking", tuple([str]), z.array(str)),
  filterLists: shell("contentBlocking", noArgs, filterStatus),
  updateFilters: shell("contentBlocking", noArgs, filterStatus),
  addFilterSource: shell("contentBlocking", tuple([str, str, z.enum(["hosts", "cookie_banner"]).optional()]), z.array(filterSource)),
  removeFilterSource: shell("contentBlocking", tuple([str]), z.array(filterSource)),
  setFilterSourceEnabled: shell("contentBlocking", tuple([str, bool]), z.array(filterSource)),
  setAppearance: shell("core", tuple([z.enum(["system", "dark", "light"]), bool.optional(), bool.optional(),
    z.enum(["liquid-glass", "titlebar", "sidebar", "under-window"]).optional()]), bool),
  dispatchCommand: shell("core", tuple([z.enum(["new-window", "new-private-window"])]), bool),
  setShortcuts: shell("core", tuple([z.array(strictObject({
    commandId: str.max(64), key: str.min(1).max(32), meta: bool, ctrl: bool,
    shift: bool, alt: bool, focusShell: bool.optional(),
  })).max(512)]), bool),
  windowControlsVisible: shell("minimalUi", WindowControlsVisibleSchema, bool),
  extensions: shell("extensions", noArgs, z.array(extension)),
  installStoreExtension: shell("extensions", tuple([str]), extension),
  checkStoreExtensionUpdate: shell("extensions", tuple([str]), extension),
  reloadExtension: shell("extensions", tuple([str]), extension),
  showExtensionAction: shell("extensions", tuple([str, screenRect.optional()]), bool),
  extensionActions: shell("extensions", noArgs, z.array(extensionAction)),
  extensionSidePanel: shell("extensions", tuple([z.enum(["describe", "close"])]), strictObject({ extensionId: str, windowId: str, pageId: str.nullable(), contentId: str.nullable(), title: str, open: bool }).nullable()),
  pinExtensionAction: shell("extensions", tuple([str, bool]), bool),
  extensionCommands: shell("extensions", noArgs, z.array(extensionCommand)),
  setExtensionCommandShortcut: shell("extensions", tuple([str, str, str]), bool),
  setExtensionEnabled: shell("extensions", tuple([str, bool]), extension),
  removeExtension: shell("extensions", tuple([str]), bool),
  installUnpackedExtension: shell("extensions", noArgs, extension.nullable()),
  updateUnpackedExtension: shell("extensions", tuple([str]), extension.nullable()),
  // Profiles
  browserProfiles: shell("profiles", noArgs, z.array(browserProfile)),
  createBrowserProfile: shell("profiles", tuple([str]), browserProfile),
  renameBrowserProfile: shell("profiles", tuple([str, str]), z.array(browserProfile)),
  archiveBrowserProfile: shell("profiles", tuple([str, bool]), z.array(browserProfile)),
  deleteBrowserProfile: shell("profiles", tuple([str]), z.array(browserProfile)),
  openBrowserProfile: shell("profiles", tuple([str]), bool),
  openBrowserProfileUrl: shell("profiles", tuple([str, str]), bool),
  setBrowserProfileAppearance: shell("profiles", tuple([str, strictObject({ color: SpaceColorSchema, icon: str.min(1).max(32) })]), bool),
  focusBrowserProfileSpace: shell("profiles", tuple([str, nullableString]), bool),
  moveTabToProfile: shell("profiles", tuple([str, str]), bool),
  linkRoutes: shell("linkRouting", noArgs, LinkRoutesSchema),
  setLinkRoutes: shell("linkRouting", tuple([number.int().nonnegative(), LinkRoutesSchema]), LinkRoutesSchema),
  testLinkRoute: shell("linkRouting", tuple([z.string().url().max(8192), LinkRouteSourceSchema]),
    strictObject({ destination: LinkRouteDestinationSchema, ruleId: str.optional(), fallback: bool, fallbackReason: routeFallbackReason.optional() })),
  resolveRoutePrompt: shell("linkRouting", tuple([str, LinkRouteDestinationSchema, bool]), bool),
  routedOpens: shell("linkRouting", noArgs, z.array(routedOpen).max(128)),
  routePrompts: shell("linkRouting", noArgs, z.array(routePrompt).max(128)),
  // Credential vault
  autofillProfile: shell("core", noArgs, AutofillProfileSchema.nullable()),
  setAutofillProfile: shell("core", tuple([AutofillProfileSchema]), bool),
  autofill: shell("core", tuple([str]), number),
  vaultFill: shell("core", tuple([str]), bool),
  vaultSave: shell("core", tuple([str, str, str.optional()]), strictObject({ ok: bool, updated: bool })),
  vaultDismiss: shell("core", tuple([str, str, str.optional()]), bool),
  passwordExport: shell("core", tuple([str]), strictObject({ path: str, exported: number, skipped: number }).nullable()),
  passwordImport: shell("core", tuple([str]), strictObject({ added: number, skipped: number }).nullable()),
  // Quick Ask
  quickAskShortcut: shell("quickAsk", tuple([bool.optional()]),
    strictObject({ enabled: bool, registered: bool, error: str })),
  quickAsk: shell("quickAsk", tuple([z.enum(["open", "expand", "dismiss", "status"])]), bool),
  showTabWindow: shell("windowSync", tuple([str]), bool),
  littleWindow: shell("littleWindow", tuple([z.enum(["open", "promote", "close"]),
    strictObject({ url: z.string().url().max(8192).optional(), spaceId: str.optional() })]), bool),
  externalLinkTarget: shell("littleWindow", tuple([z.enum(["little", "main"]).optional()]), z.enum(["little", "main"])),
  javascriptAppleEvents: shell("appleScript", tuple([bool.optional()]), strictObject({ enabled: bool, managed: bool })),
  // Downloads and tab audio
  downloadFolder: shell("core", noArgs, downloadFolderResult),
  chooseDownloadFolder: shell("core", tuple([bool.optional()]), downloadFolderResult),
  spellCheck: shell("core", tuple([bool.optional()]), strictObject({ enabled: bool, managed: bool })),
  startupPreferences: shell("core", tuple([startupPreferences.optional()]), startupPreferences.extend({ managed: bool }).strict()),
  languagePreferences: shell("core", tuple([z.array(str).min(1).max(20).optional()]),
    strictObject({ selected: z.array(str), effective: z.array(str), forced: z.array(str), managed: bool })),
  automaticPictureInPicture: shell("core", tuple([z.enum(["ask", "allow", "block"]).optional()]),
    strictObject({ mode: z.enum(["ask", "allow", "block"]), managed: bool })),
  keepRuntimeInBackground: shell("core", tuple([bool.optional()]),
    strictObject({ enabled: bool, available: bool, managed: bool })),
  defaultPageZoom: shell("core", tuple([z.number().int().min(50).max(200).optional()]),
    strictObject({ percentage: z.number().int(), managed: bool })),
  downloadsSnapshot: shell("core", noArgs, z.array(DownloadSchema)),
  controlDownload: shell("core", tuple([str, z.enum(["pause", "resume", "cancel"])]), noResult),
  retryDownload: shell("core", tuple([str]), noResult),
  tabAudio: shell("core", noArgs, z.record(str, strictObject({ muted: bool, audible: bool, video: bool, pip: bool }))),
  pictureInPicture: shell("pictureInPicture", tuple([str, PictureInPictureOperationSchema]), PictureInPictureResultSchema),
  setStageVisible: shell("core", tuple([z.array(str.min(1).max(256)).max(4)
    .refine(ids => new Set(ids).size === ids.length, "Stage pages must be unique")]), bool),
  tabsUnsavedWork: shell("core", tuple([z.array(strictObject({ pageId: str, url: str }))]),
    z.record(str, z.enum(["clean", "dirty", "unknown"]))),
  archiveTab: shell("autoArchive", tuple([str.min(1).max(128), z.string().url().max(8192), str.min(1).max(200), number.nonnegative()]), strictObject({ archived: bool, reason: str.optional() })),
  tabSleep: shell("tabLifecycle", tuple([str, z.string().url().max(8192)]),
    strictObject({ slept: bool, reason: str.optional(), estimatedSavedBytes: z.number().int().nonnegative().optional() })),
  // Page surfaces and menus
  preview: shell("core", tuple([str]), nullableString),
  contextMenu: shell("core", tuple([z.union([str, z.null()])]), bool),
  navigationMenu: shell("core", tuple([str, z.enum(["back", "forward"])]), bool),
  autocomplete: shell("commandBar", tuple([str]), z.array(autocompleteMatch)),
  readArticle: shell("reader", tuple([str]), strictObject({ title: str, byline: str, site: str,
    url: str, minutes: number, content: readerNode })),
  // Files and system services
  openExternal: shell("core", tuple([str]), z.unknown()),
  revealPath: shell("core", tuple([str]), bool),
  openPath: shell("core", tuple([str]), str),
  saveFile: shell("core", tuple([str, str]), nullableString),
  saveWorkbook: shell("documentArtifacts", tuple([str, z.enum(["snapshot", "csv"]).optional()]), nullableString),
  saveStoredArtifact: shell("documentArtifacts", tuple([str, str]), nullableString),
  openPluginDirectory: shell("skills", noArgs, nullableString),
  pickEvidenceImage: shell("conversation", noArgs, strictObject({ filename: str, dataUrl: str }).nullable()),
  pickEvidenceDocument: shell("conversation", noArgs, strictObject({ filename: str, content: str }).nullable()),
  // External agents
  agentConfig: shell("inboundAgents", tuple([AgentConnectionCreateParams]), strictObject({
    command: str, args: z.array(str), env: z.record(str, str), connection: AgentConnectionSchema })),
  agentConnections: shell("inboundAgents", noArgs, z.array(AgentConnectionSchema)),
  agentClients: shell("inboundAgents", noArgs, z.array(strictObject({
    client: AgentClientSchema, installed: bool, version: str.optional(), error: str.optional() }))),
  revokeAgentConnection: shell("inboundAgents", tuple([str]), AgentConnectionSchema),
  // Diagnostics, backup and restore
  exportDiagnostics: shell("core", noArgs, nullableString),
  exportRuntimeBackup: shell("electronMigration", noArgs, runtimeBackup.nullable()),
  exportMigrationLayout: shell("electronMigration", tuple([str]), strictObject({ path: str }).nullable()),
  stageRuntimeRestore: shell("electronMigration", noArgs, stagedRestore.nullable()),
  cancelRuntimeRestore: shell("electronMigration", noArgs, strictObject({ cancelled: z.literal(true) })),
  runtimeRestoreStatus: shell("electronMigration", noArgs, strictObject({
    pending: bool, lastAppliedAt: number.optional(),
    managedRecovery: strictObject({ generation: number.int().nonnegative(), freshBackupIssued: bool }),
  })),
  healthSummary: shell("core", noArgs, healthSummary),
  clearHealth: shell("core", noArgs, healthSummary),
  // HTTP auth and site controls
  httpAuthRequests: shell("core", noArgs, z.array(httpAuthRequest)),
  respondHttpAuth: shell("core", tuple([str, strictObject({ username: str, password: str }).nullable()]), bool),
  clearSiteData: shell("sitePermissions", tuple([str]), bool),
  siteDataCount: shell("sitePermissions", tuple([str]), strictObject({ domain: str, cookies: number.int().nonnegative() })),
  browsingDataPreview: shell("sitePermissions", tuple([number.int().nonnegative(), number.int().nonnegative()]),
    strictObject({ cookies: number.int().nonnegative(), cacheBytes: number.int().nonnegative(), cacheEstimate: bool })),
  clearBrowsingData: shell("sitePermissions", tuple([number.int().nonnegative(), number.int().nonnegative(),
    strictObject({ cookies: bool, cache: bool })]), bool),
  sitePermissions: shell("sitePermissions", noArgs, z.record(str, z.record(str, z.enum(["allow", "deny"])))),
  clearSitePermission: shell("sitePermissions", tuple([str, str.optional()]), bool),
  cookieControls: shell("sitePermissions", noArgs, strictObject({ blockThirdParty: bool, managed: bool })),
  setCookieControls: shell("sitePermissions", tuple([bool]), bool),
  crashReporting: shell("core", noArgs, strictObject({ available: bool, decided: bool, consent: bool })),
  setCrashReporting: shell("core", tuple([bool]), bool),
  httpsUpgrade: shell("httpsFirst", noArgs, strictObject({ enabled: bool, available: bool, managed: bool })),
  setHttpsUpgrade: shell("httpsFirst", tuple([bool]), bool),
  proceedInsecure: shell("core", tuple([str, str]), bool),
  useHttp: shell("core", tuple([str, str]), bool),
  translatePage: shell("aiTranslate", tuple([str]), strictObject({ lang: str, count: number, truncated: bool })),
  showOriginal: shell("aiTranslate", tuple([str]), number),

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
  onRunAttentionActivated: event("core", strictObject({ runId: str.min(1).max(128), identity: str.min(1).max(128), windowId: str.min(1).max(128) })),
  onTabsPatch: event("core", TabPatchSchema),
  onDictation: event("dictation", strictObject({ sessionId: str,
    type: z.enum(["recording", "finishing", "transcript", "final", "error"]),
    text: str.optional(), message: str.optional() })),
  onSidebarEdge: event("floatingSidebar", bool),
  onToolbarEdge: event("autoHideToolbar", bool),
  onOrganizationChanged: event("spaces", number),
  onShortcut: event("commandRegistry", strictObject({ key: str, meta: bool, shift: bool,
    alt: bool, ctrl: bool.optional(), commandId: str.optional(), websitePassThrough: bool.optional() })),
  onSiteZoomChanged: event("pageZoom", strictObject({})),
  onRuntimeStatus: event("core", strictObject({ connected: bool, detail: str.optional() })),
  onLoading: event("core", strictObject({ pageId: str, loading: bool })),
  onAudio: event("core", strictObject({ pageId: str, muted: bool, audible: bool,
    removed: bool.optional(), video: bool.optional(), pip: bool.optional() })),
  onPictureInPicture: event("pictureInPicture", PictureInPictureResultSchema.extend({ pageId: str })),
  onExtensionActionsChanged: event("extensions", z.array(extensionAction)),
  onSidePanel: event("extensions", strictObject({ extensionId: str, windowId: str, pageId: str.nullable(), contentId: str.nullable(), title: str, open: bool })),
  onFocusSpace: event("profiles", strictObject({ spaceId: str.nullable(), windowId: str })),
  onRoutedOpen: event("linkRouting", routedOpen),
  onRoutePrompt: event("linkRouting", routePrompt),
  onLinkStatus: event("core", strictObject({ pageId: str, text: str })),
  onDownload: event("core", DownloadSchema),
  onTabsPlacement: event("core", strictObject({ pageId: str, windowId: str,
    placement: TabPlacementSchema })),
  onPageAction: event("extensions", PageQuickActionSchema),
  onVaultOffer: event("core", strictObject({ pageId: str, username: str, origin: str,
    kind: z.enum(["save", "update"]), itemId: str.optional(), offerId: str.optional(),
    locked: bool.optional() })),
  onQuickAskState: event("quickAsk", bool),
  onHttpAuthChanged: event("core", strictObject({})),
  onTranslationChanged: event("aiTranslate", strictObject({ pageId: str, lang: nullableString.optional(),
    count: number.optional(), truncated: bool.optional(), pending: bool.optional(),
    error: str.optional() })),
} as const;

export type HostEventId = keyof typeof HostEvents;
export type HostEventPayload<E extends HostEventId> = z.output<(typeof HostEvents)[E]["payload"]>;
