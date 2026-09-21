import { z } from "zod";
import { StepOutcomeSchema } from "./program.js";

export const BackendSchema = z.enum(["vector", "chrome", "vector-engine"]);
export type BackendT = z.infer<typeof BackendSchema>;

export const BrowserSessionSchema = z.object({
  sessionId: z.string(),
  backend: BackendSchema,
  label: z.string(),
  status: z.enum(["connected", "disconnected", "degraded"]),
  detail: z.string().optional(),
  abiVersion: z.number().int().optional(),
  protocolVersion: z.number().int().optional(),
  engineVersion: z.string().optional(),
  isolation: z.enum(["process", "in-process"]).optional(),
  securityProfile: z.enum(["production", "developer"]).optional(),
  routingMode: z.enum(["chromium-only", "hybrid", "native-only"]).optional(),
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
  navigationError: z.object({ url: z.string(), code: z.number(), message: z.string() }).nullable().optional(),
  /**
   * Why the router placed this page on its backend (architecture §11):
   * `engine-mode-off`, `explicit-backend:<b>`, `needs-chromium-table`,
   * `hybrid:chromium-default`, `hybrid:qualified-cohort:<cohort>`,
   * `hybrid:engine-safe-scheme:<scheme>`, `engine-always`,
   * `hybrid:engine-unavailable`,
   * `fallback:<reason>` (engine classified/failed → reopened on Chromium).
   */
  routeReason: z.string().optional(),
});
export type PageTarget = z.infer<typeof PageTargetSchema>;

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
      /** exact prior turns used to assemble context, for provenance and inspection */
      contextRunIds: z.array(z.string()).optional(),
      /** exact user-selected local document snapshots used for this turn */
      contextAttachmentIds: z.array(z.string()).optional(),
      /** exact Aux-generated text artifacts used for this turn */
      contextArtifactIds: z.array(z.string()).optional(),
      /** Immutable image snapshots explicitly included in this run. */
      contextImageArtifactIds: z.array(z.string()).max(4).optional(),
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
      /** terminal turn this run deliberately retries; used for audit and UI continuity */
      retryOfRunId: z.string().optional(),
      /** VEC-017 durable coordinator snapshot. */
      checkpoint: z
        .object({
          planBoundary: z.string().optional(),
          unresolvedEffects: z.array(z.string()).optional(),
          pageIdentity: z.record(z.string(), z.unknown()).optional(),
          authorizationScope: z.array(z.string()).optional(),
          recoveryStatus: z.string().optional(),
        })
        .optional(),
      /** VEC-019 page-claimed grants that were ignored. */
      ignoredPageGrants: z.array(z.string()).optional(),
      /** VEC-017 last crash-recovery decision. */
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
});
export type Download = z.infer<typeof DownloadSchema>;

export const PageQuickActionSchema = z.object({
  pageId: z.string(), url: z.string(), title: z.string(),
  action: z.enum(["ask", "explain", "summarize", "remember"]),
  selection: z.string().max(12000), truncated: z.boolean(),
});
export type PageQuickAction = z.infer<typeof PageQuickActionSchema>;
