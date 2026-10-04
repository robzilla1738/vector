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
const shellFor = (feature: AuxFeature | "core") => <A extends z.ZodType, R extends z.ZodType>(args: A, result: R) => shell(feature, args, result);
const coreShell = shellFor("core"), extensionShell = shellFor("extensions"), profileShell = shellFor("profiles"), siteShell = shellFor("sitePermissions"), blockingShell = shellFor("contentBlocking"),
  linkRoutingShell = shellFor("linkRouting"),
  browserImportShell = shellFor("browserImport"),
  electronMigrationShell = shellFor("electronMigration"),
  spacesShell = shellFor("spaces"),
  dictationShell = shellFor("dictation"),
  inboundAgentsShell = shellFor("inboundAgents"),
  activeHtmlShell = shellFor("activeHtml"),
  aiTranslateShell = shellFor("aiTranslate"),
  conversationShell = shellFor("conversation"),
  documentArtifactsShell = shellFor("documentArtifacts"),
  httpsFirstShell = shellFor("httpsFirst"),
  littleWindowShell = shellFor("littleWindow"),
  quickAskShell = shellFor("quickAsk");
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
  capabilities: coreShell(noArgs, HostCapabilitiesSchema),
  appearanceSnapshot: coreShell(noArgs, NativeAppearanceSnapshotSchema),
  defaultBrowser: coreShell(noArgs, strictObject({ isDefault: bool })),
  setDefaultBrowser: coreShell(noArgs, strictObject({ isDefault: bool })),
  tabCommand: {
    ...coreShell(tuple([TabCommandSchema, number.optional()]), TabCommandAckSchema),
    // The bootstrap supplies a command ID before forwarding to Mojo.
    wireArgs: tuple([str.min(8).max(128), TabCommandSchema, number.optional()]),
  },
  bindTabSpace: spacesShell(tuple([str, str]), strictObject({ spaceId: str, workspaceId: str })),
  migrateTabSpaces: spacesShell(tuple([z.array(strictObject({ pageId: str, spaceId: str }))]), strictObject({ migrated: number })),
  tabsSnapshot: coreShell(noArgs, TabCatalogSnapshotSchema),
  organizationSnapshot: spacesShell(noArgs, OrganizationSnapshotSchema),
  organizationCommit: spacesShell(tuple([OrganizationCommitSchema]), OrganizationSnapshotSchema),
  migrationReview: browserImportShell(noArgs, migrationReview),
  migrationBegin: browserImportShell(tuple([token.extend({ confirmed: z.literal(true) })]), z.union([migrationReview, migrationProgress])),
  migrationBatch: browserImportShell(tuple([token.extend({ section: z.enum(["folders", "bookmarks", "tabs"]), offset: number })]), migrationProgress),
  migrationFinish: browserImportShell(tuple([token]), migrationReview),
  migrationRollback: browserImportShell(tuple([token.extend({ confirmed: z.literal(true) })]), migrationReview),
  tabsSince: coreShell(tuple([number]), z.discriminatedUnion("kind", [
    strictObject({ kind: z.literal("patches"), patches: z.array(TabPatchSchema) }),
    strictObject({ kind: z.literal("snapshot"), snapshot: TabCatalogSnapshotSchema }),
  ])),
  surfaceContentId: coreShell(tuple([str]), nullableString),
  resolveSearch: shell("searchEngines", tuple([str]), str),
  focusShell: coreShell(noArgs, noResult),
  /** Browser picks fixed copy. No goal, page, question, or result text crosses this boundary. */
  showRunAttention: coreShell(tuple([strictObject({
    kind: z.enum(["completed", "question", "handoff"]),
    runId: str.min(1).max(128), identity: str.min(1).max(128), windowId: str.min(1).max(128),
  })]), strictObject({ queued: bool })),
  createResultPreview: activeHtmlShell(tuple([str]), str),
  releaseResultPreview: activeHtmlShell(tuple([str]), bool),
  savePagePdf: shell("reports", tuple([str]), nullableString),
  printPage: coreShell(tuple([str]), bool),
  devTools: coreShell(tuple([str, z.enum(["toggle", "inspect"]).optional()]), bool),
  hardReload: coreShell(tuple([str]), bool),
  closeWindow: coreShell(noArgs, bool),
  openFile: coreShell(noArgs, nullableString),
  dictationStatus: dictationShell(noArgs, strictObject({ available: bool, language: str.optional(), reason: str.optional() })),
  startDictation: dictationShell(tuple([str]), bool),
  stopDictation: dictationShell(tuple([str]), bool),
  cancelDictation: dictationShell(tuple([str]), noResult),
  dataDir: coreShell(noArgs, str),
  siteInfo: siteShell(tuple([str]), strictObject({
    pageId: str, url: str, origin: str, title: str,
    security: z.enum(["secure", "local", "insecure"]), cookieCount: number,
    permissions: z.record(str, z.enum(["allow", "deny"])), trackersAllowed: bool, blockedCount: number,
  })),
  siteZoom: shell("pageZoom", tuple([str.optional()]), z.array(strictObject({ origin: str, percentage: number }))),
  privatePageZoom: coreShell(tuple([str, strictObject({
    level: number.optional(), delta: number.optional(), reset: bool.optional(),
    direction: z.enum(["in", "out"]).optional(),
  })]), strictObject({ level: number })),
  privacy: blockingShell(noArgs, strictObject({ trackerBlock: bool, blocked: number,
    allowedHosts: z.array(str).optional(), httpsUpgrade: bool.optional() })),
  setTrackerBlock: blockingShell(tuple([bool]), strictObject({ trackerBlock: bool, blocked: number,
    allowedHosts: z.array(str).optional() })),
  setSiteTrackers: blockingShell(tuple([str, bool]), strictObject({ hostname: str, allowed: bool })),
  removeAllowedHost: blockingShell(tuple([str]), z.array(str)),
  filterLists: blockingShell(noArgs, filterStatus),
  updateFilters: blockingShell(noArgs, filterStatus),
  addFilterSource: blockingShell(tuple([str, str, z.enum(["hosts", "cookie_banner"]).optional()]), z.array(filterSource)),
  removeFilterSource: blockingShell(tuple([str]), z.array(filterSource)),
  setFilterSourceEnabled: blockingShell(tuple([str, bool]), z.array(filterSource)),
  setAppearance: coreShell(tuple([z.enum(["system", "dark", "light"]), bool.optional(), bool.optional(),
    z.enum(["liquid-glass", "titlebar", "sidebar", "under-window"]).optional()]), bool),
  dispatchCommand: coreShell(tuple([z.enum(["new-window", "new-private-window"])]), bool),
  setShortcuts: coreShell(tuple([z.array(strictObject({
    commandId: str.max(64), key: str.min(1).max(32), meta: bool, ctrl: bool,
    shift: bool, alt: bool, focusShell: bool.optional(),
  })).max(512)]), bool),
  windowControlsVisible: shell("minimalUi", WindowControlsVisibleSchema, bool),
  extensions: extensionShell(noArgs, z.array(extension)),
  installStoreExtension: extensionShell(tuple([str]), extension),
  checkStoreExtensionUpdate: extensionShell(tuple([str]), extension),
  reloadExtension: extensionShell(tuple([str]), extension),
  showExtensionAction: extensionShell(tuple([str, screenRect.optional()]), bool),
  extensionActions: extensionShell(noArgs, z.array(extensionAction)),
  extensionSidePanel: extensionShell(tuple([z.enum(["describe", "close"])]), strictObject({ extensionId: str, windowId: str, pageId: str.nullable(), contentId: str.nullable(), title: str, open: bool }).nullable()),
  pinExtensionAction: extensionShell(tuple([str, bool]), bool),
  extensionCommands: extensionShell(noArgs, z.array(extensionCommand)),
  setExtensionCommandShortcut: extensionShell(tuple([str, str, str]), bool),
  setExtensionEnabled: extensionShell(tuple([str, bool]), extension),
  removeExtension: extensionShell(tuple([str]), bool),
  installUnpackedExtension: extensionShell(noArgs, extension.nullable()),
  updateUnpackedExtension: extensionShell(tuple([str]), extension.nullable()),
  // Profiles
  browserProfiles: profileShell(noArgs, z.array(browserProfile)),
  createBrowserProfile: profileShell(tuple([str]), browserProfile),
  renameBrowserProfile: profileShell(tuple([str, str]), z.array(browserProfile)),
  archiveBrowserProfile: profileShell(tuple([str, bool]), z.array(browserProfile)),
  deleteBrowserProfile: profileShell(tuple([str]), z.array(browserProfile)),
  openBrowserProfile: profileShell(tuple([str]), bool),
  openBrowserProfileUrl: profileShell(tuple([str, str]), bool),
  setBrowserProfileAppearance: profileShell(tuple([str, strictObject({ color: SpaceColorSchema, icon: str.min(1).max(32) })]), bool),
  focusBrowserProfileSpace: profileShell(tuple([str, nullableString]), bool),
  moveTabToProfile: profileShell(tuple([str, str]), bool),
  linkRoutes: linkRoutingShell(noArgs, LinkRoutesSchema),
  setLinkRoutes: linkRoutingShell(tuple([number.int().nonnegative(), LinkRoutesSchema]), LinkRoutesSchema),
  testLinkRoute: linkRoutingShell(tuple([z.string().url().max(8192), LinkRouteSourceSchema]),
    strictObject({ destination: LinkRouteDestinationSchema, ruleId: str.optional(), fallback: bool, fallbackReason: routeFallbackReason.optional() })),
  resolveRoutePrompt: linkRoutingShell(tuple([str, LinkRouteDestinationSchema, bool]), bool),
  routedOpens: linkRoutingShell(noArgs, z.array(routedOpen).max(128)),
  routePrompts: linkRoutingShell(noArgs, z.array(routePrompt).max(128)),
  // Credential vault
  autofillProfile: coreShell(noArgs, AutofillProfileSchema.nullable()),
  setAutofillProfile: coreShell(tuple([AutofillProfileSchema]), bool),
  autofill: coreShell(tuple([str]), number),
  vaultFill: coreShell(tuple([str]), bool),
  vaultSave: coreShell(tuple([str, str, str.optional()]), strictObject({ ok: bool, updated: bool })),
  vaultDismiss: coreShell(tuple([str, str, str.optional()]), bool),
  passwordExport: coreShell(tuple([str]), strictObject({ path: str, exported: number, skipped: number }).nullable()),
  passwordImport: coreShell(tuple([str]), strictObject({ added: number, skipped: number }).nullable()),
  // Quick Ask
  quickAskShortcut: quickAskShell(tuple([bool.optional()]),
    strictObject({ enabled: bool, registered: bool, error: str })),
  quickAsk: quickAskShell(tuple([z.enum(["open", "expand", "dismiss", "status"])]), bool),
  showTabWindow: shell("windowSync", tuple([str]), bool),
  littleWindow: littleWindowShell(tuple([z.enum(["open", "promote", "close"]),
    strictObject({ url: z.string().url().max(8192).optional(), spaceId: str.optional() })]), bool),
  externalLinkTarget: littleWindowShell(tuple([z.enum(["little", "main"]).optional()]), z.enum(["little", "main"])),
  javascriptAppleEvents: shell("appleScript", tuple([bool.optional()]), strictObject({ enabled: bool, managed: bool })),
  // Downloads and tab audio
  downloadFolder: coreShell(noArgs, downloadFolderResult),
  chooseDownloadFolder: coreShell(tuple([bool.optional()]), downloadFolderResult),
  spellCheck: coreShell(tuple([bool.optional()]), strictObject({ enabled: bool, managed: bool })),
  startupPreferences: coreShell(tuple([startupPreferences.optional()]), startupPreferences.extend({ managed: bool }).strict()),
  languagePreferences: coreShell(tuple([z.array(str).min(1).max(20).optional()]),
    strictObject({ selected: z.array(str), effective: z.array(str), forced: z.array(str), managed: bool })),
  automaticPictureInPicture: coreShell(tuple([z.enum(["ask", "allow", "block"]).optional()]),
    strictObject({ mode: z.enum(["ask", "allow", "block"]), managed: bool })),
  keepRuntimeInBackground: coreShell(tuple([bool.optional()]),
    strictObject({ enabled: bool, available: bool, managed: bool })),
  defaultPageZoom: coreShell(tuple([z.number().int().min(50).max(200).optional()]),
    strictObject({ percentage: z.number().int(), managed: bool })),
  downloadsSnapshot: coreShell(noArgs, z.array(DownloadSchema)),
  controlDownload: coreShell(tuple([str, z.enum(["pause", "resume", "cancel"])]), noResult),
  retryDownload: coreShell(tuple([str]), noResult),
  tabAudio: coreShell(noArgs, z.record(str, strictObject({ muted: bool, audible: bool, video: bool, pip: bool }))),
  pictureInPicture: shell("pictureInPicture", tuple([str, PictureInPictureOperationSchema]), PictureInPictureResultSchema),
  setStageVisible: coreShell(tuple([z.array(str.min(1).max(256)).max(4)
    .refine(ids => new Set(ids).size === ids.length, "Stage pages must be unique")]), bool),
  tabsUnsavedWork: coreShell(tuple([z.array(strictObject({ pageId: str, url: str }))]),
    z.record(str, z.enum(["clean", "dirty", "unknown"]))),
  archiveTab: shell("autoArchive", tuple([str.min(1).max(128), z.string().url().max(8192), str.min(1).max(200), number.nonnegative()]), strictObject({ archived: bool, reason: str.optional() })),
  tabSleep: shell("tabLifecycle", tuple([str, z.string().url().max(8192)]),
    strictObject({ slept: bool, reason: str.optional(), estimatedSavedBytes: z.number().int().nonnegative().optional() })),
  // Page surfaces and menus
  preview: coreShell(tuple([str]), nullableString),
  contextMenu: coreShell(tuple([z.union([str, z.null()])]), bool),
  navigationMenu: coreShell(tuple([str, z.enum(["back", "forward"])]), bool),
  autocomplete: shell("commandBar", tuple([str]), z.array(autocompleteMatch)),
  readArticle: shell("reader", tuple([str]), strictObject({ title: str, byline: str, site: str,
    url: str, minutes: number, content: readerNode })),
  // Files and system services
  openExternal: coreShell(tuple([str]), z.unknown()),
  revealPath: coreShell(tuple([str]), bool),
  openPath: coreShell(tuple([str]), str),
  saveFile: coreShell(tuple([str, str]), nullableString),
  saveWorkbook: documentArtifactsShell(tuple([str, z.enum(["snapshot", "csv"]).optional()]), nullableString),
  saveStoredArtifact: documentArtifactsShell(tuple([str, str]), nullableString),
  openPluginDirectory: shell("skills", noArgs, nullableString),
  pickEvidenceImage: conversationShell(noArgs, strictObject({ filename: str, dataUrl: str }).nullable()),
  pickEvidenceDocument: conversationShell(noArgs, strictObject({ filename: str, content: str }).nullable()),
  // External agents
  agentConfig: inboundAgentsShell(tuple([AgentConnectionCreateParams]), strictObject({
    command: str, args: z.array(str), env: z.record(str, str), connection: AgentConnectionSchema })),
  agentConnections: inboundAgentsShell(noArgs, z.array(AgentConnectionSchema)),
  agentClients: inboundAgentsShell(noArgs, z.array(strictObject({
    client: AgentClientSchema, installed: bool, version: str.optional(), error: str.optional() }))),
  revokeAgentConnection: inboundAgentsShell(tuple([str]), AgentConnectionSchema),
  // Diagnostics, backup and restore
  exportDiagnostics: coreShell(noArgs, nullableString),
  exportRuntimeBackup: electronMigrationShell(noArgs, runtimeBackup.nullable()),
  exportMigrationLayout: electronMigrationShell(tuple([str]), strictObject({ path: str }).nullable()),
  stageRuntimeRestore: electronMigrationShell(noArgs, stagedRestore.nullable()),
  cancelRuntimeRestore: electronMigrationShell(noArgs, strictObject({ cancelled: z.literal(true) })),
  runtimeRestoreStatus: electronMigrationShell(noArgs, strictObject({
    pending: bool, lastAppliedAt: number.optional(),
    managedRecovery: strictObject({ generation: number.int().nonnegative(), freshBackupIssued: bool }),
  })),
  healthSummary: coreShell(noArgs, healthSummary),
  clearHealth: coreShell(noArgs, healthSummary),
  // HTTP auth and site controls
  httpAuthRequests: coreShell(noArgs, z.array(httpAuthRequest)),
  respondHttpAuth: coreShell(tuple([str, strictObject({ username: str, password: str }).nullable()]), bool),
  clearSiteData: siteShell(tuple([str]), bool),
  siteDataCount: siteShell(tuple([str]), strictObject({ domain: str, cookies: number.int().nonnegative() })),
  browsingDataPreview: siteShell(tuple([number.int().nonnegative(), number.int().nonnegative()]),
    strictObject({ cookies: number.int().nonnegative(), cacheBytes: number.int().nonnegative(), cacheEstimate: bool })),
  clearBrowsingData: siteShell(tuple([number.int().nonnegative(), number.int().nonnegative(),
    strictObject({ cookies: bool, cache: bool })]), bool),
  sitePermissions: siteShell(noArgs, z.record(str, z.record(str, z.enum(["allow", "deny"])))),
  clearSitePermission: siteShell(tuple([str, str.optional()]), bool),
  cookieControls: siteShell(noArgs, strictObject({ blockThirdParty: bool, managed: bool })),
  setCookieControls: siteShell(tuple([bool]), bool),
  crashReporting: coreShell(noArgs, strictObject({ available: bool, decided: bool, consent: bool })),
  setCrashReporting: coreShell(tuple([bool]), bool),
  httpsUpgrade: httpsFirstShell(noArgs, strictObject({ enabled: bool, available: bool, managed: bool })),
  setHttpsUpgrade: httpsFirstShell(tuple([bool]), bool),
  proceedInsecure: coreShell(tuple([str, str]), bool),
  useHttp: coreShell(tuple([str, str]), bool),
  translatePage: aiTranslateShell(tuple([str]), strictObject({ lang: str, count: number, truncated: bool })),
  showOriginal: aiTranslateShell(tuple([str]), number),

} as const;

