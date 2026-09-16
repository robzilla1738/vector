import {
  VectorError,
  type Condition,
  type ObservationContent,
  type ObservationRequest,
  type Program,
  type ProgramResult,
  type Step,
  type StepOutcome,
} from "@vector/contracts";
import type { DriverPage } from "@vector/browser-driver";

export interface ExecContext {
  runId?: string;
  signal?: AbortSignal;
  /**
   * Act-and-observe on the zero-IPC path: when the page implements
   * `executeProgram`, the observation is taken in the same backend call and
   * returned as `observation` on the result. Ignored by the per-step path.
   */
  returnObservation?: Partial<ObservationRequest>;
  onStep?: (outcome: StepOutcome, step: Step) => void;
  /** artifacts captured during execution are reported here */
  onArtifact?: (label: string, buffer: Buffer, mediaType: string) => string | undefined;
  /** control-flow interpreter hooks (Program.nodes) */
  onEmit?: (label: string | undefined, value: unknown) => void;
  onNode?: (info: { kind: string; id: string; detail?: string }) => void;
  observe?: (req: {
    scope?: "full" | "forms" | "links" | "tables" | "subtree";
    subtreeRef?: string;
  }) => Promise<unknown>;
  callOperation?: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  checkpoint?: (name: string, env: Record<string, unknown>) => void;
  loadCheckpoint?: (name: string) =>
    | { inputs?: Record<string, unknown>; vars?: Record<string, unknown>; emitted?: unknown[] }
    | undefined;
  /**
   * Trusted-source escape hatch: enables the `evaluate` op, `expression`
   * wait/expect conditions, and interpreter `{eval:}` expressions. Defaults
   * to false — model-authored plans can never reach page JS (P0-1).
   */
  allowEval?: boolean;
  /** called before every dispatched step — throw to abort (e.g. takeover epoch) */
  checkValid?: () => void;
}

const stepInputs = (s: Step): Record<string, unknown> => {
  const { id, op, timeoutMs, optional, expect, ...rest } = s as Record<string, unknown>;
  return rest;
};

/** Reject page-JS surfaces unless the program came from a trusted source. */
function assertEvalAllowed(step: Step, allowEval: boolean) {
  if (allowEval) return;
  const usesExpression = (c: Condition | undefined) => c?.kind === "expression";
  if (
    step.op === "evaluate" ||
    (step.op === "waitFor" && usesExpression(step.condition)) ||
    (step.expect ?? []).some((c) => usesExpression(c as Condition))
  ) {
    throw new VectorError("invalid_params", `step ${step.id}: page JS (evaluate/expression) is disabled for this program source`);
  }
}

async function runStep(page: DriverPage, s: Step): Promise<Record<string, unknown> | undefined> {
  switch (s.op) {
    case "navigate": return void (await page.navigate(s.url, s.timeoutMs));
    case "back": return void (await page.back(s.timeoutMs));
    case "forward": return void (await page.forward(s.timeoutMs));
    case "reload": return void (await page.reload(s.timeoutMs));
    case "stop": return void (await page.stop());
    case "click": return void (await page.click(s.target, s.button, s.timeoutMs));
    case "dblclick": return void (await page.dblclick(s.target, s.timeoutMs));
    case "hover": return void (await page.hover(s.target, s.timeoutMs));
    case "fill": return void (await page.fill(s.target, s.value, s.timeoutMs));
    case "type": return void (await page.typeText(s.target, s.value, s.delayMs, s.timeoutMs));
    case "press": return void (await page.press(s.key, s.target, s.timeoutMs));
    case "check": return void (await page.check(s.target, s.timeoutMs));
    case "uncheck": return void (await page.uncheck(s.target, s.timeoutMs));
    case "select": return void (await page.select(s.target, s.value, s.timeoutMs));
    case "scroll": return void (await page.scroll({ target: s.target, direction: s.direction, amount: s.amount }));
    case "dragTo": return void (await page.dragTo(s.target, s.to, s.timeoutMs));
    case "clickPoint": return void (await page.clickPoint(s.x, s.y, s.button));
    case "upload": return void (await page.uploadFiles(s.target, s.files, s.timeoutMs));
    case "waitFor": {
      const res = await page.waitFor(s.condition);
      if (!res.ok) throw new VectorError("condition_timeout", res.detail ?? `condition ${s.condition.kind} failed`);
      return { detail: res.detail };
    }
    case "screenshot": {
      const shot = await page.screenshot({ fullPage: s.fullPage });
      return { screenshot: shot.buffer, width: shot.width, height: shot.height, label: s.artifact ?? "screenshot" };
    }
    case "extract": return { extracted: await page.extract(s.fields) };
    case "expectDownload": {
      const res = await page.waitForDownload(s.timeoutMs ?? 30_000);
      return { downloaded: res.suggestedFilename, path: res.path };
    }
    case "dialog": return void (await page.handleDialog(s.action, s.promptText));
    case "collectScroll": {
      const res = await page.collectScroll({
        item: s.item,
        container: s.container,
        key: s.key,
        fields: s.fields,
        limit: s.limit,
        maxScrolls: s.maxScrolls,
        settleMs: s.settleMs,
      });
      return { extracted: { items: res.items, count: res.collected } };
    }
    case "evaluate": {
      const value = await page.evaluate(s.expression);
      // `as` binds the return into extracted — the full JSON value, not the
      // 300-char detail preview (session-request impls ride on this). The
      // runner nests this map under `as` itself, so return it unkeyed.
      const ex = value !== null && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : { value };
      return { value, extracted: ex };
    }
  }
}

