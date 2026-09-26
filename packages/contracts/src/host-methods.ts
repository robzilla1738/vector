import { z } from "zod";
import { OrganizationCommitSchema, OrganizationSnapshotSchema } from "./organization.js";
import { TabCatalogSnapshotSchema, TabCommandAckSchema, TabCommandEnvelopeSchema, TabCommandSchema, TabPatchSchema } from "./tabs.js";
import { NativeMethods } from "./bridge.js";
import { CredentialHandoffRequestSchema, CredentialHandoffResultSchema } from "./safety.js";
import { ZapStylesheetInstallSchema, ZapInstallReceiptSchema } from "./zap.js";
import { EventSchema } from "./events.js";
import type { AuxFeature } from "./aux-features.js";

type Owner = "browser" | "runtime";
type Trust = "aux-webui" | "authenticated-runtime";

function method<A extends z.ZodType, R extends z.ZodType>(
  owner: Owner, feature: AuxFeature | "core", trusted: Trust, args: A, result: R,
) {
  return { owner, feature, profileScoped: true, trusted, args, result } as const;
}

const shell = <A extends z.ZodType, R extends z.ZodType>(feature: AuxFeature | "core", args: A, result: R) =>
  method("browser", feature, "aux-webui", args, result);
const runtime = <A extends z.ZodType, R extends z.ZodType>(feature: AuxFeature | "core", args: A, result: R) =>
  method("runtime", feature, "authenticated-runtime", args, result);
const noArgs = z.tuple([]);
const bool = z.boolean();
const str = z.string();
const number = z.number();
const nullableString = str.nullable();
const noResult = z.union([z.undefined(), z.null()]);
const token = z.object({ contentHash: str, manifestSha256: str }).strict();
const migrationProgress = z.object({ status: str, folders: number, bookmarks: number, tabs: number }).strict();
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
const ok = z.object({ ok: bool }).strict();
const accepted = z.object({ accepted: z.literal(true) }).strict();
const pageId = z.object({ pageId: str }).strict();
const contentGuard = z.object({ pageId: str, expectedUrl: str, navigationId: number }).strict().optional();
const contentBase = z.object({ profileId: str, generation: number, allowedSiteHosts: z.array(str),
  enabled: bool, siteGuard: contentGuard }).strict();
const cosmeticRule = z.object({ domains: z.array(str), selector: str }).strict();
const nativePage = z.object({ pageId: str, windowId: str.optional(), marker: str, url: str,
  title: str, active: bool, showBlankDocument: bool.optional(), cdpTargetId: str.optional() }).strict();

