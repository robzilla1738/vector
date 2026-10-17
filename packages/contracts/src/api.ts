import { MemoryClaimDocumentsSchema, MemoryClaimEditParams } from "./memory-pipeline.js";
import { TaskReceiptExportParamsSchema, TaskReceiptExportResultSchema } from "./task-receipt-export.js";
import { DocumentSnapshotSchema, SavedDocumentPageSchema } from "./document-snapshot.js";
import {
  ConversationDocumentImportParamsSchema,
  ConversationDocumentReadParamsSchema,
  TaskDocumentImportParamsSchema,
  TaskDocumentReadParamsSchema,
  TaskTextEvidenceParamsSchema,
} from "./document-api.js";
import { ConversationSearchParams, ConversationSearchResultSchema } from "./conversation-search.js";
import { CapturedSourceSchema } from "./captured-source.js";
import { MemorySaverMinutesSchema } from "./memory-saver.js";
import { BookmarkMethodSchemas, BookmarkResultSchemas } from "./bookmark-methods.js";
import { HistoryMethodSchemas, HistoryResultSchemas } from "./history-methods.js";
export { HistoryListParams, HistoryRangeParams } from "./history-methods.js";
export {
  BookmarkAddParams, BookmarkReadingListParams, BookmarkMarkReadParams,
  BookmarkOfflineSetParams, BookmarkOfflineGetParams, BookmarkUpdateParams, BookmarkRemoveParams,
} from "./bookmark-methods.js";
import { CodingRunParams, CodingChangesParams, CodingUndoParams, CodingProcessParams, CodingLogsParams, CodingFileReceiptSchema, CodingProcessViewSchema, CodingLogsSchema } from "./coding-api.js";
import { CloudPreviewSchema } from "./cloud-preview.js";
import { PageSummaryParamsSchema, PageSummaryResultSchema } from "./page-summary.js";
import { SkillLibraryPreviewParams, SkillLibraryImportParams, SkillLibraryPreviewSchema } from "./skill-library.js";
import {
  CopilotAttemptParams,
  CopilotAccountParams,
  CopilotSetupSchema,
  CopilotInstallSchema,
  CopilotAuthStatusSchema,
  CopilotDeviceChallengeSchema,
  CopilotAccountsSchema,
  CopilotDisconnectedSchema,
  CopilotCatalogSchema,
} from "./copilot-auth.js";
import {
  BrowserExportSourceSchema,
  BrowserExportFormatSchema,
  BrowserImportSelectionStatusSchema,
} from "./import.js";
import { RemoteDebuggingStateSchema } from "./remote-debugging.js";
import {
  ProjectFilesParams,
  ProjectFileParams,
  ProjectChangesParams,
  ProjectFilesSchema,
  ProjectFileSchema,
  ProjectChangesSchema,
} from "./projects.js";
import {
  ExecutionTargetSchema,
  CloudConfigureParamsSchema,
  CloudSettingsStatusSchema,
} from "./cloud-execution.js";
import {
  TerminalListenersParams,
  TerminalListenersSchema,
  TerminalPreviewParams,
  TerminalPreviewSchema,
  TerminalPreviewCloseParams,
  TerminalPreviewClosedSchema,
  TerminalStartParams,
  TerminalReadParams,
  TerminalInputParams,
  TerminalResizeParams,
  TerminalCloseParams,
  TerminalSessionSchema,
  TerminalReadResultSchema,
  TerminalInputResultSchema,
} from "./terminal.js";
import { SafetyActivityQuerySchema, SafetyActivityPageSchema } from "./safety-activity.js";
import { AuxPackageLibrarySchema } from "./aux-packages.js";
import { AgentModeSchema, AgentPolicyOverrideSchema } from "./agent-policy.js";
import { AUX_FEATURES, type AuxFeature } from "./aux-features.js";
import { DownloadNamingSettingsSchema } from "./download-naming.js";
import {
  ModelConnectionChangeSchema,
  ImageModelSchema,
  LocalModelServerSchema,
} from "./model-connections.js";
import { BrowserRuntimeMethodSchemas, BrowserRuntimeResultSchemas } from "./browser-runtime-api.js";
import { MentionRefsSchema } from "./mentions.js";
export * from "./model-connections.js";
import {
  MemoryPastePreviewParams,
  MemoryPastePreviewSchema,
  MemoryPasteCommitParams,
  MemoryPasteStatusParams,
  MemoryPasteStatusSchema,
} from "./memory-paste.js";
export * from "./memory-paste.js";
import {
  OnboardingStateSchema,
  OnboardingUpdateParamsSchema,
} from "./onboarding.js";
export * from "./onboarding.js";
import {
  GenerateResultParamsSchema,
  GeneratedResultSchema,
  GeneratedResultSummarySchema,
} from "./generated-results.js";
import {
  ZapApplyResultSchema,
  ZapGrantParamsSchema,
  ZapRevokeParamsSchema,
  ZapSitePolicySchema,
  ZapUpdateParamsSchema,
} from "./zap.js";
import { ModelProviderSchema, ModelCredentialSchema } from "./model-providers.js";
import { z } from "zod";
import { CoderRecoveryInspectionSchema } from "./coder-worktrees.js";
import { AutofillProfileSchema } from "./autofill.js";
export { AutofillProfileSchema, type AutofillProfile } from "./autofill.js";
import {
  SkillRepairProposeSchema,
  SkillRepairProposalSchema,
  SkillRepairApplySchema,
} from "./demonstration.js";
import { DemonstrationReplayCompileSchema } from "./demonstration.js";
import {
  ApprovalDecisionSchema,
  FinalReviewArtifactSchema,
  PendingApprovalSchema,
  SendRecordSchema,
  SuspensionSchema,
} from "./safety.js";
import { CommandRankingEntrySchema, CommandRankingSourceSchema } from "./command-ranking.js";
import { WebmcpToolSchema } from "./webmcp.js";
import { RuntimeMethodPolicy } from "./runtime-method-policy.js";
import { RunTranscriptProjectionSchema } from "./transcript.js";

import { isSearchEngineTemplate, SEARCH_ENGINE_TEMPLATE_ERROR } from "./search-engine.js";
export const SearchEngineTemplateSchema = z
  .string()
  .trim()
  .max(2048)
  .refine(isSearchEngineTemplate, SEARCH_ENGINE_TEMPLATE_ERROR);

import {
  ArtifactSchema,
  BackendSchema,
  BrowserSessionSchema,
  ConversationSummarySchema,
  DownloadSchema,
  ModelUsageSummarySchema,
  PageSetSchema,
  PageContextRefSchema,
  PageTargetSchema,
  ResponseRecordSchema,
  ResultRecordSchema,
  RunSchema,
  RunMessageSchema,
  SavedProgramSchema,
  SetMemberSchema,
  StepRecordSchema,
} from "./entities.js";
import { EventSchema } from "./events.js";
import { TidyProposalParamsSchema, TidyProposalSchema } from "./tidy.js";
import { TabNameSuggestParamsSchema, TabNameSuggestionSchema } from "./tab-name.js";
import { UtilityIntentParamsSchema, UtilityIntentResultSchema } from "./utility.js";
import {
  InlineAssistApplyParamsSchema,
  InlineAssistApplySchema,
  InlineAssistCancelParamsSchema,
  InlineAssistCaptureParamsSchema,
  InlineAssistCaptureSchema,
  InlineAssistDraftParamsSchema,
  InlineAssistDraftSchema,
} from "./inline-assist.js";
import {
  CompactObservationSchema,
  ElementRefSchema,
  ObservationFormatSchema,
  ObservationSchema,
  ObservationRequestSchema,
} from "./observation.js";
import {
  ConditionSchema,
  ProgramNodeSchema,
  ProgramSchema,
  ProgramResultSchema,
  StepSchema,
} from "./program.js";
import { StateQuerySchema } from "./state.js";
import {
  TaskSchema,
  TaskCreateParams,
  TaskPromoteParams,
  TaskUpdateParams,
  WorkspaceSchema,
  WorkspaceMemorySchema,
  WorkspaceMemoryItemSchema,
  BrowsingMemoryPolicySchema,
  WorkspaceBrowsingMemorySchema,
  ContentMemoryPolicySchema,
  ContentMemoryMatchSchema,
  ContentMemoryDocumentSchema,
  EvidenceNoteParams,
  EvidenceCaptureParams,
  CriterionReviewParams,
  TaskReconcileParams,
  TaskReconcileOperationParams,
  TaskEvidenceSchema,
  CriterionReviewSchema,
  TaskReceiptSchema,
  TaskUndoBrowserChangeParams,
  TaskUndoRunBrowserChangesParams,
  TaskVerifyCriterionParams,
  CriterionVerificationSchema,
  TaskReplaceAgentParams,
} from "./tasks.js";
import { AgentConnectionCreateParams, AgentConnectionSchema } from "./agent-connections.js";
import {
  OutboundMcpRegisterParams,
  OutboundMcpToolToggleParams,
  OutboundMcpServerSchema,
  McpOAuthClientSetupSchema,
  McpOAuthRequirementsSchema,
  OutboundMcpToolSchema,
  OutboundMcpCallResultSchema,
  OutboundMcpBundleInspectionSchema,
} from "./outbound-mcp.js";
import {
  SiteOriginSchema,
  ZapSelectorSchema,
  ZapPickResultSchema,
  ZapRuleSchema,
  SiteCssSchema,
  SiteCssProposalParamsSchema,
  SiteCssProposalSchema,
  EffectiveSiteCssSchema,
} from "./customization.js";
import {
  MemoryPipelinePolicySchema,
  MemoryPipelineOverviewSchema,
  MemoryPipelineForgetParams,
  MemoryPipelineForgetResultSchema,
  MemoryClaimSchema,
  MemoryPipelineInboxSchema,
  MemoryPipelineSourceSchema,
  MemoryPipelineRevisionSchema,
  MemoryExtractionViewSchema,
} from "./memory-pipeline.js";
import {
  SubagentGroupCreateParams,
  SubagentGroupSchema,
  SubagentGroupViewSchema,
  SubagentSpawnParams,
  SubagentSchema,
  SubagentMessageParams,
} from "./subagents.js";
import {
  CalendarConnectionSchema,
  CalendarEventSchema,
  CalendarEventsQuerySchema,
  CalendarTaskEventsQuerySchema,
  CalendarTaskGrantSchema,
} from "./calendar.js";
import { ConnectorCatalogSchema } from "./connectors.js";
import {
  VaultAccessRecordSchema,
  VaultEncryptedExportParams,
  VaultEncryptedImportParams,
  VaultTransferPackageSchema,
  VaultGenerateParams,
  VaultGrantParams,
  VaultGrantSchema,
  VaultHumanFillParams,
  VaultItemSchema,
  VaultItemsForOriginParams,
  VaultLockParams,
  VaultRenewGrantParams,
  VaultSaveParams,
  VaultSecretMatchParams,
  VaultStatusSchema,
  VaultUnlockParams,
  VaultUpdateParams,
} from "./vault.js";
import {
  RoutineAlertSchema,
  RoutineCompareSchema,
  RoutineCreateParams,
  RoutineFromResultParams,
  RoutineInboxItemSchema,
  RoutineSourceEventSchema,
  RoutineRunParams,
  RoutineRunSchema,
  RoutineRunOutcomeSchema,
  RoutineSchema,
  RoutineShareEnvelopeSchema,
  RoutineShareSchema,
  RoutineSuggestionSchema,
  RoutineCandidateSchema,
  RoutineUpdateParams,
  RoutineReplayCompileParams,
  RoutineReplayTestParams,
  RoutineReplayResultParams,
  PluginSchema,
  PluginAssetSchema,
  PluginSkillGrantParams,
  PluginSkillGrantSchema,
  PluginSkillReadParams,
  PluginSkillReadSchema,
} from "./routines.js";
import { BrowserSpaceSchema } from "./spaces.js";
import { GoalCreateParams, GoalSchema } from "./goals.js";
import { HookCreateParams, HookInvocationSchema, HookSchema } from "./hooks.js";
import {
  WorkspaceFolderAccessSchema,
  WorkspaceFolderPresentationSchema,
  WorkspaceFolderReviewSchema,
  WorkspaceFolderSchema,
} from "./workspace-folders.js";
import { ShortcutOverridesSchema } from "./shortcuts.js";
import { NightShiftSettingsSchema } from "./night-shift.js";
import { SelectionCaptureSettingsSchema } from "./selection-capture.js";
import { ModelCapabilitySchema, AgentModelRouteChainSchema } from "./model-registry.js";
import { SiteReadParamsSchema, SiteReadResultSchema } from "./site-adapters.js";

const id = z.string().min(1);

/** pages.* */
export const PagesListParams = z.object({
  backend: BackendSchema.optional(),
  includeDetached: z.boolean().optional(),
});
const ScopedTaskBinding = { taskId: id.optional(), expectedRevision: z.number().int().positive().optional() };
export const PagesOpenParams = z.object({
  ...ScopedTaskBinding,
  url: z.string().min(1),
  /** Desktop shell owner. Ordinary API clients omit this. */
  windowId: z.string().min(1).optional(),
  /** `aux` selects embedded Chromium (default); `chrome` needs an attached Chrome. */
  backend: BackendSchema.optional(),
  /** hidden/background pages never steal focus; used for worker pages. */
  background: z.boolean().default(false),
  ownedByRuntime: z.boolean().default(false),
  activate: z.boolean().optional(),
  /** chrome backend: attach an existing borrowed tab by CDP target id */
  targetId: z.string().optional(),
});
export const PagesCloseParams = z.object({ pageId: id, ...ScopedTaskBinding });
export const PagesActivateParams = z.object({ pageId: id });
export const PagesNavigateParams = z.object({ pageId: id, url: z.string().min(1), ...ScopedTaskBinding });
export const PagesObserveParams = z
  .object({
    pageId: id,
    /** "compact" returns { observation: CompactObservation } — rendered text + refs, no selectors/rects */
    format: ObservationFormatSchema.optional(),
  })
  .merge(ObservationRequestSchema.partial());
/** pages.execute `returnObservation` — observe the page in the same round trip (act-and-observe). */
export const ReturnObservationSchema = z.object({
  scope: z.enum(["full", "forms", "links", "tables", "subtree"]).optional(),
  subtreeRef: z.string().optional(),
  format: ObservationFormatSchema.optional(),
  maxElements: z.number().int().positive().optional(),
  maxTextChars: z.number().int().positive().optional(),
});
export type ReturnObservation = z.infer<typeof ReturnObservationSchema>;
export const PagesWebmcpParams = z
  .object({
    pageId: id,
    op: z.enum(["tools", "call"]),
    name: z.string().min(1).max(200).optional(),
    /** JSON text passed to the tool. Omitted calls use `{}`. */
    input: z.string().max(100_000).optional(),
  })
  .strict();
