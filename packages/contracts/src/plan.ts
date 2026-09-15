import { z } from "zod";
import { PlanStepSchema } from "./program.js";

/**
 * What the planner model returns on each call: a bounded chunk of work,
 * a request for a different/narrower observation, a needs_input state,
 * or a final result. Never a chain-of-thought.
 */
export const PlanChunkSchema = z.object({
  status: z.enum(["continue", "done", "needs_input"]),
  /** Short factual status for humans, e.g. "Opened record 17, editing status". */
  message: z.string().max(280),
  /** Page this chunk targets — defaults to the run's current page. */
  pageId: z.string().optional(),
  /** 1..8 meaningful operations to run locally before returning to the model.
   *  Planner-restricted vocabulary: no `evaluate`, no `expression` waits. */
  steps: z.array(PlanStepSchema).max(24).optional(),
  /** Ask for a new observation instead of executing (e.g. wrong/stale scope). */
  observationRequest: z
    .object({
      scope: z.enum(["full", "forms", "links", "tables", "subtree"]).optional(),
      subtreeRef: z.string().optional(),
      note: z.string().optional(),
    })
    .optional(),
  /** Final structured result when status === "done". */
  result: z.record(z.string(), z.unknown()).optional(),
  /** Question for the human when status === "needs_input". */
  question: z.string().optional(),
  /** Program to save for reuse when the run demonstrates a repeatable task. */
  saveProgram: z
    .object({
      name: z.string(),
      description: z.string().optional(),
      parameters: z.array(z.string()).optional(),
    })
    .optional(),
});
export type PlanChunk = z.infer<typeof PlanChunkSchema>;

/**
 * The end-of-run decision: emitted when a guard (repeat/no-progress/budget)
 * stops the action loop. No steps — the model can only report what it
 * concluded or ask a human for the missing piece.
 */
export const FinalDecisionSchema = z.object({
  status: z.enum(["done", "needs_input"]),
  message: z.string().max(280),
  result: z.record(z.string(), z.unknown()).optional(),
  question: z.string().optional(),
});
export type FinalDecision = z.infer<typeof FinalDecisionSchema>;

/* ------------------------------------------------------------------ */
/*  Operations registry (§10): compiled, versioned, multi-implementation  */
/* ------------------------------------------------------------------ */

export const OperationImplKindSchema = z.enum([
  "browser-program",
  "session-request",
  "observed-data",
  "site-tool",
  "visual-program",
]);
export type OperationImplKind = z.infer<typeof OperationImplKindSchema>;

/** A validated in-session request implementation (§9.4, R4.2). */
export const SessionRequestImplSchema = z.object({
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  /** URL template — `{inputName}` placeholders substitute operation inputs */
  urlTemplate: z.string(),
  /** query params template */
  query: z.record(z.string(), z.string()).optional(),
  /** request body template — string values may contain `{input}` placeholders */
  body: z.unknown().optional(),
  contentType: z.enum(["json", "form", "text"]).optional(),
  /** response handling: read JSON/text back into the result */
  expectStatus: z.array(z.number()).optional(),
  /** postconditions: a readback path proving the effect (e.g. /api/state field) */
  verify: z
    .object({
      urlTemplate: z.string().optional(),
      jsonPath: z.string().optional(),
      equals: z.unknown().optional(),
      contains: z.string().optional(),
    })
    .optional(),
});
export type SessionRequestImpl = z.infer<typeof SessionRequestImplSchema>;

export const BrowserProgramImplSchema = z.object({
  /** portable steps — refs already translated to role/css/text selectors */
  steps: z.array(z.unknown()),
});
export type BrowserProgramImpl = z.infer<typeof BrowserProgramImplSchema>;

export const OperationGuardSchema = z.object({
  /** origin + structural path family the op applies to */
  siteKey: z.string(),
  /** control fingerprints that must exist in a fresh observation */
  requiredControls: z
    .array(z.object({ role: z.string().optional(), name: z.string().optional(), selector: z.string().optional() }))
    .optional(),
  /** url substring/regex that must match the live page */
  urlMatches: z.string().optional(),
});
export type OperationGuard = z.infer<typeof OperationGuardSchema>;

export const OperationImplSchema = z.object({
  implId: z.string(),
  operationId: z.string(),
  kind: OperationImplKindSchema,
  /** kind-specific executable: BrowserProgramImpl | SessionRequestImpl | observed-data spec */
  executable: z.unknown(),
  state: z.enum(["candidate", "validated", "degraded", "retired"]),
  evidence: z.array(z.record(z.string(), z.unknown())),
  stats: z.object({
    runs: z.number().default(0),
    successes: z.number().default(0),
    meanDurationMs: z.number().optional(),
    lastUsedAt: z.number().optional(),
    validationInputs: z.number().default(0),
  }),
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type OperationImpl = z.infer<typeof OperationImplSchema>;

export const OperationSchema = z.object({
  operationId: z.string(),
  siteKey: z.string(),
  name: z.string(),
  description: z.string().optional(),
  inputSchema: z.record(z.string(), z.unknown()),
  outputSchema: z.record(z.string(), z.unknown()),
  effectClass: z.enum(["read", "mutation", "download", "mixed"]),
  guards: OperationGuardSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
});
export type Operation = z.infer<typeof OperationSchema>;

export const InvocationSchema = z.object({
  invocationId: z.string(),
  operationId: z.string(),
  implId: z.string().optional(),
  runId: z.string().optional(),
  inputs: z.record(z.string(), z.unknown()),
  status: z.enum(["queued", "running", "succeeded", "failed", "cancelled"]),
  /** §5.3 — invocation status and side-effect status are separate */
  effectOutcome: z.enum(["not-dispatched", "confirmed-applied", "confirmed-not-applied", "unknown", "not-applicable"]),
  routeReason: z.string().optional(),
  startedAt: z.number(),
  endedAt: z.number().optional(),
  error: z.string().optional(),
});
export type Invocation = z.infer<typeof InvocationSchema>;

/** Repair calls return a corrected chunk plus an optional note. */
export const RepairChunkSchema = z.object({
  message: z.string().max(280),
  steps: z.array(PlanStepSchema).max(12),
});
export type RepairChunk = z.infer<typeof RepairChunkSchema>;
