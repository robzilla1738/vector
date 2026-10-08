import { DocumentResultCitationSchema } from "./document-citation.js";
import { z } from "zod";

/** Presentation only. Run, safety, artifact and event records remain authoritative. */
export const RunTranscriptItemSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("answer"), text: z.string(), terminal: z.literal(true) }),
  z.object({
    kind: z.literal("text-proposal"),
    text: z.string().min(1).max(12_000),
    terminal: z.literal(true),
  }),
  z.object({
    kind: z.literal("waiting"),
    state: z.enum(["queued", "planning", "running", "paused", "needs_input"]),
    label: z.string().min(1).max(120),
  }),
  z.object({
    kind: z.literal("tool"),
    op: z.string().regex(/^[a-zA-Z][a-zA-Z0-9._-]{0,59}$/),
    status: z.enum(["running", "ok", "failed", "skipped"]),
  }),
  z.object({
    kind: z.literal("tool-summary"),
    total: z.number().int().nonnegative(),
    omitted: z.number().int().nonnegative(),
  }),
  z.object({
    kind: z.literal("error"),
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
    message: z.string().min(1).max(1_000),
    retryable: z.boolean(),
    action: z.enum(["retry", "model_settings", "permission_settings", "edit_request", "none"]),
  }),
  z.object({
    kind: z.literal("citation"),
    observationId: z.string(),
    quote: z.string(),
    artifactId: z.string().optional(),
  }),
  z.object({
    kind: z.literal("document-citation"),
    citation: DocumentResultCitationSchema,
  }),
  z.object({
    kind: z.literal("artifact"),
    artifactId: z.string(),
    mediaType: z.string(),
    size: z.number().nonnegative(),
    status: z.literal("complete"),
  }),
  z.object({
    kind: z.literal("recovery"),
    state: z.enum(["needs_input", "paused", "partially_completed", "failed", "interrupted"]),
    description: z.string(),
    action: z.enum(["answer", "wait", "retry", "inspect", "settings", "revise", "none"]),
  }),
]);
export type RunTranscriptItem = z.infer<typeof RunTranscriptItemSchema>;

export const RunTranscriptProjectionSchema = z.object({
  runId: z.string(),
  items: z.array(RunTranscriptItemSchema),
});
export type RunTranscriptProjection = z.infer<typeof RunTranscriptProjectionSchema>;
