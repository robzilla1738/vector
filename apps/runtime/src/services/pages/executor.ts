import { checkNightShiftDispatch } from "../../features/overnight-review/service.js";
import {
  AuxError,
  isElementRef,
  type Condition,
  type Observation,
  type ObservationContent,
  type Program,
  type ProgramNode,
  type ProgramResult,
  type Step,
  type StepRecord,
  type SavedCredentialTarget,
  SavedCredentialTargetSchema,
  newStepId,
} from "@aux/contracts";
import { beginConsequentialWrite, settleWrite } from "../../agent/durable.js";
import { isReadOnlyProfile, authorizeProfileProgram, classifyStep } from "../../agent/permissions.js";
import { type ExecContext, executeProgram } from "../../execution/executor.js";
import { secureCredentialHandoff } from "../../safety/credential-handoff.js";
import type { ControlAuthority } from "./control.js";
import type { PageLanes } from "./lanes.js";
import type { ObservationService } from "./observation.js";
import type { PageRegistry } from "./registry.js";
import type { ExecuteResult, ObserveReq } from "./types.js";

/** Ops that dispatch trusted input — they need a visible, laid-out view. */
const INTERACTIVE_OPS = new Set([
  "click",
  "dblclick",
  "hover",
  "press",
  "type",
  "fill",
  "fillCredential",
  "check",
  "uncheck",
  "select",
  "scroll",
  "dragTo",
  "clickPoint",
]);

/** Ops whose success IS a verification — they prove state, not just dispatch. */
const VERIFY_OPS = new Set(["expect", "assert", "waitFor", "expectDownload", "expectNavigation", "extract"]);

export class ProgramExecutor {
  constructor(
    private pages: PageRegistry,
    private lanes: PageLanes,
    private observation: ObservationService,
    private control: ControlAuthority,
  ) {}

  /** Wait until a condition holds — one `waitFor` program step. */
  async waitFor(
    pageId: string,
    condition: Condition,
  ): Promise<{
    ok: boolean;
    timedOut: boolean;
    detail?: string;
    status?: string;
  }> {
    const result = await this.execute({
      pageId,
      steps: [{ id: newStepId(), op: "waitFor", condition }],
    });
    const step = result.steps[0];
    return {
      ok: result.status === "completed",
      timedOut: step?.error?.code === "condition_timeout",
      detail: step?.detail ?? step?.error?.message,
      status: result.status,
    };
  }

  // ---------- execution ----------

