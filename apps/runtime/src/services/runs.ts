import {
  EventTypes,
  newProgramId,
  newResultId,
  newRunId,
  newStepId,
  VectorError,
  type Program,
  type Run,
  type SavedProgram,
  type SetMember,
  type Step,
} from "@vector/contracts";
import type { EventBus } from "../events.js";
import type { Repo } from "../store/repo.js";
import type { ArtifactStore } from "./artifacts.js";
import type { PageService } from "./pages.js";
import type { SetService } from "./sets.js";
import type { SettingsService } from "./settings.js";
import { join } from "node:path";
import { RunCoordinator } from "../agent/coordinator.js";
import { DurableWriteLedger } from "../agent/durable.js";
import { runMemberAgent } from "../agent/member-agent.js";
import { SetRunner } from "../scheduler/set-runner.js";
import { WorkerPool } from "../scheduler/pool.js";


/**
 * Apply `{{name}}` placeholders in a saved program's serialized steps.
 * Values are inserted JSON-string-escaped so a parameter can never break
 * out of the string literal it sits in. Every placeholder must be supplied.
 */
export function substituteParameters(stepsJson: string, parameters: Record<string, string>): string {
  const missing = new Set<string>();
  const out = stepsJson.replace(/\{\{\s*([A-Za-z0-9_.-]+)\s*\}\}/g, (m, name: string) => {
    const v = parameters[name];
    if (v === undefined) {
      missing.add(name);
      return m;
    }
    return JSON.stringify(String(v)).slice(1, -1);
  });
  if (missing.size) {
    throw new VectorError("invalid_params", `program requires parameters: ${[...missing].join(", ")}`, { missing: [...missing] });
  }
  return out;
}

const TERMINAL_RUN_STATUSES: ReadonlySet<Run["status"]> = new Set([
  "completed",
  "partially_completed",
  "failed",
  "cancelled",
  "interrupted",
]);

/**
 * Per set-run control: the abort signal every member (program or agent)
 * observes, plus a pause gate — while `paused`, no new member starts; resume
 * (or cancel) releases everyone waiting on it.
 */
class SetRunControl {
  readonly abort = new AbortController();
  private paused = false;
  private waiters: (() => void)[] = [];

  pause() {
    this.paused = true;
  }
  resume() {
    this.paused = false;
    this.release();
  }
  cancel() {
    this.abort.abort();
    this.release();
  }
  isPaused() {
    return this.paused;
  }
  /** Resolves immediately unless paused; cancel also resolves so the member can observe the abort and skip. */
  waitIfPaused(): Promise<void> {
    if (!this.paused || this.abort.signal.aborted) return Promise.resolve();
    return new Promise<void>((r) => this.waiters.push(r));
  }
  private release() {
    const ws = this.waiters;
    this.waiters = [];
    for (const w of ws) w();
  }
}

/** Owns run lifecycle and the sets.map scheduler. */
export class RunService {
  readonly coordinator: RunCoordinator;
  private setRunner: SetRunner;
  private pool: WorkerPool;
  private setRunControls = new Map<string, SetRunControl>();

