import { z } from "zod";
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
  /** Durable owner for human tabs; worker/borrowed pages may omit it. */
  windowId: z.string().min(1).optional(),
  backend: BackendSchema,
  targetId: z.string(),
  sessionId: z.string().optional(),
  url: z.string(),
  title: z.string(),
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
  ownedByRuntime: z.boolean().describe("disposable worker target vs human/borrowed"),
  createdAt: z.number(),
  lastActiveAt: z.number(),
  loading: z.boolean().optional(),
  canGoBack: z.boolean().optional(),
  canGoForward: z.boolean().optional(),
  error: z.string().optional(),
  navigationError: z.object({ url: z.string(), code: z.number(), message: z.string(), upgradedFrom: z.string().optional() }).nullable().optional(),
  /** Why this page was placed on its backend — e.g. `explicit-backend:<b>`. */
  routeReason: z.string().optional(),
});
export type PageTarget = z.infer<typeof PageTargetSchema>;

/** A user-selected live page at the moment it was attached to a conversation. */
export const PageContextRefSchema = z.object({
  pageId: z.string().min(1).max(200),
  url: z.string().min(1).max(8192),
  documentEpoch: z.number().int().nonnegative(),
  sessionId: z.string().max(200).optional(),
  selectedAt: z.number().int().nonnegative().optional(),
}).strict();
export type PageContextRef = z.infer<typeof PageContextRefSchema>;

/** Metadata captured for one completed page response. Response bodies stay in the artifact store. */
export const ResponseRecordSchema = z.object({
  requestId: z.string(),
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
  category: z.enum(["configuration", "authentication", "quota", "rate_limit", "network", "timeout", "provider", "model_output", "capability", "permission", "unknown"]),
  /** Safe, user-facing summary. Provider response bodies are never stored here. */
  message: z.string(),
  retryable: z.boolean(),
  action: z.enum(["retry", "model_settings", "permission_settings", "edit_request", "none"]),
});
export type RunFailure = z.infer<typeof RunFailureSchema>;

export const RunSchema = z.object({
  runId: z.string(),
  goal: z.string(),
  status: RunStatusSchema,
  pageIds: z.array(z.string()),
  setId: z.string().optional(),
  config: z
    .object({
      modelId: z.string().optional(),
      maxSteps: z.number().optional(),
      maxModelCalls: z.number().optional(),
      deadlineMs: z.number().optional(),
      /** prior-turn context for conversational runs — prompt-only, never shown */
      context: z.string().optional(),
      /** human-authored instructions (task criteria, workspace memory) — prompt-only, not fenced as page data */
      instructions: z.string().optional(),
      /** exact prior turns used to assemble context, for provenance and inspection */
      contextRunIds: z.array(z.string()).optional(),
      /** exact user-selected local document snapshots used for this turn */
      contextAttachmentIds: z.array(z.string()).optional(),
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
      /** Live pages explicitly selected for this turn; their identity was checked before launch. */
      contextPageRefs: z.array(PageContextRefSchema).max(9).optional(),
      /** Accepted human steering revision for this run. */
      messageRevision: z.number().int().nonnegative().optional(),
      /** Queued user message that started this run, if any. */
      messageId: z.string().optional(),
      /** explicitly selected workspace memory revision used for this turn */
      contextWorkspaceId: z.string().optional(),
      contextWorkspaceRevision: z.number().int().nonnegative().optional(),
      /** how this run executes — shown as a badge on cards (§10 route label) */
      implementation: z.string().optional(),
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
      /** terminal turn this run deliberately retries; used for audit and UI continuity */
      retryOfRunId: z.string().optional(),
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

export const RunMessageSchema = z.object({
  messageId: z.string().min(1),
  chatId: z.string().min(1),
  targetRunId: z.string().min(1),
  deliveryRunId: z.string().min(1),
  mode: z.enum(["queue", "steer"]),
  status: z.enum(["accepted", "delivering", "delivered", "needs_attention", "cancelled"]),
  text: z.string().min(1).max(20_000),
  pageIds: z.array(z.string().min(1)).max(9),
  contextPageRefs: z.array(PageContextRefSchema).max(9),
  expectedRevision: z.number().int().nonnegative(),
  error: z.string().optional(),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
}).strict();
export type RunMessage = z.infer<typeof RunMessageSchema>;

export const ConversationSummarySchema = z.object({
  chatId: z.string(),
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
  role: z.enum(["planner", "repair", "vision", "probe", "final"]),
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
  folderPath: BookmarkFolderPathSchema.optional(),
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
  pageId: z.string(), url: z.string(), title: z.string(),
  /** Main-frame URL at the moment the browser menu captured the selection. */
  topUrl: z.string().optional(),
  capturedAt: z.number().int().nonnegative().optional(),
  action: z.enum(["ask", "explain", "summarize", "remember", "image"]),
  selection: z.string().max(12000), truncated: z.boolean(),
  /** Present only for image actions — a PNG snapshot captured from the page, or a capture error. */
  image: z.object({
    dataUrl: z.string().max(4_500_000).optional(),
    srcURL: z.string().max(4096).optional(),
    altText: z.string().max(600).optional(),
    captureError: z.string().max(500).optional(),
  }).optional(),
});
export type PageQuickAction = z.infer<typeof PageQuickActionSchema>;
