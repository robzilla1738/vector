import { AuxError, RoutineSchema, newRunId, type Routine } from "@aux/contracts";
import type { Repo } from "../../store/repo.js";
import type { EventBus } from "../../events.js";
import type { PageService } from "../pages.js";
import type { DemoRecorder } from "../demo-recorder.js";
import type { DemonstrationReview } from "../skill-replay.js";
import { TaskService } from "../tasks.js";
import { SkillReplayRepairs } from "../skill-repair.js";
import {
  bindSkillParameters,
  compileSkillTrace,
  compileDemonstration,
  demonstrationReplayDigest,
  skillReplayProofDigest,
  replayDigest,
  skillPageOrigin,
  startSkillReplay,
} from "../skill-replay.js";

/** Owns native replay preparation, review, exact proof, and test-result transitions. */
export class RoutineReplayService {
  constructor(
    private repo: Repo,
    private events: EventBus,
    private routine: (id: string) => Routine,
    private requireSourceTask: (
      taskId: string,
      workspaceId: string,
    ) => { revision: number; sourceOrigin?: "external" | "conversation" },
    private persist: (routine: Routine) => void,
  ) {}
  compileReplay(
    input: {
      routineId: string;
      expectedRevision: number;
      sourceRunId: string;
      pageId: string;
      samples: Record<string, string>;
    },
    pages: PageService,
  ): Routine {
    const current = this.routine(input.routineId);
    if (current.revision !== input.expectedRevision)
      throw new AuxError("conflict", "This Skill changed. Refresh before preparing a replay.");
    if (!current.sourceTaskId || !current.sourceTaskRevision || current.archivedAt)
      throw new AuxError("conflict", "Bind an open saved task before preparing a replay.");
    const sourceTask = this.requireSourceTask(current.sourceTaskId, current.workspaceId);
    if (sourceTask.revision !== current.sourceTaskRevision)
      throw new AuxError("conflict", "The source task changed. Sync it before preparing a replay.");
    const run = this.repo.getRun(input.sourceRunId);
    if (
      !run ||
      run.status !== "completed" ||
      run.config?.taskId !== current.sourceTaskId ||
      run.config?.taskRevision !== current.sourceTaskRevision ||
      run.config?.contextWorkspaceId !== current.workspaceId ||
      run.pageIds.length !== 1 ||
      run.pageIds[0] !== input.pageId
    )
      throw new AuxError("conflict", "Choose a completed run from this exact saved task and page.");
    if (
      Object.keys(input.samples).length !== current.parameters.length ||
      current.parameters.some((parameter) => !input.samples[parameter.name]) ||
      Object.keys(input.samples).some(
        (name) => !current.parameters.some((parameter) => parameter.name === name),
      )
    )
      throw new AuxError("invalid_params", "Review a source value for every declared Skill parameter.");
    const siteOrigin = skillPageOrigin(pages, input.pageId);
    if (current.siteOrigins.length && !current.siteOrigins.includes(siteOrigin))
      throw new AuxError("conflict", "The source page is outside this Skill's reviewed site scope.");
    const records = this.repo.listSteps(run.runId);
    if (records.some((record) => record.pageId !== input.pageId))
      throw new AuxError("conflict", "The source run changed pages; record a single-page trace.");
    const steps = compileSkillTrace(records, input.samples);
    const next: Routine = RoutineSchema.parse({
      ...current,
      sourceRunId: run.runId,
      paused: true,
      activationReview: "run_result",
      revision: current.revision + 1,
      updatedAt: Date.now(),
      replay: {
        format: "aux-skill-replay@2",
        sourceRunId: run.runId,
        siteOrigin,
        siteOrigins: [siteOrigin],
        steps,
        digest: replayDigest(run.runId, siteOrigin, steps),
        state: "untested",
      },
    });
    this.persist(next);
    this.events.emit("routine.updated", { routine: next });
    return next;
  }

