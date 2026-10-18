import { DesktopContextQuotesSchema } from "./desktop-context-admission.js";
import { RunContextStateSchema } from "./context-compaction.js";
import { PageContextRefSchema } from "./page-context.js";
export { PageContextRefSchema, type PageContextRef } from "./page-context.js";
import { DocumentAdmissionsSchema } from "./document-citation.js";
import { CapturedSourceSchema } from "./captured-source.js";
import { z } from "zod";
import { AgentProfileSchema } from "./agent-profiles.js";
import { AuxPackageSnapshotSchema } from "./aux-packages.js";
import { CoderWorktreeSchema } from "./coder-worktrees.js";
import { AgentModeSchema } from "./agent-policy.js";
import { ExecutionTargetSchema } from "./cloud-execution.js";
import { WaitingPhraseSchema } from "./utility.js";
import { MentionRefsSchema } from "./mentions.js";
import { AgentPageIsolationSchema } from "./egress.js";
import { WindowKindSchema } from "./window-sync.js";
import { StepOutcomeSchema } from "./program.js";

export const BackendSchema = z.enum(["aux", "chrome"]);
export type BackendT = z.infer<typeof BackendSchema>;

export const BrowserSessionSchema = z.object({
  sessionId: z.string(),
  backend: BackendSchema,
  label: z.string(),
  status: z.enum(["connected", "disconnected", "degraded"]),
  detail: z.string().optional(),
});
export type BrowserSession = z.infer<typeof BrowserSessionSchema>;

export const ControllerSchema = z.enum(["human", "agent", "external", "none"]);
export type Controller = z.infer<typeof ControllerSchema>;

