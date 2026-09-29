import {
  AuxError,
  HostCapabilitiesSchema,
  ZapInstallReceiptSchema,
  type HostCapabilities,
  type ZapStylesheetInstall,
  type ZapInstallReceipt,
  type RpcChannel,
  type TabCommandEnvelope,
  type TabCommandAck,
  type OutboundMcpServer,
  type McpStdioLaunchPermit,
  type McpOAuthToken,
  type ChromiumContentBlockReceipt,
  type ChromiumCookieBannerReceipt,
  type CookieBannerRule,
  WebmcpCallResultSchema,
  WebmcpToolSchema,
  type WebmcpCallResult,
  type WebmcpTool,
} from "@aux/contracts";

export interface ContentBlockBegin {
  profileId: string;
  generation: number;
  hostsDigest: string;
  hostCount: number;
  allowedSiteHosts: readonly string[];
  enabled: boolean;
  siteGuard?: { pageId: string; expectedUrl: string; navigationId: number };
}
export interface ContentBlockAppend {
  profileId: string;
  generation: number;
  offset: number;
  hosts: readonly string[];
}
export interface ContentBlockCommit {
  profileId: string;
  generation: number;
  hostsDigest: string;
}
export interface CosmeticBegin {
  profileId: string;
  generation: number;
  rulesDigest: string;
  ruleCount: number;
  enabled: boolean;
  allowedSiteHosts: readonly string[];
  siteGuard?: ContentBlockBegin["siteGuard"];
}
export interface CosmeticAppend {
  profileId: string;
  generation: number;
  offset: number;
  rules: readonly CookieBannerRule[];
}
export interface CosmeticCommit {
  profileId: string;
  generation: number;
  rulesDigest: string;
}

import {
  CredentialHandoffResultSchema,
  type CredentialHandoffRequest,
  type CredentialHandoffResult,
} from "@aux/contracts";

/**
 * Calls into the Electron main process, which owns all native surfaces.
 * In standalone mode (tests, external-only use) the bridge is absent and
 * aux page creation returns an explicit error.
 */
export interface NativeBridge {
  capabilities?(): Promise<HostCapabilities>;
  /** Chromium BookmarkModel owns the tree; the runtime only keeps offline article bodies. */
  bookmarksInvoke?(method: string, params: unknown): Promise<unknown>;
  contentBlockBegin?(request: ContentBlockBegin): Promise<{ accepted: true }>;
  contentBlockAppend?(request: ContentBlockAppend): Promise<{ accepted: true }>;
  contentBlockCommit?(request: ContentBlockCommit): Promise<ChromiumContentBlockReceipt>;
  cosmeticBegin?(request: CosmeticBegin): Promise<{ accepted: true }>;
  cosmeticAppend?(request: CosmeticAppend): Promise<{ accepted: true }>;
  cosmeticCommit?(request: CosmeticCommit): Promise<ChromiumCookieBannerReceipt>;
  /** Chromium HistoryService owns writes once a native history projection is active. */
  historyClear?(range: { since?: number; before?: number }): Promise<{ removed: number }>;
  historyImport?(visits: { url: string; title: string; visitedAt: number }[]): Promise<{ added: number; skipped: number }>;
  historyRemove?(url: string, visitedAt: number, expectedTitle?: string): Promise<{ removed: boolean }>;
  /** The Chromium Profile's TemplateURLService is the selected engine authority. */
  searchEngineGet?(): Promise<string>;
  searchEngineSet?(template: string): Promise<boolean>;
  searchSuggestionsGet?(): Promise<boolean>;
  searchSuggestionsSet?(enabled: boolean): Promise<boolean>;
  /** Install a Profile/site stylesheet before new documents, and report active-document application. */
  installZapStylesheet?(request: ZapStylesheetInstall): Promise<ZapInstallReceipt>;
  webmcpList?(pageId: string): Promise<{ tools: WebmcpTool[] }>;
  webmcpCall?(pageId: string, name: string, input: string): Promise<WebmcpCallResult>;
  listPages?(): Promise<{
    pages: {
      pageId: string;
      windowId?: string;
      marker: string;
      url: string;
      title: string;
      active: boolean;
      showBlankDocument?: boolean;
      cdpTargetId?: string;
    }[];
  }>;
  /** Scoped agent tab commands (§7.3) — same controller humans use, deduplicated + ack'd. */
  tabCommand(envelope: TabCommandEnvelope): Promise<TabCommandAck>;
  focusPage(pageId: string): Promise<{ ok: boolean }>;
  /** Recover a crashed native renderer on its existing tab. */
  recoverPage?(pageId: string, url: string): Promise<{ ok: boolean }>;
  /** Stop an in-flight load without needing the renderer's event loop. */
  stopPage(pageId: string): Promise<{ ok: boolean }>;
  /** Confirm a native view is ready for input; implementations may reject hidden pages. */
  acquireStage(pageId: string, requiresVisible?: boolean): Promise<{ ok: boolean }>;
  releaseStage(pageId: string): Promise<{ ok: boolean }>;
  findInPage(
    pageId: string,
    text: string,
    forward: boolean,
    findNext: boolean,
  ): Promise<{ matches: number; activeMatch?: number }>;
  stopFind(pageId: string, action: "clear" | "keep"): Promise<{ ok: boolean }>;
  setZoom(
    pageId: string,
    level?: number,
    delta?: number,
    reset?: boolean,
    direction?: "in" | "out",
  ): Promise<{ level: number }>;
  /** Write cookies into the shared profile partition. Returns count set. */
  setCookies(cookies: unknown[]): Promise<{ ok: boolean; count: number }>;
  /** Persist a secret via Electron safeStorage (plan A22). */
  storeSecret(name: string, value: string): Promise<{ ok: true }>;
  readSecret(name: string): Promise<{ value?: string }>;
  /** Atomically create or read the current native Profile's protected-storage root. */
  profileStorageRoot?(args: { version: 1 }): Promise<{ value: string }>;
  profileStorageFactor?(args: { version: 1; purpose: "sqlite" }): Promise<{ value: string }>;
  /** Fresh OS authentication for this recovery action; never a reusable grant. */
  recoveryOwnerAuth?(args: { version: 1; purpose: "export" | "restore" }): Promise<{ approved: true }>;
  /** Native host signs a one-use, default-deny launch capability for a reviewed MCP server. */
  prepareMcpStdioLaunch?(server: OutboundMcpServer): Promise<McpStdioLaunchPermit>;
  /** Native host owns OAuth consent/refresh and returns only an ephemeral token for this exact server. */
  mcpOAuthToken?(server: OutboundMcpServer): Promise<McpOAuthToken>;
  captureReadablePage?(
    pageId: string,
    workspaceId: string,
    expectedUrl: string,
  ): Promise<{ url: string; title: string; text: string }>;
  fillSavedPassword?(request: CredentialHandoffRequest): Promise<CredentialHandoffResult>;
  movePage?(
    pageId: string,
    windowId?: string,
    activate?: boolean,
  ): Promise<{ windowId: string; sourceActivePageId: string | null; activePageId?: string | null }>;
  available(): boolean;
}

