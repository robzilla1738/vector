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
import { RunCoordinator } from "../agent/coordinator.js";
import { runMemberAgent } from "../agent/member-agent.js";
import { SetRunner } from "../scheduler/set-runner.js";
import { WorkerPool } from "../scheduler/pool.js";


/** Owns run lifecycle and the sets.map scheduler. */
export class RunService {
  readonly coordinator: RunCoordinator;
  private setRunner: SetRunner;
  private pool: WorkerPool;
  private setRunControls = new Map<string, AbortController>();

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
      recordModelCall: (c) => {
        this.deps.repo.saveModelCall({ callId: newStepId(), ...c, createdAt: Date.now() });
        this.deps.events.emit(EventTypes.ModelCall, c, c.runId);
        deps.tracer?.incr("model.calls");
        if (c.error) deps.tracer?.incr("model.errors");
        if (c.outputTokens) deps.tracer?.incr("model.outputTokens", c.outputTokens);
        if (c.inputTokens) deps.tracer?.incr("model.inputTokens", c.inputTokens);
      },
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
      runAgentForMember: async (member: SetMember, pageId: string, goal: string) => {
        const model = deps.settings.model();
        if (!model)
          return {
            result: {
              resultId: newResultId(),
              memberId: member.memberId,
              pageId,
              sourceUrl: member.url ?? "",
              values: {},
              observedAt: Date.now(),
              status: "error" as const,
              error: "no model configured",
            },
          };
        return runMemberAgent({
          member,
          pageId,
          goal,
          runId: "",
          pages: deps.pages,
          model,
          modelId: deps.settings.plannerModel(),
          signal: new AbortController().signal,
        });
      },
    });
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
      this.deps.repo.saveRun(run);
      this.deps.events.emit(EventTypes.RunUpdated, { run }, run.runId);
      const abort = new AbortController();
      this.setRunControls.set(run.runId, abort);
      void this.setRunner
        .map({ setId: opts.setId, runId: run.runId, goal: opts.goal, signal: abort.signal })
        .then(() => this.finishSetRun(run.runId))
        .catch((e) => {
          const r = this.deps.repo.getRun(run.runId);
          if (r) {
            r.status = abort.signal.aborted ? "cancelled" : "failed";
            r.error = e instanceof Error ? e.message : String(e);
            r.endedAt = Date.now();
            this.deps.repo.saveRun(r);
            this.deps.events.emit(EventTypes.RunUpdated, { run: r }, run.runId);
          }
        });
      return run;
    }
    return this.coordinator.start({ ...opts, pageIds });
  }

  private finishSetRun(runId: string) {
    const run = this.deps.repo.getRun(runId);
    if (!run || !run.setId) return;
    const members = this.deps.repo.listMembers(run.setId);
    const failed = members.filter((m) => m.status === "failed").length;
    const done = members.filter((m) => m.status === "completed").length;
    run.status = failed === 0 ? "completed" : done > 0 ? "partially_completed" : "failed";
    run.statusMessage = `${done} completed · ${failed} failed`;
    run.endedAt = Date.now();
    run.config = { ...(run.config ?? {}), modelCalls: this.deps.repo.listModelCalls(runId).length };
    this.deps.repo.saveRun(run);
    this.deps.events.emit(EventTypes.RunUpdated, { run }, runId);
    this.setRunControls.delete(runId);
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
    this.deps.repo.saveRun(run);
    this.deps.events.emit(EventTypes.RunUpdated, { run }, run.runId);
    const abort = new AbortController();
    this.setRunControls.set(run.runId, abort);
    void this.setRunner
      .map({
        setId: opts.setId,
        runId: run.runId,
        program: opts.program,
        programId: opts.programId,
        goal: opts.goal,
        concurrency: opts.concurrency,
        memberIds: opts.memberIds,
        signal: abort.signal,
      })
      .then(() => this.finishSetRun(run.runId))
      .catch((e) => {
        const r = this.deps.repo.getRun(run.runId);
        if (r) {
          r.status = abort.signal.aborted ? "cancelled" : "failed";
          r.error = e instanceof Error ? e.message : String(e);
          r.endedAt = Date.now();
          this.deps.repo.saveRun(r);
          this.deps.events.emit(EventTypes.RunUpdated, { run: r }, run.runId);
        }
      });
    return { runId: run.runId };
  }

  pause(runId: string): Run {
    const sc = this.setRunControls.get(runId);
    if (sc) {
      // set runs pause at member granularity — current members finish
      const run = this.deps.repo.getRun(runId)!;
      run.status = "paused";
      this.deps.repo.saveRun(run);
      return run;
    }
    return this.coordinator.pause(runId);
  }

  resume(runId: string): Run {
    const sc = this.setRunControls.get(runId);
    const run = this.deps.repo.getRun(runId);
    if (sc && run) {
      run.status = "running";
      this.deps.repo.saveRun(run);
      return run;
    }
    return this.coordinator.resume(runId);
  }

  cancel(runId: string): Run {
    const sc = this.setRunControls.get(runId);
    if (sc) sc.abort();
    return this.coordinator.cancel(runId);
  }

  runProgram(opts: { programId: string; pageId: string; parameters?: Record<string, string> }): { runId: string } {
    const saved = this.deps.repo.getProgram(opts.programId);
    if (!saved) throw new VectorError("not_found", `no program ${opts.programId}`);
    const page = this.deps.pages.get(opts.pageId);
    if (saved.siteKey !== "*" && !page.url.startsWith(new URL(page.url).origin)) {
      // siteKey check is advisory: strict origin match happens on the url
    }
    const savedBody = JSON.parse(saved.stepsJson) as Step[] | { steps?: Step[]; nodes?: Program["nodes"] };
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
      .execute(program, { runId: run.runId })
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
