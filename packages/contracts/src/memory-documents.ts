import { z } from "zod";

const id = z.string().min(1).max(200);
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const content = z.string().max(16000);
export const MemorySourceReferenceSchema = z
  .object({
    claimId: z.string().uuid(),
    sourceRunId: id,
    quoteSha256: hash,
    effectiveSha256: hash.optional(),
    claimRevision: z.number().int().nonnegative().optional(),
  })
  .strict();
export const MemoryDocumentTargetSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("site"), origin: z.string().url().max(2048) }).strict(),
  z.object({ kind: z.literal("routine"), routineId: id }).strict(),
]);
export const MemoryDocumentRecordSchema = z
  .object({
    documentId: z.string().uuid(),
    path: z.string().min(1).max(240),
    target: MemoryDocumentTargetSchema,
    revision: z.number().int().positive(),
    content,
    contentSha256: hash,
    authoredBy: z.enum(["owner", "generated"]),
    updatedAt: z.number().int().nonnegative(),
    sourceRefs: z.array(MemorySourceReferenceSchema).max(200),
  })
  .strict();
export const MemoryDreamChangeSchema = z
  .object({
    changeId: z.string().uuid(),
    path: z.string().min(1).max(240),
    documentId: z.string().uuid().optional(),
    target: MemoryDocumentTargetSchema.optional(),
    ownerPath: z.enum(["MEMORY.md", "USER.md", "TAXONOMY.md"]).optional(),
    before: content.nullable(),
    after: content,
    beforeSha256: hash.nullable(),
    afterSha256: hash,
    beforeRevision: z.number().int().nonnegative(),
    beforeSourceRefs: z.array(MemorySourceReferenceSchema).max(200).optional(),
    beforeAuthoredBy: z.enum(["owner", "generated"]).optional(),
    resultingRevision: z.number().int().positive().optional(),
    sourceRefs: z.array(MemorySourceReferenceSchema).max(200),
    state: z.enum(["applied", "pending", "accepted", "rejected", "reverted"]),
  })
  .strict();
export const MemoryDreamOperationSchema = z
  .object({
    operationId: z.string().uuid(),
    trigger: z.enum(["manual", "idle"]),
    status: z.enum(["running", "completed", "no-change", "failed", "cancelled"]),
    startedAt: z.number().int().nonnegative(),
    endedAt: z.number().int().nonnegative().optional(),
    durationMs: z.number().nonnegative(),
    inputGeneration: z.string().nullable(),
    ownerRevision: z.number().int().nonnegative(),
    sourceDigest: hash,
    sourceRunIds: z.array(id).max(200),
    changes: z.array(MemoryDreamChangeSchema).max(20),
    modelId: id.optional(),
    inputTokens: z.number().int().nonnegative().optional(),
    outputTokens: z.number().int().nonnegative().optional(),
    cachedInputTokens: z.number().int().nonnegative().optional(),
    costUsd: z.number().nonnegative().optional(),
    costEstimated: z.boolean().optional(),
    errorCode: z
      .enum([
        "model_unavailable",
        "context_exceeded",
        "budget_exceeded",
        "inference_failed",
        "invalid_output",
        "source_changed",
        "interrupted",
      ])
      .optional(),
  })
  .strict();
export const MemoryRecallSourceSchema = z
  .object({
    sourceId: id,
    kind: z.enum(["owner", "episodic", "site", "routine", "page", "history"]),
    path: z.string().max(8192),
    title: z.string().max(500),
    text: z.string().max(65536),
    revision: z.string().min(1).max(200),
    sha256: hash,
    updatedAt: z.number().nonnegative(),
    url: z.string().max(8192).optional(),
    sourceRefs: z.array(MemorySourceReferenceSchema).max(200),
  })
  .strict();
export const MemoryRecallQuerySchema = z
  .object({
    workspaceId: id,
    queries: z.array(z.string().trim().min(2).max(500)).min(1).max(8),
    kinds: z.array(MemoryRecallSourceSchema.shape.kind).max(6).optional(),
    domains: z.array(z.string().min(1).max(253)).max(20).optional(),
    from: z.number().nonnegative().optional(),
    to: z.number().nonnegative().optional(),
    cursor: z.string().max(2048).optional(),
    limit: z.number().int().min(1).max(50).default(20),
    mode: z.enum(["auto", "lexical"]).default("auto"),
  })
  .strict();
