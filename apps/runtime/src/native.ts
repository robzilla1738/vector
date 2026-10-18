import {
  DocumentOriginalChunkSchema,
  type DocumentOriginalReadParams,
  type DocumentOriginalChunk,
} from "@aux/contracts/document-original";
import {
  NativeDocumentJobParams,
  NativeDocumentJobResult,
  type NativeDocumentJobInput,
  type NativeDocumentJobOutput,
} from "@aux/contracts/document-jobs";
import {
  NativeImageNormalizeParams,
  NativeImageNormalizeResult,
  type NativeImageNormalizeInput,
  type NativeImageNormalizeOutput,
} from "@aux/contracts/image-normalize";
import {
  PrivateCloudRequestSchema,
  PrivateCloudResultSchema,
  type PrivateCloudRequest,
  type PrivateCloudResult,
} from "@aux/contracts/private-cloud";
import {
  PrivateBudgetRequestSchema,
  PrivateBudgetResultSchema,
  type PrivateBudgetRequest,
  type PrivateBudgetResult,
} from "@aux/contracts/private-budget";
import {
  PrivateProviderRequestSchema,
  PrivateProviderResultSchema,
  type PrivateProviderRequest,
  type PrivateProviderResult,
} from "@aux/contracts/private-provider";
import {
  NativeCloudPreviewParams,
  NativeCloudPreviewCloseParams,
  CloudPreviewSchema,
} from "@aux/contracts/cloud-preview";
import { MemorySaverSettingsSchema, type MemorySaverSettings } from "@aux/contracts";
import { parsePersonReadContext } from "./services/native-person-reader.js";
import {
  ImportExtensionReviewSchema,
  type ImportExtensionReview,
  type ImportExtensionSelection,
  NativeBrowserImportSelectionSchema,
  type NativeBrowserImportSelection,
  type BrowserExportSource,
  type BrowserExportFormat,
  NativeBrowserImportDiscoverySchema,
  NativeBrowserImportReceiptSchema,
  type NativeBrowserImportDiscovery,
  type NativeBrowserImportReceipt,
  type ImportCategory,
} from "@aux/contracts";
import { RemoteDebuggingStateSchema, type RemoteDebuggingState } from "@aux/contracts/remote-debugging";
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
import type { ContentBlockSource } from "@aux/contracts";
import {
  NativeTerminalListenersParams,
  TerminalListenersSchema,
  NativeTerminalPreviewParams,
  TerminalPreviewSchema,
  NativeTerminalPreviewCloseParams,
  TerminalPreviewClosedSchema,
  TerminalSessionSchema,
  TerminalReadResultSchema,
  TerminalInputResultSchema,
  type TerminalSession,
  type TerminalRead,
  NativeTerminalStartParams,
  NativeTerminalReadParams,
  NativeTerminalInputParams,
  NativeTerminalResizeParams,
  NativeTerminalCloseParams,
} from "@aux/contracts/terminal";
import type { z } from "zod";
import {
  DocumentReadResultSchema,
  type DocumentReadParams,
  type DocumentReadResult,
} from "@aux/contracts/document-intake";
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
  type NativePersonReadContext,
  NativePersonReadParamsSchema,
  NativePersonReadReceiptSchema,
  type PersonReadRequest,
  type NativePersonReadReceipt,
} from "@aux/contracts";

export interface ContentBlockBegin {
  profileId: string;
  baseGeneration: number;
  generation: number;
  filterDigest: string;
  sources: readonly (Omit<ContentBlockSource, "text"> & { bundled: boolean })[];
  allowedSiteHosts: readonly string[];
  enabled: boolean;
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
  desktopContext?(
    input: import("@aux/contracts/desktop-context").NativeDesktopContextRequest,
  ): Promise<import("@aux/contracts/desktop-context").NativeDesktopContextResult>;