/**
 * Per-page step runner shared by the flat path and the node interpreter.
 * Owns the extracted map, artifact ids, and the expectDownload pair fusion.
 */
export function makeStepRunner(page: DriverPage, ctx: ExecContext = {}) {
  const extracted: Record<string, unknown> = {};
  const artifactIds: string[] = [];

  const runOne = async (step: Step): Promise<StepOutcome> => {
    const startedAt = Date.now();
    try {
      ctx.checkValid?.();
      assertEvalAllowed(step, ctx.allowEval ?? false);
      const detail = await runStep(page, step);
      // verify post-conditions
      if (step.expect) {
        for (const cond of step.expect as Condition[]) {
          const res = await page.waitFor(cond);
          if (!res.ok)
            throw new VectorError("condition_timeout", `expect ${cond.kind} failed: ${res.detail ?? ""}`);
        }
      }
      const outcome: StepOutcome = {
        stepId: step.id,
        op: step.op,
        status: "ok",
        startedAt,
        durationMs: Date.now() - startedAt,
        effect: step.expect?.length ? "confirmed" : "observed",
        receipt: {
          observed: undefined,
          remoteConfirmed: Boolean(step.expect?.length),
          uncertain: !step.expect?.length && ["click", "fill", "type", "select", "check", "uncheck"].includes(step.op),
          dispatchedBeforeTakeover: false,
          identity: {
            pageId: page.identity.pageId,
            documentEpoch: 0,
            target: "target" in step ? String(step.target) : undefined,
          },
        },
      };
      if (detail) {
        const d = detail as Record<string, unknown>;
        if (d["extracted"]) {
          outcome.extracted = d["extracted"] as Record<string, unknown>;
          const key = "as" in step && step.as ? step.as : "fields";
          extracted[key] = outcome.extracted;
        }
        if (d["screenshot"] instanceof Buffer && ctx.onArtifact) {
          const id = ctx.onArtifact(String(d["label"] ?? "screenshot"), d["screenshot"] as Buffer, "image/png");
          if (id) artifactIds.push(id);
        }
        if (d["downloaded"]) outcome.detail = `downloaded ${d["downloaded"]}`;
        if (d["value"] !== undefined) outcome.detail = JSON.stringify(d["value"])?.slice(0, 300);
        if (d["detail"]) outcome.detail = String(d["detail"]);
      }
      return outcome;
    } catch (e) {
      const code = e instanceof VectorError ? e.code : "step_failed";
      return {
        stepId: step.id,
        op: step.op,
        status: "failed",
        startedAt,
        durationMs: Date.now() - startedAt,
        error: { code, message: e instanceof Error ? e.message : String(e) },
      };
    }
  };

  const failedUnlessOptional = (outcome: StepOutcome, step: Step) =>
    outcome.status === "failed" && !step.optional
      ? {
          status: (ctx.signal?.aborted ? "cancelled" : "failed") as ProgramResult["status"],
          error: outcome.error?.message,
        }
      : undefined;

  /**
   * expectDownload arms the waiter, runs the FOLLOWING step (the trigger),
   * then resolves the landed file. A bare sequential wait can never observe
   * a download — nothing has run to cause one yet.
   */
  const runDownloadPair = async (
    dlStep: Step,
    trigger: Step,
    emit: (o: StepOutcome, s: Step) => void,
  ): Promise<{ early?: { status: ProgramResult["status"]; error?: string } }> => {
    const dlStarted = Date.now();
    const dlWait = page.waitForDownload(dlStep.timeoutMs ?? 30_000);
    const trigOutcome = await runOne(trigger);
    emit(trigOutcome, trigger);
    if (trigOutcome.status === "failed" && !trigger.optional) {
      return { early: { status: ctx.signal?.aborted ? "cancelled" : "failed", error: trigOutcome.error?.message } };
    }
    let dlOutcome: StepOutcome;
    try {
      const res = await dlWait;
      dlOutcome = {
        stepId: dlStep.id,
        op: dlStep.op,
        status: "ok",
        startedAt: dlStarted,
        durationMs: Date.now() - dlStarted,
        detail: `downloaded ${res.suggestedFilename}`,
        extracted: { downloaded: res.suggestedFilename, path: res.path },
      };
    } catch (e) {
      dlOutcome = {
        stepId: dlStep.id,
        op: dlStep.op,
        status: "failed",
        startedAt: dlStarted,
        durationMs: Date.now() - dlStarted,
        error: { code: e instanceof VectorError ? e.code : "step_failed", message: e instanceof Error ? e.message : String(e) },
      };
    }
    emit(dlOutcome, dlStep);
    const early = failedUnlessOptional(dlOutcome, dlStep);
    if (early) return { early: { status: early.status, error: early.error } };
    return {};
  };

  return { runOne, runDownloadPair, failedUnlessOptional, extracted, artifactIds };
}

