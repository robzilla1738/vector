import { z } from "zod";

/** Presentation only. Run, safety, artifact and event records remain authoritative. */
export const RunTranscriptItemSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("answer"), text: z.string(), terminal: z.literal(true) }),
  z.object({ kind: z.literal("citation"), observationId: z.string(), quote: z.string(), artifactId: z.string().optional() }),
  z.object({ kind: z.literal("artifact"), artifactId: z.string(), mediaType: z.string(), size: z.number().nonnegative(), status: z.literal("complete") }),
  z.object({ kind: z.literal("recovery"), state: z.enum(["needs_input", "paused", "partially_completed", "failed", "interrupted"]),
    description: z.string(), action: z.enum(["answer", "wait", "retry", "inspect", "settings", "revise", "none"]) }),
]);
export type RunTranscriptItem = z.infer<typeof RunTranscriptItemSchema>;

export const RunTranscriptProjectionSchema = z.object({
  runId: z.string(),
  items: z.array(RunTranscriptItemSchema),
});
export type RunTranscriptProjection = z.infer<typeof RunTranscriptProjectionSchema>;