  constructor(private deps: {
    repo: Repo;
    events: EventBus;
    pages: PageService;
    sets: SetService;
    settings: SettingsService;
    artifacts: ArtifactStore;
    translateSteps: (pageId: string, steps: Step[]) => Step[];
    nativeAvailable: () => boolean;
    tracer?: {
      start(
        name: string,
        ctx?: { runId?: string; pageId?: string; attrs?: Record<string, unknown> },
      ): { spanId: string; end(outcome?: "ok" | "failed" | "cancelled", attrs?: Record<string, unknown>): void };
      incr(name: string, by?: number): void;
    };
  }) {
    this.pool = new WorkerPool({ maxWorkers: deps.settings.maxWorkers(), perOrigin: deps.settings.perOrigin() });
    this.coordinator = new RunCoordinator({
      repo: deps.repo,
      events: deps.events,
      pages: deps.pages,
      model: () => deps.settings.model(),
      defaultModel: () => deps.settings.plannerModel(),
      recoveryModel: () => deps.settings.recoveryModel(),
      visionModel: () => deps.settings.visionModel(),
      recordModelCall: (c) => this.recordModelCall(c),
      // step recording is unified in PageService.recordStep (wired in main.ts)
      // — every execution, agent or program, lands in the same step ledger
      // with pageId so operations.compile can rebuild the trace (§10.3)
      // keep the observation the planner saw so the run's steps can be
      // inspected against their historical page state
      saveObservation: (runId, obs) =>
        this.deps.artifacts.save({
          runId,
          pageId: obs.pageId,
          label: `observation-r${obs.revision}`,
          mediaType: "application/json",
          buffer: Buffer.from(JSON.stringify(obs)),
        }).artifactId,
      tracer: deps.tracer,
      durableWrites: new DurableWriteLedger(
        typeof deps.settings.all === "function" && deps.settings.all().dataDir
          ? join(deps.settings.all().dataDir, "durable-writes.json")
          : undefined,
      ),
    });
    this.setRunner = new SetRunner({
      repo: deps.repo,
      events: deps.events,
      pages: deps.pages,
      sets: deps.sets,
      pool: this.pool,
      nativeAvailable: deps.nativeAvailable,
      translateSteps: deps.translateSteps,
      getProgram: (id) => {
        const p = deps.repo.getProgram(id);
        return p ? { stepsJson: p.stepsJson, siteKey: p.siteKey } : undefined;
      },
      saveProgram: (p) => {
        const program: SavedProgram = {
          programId: newProgramId(),
          name: p.name,
          version: 1,
          siteKey: p.siteKey,
          parameters: p.parameters,
          stepsJson: JSON.stringify(p.steps),
          useCount: 0,
          createdAt: Date.now(),
        };
        deps.repo.saveProgram(program);
        return program.programId;
      },
      runAgentForMember: async (member: SetMember, pageId: string, goal: string, ctx: { runId: string; signal: AbortSignal }) => {
        const model = deps.settings.model();
        if (!model)
          return {
            result: {
              resultId: newResultId(),
              runId: ctx.runId,
              memberId: member.memberId,
              pageId,
              sourceUrl: member.url ?? "",
              values: {},
              observedAt: Date.now(),
              status: "error" as const,
              error: "no model configured",
            },
          };
        const modelId = deps.settings.plannerModel();
        return runMemberAgent({
          member,
          pageId,
          goal,
          runId: ctx.runId,
          pages: deps.pages,
          model,
          modelId,
          // the set-run's own signal — runs.cancel stops member model calls
          signal: ctx.signal,
          recordModelCall: (c) => this.recordModelCall({ runId: ctx.runId, role: "planner", ...c }),
        });
      },
    });
  }

  private recordModelCall(c: {
    runId: string;
    role: "planner" | "repair" | "vision" | "probe" | "final";
    modelId: string;
    durationMs: number;
    inputTokens?: number;
    outputTokens?: number;
    providerMetadata?: Record<string, unknown>;
    error?: string;
  }) {
    this.deps.repo.saveModelCall({ callId: newStepId(), ...c, createdAt: Date.now() });
    this.deps.events.emit(EventTypes.ModelCall, c, c.runId);
    this.deps.tracer?.incr("model.calls");
    if (c.error) this.deps.tracer?.incr("model.errors");
    if (c.outputTokens) this.deps.tracer?.incr("model.outputTokens", c.outputTokens);
    if (c.inputTokens) this.deps.tracer?.incr("model.inputTokens", c.inputTokens);
  }

  /** settings.set changed maxWorkers/perOrigin — apply without a restart. */
  refreshPool() {
    this.pool.resize({ maxWorkers: this.deps.settings.maxWorkers(), perOrigin: this.deps.settings.perOrigin() });
  }

