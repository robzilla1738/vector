import { DocumentOriginalReadParamsSchema, DocumentOriginalChunkSchema } from "./document-original.js";
import { NativeDocumentJobParams, NativeDocumentJobResult } from "./document-jobs.js";
import { NativeDesktopContextRequestSchema, NativeDesktopContextResultSchema } from "./desktop-context.js";
import { NativeImageNormalizeParams, NativeImageNormalizeResult } from "./image-normalize.js";
import { DocumentReadParamsSchema, DocumentReadResultSchema } from "./document-intake.js";
import { PrivateRuntimeRequestSchema, PrivateRuntimeResultSchema } from "./private-provider.js";
import {
  NativeCloudPreviewParams,
  NativeCloudPreviewCloseParams,
  CloudPreviewSchema,
} from "./cloud-preview.js";
import { MemorySaverMinutesSchema, MemorySaverSettingsSchema } from "./memory-saver.js";
import {
  NativeFoundationStatusParams,
  NativeFoundationStatusSchema,
  NativeFoundationStartParams,
  NativeFoundationReceiptSchema,
  NativeFoundationReadParams,
  NativeFoundationReadSchema,
  NativeFoundationCancelParams,
} from "./native-foundation-models.js";
import {
  NativeCopilotStartParams,
  NativeCopilotStartSchema,
  NativeCopilotEndpointParams,
  NativeCopilotEndpointSchema,
  NativeCopilotStopParams,
  NativeCopilotStoppedSchema,
} from "./native-copilot.js";
import {
  BrowserExportSourceSchema,
  BrowserExportFormatSchema,
  ImportExtensionReviewSchema,
  ImportExtensionSelectionSchema,
  NativeBrowserImportSelectionSchema,
  ImportCategorySchema,
  NativeBrowserImportDiscoverySchema,
  NativeBrowserImportReceiptSchema,
} from "./import.js";
import { RemoteDebuggingStateSchema } from "./remote-debugging.js";
import {
  ProjectFilesSchema,
  ProjectFileSchema,
  ProjectChangesSchema,
  NativeProjectFilesParams,
  NativeProjectFileParams,
  NativeProjectChangesParams,
  NativeProjectCancelParams,
  NativeProjectClosedSchema,
} from "./projects.js";
import {
  ContentBlockStateSchema,
  ContentBlockBeginSchema,
  ContentBlockAppendSchema,
  ContentBlockCommitSchema,
  ContentBlockReceiptSchema,
} from "./content-blocking-schema.js";
import {
  NativeTerminalListenersParams,
  TerminalListenersSchema,
  NativeTerminalPreviewParams,
  TerminalPreviewSchema,
  NativeTerminalPreviewCloseParams,
  TerminalPreviewClosedSchema,
  NativeTerminalStartParams,
  NativeTerminalReadParams,
  NativeTerminalInputParams,
  NativeTerminalResizeParams,
  NativeTerminalCloseParams,
  TerminalSessionSchema,
  TerminalReadResultSchema,
  TerminalInputResultSchema,
} from "./terminal.js";
import { TurnSourceContextSchema } from "./turn-source-context.js";
import {
  NativeCredentialContextParamsSchema,
  NativeCredentialContextSchema,
  NativeCredentialAdmissionParamsSchema,
  NativeCredentialAdmissionSchema,
  NativeCredentialFillParamsSchema,
} from "./native-credentials.js";
import {
  NativeCdpCatalogSchema,
  NativeCdpAttachSchema,
  NativeCdpAttachedSchema,
  NativeCdpDispatchSchema,
  NativeCdpStartNavigationSchema,
  NativeCdpNavigationStartedSchema,
  NativeCdpArmInputSchema,
  NativeCdpInputOutcomeSchema,
  NativeCdpNavigationRequestSchema,
  NativeCdpNavigationOutcomeSchema,
} from "./native-cdp.js";
import {
  NativeRecorderStartSchema,
  NativeRecorderReceiptSchema,
  NativeRecorderStartedSchema,
  NativeRecorderDrainSchema,
  NativeRecorderStoppedSchema,
} from "./native-recorder.js";
import { z } from "zod";
import {
  NativePersonCaptureParamsSchema,
  NativePersonCaptureReceiptSchema,
} from "./native-person-capture.js";
import {
  NativePersonReadParamsSchema,
  NativePersonReadReceiptSchema,
  NativePersonReadContextParamsSchema,
  NativePersonReadContextSchema,
} from "./native-person-read.js";
import { LiveFolderSchema } from "./live-folders.js";
import { NativeMethods } from "./bridge.js";
import { CredentialHandoffResultSchema } from "./safety.js";
import { WebmcpCallResultSchema, WebmcpToolSchema } from "./webmcp.js";
import { ZapStylesheetInstallSchema, ZapInstallReceiptSchema } from "./zap.js";
import type { AuxFeature } from "./aux-features.js";
import {
  RenameDownloadSchema,
  DownloadCompletedNativeSchema,
  DownloadRenameReceiptSchema,
} from "./download-naming.js";
import { PowerActivitySchema } from "./night-shift.js";
import {
  NativeCreatorClosedSchema,
  NativeCreatorCleanupProofSchema,
  NativeCreatorCleanupParamsSchema,
  NativeCreatorCloseParamsSchema,
  AgentPageCreateSchema,
  SessionPageAdoptSchema,
  AgentPageCreatedSchema,
  EgressContextRequestSchema,
  EgressContextSchema,
  EgressInstallSchema,
  EgressRevokeSchema,
} from "./egress.js";
import { ProfileOrganizationSnapshotSchema } from "./organization.js";
import { TabCommandEnvelopeSchema, TabCommandAckSchema } from "./tabs.js";
import { HostCapabilitiesSchema } from "./host-capabilities.js";

