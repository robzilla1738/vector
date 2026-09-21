import { z } from "zod";
import {ProjectCommandSchema} from "./local-projects.js";
import {PreservedCloudResultSchema} from "./cloud.js";

const text = z.string().trim().min(1);
export const AcceptanceCriterionSchema = z.object({
  criterionId: text.max(100),
  description: text.max(1000),
  verification: z.enum(["manual", "browser", "service", "test", "artifact"]),
});
export const TaskResourceSchema = z.object({
  resourceId: text.max(100),
  projectId: z.string().uuid().optional(),
  kind: z.enum(["page", "url", "file", "artifact", "repository", "environment"]),
  locator: text.max(4000),
  label: text.max(200),
  /** Saved references do not grant agent access. `write` is desktop-only. Omit to keep kind defaults (repository write, others reference). */
  access: z.enum(["reference", "read", "write"]).optional(),
});
const ResourceList = z.array(TaskResourceSchema).max(100).refine(items => new Set(items.map(item => item.resourceId)).size === items.length, "Resource IDs must be unique");
export const TaskDefinitionSchema = z.object({
  title: text.max(200),
  objective: text.max(10000),
  criteria: z.array(AcceptanceCriterionSchema).min(1).max(20).refine(items => new Set(items.map(item => item.criterionId)).size === items.length, "Criterion IDs must be unique"),
  resources: ResourceList.default([]),
});
export const TaskSchema = TaskDefinitionSchema.extend({
  conversationId: text.optional(),
  taskId: text,
  workspaceId: text,
  parentTaskId: text.optional(),
  revision: z.number().int().positive(),
  state: z.enum(["open", "archived"]),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export const WorkspaceSchema = z.object({ workspaceId: text, name: text.max(100), createdAt: z.number() });
export const WorkspaceMemoryItemSchema = z.object({
  itemId: text, content: z.string().trim().min(1).max(2000), enabled: z.boolean(),
  sourceUrl: z.string().max(2048).refine(value => { try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password; } catch { return false; } }, "Use a web address without credentials").optional(),
  createdAt: z.number(), updatedAt: z.number(), expiresAt: z.number().optional(),
});
export type WorkspaceMemoryItem = z.infer<typeof WorkspaceMemoryItemSchema>;
export const WorkspaceMemorySchema = z.object({ workspaceId: text, excludedOrigins: z.array(z.string().max(2048)).max(100).optional(), items: z.array(WorkspaceMemoryItemSchema).max(40).optional(), enabled:z.boolean().optional(), content: z.string().max(16_000), revision: z.number().int().nonnegative(), updatedAt: z.number().optional() });
export const TaskCreateParams = TaskDefinitionSchema.extend({ workspaceId: text, parentTaskId: text.optional() });
export const TaskPromoteParams = TaskDefinitionSchema.extend({ workspaceId: text, chatId: text, expectedRunId: text });
export const TaskUpdateParams = TaskDefinitionSchema.partial().extend({ taskId: text, expectedRevision: z.number().int().positive(), resources: ResourceList.optional() });
export type Task = z.infer<typeof TaskSchema>;
export type TaskDefinition = z.infer<typeof TaskDefinitionSchema>;
export type Workspace = z.infer<typeof WorkspaceSchema>;
export type WorkspaceMemory = z.infer<typeof WorkspaceMemorySchema>;

/** Stable conversation identity for every revision and run of one saved task. */
export const taskConversationId = (taskId: string) => `task:${taskId}`;

export const TaskEvidenceSchema = z.object({
  evidenceId: text, taskId: text, taskRevision: z.number().int().positive(), criterionId: text,
  kind: z.enum(["note", "browser_observation", "document_snapshot", "command_snapshot"]), actor: z.enum(["desktop_user", "external_client", "runtime"]),
  summary: text.max(4000), recordedAt: z.number(), observedAt: z.number(), runSequence: z.number().int().nonnegative(),
  source: z.object({ executionTaskId:text.optional(), executionTaskRevision:z.number().int().positive().optional(), commandId: text.optional(), projectId: text.optional(), commandState: text.optional(), exitCode: z.number().nullable().optional(), truncated: z.boolean().optional(), filename: text.optional(), sha256: z.string().regex(/^[a-f0-9]{64}$/).optional(), byteLength: z.number().int().nonnegative().optional(), pageId: text.optional(), url: text.optional(), documentEpoch: z.number().optional(), observationRevision: z.number().optional(), cloudEnvironmentId:text.optional(), cloudSourceTree:z.string().regex(/^[a-f0-9]{40,64}$/).optional(), cloudResultUpdatedAt:z.number().int().nonnegative().optional(), cloudArtifacts:z.array(z.object({artifactId:text,label:text.max(200),sha256:z.string().regex(/^[a-f0-9]{64}$/),bytes:z.number().int().nonnegative().max(25*1024*1024)})).max(51).optional() }),
  snapshot: z.object({ title: z.string(), text: z.string() }).optional(),
});
export type TaskEvidence = z.infer<typeof TaskEvidenceSchema>;
export const CriterionReviewSchema = z.object({
  reviewId: text, taskId: text, taskRevision: z.number().int().positive(), criterionId: text,
  outcome: z.enum(["accepted", "rejected"]), actor: z.literal("desktop_user"),
  evidenceIds: z.array(text).min(1), note: text.max(4000), recordedAt: z.number(), evidenceSequence: z.number().int().nonnegative(),
});
export type CriterionReview = z.infer<typeof CriterionReviewSchema>;
export const EvidenceNoteParams = z.object({ taskId: text, expectedRevision: z.number().int().positive(), criterionId: text, summary: text.max(4000) }).strict();
export const EvidenceCaptureParams = z.object({ taskId: text, expectedRevision: z.number().int().positive(), criterionId: text, pageId: text }).strict();
/** Exact UTF-8 snapshot; filenames are labels, never filesystem authority. */
export const DOCUMENT_EVIDENCE_MAX_BYTES = 512 * 1024;
export const EvidenceDocumentParams = z.object({
  taskId: text, expectedRevision: z.number().int().positive(), criterionId: text,
  filename: z.string().min(1).max(255).regex(/^[^/\\\x00-\x1f]+\.(txt|md|csv|json|docx|xlsx|pdf)$/i),
  content: z.string().max(DOCUMENT_EVIDENCE_MAX_BYTES).refine(value => !value.includes("\0") && new TextEncoder().encode(value).length <= DOCUMENT_EVIDENCE_MAX_BYTES, "Use a UTF-8 text document up to 512 KB"),
}).strict();
export const CriterionReviewParams = z.object({ taskId: text, expectedRevision: z.number().int().positive(), criterionId: text,
  outcome: z.enum(["accepted", "rejected"]), evidenceIds: z.array(text).min(1).max(100), note: text.max(4000) }).strict();
export const TaskReconcileParams = z.object({ taskId: text, expectedRevision: z.number().int().positive(), intentId: text,
  evidenceId: text, outcome: z.enum(["applied", "not_applied"]), note: text.max(4000) }).strict();
export const TaskReconcileOperationParams = z.object({ taskId: text, expectedRevision: z.number().int().positive(), invocationId: text,
  evidenceId: text, outcome: z.enum(["applied", "not_applied"]), note: text.min(1).max(4000) }).strict();
export const TaskVerifyCriterionParams = z.object({ taskId: text, expectedRevision: z.number().int().positive(), criterionId: text }).strict();
export const CriterionVerificationSchema = z.object({
  verificationId: text,
  taskId: text,
  taskRevision: z.number().int().positive(),
  criterionId: text,
  method: z.enum(["manual", "browser", "service", "test", "artifact"]),
  status: z.enum(["unverified", "needs_review"]),
  localMatch: z.boolean(),
  reason: text.max(1000),
  evidenceIds: z.array(text).max(100),
  recordedAt: z.number(),
});
export type CriterionVerification = z.infer<typeof CriterionVerificationSchema>;
export const TaskReplaceAgentParams = z.object({
  taskId: text,
  expectedRevision: z.number().int().positive(),
  pageId: text.optional(),
  pageIds: z.array(text).max(20).optional(),
  modelId: text.optional(),
  context: z.string().max(20_000).optional(),
}).strict();
export const TaskReceiptSchema = z.object({
  taskId: text, taskRevision: z.number().int().positive(), currentTaskRevision: z.number().int().positive().optional(), objective: text, generatedAt: z.number(),
  status: z.enum(["in_progress", "uncertain", "accepted", "not_met", "needs_review"]),
  criteria: z.array(z.object({ criterion: AcceptanceCriterionSchema,
    status: z.enum(["unverified", "needs_review", "accepted", "rejected", "stale"]),
    evidence: z.array(z.object({ record: TaskEvidenceSchema, stale: z.boolean(), reason: z.string().optional() })),
    review: CriterionReviewSchema.optional(),
  })),
  unresolvedActions: z.array(z.object({ intentId: text, runId: text, pageId: text, status: z.enum(["pending", "uncertain"]) })),
  unresolvedOperations: z.array(z.object({ invocationId:text,runId:text,operation:text,effectClass:z.enum(['write','destructive','egress']),status:text,effectOutcome:text,startedAt:z.number(),error:z.string().optional() })).default([]),
  runs: z.array(z.object({ runId: text, status: text, taskRevision: z.number().int().positive(), currentRevision: z.boolean(), error: z.string().optional(), durationMs: z.number().optional() })),
  modelCalls: z.number().int().nonnegative(), knownCostUsd: z.number().nonnegative(), costComplete: z.boolean(),
  modelIds: z.array(z.string()).default([]), providers: z.array(z.string()).default([]), destinations: z.array(z.string()).default([]),
  cloudResults:z.array(PreservedCloudResultSchema).default([]),
  childTasks:z.array(z.object({
    taskId:text,parentTaskId:text,title:text.max(200),revision:z.number().int().positive(),state:z.enum(['open','archived']),depth:z.number().int().min(1).max(4),
    status:z.enum(["in_progress", "uncertain", "accepted", "not_met", "needs_review"]),
    cloudEnvironment:z.string().optional(),
    modelCalls:z.number().int().nonnegative(),knownCostUsd:z.number().nonnegative(),costComplete:z.boolean(),
  })).max(500).default([]),
  verifications: z.array(CriterionVerificationSchema).max(100).default([]),
});
export type TaskReceipt = z.infer<typeof TaskReceiptSchema>;

/** Desktop hydrates the selected identity from its own saved command record. */
export const EvidenceCommandSelectionParams=z.object({taskId:text,expectedRevision:z.number().int().positive(),criterionId:text,projectId:z.string().uuid(),commandId:z.string().uuid()}).strict();
export const EvidenceCommandParams=EvidenceCommandSelectionParams.extend({command:ProjectCommandSchema}).strict();

export const BrowsingMemoryPolicySchema = z.object({ enabled: z.boolean(), retentionDays: z.union([z.literal(7), z.literal(30), z.literal(90)]) });
export const BrowsingMemoryPageSchema = z.object({ memoryId: text, url: z.string(), title: z.string(), firstVisitedAt: z.number(), lastVisitedAt: z.number() });
export const WorkspaceBrowsingMemorySchema = z.object({ workspaceId: text, policy: BrowsingMemoryPolicySchema, pages: z.array(BrowsingMemoryPageSchema) });
export type BrowsingMemoryPolicy = z.infer<typeof BrowsingMemoryPolicySchema>;
export type BrowsingMemoryPage = z.infer<typeof BrowsingMemoryPageSchema>;
