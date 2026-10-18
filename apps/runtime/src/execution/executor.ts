import type { ValidatedTaskRead } from "@aux/contracts";
import {
  AuxError,
  type AuthorizationProvenance,
  type Condition,
  type FinalReviewArtifact,
  type ObservationContent,
  type ObservationScope,
  type Program,
  type ProgramResult,
  type Step,
  type StepOutcome,
} from "@aux/contracts";
import type { DriverPage } from "@aux/chromium-driver";
import { readFile, stat } from "node:fs/promises";
import { basename } from "node:path";
import { isConsequential } from "../agent/permissions.js";

/** Driver implementations expose the document epoch as either a value or method. */
function pageDocumentEpoch(page: DriverPage): number | undefined {
  const p = page as unknown as { documentEpoch?: number | (() => number); epoch?: number | (() => number) };
  if (typeof p.documentEpoch === "function") return p.documentEpoch();
  if (typeof p.documentEpoch === "number") return p.documentEpoch;
  if (typeof p.epoch === "function") return p.epoch();
  return typeof p.epoch === "number" ? p.epoch : undefined;
}

export interface ExecContext {
  /** Original private workflow target proofs in exact program step order. */
  targetPreconditions?: readonly import("@aux/chromium-driver").ObservedActionTarget[];
  /** Private sealed producer context. Never accepted from program/tool input. */
  linkedInPrecondition?: import("@aux/contracts/linkedin").LinkedInActionPrecondition;
  linkedInCapture?: import("@aux/chromium-driver").ContextActionCapture;
  runId?: string;
  resumeStep?: (step: Step) => StepOutcome | undefined;
  isStepApplied?: (step: Step) => boolean;
  beforeDispatch?: (step: Step) => void;
  settleStep?: (outcome: StepOutcome, step: Step) => void;
  journalPerStep?: boolean;
  signal?: AbortSignal;
  onStep?: (outcome: StepOutcome, step: Step) => void;
  /** artifacts captured during execution are reported here */
  onArtifact?: (label: string, buffer: Buffer, mediaType: string) => string | undefined;
  /** control-flow interpreter hooks (Program.nodes) */
  onEmit?: (label: string | undefined, value: unknown) => void;
  onNode?: (info: { kind: string; id: string; detail?: string }) => void;
  observe?: (req: { scope?: ObservationScope; subtreeRef?: string }) => Promise<unknown>;
  callOperation?: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  checkpoint?: (name: string, env: Record<string, unknown>) => void;
  loadCheckpoint?: (
    name: string,
  ) => { inputs?: Record<string, unknown>; vars?: Record<string, unknown>; emitted?: unknown[] } | undefined;
  /**
   * Trusted-source escape hatch: enables the `evaluate` op, `expression`
   * wait/expect conditions, and interpreter `{eval:}` expressions. Defaults
   * to false — model-authored plans can never reach page JS (P0-1).
   */
  allowEval?: boolean;
  /** abort if the page controller changed mid-program */
  checkValid?: () => void;
  /** Recheck task authority after lane waits, immediately before journaling and dispatch. */
  beforeJournal?: () => void;
  /** Internal actual task/Set page-lease producer; never parsed from tool input. */
  sourcePageCheck?: () => void;
  /** Internal current TaskService read proof; never accepted from program input. */
  taskRead?: ValidatedTaskRead;
  /** Recheck live target origin and current grants immediately before dispatch. */
  authorizeStep?: (step: Step) => Promise<AuthorizationProvenance | void>;
  /** Trusted final target admission after all asynchronous preparation. */
  dispatchStep?: <T>(step: Step, execute: () => Promise<T>) => Promise<T>;
  navigate?: (url: string, timeoutMs?: number) => Promise<void>;
  /** Private native navigation producer: returns only after original receipt,
   * retirement and fresh native attachment/install ACKs. Never tool input. */
  navigateAndReadmit?: (url: string, timeoutMs?: number) => Promise<DriverPage>;
  /** Trusted supervised reader returns held bytes; the driver never reopens a pathname. */
  uploadRead?: (path: string) => Promise<Buffer>;
  safety?: {
    turnId?: string;
    threadId?: string;
    turnToolCallCount?: number;
    steps?: Record<
      string,
      {
        approvalId?: string;
        review?: FinalReviewArtifact;
        sensitiveData?: boolean;
        restrictedRetry?: boolean;
      }
    >;
  };
  /** saved task that authorized this run, used to scope vault grants */
  taskId?: string;
  /** Saved task revision that authorized this direct program. */
  taskRevision?: number;
  /**
   * True when the caller already persisted a DurableWriteLedger intent for
   * this program. Direct API/CLI/terminal execute leaves this unset so
   * PageService journals before dispatch.
   */
  journaled?: boolean;
  /** Durable intent created by the caller for every consequential program step. */
  journalIntentId?: string;
  /** Chromium's Profile password manager handles selection, approval, and fill. */
  fillSavedPassword?: (request: {
    pageId: string;
    expectedUrl: string;
    passwordSelector: string;
    usernameSelector?: string;
  }) => Promise<{ status: "filled" | "unavailable" | "target_changed" | "permission_denied" | "cancelled" }>;
  pageOrigin?: string;
}