  /** Shared tail for set-scoped runs: schedule the map, then settle the run once. */
  private launchSetRun(run: Run, mapOpts: Omit<Parameters<SetRunner["map"]>[0], "runId" | "signal" | "waitIfPaused">) {
    this.deps.repo.saveRun(run);
    this.deps.events.emit(EventTypes.RunUpdated, { run }, run.runId);
    const control = new SetRunControl();
    this.setRunControls.set(run.runId, control);
    void this.setRunner
      .map({
        ...mapOpts,
        runId: run.runId,
        signal: control.abort.signal,
        waitIfPaused: () => control.waitIfPaused(),
        isPaused: () => control.isPaused(),
      })
      .then(() => this.finishSetRun(run.runId))
      .catch((e) => {
        const r = this.deps.repo.getRun(run.runId);
        if (r && !TERMINAL_RUN_STATUSES.has(r.status)) {
          r.status = control.abort.signal.aborted ? "cancelled" : "failed";
          r.error = e instanceof Error ? e.message : String(e);
          r.endedAt = Date.now();
          this.deps.repo.saveRun(r);
          this.deps.events.emit(EventTypes.RunUpdated, { run: r }, run.runId);
        }
      })
      .finally(() => this.setRunControls.delete(run.runId));
  }

  async start(opts: {
    goal: string;
    pageId?: string;
    pageIds?: string[];
    setId?: string;
    modelId?: string;
    maxSteps?: number;
    maxModelCalls?: number;
    deadlineMs?: number;
    context?: string;
    chatId?: string;
  }): Promise<Run> {
    const pageIds = opts.pageIds ?? (opts.pageId ? [opts.pageId] : []);
    if (!pageIds.length && !opts.setId) {
      throw new VectorError("invalid_params", "runs.start needs a pageId, pageIds, or setId scope");
    }
    if (opts.setId) {
      // a set-scoped goal runs through the map scheduler
      const run: Run = {
        runId: newRunId(),
        goal: opts.goal,
        status: "running",
        pageIds: [],
        setId: opts.setId,
        config: { modelId: opts.modelId },
        createdAt: Date.now(),
        startedAt: Date.now(),
        statusMessage: "Mapping over set",
      };
      this.launchSetRun(run, { setId: opts.setId, goal: opts.goal });
      return run;
    }
    return this.coordinator.start({
      ...opts,
      pageIds,
      maxModelCalls: opts.maxModelCalls ?? this.deps.settings.maxModelCalls(),
    });
  }

  /**
   * Settle a set run after its members drained. A run already in a terminal
   * state (cancelled by the user mid-map) keeps that status — only the
   * model-call stamp and end time are filled in if missing.
   */
  private finishSetRun(runId: string) {
    const run = this.deps.repo.getRun(runId);
    if (!run || !run.setId) return;
    const members = this.deps.repo.listMembers(run.setId);
    const failed = members.filter((m) => m.status === "failed").length;
    const done = members.filter((m) => m.status === "completed").length;
    const skipped = members.filter((m) => m.status === "skipped").length;
    if (!TERMINAL_RUN_STATUSES.has(run.status)) {
      run.status = failed === 0 && skipped === 0 ? "completed" : done > 0 ? "partially_completed" : "failed";
      run.statusMessage = `${done} completed · ${failed} failed${skipped ? ` · ${skipped} skipped` : ""}`;
    }
    run.endedAt ??= Date.now();
    run.config = { ...(run.config ?? {}), modelCalls: this.deps.repo.listModelCalls(runId).length };
    this.deps.repo.saveRun(run);
    this.deps.events.emit(EventTypes.RunUpdated, { run }, runId);
  }

  async mapSet(opts: {
    setId: string;
    program?: { steps: Step[] };
    programId?: string;
    goal?: string;
    concurrency?: number;
    memberIds?: string[];
  }): Promise<{ runId: string }> {
    const run: Run = {
      runId: newRunId(),
      goal: opts.goal ?? `map ${opts.programId ?? "program"} over ${opts.setId}`,
      status: "running",
      pageIds: [],
      setId: opts.setId,
      createdAt: Date.now(),
      startedAt: Date.now(),
      statusMessage: "Mapping over set",
    };
    this.launchSetRun(run, {
      setId: opts.setId,
      program: opts.program,
      programId: opts.programId,
      goal: opts.goal,
      concurrency: opts.concurrency,
      memberIds: opts.memberIds,
    });
    return { runId: run.runId };
  }