export type BrowserHostMethodId = keyof typeof BrowserHostMethods;
export type BrowserHostMethodArgs<M extends BrowserHostMethodId> = z.input<(typeof BrowserHostMethods)[M]["args"]>;
export type BrowserHostMethodResult<M extends BrowserHostMethodId> = z.output<(typeof BrowserHostMethods)[M]["result"]>;

const event = <P extends z.ZodType>(feature: AuxFeature | "core", payload: P) => ({
  owner: "browser", feature, profileScoped: true, trusted: "aux-webui", payload,
} as const);

const eventFor = (feature: AuxFeature | "core") => <P extends z.ZodType>(payload: P) => event(feature, payload);
const coreEvent = eventFor("core"), extensionEvent = eventFor("extensions");

/** Events published by the native browser to an authorized Aux WebUI. */
export const HostEvents = {
  onEvent: coreEvent(EventSchema),
  onRunAttentionActivated: coreEvent(strictObject({ runId: str.min(1).max(128), identity: str.min(1).max(128), windowId: str.min(1).max(128) })),
  onTabsPatch: coreEvent(TabPatchSchema),
  onDictation: event("dictation", strictObject({ sessionId: str,
    type: z.enum(["recording", "finishing", "transcript", "final", "error"]),
    text: str.optional(), message: str.optional() })),
  onSidebarEdge: event("floatingSidebar", bool),
  onToolbarEdge: event("autoHideToolbar", bool),
  onOrganizationChanged: event("spaces", number),
  onShortcut: event("commandRegistry", strictObject({ key: str, meta: bool, shift: bool,
    alt: bool, ctrl: bool.optional(), commandId: str.optional(), websitePassThrough: bool.optional() })),
  onSiteZoomChanged: event("pageZoom", strictObject({})),
  onRuntimeStatus: coreEvent(strictObject({ connected: bool, detail: str.optional() })),
  onLoading: coreEvent(strictObject({ pageId: str, loading: bool })),
  onAudio: coreEvent(strictObject({ pageId: str, muted: bool, audible: bool,
    removed: bool.optional(), video: bool.optional(), pip: bool.optional() })),
  onPictureInPicture: event("pictureInPicture", PictureInPictureResultSchema.extend({ pageId: str })),
  onExtensionActionsChanged: extensionEvent(z.array(extensionAction)),
  onSidePanel: extensionEvent(strictObject({ extensionId: str, windowId: str, pageId: str.nullable(), contentId: str.nullable(), title: str, open: bool })),
  onFocusSpace: event("profiles", strictObject({ spaceId: str.nullable(), windowId: str })),
  onRoutedOpen: event("linkRouting", routedOpen),
  onRoutePrompt: event("linkRouting", routePrompt),
  onLinkStatus: coreEvent(strictObject({ pageId: str, text: str })),
  onDownload: coreEvent(DownloadSchema),
  onTabsPlacement: coreEvent(strictObject({ pageId: str, windowId: str,
    placement: TabPlacementSchema })),
  onPageAction: extensionEvent(PageQuickActionSchema),
  onVaultOffer: coreEvent(strictObject({ pageId: str, username: str, origin: str,
    kind: z.enum(["save", "update"]), itemId: str.optional(), offerId: str.optional(),
    locked: bool.optional() })),
  onQuickAskState: event("quickAsk", bool),
  onHttpAuthChanged: coreEvent(strictObject({})),
  onTranslationChanged: event("aiTranslate", strictObject({ pageId: str, lang: nullableString.optional(),
    count: number.optional(), truncated: bool.optional(), pending: bool.optional(),
    error: str.optional() })),
} as const;

export type HostEventId = keyof typeof HostEvents;
export type HostEventPayload<E extends HostEventId> = z.output<(typeof HostEvents)[E]["payload"]>;