/**
 * Execute a validated program against one page. Flat `steps` run
 * sequentially; `nodes` (control flow) delegate to the interpreter.
 */
export async function executeProgram(
  page: DriverPage,
  program: Program,
  ctx: ExecContext = {},
): Promise<ProgramResult & { observation?: ObservationContent }> {
  if (program.pageId !== page.identity.pageId) {
    throw new VectorError(
      "invalid_params",
      `program targets ${program.pageId} but page is ${page.identity.pageId}`,
    );
  }
  const runner = makeStepRunner(page, ctx);
  const outcomes: StepOutcome[] = [];
  const emit = (o: StepOutcome, s: Step) => {
    outcomes.push(o);
    ctx.onStep?.(o, s);
  };

  if (program.nodes?.length) {
    const { executeNodes } = await import("./interpreter.js");
    return executeNodes(program, runner, {
      page,
      signal: ctx.signal,
      outcomes,
      emit,
      onEmit: ctx.onEmit,
      onNode: ctx.onNode,
      observe: ctx.observe,
      callOperation: ctx.callOperation,
      checkpoint: ctx.checkpoint,
      loadCheckpoint: ctx.loadCheckpoint,
      allowEval: ctx.allowEval ?? false,
    });
  }

  const steps = program.steps ?? [];
  const seen = new Set<string>();
  for (const s of steps) {
    if (seen.has(s.id)) throw new VectorError("invalid_params", `duplicate step id ${s.id}`);
    seen.add(s.id);
  }

  // Zero-IPC path (architecture §11): hand the whole flat step list to the
  // backend in one call. Trust checks run up front exactly as the per-step
  // runner would apply them; the expectDownload pair needs the local waiter
  // fusion, so such programs stay on the per-step path.
  if (page.executeProgram && steps.length && !steps.some((s) => s.op === "expectDownload")) {
    for (const s of steps) assertEvalAllowed(s, ctx.allowEval ?? false);
    ctx.checkValid?.();
    const res = await page.executeProgram(steps, { signal: ctx.signal, returnObservation: ctx.returnObservation });
    const byId = new Map(steps.map((s) => [s.id, s]));
    for (const o of res.steps) {
      const step = byId.get(o.stepId);
      if (step) emit(o, step);
      else outcomes.push(o);
    }
    const out: ProgramResult & { observation?: ObservationContent } = {
      status: ctx.signal?.aborted && res.status === "completed" ? "cancelled" : res.status,
      steps: outcomes,
      extracted: res.extracted && Object.keys(res.extracted).length ? res.extracted : undefined,
      error: res.error,
    };
    if (res.fallback) out.fallback = res.fallback;
    if (res.observation) out.observation = res.observation;
    return out;
  }

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!;
    if (ctx.signal?.aborted) {
      emit({ stepId: step.id, op: step.op, status: "skipped", startedAt: Date.now(), durationMs: 0 }, step);
      continue;
    }
    if (step.op === "expectDownload") {
      const trigger = steps[i + 1];
      if (!trigger) {
        emit(
          {
            stepId: step.id,
            op: step.op,
            status: "failed",
            startedAt: Date.now(),
            durationMs: 0,
            error: { code: "invalid_params", message: "expectDownload must precede the step that triggers the download" },
          },
          step,
        );
        return { status: "failed", steps: outcomes, error: "expectDownload must precede the trigger step" };
      }
      const { early } = await runner.runDownloadPair(step, trigger, emit);
      i++;
      if (early) return { status: early.status, steps: outcomes, extracted: hasKeys(runner.extracted), error: early.error };
      continue;
    }
    const outcome = await runner.runOne(step);
    emit(outcome, step);
    const early = runner.failedUnlessOptional(outcome, step);
    if (early) return { status: early.status, steps: outcomes, extracted: hasKeys(runner.extracted), error: early.error };
  }
  return {
    status: ctx.signal?.aborted ? "cancelled" : "completed",
    steps: outcomes,
    extracted: hasKeys(runner.extracted),
  };
}

const hasKeys = (r: Record<string, unknown>) => (Object.keys(r).length ? r : undefined);