  pause(runId: string): Run {
    const sc = this.setRunControls.get(runId);
    if (sc) {
      // set runs pause at member granularity — in-flight members finish,
      // queued members wait on the gate until resume
      const run = this.deps.repo.getRun(runId)!;
      if (run.status === "running") {
        sc.pause();
        run.status = "paused";
        run.statusMessage = "Paused — queued members wait";
        this.deps.repo.saveRun(run);
        this.deps.events.emit(EventTypes.RunStatus, { runId, status: run.status, message: run.statusMessage }, runId);
        this.deps.events.emit(EventTypes.RunUpdated, { run }, runId);
      }
      return run;
    }
    return this.coordinator.pause(runId);
  }

  resume(runId: string): Run {
    const sc = this.setRunControls.get(runId);
    const run = this.deps.repo.getRun(runId);
    if (sc && run) {
      if (run.status === "paused") {
        sc.resume();
        run.status = "running";
        run.statusMessage = "Mapping over set";
        this.deps.repo.saveRun(run);
        this.deps.events.emit(EventTypes.RunStatus, { runId, status: run.status, message: run.statusMessage }, runId);
        this.deps.events.emit(EventTypes.RunUpdated, { run }, runId);
      }
      return run;
    }
    return this.coordinator.resume(runId);
  }

  cancel(runId: string): Run {
    const sc = this.setRunControls.get(runId);
    if (sc) sc.cancel();
    return this.coordinator.cancel(runId);
  }

  /** Test/diagnostic hook: is this set run currently gated? */
  isSetRunPaused(runId: string): boolean {
    return this.setRunControls.get(runId)?.isPaused() ?? false;
  }

  runProgram(opts: { programId: string; pageId: string; parameters?: Record<string, string> }): { runId: string } {
    const saved = this.deps.repo.getProgram(opts.programId);
    if (!saved) throw new VectorError("not_found", `no program ${opts.programId}`);
    this.deps.pages.get(opts.pageId); // throws not_found for an unknown page before a run row is created
    const stepsJson = substituteParameters(saved.stepsJson, opts.parameters ?? {});
    const savedBody = JSON.parse(stepsJson) as Step[] | { steps?: Step[]; nodes?: Program["nodes"] };
    const steps = Array.isArray(savedBody) ? savedBody : (savedBody.steps ?? []);
    const nodes = Array.isArray(savedBody) ? undefined : savedBody.nodes;
    const run: Run = {
      runId: newRunId(),
      goal: `program ${saved.name}`,
      status: "running",
      pageIds: [opts.pageId],
      config: { implementation: "program", routeReason: `saved program ${saved.name}` },
      createdAt: Date.now(),
      startedAt: Date.now(),
      statusMessage: `Running ${saved.name}`,
    };
    this.deps.repo.saveRun(run);
    this.deps.events.emit(EventTypes.RunUpdated, { run }, run.runId);
    const program: Program = { pageId: opts.pageId, steps, nodes };
    void this.deps.pages
      // saved programs are user/API-authored (or learned from plans, which
      // cannot contain evaluate) — a trusted source
      .execute(program, { runId: run.runId, allowEval: true })
      .then((res) => {
        const r = this.deps.repo.getRun(run.runId)!;
        r.status = res.status === "completed" ? "completed" : res.status === "cancelled" ? "cancelled" : "failed";
        r.result = res.extracted;
        r.error = res.error;
        r.endedAt = Date.now();
        r.config = { ...(r.config ?? {}), modelCalls: this.deps.repo.listModelCalls(run.runId).length };
        this.deps.repo.saveRun(r);
        this.deps.events.emit(EventTypes.RunUpdated, { run: r }, run.runId);
        if (res.status === "completed") {
          saved.useCount++;
          saved.lastUsedAt = Date.now();
          this.deps.repo.saveProgram(saved);
        }
      })
      .catch((e) => {
        const r = this.deps.repo.getRun(run.runId);
        if (r) {
          r.status = "failed";
          r.error = e instanceof Error ? e.message : String(e);
          r.endedAt = Date.now();
          r.config = { ...(r.config ?? {}), modelCalls: this.deps.repo.listModelCalls(run.runId).length };
          this.deps.repo.saveRun(r);
          this.deps.events.emit(EventTypes.RunUpdated, { run: r }, run.runId);
        }
      });
    return { runId: run.runId };
  }

  poolStats() {
    return this.pool.stats();
  }
}