export const PageTargetSchema = z.object({
  pageId: z.string(),
  anchor: z.boolean().optional(),
  windowKind: WindowKindSchema.optional(),
  /** Browser-owned Space identity from the native tab catalog. */
  workspaceId: z.string().min(1).max(200).optional(),
  split: z
    .object({ id: z.string().min(1), index: z.number().int().min(0).max(1) })
    .strict()
    .optional(),
  /** Durable owner for human tabs; worker/borrowed pages may omit it. */
  windowId: z.string().min(1).optional(),
  backend: BackendSchema,
  targetId: z.string(),
  sessionId: z.string().optional(),
  url: z.string(),
  title: z.string(),
  themeColor: z
    .string()
    .regex(/^#[0-9a-f]{6}$/)
    .optional(),
  /** A site-created blank document must remain visible instead of showing the new-tab surface. */
  showBlankDocument: z.boolean().optional(),
  favicon: z.string().optional(),
  documentEpoch: z.number().int().nonnegative(),
  lastRevision: z.number().int().nonnegative(),
  /** visible = shown natively; hidden = resident; background = worker; detached = gone */
  viewStatus: z.enum(["visible", "hidden", "background", "detached", "crashed"]),
  /** Resident-view lifecycle from the catalog — frozen/discarded tabs still
   *  exist but hold few or no renderer resources until activated. */
  lifecycle: z.enum(["placeholder", "live", "frozen", "discarded"]).optional(),
  controller: ControllerSchema,
  /** bumped on every takeover/resume — in-flight programs compare epochs */
  controllerEpoch: z.number().int().nonnegative().default(0),
  /** Display metadata only; native egressContext remains the authority. */
  agentIsolation: AgentPageIsolationSchema.optional(),
  ownedByRuntime: z.boolean().describe("disposable worker target vs human/borrowed"),
  createdAt: z.number(),
  lastActiveAt: z.number(),
  loading: z.boolean().optional(),
  canGoBack: z.boolean().optional(),
  canGoForward: z.boolean().optional(),
  error: z.string().optional(),
  navigationError: z
    .object({ url: z.string(), code: z.number(), message: z.string(), upgradedFrom: z.string().optional() })
    .nullable()
    .optional(),
  /** Why this page was placed on its backend — e.g. `explicit-backend:<b>`. */
  routeReason: z.string().optional(),
});
export type PageTarget = z.infer<typeof PageTargetSchema>;

/** Metadata captured for one completed page response. Response bodies stay in the artifact store. */
export const ResponseRecordSchema = z.object({
  requestId: z.string(),
  sessionId: z.string().min(1).optional(),
  documentEpoch: z.number().int().nonnegative().optional(),
  documentUrl: z.string().optional(),
  pageId: z.string(),
  url: z.string(),
  method: z.string(),
  status: z.number().int().optional(),
  contentType: z.string().optional(),
  resourceType: z.string().optional(),
  startedAt: z.number(),
  endedAt: z.number().optional(),
  durationMs: z.number().optional(),
  bodyArtifactId: z.string().optional(),
  bodyBytes: z.number().optional(),
  truncated: z.boolean().optional(),
  runId: z.string().optional(),
});
export type ResponseRecord = z.infer<typeof ResponseRecordSchema>;

export const RunStatusSchema = z.enum([
  "queued",
  "planning",
  "running",
  "paused",
  "needs_input",
  "completed",
  "partially_completed",
  "failed",
  "cancelled",
  "interrupted",
]);
export type RunStatus = z.infer<typeof RunStatusSchema>;

export const RunFailureSchema = z.object({
  category: z.enum([
    "configuration",
    "authentication",
    "quota",
    "rate_limit",
    "network",
    "timeout",
    "provider",
    "model_output",
    "capability",
    "permission",
    "unknown",
  ]),
  /** Safe, user-facing summary. Provider response bodies are never stored here. */
  message: z.string(),
  retryable: z.boolean(),
  action: z.enum(["retry", "model_settings", "permission_settings", "edit_request", "none"]),
});
export type RunFailure = z.infer<typeof RunFailureSchema>;

/** Immutable document capture identity; the source chat is retained across branches. */
export const AttachmentReferenceSchema = z
  .object({
    chatId: z.string().min(1),
    attachmentId: z.string().min(1),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();
export const TaskDocumentReferenceSchema = z
  .object({
    taskId: z.string().min(1),
    taskRevision: z.number().int().positive(),
    evidenceId: z.string().min(1),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();
export type TaskDocumentReference = z.infer<typeof TaskDocumentReferenceSchema>;
export type AttachmentReference = z.infer<typeof AttachmentReferenceSchema>;

export const QueuedContextSchema = z.object({
  chatId: z.string().min(1),
  targetRunId: z.string().min(1),
  targetMessageRevision: z.number().int().nonnegative(),
  sourceHash: z.string().regex(/^[a-f0-9]{64}$/),
  attachmentRefs: z.array(AttachmentReferenceSchema),
  imageArtifactIds: z.array(z.string().min(1)),
  memoryRefs: z.array(CapturedSourceSchema),
  workspaceId: z.string().optional(),
  workspaceRevision: z.number().int().nonnegative().optional(),
});
export type QueuedContext = z.infer<typeof QueuedContextSchema>;

export const RunSchema = z.object({
  runId: z.string(),
  goal: z.string(),
  status: RunStatusSchema,
  pageIds: z.array(z.string()),
  setId: z.string().optional(),
  config: z
    .object({
      /** Internal person-queued overnight authority; never accepted from agent/RPC run options. */
      nightShiftItemId: z.string().uuid().optional(),
      /** Runtime-assigned routine provenance for history and completion notifications. */
      routineId: z.string().min(1).optional(),
      /** Completion delivery preference captured from the routine at launch. */
      routineNotifications: z.boolean().optional(),
      /** Signed-out isolated task tabs, captured when the task starts. Distinct from private windows. */
      privateTask: z.boolean().optional(),
      agentMode: AgentModeSchema.optional(),
      executionTarget: ExecutionTargetSchema.optional(),
      nativeTurnContext: z.string().uuid().optional(),
      setMemberSource: z
        .object({
          parentRunId: z.string(),
          setId: z.string(),
          memberId: z.string(),
          sourceDigest: z.string().regex(/^[a-f0-9]{64}$/),
          url: z.string(),
          memberUrl: z.string().optional(),
          pageId: z.string().optional(),
          sessionId: z.string().optional(),
          documentEpoch: z.number().int().nonnegative().optional(),
          recordKey: z.string().optional(),
        })
        .strict()
        .optional(),
      /** Explicit composer thinking choice; absence preserves the automatic route. */
      reasoning: z.enum(["low", "medium", "high"]).optional(),
      modelId: z.string().optional(),
      maxSteps: z.number().optional(),
      maxModelCalls: z.number().optional(),
      maxCostUsd: z.number().optional(),
      deadlineMs: z.number().optional(),
      /** prior-turn context for conversational runs — prompt-only, never shown */
      context: z.string().optional(),
      /** human-authored instructions (task criteria, workspace memory) — prompt-only, not fenced as page data */
      instructions: z.string().optional(),
      /** exact prior turns used to assemble context, for provenance and inspection */
      contextRunIds: z.array(z.string()).optional(),
      /** Original historical inline document evidence; never resolved to a newer snapshot. */
      contextAttachmentIds: z.array(z.string()).optional(),
      /** Selected immutable documents hydrated only within the active model request budget. */
      contextAttachmentRefs: z.array(AttachmentReferenceSchema).optional(),
      contextTaskDocumentRefs: z.array(TaskDocumentReferenceSchema).max(100).optional(),
      /** Exact bounded document excerpt actually sent in this turn's prompt. */
      contextDocumentEvidence: z.string().max(20_000).optional(),
      /** Exact excerpt of a verified prior report included in this turn. */
      contextArtifactEvidence: z.string().max(20_000).optional(),
      /** exact Aux-generated text artifacts used for this turn */
      contextArtifactIds: z.array(z.string()).optional(),
      /** Source artifacts of included edited-copy documents, pinned when this turn starts. */
      contextSourceArtifactIds: z.array(z.string()).optional(),
      /** Immutable image snapshots explicitly included in this run. */
      contextImageArtifactIds: z.array(z.string()).max(4).optional(),
      /** Selected protected article IDs; plaintext is hydrated only for a model call. */
      contextMemoryIds: z.array(z.string()).optional(),
      /** Internal desktop quote admissions; model arguments cannot create these. */
      desktopContextQuotes: DesktopContextQuotesSchema.optional(),
      /** Generated content retired; financial/effect audit records remain authoritative. */
      desktopContextRetired: z.literal(true).optional(),
      contextMemoryRefs: z.array(CapturedSourceSchema).optional(),
      /** The selected article was deleted; saved model outputs were removed. */
      contextMemoryRevoked: z.boolean().optional(),
      /** IDs of removed generated artifacts, retained only to revoke later dependent turns. */
      revokedArtifactIds: z.array(z.string()).optional(),
      /** URL-only source receipts; these confer no restored native isolation authority. */
      isolatedPageSources: z
        .array(z.object({ sourcePageId: z.string(), pageId: z.string(), url: z.string() }).strict())
        .optional(),
      /** Live pages explicitly selected for this turn; their identity was checked before launch. */
      contextPageRefs: z.array(PageContextRefSchema).optional(),
      mentions: MentionRefsSchema.optional(),
      /** Accepted human steering revision for this run. */
      messageRevision: z.number().int().nonnegative().optional(),
      /** Queued user message that started this run, if any. */
      messageId: z.string().optional(),
      /** Scoped external agent connection that owns this run (S6.7). */
      externalConnectionId: z.string().optional(),
      /** Original external session; runtime assigned, never a model parameter. */
      externalParentRunId: z.string().optional(),
      externalRetirementPending: z.boolean().optional(),
      /** explicitly selected workspace memory revision used for this turn */
      contextWorkspaceId: z.string().optional(),
      contextWorkspaceRevision: z.number().int().nonnegative().optional(),
      /** This turn pinned opt-in browsing references from its Space. */
      contextBrowsingMemory: z.boolean().optional(),
      /** how this run executes — shown as a badge on cards (§10 route label) */
      implementation: z.string().optional(),
      /** A bounded utility-generated label; never an action or source authority. */
      waitingPhrase: WaitingPhraseSchema.optional(),
      /** route-selection reason when an operation impl drove the run */
      routeReason: z.string().optional(),
      /** model calls consumed — stamped at finish so cards can badge 0-model runs */
      modelCalls: z.number().optional(),
      /** chat thread id — runs started from the same conversation share it */
      chatId: z.string().optional(),
      taskId: z.string().optional(),
      taskRevision: z.number().int().positive().optional(),
      /** routine-declared account boundary — when non-empty, only vault grants with a matching accountLabel are visible to this run */
      accountLabels: z.array(z.string().min(1).max(120)).max(20).optional(),
      /** Child agent policy; runtime execution enforces read-only profiles. */
      subagentProfile: z.string().optional(),
      agentProfile: AgentProfileSchema.optional(),
      auxPackages: z.array(AuxPackageSnapshotSchema).optional(),
      projectRoot: z.string().optional(),
      coderWorktree: CoderWorktreeSchema.optional(),
      /** Pinned provider authority for this turn, even when empty. Later grants cannot expand an existing turn. */
      xGrantIds: z.array(z.string().uuid()).max(100).optional(),
      googleGrantIds: z.array(z.string().uuid()).max(100).optional(),
      calendarGrantIds: z.array(z.string().uuid()).max(20).optional(),
      /** terminal turn this run deliberately retries; used for audit and UI continuity */
      retryOfRunId: z.string().optional(),
      branchSourceRunIds: z.array(z.string()).optional(),
      /** Internal verified-source provenance; never accepted by public run creation. */
      documentAdmissions: DocumentAdmissionsSchema.optional(),
      contextCompaction: RunContextStateSchema.optional(),
      queuedMessageContexts: z.record(z.string(), QueuedContextSchema).optional(),
      /** AUX-017 durable coordinator snapshot. */
      checkpoint: z
        .object({
          planBoundary: z.string().optional(),
          unresolvedEffects: z.array(z.string()).optional(),
          pageIdentity: z.record(z.string(), z.unknown()).optional(),
          authorizationScope: z.array(z.string()).optional(),
          recoveryStatus: z.string().optional(),
        })
        .optional(),
      /** AUX-019 page-claimed grants that were ignored. */
      ignoredPageGrants: z.array(z.string()).optional(),
      /** AUX-017 last crash-recovery decision. */
      lastCrashRecovery: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
  statusMessage: z.string().optional(),
  result: z.record(z.string(), z.unknown()).optional(),
  error: z.string().optional(),
  failure: RunFailureSchema.optional(),
  startedAt: z.number().optional(),
  endedAt: z.number().optional(),
  createdAt: z.number(),
});
export type Run = z.infer<typeof RunSchema>;

export const RunMessageSchema = z
  .object({
    messageId: z.string().min(1),
    chatId: z.string().min(1),
    targetRunId: z.string().min(1),
    deliveryRunId: z.string().min(1),
    mode: z.enum(["queue", "steer"]),
    status: z.enum(["accepted", "delivering", "delivered", "needs_attention", "cancelled"]),
    text: z.string().min(1).max(20_000),
    pageIds: z.array(z.string().min(1)),
    contextPageRefs: z.array(PageContextRefSchema),
    mentions: MentionRefsSchema.optional(),
    expectedRevision: z.number().int().nonnegative(),
    context: QueuedContextSchema.optional(),
    /** This message supersedes an earlier message id (resend nonce chain). */
    resendsNonce: z.string().min(1).optional(),
    error: z.string().optional(),
    createdAt: z.number().int().nonnegative(),
    updatedAt: z.number().int().nonnegative(),
  })
  .strict();
export type RunMessage = z.infer<typeof RunMessageSchema>;

export const ConversationSummarySchema = z.object({
  chatId: z.string(),
  privateTask: z.boolean(),
  taskId: z.string().optional(),
  title: z.string(),
  archived: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
  turnCount: z.number().int().nonnegative(),
  latestRun: RunSchema,
});
export type ConversationSummary = z.infer<typeof ConversationSummarySchema>;

export const StepRecordSchema = z.object({
  stepId: z.string(),
  runId: z.string(),
  pageId: z.string().optional(),
  op: z.string(),
  inputs: z.record(z.string(), z.unknown()).optional(),
  expected: z.string().optional(),
  outcome: StepOutcomeSchema.optional(),
  startedAt: z.number(),
});
export type StepRecord = z.infer<typeof StepRecordSchema>;

export const ResultRecordSchema = z.object({
  resultId: z.string(),
  runId: z.string().optional(),
  memberId: z.string().optional(),
  pageId: z.string().optional(),
  sourceUrl: z.string(),
  values: z.record(z.string(), z.unknown()),
  evidence: z
    .object({ observationId: z.string().optional(), artifactIds: z.array(z.string()).optional() })
    .optional(),
  observedAt: z.number(),
  status: z.enum(["ok", "partial", "error"]),
  error: z.string().optional(),
});
export type ResultRecord = z.infer<typeof ResultRecordSchema>;

export const SetMemberSchema = z.object({
  memberId: z.string(),
  setId: z.string(),
  ordinal: z.number(),
  url: z.string().optional(),
  recordKey: z.string().optional(),
  label: z.string().optional(),
  pageId: z.string().optional(),
  status: z.enum(["queued", "running", "completed", "failed", "skipped"]),
  resultId: z.string().optional(),
  error: z.string().optional(),
});
export type SetMember = z.infer<typeof SetMemberSchema>;

export const PageSetSchema = z.object({
  setId: z.string(),
  name: z.string(),
  source: z.enum(["links", "urls", "tabs", "records", "manual"]),
  memberIds: z.array(z.string()),
  resultSchema: z
    .array(z.object({ name: z.string(), selector: z.string().optional(), attribute: z.string().optional() }))
    .optional(),
  programId: z.string().optional(),
  createdAt: z.number(),
});
export type PageSet = z.infer<typeof PageSetSchema>;

export const SavedProgramSchema = z.object({
  programId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  version: z.number().int().positive(),
  /** Site key: origin + normalized route the program was validated against. */
  siteKey: z.string(),
  parameters: z.array(z.string()),
  stepsJson: z.string().describe("serialized Program steps with {{param}} placeholders"),
  preconditions: z.array(z.string()).optional(),
  postconditions: z.array(z.string()).optional(),
  useCount: z.number().int().nonnegative(),
  lastUsedAt: z.number().optional(),
  createdAt: z.number(),
});
export type SavedProgram = z.infer<typeof SavedProgramSchema>;

export const ArtifactSchema = z.object({
  artifactId: z.string(),
  runId: z.string().optional(),
  pageId: z.string().optional(),
  path: z.string(),
  mediaType: z.string(),
  size: z.number(),
  status: z.enum(["complete", "failed", "partial"]),
  createdAt: z.number(),
});
export type Artifact = z.infer<typeof ArtifactSchema>;

export const ModelCallSchema = z.object({
  callId: z.string(),
  runId: z.string().optional(),
  role: z.enum(["planner", "repair", "vision", "probe", "final", "guardian", "agent", "memory"]),
  modelId: z.string(),
  providerMetadata: z.record(z.string(), z.unknown()).optional(),
  durationMs: z.number(),
  inputTokens: z.number().optional(),
  outputTokens: z.number().optional(),
  costUsd: z.number().optional(),
  costEstimated: z.boolean().optional(),
  error: z.string().optional(),
  createdAt: z.number(),
});
export type ModelCall = z.infer<typeof ModelCallSchema>;

export const ModelUsageSummarySchema = z.object({
  calls: z.number().int().nonnegative(),
  modelIds: z.array(z.string()),
  providers: z.array(z.string()),
  destinations: z.array(z.string()),
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  knownCostUsd: z.number().nonnegative(),
  costComplete: z.boolean(),
});
export type ModelUsageSummary = z.infer<typeof ModelUsageSummarySchema>;

export const HistoryEntrySchema = z.object({
  url: z.string(),
  title: z.string(),
  pageId: z.string().optional(),
  visitedAt: z.number(),
});
export type HistoryEntry = z.infer<typeof HistoryEntrySchema>;

export const BookmarkFolderPathSchema = z.array(z.string().trim().min(1).max(200)).max(32);
export const BookmarkSchema = z.object({
  /** Chromium BookmarkModel node identity, when available. */
  nodeId: z
    .string()
    .regex(/^[1-9]\d{0,18}$/)
    .optional(),
  parentId: z
    .string()
    .regex(/^[1-9]\d{0,18}$/)
    .optional(),
  index: z.number().int().nonnegative().optional(),
  folderPath: z.array(z.string()).optional(),
  url: z.string(),
  title: z.string(),
  createdAt: z.number(),
  /** Reading-list subtype — the same bookmark row, flagged for later reading. */
  readingList: z.boolean().optional(),
  readAt: z.number().optional(),
  /** An offline article copy is stored for this bookmark. */
  offline: z.boolean().optional(),
});
export type Bookmark = z.infer<typeof BookmarkSchema>;

export const DownloadSchema = z.object({
  id: z.string(),
  sourceUrl: z.string().optional(),
  /** Chromium's initiating tab URL, used only for fail-closed run attribution. */
  tabUrl: z.string().optional(),
  /** The Profile's selected download folder at the time of the native event. */
  downloadRoot: z.string().optional(),
  pageId: z.string().optional(),
  filename: z.string(),
  path: z.string(),
  size: z.number(),
  totalBytes: z.number().optional(),
  paused: z.boolean().optional(),
  canResume: z.boolean().optional(),
  canCancel: z.boolean().optional(),
  state: z.enum(["started", "progressing", "completed", "interrupted", "cancelled"]),
  startedAt: z.number(),
  endedAt: z.number().optional(),
  /** Why the user was asked to confirm this download, if they were. */
  warning: z.enum(["executable", "insecure"]).optional(),
});
export type Download = z.infer<typeof DownloadSchema>;

export const PageQuickActionSchema = z.object({
  pageId: z.string(),
  url: z.string(),
  title: z.string(),
  /** Routes a browser-originated menu action to its owning Aux window. */
  windowId: z.string().optional(),
  /** Main-frame URL at the moment the browser menu captured the selection. */
  topUrl: z.string().optional(),
  capturedAt: z.number().int().nonnegative().optional(),
  /** Exact browser document identity; required for configured Selection & Capture actions. */
  documentEpoch: z.number().int().nonnegative().optional(),
  sessionId: z.string().min(1).max(200).optional(),
  selectionActionId: z.string().min(1).max(80).optional(),
  action: z.enum(["ask", "explain", "summarize", "remember", "image"]),
  selection: z.string().max(12000),
  truncated: z.boolean(),
  /** Present only for image actions — a PNG snapshot captured from the page, or a capture error. */
  image: z
    .object({
      dataUrl: z.string().max(4_500_000).optional(),
      srcURL: z.string().max(4096).optional(),
      altText: z.string().max(600).optional(),
      captureError: z.string().max(500).optional(),
    })
    .optional(),
});
export type PageQuickAction = z.infer<typeof PageQuickActionSchema>;
