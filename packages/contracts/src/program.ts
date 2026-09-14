import { z } from "zod";

/** Conditions the executor can wait on — no fixed sleeps. */
export const ConditionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("textVisible"),
    text: z.string(),
    timeoutMs: z.number().int().positive().optional(),
  }),
  z.object({
    kind: z.literal("selector"),
    selector: z.string(),
    state: z.enum(["attached", "visible", "hidden", "detached"]).default("visible"),
    timeoutMs: z.number().int().positive().optional(),
  }),
  z.object({
    kind: z.literal("refReady"),
    ref: z.string(),
    timeoutMs: z.number().int().positive().optional(),
  }),
  z.object({
    kind: z.literal("urlMatches"),
    pattern: z.string().describe("substring or /regex/ pattern"),
    timeoutMs: z.number().int().positive().optional(),
  }),
  z.object({
    kind: z.literal("navigationSettled"),
    timeoutMs: z.number().int().positive().optional(),
  }),
  z.object({
    kind: z.literal("downloadCompleted"),
    timeoutMs: z.number().int().positive().optional(),
  }),
  z.object({
    kind: z.literal("response"),
    urlIncludes: z.string(),
    status: z.number().int().optional(),
    timeoutMs: z.number().int().positive().optional(),
  }),
  z.object({
    kind: z.literal("expression"),
    expression: z.string().describe("JS expression evaluated in page; truthy passes"),
    timeoutMs: z.number().int().positive().optional(),
  }),
]);
export type Condition = z.infer<typeof ConditionSchema>;

const targetFields = {
  target: z
    .string()
    .describe("element ref like r12 from the latest observation, or a css:/xpath:/text= selector"),
};
const targetFieldsOptional = z.object(targetFields).partial().shape;

const stepBase = {
  id: z.string().describe("unique step id within the program"),
  timeoutMs: z.number().int().positive().optional(),
  optional: z.boolean().optional().describe("failure does not fail the program"),
  expect: z.array(ConditionSchema).optional().describe("verified after the step runs"),
};

export const StepSchema = z.discriminatedUnion("op", [
  z.object({ ...stepBase, op: z.literal("navigate"), url: z.string().url() }),
  z.object({ ...stepBase, op: z.literal("back") }),
  z.object({ ...stepBase, op: z.literal("forward") }),
  z.object({ ...stepBase, op: z.literal("reload") }),
  z.object({ ...stepBase, op: z.literal("stop") }),
  z.object({ ...stepBase, op: z.literal("click"), ...targetFields, button: z.enum(["left", "right", "middle"]).optional() }),
  z.object({ ...stepBase, op: z.literal("dblclick"), ...targetFields }),
  z.object({ ...stepBase, op: z.literal("hover"), ...targetFields }),
  z.object({
    ...stepBase,
    op: z.literal("fill"),
    ...targetFields,
    value: z.string().describe("replaces the field value; fires input/change"),
  }),
  z.object({
    ...stepBase,
    op: z.literal("type"),
    ...targetFields,
    value: z.string(),
    delayMs: z.number().int().nonnegative().optional(),
  }),
  z.object({
    ...stepBase,
    op: z.literal("press"),
    key: z.string().describe("e.g. Enter, Tab, Control+A"),
    ...targetFieldsOptional,
  }),
  z.object({ ...stepBase, op: z.literal("check"), ...targetFields }),
  z.object({ ...stepBase, op: z.literal("uncheck"), ...targetFields }),
  z.object({ ...stepBase, op: z.literal("select"), ...targetFields, value: z.union([z.string(), z.array(z.string())]) }),
  z.object({
    ...stepBase,
    op: z.literal("scroll"),
    ...targetFieldsOptional,
    direction: z.enum(["up", "down", "top", "bottom"]).default("down"),
    amount: z.number().positive().optional().describe("pixels; defaults to a viewport"),
  }),
  z.object({
    ...stepBase,
    op: z.literal("dragTo"),
    ...targetFields,
    to: z.string().describe("target ref or selector"),
  }),
  z.object({
    ...stepBase,
    op: z.literal("clickPoint"),
    x: z.number(),
    y: z.number(),
    button: z.enum(["left", "right", "middle"]).optional(),
  }),
  z.object({ ...stepBase, op: z.literal("waitFor"), condition: ConditionSchema }),
  z.object({
    ...stepBase,
    op: z.literal("screenshot"),
    fullPage: z.boolean().optional(),
    artifact: z.string().optional().describe("artifact label"),
  }),
  z.object({
    ...stepBase,
    op: z.literal("extract"),
    fields: z.array(
      z.object({
        name: z.string(),
        selector: z.string().optional().describe("css; default: whole page text"),
        attribute: z.string().optional(),
        all: z.boolean().optional().describe("collect every match"),
      }),
    ),
    as: z.string().optional().describe("result key"),
  }),
  z.object({
    ...stepBase,
    op: z.literal("upload"),
    ...targetFields,
    files: z.array(z.string()).describe("absolute paths"),
  }),
  z.object({
    ...stepBase,
    op: z.literal("expectDownload"),
    saveAs: z.string().optional(),
  }),
  z.object({
    ...stepBase,
    op: z.literal("collectScroll"),
    /** result key under which collected items are exposed */
    as: z.string().optional(),
    /** css for each row/item inside the scroller */
    item: z.string(),
    /** scroller css; defaults to the document viewport */
    container: z.string().optional(),
    /** attribute used as the dedupe key; default: item text */
    key: z.string().optional(),
    fields: z
      .array(z.object({ name: z.string(), selector: z.string().optional(), attribute: z.string().optional() }))
      .optional()
      .describe("per-item field extraction"),
    limit: z.number().int().positive().optional().describe("stop once this many unique items are collected"),
    maxScrolls: z.number().int().positive().optional(),
    settleMs: z.number().int().nonnegative().optional().describe("render settle between scrolls"),
  }),
  z.object({
    ...stepBase,
    op: z.literal("dialog"),
    action: z.enum(["accept", "dismiss"]),
    promptText: z.string().optional(),
  }),
  z.object({
    ...stepBase,
    op: z.literal("evaluate"),
    expression: z.string().describe("developer escape hatch; not for normal plans"),
    /** result key under which the return value is exposed in `extracted` */
    as: z.string().optional(),
  }),
]);
export type Step = z.infer<typeof StepSchema>;