export class ChannelNativeBridge implements NativeBridge {
  constructor(private channel: RpcChannel) {}
  async capabilities(): Promise<HostCapabilities> {
    return HostCapabilitiesSchema.parse(await this.channel.call("native.capabilities", {}));
  }
  contentBlockBegin(request: ContentBlockBegin) {
    return this.channel.call<{ accepted: true }>("native.contentBlockBegin", request);
  }
  contentBlockAppend(request: ContentBlockAppend) {
    return this.channel.call<{ accepted: true }>("native.contentBlockAppend", request);
  }
  contentBlockCommit(request: ContentBlockCommit) {
    return this.channel.call<ChromiumContentBlockReceipt>("native.contentBlockCommit", request);
  }
  cosmeticBegin(request: CosmeticBegin) {
    return this.channel.call<{ accepted: true }>("native.cosmeticBegin", request);
  }
  cosmeticAppend(request: CosmeticAppend) {
    return this.channel.call<{ accepted: true }>("native.cosmeticAppend", request);
  }
  cosmeticCommit(request: CosmeticCommit) {
    return this.channel.call<ChromiumCookieBannerReceipt>("native.cosmeticCommit", request);
  }
  available() {
    return true;
  }
  bookmarksInvoke(method: string, params: unknown) {
    return this.channel.call<unknown>("native.bookmarksInvoke", { method, params });
  }
  historyClear(range: { since?: number; before?: number }) {
    return this.channel.call<{ removed: number }>("native.historyClear", range);
  }
  historyImport(visits: { url: string; title: string; visitedAt: number }[]) {
    return this.channel.call<{ added: number; skipped: number }>("native.historyImport", { visits });
  }
  historyRemove(url: string, visitedAt: number, expectedTitle?: string) {
    return this.channel.call<{ removed: boolean }>("native.historyRemove", { url, visitedAt,
      ...(expectedTitle === undefined ? {} : { expectedTitle }) });
  }
  searchEngineGet() {
    return this.channel.call<string>("native.searchEngineGet", {});
  }
  searchEngineSet(template: string) {
    return this.channel.call<boolean>("native.searchEngineSet", { template });
  }
  searchSuggestionsGet() {
    return this.channel.call<boolean>("native.searchSuggestionsGet", {});
  }
  searchSuggestionsSet(enabled: boolean) {
    return this.channel.call<boolean>("native.searchSuggestionsSet", { enabled });
  }
  async installZapStylesheet(request: ZapStylesheetInstall): Promise<ZapInstallReceipt> {
    return ZapInstallReceiptSchema.parse(await this.channel.call("native.zapInstallStylesheet", request));
  }
  async webmcpList(pageId: string) {
    return { tools: WebmcpToolSchema.array().parse((await this.channel.call<{ tools: unknown }>("native.webmcpList", { pageId })).tools) };
  }
  async webmcpCall(pageId: string, name: string, input: string) {
    return WebmcpCallResultSchema.parse(await this.channel.call("native.webmcpCall", { pageId, name, input }));
  }
  listPages() {
    return this.channel.call<{
      pages: {
        pageId: string;
        windowId?: string;
        marker: string;
        url: string;
        title: string;
        active: boolean;
        lifecycle?: "placeholder" | "live" | "frozen" | "discarded";
        showBlankDocument?: boolean;
        cdpTargetId?: string;
      }[];
    }>("native.listPages", {});
  }
  tabCommand(envelope: TabCommandEnvelope) {
    return this.channel.call<TabCommandAck>("native.tabCommand", envelope, 55_000);
  }
  movePage(pageId: string, windowId?: string, activate = true) {
    return this.channel.call<{
      windowId: string;
      sourceActivePageId: string | null;
      activePageId?: string | null;
    }>("native.movePage", { pageId, windowId, activate });
  }
  focusPage(pageId: string) {
    return this.channel.call<{ ok: boolean }>("native.focusPage", { pageId });
  }
  recoverPage(pageId: string, url: string) {
    return this.channel.call<{ ok: boolean }>("native.recoverPage", { pageId, url }, 60_000);
  }
  stopPage(pageId: string) {
    return this.channel.call<{ ok: boolean }>("native.stopPage", { pageId });
  }
  acquireStage(pageId: string, requiresVisible = false) {
    return this.channel.call<{ ok: boolean }>("native.acquireStage", { pageId, requiresVisible });
  }
  releaseStage(pageId: string) {
    return this.channel.call<{ ok: boolean }>("native.releaseStage", { pageId });
  }
  findInPage(pageId: string, text: string, forward: boolean, findNext: boolean) {
    return this.channel.call<{ matches: number; activeMatch?: number }>("native.findInPage", {
      pageId,
      text,
      forward,
      findNext,
    });
  }
  stopFind(pageId: string, action: "clear" | "keep") {
    return this.channel.call<{ ok: boolean }>("native.stopFind", { pageId, action });
  }
  setZoom(pageId: string, level?: number, delta?: number, reset?: boolean, direction?: "in" | "out") {
    return this.channel.call<{ level: number }>("native.setZoom", { pageId, level, delta, reset, direction });
  }
  setCookies(cookies: unknown[]) {
    return this.channel.call<{ ok: boolean; count: number }>("native.setCookies", { cookies });
  }
  storeSecret(name: string, value: string) {
    return this.channel.call<{ ok: true }>("native.storeSecret", { name, value });
  }
  readSecret(name: string) {
    return this.channel.call<{ value?: string }>("native.readSecret", { name });
  }
  profileStorageRoot(args: { version: 1 }) {
    return this.channel.call<{ value: string }>("native.profileStorageRoot", args);
  }
  profileStorageFactor(args: { version: 1; purpose: "sqlite" }) {
    return this.channel.call<{ value: string }>("native.profileStorageFactor", args);
  }
  recoveryOwnerAuth(args: { version: 1; purpose: "export" | "restore" }) {
    return this.channel.call<{ approved: true }>("native.recoveryOwnerAuth", args, 120_000);
  }
  prepareMcpStdioLaunch(server: OutboundMcpServer) {
    return this.channel.call<McpStdioLaunchPermit>("native.prepareMcpStdioLaunch", { server }, 30_000);
  }
  mcpOAuthToken(server: OutboundMcpServer) {
    return this.channel.call<McpOAuthToken>("native.mcpOAuthToken", { server }, 30_000);
  }
  captureReadablePage(pageId: string, workspaceId: string, expectedUrl: string) {
    return this.channel.call<{ url: string; title: string; text: string }>(
      "native.captureReadablePage",
      { pageId, workspaceId, expectedUrl },
      15_000,
    );
  }
  async fillSavedPassword(request: CredentialHandoffRequest): Promise<CredentialHandoffResult> {
    return CredentialHandoffResultSchema.parse(
      await this.channel.call("native.fillSavedPassword", request, 65_000),
    );
  }
}

export class NullNativeBridge implements NativeBridge {
  available() {
    return false;
  }
  private fail(): never {
    throw new AuxError(
      "backend_unavailable",
      "No native surface: the runtime is not attached to a Aux desktop shell",
    );
  }
  listPages(): never {
    this.fail();
  }
  tabCommand(): never {
    this.fail();
  }
  focusPage(): never {
    this.fail();
  }
  stopPage(): never {
    this.fail();
  }
  acquireStage(): never {
    this.fail();
  }
  releaseStage(): never {
    this.fail();
  }
  findInPage(): never {
    this.fail();
  }
  stopFind(): never {
    this.fail();
  }
  setZoom(): never {
    this.fail();
  }
  setCookies(): never {
    this.fail();
  }
  async storeSecret(): Promise<{ ok: true }> {
    throw new Error("Secure credential storage is unavailable without the desktop");
  }
  async readSecret() {
    return { value: undefined as string | undefined };
  }
  async captureReadablePage(): Promise<{ url: string; title: string; text: string }> {
    throw new Error("Page-content capture requires the Aux desktop app.");
  }
}
