import type { z } from "zod";
import {
  ProjectFilesSchema,
  ProjectFileSchema,
  ProjectChangesSchema,
  NativeProjectFilesParams,
  NativeProjectFileParams,
  NativeProjectChangesParams,
  NativeProjectCancelParams,
  NativeProjectClosedSchema,
} from "@aux/contracts/projects";
import { TurnSourceContextSchema, type TurnSourceContext } from "@aux/contracts/turn-source-context";
import type { DownloadNamingNative, CompletedDownload } from "./services/download-naming.js";
import {
  NativeCreatorClosedSchema,
  NativeCreatorCleanupProofSchema,
  NativeCreatorCleanupParamsSchema,
  NativeCreatorCloseParamsSchema,
  type NativeCreatorCleanupProof,
  ProfileOrganizationSnapshotSchema,
  NativeRecorderStartedSchema,
  NativeRecorderDrainSchema,
  NativeRecorderStoppedSchema,
  HostMethods,
  NativePersonCaptureParamsSchema,
  NativePersonCaptureReceiptSchema,
  type NativePersonCaptureParams,
  type NativePersonCaptureReceipt,
  type HostMethodResult,
  type ProfileOrganizationSnapshot,
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
  type ContentBlockSource,
  WebmcpCallResultSchema,
  WebmcpToolSchema,
  type WebmcpCallResult,
  type WebmcpTool,
  AgentPageCreatedSchema,
  type AgentPageCreate,
  type AgentPageCreated,
  EgressContextSchema,
  type EgressContext,
  type EgressLease,
  NativePersonReadContextParamsSchema,
  NativePersonReadContextSchema,
  type NativePersonReadContext,
  NativePersonReadParamsSchema,
  NativePersonReadReceiptSchema,
  type PersonReadRequest,
  type NativePersonReadReceipt,
} from "@aux/contracts";

export interface ContentBlockBegin {
  profileId: string;
  generation: number;
  filterDigest: string;
  sources: readonly (Omit<ContentBlockSource, "text"> & { bundled: boolean })[];
  allowedSiteHosts: readonly string[];
  enabled: boolean;
  siteGuard?: { pageId: string; expectedUrl: string; navigationId: number };
}
export interface ContentBlockAppend {
  profileId: string;
  generation: number;
  sourceId: string;
  offset: number;
  text: string;
}
export interface ContentBlockCommit {
  profileId: string;
  generation: number;
  filterDigest: string;
}

import {
  NativeCredentialContextParamsSchema,
  NativeCredentialContextSchema,
  NativeCredentialAdmissionParamsSchema,
  NativeCredentialAdmissionSchema,
  NativeCredentialFillParamsSchema,
  type NativeCredentialContext,
  type NativeCredentialAdmissionParams,
  CredentialHandoffResultSchema,
  type CredentialHandoffRequest,
  type CredentialHandoffResult,
} from "@aux/contracts";

import type {
  CopilotNativeStart,
  CopilotNativeStartResult,
  CopilotNativeEndpointResult,
  CopilotNativeStopResult,
} from "@aux/contracts/native-copilot";

/**
 * Calls into the native Chromium host, which owns all native surfaces.
 * In standalone mode (tests, external-only use) the bridge is absent and
 * aux page creation returns an explicit error.
 */
export interface NativeBridge extends Partial<DownloadNamingNative> {
  foundationModelsStatus?(input: {
    token: string;
  }): Promise<HostMethodResult<"native.foundationModelsStatus">>;
  foundationModelsStart?(
    input: import("@aux/contracts/native-foundation-models").NativeFoundationStart,
  ): Promise<HostMethodResult<"native.foundationModelsStart">>;
  foundationModelsRead?(input: {
    token: string;
    requestId: string;
    taskId: string;
  }): Promise<HostMethodResult<"native.foundationModelsRead">>;
  foundationModelsCancel?(
    input: import("@aux/contracts/native-foundation-models").NativeFoundationCancel,
  ): Promise<HostMethodResult<"native.foundationModelsCancel">>;
  projectFiles?(
    params: z.infer<typeof NativeProjectFilesParams>,
  ): Promise<z.infer<typeof ProjectFilesSchema>>;
  projectFile?(params: z.infer<typeof NativeProjectFileParams>): Promise<z.infer<typeof ProjectFileSchema>>;
  projectChanges?(
    params: z.infer<typeof NativeProjectChangesParams>,
  ): Promise<z.infer<typeof ProjectChangesSchema>>;
  projectCancel?(
    params: z.infer<typeof NativeProjectCancelParams>,
  ): Promise<z.infer<typeof NativeProjectClosedSchema>>;