  /**
   * Run a program. `opts.returnObservation` observes the page after the
   * program in a follow-up observe on the same lane.
   */
  async execute(
    program: Program,
    ctx: ExecContext = {},
    opts: { returnObservation?: ObserveReq } = {},
  ): Promise<ExecuteResult> {
    const pageId = program.pageId;
    ctx.sourcePageCheck?.();
    const sourceRun = ctx.runId ? this.pages.deps.repo.getRun(ctx.runId) : undefined;
    const restrictMentions =
      !!ctx.runId &&
      ((sourceRun?.config?.implementation !== "external-agent" && !ctx.sourcePageCheck) ||
        !!sourceRun?.config?.mentions?.length ||
        this.pages.deps.turnMentions.ownedPages(ctx.runId).includes(pageId));
    const mentionTurn = restrictMentions ? this.pages.deps.turnMentions.capture(ctx.runId!) : undefined;
    return this.lanes.withKeys(program.conflicts, () =>
      this.lanes.enqueue(pageId, async () => {
        const lp = this.pages.live.get(pageId);
        if (!lp?.driver?.isAttached())
          throw new AuxError("target_detached", `page ${pageId} is not attached`);
        if (lp.target.controller === "human")
          throw new AuxError("conflict", `page ${pageId} is under human control`);
        let admittedDriver = lp.driver;
        let admittedSession = lp.target.sessionId;
        const expectedEpoch = lp.target.controllerEpoch;
        const checkPolicy = this.pages.deps.safetyGate?.policyFence();
        const checkIncarnation = () => {
          checkPolicy?.();
          if (
            this.pages.live.get(pageId) !== lp ||
            lp.driver !== admittedDriver ||
            lp.target.sessionId !== admittedSession ||
            !admittedDriver.isAttached()
          )
            throw new AuxError(
              "ref_stale",
              "This browser attachment changed while preparing the action. Observe the tab again.",
            );
          if (lp.target.controllerEpoch !== expectedEpoch)
            throw new AuxError("conflict", `page ${pageId} changed controller mid-run (takeover)`);
        };
        const allSteps = collectProgramSteps(program);
        let origin = "";
        try {
          origin = new URL(lp.driver.url()).origin;
        } catch {
          origin = "";
        }
        const liveOrigin = () => {
          try {
            return new URL(lp.driver!.url()).origin;
          } catch {
            return "";
          }
        };
        const run = ctx.runId ? this.pages.deps.repo.getRun(ctx.runId) : undefined;
        // Same rule as the external page lease: a read uses the task page, and
        // any non-read step (including hover, scroll, and stop) takes transmission protection.
        if (ctx.runId && allSteps.some((step) => classifyStep(step.op) !== "read"))
          await this.pages.deps.prepareAgentEgress?.(ctx.runId, pageId);
        let credentialDispatch: { target: SavedCredentialTarget; policyRevision: number } | undefined;
        const authorize = async (
          step: Step,
          projectedOrigin?: string,
          phase: "preflight" | "dispatch" = "dispatch",
        ) => {
          credentialDispatch = undefined;
          checkIncarnation();
          if (ctx.runId) await checkNightShiftDispatch(this.pages.deps.repo, ctx.runId);
          ctx.taskRead?.check();
          ctx.sourcePageCheck?.();
          const access = classifyStep(step.op) === "read" ? "read" : "act";
          if (mentionTurn && ctx.runId)
            await this.pages.deps.turnMentions.assert(ctx.runId, pageId, access, mentionTurn);
          checkIncarnation();
          const documentEpoch = lp.target.documentEpoch;
          const topOrigin = liveOrigin();
          const targets = [
            "target" in step && typeof step.target === "string" ? step.target : undefined,
            step.op === "dragTo" ? step.to : undefined,
          ].filter((target): target is string => !!target);
          const ambiguousInput =
            step.op === "clickPoint" || step.op === "dialog" || (step.op === "press" && targets.length === 0);
          const fallbackOrigin =
            projectedOrigin ?? (ambiguousInput && lp.driver!.hasForeignFrames?.() ? "" : liveOrigin());
          const origins = targets.length
            ? await Promise.all(
                targets.map((target) =>
                  projectedOrigin !== undefined && !isElementRef(target)
                    ? projectedOrigin
                    : (lp.driver!.originForTarget?.(target) ?? Promise.resolve(fallbackOrigin)),
                ),
              )
            : [fallbackOrigin];
          checkIncarnation();
          let authorized: Awaited<ReturnType<NonNullable<ExecContext["authorizeStep"]>>> = undefined;
          for (const actionOrigin of origins) {
            const auth = authorizeProfileProgram([step], isReadOnlyProfile(run?.config?.subagentProfile));
            if (!auth.ok) throw new AuxError("permission_denied", auth.denied);
            if (this.pages.deps.safetyGate && (ctx.runId || classifyStep(step.op) !== "read")) {
              const destination =
                step.op === "navigate"
                  ? (() => {
                      try {
                        return new URL(step.url, lp.driver!.url()).origin;
                      } catch {
                        return "";
                      }
                    })()
                  : actionOrigin;
              const metadata = ctx.safety?.steps?.[step.id];
              const observedTarget =
                targets.length === 1 && lp.driver!.actionTarget
                  ? await lp.driver!.actionTarget(targets[0]!)
                  : undefined;
              checkIncarnation();
              if (lp.target.documentEpoch !== documentEpoch || liveOrigin() !== topOrigin)
                throw new AuxError("ref_stale", "The document changed while reading the action target.");
              let credentialTarget: SavedCredentialTarget | undefined;
              if (step.op === "fillCredential") {
                if (!this.pages.deps.native.credentialContext || !lp.target.sessionId)
                  throw new AuxError(
                    "backend_unavailable",
                    "The original native credential context is unavailable.",
                  );
                const expectedUrl = lp.driver!.url();
                const native = await this.pages.deps.native.credentialContext({ pageId, expectedUrl });
                checkIncarnation();
                if (
                  native.pageId !== pageId ||
                  native.expectedUrl !== expectedUrl ||
                  lp.driver!.url() !== expectedUrl ||
                  lp.target.documentEpoch !== documentEpoch
                )
                  throw new AuxError(
                    "ref_stale",
                    "The credential document changed while preparing approval.",
                  );
                const nativeContext = {
                  documentToken: native.documentToken,
                  windowId: native.windowId,
                  ownerIncarnation: native.ownerIncarnation,
                  connectionGeneration: native.connectionGeneration,
                };
                credentialTarget = SavedCredentialTargetSchema.parse({
                  pageId,
                  sessionId: lp.target.sessionId,
                  documentEpoch,
                  expectedUrl,
                  passwordSelector: step.passwordSelector,
                  ...(step.usernameSelector ? { usernameSelector: step.usernameSelector } : {}),
                  nativeContext,
                });
              }
              const taskId = ctx.taskId ?? run?.config?.taskId;
              const provenance = await this.pages.deps.safetyGate.check({
                step,
                origin: destination,
                phase,
                context: {
                  taskRead: ctx.taskRead,
                  pageId,
                  observedTarget,
                  credentialTarget,
                  actor:
                    run?.config?.implementation === "external-agent" ? "external_token" : "builtin_agent",
                  profileId: this.pages.deps.profileId ?? "default",
                  scope: taskId
                    ? { kind: "task", id: taskId }
                    : { kind: "workspace", id: run?.config?.contextWorkspaceId ?? "default" },
                  ...(ctx.runId ? { runId: ctx.runId } : {}),
                  turnId: ctx.runId ?? ctx.safety?.turnId ?? `direct:${pageId}`,
                  threadId: run?.config?.chatId ?? ctx.safety?.threadId ?? `page:${pageId}`,
                  sessionId: lp.target.sessionId ?? undefined,
                  approvalId: metadata?.approvalId,
                  review: metadata?.review,
                  turnToolCallCount: ctx.safety?.turnToolCallCount,
                  sensitiveData: metadata?.sensitiveData,
                  restrictedRetry: metadata?.restrictedRetry,
                  trustedEval: ctx.allowEval === true,
                },
              });
              checkIncarnation();
              if (provenance) authorized = provenance;
              if (credentialTarget && phase === "dispatch")
                credentialDispatch = {
                  target: credentialTarget,
                  policyRevision: this.pages.deps.safetyGate.policyRevision(),
                };
            }
          }
          if (phase === "dispatch" && classifyStep(step.op) !== "read") {
            // Guardian and target-origin resolution can await. A navigation or
            // frame swap during that window invalidates the authorization.
            if (lp.target.documentEpoch !== documentEpoch || liveOrigin() !== topOrigin)
              throw new AuxError(
                "ref_stale",
                "The document changed while authorizing this action. Observe it again.",
              );
            if (targets.length && lp.driver!.originForTarget) {
              const fresh = await Promise.all(targets.map((target) => lp.driver!.originForTarget!(target)));
              if (
                fresh.some((value, index) => value !== origins[index]) ||
                lp.target.documentEpoch !== documentEpoch ||
                liveOrigin() !== topOrigin
              )
                throw new AuxError(
                  "ref_stale",
                  "The target frame changed while authorizing this action. Observe it again.",
                );
            }
          }
          if (ctx.runId) await checkNightShiftDispatch(this.pages.deps.repo, ctx.runId);
          if (mentionTurn && ctx.runId)
            await this.pages.deps.turnMentions.assert(ctx.runId, pageId, access, mentionTurn);
          ctx.taskRead?.check();
          ctx.sourcePageCheck?.();
          checkIncarnation();
          return authorized;
        };
        // Fail fast while the current document is knowable. A write can navigate
        // or replace a frame, so later steps are checked against live origins at
        // dispatch instead of the program's original top-level URL.
        let projectedOrigin = origin;
        for (const step of allSteps) {
          await authorize(step, projectedOrigin, "preflight");
          if (step.op === "navigate") {
            try {
              projectedOrigin = new URL(step.url, lp.driver.url()).origin;
            } catch {
              break;
            }
          } else if (classifyStep(step.op) !== "read") break;
        }
        ctx.beforeJournal?.();
        if (
          ctx.journaled &&
          !ctx.journalIntentId &&
          this.pages.deps.durableWrites &&
          allSteps.some((step) => classifyStep(step.op) !== "read")
        )
          throw new AuxError("conflict", "A pre-journaled browser write requires its durable intent ID");
        const journal = ctx.journaled
          ? { skip: false as const, intentId: undefined as string | undefined }
          : beginConsequentialWrite(this.pages.deps.durableWrites, {
              runId: ctx.runId ?? `direct:${pageId}`,
              pageId,
              documentEpoch: lp.target.documentEpoch ?? 0,
              revision: lp.target.lastRevision,
              steps: allSteps,
              taskId: ctx.taskId ?? run?.config?.taskId,
              taskRevision: ctx.taskRevision ?? run?.config?.taskRevision,
            });
        if (journal.skip) throw new AuxError("conflict", journal.reason!);
        ctx = { ...ctx, journaled: true };
        this.control.programInflight.add(pageId);
        try {
          lp.target.controller = ctx.runId
            ? "agent"
            : lp.target.controller === "none"
              ? "external"
              : lp.target.controller;
          // controller/epoch changes are persisted once, after the program (speed P2-1)
          // pointer/keyboard input only lands on a visible, laid-out native view —
          // mark the page working (rendered offscreen unless focused) while a
          // program with interactive steps runs; no global lease (plan A8)
          const needsStage =
            lp.target.backend === "aux" &&
            this.pages.deps.native.available() &&
            allSteps.some((s) => INTERACTIVE_OPS.has(s.op));
          if (needsStage) {
            let acquired = false;
            try {
              acquired = (
                await this.pages.deps.native.acquireStage(
                  pageId,
                  allSteps.some((step) => step.op === "clickPoint"),
                )
              ).ok;
            } catch {
              // A lost native reply may still have acquired the stage. Release is
              // idempotent; never send input without a confirmed acquisition.
              await this.pages.deps.native.releaseStage(pageId).catch(() => {});
            }
            if (!acquired) {
              settleWrite(this.pages.deps.durableWrites, journal.intentId, false);
              if (!ctx.runId && (lp.target.controller === "agent" || lp.target.controller === "external"))
                lp.target.controller = "none";
              this.pages.persist(lp);
              throw new AuxError("backend_unavailable", "The page is not ready for browser input");
            }
          }
          // takeover epoch: a human claiming the page mid-run must abort in-flight
          // programs rather than fight for the input lane
          const span = this.pages.deps.tracer?.start("program.execute", {
            runId: ctx.runId,
            pageId,
            attrs: { steps: allSteps.length, nodes: program.nodes?.length, backend: lp.target.backend },
          });
          // §6.2 — proposed vs dispatched vs completed vs verified
          this.pages.deps.tracer?.incr("actions.proposed", allSteps.length);
          // step rows are collected here and written with the tick's other
          // observational rows when the program ends (speed P2-1); the step
          // ledger is observational — a failed write never fails the program
          const stepRecords: StepRecord[] = [];
          const flushSteps = () => {
            if (!stepRecords.length || !this.pages.deps.recordStep) return;
            const rows = stepRecords.splice(0);
            this.pages.deps.repo.defer(`steps:${rows[0]!.stepId}`, () => {
              try {
                for (const r of rows) this.pages.deps.recordStep!(r);
              } catch (e) {
                this.pages.deps.tracer?.incr("swallowed.flushSteps");
                throw e;
              }
            });
          };
          let result: ProgramResult & { observation?: ObservationContent };
          let observation: Observation | undefined;
          try {
            const execCtx: ExecContext = {
              ...ctx,
              // after the spread: an explicit `allowEval: undefined` from a caller
              // must not re-enable page JS / new Function for untrusted programs
              allowEval: ctx.allowEval ?? false,
              pageOrigin: origin,
              taskId:
                ctx.taskId ??
                (ctx.runId ? this.pages.deps.repo.getRun(ctx.runId)?.config?.taskId : undefined),
              uploadRead:
                ctx.uploadRead ??
                (this.pages.deps.uploadRead
                  ? (path) =>
                      this.pages.deps.uploadRead!(path, {
                        taskId: ctx.taskId ?? this.pages.deps.repo.getRun(ctx.runId ?? "")?.config?.taskId,
                        runId: ctx.runId,
                        pageId,
                        signal: ctx.signal,
                      })
                  : undefined),
              fillSavedPassword:
                this.pages.deps.nativePasswordFillEnabled && this.pages.deps.native.fillSavedPassword
                  ? (request) =>
                      secureCredentialHandoff(request, {
                        fillSavedPassword: async (validated) => {
                          const dispatch = credentialDispatch;
                          credentialDispatch = undefined;
                          checkIncarnation();
                          if (
                            !dispatch ||
                            !ctx.runId ||
                            !this.pages.deps.native.credentialAdmit ||
                            !this.pages.deps.native.fillAdmittedSavedPassword
                          )
                            throw new AuxError(
                              "permission_denied",
                              "The original credential dispatch authority is unavailable.",
                            );
                          const target = dispatch.target;
                          if (
                            validated.pageId !== target.pageId ||
                            validated.expectedUrl !== target.expectedUrl ||
                            validated.passwordSelector !== target.passwordSelector ||
                            validated.usernameSelector !== target.usernameSelector ||
                            lp.target.sessionId !== target.sessionId ||
                            lp.target.documentEpoch !== target.documentEpoch
                          )
                            throw new AuxError("ref_stale", "The approved credential target changed.");
                          const admission = await this.pages.deps.native.credentialAdmit({
                            target,
                            runId: ctx.runId,
                            policyRevision: dispatch.policyRevision,
                          });
                          checkIncarnation();
                          return this.pages.deps.native.fillAdmittedSavedPassword(
                            validated,
                            admission.receiptId,
                          );
                        },
                      })
                  : undefined,
              observe: (req) => this.observation.observe(pageId, req).then((o) => o.content),
              onEmit: (label, value) =>
                this.pages.deps.events.emit("page.emitted", { pageId, runId: ctx.runId, label, value }),
              callOperation:
                ctx.callOperation ??
                (this.pages.deps.callOperation
                  ? (n, a) => this.pages.deps.callOperation!(n, a, pageId)
                  : undefined),
              checkValid: () => {
                checkIncarnation();
                ctx.checkValid?.();
              },
              authorizeStep: (step) => authorize(step),
              navigateAndReadmit:
                ctx.runId && lp.target.backend === "aux" && this.pages.deps.native.available()
                  ? async (url) => {
                      const runId = ctx.runId!;
                      const producer = this.pages.deps.navigateControlled;
                      if (!producer)
                        throw new AuxError(
                          "capability_unsupported",
                          "Native controlled navigation is unavailable.",
                        );
                      const originalRun = this.pages.deps.repo.getRun(runId);
                      if (!originalRun)
                        throw new AuxError(
                          "permission_denied",
                          "The original navigation run is unavailable.",
                        );
                      const revision = originalRun.config?.messageRevision;
                      const taskId = originalRun.config?.taskId;
                      const taskRevision = originalRun.config?.taskRevision;
                      const signal = ctx.signal ?? new AbortController().signal;
                      const validateSource = () => {
                        const currentRun = this.pages.deps.repo.getRun(runId);
                        if (
                          signal.aborted ||
                          this.pages.live.get(pageId) !== lp ||
                          lp.target.controller === "human" ||
                          lp.target.controllerEpoch !== expectedEpoch ||
                          !currentRun ||
                          !["running", "planning", "queued"].includes(currentRun.status) ||
                          currentRun.config?.messageRevision !== revision ||
                          currentRun.config?.taskId !== taskId ||
                          currentRun.config?.taskRevision !== taskRevision
                        )
                          throw new AuxError(
                            "ref_stale",
                            "The original navigation run or controller changed.",
                          );
                        ctx.sourcePageCheck?.();
                        ctx.checkValid?.();
                        if (mentionTurn && this.pages.deps.turnMentions.capture(runId) !== mentionTurn)
                          throw new AuxError(
                            "ref_stale",
                            "The original mentioned turn changed during navigation.",
                          );
                      };
                      validateSource();
                      const commanded = async (
                        mentionAuthority?: () => void,
                        revalidateMentionSource?: () => Promise<void>,
                      ) => {
                        const admitted = await producer(
                          {
                            runId,
                            pageId,
                            url,
                            signal,
                            validateSource,
                            mentionAuthority,
                            revalidateMentionSource,
                          },
                          this.pages,
                        );
                        validateSource();
                        return { result: admitted.driver, receipt: admitted.receipt };
                      };
                      const replacement = mentionTurn
                        ? await this.pages.deps.turnMentions.navigateAttachmentUse(runId, pageId, commanded)
                        : (await commanded()).result;
                      validateSource();
                      if (
                        this.pages.live.get(pageId) !== lp ||
                        lp.driver !== replacement ||
                        !lp.target.sessionId ||
                        replacement === admittedDriver ||
                        !replacement.isAttached()
                      )
                        throw new AuxError(
                          "ref_stale",
                          "The native navigation driver changed before executor admission.",
                        );
                      admittedDriver = replacement;
                      admittedSession = lp.target.sessionId;
                      checkIncarnation();
                      return replacement;
                    }
                  : undefined,
              navigate: ctx.runId
                ? async (url, timeoutMs) => {
                    const driver = lp.driver;
                    const sessionId = lp.target.sessionId;
                    if (!driver?.navigateWithReceipt || !sessionId)
                      throw new AuxError(
                        "capability_unsupported",
                        "This attachment cannot produce a navigation receipt.",
                      );
                    const commanded = async () => {
                      const receipt = await driver.navigateWithReceipt!(url, timeoutMs);
                      if (
                        this.pages.live.get(pageId) !== lp ||
                        lp.driver !== driver ||
                        lp.target.sessionId !== sessionId ||
                        lp.target.documentEpoch !== receipt.documentEpoch ||
                        lp.target.url !== receipt.url
                      )
                        throw new AuxError(
                          "ref_stale",
                          "The navigation receipt belongs to a replaced attachment.",
                        );
                      return {
                        result: undefined,
                        page: { pageId, url: receipt.url, documentEpoch: receipt.documentEpoch, sessionId },
                      };
                    };
                    // Existing task-source access has no mention snapshot to advance.
                    if (mentionTurn)
                      await this.pages.deps.turnMentions.navigateUse(ctx.runId!, pageId, commanded);
                    else await commanded();
                  }
                : ctx.navigate,
              checkpoint:
                ctx.checkpoint ?? ((name, env) => this.pages.deps.repo.saveCheckpoint(pageId, name, env)),
              loadCheckpoint:
                ctx.loadCheckpoint ?? ((name) => this.pages.deps.repo.loadCheckpoint(pageId, name)),
              onArtifact:
                ctx.onArtifact ??
                ((label, buffer, mediaType) =>
                  this.pages.deps.artifacts?.save({ runId: ctx.runId, pageId, label, buffer, mediaType })
                    .artifactId),
              onStep: (outcome, step) => {
                const t = this.pages.deps.tracer;
                t?.incr("actions.dispatched");
                t?.incr(`actions.${outcome.status === "ok" ? "completed" : outcome.status}`);
                if (outcome.status === "ok" && VERIFY_OPS.has(step.op)) t?.incr("actions.verified");
                stepRecords.push({
                  stepId: newStepId(),
                  runId: ctx.runId ?? "",
                  pageId,
                  op: step.op,
                  inputs: stepInputsOf(step),
                  startedAt: outcome.startedAt,
                  outcome,
                });
                ctx.onStep?.(outcome, step);
              },
            };
            result = await executeProgram(admittedDriver, program, execCtx);
            if (
              result.status === "failed" &&
              result.steps.some(
                (s) =>
                  s.error?.code === "conflict" &&
                  (s.error.message.includes("takeover") || s.error.message.includes("controller")),
              )
            ) {
              for (const s of result.steps) {
                if (s.status === "ok") {
                  s.effect = "uncertain";
                  s.receipt = {
                    observed: s.detail,
                    remoteConfirmed: false,
                    uncertain: true,
                    unconfirmed: false,
                    dispatchedBeforeTakeover: true,
                  };
                }
              }
            }
            if (result.observation) {
              observation = this.observation.recordObservation(
                pageId,
                result.observation,
                opts.returnObservation ?? {},
              );
              delete result.observation;
            } else if (opts.returnObservation) {
              // A page that detached mid-program still returns the program
              // result — the observation is best-effort.
              observation = await this.observation
                .observe(pageId, opts.returnObservation)
                .catch(() => undefined);
            }
          } catch (e) {
            flushSteps();
            settleWrite(this.pages.deps.durableWrites, journal.intentId, false);
            if (!ctx.runId && (lp.target.controller === "agent" || lp.target.controller === "external")) {
              lp.target.controller = "none";
            }
            this.pages.persist(lp);
            this.pages.deps.tracer?.incr("program.error");
            span?.end("failed", { error: e instanceof Error ? e.message : String(e) });
            throw e;
          } finally {
            if (needsStage) await this.pages.deps.native.releaseStage(pageId).catch(() => {});
          }
          settleWrite(this.pages.deps.durableWrites, journal.intentId, result);
          flushSteps();
          if (!ctx.runId && (lp.target.controller === "agent" || lp.target.controller === "external")) {
            lp.target.controller = "none";
          }
          this.pages.persist(lp); // single persist per program; documentEpoch already advanced via onNavigated events
          this.pages.deps.tracer?.incr(`program.${result.status}`);
          span?.end(
            result.status === "completed" ? "ok" : result.status === "cancelled" ? "cancelled" : "failed",
            {
              status: result.status,
              steps: result.steps.length,
            },
          );
          const { observation: _inline, ...programResult } = result;
          return observation ? { ...programResult, observation } : programResult;
        } finally {
          this.control.programInflight.delete(pageId);
        }
      }),
    );
  }
}

