import {
  VectorError,
  type VectorErrorCode,
  type Predicate,
  type Program,
  type ProgramNode,
  type ProgramResult,
  type Step,
  type StepOutcome,
} from "@vector/contracts";
import type { DriverPage } from "@vector/engine-client";
import type { makeStepRunner } from "./executor.js";

type StepRunner = ReturnType<typeof makeStepRunner>;

export interface NodeContext {
  page: DriverPage;
  signal?: AbortSignal;
  /** shared outcome ledger — the interpreter appends via emit and returns it */
  outcomes: StepOutcome[];
  emit: (outcome: StepOutcome, step: Step) => void;
  onEmit?: (label: string | undefined, value: unknown) => void;
  onNode?: (info: { kind: string; id: string; detail?: string }) => void;
  observe?: (req: {
    scope?: "full" | "forms" | "links" | "tables" | "subtree";
    subtreeRef?: string;
  }) => Promise<unknown>;
  callOperation?: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  checkpoint?: (name: string, env: Record<string, unknown>) => void;
  /** §7.7 — fetch the persisted env for `program.resumeFrom`. */
  loadCheckpoint?: (name: string) =>
    | { inputs?: Record<string, unknown>; vars?: Record<string, unknown>; emitted?: unknown[] }
    | undefined;
  allowEval: boolean;
}

interface Env {
  inputs: Record<string, unknown>;
  vars: Record<string, unknown>;
}

/* ---------------- value resolution ---------------- */

const EXPR_KEYS = new Set(["input", "variable", "literal", "eval"]);

function isExprRef(v: unknown): v is { input?: string; variable?: string; literal?: unknown; eval?: string } {
  return (
    typeof v === "object" &&
    v !== null &&
    !Array.isArray(v) &&
    Object.keys(v as object).length === 1 &&
    Object.keys(v as object).some((k) => EXPR_KEYS.has(k))
  );
}

