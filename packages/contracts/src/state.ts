import { z } from "zod";

/**
 * State index + query contract (§8.4): a typed structured query underneath
 * natural-language intent. Executing it needs no inference.
 */
export const StateQuerySchema = z.object({
  scope: z
    .object({
      runId: z.string().optional(),
      pageIds: z.array(z.string()).optional(),
      setId: z.string().optional(),
    })
    .optional(),
  entity: z.enum(["controls", "records", "responses", "artifacts", "operations", "datasets"]),
  select: z.array(z.string()).optional(),
  where: z
    .array(
      z.object({
        field: z.string(),
        op: z.enum(["eq", "ne", "contains", "in", "gt", "gte", "lt", "lte"]),
        value: z.unknown(),
      }),
    )
    .optional(),
  freshness: z.enum(["current-required", "previous-observation-allowed"]).default("previous-observation-allowed"),
  completeness: z.enum(["complete-required", "partial-allowed"]).default("partial-allowed"),
  limit: z.number().int().positive().max(5000).optional(),
  cursor: z.string().optional(),
});
export type StateQuery = z.infer<typeof StateQuerySchema>;

export const DatasetHandleSchema = z.object({
  datasetId: z.string(),
  source: z.string(),
  schema: z.array(z.string()),
  rowCount: z.number(),
  coverage: z.object({
    kind: z.enum(["complete", "partial", "unknown"]),
    basis: z.string().optional(),
    reason: z.string().optional(),
  }),
  freshness: z.enum(["live", "previously-observed", "mixed"]),
  provenance: z.string().optional(),
  sampledRows: z.array(z.record(z.string(), z.unknown())).optional(),
  stale: z.boolean().optional(),
});
export type DatasetHandle = z.infer<typeof DatasetHandleSchema>;

export const StateQueryResultSchema = z.object({
  dataset: DatasetHandleSchema,
  rows: z.array(z.record(z.string(), z.unknown())),
  count: z.number(),
  truncated: z.boolean(),
  nextCursor: z.string().optional(),
  explain: z.string(),
});
export type StateQueryResult = z.infer<typeof StateQueryResultSchema>;

/** Registered local transforms over dataset handles (§7.6). */
export const DatasetTransformSchema = z.object({
  datasetId: z.string(),
  op: z.enum(["project", "filter", "sort", "dedup", "group", "join", "limit", "export"]),
  args: z.record(z.string(), z.unknown()).optional(),
});
export type DatasetTransform = z.infer<typeof DatasetTransformSchema>;
