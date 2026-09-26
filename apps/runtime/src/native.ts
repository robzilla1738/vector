import { AuxError, HostCapabilitiesSchema, ZapInstallReceiptSchema, type HostCapabilities, type ZapStylesheetInstall, type ZapInstallReceipt, type RpcChannel, type CommandSeatbeltPrepare, type CommandSeatbeltPermit, type LocalProject, type ProjectInspection, type ProjectFile, type ProjectCommand, type ProjectReviewContext, type ProjectReviewSummary, type ProjectCommitRequest, type ProjectCommitResult, type ProjectCommandTask, type LocalPreviewCheck, type ProjectGithubStatus, type ProjectIncidentReport, type TabCommandEnvelope, type TabCommandAck, type OutboundMcpServer, type McpStdioLaunchPermit, type McpOAuthToken, type ChromiumContentBlockReceipt, type ChromiumCookieBannerReceipt, type CookieBannerRule } from "@aux/contracts";

export interface ContentBlockBegin {
  profileId: string; generation: number; hostsDigest: string; hostCount: number;
  allowedSiteHosts: readonly string[]; enabled: boolean;
  siteGuard?: { pageId: string; expectedUrl: string; navigationId: number };
}
export interface ContentBlockAppend { profileId: string; generation: number; offset: number; hosts: readonly string[] }
export interface ContentBlockCommit { profileId: string; generation: number; hostsDigest: string }
export interface CosmeticBegin { profileId: string; generation: number; rulesDigest: string; ruleCount: number; enabled: boolean; allowedSiteHosts: readonly string[]; siteGuard?: ContentBlockBegin["siteGuard"] }
export interface CosmeticAppend { profileId: string; generation: number; offset: number; rules: readonly CookieBannerRule[] }
export interface CosmeticCommit { profileId: string; generation: number; rulesDigest: string }