const runtime = <A extends z.ZodType, R extends z.ZodType>(
  feature: AuxFeature | "core",
  args: A,
  result: R,
) =>
  ({
    owner: "runtime",
    feature,
    profileScoped: true,
    trusted: "authenticated-runtime",
    args,
    result,
  }) as const;
const bool = z.boolean();
const str = z.string();
const number = z.number();
const nullableString = str.nullable();
const ok = z.object({ ok: bool }).strict();
const accepted = z.object({ accepted: z.literal(true) }).strict();
const pageId = z.object({ pageId: str }).strict();
const nativePage = z
  .object({
    pageId: str,
    windowId: str.optional(),
    marker: str,
    url: str,
    title: str,
    active: bool,
    showBlankDocument: bool.optional(),
    cdpTargetId: str.optional(),
  })
  .strict();

/** Methods admitted only from the authenticated runtime connection. */
export const RuntimeHostMethods = {
  "native.desktopContext": runtime(
    "desktopContext",
    NativeDesktopContextRequestSchema,
    NativeDesktopContextResultSchema,
  ),
  "native.foundationModelsStatus": runtime(
    "core",
    NativeFoundationStatusParams,
    NativeFoundationStatusSchema,
  ),
  "native.foundationModelsStart": runtime("core", NativeFoundationStartParams, NativeFoundationReceiptSchema),
  "native.foundationModelsRead": runtime("core", NativeFoundationReadParams, NativeFoundationReadSchema),
  "native.foundationModelsCancel": runtime(
    "core",
    NativeFoundationCancelParams,
    NativeFoundationReceiptSchema,
  ),
  "native.copilotStart": runtime("core", NativeCopilotStartParams, NativeCopilotStartSchema),
  "native.copilotEndpoint": runtime("core", NativeCopilotEndpointParams, NativeCopilotEndpointSchema),
  "native.copilotStop": runtime("core", NativeCopilotStopParams, NativeCopilotStoppedSchema),
  "native.remoteDebuggingGet": runtime(
    "core",
    z.object({ token: z.string().uuid() }).strict(),
    RemoteDebuggingStateSchema,
  ),
  "native.remoteDebuggingSet": runtime(
    "core",
    z.object({ token: z.string().uuid(), enabled: z.boolean() }).strict(),
    RemoteDebuggingStateSchema,
  ),
  "native.contentBlockState": runtime(
    "contentBlocking",
    z.object({ profileId: z.string().min(1).max(128) }).strict(),
    ContentBlockStateSchema,
  ),
  "native.contentBlockBegin": runtime("contentBlocking", ContentBlockBeginSchema, accepted),
  "native.contentBlockAppend": runtime("contentBlocking", ContentBlockAppendSchema, accepted),
  "native.contentBlockCommit": runtime(
    "contentBlocking",
    ContentBlockCommitSchema,
    ContentBlockReceiptSchema,
  ),
  "native.projectFiles": runtime("core", NativeProjectFilesParams, ProjectFilesSchema),
  "native.projectFile": runtime("core", NativeProjectFileParams, ProjectFileSchema),
  "native.projectChanges": runtime("core", NativeProjectChangesParams, ProjectChangesSchema),
  "native.projectCancel": runtime("core", NativeProjectCancelParams, NativeProjectClosedSchema),
  "native.terminalStart": runtime("core", NativeTerminalStartParams, TerminalSessionSchema),
  "native.terminalRead": runtime("core", NativeTerminalReadParams, TerminalReadResultSchema),
  "native.terminalInput": runtime("core", NativeTerminalInputParams, TerminalInputResultSchema),
  "native.terminalResize": runtime("core", NativeTerminalResizeParams, TerminalSessionSchema),
  "native.terminalClose": runtime("core", NativeTerminalCloseParams, TerminalSessionSchema),
  "native.terminalListeners": runtime("core", NativeTerminalListenersParams, TerminalListenersSchema),
  "native.privateProvider": runtime("core", PrivateRuntimeRequestSchema, PrivateRuntimeResultSchema),
  "native.cloudPreview": runtime("core", NativeCloudPreviewParams, CloudPreviewSchema),
  "native.cloudPreviewClose": runtime("core", NativeCloudPreviewCloseParams, TerminalPreviewClosedSchema),
  "native.terminalPreview": runtime("core", NativeTerminalPreviewParams, TerminalPreviewSchema),
  "native.terminalPreviewClose": runtime(
    "core",
    NativeTerminalPreviewCloseParams,
    TerminalPreviewClosedSchema,
  ),
  "native.evidenceDocumentRead": runtime(
    "conversation",
    DocumentReadParamsSchema.extend({ token: z.string().uuid() }).strict(),
    DocumentReadResultSchema,
  ),
  "native.evidenceDocumentBytes": runtime(
    "conversation",
    DocumentOriginalReadParamsSchema.extend({ token: z.string().uuid() }).strict(),
    DocumentOriginalChunkSchema,
  ),
  "native.evidenceDocumentsRelease": runtime(
    "conversation",
    z.object({ token: z.string().uuid(), selectionId: z.string().uuid() }).strict(),
    z.object({ ok: z.literal(true) }).strict(),
  ),
  "native.turnSourceContext": runtime(
    "tabMentions",
    z.object({ token: z.string().uuid() }).strict(),
    TurnSourceContextSchema,
  ),
  "native.organizationSnapshot": runtime("core", z.object({}).strict(), ProfileOrganizationSnapshotSchema),
  "native.bookmarksInvoke": runtime(
    "core",
    z.object({ method: str, params: z.unknown() }).strict(),
    z.unknown(),
  ),
  "native.liveFolderSources": runtime(
    "liveFolders",
    z.object({}).strict(),
    z.array(z.object({ id: str.min(1).max(200), live: LiveFolderSchema }).strict()).max(1000),
  ),
  "native.capabilities": runtime("core", z.object({}).strict(), HostCapabilitiesSchema),
  "native.downloadRenameReceipts": runtime(
    "smartDownloadNames",
    z.object({}).strict(),
    z.array(DownloadRenameReceiptSchema).max(1000),
  ),
  "native.downloadNamingCandidate": runtime(
    "smartDownloadNames",
    z.object({ downloadId: str.min(1).max(200) }).strict(),
    DownloadCompletedNativeSchema.nullable(),
  ),
  "native.undoDownloadRename": runtime(
    "smartDownloadNames",
    z.object({ receiptId: str.min(1).max(200) }).strict(),
    z
      .object({ status: z.enum(["restored", "conflict", "expired"]), filename: str.max(255).optional() })
      .strict(),
  ),
  "native.downloadPreviewText": runtime(
    "smartDownloadNames",
    z.object({ downloadId: str }).strict(),
    z.object({ text: str.max(2048) }).strict(),
  ),
  "native.renameDownload": runtime(
    "smartDownloadNames",
    RenameDownloadSchema,
    z.object({ renamed: bool, filename: str, receiptId: str.optional(), reason: str.optional() }).strict(),
  ),
  "native.powerRelease": runtime(
    "overnightReview",
    z.object({}).strict(),
    z.object({ active: z.literal(false) }).strict(),
  ),
  "native.powerStatus": runtime(
    "overnightReview",
    z.object({}).strict(),
    z
      .object({
        onAC: bool,
        backgroundEnabled: bool,
        active: bool,
        loginItem: z.enum(["unavailable", "not_registered", "enabled", "requires_approval", "not_found"]),
      })
      .strict(),
  ),
  "native.powerActivity": runtime(
    "overnightReview",
    PowerActivitySchema,
    z.object({ active: bool, reason: str.optional() }).strict(),
  ),
  "native.creatorCleanupProof": runtime(
    "core",
    NativeCreatorCleanupParamsSchema,
    NativeCreatorCleanupProofSchema,
  ),
  "native.closeCreatedPage": runtime("core", NativeCreatorCloseParamsSchema, NativeCreatorClosedSchema),
  "native.createAgentPage": runtime("core", AgentPageCreateSchema, AgentPageCreatedSchema),
  "native.adoptSessionPage": runtime("core", SessionPageAdoptSchema, EgressContextSchema),
  "native.recorderStart": runtime(
    "demonstrationSkills",
    NativeRecorderStartSchema,
    NativeRecorderStartedSchema,
  ),
  "native.recorderDrain": runtime(
    "demonstrationSkills",
    NativeRecorderReceiptSchema,
    NativeRecorderDrainSchema,
  ),
  "native.recorderStop": runtime(
    "demonstrationSkills",
    NativeRecorderReceiptSchema,
    NativeRecorderStoppedSchema,
  ),
  "native.egressRunTerminal": runtime(
    "core",
    z.object({ runId: str.min(1).max(160) }).strict(),
    z.object({ accepted: z.literal(true) }).strict(),
  ),
  "native.egressCheckRunResume": runtime(
    "core",
    z.object({ runId: str.min(1).max(160) }).strict(),
    z.object({ accepted: z.literal(true) }).strict(),
  ),
  "native.egressResumeRun": runtime(
    "core",
    z.object({ runId: str.min(1).max(160), ticketId: str.min(1).max(128) }).strict(),
    z.object({ accepted: z.literal(true) }).strict(),
  ),
  "native.egressResumePerson": runtime(
    "core",
    z.object({ pageId: str, ticketId: str.min(1).max(128) }).strict(),
    z
      .object({
        accepted: z.literal(true),
        context: EgressContextSchema,
        expiresAt: z.number().int().positive().safe(),
      })
      .strict(),
  ),
  "native.egressContext": runtime("core", EgressContextRequestSchema, EgressContextSchema),
  "native.egressInstall": runtime("core", EgressInstallSchema, accepted),
  "native.permissionRetire": runtime(
    "core",
    z
      .object({
        tabId: z.string().min(1).max(160),
        batchId: z.string().min(1).max(160),
        reservationId: z.string().uuid(),
      })
      .strict(),
    accepted,
  ),
  "native.egressRevoke": runtime("core", EgressRevokeSchema, accepted),
  "native.documentJob": runtime("core", NativeDocumentJobParams, NativeDocumentJobResult),
  "native.imageNormalize": runtime("core", NativeImageNormalizeParams, NativeImageNormalizeResult),
  "native.personCapture": runtime("core", NativePersonCaptureParamsSchema, NativePersonCaptureReceiptSchema),
  "native.personReadContext": runtime(
    "core",
    NativePersonReadContextParamsSchema,
    NativePersonReadContextSchema,
  ),
  "native.personRead": runtime("core", NativePersonReadParamsSchema, NativePersonReadReceiptSchema),
  "native.historyClear": runtime(
    "core",
    z.object({ since: number.optional(), before: number.optional() }).strict(),
    z.object({ removed: number }).strict(),
  ),
  "native.browserImportSelectWindow": runtime(
    "core",
    z.object({ token: z.string().min(1).max(160), sourceId: z.literal("safari") }).strict(),
    NativeBrowserImportSelectionSchema,
  ),
  "native.browserImportSelectExport": runtime(
    "core",
    z
      .object({
        token: z.string().min(1).max(160),
        sourceId: BrowserExportSourceSchema,
        format: BrowserExportFormatSchema,
      })
      .strict(),
    NativeBrowserImportSelectionSchema,
  ),
  "native.browserImportExportPoll": runtime(
    "core",
    z.object({ selectionId: z.string().min(16).max(128) }).strict(),
    NativeBrowserImportSelectionSchema,
  ),
  "native.browserImportExportCancel": runtime(
    "core",
    z.object({ selectionId: z.string().min(16).max(128) }).strict(),
    NativeBrowserImportSelectionSchema,
  ),
  "native.browserImportDiscover": runtime(
    "core",
    z.object({ token: z.string().min(1).max(160) }).strict(),
    NativeBrowserImportDiscoverySchema,
  ),
  "native.browserImportExtensionReview": runtime(
    "core",
    z.object({ token: z.string().min(1).max(160), sourceHandle: z.string().min(1).max(128) }).strict(),
    ImportExtensionReviewSchema,
  ),
  "native.browserImportBegin": runtime(
    "core",
    z
      .object({
        token: z.string().min(1).max(160),
        operationId: z.string().min(16).max(128),
        sourceHandle: z.string().min(1).max(128),
        categories: z.array(ImportCategorySchema).min(1).max(5),
        extensionReview: z.union([ImportExtensionSelectionSchema, z.object({}).strict()]),
      })
      .strict(),
    NativeBrowserImportReceiptSchema,
  ),
  "native.browserImportPoll": runtime(
    "core",
    z.object({ operationId: z.string().min(16).max(128) }).strict(),
    NativeBrowserImportReceiptSchema,
  ),
  "native.browserImportCancel": runtime(
    "core",
    z.object({ operationId: z.string().min(16).max(128) }).strict(),
    NativeBrowserImportReceiptSchema,
  ),
  "native.historyImport": runtime(
    "core",
    z
      .object({
        visits: z
          .array(
            z
              .object({
                url: str,
                title: z.string().max(1000),
                visitedAt: z.number().int().nonnegative(),
              })
              .strict(),
          )
          .min(1)
          .max(500),
      })
      .strict(),
    z.object({ added: z.number().int(), skipped: z.number().int() }).strict(),
  ),
  "native.historyRemove": runtime(
    "core",
    z.object({ url: str, visitedAt: number, expectedTitle: z.string().max(4096).optional() }).strict(),
    z.object({ removed: bool }).strict(),
  ),
  "native.memorySaverGet": runtime("tabLifecycle", z.object({}).strict(), MemorySaverSettingsSchema),
  "native.memorySaverSet": runtime(
    "tabLifecycle",
    z.object({ minutes: MemorySaverMinutesSchema }).strict(),
    MemorySaverSettingsSchema,
  ),
  "native.searchEngineGet": runtime("searchEngines", z.object({}).strict(), str),
  "native.searchEngineSet": runtime("searchEngines", z.object({ template: str }).strict(), bool),
  "native.searchSuggestionsGet": runtime("searchEngines", z.object({}).strict(), bool),
  "native.searchSuggestionsSet": runtime("searchEngines", z.object({ enabled: bool }).strict(), bool),
  "native.zapInstallStylesheet": runtime(
    "zapAndUserCss",
    ZapStylesheetInstallSchema,
    ZapInstallReceiptSchema,
  ),
  "native.spaceBindingsSet": runtime(
    "spaces",
    z
      .object({
        bindings: z.array(
          z
            .object({
              spaceId: str.min(1).max(128),
              workspaceId: str.min(1).max(128),
            })
            .strict(),
        ),
      })
      .strict(),
    z.object({ accepted: z.literal(true) }).strict(),
  ),
  "native.listPages": runtime(
    "core",
    z.object({}).strict(),
    z.object({ pages: z.array(nativePage) }).strict(),
  ),
  "native.tabCommand": runtime("core", TabCommandEnvelopeSchema, TabCommandAckSchema),
  "native.movePage": runtime(
    "core",
    NativeMethods["native.movePage"],
    z
      .object({ windowId: str, sourceActivePageId: nullableString, activePageId: nullableString.optional() })
      .strict(),
  ),
  "native.focusPage": runtime("core", pageId, ok),
  "native.recoverPage": runtime("core", NativeMethods["native.recoverPage"], ok),
  "native.stopPage": runtime("core", pageId, ok),
  "native.acquireStage": runtime("core", NativeMethods["native.acquireStage"], ok),
  "native.releaseStage": runtime("core", pageId, ok),
  "native.findInPage": runtime(
    "core",
    NativeMethods["native.findInPage"],
    z.object({ matches: number, activeMatch: number.optional() }).strict(),
  ),
  "native.stopFind": runtime("core", NativeMethods["native.stopFind"], ok),
  "native.setZoom": runtime(
    "pageZoom",
    NativeMethods["native.setZoom"],
    z.object({ level: number }).strict(),
  ),
  "native.setCookies": runtime(
    "core",
    NativeMethods["native.setCookies"],
    z.object({ ok: bool, count: number }).strict(),
  ),
  "native.storeSecret": runtime(
    "vault",
    NativeMethods["native.storeSecret"],
    z.object({ ok: z.literal(true) }).strict(),
  ),
  "native.readSecret": runtime(
    "vault",
    NativeMethods["native.readSecret"],
    z.object({ value: str.optional() }).strict(),
  ),
  "native.profileStorageRoot": runtime(
    "core",
    z.object({ version: z.literal(1) }).strict(),
    z.object({ value: str }).strict(),
  ),
  "native.profileStorageFactor": runtime(
    "core",
    z.object({ version: z.literal(1), purpose: z.literal("sqlite") }).strict(),
    z.object({ value: str }).strict(),
  ),
  "native.recoveryOwnerAuth": runtime(
    "core",
    z.object({ version: z.literal(1), purpose: z.enum(["export", "restore"]) }).strict(),
    z.object({ approved: z.literal(true) }).strict(),
  ),
  "native.captureReadablePage": runtime(
    "reader",
    NativeMethods["native.captureReadablePage"],
    z.object({ url: str, title: str, text: str }).strict(),
  ),
  "native.credentialContext": runtime(
    "passwordManager",
    NativeCredentialContextParamsSchema,
    NativeCredentialContextSchema,
  ),
  "native.credentialAdmit": runtime(
    "passwordManager",
    NativeCredentialAdmissionParamsSchema,
    NativeCredentialAdmissionSchema,
  ),
  "native.fillSavedPassword": runtime(
    "passwordManager",
    NativeCredentialFillParamsSchema,
    CredentialHandoffResultSchema,
  ),
  "native.cdpReset": runtime("fourLayerTabApi", z.object({}).strict(), z.unknown()),
  "native.cdpCatalog": runtime("fourLayerTabApi", z.object({}).strict(), NativeCdpCatalogSchema),
  "native.cdpAttach": runtime("fourLayerTabApi", NativeCdpAttachSchema, NativeCdpAttachedSchema),
  "native.cdpStartNavigation": runtime(
    "fourLayerTabApi",
    NativeCdpStartNavigationSchema,
    NativeCdpNavigationStartedSchema,
  ),
  "native.cdpTakeNavigationReceipt": runtime(
    "fourLayerTabApi",
    NativeCdpNavigationRequestSchema,
    NativeCdpNavigationOutcomeSchema,
  ),
  "native.cdpArmInput": runtime("fourLayerTabApi", NativeCdpArmInputSchema, NativeCdpNavigationStartedSchema),
  "native.cdpTakeInputOutcome": runtime(
    "fourLayerTabApi",
    NativeCdpNavigationRequestSchema,
    NativeCdpInputOutcomeSchema,
  ),
  "native.cdpDispatch": runtime("fourLayerTabApi", NativeCdpDispatchSchema, z.unknown()),
  "native.cdpVersion": runtime("fourLayerTabApi", z.object({}).strict(), z.object({ version: str }).strict()),
  "native.webmcpList": runtime(
    "core",
    z.object({ pageId: str }).strict(),
    z.object({ tools: z.array(WebmcpToolSchema) }).strict(),
  ),
  "native.webmcpCall": runtime(
    "core",
    z.object({ pageId: str, name: str, input: str }).strict(),
    WebmcpCallResultSchema,
  ),
} as const;