export const PagesWebmcpResult = z.discriminatedUnion("op", [
  z.object({ op: z.literal("tools"), tools: z.array(WebmcpToolSchema) }).strict(),
  z.object({ op: z.literal("call"), result: z.string().nullable(), success: z.boolean() }).strict(),
]);
export const PagesExecuteParams = z.object({
  program: ProgramSchema,
  taskId: z.string().min(1).optional(),
  expectedRevision: z.number().int().positive().optional(),
  returnObservation: ReturnObservationSchema.optional(),
  safety: z
    .object({
      turnId: id.optional(),
      threadId: id.optional(),
      turnToolCallCount: z.number().int().nonnegative().optional(),
      steps: z
        .record(
          z.string(),
          z
            .object({
              approvalId: id.optional(),
              review: FinalReviewArtifactSchema.optional(),
              sensitiveData: z.boolean().optional(),
              restrictedRetry: z.boolean().optional(),
            })
            .strict(),
        )
        .optional(),
    })
    .strict()
    .optional(),
});
export const PagesCuaExecuteParams = PagesExecuteParams.extend({
  program: ProgramSchema.extend({ documentEpoch: z.number().int().nonnegative() }),
  expectedViewport: z
    .object({ width: z.number().positive(), height: z.number().positive(), scale: z.number().positive() })
    .strict(),
}).strict();
/**
 * Human/owner reconciliation of a direct (non-run) write on a page whose outcome
 * is uncertain. Scoped agent connections cannot call it: an agent must not
 * vouch for its own uncertain effect.
 */
export const PagesReconcileWriteParams = z
  .object({
    pageId: z.string().min(1),
    intentId: z.string().min(1).optional(),
    outcome: z.enum(["applied", "not_applied"]),
    evidence: z.string().min(1).max(4000),
  })
  .strict();
/** Named observation keys (`title`, `r12`) or CSS extract specs. */
export const ExtractFieldSchema = z.union([
  z.string().min(1),
  z.object({
    name: z.string().min(1),
    selector: z.string().optional(),
    attribute: z.string().optional(),
    all: z.boolean().optional(),
  }),
]);
export const PagesExtractParams = z.object({
  pageId: id,
  fields: z.array(ExtractFieldSchema).optional(),
});
export const PagesElementInfoParams = z
  .object({
    pageId: id,
    x: z.number().finite().nonnegative(),
    y: z.number().finite().nonnegative(),
    expectedDocumentEpoch: z.number().int().nonnegative().optional(),
  })
  .strict();
export const PagesAccessibilityHtmlParams = z
  .object({
    pageId: id,
    maxElements: z.number().int().positive().max(1000).optional(),
    maxTextChars: z.number().int().positive().max(50000).optional(),
  })
  .strict();
/** Deliberately declarative: no authored JavaScript enters the logged-in page. */
export const PagesReadParams = z
  .object({
    pageId: id,
    query: z.discriminatedUnion("kind", [
      z.object({ kind: z.literal("title") }),
      z.object({ kind: z.literal("url") }),
      z.object({ kind: z.literal("text") }),
      z.object({ kind: z.literal("count"), selector: z.string().min(1).max(2000) }),
      z.object({
        kind: z.literal("attribute"),
        selector: z.string().min(1).max(2000),
        name: z.string().min(1).max(200),
      }),
    ]),
  })
  .strict();
export const PagesWaitForParams = z.object({
  pageId: id,
  condition: ConditionSchema,
});
export const PagesConsoleParams = z.object({
  pageId: id,
  since: z.number().optional(),
  limit: z.number().int().positive().max(1000).optional(),
});
export const PagesDialogParams = z.object({
  ...ScopedTaskBinding,
  pageId: id,
  action: z.enum(["list", "accept", "dismiss"]).default("list"),
  promptText: z.string().optional(),
});
export const PagesNetworkParams = z.object({
  pageId: id,
  since: z.number().optional(),
  urlIncludes: z.string().optional(),
  limit: z.number().int().positive().max(1000).optional(),
});
export const PagesCaptureParams = z.object({
  pageId: id,
  expectedDocumentEpoch: z.number().int().nonnegative().optional(),
  fullPage: z.boolean().optional(),
  /** data url for transport; file for artifact storage */
  format: z.enum(["dataUrl", "artifact"]).default("dataUrl"),
});
export const PagesFindParams = z.object({
  pageId: id,
  text: z.string(),
  forward: z.boolean().default(true),
  findNext: z.boolean().default(false),
});
export const PagesStopFindParams = z.object({
  pageId: id,
  action: z.enum(["clear", "keep"]).default("clear"),
});
export const PagesZoomParams = z.object({
  pageId: id,
  level: z.number().optional(),
  delta: z.number().optional(),
  reset: z.boolean().optional(),
  direction: z.enum(["in", "out"]).optional(),
});
export const PagesTakeoverParams = z.object({ pageId: id });
export const PagesPickElementParams = z.object({
  pageId: id,
  timeoutMs: z.number().int().min(1_000).max(120_000).optional(),
});
export const ElementPickSchema = z.object({
  tag: z.string().max(100),
  id: z.string().max(500).optional(),
  classes: z.array(z.string().max(200)).max(8),
  text: z.string().max(160).optional(),
  role: z.string().max(200).optional(),
  ariaLabel: z.string().max(500).optional(),
  href: z.string().max(4000).optional(),
  selector: z.string().max(2000),
  rect: z.object({ x: z.number(), y: z.number(), width: z.number(), height: z.number() }),
});
export type ElementPick = z.infer<typeof ElementPickSchema>;
export const PagesPickElementResult = z.object({
  picked: z.boolean(),
  element: ElementPickSchema.optional(),
});
export const PagesResumeParams = z.object({ pageId: id });
export const PagesOpenLiveParams = z
  .object({ pageId: id })
  .describe("focus a borrowed Chrome tab in real Chrome");

/** sets.* */
export const SetsCreateParams = z.object({
  name: z.string().min(1),
  source: z.enum(["links", "urls", "tabs", "records", "manual"]).default("manual"),
  urls: z.array(z.string()).optional(),
  pageIds: z.array(z.string()).optional(),
  records: z.array(z.record(z.string(), z.unknown())).optional(),
  /** collect links from this page into the set */
  collectFromPageId: z.string().optional(),
  linkSelector: z.string().optional(),
});
export const SetsGetParams = z.object({ setId: id });
export const SetsMapParams = z.object({
  setId: id,
  /** run this program per member; alternatively an agent goal per member. */
  program: z
    .object({
      steps: z.array(StepSchema).min(1).max(200).optional(),
      nodes: z.array(ProgramNodeSchema).min(1).max(400).optional(),
    })
    .refine((p) => (p.steps?.length ?? 0) > 0 || (p.nodes?.length ?? 0) > 0, {
      message: "steps or nodes required",
    })
    .optional(),
  programId: z.string().optional(),
  goal: z.string().optional(),
  modelId: z.string().optional(),
  concurrency: z.number().int().min(1).max(16).optional(),
  memberIds: z.array(z.string()).optional(),
  /** Shared across every model-driven member, including concurrent pilots. */
  maxModelCalls: z.number().int().nonnegative().optional(),
  deadlineMs: z.number().int().nonnegative().optional(),
  maxCostUsd: z.number().nonnegative().optional(),
});
export const SetsResultsParams = z.object({
  setId: id,
  status: z.enum(["ok", "partial", "error"]).optional(),
});

/** runs.* */
export const RunsStartParams = z
  .object({
    /** Original native composer delivery; the runtime still owns its run ID. */
    requestId: z.string().uuid().optional(),
    projectRoot: z.string().min(1).max(4096).optional(),
    packageNames: z.array(z.string().min(1).max(128)).max(32).optional(),
    profile: z
      .string()
      .regex(/^[a-z][a-z0-9_-]{0,63}$/)
      .optional(),
    agentMode: AgentModeSchema.optional(),
    ...ScopedTaskBinding,
    mentions: MentionRefsSchema.optional(),
    goal: z.string().min(1),
    pageId: z.string().optional(),
    pageIds: z.array(z.string()).optional(),
    contextPageRefs: z.array(PageContextRefSchema).optional(),
    setId: z.string().optional(),
    modelId: z.string().optional(),
    reasoning: z.enum(["low", "medium", "high"]).optional(),
    privateTask: z.boolean().default(false),
    executionTarget: ExecutionTargetSchema.default("local"),
    maxSteps: z.number().int().nonnegative().optional(),
    maxCostUsd: z.number().nonnegative().optional(),
    /** `0` = no per-run cap. */
    maxModelCalls: z.number().int().min(0).optional(),
    deadlineMs: z.number().int().positive().optional(),
    /** prior turns / notes the planner should see ("EARLIER IN THIS SESSION") */
    context: z.string().max(20_000).optional(),
    /** Desktop default for a new conversation; never reassigns an existing conversation. */
    defaultWorkspaceId: id.optional(),
    /** Explicitly chosen protected articles. Only Aux's local window may request model use. */
    contextMemoryRefs: z.array(CapturedSourceSchema).optional(),
    /** chat thread this run belongs to — groups turns into conversations */
    chatId: z.string().optional(),
  })
  .strict();