import { CredentialHandoffResultSchema, type CredentialHandoffRequest, type CredentialHandoffResult } from "@aux/contracts";

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
  historyRemove?(url: string, visitedAt: number): Promise<{ removed: boolean }>;
  /** The Chromium Profile's TemplateURLService is the selected engine authority. */
  searchEngineGet?(): Promise<string>;
  searchEngineSet?(template: string): Promise<boolean>;
  searchSuggestionsGet?(): Promise<boolean>;
  searchSuggestionsSet?(enabled: boolean): Promise<boolean>;
  /** Install a Profile/site stylesheet before new documents, and report active-document application. */
  installZapStylesheet?(request: ZapStylesheetInstall): Promise<ZapInstallReceipt>;
  listPages?(): Promise<{ pages: { pageId: string; windowId?: string; marker: string; url: string; title: string; active: boolean; showBlankDocument?: boolean; cdpTargetId?: string }[] }>;
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
  findInPage(pageId: string, text: string, forward: boolean, findNext: boolean): Promise<{ matches: number; activeMatch?: number }>;
  stopFind(pageId: string, action: "clear" | "keep"): Promise<{ ok: boolean }>;
  setZoom(pageId: string, level?: number, delta?: number, reset?: boolean, direction?: "in" | "out"): Promise<{ level: number }>;
  /** Write cookies into the shared profile partition. Returns count set. */
  setCookies(cookies: unknown[]): Promise<{ ok: boolean; count: number }>;
  /** Persist a secret via Electron safeStorage (plan A22). */
  storeSecret(name: string, value: string): Promise<{ ok: true }>;
  readSecret(name: string): Promise<{ value?: string }>;
  /** Native host signs a one-use, default-deny launch capability for a reviewed MCP server. */
  prepareMcpStdioLaunch?(server: OutboundMcpServer): Promise<McpStdioLaunchPermit>;
  /** Native host owns OAuth consent/refresh and returns only an ephemeral token for this exact server. */
  mcpOAuthToken?(server: OutboundMcpServer): Promise<McpOAuthToken>;
  captureReadablePage?(pageId: string, workspaceId: string, expectedUrl: string): Promise<{ url: string; title: string; text: string }>;
  fillSavedPassword?(request: CredentialHandoffRequest): Promise<CredentialHandoffResult>;
  developmentProjects?(projectIds:string[]):Promise<LocalProject[]>;
  inspectProject?(projectId:string):Promise<ProjectInspection>;
  githubProject?(projectId:string):Promise<{owner:string;repository:string;remoteUrl:string;branch:string;baseCommit:string;headCommit:string}>;
  recordGithubStatus?(projectId:string,status:ProjectGithubStatus):Promise<ProjectGithubStatus>;
  writeIncidentReport?(input:{projectId:string;task:ProjectCommandTask;page:{pageId:string;url:string;title:string};console:{level:string;message:string;atMs?:number}[];network:{method:string;status?:number;url:string;durationMs?:number;startedAt?:number}[];operations?:string}):Promise<ProjectIncidentReport>;
  listProjectFiles?(projectId:string):Promise<string[]>;
  readProjectFile?(projectId:string,name:string):Promise<ProjectFile>;
  projectSnapshotTree?(projectId:string):Promise<string>;
  writeProjectFile?(input:{projectId:string;name:string;expectedHash:string;content:string;task:ProjectCommandTask}):Promise<(ProjectFile&{recoveryPath:string})|null>;
  createProjectFile?(input:{projectId:string;name:string;content:string;task:ProjectCommandTask}):Promise<(ProjectFile&{recoveryPath?:string})|null>;
  renameProjectFile?(input:{projectId:string;name:string;nextName:string;expectedHash:string;task:ProjectCommandTask}):Promise<(ProjectFile&{recoveryPath:string})|null>;
  deleteProjectFile?(input:{projectId:string;name:string;expectedHash:string;task:ProjectCommandTask}):Promise<{name:string;recoveryPath:string}|null>;
  projectCommands?(projectId:string):Promise<ProjectCommand[]>;
  prepareCommandSeatbelt?(input:CommandSeatbeltPrepare):Promise<CommandSeatbeltPermit>;
  runProjectCommand?(input:{projectId:string;command:string;mode:ProjectCommand['mode'];task:ProjectCommandTask;seatbeltCapability?:string}):Promise<ProjectCommand|null>;
  approveProjectPreview?(input:{projectId:string;url:string;task:ProjectCommandTask}):Promise<LocalPreviewCheck|null>;
  stopProjectCommand?(projectId:string,commandId:string,task:ProjectCommandTask):Promise<ProjectCommand>;
  prepareProjectReview?(projectId:string,task:ProjectReviewContext):Promise<ProjectReviewSummary>;
  commitProject?(projectId:string,request:ProjectCommitRequest,task:ProjectReviewContext):Promise<ProjectCommitResult|null>;
  approveCloudCommand?(input:{task:ProjectCommandTask;environment:{remoteName:string;runtime:string;region:string};executable:string;args:string[];mode:'command'|'service';timeoutMinutes?:number}):Promise<boolean>;
  movePage?(pageId: string, windowId?: string, activate?: boolean): Promise<{ windowId: string; sourceActivePageId: string | null; activePageId?: string | null }>;
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
  historyRemove(url: string, visitedAt: number) {
    return this.channel.call<{ removed: boolean }>("native.historyRemove", { url, visitedAt });
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
  listPages() {
    return this.channel.call<{ pages: { pageId: string; windowId?: string; marker: string; url: string; title: string; active: boolean; showBlankDocument?: boolean; cdpTargetId?: string }[] }>("native.listPages", {});
  }
  tabCommand(envelope: TabCommandEnvelope) {
    return this.channel.call<TabCommandAck>("native.tabCommand", envelope, 55_000);
  }
  movePage(pageId: string, windowId?: string, activate = true) {
    return this.channel.call<{ windowId: string; sourceActivePageId: string | null; activePageId?: string | null }>("native.movePage", { pageId, windowId, activate });
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
    return this.channel.call<{ matches: number; activeMatch?: number }>("native.findInPage", { pageId, text, forward, findNext });
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
  prepareMcpStdioLaunch(server: OutboundMcpServer) {
    return this.channel.call<McpStdioLaunchPermit>("native.prepareMcpStdioLaunch", { server }, 30_000);
  }
  mcpOAuthToken(server: OutboundMcpServer) {
    return this.channel.call<McpOAuthToken>("native.mcpOAuthToken", { server }, 30_000);
  }
  captureReadablePage(pageId: string, workspaceId: string, expectedUrl: string) {
    return this.channel.call<{ url: string; title: string; text: string }>("native.captureReadablePage", { pageId, workspaceId, expectedUrl }, 15_000);
  }
  async fillSavedPassword(request: CredentialHandoffRequest): Promise<CredentialHandoffResult> {
    return CredentialHandoffResultSchema.parse(await this.channel.call("native.fillSavedPassword", request, 65_000));
  }
  developmentProjects(projectIds:string[]){return this.channel.call<LocalProject[]>("native.developmentProjects",{projectIds});}
  inspectProject(projectId:string){return this.channel.call<ProjectInspection>("native.inspectProject",{projectId});}
  githubProject(projectId:string){return this.channel.call<{owner:string;repository:string;remoteUrl:string;branch:string;baseCommit:string;headCommit:string}>("native.githubProject",{projectId});}
  recordGithubStatus(projectId:string,status:ProjectGithubStatus){return this.channel.call<ProjectGithubStatus>("native.recordGithubStatus",{projectId,status});}
  writeIncidentReport(input:{projectId:string;task:ProjectCommandTask;page:{pageId:string;url:string;title:string};console:{level:string;message:string;atMs?:number}[];network:{method:string;status?:number;url:string;durationMs?:number;startedAt?:number}[];operations?:string}){return this.channel.call<ProjectIncidentReport>("native.writeIncidentReport",input,120_000);}
  listProjectFiles(projectId:string){return this.channel.call<string[]>("native.listProjectFiles",{projectId});}
  readProjectFile(projectId:string,name:string){return this.channel.call<ProjectFile>("native.readProjectFile",{projectId,name});}
  projectSnapshotTree(projectId:string){return this.channel.call<string>('native.projectSnapshotTree',{projectId});}
  writeProjectFile(input:{projectId:string;name:string;expectedHash:string;content:string;task:ProjectCommandTask}){return this.channel.call<(ProjectFile&{recoveryPath:string})|null>("native.writeProjectFile",input,120_000);}
  createProjectFile(input:{projectId:string;name:string;content:string;task:ProjectCommandTask}){return this.channel.call<(ProjectFile&{recoveryPath?:string})|null>("native.createProjectFile",input,120_000);}
  renameProjectFile(input:{projectId:string;name:string;nextName:string;expectedHash:string;task:ProjectCommandTask}){return this.channel.call<(ProjectFile&{recoveryPath:string})|null>("native.renameProjectFile",input,120_000);}
  deleteProjectFile(input:{projectId:string;name:string;expectedHash:string;task:ProjectCommandTask}){return this.channel.call<{name:string;recoveryPath:string}|null>("native.deleteProjectFile",input,120_000);}
  projectCommands(projectId:string){return this.channel.call<ProjectCommand[]>("native.projectCommands",{projectId});}
  prepareCommandSeatbelt(input:CommandSeatbeltPrepare){return this.channel.call<CommandSeatbeltPermit>("native.prepareCommandSeatbelt",input,30_000);}
  runProjectCommand(input:{projectId:string;command:string;mode:ProjectCommand['mode'];task:ProjectCommandTask;seatbeltCapability?:string}){return this.channel.call<ProjectCommand|null>("native.runProjectCommand",input,120_000);}
  approveProjectPreview(input:{projectId:string;url:string;task:ProjectCommandTask}){return this.channel.call<LocalPreviewCheck|null>("native.approveProjectPreview",input,120_000);}
  stopProjectCommand(projectId:string,commandId:string,task:ProjectCommandTask){return this.channel.call<ProjectCommand>("native.stopProjectCommand",{projectId,commandId,task});}
  prepareProjectReview(projectId:string,task:ProjectReviewContext){return this.channel.call<ProjectReviewSummary>("native.prepareProjectReview",{projectId,task});}
  commitProject(projectId:string,request:ProjectCommitRequest,task:ProjectReviewContext){return this.channel.call<ProjectCommitResult|null>("native.commitProject",{projectId,request,task},120_000);}
  approveCloudCommand(input:{task:ProjectCommandTask;environment:{remoteName:string;runtime:string;region:string};executable:string;args:string[];mode:'command'|'service';timeoutMinutes?:number}){return this.channel.call<boolean>('native.approveCloudCommand',input,120_000);}
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
  listPages(): never { this.fail(); }
  tabCommand(): never { this.fail(); }
  focusPage(): never { this.fail(); }
  stopPage(): never { this.fail(); }
  acquireStage(): never { this.fail(); }
  releaseStage(): never { this.fail(); }
  findInPage(): never { this.fail(); }
  stopFind(): never { this.fail(); }
  setZoom(): never { this.fail(); }
  setCookies(): never { this.fail(); }
  async storeSecret(): Promise<{ ok: true }> { throw new Error("Secure credential storage is unavailable without the desktop"); }
  async readSecret() { return { value: undefined as string | undefined }; }
  async captureReadablePage(): Promise<{ url: string; title: string; text: string }> { throw new Error("Page-content capture requires the Aux desktop app."); }
  developmentProjects(): never { this.fail(); }
  inspectProject(): never { this.fail(); }
  githubProject(): never { this.fail(); }
  recordGithubStatus(): never { this.fail(); }
  writeIncidentReport(): never { this.fail(); }
  listProjectFiles(): never { this.fail(); }
  readProjectFile(): never { this.fail(); }
  projectSnapshotTree():never{this.fail();}
  writeProjectFile(): never { this.fail(); }
  createProjectFile(): never { this.fail(); }
  renameProjectFile(): never { this.fail(); }
  deleteProjectFile(): never { this.fail(); }
  projectCommands(): never { this.fail(); }
  runProjectCommand(): never { this.fail(); }
  approveProjectPreview(): never { this.fail(); }
  stopProjectCommand(): never { this.fail(); }
  prepareProjectReview(): never { this.fail(); }
  commitProject(): never { this.fail(); }
  approveCloudCommand(): never { this.fail(); }
}