/* ------------------------------------------------------------------ */
/*  Control-flow programs (Runtime vNext §7): a bounded node language    */
/*  the executor interprets locally — no model in the inner loop.        */
/* ------------------------------------------------------------------ */

/**
 * Value expressions resolved against the program environment.
 * `{input: "ownerId"}` reads a program input, `{variable: "record.id"}`
 * reads a bound variable (dotted path), `{literal: v}` is a constant, and
 * `{eval: "js"}` is an interpreter-side escape hatch evaluated with `env`
 * in scope — used sparingly, like `evaluate` is for pages.
 */
export const ExprSchema = z.union([
  z.object({ input: z.string() }),
  z.object({ variable: z.string() }),
  z.object({ literal: z.unknown() }),
  z.object({ eval: z.string() }),
]);
export type Expr = z.infer<typeof ExprSchema>;

/** Any JSON value or an Expr ref. */
export const ValueSchema = z.unknown();
export type Value = z.infer<typeof ValueSchema>;

/** Deterministic predicates for if/until/assert — no inference. */
export const PredicateSchema: z.ZodType<Predicate> = z.lazy(() =>
  z.union([
    z.object({ op: z.enum(["eq", "ne", "gt", "gte", "lt", "lte", "contains", "in", "exists", "truthy"]), a: ValueSchema, b: ValueSchema.optional() }),
    z.object({ and: z.array(PredicateSchema) }),
    z.object({ or: z.array(PredicateSchema) }),
    z.object({ not: PredicateSchema }),
  ]),
);
export type Predicate =
  | { op: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "contains" | "in" | "exists" | "truthy"; a: unknown; b?: unknown }
  | { and: Predicate[] }
  | { or: Predicate[] }
  | { not: Predicate };

export type ProgramNode =
  | { kind: "step"; step: Step }
  | { kind: "let"; name: string; value: Value }
  | { kind: "if"; when: Predicate; then: ProgramNode[]; else?: ProgramNode[] }
  | {
      kind: "forEach";
      items: Value;
      itemName: string;
      indexName?: string;
      concurrency?: number;
      maxItems?: number;
      body: ProgramNode[];
    }
  | { kind: "until"; body: ProgramNode[]; until: Predicate; maxIterations: number; deadlineMs?: number }
  | { kind: "observe"; scope?: "full" | "forms" | "links" | "tables" | "subtree"; subtreeRef?: string; saveAs?: string }
  | { kind: "assert"; check: Predicate; message?: string }
  | { kind: "emit"; value?: Value; label?: string }
  | { kind: "checkpoint"; name?: string }
  | { kind: "return"; value?: Value }
  | { kind: "call"; operation: string; args?: Record<string, Value>; saveAs?: string; optional?: boolean };

