import { z } from "zod";

export const MemoryPipelinePolicySchema = z
  .object({ workspaceId: z.string().min(1), enabled: z.boolean() })
  .strict();
export const MemoryClaimSchema = z.object({
  claimId: z.string().uuid(),
  sourceRunId: z.string().min(1),
  contradictionIds: z.array(z.string().uuid()).max(200).optional(),
  mergedClaimIds: z.array(z.string().uuid()).max(200).optional(),
  text: z.string().min(1).max(2000),
  capturedAt: z.number().int().nonnegative(),
  ownerEdit: z
    .object({
      text: z.string().trim().min(1).max(2000),
      revision: z.number().int().positive(),
      updatedAt: z.number().int().nonnegative(),
    })
    .strict()
    .optional(),
  /** Exact source quote: report evidence or explicitly unverified owner-pasted context. Older encrypted notes remain readable. */
  source: z
    .discriminatedUnion("kind", [
      z
        .object({
          kind: z.literal("run-report"),
          quote: z.string().min(1).max(2000),
          quoteSha256: z.string().regex(/^[a-f0-9]{64}$/),
        })
        .strict(),
      z
        .object({
          kind: z.literal("owner-paste"),
          importId: z.string().uuid(),
          quote: z.string().min(1).max(2000),
          quoteSha256: z.string().regex(/^[a-f0-9]{64}$/),
          verification: z.literal("unverified-owner-note"),
        })
        .strict(),
    ])
    .optional(),
});
export const MemoryPipelineInboxSchema = z.array(MemoryClaimSchema).max(200);
export const MemoryPipelineSourceSchema = z.object({
  runId: z.string().min(1),
  goal: z.string(),
  endedAt: z.number().int().nonnegative(),
});
export const MemoryPipelineRevisionSchema = z.object({
  revisionId: z.string().uuid(),
  capturedAt: z.number().int().nonnegative(),
  claimCount: z.number().int().nonnegative(),
  summary: z.string().max(2000),
  sourceRunIds: z.array(z.string().min(1)).max(200),
});
export const MemoryExtractionSchema = z.object({
  activityId: z.string().uuid(),
  sourceRunId: z.string().min(1),
  capturedAt: z.number().int().nonnegative(),
  durationMs: z.number().nonnegative(),
  trigger: z.enum(["manual", "run-completed"]),
  candidateIds: z.array(z.string().uuid()).max(20),
});
export const MemoryExtractionViewSchema = MemoryExtractionSchema.extend({ title: z.string() });
export type MemoryExtraction = z.infer<typeof MemoryExtractionSchema>;
export type MemoryExtractionView = z.infer<typeof MemoryExtractionViewSchema>;

export const MemoryPipelineOverviewSchema = z.object({
  workspaceId: z.string().min(1),
  enabled: z.boolean(),
  summary: z.string().max(10_000),
  claimCount: z.number().int().nonnegative(),
  sourceCount: z.number().int().nonnegative(),
  index: z
    .object({
      status: z.enum(["ready", "not-built", "needs-rebuild"]),
      updatedAt: z.number().int().nonnegative().nullable(),
      chunkCount: z.number().int().nonnegative(),
    })
    .optional(),
});
export const MemoryPipelineForgetParams = z
  .object({
    workspaceId: z.string().min(1),
    sourceRunId: z.string().min(1).optional(),
    claimId: z.string().uuid().optional(),
    all: z.literal(true).optional(),
  })
  .strict()
  .refine(
    (value) => [value.sourceRunId, value.claimId, value.all].filter(Boolean).length === 1,
    "Choose one source, claim, or all memory to forget",
  );
export const MemoryPipelineForgetResultSchema = z.object({
  forgotten: z.number().int().nonnegative(),
  activityRemoved: z.number().int().nonnegative(),
  remaining: z.number().int().nonnegative(),
});
export type MemoryClaim = z.infer<typeof MemoryClaimSchema>;
export type MemoryPipelineOverview = z.infer<typeof MemoryPipelineOverviewSchema>;

/** Owner prose never replaces the original evidence quote. */
export function memoryClaimText(claim: MemoryClaim): string {
  return claim.ownerEdit?.text ?? claim.text;
}
export const MemoryClaimDocumentsSchema = z.object({
  generation: z.string().nullable(),
  documents: z
    .array(
      z.object({
        path: z.string(),
        updatedAt: z.number().int().nonnegative(),
        claim: MemoryClaimSchema,
      }),
    )
    .max(200),
});
export const MemoryDocumentEditParams = z
  .object({
    workspaceId: z.string().min(1),
    expectedGeneration: z.string().min(1),
    edits: z
      .array(z.object({ claimId: z.string().uuid(), text: z.string().trim().min(1).max(2000) }).strict())
      .min(1)
      .max(200),
  })
  .strict()
  .refine(
    (value) => new Set(value.edits.map((edit) => edit.claimId)).size === value.edits.length,
    "Edit each note once",
  );
export type MemoryClaimDocuments = z.infer<typeof MemoryClaimDocumentsSchema>;