/** Ops whose target state is recorded as the ledger's before-state (S4). */
const SETTER_OPS = new Set(["fill", "type", "check", "uncheck", "select"]);

/** `javascript:` and `vbscript:` navigations run script in the current page. */
function isActiveScriptUrl(url: string): boolean {
  try {
    const scheme = new URL(url).protocol;
    return scheme === "javascript:" || scheme === "vbscript:";
  } catch {
    return false;
  }
}

/** Reject page-JS surfaces unless the program came from a trusted source. */
function assertEvalAllowed(step: Step, allowEval: boolean) {
  if (allowEval) return;
  const usesExpression = (c: Condition | undefined) => c?.kind === "expression";
  if (
    step.op === "evaluate" ||
    (step.op === "navigate" && isActiveScriptUrl(step.url)) ||
    (step.op === "waitFor" && usesExpression(step.condition)) ||
    (step.expect ?? []).some((c) => usesExpression(c as Condition))
  ) {
    throw new AuxError(
      "invalid_params",
      `step ${step.id}: page JS (evaluate/expression) is disabled for this program source`,
    );
  }
}

/**
 * 01's named retry policy (S4): `target_detached` resolution failures get one
 * re-resolve after an `interactive` settle — the code is raised before any
 * input reaches the page, so a retry can never replay a dispatched write
 * ("never replay uncertain input"). `ref_stale` is deliberately absent: it
 * marks a real document-epoch change that only a fresh observation fixes.
 */
const RETRYABLE_RESOLUTION_CODES = new Set(["target_detached"]);

