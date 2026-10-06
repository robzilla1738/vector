import { PlanConditionSchema, PlanStepSchema } from "@aux/contracts";
import { z } from "zod";

/** Planner vocabulary only. A passthrough step object would admit `evaluate`. */
export const McpStepSchema = PlanStepSchema;

const PLAN_OPS = PlanStepSchema.options.map((o) => o.shape.op.value) as [string, ...string[]];
const CONDITION_KINDS = PlanConditionSchema.options.map((o) => o.shape.kind.value) as [string, ...string[]];

const FlatCondition = z.object({
  kind: z.enum(CONDITION_KINDS),
  text: z.string().optional(),
  selector: z.string().optional(),
  state: z.enum(["attached", "visible", "hidden", "detached"]).optional(),
  ref: z.string().optional(),
  pattern: z.string().optional(),
  urlIncludes: z.string().optional(),
  status: z.number().int().optional(),
  timeoutMs: z.number().int().positive().optional(),
});

/**
 * Model-facing step shape for tools/list: one flat object instead of the
 * per-op union (which repeats the condition union for every op and made
 * aux_page_execute ~64KB). Every step is still validated against
 * McpStepSchema before it reaches the runtime.
 */
export const McpStepInputSchema = z.object({
  id: z.string(),
  op: z.enum(PLAN_OPS),
  target: z.string().optional().describe("ref (r12) or css:/text:/role= locator"),
  value: z.union([z.string(), z.array(z.string())]).optional(),
  url: z.string().optional(),
  key: z.string().optional().describe("press: key; collectScroll: dedupe attribute"),
  button: z.enum(["left", "right", "middle"]).optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  to: z.string().optional(),
  direction: z.enum(["up", "down", "top", "bottom"]).optional(),
  amount: z.number().positive().optional(),
  delayMs: z.number().int().nonnegative().optional(),
  credentialRef: z.string().optional(),
  condition: FlatCondition.optional(),
  fields: z
    .array(
      z.object({
        name: z.string(),
        selector: z.string().optional(),
        attribute: z.string().optional(),
        all: z.boolean().optional(),
      }),
    )
    .optional(),
  as: z.string().optional(),
  item: z.string().optional(),
  container: z.string().optional(),
  limit: z.number().int().positive().optional(),
  maxScrolls: z.number().int().positive().optional(),
  settleMs: z.number().int().nonnegative().optional(),
  files: z.array(z.string()).optional(),
  fullPage: z.boolean().optional(),
  artifact: z.string().optional(),
  saveAs: z.string().optional(),
  action: z.enum(["accept", "dismiss"]).optional(),
  promptText: z.string().optional(),
  optional: z.boolean().optional(),
  timeoutMs: z.number().int().positive().optional(),
  expect: z.array(FlatCondition).optional(),
});

/** Validate flat tool input against the planner vocabulary; returns the first problem as text. */
export function parseMcpSteps(
  steps: unknown,
): { steps: z.infer<typeof McpStepSchema>[] } | { error: string } {
  const parsed = z.array(McpStepSchema).safeParse(steps);
  if (parsed.success) return { steps: parsed.data };
  const issue = parsed.error.issues[0];
  return { error: `step ${issue?.path.join(".") ?? ""}: ${issue?.message ?? "invalid"}` };
}

type ExecuteSummary = {
  status?: string;
  error?: string;
  steps?: {
    stepId: string;
    op: string;
    status: string;
    durationMs?: number;
    detail?: string;
    error?: { code?: string; message?: string };
  }[];
  extracted?: unknown;
  [key: string]: unknown;
};

/** One line per step instead of pretty-printed JSON. */
export function summarizeExecute(result: ExecuteSummary): string {
  const { status, error, steps = [], extracted, observation: _observation, ...rest } = result;
  const lines = [
    `${status ?? "unknown"} (${steps.length} step${steps.length === 1 ? "" : "s"})${error ? ` — ${error}` : ""}`,
  ];
  for (const s of steps) {
    let line = `${s.stepId} ${s.op} ${s.status}${s.durationMs !== undefined ? ` ${s.durationMs}ms` : ""}`;
    if (s.detail) line += ` — ${s.detail.slice(0, 300)}`;
    if (s.error) line += ` — ${s.error.code ?? "error"}: ${s.error.message ?? ""}`;
    lines.push(line);
  }
  if (extracted !== undefined) lines.push(`extracted: ${JSON.stringify(extracted)}`);
  const extra = Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined));
  if (Object.keys(extra).length) lines.push(JSON.stringify(extra));
  return lines.join("\n");
}