export const MemoryRecallMatchSchema = MemoryRecallSourceSchema.omit({ text: true }).extend({
  chunkId: hash,
  heading: z.string().max(500),
  startLine: z.number().int().positive(),
  endLine: z.number().int().positive(),
  text: z.string().max(3000),
  score: z.number(),
});
export const MemoryRecallResultSchema = z.object({
  mode: z.enum(["semantic", "lexical"]),
  fallbackReason: z.string().max(500).optional(),
  modelId: id.optional(),
  matches: z.array(MemoryRecallMatchSchema).max(50),
  nextCursor: z.string().max(2048).nullable(),
  total: z.number().int().nonnegative(),
});
const workspace = z.object({ workspaceId: id }).strict();
const operation = workspace.extend({ operationId: z.string().uuid() });
const generation = z.string().nullable();
export const MemoryDocumentMethodSchemas = {
  "memory.pipeline.documentList": workspace,
  "memory.pipeline.documentSet": workspace.extend({
    expectedGeneration: generation,
    documentId: z.string().uuid().optional(),
    target: MemoryDocumentTargetSchema,
    expectedRevision: z.number().int().positive().optional(),
    content: content.nullable(),
  }),
  "memory.pipeline.dream": workspace,
  "memory.pipeline.dreamCancel": operation,
  "memory.pipeline.dreamStatus": workspace,
  "memory.pipeline.dreamActivity": workspace.extend({
    cursor: z.string().uuid().optional(),
    limit: z.number().int().min(1).max(50).default(50),
  }),
  "memory.pipeline.dreamReview": operation.extend({
    changeId: z.string().uuid(),
    decision: z.enum(["accept", "reject"]),
    expectedGeneration: z.string(),
    expectedOwnerRevision: z.number().int().nonnegative().optional(),
  }),
  "memory.pipeline.dreamRevert": operation.extend({ expectedGeneration: z.string() }),
  "memory.pipeline.recall": MemoryRecallQuerySchema,
  "memory.pipeline.readSource": workspace.extend({
    sourceId: id,
    revision: id,
    sha256: hash,
    startLine: z.number().int().positive().default(1),
    limitLines: z.number().int().min(1).max(200).default(100),
  }),
} as const;
export const MemoryDocumentResultSchemas = {
  "memory.pipeline.documentList": z.object({
    generation,
    documents: z.array(MemoryDocumentRecordSchema).max(100),
  }),
  "memory.pipeline.documentSet": z.object({
    generation: z.string(),
    document: MemoryDocumentRecordSchema.nullable(),
  }),
  "memory.pipeline.dream": MemoryDreamOperationSchema,
  "memory.pipeline.dreamCancel": MemoryDreamOperationSchema,
  "memory.pipeline.dreamStatus": z.object({
    active: MemoryDreamOperationSchema.nullable(),
    lastRunAt: z.number().nullable(),
    eligibleSessions: z.number().int().nonnegative(),
    due: z.boolean(),
  }),
  "memory.pipeline.dreamActivity": z.object({
    generation,
    entries: z.array(MemoryDreamOperationSchema).max(50),
    nextCursor: z.string().uuid().nullable(),
  }),
  "memory.pipeline.dreamReview": MemoryDreamOperationSchema,
  "memory.pipeline.dreamRevert": MemoryDreamOperationSchema,
  "memory.pipeline.recall": MemoryRecallResultSchema,
  "memory.pipeline.readSource": MemoryRecallSourceSchema.extend({
    startLine: z.number().int().positive(),
    endLine: z.number().int().nonnegative(),
    nextLine: z.number().int().positive().nullable(),
  }),
} as const;
export type MemoryDocumentRecord = z.infer<typeof MemoryDocumentRecordSchema>;
export type MemoryDocumentTarget = z.infer<typeof MemoryDocumentTargetSchema>;
export type MemoryDreamOperation = z.infer<typeof MemoryDreamOperationSchema>;
export type MemoryDreamChange = z.infer<typeof MemoryDreamChangeSchema>;
export type MemoryRecallSource = z.infer<typeof MemoryRecallSourceSchema>;
export type MemoryRecallQuery = z.infer<typeof MemoryRecallQuerySchema>;
export type MemoryRecallMatch = z.infer<typeof MemoryRecallMatchSchema>;

export type MemoryRecallResult = z.infer<typeof MemoryRecallResultSchema>;
export type MemoryReadSourceInput = z.input<
  (typeof MemoryDocumentMethodSchemas)["memory.pipeline.readSource"]
>;
export type MemoryReadSourceResult = z.infer<
  (typeof MemoryDocumentResultSchemas)["memory.pipeline.readSource"]
>;