async function runStep(
  page: DriverPage,
  s: Step,
  ctx: ExecContext = {},
): Promise<Record<string, unknown> | undefined> {
  switch (s.op) {
    case "navigate":
      return void (await (ctx.navigate
        ? ctx.navigate(s.url, s.timeoutMs)
        : page.navigate(s.url, s.timeoutMs)));
    case "back":
      return void (await page.back(s.timeoutMs));
    case "forward":
      return void (await page.forward(s.timeoutMs));
    case "reload":
      return void (await page.reload(s.timeoutMs));
    case "stop":
      return void (await page.stop());
    case "click":
      return void (await page.click(s.target, s.button, s.timeoutMs));
    case "dblclick":
      return void (await page.dblclick(s.target, s.timeoutMs));
    case "hover":
      return void (await page.hover(s.target, s.timeoutMs));
    case "fill":
      return void (await page.fill(s.target, s.value, s.timeoutMs));
    case "fillCredential": {
      if (!ctx.fillSavedPassword)
        throw new AuxError("backend_unavailable", "The browser password manager is unavailable.");
      const result = await ctx.fillSavedPassword({
        pageId: page.identity.pageId,
        expectedUrl: page.url(),
        passwordSelector: s.passwordSelector,
        ...(s.usernameSelector ? { usernameSelector: s.usernameSelector } : {}),
      });
      if (result.status === "filled") return { detail: "Saved password filled after browser approval" };
      if (result.status === "target_changed")
        throw new AuxError("conflict", "The active login page changed during password fill.");
      if (result.status === "unavailable")
        throw new AuxError("needs_input", "No saved password is available for this site.");
      if (result.status === "permission_denied")
        throw new AuxError("permission_denied", "The browser denied password fill on this page.");
      throw new AuxError("needs_input", "Password fill was not approved in the browser.");
    }
    case "type":
      return void (await page.typeText(s.target, s.value, s.delayMs, s.timeoutMs));
    case "press":
      return void (await page.press(s.key, s.target, s.timeoutMs));
    case "check":
      return void (await page.check(s.target, s.timeoutMs));
    case "uncheck":
      return void (await page.uncheck(s.target, s.timeoutMs));
    case "select":
      return void (await page.select(s.target, s.value, s.timeoutMs));
    case "scroll":
      return void (await page.scroll({ target: s.target, direction: s.direction, amount: s.amount }));
    case "dragTo":
      return void (await page.dragTo(s.target, s.to, s.timeoutMs));
    case "clickPoint":
      return void (await page.clickPoint(s.x, s.y, s.button));
    case "upload": {
      if (!ctx.uploadRead)
        throw new AuxError("permission_denied", "Supervised upload access is unavailable.");
      const files = [];
      for (const path of s.files) {
        const buffer = await ctx.uploadRead(path);
        files.push({ name: basename(path), mimeType: "application/octet-stream", buffer });
      }
      ctx.checkValid?.();
      ctx.beforeJournal?.();
      return void (await page.uploadFiles(s.target, files, s.timeoutMs));
    }
    case "waitFor": {
      const res = await page.waitFor(s.condition);
      if (!res.ok)
        throw new AuxError("condition_timeout", res.detail ?? `condition ${s.condition.kind} failed`);
      return { detail: res.detail };
    }
    case "screenshot": {
      const shot = await page.screenshot({ fullPage: s.fullPage });
      return {
        screenshot: shot.buffer,
        width: shot.width,
        height: shot.height,
        label: s.artifact ?? "screenshot",
      };
    }
    case "extract":
      return { extracted: await page.extract(s.fields) };
    case "expectDownload": {
      const res = await page.waitForDownload(s.timeoutMs ?? 30_000);
      return { downloaded: res.suggestedFilename, path: res.path };
    }
    case "dialog":
      return void (await page.handleDialog(s.action, s.promptText));
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
      const ex =
        value !== null && typeof value === "object" && !Array.isArray(value)
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
    let dispatched = false;
    const mutating = isConsequential(step.op);
    const actionUrl = mutating ? page.url() : undefined;
    let authorization: AuthorizationProvenance | void = undefined;
    // Before-state for setter steps: read the control before dispatch so the
    // ledger records what the write replaced (S4). A failed read never blocks.
    let before: Record<string, unknown> | undefined;
    let pageUrl: string | undefined;
    let beforeEpoch: number | undefined;
    try {
      ctx.checkValid?.();
      assertEvalAllowed(step, ctx.allowEval ?? false);
      const resumed = ctx.resumeStep?.(step);
      if (resumed) return resumed;
      authorization = await ctx.authorizeStep?.(step);
      ctx.checkValid?.();
      if (SETTER_OPS.has(step.op) && page.fieldState && "target" in step && step.target) {
        pageUrl = page.url();
        beforeEpoch = pageDocumentEpoch(page);
        before = await page.fieldState(String(step.target)).catch(() => undefined);
      }
      if ((step.op === "fill" || step.op === "type") && before && "selected" in before)
        throw new AuxError("invalid_params", `step ${step.id}: use select for a select control`);
      ctx.checkValid?.();
      const dispatch = async () => {
        ctx.checkValid?.();
        ctx.beforeJournal?.();
        ctx.beforeDispatch?.(step);
        dispatched = true;
        return step.op === "navigate" && ctx.navigateAndReadmit
          ? await (async () => {
              const original = page;
              const replacement = await ctx.navigateAndReadmit!(step.url, step.timeoutMs);
              if (ctx.signal?.aborted)
                throw new AuxError(
                  "cancelled",
                  "Navigation was cancelled before admitting its new attachment.",
                );
              if (
                replacement === original ||
                !replacement.isAttached() ||
                replacement.identity.pageId !== original.identity.pageId ||
                replacement.identity.backend !== original.identity.backend
              )
                throw new AuxError(
                  "ref_stale",
                  "Navigation did not produce a fresh attachment for this same page.",
                );
              ctx.checkValid?.();
              page = replacement;
              return undefined;
            })()
          : await runStep(page, step, ctx).catch(async (e) => {
              const code = e instanceof AuxError ? e.code : undefined;
              if (
                ctx.targetPreconditions ||
                !code ||
                !RETRYABLE_RESOLUTION_CODES.has(code) ||
                ctx.signal?.aborted
              )
                throw e;
              await page
                .waitFor({ kind: "settled", policy: "interactive" })
                .catch(() => ({ ok: false, timedOut: false }));
              ctx.checkValid?.();
              return runStep(page, step, ctx);
            });
      };
      const detail = ctx.dispatchStep ? await ctx.dispatchStep(step, dispatch) : await dispatch();
      // verify post-conditions
      if (step.expect) {
        for (const cond of step.expect as Condition[]) {
          const res = await page.waitFor(cond);
          if (!res.ok)
            throw new AuxError("condition_timeout", `expect ${cond.kind} failed: ${res.detail ?? ""}`);
        }
      }
      ctx.checkValid?.();
      const after =
        before &&
        page.fieldState &&
        pageUrl === page.url() &&
        beforeEpoch === pageDocumentEpoch(page) &&
        "target" in step &&
        step.target
          ? await page.fieldState(String(step.target)).catch(() => undefined)
          : undefined;
      const postconditions = (step.expect as Condition[] | undefined) ?? [];
      const navigationObserved = mutating && actionUrl !== undefined && page.url() !== actionUrl;
      const setterObserved =
        mutating &&
        before !== undefined &&
        after !== undefined &&
        JSON.stringify(before) !== JSON.stringify(after);
      const observed = postconditions.length > 0 || navigationObserved || setterObserved;
      const outcome: StepOutcome = {
        stepId: step.id,
        op: step.op,
        status: "ok",
        startedAt,
        durationMs: Date.now() - startedAt,
        ...(authorization ? { authorization } : {}),
        ...(before ? { before } : {}),
        ...(after ? { after } : {}),
        ...(pageUrl ? { pageUrl } : {}),
        effect: observed ? "observed" : mutating ? "uncertain" : "observed",
        receipt: {
          observed: postconditions.length
            ? `postconditions satisfied: ${postconditions.map((condition) => condition.kind).join(", ")}`
            : navigationObserved
              ? "page URL changed after action"
              : setterObserved
                ? "control value changed after action"
                : undefined,
          // A DOM condition proves browser state. Only explicit backend or
          // network evidence may claim remote business-system confirmation.
          remoteConfirmed: false,
          uncertain: mutating && !observed,
          unconfirmed: false,
          dispatchedBeforeTakeover: false,
          identity: {
            pageId: page.identity.pageId,
            documentEpoch: pageDocumentEpoch(page) ?? 0,
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
          const id = ctx.onArtifact(
            String(d["label"] ?? "screenshot"),
            d["screenshot"] as Buffer,
            "image/png",
          );
          if (id) artifactIds.push(id);
        }
        if (d["downloaded"]) outcome.detail = `downloaded ${d["downloaded"]}`;
        if (d["value"] !== undefined) outcome.detail = JSON.stringify(d["value"])?.slice(0, 300);
        if (d["detail"]) outcome.detail = String(d["detail"]);
        if (outcome.receipt) outcome.receipt.observed = outcome.detail;
      }
      return outcome;
    } catch (e) {
      const code = e instanceof AuxError ? e.code : "step_failed";
      if (
        e instanceof AuxError &&
        e.code === "ref_stale" &&
        (e.detail as { browserInputDispatched?: boolean } | undefined)?.browserInputDispatched === false
      )
        dispatched = false;
      const takenOver = dispatched && code === "conflict" && isConsequential(step.op);
      // A failed postcondition must remain a failed step, but it must not
      // erase independent evidence that the dispatched action navigated.
      // In particular, a Save button can disappear after a successful save.
      const navigationObserved =
        dispatched &&
        code === "condition_timeout" &&
        mutating &&
        actionUrl !== undefined &&
        page.url() !== actionUrl;
      return {
        stepId: step.id,
        op: step.op,
        status: "failed",
        startedAt,
        durationMs: Date.now() - startedAt,
        error: { code, message: e instanceof Error ? e.message : String(e) },
        ...(authorization ? { authorization } : {}),
        ...(before ? { before } : {}),
        ...(pageUrl ? { pageUrl } : {}),
        ...(!dispatched
          ? { effect: "authorized" as const }
          : {
              effect: "uncertain" as const,
              receipt: {
                remoteConfirmed: false,
                uncertain: true,
                unconfirmed: false,
                dispatchedBeforeTakeover: false,
              },
            }),
        ...(navigationObserved
          ? {
              effect: "observed" as const,
              receipt: {
                observed: "page URL changed after action",
                remoteConfirmed: false,
                uncertain: false,
                unconfirmed: false,
                dispatchedBeforeTakeover: false,
              },
            }
          : takenOver
            ? {
                effect: "uncertain" as const,
                receipt: {
                  remoteConfirmed: false,
                  uncertain: true,
                  unconfirmed: false,
                  dispatchedBeforeTakeover: true,
                },
              }
            : {}),
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
    const waiterAbort = new AbortController();
    const cancelWait = () => waiterAbort.abort();
    ctx.signal?.addEventListener("abort", cancelWait, { once: true });
    if (ctx.signal?.aborted) cancelWait();
    const dlWait = page.waitForDownload(dlStep.timeoutMs ?? 30_000, waiterAbort.signal);
    // The trigger may take longer than the download wait. Observe rejection
    // immediately so a failed trigger cannot leave an unhandled promise.
    void dlWait.catch(() => {});
    try {
      const trigOutcome = await runOne(trigger);
      if (trigOutcome.status === "failed" && !trigger.optional) {
        emit(trigOutcome, trigger);
        cancelWait();
        return {
          early: { status: ctx.signal?.aborted ? "cancelled" : "failed", error: trigOutcome.error?.message },
        };
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
          extracted: await downloadExtract(res.suggestedFilename, res.path),
        };
        if (trigOutcome.status === "ok") {
          trigOutcome.effect = "observed";
          trigOutcome.receipt = {
            remoteConfirmed: false,
            dispatchedBeforeTakeover: false,
            ...trigOutcome.receipt,
            observed: `downloaded ${res.suggestedFilename}`,
            uncertain: false,
          };
        }
      } catch (e) {
        dlOutcome = {
          stepId: dlStep.id,
          op: dlStep.op,
          status: "failed",
          startedAt: dlStarted,
          durationMs: Date.now() - dlStarted,
          error: {
            code: e instanceof AuxError ? e.code : "step_failed",
            message: e instanceof Error ? e.message : String(e),
          },
        };
      }
      emit(trigOutcome, trigger);
      emit(dlOutcome, dlStep);
      const early = failedUnlessOptional(dlOutcome, dlStep);
      if (early) return { early: { status: early.status, error: early.error } };
      return {};
    } finally {
      cancelWait();
      ctx.signal?.removeEventListener("abort", cancelWait);
    }
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
    throw new AuxError(
      "invalid_params",
      `program targets ${program.pageId} but page is ${page.identity.pageId}`,
    );
  }
  const runner = makeStepRunner(page, ctx);
  const outcomes: StepOutcome[] = [];
  const emit = (o: StepOutcome, s: Step) => {
    ctx.settleStep?.(o, s);
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
    if (seen.has(s.id)) throw new AuxError("invalid_params", `duplicate step id ${s.id}`);
    seen.add(s.id);
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
            error: {
              code: "invalid_params",
              message: "expectDownload must precede the step that triggers the download",
            },
          },
          step,
        );
        return { status: "failed", steps: outcomes, error: "expectDownload must precede the trigger step" };
      }
      const { early } = await runner.runDownloadPair(step, trigger, emit);
      i++;
      if (early)
        return {
          status: early.status,
          steps: outcomes,
          extracted: hasKeys(runner.extracted),
          error: early.error,
        };
      continue;
    }
    const outcome = await runner.runOne(step);
    emit(outcome, step);
    const early = runner.failedUnlessOptional(outcome, step);
    if (early)
      return {
        status: early.status,
        steps: outcomes,
        extracted: hasKeys(runner.extracted),
        error: early.error,
      };
  }
  return {
    status: ctx.signal?.aborted ? "cancelled" : "completed",
    steps: outcomes,
    extracted: hasKeys(runner.extracted),
  };
}

const hasKeys = (r: Record<string, unknown>) => (Object.keys(r).length ? r : undefined);

/** Small text downloads (CSV/JSON/TXT ≤64KB) carry a preview so the planner can read them without another trip. */
export async function downloadExtract(filename: string, path?: string): Promise<Record<string, unknown>> {
  const out: Record<string, unknown> = { downloaded: filename, path };
  if (!path || !/\.(csv|tsv|json|txt|md|xml|log|ics)$/i.test(filename)) return out;
  try {
    if ((await stat(path)).size > 64 * 1024) return out;
    const text = await readFile(path, "utf8");
    if (!text.includes("\0")) out.text = text;
  } catch {
    /* file moved or unreadable — filename is still the receipt */
  }
  return out;
}