  evidenceDocumentBytes?(
    input: DocumentOriginalReadParams & { token: string },
    signal?: AbortSignal,
  ): Promise<DocumentOriginalChunk>;
  evidenceDocumentRead?(
    input: DocumentReadParams & { token: string },
    signal?: AbortSignal,
  ): Promise<DocumentReadResult>;
  evidenceDocumentsRelease?(input: { token: string; selectionId: string }): Promise<{ ok: true }>;
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
  browserImportSelectWindow?(input: {
    token: string;
    sourceId: "safari";
  }): Promise<NativeBrowserImportSelection>;
  browserImportSelectExport?(input: {
    token: string;
    sourceId: BrowserExportSource;
    format: BrowserExportFormat;
  }): Promise<NativeBrowserImportSelection>;
  browserImportExportPoll?(selectionId: string): Promise<NativeBrowserImportSelection>;
  browserImportExportCancel?(selectionId: string): Promise<NativeBrowserImportSelection>;
  browserImportDiscover?(token: string): Promise<NativeBrowserImportDiscovery>;
  browserImportExtensionReview?(input: {
    token: string;
    sourceHandle: string;
  }): Promise<ImportExtensionReview>;
  browserImportBegin?(input: {
    token: string;
    operationId: string;
    sourceHandle: string;
    categories: ImportCategory[];
    extensionReview: ImportExtensionSelection | Record<string, never>;
  }): Promise<NativeBrowserImportReceipt>;
  browserImportPoll?(operationId: string): Promise<NativeBrowserImportReceipt>;
  browserImportCancel?(operationId: string): Promise<NativeBrowserImportReceipt>;
  documentJob?(input: NativeDocumentJobInput): Promise<NativeDocumentJobOutput>;
  imageNormalize?(
    input: NativeImageNormalizeInput,
    signal?: AbortSignal,
  ): Promise<NativeImageNormalizeOutput>;
  personCapture?(input: NativePersonCaptureParams): Promise<NativePersonCaptureReceipt>;
  personReadContext?(pageId: string): Promise<NativePersonReadContext>;
  personRead?(input: { pageId: string; request: PersonReadRequest }): Promise<NativePersonReadReceipt>;
  powerRelease?(): Promise<HostMethodResult<"native.powerRelease">>;
  powerStatus?(): Promise<HostMethodResult<"native.powerStatus">>;
  powerActivity?(input: {
    reason: string;
    durationSec: number;
  }): Promise<HostMethodResult<"native.powerActivity">>;
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
  terminalStart?(params: z.infer<typeof NativeTerminalStartParams>): Promise<TerminalSession>;
  terminalRead?(params: z.infer<typeof NativeTerminalReadParams>): Promise<TerminalRead>;
  terminalInput?(
    params: z.infer<typeof NativeTerminalInputParams>,
  ): Promise<z.infer<typeof TerminalInputResultSchema>>;
  terminalResize?(params: z.infer<typeof NativeTerminalResizeParams>): Promise<TerminalSession>;
  terminalClose?(params: z.infer<typeof NativeTerminalCloseParams>): Promise<TerminalSession>;
  terminalListeners?(
    params: z.infer<typeof NativeTerminalListenersParams>,
  ): Promise<z.infer<typeof TerminalListenersSchema>>;
  terminalPreview?(
    params: z.infer<typeof NativeTerminalPreviewParams>,
  ): Promise<z.infer<typeof TerminalPreviewSchema>>;
  terminalPreviewClose?(
    params: z.infer<typeof NativeTerminalPreviewCloseParams>,
  ): Promise<z.infer<typeof TerminalPreviewClosedSchema>>;
  privateProvider?(request: PrivateProviderRequest): Promise<PrivateProviderResult>;
  privateCloud?(request: PrivateCloudRequest): Promise<PrivateCloudResult>;
  privateBudget?(request: PrivateBudgetRequest): Promise<PrivateBudgetResult>;
  cloudPreview?(
    params: z.infer<typeof NativeCloudPreviewParams>,
  ): Promise<z.infer<typeof CloudPreviewSchema>>;
  cloudPreviewClose?(params: z.infer<typeof NativeCloudPreviewCloseParams>): Promise<{ closed: true }>;
  remoteDebuggingGet?(token: string): Promise<RemoteDebuggingState>;
  remoteDebuggingSet?(token: string, enabled: boolean): Promise<RemoteDebuggingState>;
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
  adoptSessionPage?(
    input: z.infer<(typeof HostMethods)["native.adoptSessionPage"]["args"]>,
  ): Promise<HostMethodResult<"native.adoptSessionPage">>;
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
  spaceBindingsSet?(input: {
    bindings: { spaceId: string; workspaceId: string }[];
  }): Promise<{ accepted: true }>;
  /** Chromium BookmarkModel owns the tree; the runtime only keeps offline article bodies. */
  bookmarksInvoke?(method: string, params: unknown): Promise<unknown>;
  contentBlockState?(request: { profileId: string }): Promise<HostMethodResult<"native.contentBlockState">>;
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
  memorySaverGet?(): Promise<MemorySaverSettings>;
  memorySaverSet?(minutes: MemorySaverSettings["minutes"]): Promise<MemorySaverSettings>;
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
  ): Promise<{ windowId: string; sourceActivePageId: string | null; activePageId?: string | null }>;
  available(): boolean;
}