  copilotStart?(input: CopilotNativeStart): Promise<CopilotNativeStartResult>;
  copilotEndpoint?(input: {
    token: string;
    requestId: string;
    helperId: string;
  }): Promise<CopilotNativeEndpointResult>;
  copilotStop?(input: {
    token: string;
    requestId: string;
    helperId?: string;
    reconcile?: true;
  }): Promise<CopilotNativeStopResult>;
  personCapture?(input: NativePersonCaptureParams): Promise<NativePersonCaptureReceipt>;
  personReadContext?(pageId: string): Promise<NativePersonReadContext>;
  personRead?(input: { pageId: string; request: PersonReadRequest }): Promise<NativePersonReadReceipt>;
  powerRelease?(): Promise<HostMethodResult<"native.powerRelease">>;
  powerStatus?(): Promise<HostMethodResult<"native.powerStatus">>;
  powerActivity?(input: {
    reason: string;
    durationSec: number;
  }): Promise<HostMethodResult<"native.powerActivity">>;
  turnSourceContext?(token: string): Promise<TurnSourceContext>;
  organizationSnapshot?(): Promise<ProfileOrganizationSnapshot>;
  recorderStart?(input: { pageId: string }): Promise<HostMethodResult<"native.recorderStart">>;
  recorderDrain?(input: {
    pageId: string;
    recorderId: string;
  }): Promise<HostMethodResult<"native.recorderDrain">>;
  recorderStop?(input: {
    pageId: string;
    recorderId: string;
  }): Promise<HostMethodResult<"native.recorderStop">>;
  createAgentPage?(input: AgentPageCreate): Promise<AgentPageCreated>;
  creatorCleanupProof?(input: { pageId: string; creationId: string }): Promise<NativeCreatorCleanupProof>;
  closeCreatedPage?(input: { proof: NativeCreatorCleanupProof }): Promise<{ closed: true }>;
  egressRunTerminal?(input: { runId: string }): Promise<HostMethodResult<"native.egressRunTerminal">>;
  egressCheckRunResume?(input: { runId: string }): Promise<HostMethodResult<"native.egressCheckRunResume">>;
  egressResumeRun?(input: {
    runId: string;
    ticketId: string;
  }): Promise<HostMethodResult<"native.egressResumeRun">>;
  egressResumePerson?(input: {
    pageId: string;
    ticketId: string;
  }): Promise<HostMethodResult<"native.egressResumePerson">>;
  egressContext?(input: { tabId: string; expectedUrl: string }): Promise<EgressContext>;
  egressInstall?(input: {
    lease: EgressLease;
    expectedUrl: string;
    navigationTransitionId?: string;
  }): Promise<{ accepted: true }>;
  permissionRetire(input: {
    tabId: string;
    batchId: string;
    reservationId: string;
  }): Promise<{ accepted: true }>;
  egressRevoke?(input: { lease: EgressLease }): Promise<{ accepted: true }>;
  capabilities?(): Promise<HostCapabilities>;
  /** Chromium BookmarkModel owns the tree; the runtime only keeps offline article bodies. */
  bookmarksInvoke?(method: string, params: unknown): Promise<unknown>;
  contentBlockState?(request: {
    profileId: string;
  }): Promise<{ receipt: ChromiumContentBlockReceipt | null }>;
  contentBlockBegin?(request: ContentBlockBegin): Promise<{ accepted: true }>;
  contentBlockAppend?(request: ContentBlockAppend): Promise<{ accepted: true }>;
  contentBlockCommit?(request: ContentBlockCommit): Promise<ChromiumContentBlockReceipt>;
  /** Chromium HistoryService owns writes once a native history projection is active. */
  historyClear?(range: { since?: number; before?: number }): Promise<{ removed: number }>;
  historyImport?(
    visits: { url: string; title: string; visitedAt: number }[],
  ): Promise<{ added: number; skipped: number }>;
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
  /** Read this Profile's authoritative shared live-folder configuration. */
  liveFolderSources?(): Promise<{ id: string; live: import("@aux/contracts").LiveFolder }[]>;
  /** Persist a secret via the native protected store. */
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
  credentialContext?(input: { pageId: string; expectedUrl: string }): Promise<NativeCredentialContext>;
  credentialAdmit?(input: NativeCredentialAdmissionParams): Promise<{ receiptId: string }>;
  fillAdmittedSavedPassword?(
    request: CredentialHandoffRequest,
    receiptId: string,
  ): Promise<CredentialHandoffResult>;
  fillSavedPassword?(request: CredentialHandoffRequest): Promise<CredentialHandoffResult>;
  movePage?(
    pageId: string,
    windowId?: string,
    activate?: boolean,
  ): Promise<{
    windowId: string;
    sourceActivePageId: string | null;
    activePageId?: string | null;
  }>;
  available(): boolean;
}