  compileDemonstrationReplay(
    input: { routineId: string; expectedRevision: number; recordingId: string; review: DemonstrationReview },
    recorder: DemoRecorder,
  ): Routine {
    const current = this.routine(input.routineId);
    if (
      current.revision !== input.expectedRevision ||
      current.archivedAt ||
      !current.sourceTaskId ||
      !current.sourceTaskRevision
    )
      throw new AuxError(
        "conflict",
        "Review an open saved task and current Skill revision before compiling.",
      );
    const task = this.requireSourceTask(current.sourceTaskId, current.workspaceId);
    if (task.revision !== current.sourceTaskRevision)
      throw new AuxError("conflict", "The source task changed before compilation.");
    const demo = recorder.get(input.recordingId);
    if (
      !new TaskService(this.repo, this.events)
        .get(current.sourceTaskId)
        .resources.some((resource) => resource.kind === "page" && resource.locator === demo.pageId)
    )
      throw new AuxError(
        "permission_denied",
        "The recording tab is outside this saved task's reviewed resources.",
      );
    const declared = new Set(current.parameters.map((parameter) => parameter.name));
    if (
      input.review.inputs.some((value) => !declared.has(value.parameter)) ||
      [...declared].some((name) => !input.review.inputs.some((value) => value.parameter === name))
    )
      throw new AuxError("invalid_params", "Review every declared parameter against its recorded field.");
    const steps = compileDemonstration(demo, input.review, current.siteOrigins);
    const initial = demo.steps.find((step) => step.kind === "navigate");
    if (!initial || initial.kind !== "navigate")
      throw new AuxError("conflict", "The recording has no initial site identity.");
    const siteOrigin = new URL(initial.url).origin;
    const next = RoutineSchema.parse({
      ...current,
      paused: true,
      revision: current.revision + 1,
      updatedAt: Date.now(),
      replay: {
        format: "aux-skill-replay@2",
        sourceRecordingId: demo.id,
        siteOrigin,
        siteOrigins: current.siteOrigins,
        steps,
        digest: demonstrationReplayDigest(demo.id, current.siteOrigins, steps),
        state: "untested",
      },
    });
    this.persist(next);
    this.events.emit("routine.updated", { routine: next });
    return next;
  }

  async proposeReplayRepair(
    input: {
      routineId: string;
      expectedRevision: number;
      pageId: string;
      changes: { stepId: string; selector: string }[];
    },
    pages: PageService,
  ) {
    const current = this.routine(input.routineId);
    if (
      current.revision !== input.expectedRevision ||
      current.archivedAt ||
      !current.sourceTaskId ||
      !current.sourceTaskRevision
    )
      throw new AuxError("conflict", "Review this Skill's current saved task before repair.");
    const task = this.requireSourceTask(current.sourceTaskId, current.workspaceId);
    if (
      task.revision !== current.sourceTaskRevision ||
      !new TaskService(this.repo, this.events)
        .get(current.sourceTaskId)
        .resources.some((resource) => resource.kind === "page" && resource.locator === input.pageId)
    )
      throw new AuxError(
        "permission_denied",
        "The repair tab is outside this Skill's current reviewed task.",
      );
    return new SkillReplayRepairs(this.repo).propose(current, input.pageId, input.changes, pages);
  }
  applyReplayRepair(input: { proposalId: string; expectedRevision: number }, pages: PageService): Routine {
    const repairs = new SkillReplayRepairs(this.repo),
      proposal = repairs.get(input.proposalId);
    const current = this.routine(proposal.routineId);
    if (
      current.revision !== input.expectedRevision ||
      current.archivedAt ||
      !current.sourceTaskId ||
      !current.sourceTaskRevision ||
      this.requireSourceTask(current.sourceTaskId, current.workspaceId).revision !==
        current.sourceTaskRevision
    )
      throw new AuxError("conflict", "The reviewed source task or Skill changed.");
    const next = this.repo.transaction(() => {
      const replay = repairs.apply(current, proposal.proposalId, pages);
      const next = RoutineSchema.parse({
        ...current,
        replay,
        paused: true,
        activationReview: "run_result",
        revision: current.revision + 1,
        updatedAt: Date.now(),
      });
      this.persist(next);
      return next;
    });
    this.events.emit("routine.updated", { routine: next });
    return next;
  }