export const ProgramNodeSchema: z.ZodType<ProgramNode> = z.lazy(() =>
  z.discriminatedUnion("kind", [
    z.object({ kind: z.literal("step"), step: StepSchema }),
    z.object({ kind: z.literal("let"), name: z.string().min(1), value: ValueSchema }),
    z.object({
      kind: z.literal("if"),
      when: PredicateSchema,
      then: z.array(ProgramNodeSchema),
      else: z.array(ProgramNodeSchema).optional(),
    }),
    z.object({
      kind: z.literal("forEach"),
      items: ValueSchema,
      itemName: z.string().min(1),
      indexName: z.string().optional(),
      concurrency: z.number().int().positive().max(8).optional(),
      maxItems: z.number().int().positive().optional(),
      body: z.array(ProgramNodeSchema),
    }),
    z.object({
      kind: z.literal("until"),
      body: z.array(ProgramNodeSchema),
      until: PredicateSchema,
      maxIterations: z.number().int().positive().max(1000),
      deadlineMs: z.number().int().positive().optional(),
    }),
    z.object({
      kind: z.literal("observe"),
      scope: z.enum(["full", "forms", "links", "tables", "subtree"]).optional(),
      subtreeRef: z.string().optional(),
      saveAs: z.string().optional(),
    }),
    z.object({ kind: z.literal("assert"), check: PredicateSchema, message: z.string().optional() }),
    z.object({ kind: z.literal("emit"), value: ValueSchema.optional(), label: z.string().optional() }),
    z.object({ kind: z.literal("checkpoint"), name: z.string().optional() }),
    z.object({ kind: z.literal("return"), value: ValueSchema.optional() }),
    z.object({
      kind: z.literal("call"),
      operation: z.string().min(1),
      args: z.record(z.string(), ValueSchema).optional(),
      saveAs: z.string().optional(),
      optional: z.boolean().optional(),
    }),
  ]),
);

export const ProgramBudgetSchema = z.object({
  maxIterations: z.number().int().positive().optional(),
  deadlineMs: z.number().int().positive().optional(),
  maxNodes: z.number().int().positive().optional(),
});
export type ProgramBudget = z.infer<typeof ProgramBudgetSchema>;

export const ProgramSchema = z.object({
  pageId: z.string().describe("target page this program runs against"),
  documentEpoch: z.number().int().nonnegative().optional(),
  steps: z.array(StepSchema).min(1).max(200).optional(),
  /** control-flow form — when present it supersedes `steps` */
  nodes: z.array(ProgramNodeSchema).min(1).max(400).optional(),
  version: z.string().optional(),
  name: z.string().optional(),
  inputs: z.record(z.string(), z.unknown()).optional(),
  budget: ProgramBudgetSchema.optional(),
  conflicts: z.array(z.string()).optional().describe("resource conflict keys, e.g. record:rec-01"),
  /** §7.7/§17.3 — restart at a persisted top-level checkpoint instead of node 0. */
  resumeFrom: z.string().optional(),
});
export type Program = z.infer<typeof ProgramSchema>;

export const StepOutcomeSchema = z.object({
  stepId: z.string(),
  op: z.string(),
  status: z.enum(["ok", "failed", "skipped"]),
  startedAt: z.number(),
  durationMs: z.number(),
  detail: z.string().optional(),
  error: z
    .object({ code: z.string(), message: z.string() })
    .optional(),
  extracted: z.record(z.string(), z.unknown()).optional(),
  artifactIds: z.array(z.string()).optional(),
});
export type StepOutcome = z.infer<typeof StepOutcomeSchema>;

export const ProgramResultSchema = z.object({
  status: z.enum(["completed", "failed", "cancelled"]),
  steps: z.array(StepOutcomeSchema),
  extracted: z.record(z.string(), z.unknown()).optional(),
  /** values emitted by `emit` nodes, in order */
  emitted: z.array(z.unknown()).optional(),
  /** value produced by a `return` node */
  returnValue: z.unknown().optional(),
  /** checkpoint names reached before completion/failure */
  checkpoints: z.array(z.string()).optional(),
  error: z.string().optional(),
});
export type ProgramResult = z.infer<typeof ProgramResultSchema>;