function stepInputsOf(s: { op: string } & Record<string, unknown>): Record<string, unknown> {
  const { id, op, timeoutMs, optional, expect, ...rest } = s;
  if (op === "fillCredential")
    return { passwordSelector: rest.passwordSelector, usernameSelector: rest.usernameSelector };
  return rest;
}

/** Every browser step inside a program — flat or nested in control flow. */
export function programHasConsequentialSteps(program: Program): boolean {
  return collectProgramSteps(program).some((step) => classifyStep(step.op) !== "read");
}

export function programContainsOperationCalls(program: Program): boolean {
  const walk = (nodes: readonly ProgramNode[]): boolean =>
    nodes.some(
      (node) =>
        node.kind === "call" ||
        (node.kind === "if" && (walk(node.then) || (!!node.else && walk(node.else)))) ||
        ((node.kind === "forEach" || node.kind === "until") && walk(node.body)),
    );
  return !!program.nodes && walk(program.nodes);
}

export function collectProgramSteps(program: Program): Step[] {
  const out: Step[] = [...(program.steps ?? [])];
  const walk = (nodes: readonly ProgramNode[]) => {
    for (const n of nodes) {
      if (n.kind === "step") out.push(n.step);
      else if (n.kind === "if") {
        walk(n.then);
        if (n.else) walk(n.else);
      } else if (n.kind === "forEach" || n.kind === "until") walk(n.body);
    }
  };
  if (program.nodes) walk(program.nodes);
  return out;
}