export class ChannelNativeBridge implements NativeBridge {
  constructor(private channel: RpcChannel) {}
  async evidenceDocumentBytes(
    input: DocumentOriginalReadParams & { token: string },
    signal?: AbortSignal,
  ): Promise<DocumentOriginalChunk> {
    signal?.throwIfAborted();
    const params = HostMethods["native.evidenceDocumentBytes"].args.parse(input);
    let retirement: Promise<{ ok: true }> | undefined;
    const cancel = () => {
      retirement ??= this.evidenceDocumentsRelease({ token: params.token, selectionId: params.selectionId });
      void retirement.catch(() => {});
    };
    signal?.addEventListener("abort", cancel, { once: true });
    try {
      const result = DocumentOriginalChunkSchema.parse(
        await this.channel.call("native.evidenceDocumentBytes", params, 10_000),
      );
      signal?.throwIfAborted();
      return result;
    } finally {
      signal?.removeEventListener("abort", cancel);
      if (retirement) await retirement;
    }
  }
  async evidenceDocumentRead(
    input: DocumentReadParams & { token: string },
    signal?: AbortSignal,
  ): Promise<DocumentReadResult> {
    if (signal?.aborted) throw new AuxError("cancelled", "Document import was cancelled.");
    const params = HostMethods["native.evidenceDocumentRead"].args.parse(input);
    let retirement: Promise<{ ok: true }> | undefined;
    const abort = () => {
      retirement ??= this.evidenceDocumentsRelease({ token: params.token, selectionId: params.selectionId });
      // The original read joins retirement below; attach now so a fast refusal is not unhandled.
      void retirement.catch(() => {});
    };
    signal?.addEventListener("abort", abort, { once: true });
    let failure: unknown;
    try {
      const result = DocumentReadResultSchema.parse(
        await this.channel.call("native.evidenceDocumentRead", params, 70_000),
      );
      if (signal?.aborted) throw new AuxError("cancelled", "Document import was cancelled.");
      return result;
    } catch (error) {
      failure = error;
      throw error;
    } finally {
      signal?.removeEventListener("abort", abort);
      if (retirement) {
        try {
          await retirement;
        } catch (error) {
          if (failure)
            throw new AggregateError([failure, error], "Document capture retirement was not acknowledged.");
          throw error;
        }
      }
    }
  }
  async evidenceDocumentsRelease(input: { token: string; selectionId: string }): Promise<{ ok: true }> {
    const params = HostMethods["native.evidenceDocumentsRelease"].args.parse(input);
    return HostMethods["native.evidenceDocumentsRelease"].result.parse(
      await this.channel.call("native.evidenceDocumentsRelease", params),
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
  async adoptSessionPage(
    input: z.infer<(typeof HostMethods)["native.adoptSessionPage"]["args"]>,
  ): Promise<HostMethodResult<"native.adoptSessionPage">> {
    return HostMethods["native.adoptSessionPage"].result.parse(
      await this.channel.call(
        "native.adoptSessionPage",
        HostMethods["native.adoptSessionPage"].args.parse(input),
      ),
    );
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
  async documentJob(input: NativeDocumentJobInput): Promise<NativeDocumentJobOutput> {
    return NativeDocumentJobResult.parse(
      await this.channel.call(
        "native.documentJob",
        NativeDocumentJobParams.parse(input),
        input.action === "run" || input.action === "capture" || input.action === "close" ? 70_000 : 15_000,
      ),
    );
  }
  async imageNormalize(
    input: NativeImageNormalizeInput,
    signal?: AbortSignal,
  ): Promise<NativeImageNormalizeOutput> {
    signal?.throwIfAborted();
    const result = NativeImageNormalizeResult.parse(
      await this.channel.call("native.imageNormalize", NativeImageNormalizeParams.parse(input), 35_000),
    );
    signal?.throwIfAborted();
    return result;
  }
  async personCapture(input: NativePersonCaptureParams): Promise<NativePersonCaptureReceipt> {
    return NativePersonCaptureReceiptSchema.parse(
      await this.channel.call("native.personCapture", NativePersonCaptureParamsSchema.parse(input)),
    );
  }
  async personReadContext(pageId: string): Promise<NativePersonReadContext> {
    return parsePersonReadContext(
      pageId,
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
  async terminalStart(params: z.infer<typeof NativeTerminalStartParams>) {
    return TerminalSessionSchema.parse(
      await this.channel.call("native.terminalStart", NativeTerminalStartParams.parse(params)),
    );
  }
  async terminalRead(params: z.infer<typeof NativeTerminalReadParams>) {
    return TerminalReadResultSchema.parse(
      await this.channel.call("native.terminalRead", NativeTerminalReadParams.parse(params)),
    );
  }
  async terminalInput(params: z.infer<typeof NativeTerminalInputParams>) {
    return TerminalInputResultSchema.parse(
      await this.channel.call("native.terminalInput", NativeTerminalInputParams.parse(params)),
    );
  }
  async terminalResize(params: z.infer<typeof NativeTerminalResizeParams>) {
    return TerminalSessionSchema.parse(
      await this.channel.call("native.terminalResize", NativeTerminalResizeParams.parse(params)),
    );
  }
  async terminalClose(params: z.infer<typeof NativeTerminalCloseParams>) {
    return TerminalSessionSchema.parse(
      await this.channel.call("native.terminalClose", NativeTerminalCloseParams.parse(params)),
    );
  }
  async terminalListeners(params: z.infer<typeof NativeTerminalListenersParams>) {
    return TerminalListenersSchema.parse(
      await this.channel.call("native.terminalListeners", NativeTerminalListenersParams.parse(params)),
    );
  }
  async terminalPreview(params: z.infer<typeof NativeTerminalPreviewParams>) {
    return TerminalPreviewSchema.parse(
      await this.channel.call("native.terminalPreview", NativeTerminalPreviewParams.parse(params)),
    );
  }
  async terminalPreviewClose(params: z.infer<typeof NativeTerminalPreviewCloseParams>) {
    return TerminalPreviewClosedSchema.parse(
      await this.channel.call("native.terminalPreviewClose", NativeTerminalPreviewCloseParams.parse(params)),
    );
  }

  async privateCloud(request: PrivateCloudRequest): Promise<PrivateCloudResult> {
    const result = await this.channel.call<{ operation: string; cloud: unknown }>("native.privateProvider", {
      operation: "cloud",
      cloud: PrivateCloudRequestSchema.parse(request),
    });
    if (result.operation !== "cloud") throw new AuxError("invalid_params", "Invalid original Sandbox reply.");
    return PrivateCloudResultSchema.parse(result.cloud);
  }
  async privateBudget(request: PrivateBudgetRequest): Promise<PrivateBudgetResult> {
    const result = await this.channel.call<{ operation: string; budget: unknown }>("native.privateProvider", {
      operation: "budget",
      budget: PrivateBudgetRequestSchema.parse(request),
    });
    if (result.operation !== "budget")
      throw new AuxError("invalid_params", "Invalid original account budget reply.");
    return PrivateBudgetResultSchema.parse(result.budget);
  }
  async privateProvider(request: PrivateProviderRequest): Promise<PrivateProviderResult> {
    return PrivateProviderResultSchema.parse(
      await this.channel.call("native.privateProvider", PrivateProviderRequestSchema.parse(request)),
    );
  }
  async cloudPreview(params: z.infer<typeof NativeCloudPreviewParams>) {
    return CloudPreviewSchema.parse(
      await this.channel.call("native.cloudPreview", NativeCloudPreviewParams.parse(params)),
    );
  }
  async cloudPreviewClose(params: z.infer<typeof NativeCloudPreviewCloseParams>) {
    return TerminalPreviewClosedSchema.parse(
      await this.channel.call("native.cloudPreviewClose", NativeCloudPreviewCloseParams.parse(params)),
    );
  }

  async remoteDebuggingGet(token: string): Promise<RemoteDebuggingState> {
    return RemoteDebuggingStateSchema.parse(await this.channel.call("native.remoteDebuggingGet", { token }));
  }
  async remoteDebuggingSet(token: string, enabled: boolean): Promise<RemoteDebuggingState> {
    return RemoteDebuggingStateSchema.parse(
      await this.channel.call("native.remoteDebuggingSet", { token, enabled }),
    );
  }
  async browserImportSelectWindow(input: {
    token: string;
    sourceId: "safari";
  }): Promise<NativeBrowserImportSelection> {
    return NativeBrowserImportSelectionSchema.parse(
      await this.channel.call("native.browserImportSelectWindow", input),
    );
  }
  async browserImportSelectExport(input: {
    token: string;
    sourceId: BrowserExportSource;
    format: BrowserExportFormat;
  }): Promise<NativeBrowserImportSelection> {
    return NativeBrowserImportSelectionSchema.parse(
      await this.channel.call("native.browserImportSelectExport", input),
    );
  }
  async browserImportExportPoll(selectionId: string): Promise<NativeBrowserImportSelection> {
    return NativeBrowserImportSelectionSchema.parse(
      await this.channel.call("native.browserImportExportPoll", { selectionId }),
    );
  }
  async browserImportExportCancel(selectionId: string): Promise<NativeBrowserImportSelection> {
    return NativeBrowserImportSelectionSchema.parse(
      await this.channel.call("native.browserImportExportCancel", { selectionId }),
    );
  }
  async browserImportDiscover(token: string): Promise<NativeBrowserImportDiscovery> {
    return NativeBrowserImportDiscoverySchema.parse(
      await this.channel.call("native.browserImportDiscover", { token }),
    );
  }
  async browserImportExtensionReview(input: {
    token: string;
    sourceHandle: string;
  }): Promise<ImportExtensionReview> {
    return ImportExtensionReviewSchema.parse(
      await this.channel.call("native.browserImportExtensionReview", input),
    );
  }
  async browserImportBegin(input: {
    token: string;
    operationId: string;
    sourceHandle: string;
    categories: ImportCategory[];
    extensionReview: ImportExtensionSelection | Record<string, never>;
  }): Promise<NativeBrowserImportReceipt> {
    return NativeBrowserImportReceiptSchema.parse(
      await this.channel.call("native.browserImportBegin", input),
    );
  }
  async browserImportPoll(operationId: string): Promise<NativeBrowserImportReceipt> {
    return NativeBrowserImportReceiptSchema.parse(
      await this.channel.call("native.browserImportPoll", { operationId }),
    );
  }
  async browserImportCancel(operationId: string): Promise<NativeBrowserImportReceipt> {
    return NativeBrowserImportReceiptSchema.parse(
      await this.channel.call("native.browserImportCancel", { operationId }),
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
  desktopContext(
    input: import("@aux/contracts/desktop-context").NativeDesktopContextRequest,
  ): Promise<import("@aux/contracts/desktop-context").NativeDesktopContextResult> {
    return this.channel.call("native.desktopContext", input, 15_000);
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
  async spaceBindingsSet(input: { bindings: { spaceId: string; workspaceId: string }[] }) {
    return HostMethods["native.spaceBindingsSet"].result.parse(
      await this.channel.call("native.spaceBindingsSet", input),
    );
  }

  async capabilities(): Promise<HostCapabilities> {
    return HostCapabilitiesSchema.parse(await this.channel.call("native.capabilities", {}));
  }
  contentBlockState(request: { profileId: string }) {
    return this.channel.call<HostMethodResult<"native.contentBlockState">>(
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
  async memorySaverGet() {
    return MemorySaverSettingsSchema.parse(await this.channel.call("native.memorySaverGet", {}));
  }
  async memorySaverSet(minutes: MemorySaverSettings["minutes"]) {
    return MemorySaverSettingsSchema.parse(await this.channel.call("native.memorySaverSet", { minutes }));
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
  async captureReadablePage(): Promise<{ url: string; title: string; text: string }> {
    throw new Error("Page-content capture requires the Aux desktop app.");
  }
}