export class ChannelNativeBridge implements NativeBridge {
  constructor(private channel: RpcChannel) {}
  async projectFiles(params: z.infer<typeof NativeProjectFilesParams>) {
    return ProjectFilesSchema.parse(
      await this.channel.call("native.projectFiles", NativeProjectFilesParams.parse(params)),
    );
  }
  async projectFile(params: z.infer<typeof NativeProjectFileParams>) {
    return ProjectFileSchema.parse(
      await this.channel.call("native.projectFile", NativeProjectFileParams.parse(params)),
    );
  }
  async projectChanges(params: z.infer<typeof NativeProjectChangesParams>) {
    return ProjectChangesSchema.parse(
      await this.channel.call("native.projectChanges", NativeProjectChangesParams.parse(params)),
    );
  }
  async projectCancel(params: z.infer<typeof NativeProjectCancelParams>) {
    return NativeProjectClosedSchema.parse(
      await this.channel.call("native.projectCancel", NativeProjectCancelParams.parse(params)),
    );
  }
  copilotStart(input: CopilotNativeStart): Promise<CopilotNativeStartResult> {
    return this.channel.call("native.copilotStart", input, 45_000);
  }
  copilotEndpoint(input: {
    token: string;
    requestId: string;
    helperId: string;
  }): Promise<CopilotNativeEndpointResult> {
    return this.channel.call("native.copilotEndpoint", input, 45_000);
  }
  copilotStop(input: {
    token: string;
    requestId: string;
    helperId?: string;
    reconcile?: true;
  }): Promise<CopilotNativeStopResult> {
    return this.channel.call("native.copilotStop", input, 45_000);
  }
  async recorderStart(input: { pageId: string }): Promise<HostMethodResult<"native.recorderStart">> {
    return NativeRecorderStartedSchema.parse(await this.channel.call("native.recorderStart", input));
  }
  async recorderDrain(input: {
    pageId: string;
    recorderId: string;
  }): Promise<HostMethodResult<"native.recorderDrain">> {
    return NativeRecorderDrainSchema.parse(await this.channel.call("native.recorderDrain", input));
  }
  async recorderStop(input: {
    pageId: string;
    recorderId: string;
  }): Promise<HostMethodResult<"native.recorderStop">> {
    return NativeRecorderStoppedSchema.parse(await this.channel.call("native.recorderStop", input));
  }
  async creatorCleanupProof(input: {
    pageId: string;
    creationId: string;
  }): Promise<NativeCreatorCleanupProof> {
    return NativeCreatorCleanupProofSchema.parse(
      await this.channel.call("native.creatorCleanupProof", NativeCreatorCleanupParamsSchema.parse(input)),
    );
  }
  async closeCreatedPage(input: { proof: NativeCreatorCleanupProof }): Promise<{ closed: true }> {
    return NativeCreatorClosedSchema.parse(
      await this.channel.call("native.closeCreatedPage", NativeCreatorCloseParamsSchema.parse(input), 55_000),
    );
  }
  async createAgentPage(input: AgentPageCreate): Promise<AgentPageCreated> {
    return AgentPageCreatedSchema.parse(await this.channel.call("native.createAgentPage", input, 55_000));
  }
  async egressRunTerminal(input: { runId: string }): Promise<HostMethodResult<"native.egressRunTerminal">> {
    return HostMethods["native.egressRunTerminal"].result.parse(
      await this.channel.call("native.egressRunTerminal", input),
    );
  }
  async egressCheckRunResume(input: {
    runId: string;
  }): Promise<HostMethodResult<"native.egressCheckRunResume">> {
    return HostMethods["native.egressCheckRunResume"].result.parse(
      await this.channel.call("native.egressCheckRunResume", input),
    );
  }
  async egressResumeRun(input: {
    runId: string;
    ticketId: string;
  }): Promise<HostMethodResult<"native.egressResumeRun">> {
    return HostMethods["native.egressResumeRun"].result.parse(
      await this.channel.call("native.egressResumeRun", input),
    );
  }
  async egressResumePerson(input: {
    pageId: string;
    ticketId: string;
  }): Promise<HostMethodResult<"native.egressResumePerson">> {
    return HostMethods["native.egressResumePerson"].result.parse(
      await this.channel.call("native.egressResumePerson", input),
    );
  }
  async egressContext(input: { tabId: string; expectedUrl: string }): Promise<EgressContext> {
    return EgressContextSchema.parse(await this.channel.call("native.egressContext", input));
  }
  egressInstall(input: {
    lease: EgressLease;
    expectedUrl: string;
    navigationTransitionId?: string;
  }): Promise<{ accepted: true }> {
    return this.channel.call("native.egressInstall", input);
  }
  permissionRetire(input: {
    tabId: string;
    batchId: string;
    reservationId: string;
  }): Promise<{ accepted: true }> {
    return this.channel.call("native.permissionRetire", input);
  }
  egressRevoke(input: { lease: EgressLease }): Promise<{ accepted: true }> {
    return this.channel.call("native.egressRevoke", input);
  }
  async personCapture(input: NativePersonCaptureParams): Promise<NativePersonCaptureReceipt> {
    return NativePersonCaptureReceiptSchema.parse(
      await this.channel.call("native.personCapture", NativePersonCaptureParamsSchema.parse(input)),
    );
  }
  async personReadContext(pageId: string): Promise<NativePersonReadContext> {
    return NativePersonReadContextSchema.parse(
      await this.channel.call(
        "native.personReadContext",
        NativePersonReadContextParamsSchema.parse({ pageId }),
      ),
    );
  }
  async personRead(input: { pageId: string; request: PersonReadRequest }): Promise<NativePersonReadReceipt> {
    return NativePersonReadReceiptSchema.parse(
      await this.channel.call("native.personRead", NativePersonReadParamsSchema.parse(input)),
    );
  }
  async powerRelease() {
    return HostMethods["native.powerRelease"].result.parse(
      await this.channel.call("native.powerRelease", {}),
    );
  }
  async powerStatus() {
    return HostMethods["native.powerStatus"].result.parse(await this.channel.call("native.powerStatus", {}));
  }
  async powerActivity(input: { reason: string; durationSec: number }) {
    return HostMethods["native.powerActivity"].result.parse(
      await this.channel.call("native.powerActivity", input),
    );
  }
  async turnSourceContext(token: string): Promise<TurnSourceContext> {
    return TurnSourceContextSchema.parse(await this.channel.call("native.turnSourceContext", { token }));
  }
  async organizationSnapshot(): Promise<ProfileOrganizationSnapshot> {
    return ProfileOrganizationSnapshotSchema.parse(
      await this.channel.call("native.organizationSnapshot", {}),
    );
  }
  foundationModelsStatus(input: {
    token: string;
  }): Promise<HostMethodResult<"native.foundationModelsStatus">> {
    return this.channel.call("native.foundationModelsStatus", input, 45_000);
  }
  foundationModelsStart(
    input: import("@aux/contracts/native-foundation-models").NativeFoundationStart,
  ): Promise<HostMethodResult<"native.foundationModelsStart">> {
    return this.channel.call("native.foundationModelsStart", input, 45_000);
  }
  foundationModelsRead(input: {
    token: string;
    requestId: string;
    taskId: string;
  }): Promise<HostMethodResult<"native.foundationModelsRead">> {
    return this.channel.call("native.foundationModelsRead", input, 45_000);
  }
  foundationModelsCancel(
    input: import("@aux/contracts/native-foundation-models").NativeFoundationCancel,
  ): Promise<HostMethodResult<"native.foundationModelsCancel">> {
    return this.channel.call("native.foundationModelsCancel", input, 45_000);
  }
  async capabilities(): Promise<HostCapabilities> {
    return HostCapabilitiesSchema.parse(await this.channel.call("native.capabilities", {}));
  }
  contentBlockState(request: { profileId: string }) {
    return this.channel.call<{ receipt: ChromiumContentBlockReceipt | null }>(
      "native.contentBlockState",
      request,
    );
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
    return this.channel.call<{ removed: boolean }>("native.historyRemove", {
      url,
      visitedAt,
      ...(expectedTitle === undefined ? {} : { expectedTitle }),
    });
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
    return {
      tools: WebmcpToolSchema.array().parse(
        (await this.channel.call<{ tools: unknown }>("native.webmcpList", { pageId })).tools,
      ),
    };
  }
  async webmcpCall(pageId: string, name: string, input: string) {
    return WebmcpCallResultSchema.parse(
      await this.channel.call("native.webmcpCall", { pageId, name, input }),
    );
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
  downloadRenameReceipts() {
    return this.channel.call<import("./services/download-naming.js").RenameReceipt[]>(
      "native.downloadRenameReceipts",
      {},
    );
  }
  downloadNamingCandidate(downloadId: string) {
    return this.channel.call<CompletedDownload | null>("native.downloadNamingCandidate", { downloadId });
  }
  downloadPreviewText(downloadId: string) {
    return this.channel.call<{ text: string }>("native.downloadPreviewText", { downloadId });
  }
  renameDownload(input: Parameters<DownloadNamingNative["renameDownload"]>[0]) {
    return this.channel.call<Awaited<ReturnType<DownloadNamingNative["renameDownload"]>>>(
      "native.renameDownload",
      input,
    );
  }
  undoDownloadRename(receiptId: string) {
    return this.channel.call<Awaited<ReturnType<DownloadNamingNative["undoDownloadRename"]>>>(
      "native.undoDownloadRename",
      { receiptId },
    );
  }
  liveFolderSources() {
    return this.channel.call<{ id: string; live: import("@aux/contracts").LiveFolder }[]>(
      "native.liveFolderSources",
      {},
    );
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
  async credentialContext(input: { pageId: string; expectedUrl: string }): Promise<NativeCredentialContext> {
    return NativeCredentialContextSchema.parse(
      await this.channel.call("native.credentialContext", NativeCredentialContextParamsSchema.parse(input)),
    );
  }
  async credentialAdmit(input: NativeCredentialAdmissionParams): Promise<{ receiptId: string }> {
    return NativeCredentialAdmissionSchema.parse(
      await this.channel.call("native.credentialAdmit", NativeCredentialAdmissionParamsSchema.parse(input)),
    );
  }
  async fillAdmittedSavedPassword(
    request: CredentialHandoffRequest,
    receiptId: string,
  ): Promise<CredentialHandoffResult> {
    return CredentialHandoffResultSchema.parse(
      await this.channel.call(
        "native.fillSavedPassword",
        NativeCredentialFillParamsSchema.parse({ ...request, receiptId }),
        65_000,
      ),
    );
  }
  async fillSavedPassword(request: CredentialHandoffRequest): Promise<CredentialHandoffResult> {
    return CredentialHandoffResultSchema.parse(
      await this.channel.call("native.fillSavedPassword", request, 65_000),
    );
  }
}

export class NullNativeBridge implements NativeBridge {
  async permissionRetire(_input: {
    tabId: string;
    batchId: string;
    reservationId: string;
  }): Promise<{ accepted: true }> {
    throw new AuxError("backend_unavailable", "Native permission retirement is unavailable.");
  }
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
  async captureReadablePage(): Promise<{
    url: string;
    title: string;
    text: string;
  }> {
    throw new Error("Page-content capture requires the Aux desktop app.");
  }
}