export const RunsControlParams = z.object({ runId: id });
export const RunsGetParams = z.object({ runId: id });
export const RunsEventsParams = z.object({
  runId: z.string().optional(),
  sinceSeq: z.number().int().nonnegative().default(0),
  limit: z.number().int().positive().max(2000).default(500),
  /** Stream identity the cursor was issued against — a mismatch answers `resync` (D9). */
  streamId: z.string().optional(),
});
export const RunsContinueBudgetParams = z
  .object({
    runId: id,
    suspensionId: id,
    limits: z
      .object({
        maxModelCalls: z.number().int().nonnegative().optional(),
        maxSteps: z.number().int().nonnegative().optional(),
        deadlineMs: z.number().int().nonnegative().optional(),
        funding: z
          .object({
            maxTokens: z.number().int().positive().max(Number.MAX_SAFE_INTEGER).optional(),
            maxCostUsd: z.number().finite().positive().optional(),
            deadlineMs: z.number().int().positive().max(Number.MAX_SAFE_INTEGER).optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict();
export const RunsAnswerParams = z.object({
  runId: id,
  answer: z.string(),
  expectedSuspensionId: id.optional(),
  mentions: MentionRefsSchema.optional(),
});
export const RunsQueueParams = z.object({
  mentions: MentionRefsSchema.optional(),
  messageId: z.string().uuid(),
  runId: id,
  chatId: id,
  text: z.string().trim().min(1).max(20_000),
  pageIds: z.array(id).min(1),
  contextPageRefs: z.array(PageContextRefSchema),
  expectedRevision: z.number().int().nonnegative(),
  /** This send supersedes an earlier cancelled/failed message — the nonce chain (04-A). */
  resendsMessageId: z.string().uuid().optional(),
});
export const RunsSteerParams = RunsQueueParams.extend({
  expectedTurnId: id,
  /** Client-declared idempotency id — must equal messageId when sent. */
  clientUserMessageId: z.string().uuid().optional(),
});
export const RunsListParams = z.object({
  limit: z.number().int().positive().max(500).default(50),
  before: z.object({ createdAt: z.number().finite(), runId: z.string().min(1) }).optional(),
  chatId: z.string().min(1).optional(),
  query: z.string().max(500).optional(),
  groupByChat: z.boolean().optional(),
});
export const ConversationContextEntrySchema = z.object({
  runId: id,
  goal: z.string(),
  summary: z.string(),
  status: z.string(),
  createdAt: z.number(),
  included: z.boolean(),
});
export const ConversationBranchDraftSchema = z.object({
  chatId: id, sourceRunId: id, privateTask: z.boolean(), draftText: z.string(),
  contextPageRefs: z.array(PageContextRefSchema),
}).strict();

export const ConversationBranchMetadataSchema = ConversationBranchDraftSchema.extend({
  kind: z.literal("branch-draft"), title: z.string(), archived: z.literal(false),
  mode: z.enum(["branch", "edit"]), available: z.boolean(),
  taskId: id.optional(), taskRevision: z.number().int().positive().optional(),
  modelId: z.string().optional(), reasoning: z.enum(["low", "medium", "high"]).optional(),
  executionTarget: ExecutionTargetSchema.optional(),
});
export type ConversationBranchMetadata = z.infer<typeof ConversationBranchMetadataSchema>;

export const ConversationContextSchema = z.object({
  chatId: id,
  historyEnabled: z.boolean(),
  entries: z.array(ConversationContextEntrySchema),
});
export type ConversationContext = z.infer<typeof ConversationContextSchema>;
export const RunsContextGetParams = z.object({ chatId: id });
export const RunsContextSetParams = z
  .object({
    chatId: id,
    historyEnabled: z.boolean().optional(),
    runId: id.optional(),
    included: z.boolean().optional(),
  })
  .refine((value) => value.historyEnabled !== undefined || (value.runId && value.included !== undefined), {
    message: "historyEnabled or runId/included is required",
  });
export const PreparedConversationSchema = z.object({
  chatId: id,
  title: z.string(),
  attachmentCount: z.number().int().positive(),
  updatedAt: z.number().finite(),
});
export type PreparedConversation = z.infer<typeof PreparedConversationSchema>;
export const ConversationsListParams = z.object({
  workspaceId: id.optional(),
  limit: z.number().int().positive().max(200).default(40),
  before: z.object({ updatedAt: z.number().finite(), chatId: id }).optional(),
  query: z.string().max(500).optional(),
  archived: z.boolean().default(false),
});
export const ConversationRenameParams = z.object({ chatId: id, title: z.string().trim().min(1).max(160) });
export const ConversationArchiveParams = z.object({ chatId: id, archived: z.boolean() });
export const ConversationDeleteParams = z.object({ chatId: id });
export const ConversationAttachmentSchema = z.object({
  sourceUrl: z.string().optional(),
  sourceTruncated: z.boolean().optional(),
  sourceArtifactId: id.optional(),
  attachmentId: id,
  document: DocumentSnapshotSchema.optional(),
  filename: z.string().min(1).max(1024),
  excerpt: z.string().max(1000),
  byteLength: z.number().int().nonnegative(),
  createdAt: z.number(),
  included: z.boolean(),
});
export type ConversationAttachment = z.infer<typeof ConversationAttachmentSchema>;
export const ConversationAttachmentsSchema = z.object({
  chatId: id,
  attachments: z.array(ConversationAttachmentSchema),
});
export const ConversationAttachmentAddParams = TaskTextEvidenceParamsSchema
  .omit({ taskId: true, expectedRevision: true, criterionId: true })
  .extend({ chatId: id, sourceArtifactId: id.optional() })
  .strict();
export const ConversationAttachmentControlParams = z.object({ chatId: id, attachmentId: id });
export const ConversationAttachmentToggleParams = ConversationAttachmentControlParams.extend({
  included: z.boolean(),
});
export const ConversationImageSchema = z.object({
  imageId: id,
  artifactId: id,
  filename: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  byteLength: z.number().int().nonnegative(),
  sourceUrl: z.string().optional(),
  sourcePage: PageContextRefSchema.optional(),
  createdAt: z.number(),
  included: z.boolean(),
});
export type ConversationImage = z.infer<typeof ConversationImageSchema>;
const ConversationImagesSchema = z.object({ chatId: id, images: z.array(ConversationImageSchema) });
const ConversationImageControl = z.object({ chatId: id, imageId: id });
export const ConversationArtifactSchema = z.object({
  automaticReport: z.boolean().optional(),
  artifactId: id,
  runId: id,
  filename: z.string().min(1).max(255),
  mediaType: z.string().min(1).max(120),
  excerpt: z.string().max(1000),
  byteLength: z.number().int().nonnegative(),
  createdAt: z.number(),
  turnGoal: z.string().max(400),
  sourceArtifactIds: z.array(id).optional(),
  revision: z.number().int().positive().optional(),
  generatedKind: z.enum(["csv", "xlsx", "docx", "pptx", "chart"]).optional(),
  included: z.boolean(),
});
export type ConversationArtifact = z.infer<typeof ConversationArtifactSchema>;
export const SavedResultSchema = z.object({
  artifactId: id,
  runId: id,
  chatId: id,
  filename: z.string(),
  mediaType: z.string(),
  byteLength: z.number(),
  createdAt: z.number(),
  conversationTitle: z.string(),
  turnGoal: z.string(),
  revision: z.number().int().positive().optional(),
});
export type SavedResult = z.infer<typeof SavedResultSchema>;
export const ConversationArtifactsSchema = z.object({
  chatId: id,
  artifacts: z.array(ConversationArtifactSchema),
  unavailableArtifactIds: z.array(id).optional(),
});
export const ConversationArtifactToggleParams = z.object({
  chatId: id,
  artifactId: id,
  included: z.boolean(),
});
export const BrowserConversationSourceSchema = z.object({
  kind: z.literal("browser").optional(),
  sourceId: id,
  runId: id,
  pageId: id,
  profileId: id.optional(),
  url: z.string().url().max(4000),
  title: z.string().max(1000),
  observedAt: z.number(),
  documentEpoch: z.number(),
  revision: z.number(),
});
export const CalendarConversationSourceSchema = z.object({
  kind: z.literal("calendar"),
  sourceId: id,
  runId: id,
  connectionId: id,
  profileId: id.optional(),
  accountKey: z.string().min(1).max(1000),
  eventId: id.optional(),
  url: z.string().url().max(4000),
  title: z.string().max(1000),
  start: z.string().max(100),
  end: z.string().max(100),
  observedAt: z.number(),
});
export const MemoryConversationSourceSchema = z.object({
  kind: z.literal("memory"),
  sourceId: id,
  runId: id,
  memoryId: id,
  workspaceId: id,
  pageId: id,
  profileId: id,
  documentEpoch: z.number().int().nonnegative(),
  url: z.string().url().max(4000),
  title: z.string().max(1000),
  observedAt: z.number(),
});
export const ConversationSourceSchema = z.union([
  BrowserConversationSourceSchema,
  CalendarConversationSourceSchema,
  MemoryConversationSourceSchema,
]);
export type ConversationSource = z.infer<typeof ConversationSourceSchema>;
export const ConversationSourcesSchema = z.object({
  chatId: id,
  sources: z.array(ConversationSourceSchema).max(200),
});
export const ConversationWorkspaceSchema = z.object({
  memoryPreview: z.string().optional(),
  browsingPreview: z.string().optional(),
  chatId: id,
  taskId: id.optional(),
  assigned: z.boolean().optional(),
  workspace: WorkspaceSchema.nullable(),
  memory: WorkspaceMemorySchema.nullable(),
});
export const ConversationWorkspaceSetParams = z.object({ chatId: id, workspaceId: id.nullable() });

/** artifacts.* */
export const ArtifactsListParams = z.object({ runId: z.string().optional(), pageId: z.string().optional() });
export const ArtifactsReadParams = z.object({ artifactId: id });

/** programs.* */
export const ProgramsRunParams = z.object({
  programId: id,
  pageId: id,
  parameters: z.record(z.string(), z.string()).optional(),
});
export const ProgramsSaveParams = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  /** site key the program was validated against; "*" = any */
  siteKey: z.string().default("*"),
  steps: z.array(StepSchema).min(1).max(200).optional(),
  nodes: z.array(ProgramNodeSchema).min(1).max(400).optional(),
  parameters: z.array(z.string()).default([]),
});
export const ProgramsDeleteParams = z.object({ programId: id });

/** Native browser session operations. */
export const ChromeOpenLiveParams = z.object({ pageId: id });

/** models / settings */
export const ModelsProbeParams = z.object({ modelId: id.optional() });
export const SidebarMaterialSchema = z.enum(["liquid-glass", "titlebar", "sidebar", "under-window"]);
export type SidebarMaterial = z.infer<typeof SidebarMaterialSchema>;

export const FileAccessModeSchema = z.enum(["guard", "read-only", "full"]);
export const FileAccessSettingsSchema = z
  .object({
    fileAccessMode: FileAccessModeSchema.default("guard"),
    fileAccessRevision: z.number().int().nonnegative().default(0),
  })
  .strict();
export type FileAccessSettings = z.infer<typeof FileAccessSettingsSchema>;

export const SettingsSetParams = z.object({
  copilotModelId: z.string().min(1).max(300).nullable().optional(),
  fileAccessMode: FileAccessModeSchema.optional(),
  fileAccessRevision: z.number().int().nonnegative().optional(),
  agentMode: AgentModeSchema.optional(),
  agentPolicyRevision: z.number().int().nonnegative().optional(),
  agentPolicies: z.array(AgentPolicyOverrideSchema).max(1000).optional(),
  featureOverrides: z
    .partialRecord(z.enum(Object.keys(AUX_FEATURES) as [AuxFeature, ...AuxFeature[]]), z.boolean())
    .optional(),
  modelProvider: ModelProviderSchema.optional(),
  modelCredential: ModelCredentialSchema.optional(),
  modelConnection: ModelConnectionChangeSchema.optional(),
  imageModel: ImageModelSchema.nullable().optional(),
  localModelsOnly: z.boolean().optional(),
  compatibleEndpoint: z.string().trim().max(2048).optional(),
  gatewayApiKey: z.string().optional(),
  plannerModel: z.string().optional(),
  recoveryModel: z.string().optional(),
  visionModel: z.string().optional(),
  agentModelRoutes: z
    .object({
      fast: AgentModelRouteChainSchema.optional(),
      standard: AgentModelRouteChainSchema.optional(),
      deep: AgentModelRouteChainSchema.optional(),
      visual: AgentModelRouteChainSchema.optional(),
    })
    .strict()
    .optional(),
  budgets: z
    .object({
      runUsd: z.number().positive().optional(),
      dayUsd: z.number().positive().optional(),
      monthUsd: z.number().positive().optional(),
      routineUsd: z.number().positive().optional(),
    })
    .strict()
    .optional(),
  searchEngine: SearchEngineTemplateSchema.optional(),
  /** Preferred surface when a new blank tab opens. Private windows always start in Search. */
  homeEntryMode: z.enum(["search", "ask"]).optional(),
  followUpBehavior: z.enum(["queue", "steer"]).optional(),
  askTabSwitch: z.enum(["per-tab", "keep-current"]).optional(),
  commandRouting: z.enum(["automatic", "prefer-chat", "prefer-search"]).optional(),
  /** `kw query` engines — user entries merge over the built-in list. */
  searchEngines: z
    .array(
      z.object({
        keyword: z.string().trim().min(1).max(16),
        name: z.string().trim().min(1).max(60),
        template: SearchEngineTemplateSchema,
      }),
    )
    .max(32)
    .optional(),
  /** Remote search suggestions — off by default; never queried in private mode or for probable-private addresses. */
  searchSuggestions: z.boolean().optional(),
  /** Local Skill suggestions in the saved-work view; no model call. */
  nightShift: NightShiftSettingsSchema.optional(),
  routineSuggestionScan: z.enum(["off", "context", "five-minutes"]).optional(),
  /** Personal info offered to page forms on explicit request. Credentials and payment are never stored here. */
  autofill: AutofillProfileSchema.optional(),
  maxWorkers: z.number().int().min(1).max(16).optional(),
  perOrigin: z.number().int().min(1).max(8).optional(),
  /** `0` = no per-run cap. */
  maxModelCalls: z.number().int().nonnegative().optional(),
  theme: z.enum(["system", "dark", "light"]).optional(),
  sidebarAppearance: z.enum(["solid", "translucent"]).optional(),
  sidebarMaterial: SidebarMaterialSchema.optional(),
  sidebarTint: z.number().min(0).max(60).optional(),
  contentOpacity: z.number().min(80).max(100).optional(),
  sidebarBlur: z.number().min(0).max(40).optional(),
  sidebarOpacity: z.number().min(40).max(100).optional(),
  tabLayout: z.enum(["vertical", "horizontal"]).optional(),
  sidebarRecentChatLimit: z.union([z.literal(3), z.literal(5), z.literal(10)]).optional(),
  sidebarBookmarksVisible: z.boolean().optional(),
  verticalTabInsertionPosition: z.enum(["top", "bottom"]).optional(),
  horizontalTabShrinkToFit: z.boolean().optional(),
  downloadNaming: DownloadNamingSettingsSchema.optional(),
  toolbarAutoHide: z.boolean().optional(),
  minimalUi: z.boolean().optional(),
  minimalUiAcknowledged: z.boolean().optional(),
  autoArchive: z
    .object({
      acknowledged: z.boolean(),
      bySpace: z.record(
        z.string().min(1).max(200),
        z.union([
          z.literal(12),
          z.literal(24),
          z.literal(72),
          z.literal(168),
          z.literal(720),
          z.literal("never"),
        ]),
      ),
    })
    .strict()
    .optional(),
  /** Idle minutes before a clean background tab may be discarded. Zero disables automatic sleep. */
  memorySaverMinutes: MemorySaverMinutesSchema.optional(),
  tabSwitcherOrder: z.enum(["sidebar", "recently-used"]).optional(),
  /** Owner grouping/naming preference for reviewed AI Tidy proposals. */
  tidyPrompt: z.string().max(300).optional(),
  /** commandId → replacement bindings; null disables the command's shortcuts. */
  shortcutOverrides: ShortcutOverridesSchema.optional(),
  selectionCapture: SelectionCaptureSettingsSchema.optional(),
  zoomFactor: z.number().optional(),
});
export const SettingsGetParams = z.object({});
export const UsageReportParams = z
  .object({
    asOf: z.number().int().nonnegative().optional(),
    offset: z.number().int().nonnegative().default(0),
    limit: z.number().int().min(1).max(500).default(50),
  })
  .strict();
const UsageBucketSchema = z.object({
  calls: z.number().int().nonnegative(),
  recordedUsd: z.number().nonnegative(),
  unpricedCalls: z.number().int().nonnegative(),
  estimatedCalls: z.number().int().nonnegative(),
});
export const UsageReportResultSchema = z.object({
  asOf: z.number().int().nonnegative(),
  total: UsageBucketSchema,
  byRun: z.array(
    UsageBucketSchema.extend({
      runId: z.string().nullable(),
      title: z.string(),
      lastAt: z.number(),
    }),
  ),
  byModel: z.array(UsageBucketSchema.extend({ modelId: z.string() })),
  byDay: z.array(UsageBucketSchema.extend({ day: z.string() })),
  nextOffset: z.number().int().nonnegative().nullable(),
});
export type UsageReportResult = z.infer<typeof UsageReportResultSchema>;

/** history/bookmarks */
/** Chromium HistoryService is authoritative; these internal messages maintain a derived FTS index. */
export const HistoryProjectionVisitSchema = z
  .object({
    url: z.string().url().max(8192),
    title: z.string().max(4096),
    visitedAt: z.number().int().nonnegative(),
  })
  .strict();
export const HistoryProjectSnapshotParams = z
  .object({
    profileId: z.string().min(1).max(200),
    sourceGeneration: z.string().min(1).max(200),
    sequence: z.number().int().nonnegative(),
    batchIndex: z.number().int().nonnegative(),
    complete: z.boolean(),
    visits: z.array(HistoryProjectionVisitSchema).max(1000),
  })
  .strict();
export const HistoryProjectDeltaParams = z
  .object({
    profileId: z.string().min(1).max(200),
    sourceGeneration: z.string().min(1).max(200),
    sequence: z.number().int().nonnegative(),
    upserts: z.array(HistoryProjectionVisitSchema).max(1000).default([]),
    removals: z
      .array(HistoryProjectionVisitSchema.pick({ url: true, visitedAt: true }))
      .max(1000)
      .default([]),
    titleUpdates: z
      .array(HistoryProjectionVisitSchema.pick({ url: true, title: true }))
      .max(1000)
      .default([]),
    clearRange: z
      .object({
        since: z.number().int().nonnegative().optional(),
        before: z.number().int().nonnegative().optional(),
      })
      .optional(),
  })
  .strict();

export const PageWindowMoveParams = z.object({
  pageId: id,
  activate: z.boolean().optional(),
  windowId: id.optional(),
  spaceId: id,
  folder: z.object({ id: id, name: z.string().max(200), spaceId: id, collapsed: z.boolean() }).optional(),
});
export type PageWindowMove = z.infer<typeof PageWindowMoveParams>;

/** events */
export const EventsSinceParams = RunsEventsParams;

/** workspace snapshot for renderer sync */
export const WorkspaceGetParams = z.object({});

/** Host-neutral QuickJS code mode. A session is scoped to one authenticated caller. */
export const AgentJsRunParams = z
  .object({
    code: z.string().min(1).max(100_000),
    sessionId: z
      .string()
      .regex(/^[a-zA-Z0-9_-]{1,64}$/)
      .default("default"),
    deadlineMs: z.number().int().min(100).max(30_000).default(10_000),
  })
  .strict();
export const AgentJsResetParams = AgentJsRunParams.pick({ sessionId: true });
export const AgentJsResult = z.object({ value: z.unknown(), durationMs: z.number().nonnegative() });
export const AgentWebContextSchema = z.object({
  taskId: id.optional(),
  expectedRevision: z.number().int().positive().optional(),
});
export const AgentWebPageSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  text: z.string(),
  links: z.array(z.object({ title: z.string(), url: z.string().url() })),
  contentType: z.string(),
});
export const AgentTurnContextSchema = z.object({
  taskId: id,
  expectedRevision: z.number().int().positive(),
  turnId: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
});

import {
  ImportExtensionReviewParamsSchema,
  ImportExtensionReviewSchema,
  ImportJobStatusSchema,
  ImportSelectionSchema,
  ImportSourcePreviewSchema,
} from "./import.js";
export * from "./import.js";

export const MethodSchemas = {
  ...BrowserRuntimeMethodSchemas,
  "agent.tabs.list": z.object({ taskId: id, expectedRevision: z.number().int().positive() }).strict(),
  "agent.js.run": AgentJsRunParams,
  "agent.js.reset": AgentJsResetParams,
  "agent.utility.intent": UtilityIntentParamsSchema,
  "agent.tidy.propose": TidyProposalParamsSchema,
  "agent.tabName.suggest": TabNameSuggestParamsSchema,
  "agent.inlineAssist.capture": InlineAssistCaptureParamsSchema,
  "agent.inlineAssist.draft": InlineAssistDraftParamsSchema,
  "agent.inlineAssist.apply": InlineAssistApplyParamsSchema,
  "agent.inlineAssist.cancel": InlineAssistCancelParamsSchema,
  "agent.pageSummary": PageSummaryParamsSchema,
  "agent.web.fetch": AgentWebContextSchema.extend({ url: z.string().url().max(8192) }).strict(),
  "agent.web.search": AgentWebContextSchema.extend({ query: z.string().trim().min(1).max(500) }).strict(),
  "agent.images.generate": AgentWebContextSchema.extend({
    prompt: z.string().trim().min(1).max(4000),
  }).strict(),
  "agent.turn.open": AgentTurnContextSchema.extend({
    url: z.string().url().max(8192),
    skipIfActive: z.boolean().default(true),
  }).strict(),
  "agent.turn.end": AgentTurnContextSchema.strict(),
  "agent.turn.clipboard.write": AgentTurnContextSchema.extend({ text: z.string().max(256_000) }).strict(),
  "agent.turn.clipboard.read": AgentTurnContextSchema.strict(),
  "agent.turn.clipboard.paste": AgentTurnContextSchema.extend({
    pageId: id,
    target: z.string().min(1).max(2000),
    documentEpoch: z.number().int().nonnegative().optional(),
  }).strict(),
  "sites.read": SiteReadParamsSchema,
  "tasks.recordEvidence": EvidenceNoteParams,
  "tasks.captureEvidence": EvidenceCaptureParams,
  "tasks.importDocumentEvidence": TaskDocumentImportParamsSchema,
  "tasks.importTextEvidence": TaskTextEvidenceParamsSchema,
  "tasks.readDocumentEvidence": TaskDocumentReadParamsSchema,
  "tasks.reviewCriterion": CriterionReviewParams,
  "tasks.reconcileAction": TaskReconcileParams,
  "tasks.reconcileOperation": TaskReconcileOperationParams,
  "tasks.receipt": z.object({ taskId: id, revision: z.number().int().positive().optional() }),
  "tasks.exportReceipt": TaskReceiptExportParamsSchema,
  "tasks.undoBrowserChange": TaskUndoBrowserChangeParams,
  "tasks.undoRunBrowserChanges": TaskUndoRunBrowserChangesParams,
  "tasks.undoBookmarkChange": TaskUndoBrowserChangeParams,
  "tasks.undoDownloadChange": TaskUndoBrowserChangeParams,
  "tasks.undoHistoryChange": TaskUndoBrowserChangeParams,
  "tasks.verifyCriterion": TaskVerifyCriterionParams,
  "tasks.replaceAgent": TaskReplaceAgentParams,
  "workspaces.create": z.object({ name: z.string().trim().min(1).max(100) }),
  "spaces.list": z.object({}),
  "workspaces.list": z.object({}),
  "workspaces.folders.inspect": z
    .object({ workspaceId: id, path: z.string().min(1).max(4096), access: WorkspaceFolderAccessSchema })
    .strict(),
  "workspaces.folders.add": z
    .object({
      workspaceId: id,
      path: z.string().min(1).max(4096),
      access: WorkspaceFolderAccessSchema,
      expectedDigest: z.string().regex(/^[a-f0-9]{64}$/),
      ...WorkspaceFolderPresentationSchema.shape,
    })
    .strict(),
  "workspaces.folders.list": z.object({ workspaceId: id }).strict(),
  "workspaces.folders.archive": z.object({ workspaceId: id, folderId: z.string().uuid() }).strict(),
  "workspaces.browsingMemory.get": z.object({ workspaceId: id }),
  "workspaces.browsingMemory.set": z.object({ workspaceId: id, policy: BrowsingMemoryPolicySchema }),
  "workspaces.browsingMemory.record": z.object({
    workspaceId: id,
    pageId: id,
    expectedDocumentEpoch: z.number().int().nonnegative(),
  }),
  "workspaces.browsingMemory.forget": z.object({ workspaceId: id, memoryId: id.optional() }),
  "workspaces.contentMemory.policy": z.object({ workspaceId: id }),
  "workspaces.contentMemory.setPolicy": z.object({ workspaceId: id, policy: ContentMemoryPolicySchema }),
  "workspaces.contentMemory.capture": z.object({
    workspaceId: id,
    pageId: id,
    expectedDocumentEpoch: z.number().int().nonnegative(),
    expectedUrl: z.string().url().max(8192),
  }),
  "workspaces.contentMemory.semanticSearch": z
    .object({ workspaceId: id, query: z.string().trim().min(1).max(200) })
    .strict(),
  "workspaces.contentMemory.embeddingModels": z.object({ workspaceId: id }).strict(),
  "workspaces.contentMemory.search": z.object({ workspaceId: id, query: z.string().trim().min(1).max(200) }),
  "workspaces.contentMemory.list": z
    .object({
      workspaceId: id,
      query: z.string().trim().max(200).default(""),
      cursor: z.object({ capturedAt: z.number(), memoryId: id }).optional(),
      selectedIds: z.array(id).default([]),
    })
    .strict(),
  "workspaces.contentMemory.get": z.object({ workspaceId: id, memoryId: id }),
  "workspaces.contentMemory.forget": z.object({ workspaceId: id, memoryId: id.optional() }),
  "workspaces.memory.get": z.object({ workspaceId: id }),
  "workspaces.memory.search": z.object({ query: z.string().trim().min(1).max(1000) }),
  "workspaces.memory.set": z.object({
    workspaceId: id,
    expectedRevision: z.number().int().nonnegative(),
    content: z.string().max(16_000),
    enabled: z.boolean().optional(),
    items: z.array(WorkspaceMemoryItemSchema).max(40).optional(),
    excludedOrigins: z.array(z.string().max(2048)).max(100).optional(),
  }),
  "tasks.create": TaskCreateParams,
  "tasks.promote": TaskPromoteParams,
  "tasks.update": TaskUpdateParams,
  "tasks.get": z.object({ taskId: id }),
  "tasks.list": z.object({
    query: z.string().trim().max(1000).optional(),
    workspaceId: id.optional(),
    includeArchived: z.boolean().default(false),
    limit: z.number().int().min(1).max(500).default(100),
  }),
  "tasks.archive": z.object({
    taskId: id,
    expectedRevision: z.number().int().positive(),
    archived: z.boolean(),
  }),
  "tasks.start": RunsStartParams.omit({ goal: true, setId: true, requestId: true }).extend({
    taskId: id,
    expectedRevision: z.number().int().positive(),
  }),
  "installation.createBackup": z.object({}).strict(),
  "installation.listBackups": z.object({}).strict(),
  "installation.deleteBackup": z
    .object({ name: z.string().min(1).max(200), expectedSha256: z.string().regex(/^[a-f0-9]{64}$/) })
    .strict(),
  "installation.backupRetention": z.object({}).strict(),
  "installation.setBackupRetention": z
    .object({ keep: z.union([z.literal(3), z.literal(5), z.literal(10), z.literal(20)]) })
    .strict(),
  "installation.stageListedRestore": z
    .object({ name: z.string().min(1).max(200), expectedSha256: z.string().regex(/^[a-f0-9]{64}$/) })
    .strict(),
  "installation.stageRestore": z.object({ path: z.string().min(1).max(4096) }).strict(),
  "installation.cancelRestore": z.object({}).strict(),
  "installation.restoreStatus": z.object({}).strict(),
  "installation.exportRecovery": z.object({ phrase: z.string().min(16).max(200) }).strict(),
  "installation.inspectRecovery": z
    .object({ path: z.string().min(1).max(4096), phrase: z.string().min(1).max(200) })
    .strict(),
  "installation.stageRecovery": z
    .object({
      path: z.string().min(1).max(4096),
      phrase: z.string().min(1).max(200),
      expectedSha256: z.string().regex(/^[a-f0-9]{64}$/),
      reviewToken: z.string().uuid(),
    })
    .strict(),
  "vault.status": z.object({}),
  "vault.list": z.object({ includeRevoked: z.boolean().default(false) }),
  "vault.save": VaultSaveParams,
  "vault.lock": VaultLockParams,
  "vault.unlock": VaultUnlockParams,
  "vault.grant": VaultGrantParams,
  "vault.renewGrant": VaultRenewGrantParams,
  "vault.expiredGrants": z.object({}).strict(),
  "vault.revoke": z
    .object({ itemId: id.optional(), grantId: id.optional() })
    .strict()
    .refine((value) => !!value.itemId || !!value.grantId, "Choose a vault item or grant to revoke"),
  "vault.history": z.object({ itemId: id.optional(), limit: z.number().int().min(1).max(200).default(50) }),
  "vault.grants": z.object({ taskId: id.optional(), origin: z.string().url().optional() }),
  "vault.generate": VaultGenerateParams,
  "vault.itemsForOrigin": VaultItemsForOriginParams,
  "vault.fill": VaultHumanFillParams,
  "vault.export": VaultEncryptedExportParams,
  "vault.import": VaultEncryptedImportParams,
  "vault.update": VaultUpdateParams,
  "vault.secretMatches": VaultSecretMatchParams,
  "routines.list": z.object({
    workspaceId: id.optional(),
    status: z.enum(["all", "ready", "paused", "archived"]).optional(),
    cursor: z.object({ updatedAt: z.number().int().nonnegative(), routineId: id }).strict().optional(),
    query: z.string().trim().max(200).optional(),
    includeArchived: z.boolean().default(false),
    limit: z.number().int().min(1).max(200).default(50),
  }),
  "goals.create": GoalCreateParams,
  "goals.get": z.object({ goalId: z.string().uuid() }).strict(),
  "goals.list": z
    .object({ workspaceId: id.optional(), limit: z.number().int().min(1).max(200).default(100) })
    .strict(),
  "goals.start": z.object({ goalId: z.string().uuid(), pageIds: z.array(id).min(1).max(8) }).strict(),
  "goals.pause": z.object({ goalId: z.string().uuid() }).strict(),
  "goals.resume": z.object({ goalId: z.string().uuid() }).strict(),
  "goals.cancel": z.object({ goalId: z.string().uuid() }).strict(),
  "hooks.register": HookCreateParams,
  "hooks.get": z.object({ hookId: z.string().uuid() }).strict(),
  "hooks.list": z.object({ workspaceId: id }).strict(),
  "hooks.revoke": z.object({ hookId: z.string().uuid() }).strict(),
  "hooks.test": z.object({ hookId: z.string().uuid() }).strict(),
  "hooks.invocations": z
    .object({ hookId: z.string().uuid(), limit: z.number().int().min(1).max(200).default(100) })
    .strict(),
  "routines.scan": z.object({ workspaceId: id, limit: z.number().int().min(1).max(20).default(5) }).strict(),
  "routines.suggest": z
    .object({
      workspaceId: id.optional(),
      text: z.string().max(4000).optional(),
      pageUrl: z.string().max(2048).optional(),
      limit: z.number().int().min(1).max(20).default(5),
    })
    .strict(),
  "routines.get": z.object({ routineId: id }),
  "routines.create": RoutineCreateParams,
  "routines.fromResult": RoutineFromResultParams,
  "routines.replay.repair.propose": SkillRepairProposeSchema,
  "routines.replay.repair.apply": SkillRepairApplySchema,
  "routines.replay.compileDemonstration": DemonstrationReplayCompileSchema,
  "routines.replay.compile": RoutineReplayCompileParams,
  "routines.replay.test": RoutineReplayTestParams,
  "routines.replay.result": RoutineReplayResultParams,
  "routines.update": RoutineUpdateParams,
  "routines.pause": z.object({
    routineId: id,
    expectedRevision: z.number().int().positive(),
    paused: z.boolean(),
  }),
  "routines.archive": z.object({
    routineId: id,
    expectedRevision: z.number().int().positive(),
    archived: z.boolean(),
  }),
  "routines.run": RoutineRunParams,
  "routines.runs": z.object({
    routineId: id,
    cursor: z.object({ createdAt: z.number().int().nonnegative(), routineRunId: id }).strict().optional(),
    limit: z.number().int().min(1).max(100).default(30),
  }),
  "routines.outcome": z.object({ routineRunId: id }),
  "routines.reconcile": z
    .object({
      routineRunId: id,
      outcome: z.enum(["applied", "not_applied"]),
      note: z.string().trim().min(1).max(1000),
    })
    .strict(),
  "routines.due": z.object({ now: z.number().optional() }),
  "routines.ingestEvent": RoutineSourceEventSchema,
  "routines.alerts": z.object({ limit: z.number().int().min(1).max(100).default(30) }),
  "routines.inbox": z
    .object({
      workspaceId: id.optional(),
      cursor: z.object({ createdAt: z.number().int().nonnegative(), routineRunId: id }).strict().optional(),
      limit: z.number().int().min(1).max(100).default(50),
      unreadOnly: z.boolean().default(false),
    })
    .strict(),
  "routines.inboxRead": z.object({ routineRunId: id }).strict(),
  "routines.compare": z.object({ leftRunId: id, rightRunId: id }).strict(),
  "routines.export": z.object({ routineIds: z.array(id).min(1).max(500).optional() }).strict(),
  "routines.exportSkill": z.object({ routineId: id }).strict(),
  "routines.skills.preview": SkillLibraryPreviewParams,
  "routines.skills.import": SkillLibraryImportParams,
  "routines.importSkill": z.object({ path: z.string().trim().min(1).max(4096), workspaceId: id }).strict(),
  "routines.import": z
    .object({
      routines: z.array(RoutineShareSchema).max(500).optional(),
      path: z.string().trim().min(1).max(4096).optional(),
      workspaceId: id.optional(),
    })
    .strict()
    .refine((value) => (value.routines === undefined) !== (value.path === undefined), {
      message: "Pass routines or a file path, not both",
    }),
  "zap.list": z.object({}).strict(),
  "zap.grant": ZapGrantParamsSchema,
  "zap.update": ZapUpdateParamsSchema,
  "zap.revoke": ZapRevokeParamsSchema,

  "plugins.inspect": z.object({ path: z.string().trim().min(1).max(4096) }).strict(),
  "plugins.install": z
    .object({
      path: z.string().trim().min(1).max(4096),
      workspaceId: id,
      expectedDigest: z
        .string()
        .regex(/^[a-f0-9]{64}$/)
        .optional(),
    })
    .strict(),
  "plugins.list": z
    .object({ workspaceId: id.optional(), includeUninstalled: z.boolean().default(false) })
    .strict(),
  "plugins.assets": z.object({ pluginId: id }).strict(),
  "plugins.skills.grant": PluginSkillGrantParams,
  "plugins.skills.grants": z.object({ pluginId: id }).strict(),
  "plugins.skills.revoke": z.object({ grantId: z.string().uuid() }).strict(),
  "plugins.skills.read": PluginSkillReadParams,
  "plugins.uninstall": z.object({ pluginId: id }).strict(),
  "agentConnections.list": z.object({}),
  "agentConnections.create": AgentConnectionCreateParams,
  "agentConnections.install": AgentConnectionCreateParams,
  "developer.cli.install": z.object({}).strict(),
  "agentConnections.revoke": z.object({ connectionId: z.string().uuid() }).strict(),
  "mcp.servers.register": OutboundMcpRegisterParams,
  "mcp.bundles.inspect": z.object({ path: z.string().trim().min(1).max(4096) }).strict(),
  "mcp.servers.list": z.object({ workspaceId: id }).strict(),
  "mcp.servers.revoke": z.object({ serverId: z.string().uuid() }).strict(),
  "mcp.oauth.requirements": z.object({ serverId: z.string().uuid() }).strict(),
  "mcp.oauth.configure": McpOAuthClientSetupSchema,
  "mcp.oauth.start": z.object({ serverId: z.string().uuid() }).strict(),
  "mcp.oauth.status": z.object({ serverId: z.string().uuid() }).strict(),
  "mcp.oauth.clear": z.object({ serverId: z.string().uuid() }).strict(),
  "mcp.tools.list": z.object({ serverId: z.string().uuid() }).strict(),
  "mcp.tools.setEnabled": OutboundMcpToolToggleParams,
  "mcp.tools.call": z
    .object({
      serverId: z.string().uuid(),
      toolName: z.string().min(1).max(200),
      arguments: z.record(z.string(), z.unknown()),
      context: z
        .object({ workspaceId: id, taskId: id.optional(), revision: z.number().int().positive().optional() })
        .strict(),
    })
    .strict(),
  "memory.paste.preview": MemoryPastePreviewParams,
  "memory.paste.commit": MemoryPasteCommitParams,
  "memory.paste.status": MemoryPasteStatusParams,
  "memory.pipeline.policy": z.object({ workspaceId: id }).strict(),
  "memory.pipeline.setPolicy": MemoryPipelinePolicySchema,
  "memory.pipeline.extractRun": z.object({ workspaceId: id, runId: id }).strict(),
  "memory.pipeline.sources": z.object({ workspaceId: id }).strict(),
  "memory.pipeline.inbox": z.object({ workspaceId: id }).strict(),
  "memory.pipeline.claims": z.object({ workspaceId: id }).strict(),
  "memory.pipeline.history": z.object({ workspaceId: id }).strict(),
  "memory.pipeline.activity": z.object({ workspaceId: id }).strict(),
  "memory.pipeline.reindex": z.object({ workspaceId: id }).strict(),
  "memory.pipeline.documents": z.object({ workspaceId: id }).strict(),
  "memory.pipeline.edit": MemoryClaimEditParams,
  "memory.pipeline.revert": z.object({ workspaceId: id, revisionId: z.string().uuid() }).strict(),
  "memory.pipeline.review": z
    .object({ workspaceId: id, claimId: z.string().uuid(), decision: z.enum(["accept", "discard"]) })
    .strict(),
  "memory.pipeline.overview": z.object({ workspaceId: id }).strict(),
  "memory.pipeline.search": z.object({ workspaceId: id, query: z.string().trim().min(2).max(200) }).strict(),
  "memory.pipeline.forget": MemoryPipelineForgetParams,
  "subagents.createGroup": SubagentGroupCreateParams,
  "subagents.spawn": SubagentSpawnParams,
  "subagents.forkSelf": SubagentSpawnParams.extend({ sourceRunId: id }),
  "subagents.sendMessage": SubagentMessageParams,
  "subagents.getGroup": z.object({ groupId: z.string().uuid() }).strict(),
  "subagents.cancel": z.object({ agentId: z.string().uuid() }).strict(),
  "calendar.connections.list": z.object({}),
  "calendar.auth.start": z.object({}),
  "calendar.connections.revoke": z.object({ connectionId: z.string().uuid() }).strict(),
  "calendar.events.list": CalendarEventsQuerySchema,
  "calendar.taskGrants.list": z.object({ taskId: z.string().uuid() }).strict(),
  "calendar.taskGrants.create": z
    .object({
      taskId: z.string().uuid(),
      expectedRevision: z.number().int().positive(),
      connectionId: z.string().uuid(),
    })
    .strict(),
  "calendar.taskGrants.revoke": z.object({ taskId: z.string().uuid(), grantId: z.string().uuid() }).strict(),
  "calendar.taskEvents.list": CalendarTaskEventsQuerySchema,
  "connectors.catalog": z
    .object({
      workspaceId: id,
      taskId: z.string().uuid().optional(),
      expectedRevision: z.number().int().positive().optional(),
    })
    .strict()
    .refine(
      (value) => (value.taskId === undefined) === (value.expectedRevision === undefined),
      "Task and revision must be supplied together.",
    ),
  "pages.list": PagesListParams,
  "pages.open": PagesOpenParams,
  "pages.close": PagesCloseParams,
  "pages.activate": PagesActivateParams,
  "pages.moveToWindow": PageWindowMoveParams,
  "pages.navigate": PagesNavigateParams,
  "pages.back": PagesCloseParams,
  "pages.forward": PagesCloseParams,
  "pages.reload": PagesCloseParams,
  "pages.stop": PagesCloseParams,
  "pages.observe": PagesObserveParams,
  "pages.execute": PagesExecuteParams,
  "pages.webmcp": PagesWebmcpParams,
  "pages.cuaExecute": PagesCuaExecuteParams,
  "pages.reconcileWrite": PagesReconcileWriteParams,
  "pages.extract": PagesExtractParams,
  "pages.elementInfo": PagesElementInfoParams,
  "pages.accessibilityHtml": PagesAccessibilityHtmlParams,
  "pages.read": PagesReadParams,
  "pages.waitFor": PagesWaitForParams,
  "pages.console": PagesConsoleParams,
  "pages.dialog": PagesDialogParams,
  "pages.network": PagesNetworkParams,
  "pages.capture": PagesCaptureParams,

  "pages.find": PagesFindParams,
  "pages.stopFind": PagesStopFindParams,
  "pages.zoom": PagesZoomParams,
  "pages.takeover": PagesTakeoverParams,
  "pages.pickElement": PagesPickElementParams,
  "customization.zap.pick": z
    .object({
      pageId: id,
      expectedDocumentEpoch: z.number().int().nonnegative(),
      timeoutMs: z.number().int().min(1000).max(120000).optional(),
    })
    .strict(),
  "customization.zap.list": z.object({ origin: SiteOriginSchema }).strict(),
  "customization.zap.add": z
    .object({
      pageId: id,
      expectedDocumentEpoch: z.number().int().nonnegative(),
      origin: SiteOriginSchema,
      selector: ZapSelectorSchema,
    })
    .strict(),
  "customization.zap.remove": z.object({ ruleId: z.string().uuid() }).strict(),
  "customization.css.propose": SiteCssProposalParamsSchema,
  "customization.css.get": z.object({ origin: SiteOriginSchema }).strict(),
  "customization.css.set": z.object({ origin: SiteOriginSchema, css: SiteCssSchema.shape.css }).strict(),
  "customization.css.effective": z.object({ origin: SiteOriginSchema }).strict(),
  "customization.css.apply": z
    .object({ pageId: id, expectedDocumentEpoch: z.number().int().nonnegative() })
    .strict(),
  "pages.resume": PagesResumeParams,
  "pages.openLive": PagesOpenLiveParams,
  "sets.create": SetsCreateParams,
  "sets.get": SetsGetParams,
  "sets.list": z.object({}),
  "sets.map": SetsMapParams,
  "sets.results": SetsResultsParams,
  "runs.start": RunsStartParams,
  "runs.reconcileStart": RunsStartParams.required({ requestId: true }),
  "runs.retry": RunsControlParams.extend({ pageId: id.optional() }),
  "runs.branch": z.object({ runId: id, mode: z.enum(["branch", "edit"]) }).strict(),
  "runs.branch.list": z.object({}).strict(),
  "runs.get": RunsGetParams,
  "runs.list": RunsListParams,
  "runs.context.get": RunsContextGetParams,
  "runs.context.set": RunsContextSetParams,
  "conversations.list": ConversationsListParams,
  "conversations.prepared": z.object({}),
  "conversations.get": z.object({ chatId: id }),
  "conversations.search": ConversationSearchParams,
  "conversations.turns": z.object({ chatId: id, runId: id }),
  "conversations.rename": ConversationRenameParams,
  "conversations.archive": ConversationArchiveParams,
  "conversations.delete": ConversationDeleteParams,
  "conversations.images.get": z.object({ chatId: id }),
  "conversations.images.add": z.object({
    chatId: id,
    filename: z.string().trim().min(1).max(255).default("Page capture.png"),
    dataUrl: z.string().max(4_200_000),
    sourceUrl: z.string().max(8192).optional(),
    sourcePage: PageContextRefSchema.optional(),
  }),
  "conversations.images.read": ConversationImageControl,
  "conversations.images.toggle": ConversationImageControl.extend({ included: z.boolean() }),
  "conversations.images.remove": ConversationImageControl,
  "conversations.attachments.get": z.object({ chatId: id }),
  "conversations.attachments.read": ConversationDocumentReadParamsSchema,
  "conversations.attachments.import": ConversationDocumentImportParamsSchema,
  "conversations.attachments.add": ConversationAttachmentAddParams,
  "conversations.attachments.page": z.object({
    chatId: id,
    pageId: id,
    expectedDocumentEpoch: z.number().int().nonnegative(),
  }),
  "conversations.attachments.toggle": ConversationAttachmentToggleParams,
  "conversations.attachments.remove": ConversationAttachmentControlParams,
  "results.generate": GenerateResultParamsSchema,
  "results.generated.get": z.object({ artifactId: id }),
  "results.generated.versions": z.object({ artifactId: id }),
  "results.search": z.object({
    query: z.string().trim().min(1).max(300),
    limit: z.number().int().min(1).max(30).default(12),
  }),
  "results.read": z.object({ artifactId: id }),
  "results.available": z.object({ drafts: z.array(z.object({ artifactId: id, chatId: id })).max(100) }),
  "results.saveVersion": z.object({
    chatId: id,
    sourceArtifactId: id,
    content: z
      .string()
      .max(262144)
      .refine(
        (value) => !value.includes("\0") && new TextEncoder().encode(value).length <= 262144,
        "Use text without null characters, up to 256 KB",
      ),
  }),
  "conversations.artifacts.get": z.object({ chatId: id }),
  "conversations.artifacts.toggle": ConversationArtifactToggleParams,
  "conversations.sources.get": z.object({ chatId: id }),
  "conversations.workspace.get": z.object({ chatId: id }),
  "conversations.workspace.set": ConversationWorkspaceSetParams,
  "runs.pause": RunsControlParams,
  "runs.resume": RunsControlParams,
  "runs.cancel": RunsControlParams,
  "runs.answer": RunsAnswerParams,
  "runs.continueBudget": RunsContinueBudgetParams,
  "runs.useLocalExecution": z.object({ runId: id, suspensionId: id }).strict(),
  "runs.retryCloudSetup": z.object({ runId: id, suspensionId: id }).strict(),
  "runs.retryModelSetup": z.object({ runId: id, suspensionId: id }).strict(),
  "runs.queue": RunsQueueParams,
  "runs.steer": RunsSteerParams,
  "runs.messages.list": z.object({ chatId: id, runIds: z.array(id) }),
  "runs.messageStatus": z.object({ nonce: id }),
  "safety.decisions.list": SafetyActivityQuerySchema,
  "packages.list": z.object({}).strict(),
  "packages.install": z.object({path:z.string().min(1).max(4096)}).strict(),
  "packages.remove": z.object({name:z.string().min(1).max(128)}).strict(),
  "packages.defaults": z.object({names:z.array(z.string().min(1).max(128)).max(32)}).strict(),
  "coding.activity": CodingRunParams,
  "coding.worktreeInspect": z.object({runId:id,cellId:id}).strict(),
  "coding.worktreeArchive": z.object({runId:id,cellId:id,expectedDigest:z.string().regex(/^[a-f0-9]{64}$/),actionId:z.string().min(1)}).strict(),
  "coding.changes": CodingChangesParams,
  "coding.undo": CodingUndoParams,
  "coding.processes": CodingRunParams,
  "coding.logs": CodingLogsParams,
  "coding.stop": CodingProcessParams,
  "coding.preview": CodingProcessParams.extend({ port: z.number().int().min(1).max(65535) }).strict(),
  "coding.previewClose": CodingRunParams.extend({ previewId: z.string().uuid() }).strict(),
  "safety.grants.revokeRun": z.object({ runId: id }).strict(),
  "safety.approvals.pending": z.object({ threadId: id }),
  "safety.approvals.decide": z.object({ decision: ApprovalDecisionSchema, expectedTurnId: id }).strict(),
  "runs.message.cancel": z.object({ messageId: id }),
  "runs.events": RunsEventsParams,
  "events.since": EventsSinceParams,
  "artifacts.list": ArtifactsListParams,
  "artifacts.read": ArtifactsReadParams,
  "programs.list": z.object({}),
  "programs.run": ProgramsRunParams,
  "programs.save": ProgramsSaveParams,
  "programs.delete": ProgramsDeleteParams,
  "sessions.list": z.object({}),
  "chrome.importCookies": z.object({
    source: z.enum(["auto", "profile"]).optional(),
  }),

  "onboarding.get": z.object({}).strict(),
  "onboarding.update": OnboardingUpdateParamsSchema,
  "import.extensions.review": ImportExtensionReviewParamsSchema,
  "import.selectWindow": z.object({ sourceId: z.literal("safari") }).strict(),
  "import.selectExport": z
    .object({ sourceId: BrowserExportSourceSchema, format: BrowserExportFormatSchema })
    .strict(),
  "import.exportStatus": z.object({ selectionId: z.string().min(16).max(128) }).strict(),
  "import.cancelExport": z.object({ selectionId: z.string().min(16).max(128) }).strict(),
  "import.preview": z.object({}),
  "import.run": z
    .object({
      selections: z.array(ImportSelectionSchema).min(1).max(12),
      acknowledgeInterruptedJobId: z.string().min(1).max(64).optional(),
    })
    .strict(),
  "import.status": z.object({ jobId: z.string().min(1).max(64).optional() }),
  "import.cancel": z.object({ jobId: z.string().min(1).max(64) }),
  "chrome.openLive": ChromeOpenLiveParams,
  "projects.files": ProjectFilesParams,
  "projects.file": ProjectFileParams,
  "projects.changes": ProjectChangesParams,
  "terminal.start": TerminalStartParams,
  "terminal.read": TerminalReadParams,
  "terminal.input": TerminalInputParams,
  "terminal.resize": TerminalResizeParams,
  "terminal.close": TerminalCloseParams,
  "terminal.listeners": TerminalListenersParams,
  "terminal.preview": TerminalPreviewParams,
  "terminal.previewClose": TerminalPreviewCloseParams,
  "models.auth.start": z
    .object({
      provider: z.enum(["openrouter", "chatgpt", "vercel"]),
      accountId: z
        .string()
        .regex(/^[a-f0-9]{64}$/)
        .optional(),
    })
    .strict()
    .refine((value) => value.provider !== "openrouter" || value.accountId === undefined),
  "models.auth.status": z.object({ attemptId: z.string().regex(/^[A-Za-z0-9_-]{43}$/) }).strict(),
  "models.auth.cancel": z.object({ attemptId: z.string().regex(/^[A-Za-z0-9_-]{43}$/) }).strict(),
  "models.auth.accounts": z.object({}).strict(),
  "models.auth.disconnect": z.object({ accountId: z.string().regex(/^[a-f0-9]{64}$/) }).strict(),
  "models.copilot.setup": z.object({}).strict(),
  "models.copilot.install": z.object({}).strict(),
  "models.copilot.start": z.object({}).strict(),
  "models.copilot.status": CopilotAttemptParams,
  "models.copilot.cancel": CopilotAttemptParams,
  "models.copilot.accounts": z.object({}).strict(),
  "models.copilot.disconnect": CopilotAccountParams,
  "models.copilot.catalog": CopilotAccountParams,
  "models.list": z.object({}),
  "models.probe": ModelsProbeParams,
  "translate.page": z
    .object({
      texts: z.array(z.string().max(4000)).min(1).max(400),
      target: z.string().min(2).max(40).optional(),
      context: z.string().max(200).optional(),
      source: z
        .object({
          pageId: z.string().min(1).max(200),
          expectedUrl: z.string().max(8192),
          expectedDocumentEpoch: z.number().int().nonnegative().optional(),
        })
        .strict()
        .optional(),
    })
    .strict(),
  "translate.text": z
    .object({
      text: z.string().min(1).max(12000),
      context: z.string().max(200).optional(),
      source: z
        .object({
          pageId: z.string().min(1).max(200),
          expectedUrl: z.string().max(8192),
          expectedDocumentEpoch: z.number().int().nonnegative().optional(),
        })
        .strict()
        .optional(),
      target: z.string().min(2).max(40).optional(),
    })
    .strict(),

  "settings.remoteDebugging.get": z.object({}).strict(),
  "settings.remoteDebugging.set": z.object({ enabled: z.boolean() }).strict(),
  "settings.cloud.status": z.object({}).strict(),
  "settings.cloud.configure": CloudConfigureParamsSchema,
  "settings.cloud.clear": z.object({ expectedRevision: z.number().int().nonnegative() }).strict(),
  "settings.get": SettingsGetParams,
  "settings.set": SettingsSetParams,
  "usage.report": UsageReportParams,
  "command.ranking.list": z.object({}).strict(),
  "command.ranking.record": z
    .object({
      query: z.string().trim().min(1).max(160),
      candidateKey: z.string().min(1).max(300),
      source: CommandRankingSourceSchema,
      pickOrigin: z.enum(["typed", "bar", "link"]).optional(),
    })
    .strict(),
  "command.ranking.clear": z.object({}).strict(),
  "browser.recovery.list": z.object({}),
  "browser.recovery.retry": z.object({ pageId: id }),
  "history.list": HistoryMethodSchemas["history.list"],
  "history.projectSnapshot": HistoryProjectSnapshotParams,
  "history.projectDelta": HistoryProjectDeltaParams,
  "history.count": HistoryMethodSchemas["history.count"],
  "history.clear": HistoryMethodSchemas["history.clear"],
  "history.remove": HistoryMethodSchemas["history.remove"],
  ...BookmarkMethodSchemas,
  "downloads.list": z.object({}),
  "downloads.projectNative": DownloadSchema.extend({
    id: z.string().min(1).max(200),
    filename: z.string().max(1000),
    path: z.string().max(4096),
    tabUrl: z.string().url().max(8192),
    downloadRoot: z.string().min(1).max(4096),
  }).strict(),
  "downloads.remove": z.object({ ids: z.array(z.string().min(1).max(200)).min(1).max(200) }),
  "workspace.get": WorkspaceGetParams,
  "bench.run": z.object({
    task: z.string().optional(),
    repeats: z.number().int().positive().max(200).optional(),
  }),

  /** runtime-vnext: responses, state index, datasets, operations, traces */
  "responses.list": z.object({
    pageId: id,
    since: z.number().optional(),
    urlIncludes: z.string().optional(),
    limit: z.number().int().positive().max(1000).optional(),
  }),
  "responses.body": z.object({ requestId: id }),
  "state.query": StateQuerySchema,
  "state.datasets": z.object({ runId: z.string().optional(), pageId: z.string().optional() }),
  "datasets.rows": z.object({ datasetId: id, limit: z.number().int().positive().max(5000).optional() }),
  "datasets.transform": z.object({
    datasetId: id,
    op: z.enum(["project", "filter", "sort", "dedup", "group", "limit", "export"]),
    args: z.record(z.string(), z.unknown()).optional(),
  }),
  "datasets.save": z.object({
    rows: z.array(z.record(z.string(), z.unknown())),
    source: z.string(),
    runId: z.string().optional(),
    pageId: z.string().optional(),
    schema: z.array(z.string()).optional(),
    provenance: z.string().optional(),
  }),
  "operations.list": z.object({ siteKey: z.string().optional() }),
  "operations.get": z.object({ siteKey: z.string(), name: z.string() }),
  "operations.saveProgram": z.object({
    // pageId optional — operations bind a page per-invocation
    program: ProgramSchema.extend({ pageId: z.string().optional() }),
    siteKey: z.string(),
    name: z.string(),
    description: z.string().optional(),
    inputSchema: z.unknown().optional(),
    outputSchema: z.unknown().optional(),
    effectClass: z.enum(["read", "write", "destructive"]).optional(),
    guards: z.record(z.string(), z.unknown()).optional(),
  }),
  "operations.saveRequest": z.object({
    siteKey: z.string(),
    name: z.string(),
    description: z.string().optional(),
    method: z.string().optional(),
    url: z.string(),
    body: z.unknown().optional(),
    headers: z.record(z.string(), z.string()).optional(),
    inputSchema: z.unknown().optional(),
    outputSchema: z.unknown().optional(),
    effectClass: z.enum(["read", "write", "destructive"]).optional(),
    guards: z.record(z.string(), z.unknown()).optional(),
    validated: z.boolean().optional(),
  }),
  "operations.invoke": z.object({
    siteKey: z.string(),
    name: z.string(),
    inputs: z.record(z.string(), z.unknown()).optional(),
    pageId: z.string().optional(),
    runId: z.string().optional(),
    implId: z.string().optional(),
    /** §16.4 idempotency — a repeated requestKey returns the stored invocation */
    requestKey: z.string().optional(),
  }),
  "operations.explain": z.object({ siteKey: z.string(), name: z.string(), pageId: z.string().optional() }),
  "operations.setImplState": z.object({
    implId: id,
    state: z.enum(["candidate", "validated", "shadow", "quarantined"]),
  }),
  "operations.disable": z.object({ implId: id }),
  "operations.forget": z.object({ siteKey: z.string(), name: z.string() }),
  /** §10.3 — compile a candidate impl from a run's persisted step trace. */
  "operations.compile": z.object({ runId: id, siteKey: z.string().optional(), name: z.string().optional() }),
  "programs.validate": z.object({ program: ProgramSchema }),
  "traces.list": z.object({
    since: z.number().optional(),
    runId: z.string().optional(),
    limit: z.number().int().positive().max(2000).optional(),
  }),
  "traces.summary": z.object({ runId: id }),
  "traces.counters": z.object({}),
  "runtime.describe": z.object({}),
} as const;

export type MethodName = keyof typeof MethodSchemas;

/** One schema and one explicit feature/auth policy for each API method. */
export const MethodDefinitions = Object.fromEntries(
  (Object.keys(MethodSchemas) as MethodName[]).map((name) => [
    name,
    {
      schema: MethodSchemas[name],
      ...RuntimeMethodPolicy[name],
    },
  ]),
) as {
  readonly [M in MethodName]: {
    schema: (typeof MethodSchemas)[M];
    feature: (typeof RuntimeMethodPolicy)[M]["feature"];
    auth: (typeof RuntimeMethodPolicy)[M]["auth"];
  };
};

/** Wire shapes for the result column — used for typing, validated server-side. */
export const ResultSchemas = {
  ...BrowserRuntimeResultSchemas,
  "agent.tabs.list": z.array(z.object({ pageId: id, title: z.string(), url: z.string() }).strict()),
  "agent.js.run": AgentJsResult,
  "agent.js.reset": z.object({ reset: z.literal(true) }),
  "agent.utility.intent": UtilityIntentResultSchema,
  "agent.tidy.propose": TidyProposalSchema,
  "agent.tabName.suggest": TabNameSuggestionSchema,
  "agent.inlineAssist.capture": InlineAssistCaptureSchema,
  "agent.inlineAssist.draft": InlineAssistDraftSchema,
  "agent.inlineAssist.apply": InlineAssistApplySchema,
  "agent.inlineAssist.cancel": z.object({ cancelled: z.literal(true) }),
  "agent.pageSummary": PageSummaryResultSchema,
  "agent.web.fetch": AgentWebPageSchema,
  "agent.web.search": AgentWebPageSchema,
  "agent.images.generate": z.object({
    artifactId: id,
    mediaType: z.string(),
    size: z.number().int().positive(),
    modelId: z.string(),
  }),
  "agent.turn.open": PageTargetSchema,
  "agent.turn.end": z.object({ closed: z.array(id) }),
  "agent.turn.clipboard.write": z.object({ bytes: z.number().int().nonnegative() }),
  "agent.turn.clipboard.read": z.object({ text: z.string() }),
  "agent.turn.clipboard.paste": ProgramResultSchema,
  "sites.read": SiteReadResultSchema,
  "tasks.recordEvidence": TaskEvidenceSchema,
  "tasks.captureEvidence": TaskEvidenceSchema,
  "tasks.importDocumentEvidence": TaskEvidenceSchema,
  "tasks.importTextEvidence": TaskEvidenceSchema,
  "tasks.readDocumentEvidence": SavedDocumentPageSchema,
  "tasks.reviewCriterion": CriterionReviewSchema,
  "tasks.reconcileAction": z.object({ ok: z.literal(true) }),
  "tasks.reconcileOperation": z.object({ ok: z.literal(true) }),
  "tasks.receipt": TaskReceiptSchema,
  "tasks.exportReceipt": TaskReceiptExportResultSchema,
  "tasks.undoBrowserChange": z.object({ ok: z.literal(true) }),
  "tasks.undoRunBrowserChanges": z.object({
    restored: z.number().int().nonnegative(),
    skipped: z.array(z.object({ stepId: id, reason: z.string().max(500) })),
  }),
  "tasks.undoBookmarkChange": z.object({ ok: z.literal(true) }),
  "tasks.undoDownloadChange": z.object({ ok: z.literal(true) }),
  "tasks.undoHistoryChange": z.object({ ok: z.literal(true) }),
  "tasks.verifyCriterion": CriterionVerificationSchema,
  "tasks.replaceAgent": RunSchema,
  "workspaces.create": WorkspaceSchema,
  "spaces.list": z.array(BrowserSpaceSchema),
  "workspaces.list": z.array(WorkspaceSchema),
  "workspaces.folders.inspect": WorkspaceFolderReviewSchema,
  "workspaces.folders.add": WorkspaceFolderSchema,
  "workspaces.folders.list": z.array(WorkspaceFolderSchema),
  "workspaces.folders.archive": WorkspaceFolderSchema,
  "workspaces.browsingMemory.get": WorkspaceBrowsingMemorySchema,
  "workspaces.browsingMemory.set": WorkspaceBrowsingMemorySchema,
  "workspaces.browsingMemory.record": z.object({ recorded: z.boolean() }),
  "workspaces.browsingMemory.forget": WorkspaceBrowsingMemorySchema,
  "workspaces.contentMemory.policy": ContentMemoryPolicySchema,
  "workspaces.contentMemory.setPolicy": ContentMemoryPolicySchema,
  "workspaces.contentMemory.capture": z.object({
    memoryId: id,
    capturedAt: z.number(),
    title: z.string(),
    url: z.string().url(),
  }),
  "workspaces.contentMemory.semanticSearch": z.object({
    mode: z.enum(["semantic", "lexical"]),
    message: z.string().optional(),
    modelId: z.string().optional(),
    matches: z.array(ContentMemoryMatchSchema),
  }),
  "workspaces.contentMemory.embeddingModels": z.array(z.object({ modelId: z.string(), digest: z.string() })),
  "workspaces.contentMemory.search": z.array(ContentMemoryMatchSchema),
  "workspaces.contentMemory.list": z
    .object({
      items: z.array(CapturedSourceSchema),
      selected: z.array(CapturedSourceSchema),
      nextCursor: z.object({ capturedAt: z.number(), memoryId: id }).nullable(),
    })
    .strict(),
  "workspaces.contentMemory.get": ContentMemoryDocumentSchema.nullable(),
  "workspaces.contentMemory.forget": z.object({ forgotten: z.number().int().nonnegative() }),
  "workspaces.memory.get": WorkspaceMemorySchema,
  "workspaces.memory.search": z.array(
    z.object({ workspaceId: id, name: z.string(), excerpt: z.string(), enabled: z.boolean() }),
  ),
  "workspaces.memory.set": WorkspaceMemorySchema,
  "tasks.create": TaskSchema,
  "tasks.promote": TaskSchema,
  "tasks.update": TaskSchema,
  "tasks.archive": TaskSchema,
  "tasks.list": z.array(TaskSchema),
  "tasks.get": z.object({
    task: TaskSchema,
    revisions: z.array(TaskSchema),
    runs: z.array(z.object({ run: RunSchema, currentRevision: z.boolean() })),
    children: z
      .array(
        z.object({
          task: TaskSchema,
          depth: z.number().int().min(1).max(4),
          latestRun: z
            .object({
              runId: z.string(),
              status: z.string(),
              taskRevision: z.number().int().positive().optional(),
            })
            .optional(),
          cloudAuthority: z.object({ environmentId: z.string().uuid(), remoteName: z.string() }).optional(),
          receiptStatus: z
            .enum(["in_progress", "uncertain", "accepted", "not_met", "needs_review"])
            .optional(),
        }),
      )
      .default([]),
  }),
  "tasks.start": RunSchema,
  "installation.createBackup": z.object({
    path: z.string(),
    createdAt: z.number(),
    bytes: z.number().int().nonnegative(),
    schemaVersion: z.number().int().positive(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    artifactFiles: z.number().int().nonnegative(),
    missingArtifacts: z.number().int().nonnegative(),
  }),
  "installation.listBackups": z.array(
    z.object({
      path: z.string(),
      name: z.string(),
      createdAt: z.number(),
      bytes: z.number().int().nonnegative(),
      schemaVersion: z.number().int().positive(),
      sha256: z.string().regex(/^[a-f0-9]{64}$/),
      artifactFiles: z.number().int().nonnegative(),
      missingArtifacts: z.number().int().nonnegative(),
      restorable: z.boolean(),
    }),
  ),
  "installation.deleteBackup": z.object({ deleted: z.literal(true) }),
  "installation.backupRetention": z.object({ keep: z.number().int().positive() }),
  "installation.setBackupRetention": z.object({ keep: z.number().int().positive() }),
  "installation.stageListedRestore": z
    .object({
      source: z
        .object({ path: z.string(), name: z.string(), sha256: z.string().regex(/^[a-f0-9]{64}$/) })
        .strict(),
      staged: z.literal(true),
      schemaVersion: z.number().int().positive(),
      bytes: z.number().int().nonnegative(),
      sha256: z.string().regex(/^[a-f0-9]{64}$/),
      artifactFiles: z.number().int().nonnegative(),
      missingArtifacts: z.number().int().nonnegative(),
    })
    .strict(),
  "installation.stageRestore": z.object({
    staged: z.literal(true),
    schemaVersion: z.number().int().positive(),
    bytes: z.number().int().nonnegative(),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    artifactFiles: z.number().int().nonnegative(),
    missingArtifacts: z.number().int().nonnegative(),
  }),
  "installation.cancelRestore": z.object({ cancelled: z.literal(true) }),
  "installation.restoreStatus": z.object({
    pending: z.boolean(),
    lastAppliedAt: z.number().optional(),
    managedRecovery: z.object({ generation: z.number().int().nonnegative(), freshBackupIssued: z.boolean() }),
  }),
  "installation.exportRecovery": z.object({
    path: z.string(),
    sha256: z.string(),
    manifest: z.object({
      version: z.literal(1),
      createdAt: z.number(),
      sourceProfileId: z.string(),
      sqliteBytes: z.number(),
      sqliteTables: z.array(z.string()),
      artifactIds: z.array(z.string()),
      spaceMemory: z.array(z.object({ workspaceId: z.string(), files: z.array(z.string()) })),
      pageMemoryCount: z.number(),
      excluded: z.array(z.string()),
    }),
  }),
  "installation.inspectRecovery": z.object({
    sha256: z.string(),
    reviewToken: z.string().uuid(),
    manifest: z.object({
      version: z.literal(1),
      createdAt: z.number(),
      sourceProfileId: z.string(),
      sqliteBytes: z.number(),
      sqliteTables: z.array(z.string()),
      artifactIds: z.array(z.string()),
      spaceMemory: z.array(z.object({ workspaceId: z.string(), files: z.array(z.string()) })),
      pageMemoryCount: z.number(),
      excluded: z.array(z.string()),
    }),
  }),
  "installation.stageRecovery": z.object({
    staged: z.literal(true),
    artifactFiles: z.number(),
    spaceCount: z.number(),
    pageMemoryCount: z.number(),
  }),
  "vault.status": VaultStatusSchema,
  "vault.list": z.array(VaultItemSchema),
  "vault.save": VaultItemSchema,
  "vault.lock": VaultStatusSchema,
  "vault.unlock": VaultStatusSchema,
  "vault.grant": VaultGrantSchema,
  "vault.renewGrant": VaultGrantSchema,
  "vault.expiredGrants": z.array(VaultGrantSchema),
  "vault.revoke": z.object({ ok: z.literal(true) }),
  "vault.history": z.array(VaultAccessRecordSchema),
  "vault.grants": z.array(VaultGrantSchema),
  "vault.generate": z.object({ password: z.string() }),
  "vault.itemsForOrigin": z.array(VaultItemSchema),
  "vault.fill": z.object({ username: z.string().optional(), secret: z.string() }),
  "vault.export": VaultTransferPackageSchema,
  "vault.import": z.object({ added: z.number().int(), skipped: z.number().int() }),
  "vault.update": VaultItemSchema,
  "vault.secretMatches": z.object({ matches: z.boolean() }),
  "routines.list": z.array(RoutineSchema),
  "goals.create": GoalSchema,
  "goals.get": GoalSchema,
  "goals.list": z.array(GoalSchema),
  "goals.start": GoalSchema,
  "goals.pause": GoalSchema,
  "goals.resume": GoalSchema,
  "goals.cancel": GoalSchema,
  "hooks.register": HookSchema,
  "hooks.get": HookSchema,
  "hooks.list": z.array(HookSchema),
  "hooks.revoke": HookSchema,
  "hooks.test": HookInvocationSchema,
  "hooks.invocations": z.array(HookInvocationSchema),
  "routines.scan": z.array(RoutineCandidateSchema),
  "routines.suggest": z.array(RoutineSuggestionSchema),
  "routines.get": z.object({ routine: RoutineSchema, runs: z.array(RoutineRunSchema) }),
  "routines.create": RoutineSchema,
  "routines.fromResult": RoutineSchema,
  "routines.replay.repair.propose": SkillRepairProposalSchema,
  "routines.replay.repair.apply": RoutineSchema,
  "routines.replay.compileDemonstration": RoutineSchema,
  "routines.replay.compile": RoutineSchema,
  "routines.replay.test": z.object({ runId: id, revision: z.number().int().positive() }),
  "routines.replay.result": RoutineSchema,
  "routines.update": RoutineSchema,
  "routines.pause": RoutineSchema,
  "routines.archive": RoutineSchema,
  "routines.run": RoutineRunSchema,
  "routines.runs": z.array(RoutineRunSchema),
  "routines.outcome": RoutineRunOutcomeSchema,
  "routines.reconcile": RoutineRunSchema,
  "routines.due": z.array(RoutineRunSchema),
  "routines.ingestEvent": z.array(RoutineRunSchema),
  "routines.alerts": z.array(RoutineAlertSchema),
  "routines.inbox": z.array(RoutineInboxItemSchema),
  "routines.inboxRead": z.object({ readAt: z.number().int().nonnegative() }),
  "routines.compare": RoutineCompareSchema,
  "routines.export": RoutineShareEnvelopeSchema,
  "routines.exportSkill": z
    .object({ filename: z.literal("SKILL.md"), content: z.string().max(64_000) })
    .strict(),
  "routines.skills.preview": SkillLibraryPreviewSchema,
  "routines.skills.import": z.object({ imported: z.number().int().nonnegative(), skipped: z.number().int().nonnegative(), routineIds: z.array(z.string()) }),
  "routines.importSkill": z
    .object({
      imported: z.number().int().nonnegative(),
      skipped: z.number().int().nonnegative(),
      routineIds: z.array(id),
    })
    .strict(),
  "routines.import": z.object({
    ok: z.boolean(),
    imported: z.number().int().nonnegative(),
    skipped: z.number().int().nonnegative(),
    routineIds: z.array(id),
  }),
  "zap.list": z.array(ZapSitePolicySchema),
  "zap.grant": ZapApplyResultSchema,
  "zap.update": ZapApplyResultSchema,
  "zap.revoke": ZapApplyResultSchema,
  "plugins.inspect": z.object({
    name: z.string(),
    version: z.string().optional(),
    description: z.string().optional(),
    routineCount: z.number().int().nonnegative(),
    routineTitles: z.array(z.string()),
    format: z.enum(["aux-plugin@1", "claude-code"]),
    assets: z.array(z.object({ kind: z.enum(["skill", "mcp_server", "hook"]), name: z.string() })),
    digest: z.string().regex(/^[a-f0-9]{64}$/),
  }),
  "plugins.install": z.object({
    plugin: PluginSchema,
    imported: z.number().int().nonnegative(),
    skipped: z.number().int().nonnegative(),
  }),
  "plugins.list": z.array(PluginSchema),
  "plugins.assets": z.array(PluginAssetSchema),
  "plugins.skills.grant": PluginSkillGrantSchema,
  "plugins.skills.grants": z.array(PluginSkillGrantSchema),
  "plugins.skills.revoke": PluginSkillGrantSchema,
  "plugins.skills.read": PluginSkillReadSchema,
  "plugins.uninstall": z.object({
    plugin: PluginSchema,
    archivedRoutines: z.number().int().nonnegative(),
  }),
  "agentConnections.list": z.array(AgentConnectionSchema),
  "agentConnections.create": z.object({ connection: AgentConnectionSchema, token: z.string().min(1) }),
  "agentConnections.install": z
    .object({
      connection: AgentConnectionSchema,
      configPath: z.string(),
      skillPath: z.string(),
      replacedConnectionId: z.string().uuid().optional(),
    })
    .strict(),
  "agentConnections.revoke": AgentConnectionSchema,
  "developer.cli.install": z.object({ path: z.string(), pathConfigured: z.boolean() }).strict(),
  "mcp.servers.register": OutboundMcpServerSchema,
  "mcp.bundles.inspect": OutboundMcpBundleInspectionSchema,
  "mcp.servers.list": z.array(OutboundMcpServerSchema),
  "mcp.servers.revoke": OutboundMcpServerSchema,
  "mcp.oauth.start": z.discriminatedUnion("state", [
    z.object({ state: z.literal("connected") }).strict(),
    z
      .object({ state: z.literal("authorization"), url: z.string().url(), expiresAt: z.number().int() })
      .strict(),
  ]),
  "mcp.oauth.requirements": McpOAuthRequirementsSchema,
  "mcp.oauth.configure": z.object({ configured: z.literal(true) }).strict(),
  "mcp.oauth.status": z.object({ connected: z.boolean(), expiresAt: z.number().int().optional() }).strict(),
  "mcp.oauth.clear": z.object({ connected: z.literal(false) }).strict(),
  "mcp.tools.list": z.array(OutboundMcpToolSchema),
  "mcp.tools.setEnabled": OutboundMcpServerSchema,
  "mcp.tools.call": OutboundMcpCallResultSchema,
  "memory.paste.preview": MemoryPastePreviewSchema,
  "memory.paste.commit": MemoryPasteStatusSchema,
  "memory.paste.status": z.array(MemoryPasteStatusSchema).max(20),
  "memory.pipeline.policy": MemoryPipelinePolicySchema,
  "memory.pipeline.setPolicy": MemoryPipelinePolicySchema,
  "memory.pipeline.extractRun": z.object({ extracted: z.number().int().nonnegative() }),
  "memory.pipeline.sources": z.array(MemoryPipelineSourceSchema),
  "memory.pipeline.inbox": MemoryPipelineInboxSchema,
  "memory.pipeline.claims": MemoryPipelineInboxSchema,
  "memory.pipeline.history": z.array(MemoryPipelineRevisionSchema),
  "memory.pipeline.activity": z.array(MemoryExtractionViewSchema).max(200),
  "memory.pipeline.reindex": z.object({ indexed: z.number().int().nonnegative() }),
  "memory.pipeline.documents": MemoryClaimDocumentsSchema,
  "memory.pipeline.edit": MemoryClaimSchema,
  "memory.pipeline.revert": MemoryPipelineOverviewSchema,
  "memory.pipeline.review": z.object({ accepted: z.boolean(), remaining: z.number().int().nonnegative() }),
  "memory.pipeline.overview": MemoryPipelineOverviewSchema,
  "memory.pipeline.search": z.array(MemoryClaimSchema),
  "memory.pipeline.forget": MemoryPipelineForgetResultSchema,
  "subagents.createGroup": SubagentGroupSchema,
  "subagents.spawn": SubagentSchema,
  "subagents.forkSelf": SubagentSchema,
  "subagents.sendMessage": RunMessageSchema,
  "subagents.getGroup": SubagentGroupViewSchema,
  "subagents.cancel": SubagentSchema,
  "calendar.connections.list": z.object({
    available: z.boolean(),
    reason: z.string().optional(),
    connections: z.array(CalendarConnectionSchema),
  }),
  "calendar.auth.start": z.object({ url: z.string().url(), expiresAt: z.number().int().nonnegative() }),
  "calendar.connections.revoke": z.object({
    ok: z.literal(true),
    providerRevocation: z.enum(["confirmed", "pending"]),
  }),
  "calendar.events.list": z.object({
    events: z.array(CalendarEventSchema),
    nextPageToken: z.string().optional(),
    fetchedAt: z.number().int().nonnegative(),
  }),
  "calendar.taskGrants.list": z.array(CalendarTaskGrantSchema),
  "calendar.taskGrants.create": CalendarTaskGrantSchema,
  "calendar.taskGrants.revoke": z.object({ ok: z.literal(true) }),
  "calendar.taskEvents.list": z.object({
    events: z.array(CalendarEventSchema),
    nextPageToken: z.string().optional(),
    fetchedAt: z.number().int().nonnegative(),
  }),
  "connectors.catalog": ConnectorCatalogSchema,
  "pages.list": z.array(PageTargetSchema),
  "pages.open": PageTargetSchema,
  "pages.close": z.object({ ok: z.boolean() }),
  "pages.activate": PageTargetSchema,
  "pages.moveToWindow": PageTargetSchema,
  "pages.navigate": PageTargetSchema,
  "pages.back": PageTargetSchema,
  "pages.forward": PageTargetSchema,
  "pages.reload": PageTargetSchema,
  "pages.stop": PageTargetSchema,
  "pages.observe": z.union([ObservationSchema, z.object({ observation: CompactObservationSchema })]),
  "pages.webmcp": PagesWebmcpResult,
  "pages.execute": ProgramResultSchema.extend({
    /** present when the request carried returnObservation; full or compact per its format */
    observation: z.union([ObservationSchema, CompactObservationSchema]).optional(),
  }),
  "pages.cuaExecute": ProgramResultSchema.extend({
    observation: z.union([ObservationSchema, CompactObservationSchema]).optional(),
  }),
  "pages.reconcileWrite": z.object({ reconciled: z.array(z.string()) }),
  "pages.extract": z.object({
    pageId: z.string(),
    documentEpoch: z.number(),
    revision: z.number(),
    fields: z.record(z.string(), z.unknown()),
  }),
  "pages.elementInfo": z.object({
    pageId: id,
    documentEpoch: z.number().int().nonnegative(),
    revision: z.number().int().positive(),
    element: ElementRefSchema.nullable(),
  }),
  "pages.accessibilityHtml": z.object({
    pageId: id,
    documentEpoch: z.number().int().nonnegative(),
    revision: z.number().int().positive(),
    text: z.string(),
  }),
  "pages.read": z.object({
    pageId: id,
    documentEpoch: z.number().int().nonnegative(),
    revision: z.number().int().positive(),
    value: z.unknown(),
  }),
  "pages.waitFor": z.object({
    ok: z.boolean(),
    timedOut: z.boolean(),
    detail: z.string().optional(),
    status: z.string().optional(),
  }),
  "pages.console": z.object({
    lines: z.array(z.object({ level: z.string(), message: z.string(), atMs: z.number().optional() })),
  }),
  "pages.dialog": z.object({
    ok: z.boolean().optional(),
    action: z.enum(["list", "accept", "dismiss"]).optional(),
    dialogs: z.array(z.object({ type: z.string(), message: z.string() })).optional(),
    pending: z.object({ type: z.string(), message: z.string() }).nullable().optional(),
  }),
  "pages.network": z.array(ResponseRecordSchema),
  "pages.capture": z.object({
    dataUrl: z.string().optional(),
    artifactId: z.string().optional(),
    width: z.number(),
    height: z.number(),
    scale: z.number(),
    documentEpoch: z.number().int().nonnegative().optional(),
    url: z.string().optional(),
    capturedAt: z.number().optional(),
    viewport: z.object({ width: z.number(), height: z.number(), scale: z.number() }).optional(),
    imageWidth: z.number().optional(),
    imageHeight: z.number().optional(),
  }),
  "pages.find": z.object({ matches: z.number(), activeMatch: z.number().optional() }),
  "pages.stopFind": z.object({ ok: z.boolean() }),
  "pages.zoom": z.object({ level: z.number() }),
  "pages.takeover": PageTargetSchema,
  "pages.pickElement": PagesPickElementResult,
  "customization.zap.pick": ZapPickResultSchema,
  "customization.zap.list": z.array(ZapRuleSchema),
  "customization.zap.add": ZapRuleSchema,
  "customization.zap.remove": z.object({ removed: z.boolean() }),
  "customization.css.propose": SiteCssProposalSchema,
  "customization.css.get": SiteCssSchema,
  "customization.css.set": SiteCssSchema,
  "customization.css.effective": EffectiveSiteCssSchema,
  "customization.css.apply": z.object({ applied: z.boolean(), origin: SiteOriginSchema }),
  "pages.resume": PageTargetSchema,
  "pages.openLive": z.object({ ok: z.boolean() }),
  "sets.create": PageSetSchema,
  "sets.get": z.object({ set: PageSetSchema, members: z.array(SetMemberSchema) }),
  "sets.list": z.array(PageSetSchema),
  "sets.map": z.object({ runId: z.string() }),
  "sets.results": z.array(ResultRecordSchema),
  "runs.start": RunSchema,
  "runs.reconcileStart": z.discriminatedUnion("status", [
    z.object({ status: z.literal("accepted"), run: RunSchema }).strict(),
    z.object({ status: z.enum(["not_started", "removed"]), run: z.null() }).strict(),
  ]),
  "runs.retry": RunSchema,
  "runs.branch": ConversationBranchMetadataSchema,
  "runs.branch.list": z.array(ConversationBranchMetadataSchema),
  "runs.get": z.object({
    run: RunSchema,
    steps: z.array(StepRecordSchema),
    modelCalls: z.number(),
    usage: ModelUsageSummarySchema,
    transcript: RunTranscriptProjectionSchema.optional(),
    suspension: SuspensionSchema.nullable().optional(),
  }),
  "runs.list": z.array(RunSchema),
  "runs.context.get": ConversationContextSchema,
  "runs.context.set": ConversationContextSchema,
  "conversations.list": z.array(ConversationSummarySchema),
  "conversations.prepared": z.array(PreparedConversationSchema),
  "conversations.get": z.union([ConversationSummarySchema, ConversationBranchMetadataSchema]).nullable(),
  "conversations.search": ConversationSearchResultSchema,
  "conversations.turns": z.object({
    runs: z.array(RunSchema),
    earlierRunId: id.nullable(),
    laterRunId: id.nullable(),
  }),
  "conversations.rename": ConversationSummarySchema,
  "conversations.archive": ConversationSummarySchema,
  "conversations.delete": z.object({ ok: z.literal(true), deletedRuns: z.number().int().nonnegative() }),
  "conversations.images.get": ConversationImagesSchema,
  "conversations.images.add": ConversationImagesSchema,
  "conversations.images.read": z.object({ image: ConversationImageSchema, dataUrl: z.string() }),
  "conversations.images.toggle": ConversationImagesSchema,
  "conversations.images.remove": ConversationImagesSchema,
  "conversations.attachments.get": ConversationAttachmentsSchema,
  "conversations.attachments.read": SavedDocumentPageSchema.extend({ attachment: ConversationAttachmentSchema }).strict(),
  "conversations.attachments.import": ConversationAttachmentsSchema,
  "conversations.attachments.add": ConversationAttachmentsSchema,
  "conversations.attachments.page": ConversationAttachmentsSchema,
  "conversations.attachments.toggle": ConversationAttachmentsSchema,
  "conversations.attachments.remove": ConversationAttachmentsSchema,
  "results.generate": GeneratedResultSchema,
  "results.generated.get": GeneratedResultSchema,
  "results.generated.versions": z.array(GeneratedResultSummarySchema),
  "results.search": z.array(SavedResultSchema),
  "results.read": z.object({
    artifactId: id,
    chatId: id,
    filename: z.string(),
    mediaType: z.string(),
    content: z.string(),
    createdAt: z.number(),
    revision: z.number().int().positive().optional(),
    parentArtifactId: id.optional(),
    rootArtifactId: id.optional(),
  }),
  "results.available": z.array(id),
  "results.saveVersion": z.object({
    artifactId: id,
    chatId: id,
    filename: z.string(),
    mediaType: z.string(),
    content: z.string(),
    createdAt: z.number(),
    revision: z.number().int().positive(),
    parentArtifactId: id,
    rootArtifactId: id,
  }),
  "conversations.artifacts.get": ConversationArtifactsSchema,
  "conversations.artifacts.toggle": ConversationArtifactsSchema,
  "conversations.sources.get": ConversationSourcesSchema,
  "conversations.workspace.get": ConversationWorkspaceSchema,
  "conversations.workspace.set": ConversationWorkspaceSchema,
  "runs.pause": RunSchema,
  "runs.resume": RunSchema,
  "runs.cancel": RunSchema,
  "runs.answer": RunSchema,
  "runs.continueBudget": RunSchema,
  "runs.useLocalExecution": RunSchema,
  "runs.retryCloudSetup": RunSchema,
  "runs.retryModelSetup": RunSchema,
  "runs.queue": RunMessageSchema,
  "runs.steer": RunMessageSchema,
  "runs.messages.list": z.array(RunMessageSchema),
  "runs.messageStatus": SendRecordSchema.nullable(),
  "safety.decisions.list": SafetyActivityPageSchema,
  "safety.approvals.pending": z.array(PendingApprovalSchema),
  "safety.approvals.decide": z.object({ ok: z.literal(true) }),
  "safety.grants.revokeRun": z.object({ ok: z.literal(true) }),
  "packages.list": AuxPackageLibrarySchema,
  "packages.install": AuxPackageLibrarySchema,
  "packages.remove": AuxPackageLibrarySchema,
  "packages.defaults": AuxPackageLibrarySchema,
  "coding.activity": z.object({ fileRevision: z.string(), processes: z.array(CodingProcessViewSchema), agents:z.array(SubagentSchema) }).strict(),
  "coding.worktreeInspect": CoderRecoveryInspectionSchema,
  "coding.worktreeArchive": CoderRecoveryInspectionSchema,
  "coding.changes": z.array(CodingFileReceiptSchema),
  "coding.undo": z.array(CodingFileReceiptSchema),
  "coding.processes": z.array(CodingProcessViewSchema),
  "coding.logs": CodingLogsSchema,
  "coding.stop": CodingProcessViewSchema,
  "coding.preview": CloudPreviewSchema,
  "coding.previewClose": z.object({ closed: z.literal(true) }).strict(),
  "runs.message.cancel": RunMessageSchema,
  "runs.events": z.object({
    streamId: z.string(),
    events: z.array(EventSchema),
    lastSeq: z.number(),
    /** The cursor cannot be replayed (stream mismatch or pruned floor) — refetch a snapshot. */
    resync: z.boolean().optional(),
  }),
  "events.since": z.object({
    streamId: z.string(),
    events: z.array(EventSchema),
    lastSeq: z.number(),
    /** The cursor cannot be replayed (stream mismatch or pruned floor) — refetch a snapshot. */
    resync: z.boolean().optional(),
  }),
  "artifacts.list": z.array(ArtifactSchema),
  "artifacts.read": z.object({ artifact: ArtifactSchema, dataBase64: z.string() }),
  "programs.list": z.array(SavedProgramSchema),
  "programs.run": z.object({ runId: z.string() }),
  "programs.save": SavedProgramSchema,
  "programs.delete": z.object({ ok: z.boolean() }),
  "sessions.list": z.array(BrowserSessionSchema),
  "chrome.importCookies": z.object({
    ok: z.boolean(),
    source: z.enum(["profile"]),
    imported: z.number(),
    skipped: z.number(),
    domains: z.number(),
    detail: z.string().optional(),
  }),

  "onboarding.get": OnboardingStateSchema,
  "onboarding.update": OnboardingStateSchema,
  "import.preview": z.object({
    sources: z.array(ImportSourcePreviewSchema),
    recentJobs: z.array(ImportJobStatusSchema).max(5).optional(),
  }),
  "import.extensions.review": ImportExtensionReviewSchema,
  "import.selectWindow": z.object({ selectionId: z.string().min(16).max(128) }).strict(),
  "import.selectExport": z.object({ selectionId: z.string().min(16).max(128) }).strict(),
  "import.exportStatus": BrowserImportSelectionStatusSchema,
  "import.cancelExport": BrowserImportSelectionStatusSchema,
  "import.run": z.object({ jobId: z.string() }),
  "import.status": ImportJobStatusSchema,
  "import.cancel": z.object({ ok: z.boolean() }),
  "chrome.openLive": z.object({ ok: z.boolean() }),
  "projects.files": ProjectFilesSchema,
  "projects.file": ProjectFileSchema,
  "projects.changes": ProjectChangesSchema,
  "terminal.start": TerminalSessionSchema,
  "terminal.read": TerminalReadResultSchema,
  "terminal.input": TerminalInputResultSchema,
  "terminal.resize": TerminalSessionSchema,
  "terminal.close": TerminalSessionSchema,
  "terminal.listeners": TerminalListenersSchema,
  "terminal.preview": TerminalPreviewSchema,
  "terminal.previewClose": TerminalPreviewClosedSchema,
  "models.auth.start": z
    .object({
      attemptId: z.string(),
      provider: z.enum(["openrouter", "chatgpt", "vercel"]),
      phase: z.enum(["pending", "authenticating", "connected", "cancelled", "expired", "failed"]),
      expiresAt: z.number().int().nonnegative(),
      authorizationUrl: z.string().url(),
    })
    .strict(),
  "models.auth.status": z
    .object({
      attemptId: z.string(),
      provider: z.enum(["openrouter", "chatgpt", "vercel"]),
      phase: z.enum(["pending", "authenticating", "connected", "cancelled", "expired", "failed"]),
      expiresAt: z.number().int().nonnegative(),
    })
    .strict(),
  "models.auth.cancel": z
    .object({
      attemptId: z.string(),
      provider: z.enum(["openrouter", "chatgpt", "vercel"]),
      phase: z.enum(["pending", "authenticating", "connected", "cancelled", "expired", "failed"]),
      expiresAt: z.number().int().nonnegative(),
    })
    .strict(),
  "models.auth.accounts": z
    .array(
      z
        .object({
          provider: z.enum(["chatgpt", "vercel"]),
          accountId: z.string().regex(/^[a-f0-9]{64}$/),
          email: z.string().max(500).optional(),
          selected: z.boolean(),
          connected: z.boolean(),
        })
        .strict(),
    )
    .max(32),
  "models.auth.disconnect": z
    .object({ disconnected: z.literal(true), revocationConfirmed: z.boolean() })
    .strict(),
  "models.copilot.setup": CopilotSetupSchema,
  "models.copilot.install": CopilotInstallSchema,
  "models.copilot.start": CopilotDeviceChallengeSchema,
  "models.copilot.status": CopilotAuthStatusSchema,
  "models.copilot.cancel": CopilotAuthStatusSchema,
  "models.copilot.accounts": CopilotAccountsSchema,
  "models.copilot.disconnect": CopilotDisconnectedSchema,
  "models.copilot.catalog": CopilotCatalogSchema,
  "models.list": z.object({
    models: z.array(ModelCapabilitySchema).max(500),
    localServers: z.array(LocalModelServerSchema).max(4).optional(),
    source: z.enum(["gateway", "static", "configured"]),
  }),
  "translate.page": z.object({ lang: z.string(), translations: z.array(z.string()), truncated: z.boolean() }),
  "translate.text": z.object({ lang: z.string(), translation: z.string() }),
  "models.probe": z.object({
    ok: z.boolean(),
    modelId: z.string(),
    latencyMs: z.number().optional(),
    vision: z.boolean().optional(),
    error: z.string().optional(),
  }),

  "settings.remoteDebugging.get": RemoteDebuggingStateSchema,
  "settings.remoteDebugging.set": RemoteDebuggingStateSchema,
  "settings.cloud.status": CloudSettingsStatusSchema,
  "settings.cloud.configure": CloudSettingsStatusSchema,
  "settings.cloud.clear": CloudSettingsStatusSchema,
  "settings.get": z.record(z.string(), z.unknown()),
  "settings.set": z.object({ ok: z.boolean() }),
  "usage.report": UsageReportResultSchema,
  "command.ranking.list": z.array(CommandRankingEntrySchema),
  "command.ranking.record": CommandRankingEntrySchema,
  "command.ranking.clear": z.object({ removed: z.number().int().nonnegative() }),
  "browser.recovery.list": z.array(
    z.object({
      pageId: id,
      url: z.string(),
      title: z.string(),
      windowId: id,
      error: z.string().optional(),
      retrying: z.boolean(),
    }),
  ),
  "browser.recovery.retry": z.object({
    ok: z.boolean(),
    pageId: id,
    page: PageTargetSchema,
    restored: z.boolean(),
  }),
  "history.projectSnapshot": z.object({
    accepted: z.boolean(),
    committed: z.boolean(),
    nextBatchIndex: z.number().int().nonnegative(),
  }),
  "history.projectDelta": z.object({ accepted: z.boolean(), sequence: z.number().int().nonnegative() }),
  ...HistoryResultSchemas,
  ...BookmarkResultSchemas,
  "downloads.list": z.array(DownloadSchema),
  "downloads.projectNative": z.object({ accepted: z.boolean() }),
  "downloads.remove": z.object({ removed: z.array(z.string()) }),
  "workspace.get": z.object({
    restoringTabs: z.boolean().optional(),
    pendingRestoreTabs: z.array(z.object({ pageId: id, windowId: id })).optional(),
    tabPlacements: z
      .record(z.string(), PageWindowMoveParams.pick({ spaceId: true, folder: true }))
      .optional(),
    pages: z.array(PageTargetSchema),
    sets: z.array(PageSetSchema),
    members: z.array(SetMemberSchema),
    runs: z.array(RunSchema),
    sessions: z.array(BrowserSessionSchema),
    activePageId: z.string().nullable(),
    lastSeq: z.number(),
    /** Event-stream identity the snapshot is anchored to (D9). */
    streamId: z.string(),
  }),
  "bench.run": z.object({ reportPath: z.string() }),
  "responses.list": z.array(ResponseRecordSchema),
  "responses.body": z.object({ mediaType: z.string(), dataBase64: z.string() }),
  "state.query": z.unknown(),
  "state.datasets": z.array(z.unknown()),
  "datasets.rows": z.array(z.unknown()),
  "datasets.transform": z.unknown(),
  "datasets.save": z.unknown(),
  "operations.list": z.array(z.unknown()),
  "operations.get": z.unknown(),
  "operations.saveProgram": z.object({ operationId: z.string(), implId: z.string() }),
  "operations.saveRequest": z.object({ operationId: z.string(), implId: z.string() }),
  "operations.invoke": z.unknown(),
  "operations.explain": z.unknown(),
  "operations.setImplState": z.object({ ok: z.boolean() }),
  "operations.disable": z.object({ ok: z.boolean() }),
  "operations.forget": z.object({ ok: z.boolean() }),
  "operations.compile": z.unknown(),
  "programs.validate": z.object({ ok: z.boolean(), errors: z.array(z.string()) }),
  "traces.list": z.array(z.unknown()),
  "traces.summary": z.record(z.string(), z.unknown()),
  "traces.counters": z.record(z.string(), z.number()),
  "runtime.describe": z.unknown(),
} as const;

export type MethodParams<M extends MethodName> = z.input<(typeof MethodSchemas)[M]>;
export type MethodResult<M extends MethodName> = z.output<(typeof ResultSchemas)[M]>;
/** Request/response pair for every runtime API method — the typed IPC surface. */
export type RpcMap = { [M in MethodName]: { params: MethodParams<M>; result: MethodResult<M> } };
/** Positional params for `call(method, ...params)`: optional when the method takes none. */
export type RpcArgs<M extends MethodName> = {} extends RpcMap[M]["params"]
  ? [params?: RpcMap[M]["params"]]
  : [params: RpcMap[M]["params"]];