function getPath(root: unknown, path: string): unknown {
  let cur = root;
  for (const part of path.split(".")) {
    if (cur === null || cur === undefined) return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return cur;
}

function resolveExpr(expr: { input?: string; variable?: string; literal?: unknown; eval?: string }, env: Env, allowEval: boolean): unknown {
  if (expr.input !== undefined) return env.inputs[expr.input];
  if (expr.variable !== undefined) {
    const [head, ...rest] = expr.variable.split(".");
    const root = env.vars[head!];
    return rest.length ? getPath(root, rest.join(".")) : root;
  }
  if ("literal" in expr) return expr.literal;
  if (expr.eval !== undefined) {
    if (!allowEval) throw new VectorError("invalid_params", "eval expressions are disabled for this program source");
    // trusted-input escape hatch — same trust tier as the `evaluate` step
    // op but in-process; only reachable when allowEval is set.
    const fn = new Function("vars", "inputs", `"use strict"; return (${expr.eval});`);
    return fn(env.vars, env.inputs);
  }
  return undefined;
}

/** Deep-resolve Expr refs inside plain JSON structures. */
function resolveValue(v: unknown, env: Env, allowEval: boolean): unknown {
  if (isExprRef(v)) return resolveExpr(v, env, allowEval);
  if (Array.isArray(v)) return v.map((x) => resolveValue(x, env, allowEval));
  if (typeof v === "object" && v !== null) {
    return Object.fromEntries(Object.entries(v as Record<string, unknown>).map(([k, x]) => [k, resolveValue(x, env, allowEval)]));
  }
  return v;
}

/* ---------------- predicates ---------------- */

function deepEq(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;
  if (typeof a !== "object") return false;
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

export function evalPredicate(p: Predicate, env: Env, allowEval: boolean): boolean {
  if ("and" in p) return p.and.every((x) => evalPredicate(x, env, allowEval));
  if ("or" in p) return p.or.some((x) => evalPredicate(x, env, allowEval));
  if ("not" in p) return !evalPredicate(p.not, env, allowEval);
  const a = resolveValue(p.a, env, allowEval);
  const b = resolveValue(p.b, env, allowEval);
  switch (p.op) {
    case "eq": return deepEq(a, b);
    case "ne": return !deepEq(a, b);
    case "gt": return Number(a) > Number(b);
    case "gte": return Number(a) >= Number(b);
    case "lt": return Number(a) < Number(b);
    case "lte": return Number(a) <= Number(b);
    case "contains":
      if (typeof a === "string") return a.includes(String(b));
      if (Array.isArray(a)) return a.some((x) => deepEq(x, b));
      if (typeof a === "object" && a !== null) return String(b) in (a as object);
      return false;
    case "in":
      return Array.isArray(b) ? b.some((x) => deepEq(x, a)) : false;
    case "exists": return a !== undefined && a !== null;
    case "truthy": return !!a;
  }
}

/* ---------------- interpreter ---------------- */

interface LoopState {
  nodeCount: number;
  iterationCount: number;
  emitted: unknown[];
  checkpoints: string[];
  returnValue: unknown;
  returned: boolean;
}

/**
 * Execute the control-flow form of a program. Every loop is bounded, every
 * node increments the execution counter, cancellation is honored between
 * nodes. Node ids expand with their iteration path (`each[2].change`) so
 * the step ledger stays unambiguous.
 */
export async function executeNodes(
  program: Program,
  runner: StepRunner,
  ctx: NodeContext,
): Promise<ProgramResult> {
  const env: Env = { inputs: program.inputs ?? {}, vars: {} };
  const budget = program.budget ?? {};
  const maxNodes = budget.maxNodes ?? 2000;
  const maxIterations = budget.maxIterations ?? 500;
  const deadline = budget.deadlineMs ? Date.now() + budget.deadlineMs : undefined;
  const state: LoopState = { nodeCount: 0, iterationCount: 0, emitted: [], checkpoints: [], returnValue: undefined, returned: false };

  // §7.7/§17.3 — resume from a persisted checkpoint: restore its env, then
  // skip top-level nodes until the checkpoint marker is passed. This is a
  // position restore, not a transactional rewind of remote state.
  let resumeAt: string | undefined;
  if (program.resumeFrom) {
    const saved = ctx.loadCheckpoint?.(program.resumeFrom);
    if (!saved) throw new VectorError("not_found", `no persisted checkpoint "${program.resumeFrom}" to resume from`);
    env.inputs = { ...saved.inputs, ...env.inputs };
    Object.assign(env.vars, saved.vars ?? {});
    state.emitted.push(...(saved.emitted ?? []));
    resumeAt = program.resumeFrom;
  }

  const nodeOutcome = (id: string, kind: string, detail?: string, status: StepOutcome["status"] = "ok"): StepOutcome => {
    const o: StepOutcome = {
      stepId: id,
      op: kind === "step" ? "step" : kind,
      status,
      startedAt: Date.now(),
      durationMs: 0,
      ...(detail ? { detail } : {}),
    };
    return o;
  };

  const runNodeList = async (nodes: ProgramNode[], path: string, env: Env): Promise<void> => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]!;
      // resume mode: skip top-level nodes until the named checkpoint is
      // passed; nested bodies never gate resume (checkpoints are linear)
      if (resumeAt !== undefined && path === "") {
        if (node.kind === "checkpoint" && (node.name ?? "") === resumeAt) resumeAt = undefined;
        continue;
      }
      if (ctx.signal?.aborted) throw new VectorError("cancelled", "program cancelled");
      if (state.returned) return;
      if (deadline && Date.now() > deadline) throw new VectorError("condition_timeout", "program deadline exceeded");
      if (++state.nodeCount > maxNodes) throw new VectorError("step_failed", `node budget ${maxNodes} exceeded`);

      const nodeId = path ? `${path}.${nodeIdOf(node, i)}` : nodeIdOf(node, i);
      ctx.onNode?.({ kind: node.kind, id: nodeId });

      switch (node.kind) {
        case "step": {
          const step = node.step;
          // expectDownload pairs with the following node when it is a step —
          // same arming rule as the flat path.
          if (step.op === "expectDownload") {
            const next = nodes[i + 1];
            if (next?.kind !== "step") {
              ctx.emit(
                { stepId: nodeId, op: step.op, status: "failed", startedAt: Date.now(), durationMs: 0, error: { code: "invalid_params", message: "expectDownload must precede the step that triggers the download" } },
                step,
              );
              throw new VectorError("invalid_params", "expectDownload must precede the trigger step");
            }
            const emitPair = (o: StepOutcome, s: Step) => ctx.emit({ ...o, stepId: `${nodeId}/${s.id}` }, s);
            const { early } = await runner.runDownloadPair(step, next.step, emitPair);
            i++;
            if (early) {
              if (early.status === "cancelled") throw new VectorError("cancelled", "program cancelled");
              throw new VectorError("step_failed", early.error ?? "download pair failed");
            }
            break;
          }
          const outcome = await runner.runOne(step);
          // extraction results become addressable variables: `as: "data"`
          // binds vars.data = {…fields}; bare extracts land under "extracted"
          if (outcome.extracted) {
            env.vars["as" in step && step.as ? step.as : "extracted"] = outcome.extracted;
          }
          const named = { ...outcome, stepId: `${nodeId}/${step.id}` };
          ctx.emit(named, step);
          if (outcome.status === "failed" && !step.optional) {
            if (ctx.signal?.aborted) throw new VectorError("cancelled", "program cancelled");
            throw new VectorError(
              (outcome.error?.code as VectorErrorCode | undefined) ?? "step_failed",
              outcome.error?.message ?? `step ${step.id} failed`,
            );
          }
          break;
        }
        case "let": {
          env.vars[node.name] = resolveValue(node.value, env, ctx.allowEval);
          ctx.emit(nodeOutcome(nodeId, "let", `${node.name} bound`), fakeStep(nodeId, "let"));
          break;
        }
        case "if": {
          const cond = evalPredicate(node.when, env, ctx.allowEval);
          ctx.emit(nodeOutcome(nodeId, "if", cond ? "then" : "else"), fakeStep(nodeId, "if"));
          await runNodeList(cond ? node.then : (node.else ?? []), nodeId, env);
          break;
        }
        case "forEach": {
          const items = resolveValue(node.items, env, ctx.allowEval);
          const list = Array.isArray(items) ? items : [];
          const cap = node.maxItems !== undefined ? Math.min(node.maxItems, list.length) : list.length;
          const conc = Math.max(1, Math.min(node.concurrency ?? 1, 8));
          ctx.emit(nodeOutcome(nodeId, "forEach", `${cap} items${conc > 1 ? ` · ×${conc}` : ""}`), fakeStep(nodeId, "forEach"));
          // sequential: shared env, in-order side effects
          if (conc === 1) {
            for (let idx = 0; idx < cap; idx++) {
              if (ctx.signal?.aborted) throw new VectorError("cancelled", "program cancelled");
              if (state.returned) return;
              if (++state.iterationCount > maxIterations)
                throw new VectorError("step_failed", `iteration budget ${maxIterations} exceeded`);
              env.vars[node.itemName] = list[idx];
              if (node.indexName) env.vars[node.indexName] = idx;
              await runNodeList(node.body, `${nodeId}[${idx}]`, env);
            }
            break;
          }
          // declared concurrency (§7.1): bounded batches, isolated var scope
          // per iteration — `let` inside a body stays local to that item
          for (let b = 0; b < cap; b += conc) {
            if (ctx.signal?.aborted) throw new VectorError("cancelled", "program cancelled");
            if (state.returned) return;
            await Promise.all(
              list.slice(b, Math.min(b + conc, cap)).map(async (item, j) => {
                const idx = b + j;
                if (++state.iterationCount > maxIterations)
                  throw new VectorError("step_failed", `iteration budget ${maxIterations} exceeded`);
                const childEnv: Env = { inputs: env.inputs, vars: { ...env.vars } };
                childEnv.vars[node.itemName] = item;
                if (node.indexName) childEnv.vars[node.indexName] = idx;
                await runNodeList(node.body, `${nodeId}[${idx}]`, childEnv);
              }),
            );
          }
          break;
        }
        case "until": {
          let iter = 0;
          const untilDeadline = node.deadlineMs ? Date.now() + node.deadlineMs : undefined;
          while (true) {
            if (ctx.signal?.aborted) throw new VectorError("cancelled", "program cancelled");
            if (++state.iterationCount > maxIterations || ++iter > node.maxIterations)
              throw new VectorError("step_failed", `until loop hit iteration bound ${node.maxIterations}`);
            if (untilDeadline && Date.now() > untilDeadline)
              throw new VectorError("condition_timeout", "until loop deadline exceeded");
            await runNodeList(node.body, `${nodeId}[${iter}]`, env);
            if (state.returned) return;
            if (evalPredicate(node.until, env, ctx.allowEval)) break;
          }
          break;
        }
        case "observe": {
          if (!ctx.observe) throw new VectorError("backend_unavailable", "observe node requires an observation hook");
          const obs = await ctx.observe({ scope: node.scope, subtreeRef: node.subtreeRef });
          env.vars[node.saveAs ?? "observation"] = obs;
          ctx.emit({ ...nodeOutcome(nodeId, "observe", node.scope ?? "full") , stepId: nodeId }, fakeStep(nodeId, "observe"));
          break;
        }
        case "assert": {
          if (!evalPredicate(node.check, env, ctx.allowEval)) {
            const msg = node.message ?? `assert ${nodeId} failed`;
            ctx.emit({ ...nodeOutcome(nodeId, "assert", msg, "failed"), stepId: nodeId }, fakeStep(nodeId, "assert"));
            throw new VectorError("assertion_failed", msg);
          }
          ctx.emit(nodeOutcome(nodeId, "assert"), fakeStep(nodeId, "assert"));
          break;
        }
        case "emit": {
          const value = resolveValue(node.value, env, ctx.allowEval);
          state.emitted.push(value);
          ctx.onEmit?.(node.label, value);
          ctx.emit(nodeOutcome(nodeId, "emit", node.label), fakeStep(nodeId, "emit"));
          break;
        }
        case "checkpoint": {
          const name = node.name ?? nodeId;
          state.checkpoints.push(name);
          ctx.checkpoint?.(name, { inputs: env.inputs, vars: env.vars, emitted: state.emitted });
          ctx.emit(nodeOutcome(nodeId, "checkpoint", name), fakeStep(nodeId, "checkpoint"));
          break;
        }
        case "return": {
          state.returnValue = resolveValue(node.value, env, ctx.allowEval);
          state.returned = true;
          ctx.emit(nodeOutcome(nodeId, "return"), fakeStep(nodeId, "return"));
          return;
        }
        case "call": {
          if (!ctx.callOperation) throw new VectorError("backend_unavailable", "call node requires an operation registry");
          try {
            const args = Object.fromEntries(
              Object.entries(node.args ?? {}).map(([k, v]) => [k, resolveValue(v, env, ctx.allowEval)]),
            );
            const result = await ctx.callOperation(node.operation, args);
            if (node.saveAs) env.vars[node.saveAs] = result;
            ctx.emit(nodeOutcome(nodeId, "call", `${node.operation} ok`), fakeStep(nodeId, "call"));
          } catch (e) {
            ctx.emit(
              { ...nodeOutcome(nodeId, "call", `${node.operation}: ${e instanceof Error ? e.message : e}`, "failed"), stepId: nodeId },
              fakeStep(nodeId, "call"),
            );
            if (!node.optional) throw e;
          }
          break;
        }
      }
    }
  };

  try {
    await runNodeList(program.nodes ?? [], "", env);
    if (resumeAt !== undefined)
      throw new VectorError("not_found", `checkpoint "${program.resumeFrom}" not found among top-level nodes`);
  } catch (e) {
    if (e instanceof VectorError && e.code === "cancelled") {
      return {
        status: "cancelled",
        steps: ctx.outcomes,
        extracted: Object.keys(runner.extracted).length ? runner.extracted : undefined,
        emitted: state.emitted.length ? state.emitted : undefined,
        checkpoints: state.checkpoints.length ? state.checkpoints : undefined,
        error: e.message,
      };
    }
    return {
      status: "failed",
      steps: ctx.outcomes,
      extracted: Object.keys(runner.extracted).length ? runner.extracted : undefined,
      emitted: state.emitted.length ? state.emitted : undefined,
      checkpoints: state.checkpoints.length ? state.checkpoints : undefined,
      error: e instanceof Error ? e.message : String(e),
    };
  }
  return {
    status: "completed",
    steps: ctx.outcomes,
    extracted: Object.keys(runner.extracted).length ? runner.extracted : undefined,
    emitted: state.emitted.length ? state.emitted : undefined,
    returnValue: state.returned ? state.returnValue : undefined,
    checkpoints: state.checkpoints.length ? state.checkpoints : undefined,
  };
}

const nodeIdOf = (node: ProgramNode, i: number): string => {
  switch (node.kind) {
    case "step": return node.step.id;
    case "let": return `let:${node.name}`;
    case "call": return `call:${node.operation}`;
    case "observe": return `observe`;
    case "emit": return `emit:${node.label ?? i}`;
    case "checkpoint": return `checkpoint:${node.name ?? i}`;
    default: return `${node.kind}#${i}`;
  }
};

/** Node-level ledger rows reuse the StepOutcome shape; the placeholder
 * step carries the node kind so the ledger reads `forEach`/`call`/`emit`
 * rather than a misleading browser op. It never reaches validation. */
const fakeStep = (id: string, kind: string): Step => ({ id, op: kind } as unknown as Step);