  testReplay(
    input: {
      routineId: string;
      expectedRevision: number;
      pageId: string;
      parameters: Record<string, string>;
    },
    pages: PageService,
  ): { runId: string; revision: number } {
    const current = this.routine(input.routineId);
    if (
      current.revision !== input.expectedRevision ||
      !current.replay ||
      current.replay.state === "testing" ||
      current.replay.state === "needs_repair"
    )
      throw new AuxError("conflict", "This Skill replay changed or is already testing.");
    if (current.archivedAt || !current.sourceTaskId || !current.sourceTaskRevision)
      throw new AuxError("conflict", "Bind an open saved task before testing this Skill.");
    if (
      this.requireSourceTask(current.sourceTaskId, current.workspaceId).revision !==
      current.sourceTaskRevision
    )
      throw new AuxError("conflict", "The source task changed. Repair this Skill before testing.");
    if (
      skillReplayProofDigest(current.replay) !== current.replay.digest ||
      skillPageOrigin(pages, input.pageId) !== current.replay.siteOrigin
    )
      throw new AuxError("conflict", "The saved replay or selected site changed. Repair before testing.");
    bindSkillParameters(
      current.replay.steps,
      input.parameters,
      current.parameters.map((item) => item.name),
    );
    const runId = newRunId();
    const next: Routine = RoutineSchema.parse({
      ...current,
      paused: true,
      revision: current.revision + 1,
      updatedAt: Date.now(),
      replay: {
        ...current.replay,
        state: "testing",
        testRunId: runId,
        testRevision: current.revision + 1,
        testedRevision: undefined,
        testedAt: undefined,
      },
    });
    this.repo.transaction(() => {
      this.persist(next);
      startSkillReplay({
        repo: this.repo,
        pages,
        events: this.events,
        routine: next,
        pageId: input.pageId,
        parameters: input.parameters,
        deliveryRunId: runId,
      });
    });
    this.events.emit("routine.updated", { routine: next });
    return { runId, revision: next.revision };
  }

  /** The exact test run and every recorded step must prove the final oracle. */
  resultReplay(input: { routineId: string; expectedRevision: number; runId: string }): Routine {
    const current = this.routine(input.routineId);
    const replay = current.replay;
    if (
      current.revision !== input.expectedRevision ||
      !replay ||
      replay.state !== "testing" ||
      replay.testRunId !== input.runId ||
      replay.testRevision !== current.revision ||
      skillReplayProofDigest(replay) !== replay.digest
    )
      throw new AuxError("conflict", "This is not the pending test for the current Skill revision.");
    const run = this.repo.getRun(input.runId);
    if (
      !run ||
      !["completed", "failed", "cancelled", "interrupted"].includes(run.status) ||
      run.config?.routeReason !== `skill-replay:${current.routineId}:${replay.digest}` ||
      run.config.taskId !== current.sourceTaskId ||
      run.config.taskRevision !== current.sourceTaskRevision ||
      run.config.contextWorkspaceId !== current.workspaceId ||
      run.pageIds.length !== 1
    )
      throw new AuxError("conflict", "Wait for this exact Skill test run to settle.");
    const records = this.repo.listSteps(run.runId);
    const passed =
      run.status === "completed" &&
      records.length === replay.steps.length &&
      records.every(
        (record, index) =>
          record.pageId === run.pageIds[0] &&
          record.op === replay.steps[index]?.op &&
          record.outcome?.status === "ok" &&
          !record.outcome?.receipt?.uncertain &&
          !record.outcome?.receipt?.unconfirmed &&
          record.outcome?.effect !== "uncertain",
      );
    const next: Routine = RoutineSchema.parse({
      ...current,
      paused: true,
      revision: current.revision + 1,
      updatedAt: Date.now(),
      replay: {
        ...replay,
        state: passed ? "tested" : "needs_repair",
        testedRevision: passed ? current.revision + 1 : undefined,
        testedAt: passed ? Date.now() : undefined,
      },
    });
    this.persist(next);
    this.events.emit("routine.updated", { routine: next });
    return next;
  }
}