/** Methods already handled by the native WebUI. Missing bridge members remain absent. */
export const HostMethods = {
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
  createResultPreview: shell("activeHtml", z.tuple([str]), str),
  releaseResultPreview: shell("activeHtml", z.tuple([str]), bool),
  savePagePdf: shell("reports", z.tuple([str]), nullableString),
  printPage: shell("core", z.tuple([str]), bool),
  devTools: shell("core", z.tuple([str]), bool),
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
  privacy: shell("contentBlocking", noArgs, z.object({ trackerBlock: bool, blocked: number,
    allowedHosts: z.array(str).optional(), httpsUpgrade: bool.optional() }).strict()),
  setTrackerBlock: shell("contentBlocking", z.tuple([bool]), z.object({ trackerBlock: bool, blocked: number }).strict()),
  setSiteTrackers: shell("contentBlocking", z.tuple([str, bool]), z.object({ hostname: str, allowed: bool }).strict()),
  removeAllowedHost: shell("contentBlocking", z.tuple([str]), z.array(str)),
  filterLists: shell("contentBlocking", noArgs, filterStatus),
  updateFilters: shell("contentBlocking", noArgs, filterStatus),
  addFilterSource: shell("contentBlocking", z.tuple([str, str, z.enum(["hosts", "cookie_banner"]).optional()]), z.array(filterSource)),
  removeFilterSource: shell("contentBlocking", z.tuple([str]), z.array(filterSource)),
  setFilterSourceEnabled: shell("contentBlocking", z.tuple([str, bool]), z.array(filterSource)),
  setAppearance: shell("layouts", z.tuple([z.enum(["system", "dark", "light"]), bool.optional(), bool.optional(),
    z.enum(["liquid-glass", "titlebar", "sidebar", "under-window"]).optional()]), bool),
  setShortcuts: shell("core", z.tuple([z.array(z.object({
    commandId: str.max(64), key: str.min(1).max(32), meta: bool, ctrl: bool,
    shift: bool, alt: bool,
  }).strict()).max(512)]), bool),
  extensions: shell("extensions", noArgs, z.array(extension)),
  installStoreExtension: shell("extensions", z.tuple([str]), extension),
  checkStoreExtensionUpdate: shell("extensions", z.tuple([str]), extension),
  reloadExtension: shell("extensions", z.tuple([str]), extension),
  showExtensionAction: shell("extensions", z.tuple([str]), bool),
  setExtensionEnabled: shell("extensions", z.tuple([str, bool]), extension),
  removeExtension: shell("extensions", z.tuple([str]), bool),
  "native.contentBlockBegin": runtime("contentBlocking", contentBase.extend({ hostsDigest: str, hostCount: number }), accepted),
  "native.contentBlockAppend": runtime("contentBlocking", z.object({ profileId: str, generation: number,
    offset: number, hosts: z.array(str) }).strict(), accepted),
  "native.contentBlockCommit": runtime("contentBlocking", z.object({ profileId: str, generation: number,
    hostsDigest: str }).strict(), z.object({ backend: z.enum(["subresource_filter", "declarative_net_request"]),
    generation: number, hostsDigest: str, installedRules: number }).strict()),
  "native.cosmeticBegin": runtime("contentBlocking", contentBase.extend({ rulesDigest: str, ruleCount: number }), accepted),
  "native.cosmeticAppend": runtime("contentBlocking", z.object({ profileId: str, generation: number,
    offset: number, rules: z.array(cosmeticRule) }).strict(), accepted),
  "native.cosmeticCommit": runtime("contentBlocking", z.object({ profileId: str, generation: number,
    rulesDigest: str }).strict(), z.object({ backend: z.literal("isolated_world_stylesheet"), profileId: str,
    private: bool, generation: number, rulesDigest: str, installedRules: number,
    phase: z.literal("document_start"), futureDocuments: z.literal(true) }).strict()),
  "native.bookmarksInvoke": runtime("core", z.object({ method: str, params: z.unknown() }).strict(), z.unknown()),
  "native.historyClear": runtime("core", z.object({ since: number.optional(), before: number.optional() }).strict(), z.object({ removed: number }).strict()),
  "native.historyRemove": runtime("core", z.object({ url: str, visitedAt: number }).strict(), z.object({ removed: bool }).strict()),
  "native.searchEngineGet": runtime("searchEngines", z.object({}).strict(), str),
  "native.searchEngineSet": runtime("searchEngines", z.object({ template: str }).strict(), bool),
  "native.searchSuggestionsGet": runtime("searchEngines", z.object({}).strict(), bool),
  "native.searchSuggestionsSet": runtime("searchEngines", z.object({ enabled: bool }).strict(), bool),
  "native.zapInstallStylesheet": runtime("zapAndUserCss", ZapStylesheetInstallSchema, ZapInstallReceiptSchema),
  "native.listPages": runtime("core", z.object({}).strict(), z.object({ pages: z.array(nativePage) }).strict()),
  "native.tabCommand": runtime("core", TabCommandEnvelopeSchema, TabCommandAckSchema),
  "native.movePage": runtime("core", NativeMethods["native.movePage"], z.object({ windowId: str,
    sourceActivePageId: nullableString, activePageId: nullableString.optional() }).strict()),
  "native.focusPage": runtime("core", pageId, ok),
  "native.recoverPage": runtime("core", NativeMethods["native.recoverPage"], ok),
  "native.stopPage": runtime("core", pageId, ok),
  "native.acquireStage": runtime("core", NativeMethods["native.acquireStage"], ok),
  "native.releaseStage": runtime("core", pageId, ok),
  "native.findInPage": runtime("core", NativeMethods["native.findInPage"], z.object({ matches: number, activeMatch: number.optional() }).strict()),
  "native.stopFind": runtime("core", NativeMethods["native.stopFind"], ok),
  "native.setZoom": runtime("pageZoom", NativeMethods["native.setZoom"], z.object({ level: number }).strict()),
  "native.setCookies": runtime("core", NativeMethods["native.setCookies"], z.object({ ok: bool, count: number }).strict()),
  "native.storeSecret": runtime("vault", NativeMethods["native.storeSecret"], z.object({ ok: z.literal(true) }).strict()),
  "native.readSecret": runtime("vault", NativeMethods["native.readSecret"], z.object({ value: str.optional() }).strict()),
  "native.captureReadablePage": runtime("reader", NativeMethods["native.captureReadablePage"], z.object({ url: str, title: str, text: str }).strict()),
  "native.fillSavedPassword": runtime("passwordManager", CredentialHandoffRequestSchema, CredentialHandoffResultSchema),
  "native.cdpReset": runtime("fourLayerTabApi", z.object({}).strict(), z.unknown()),
  "native.cdpDispatch": runtime("fourLayerTabApi", z.object({ pageId: str, message: str }).strict(), z.unknown()),
  "native.cdpVersion": runtime("fourLayerTabApi", z.object({}).strict(), z.object({ version: str }).strict()),
} as const;

export type HostMethodId = keyof typeof HostMethods;
export type HostMethodArgs<M extends HostMethodId> = z.input<(typeof HostMethods)[M]["args"]>;
export type HostMethodResult<M extends HostMethodId> = z.output<(typeof HostMethods)[M]["result"]>;

const event = <P extends z.ZodType>(feature: AuxFeature | "core", payload: P) => ({
  owner: "browser", feature, profileScoped: true, trusted: "aux-webui", payload,
} as const);

/** Events published by the native browser to an authorized Aux WebUI. */
export const HostEvents = {
  onEvent: event("core", EventSchema),
  onTabsPatch: event("core", TabPatchSchema),
  onDictation: event("dictation", z.object({ sessionId: str,
    type: z.enum(["recording", "finishing", "transcript", "final", "error"]),
    text: str.optional(), message: str.optional() }).strict()),
  onSidebarEdge: event("floatingSidebar", bool),
  onToolbarEdge: event("autoHideToolbar", bool),
  onOrganizationChanged: event("spaces", number),
  onShortcut: event("commandRegistry", z.object({ key: str, meta: bool, shift: bool,
    alt: bool, ctrl: bool.optional(), commandId: str.optional() }).strict()),
  onSiteZoomChanged: event("pageZoom", z.object({}).strict()),
} as const;

export type HostEventId = keyof typeof HostEvents;
export type HostEventPayload<E extends HostEventId> = z.output<(typeof HostEvents)[E]["payload"]>;
