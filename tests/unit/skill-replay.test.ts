import { afterEach, expect, it, vi } from "vitest";
import { EventBus, openDb, Repo, TaskService } from "@aux/runtime";
import type { PageService } from "../../apps/runtime/src/services/pages.js";
import { RoutineService } from "../../apps/runtime/src/services/routines.js";
import { bindSkillParameters, compileSkillTrace, startSkillReplay } from "../../apps/runtime/src/services/skill-replay.js";
import type { StepRecord } from "@aux/contracts";

const sourceStep = (op: string, inputs: Record<string, unknown>, index: number, pageId = "page-1"): StepRecord => ({
  stepId: `source-${index}`, runId: "source-run", pageId, op, inputs, startedAt: index,
  outcome: { stepId: `source-${index}`, op, status: "ok", startedAt: index, durationMs: 1 },
});
const trace = () => [
  sourceStep("fill", { target: "css:#query", value: "hosting" }, 1),
  sourceStep("click", { target: "css:#search" }, 2),
  sourceStep("waitFor", { condition: { kind: "textVisible", text: "hosting" } }, 3),
];

it("compiles only reviewed values and a verified final oracle into a bounded declarative replay", () => {
  const steps = compileSkillTrace(trace(), { topic: "hosting" });
  expect(JSON.stringify(steps)).not.toContain("hosting");
  expect(steps.at(-1)).toMatchObject({ op: "waitFor", condition: { kind: "textVisible", text: "{{topic}}" } });
  expect(bindSkillParameters(steps, { topic: 'new "value"' }, ["topic"])).toMatchObject([
    { op: "fill", value: 'new "value"' }, { op: "click" },
    { op: "waitFor", condition: { text: 'new "value"' } },
  ]);
  expect(() => bindSkillParameters(steps, { other: "new" }, ["topic"])).toThrow(/reviewed value/);
  expect(() => compileSkillTrace(trace().slice(0, 2), { topic: "hosting" })).toThrow(/oracle/);
  expect(() => compileSkillTrace([sourceStep("fill", { target: "css:#password", value: "hosting" }, 1), ...trace().slice(1)], { topic: "hosting" }))
    .toThrow(/Credential/);
  expect(() => compileSkillTrace([sourceStep("fill", { target: "r1", value: "hosting" }, 1), ...trace().slice(1)], { topic: "hosting" }))
    .toThrow(/stable/);
  expect(() => compileSkillTrace([trace()[0]!, sourceStep("click", { target: "css:#search" }, 2, "other"), trace()[2]!], { topic: "hosting" }))
    .toThrow(/one browser page/);
  expect(() => compileSkillTrace(trace().map((step, index) => index === 1 ? { ...step, outcome: { ...step.outcome!, receipt: { uncertain: true, remoteConfirmed: false, dispatchedBeforeTakeover: false } } } : step), { topic: "hosting" }))
    .toThrow(/verified/);
});

const handles: { close(): void }[] = [];
afterEach(() => { for (const handle of handles.splice(0)) handle.close(); });

it("keeps a run-derived Skill paused through compile/test, binds exact proof, and pauses on drift", async () => {
  const db = openDb(":memory:"); handles.push(db);
  const repo = new Repo(db), events = new EventBus(repo), tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Skill fixture");
  const task = tasks.create({ workspaceId: workspace.workspaceId, title: "Search fixture", objective: "Search {{topic}}",
    criteria: [{ criterionId: "found", description: "Result visible", verification: "manual" }],
    resources: [{ resourceId: "source", kind: "url", locator: "https://example.test/search", label: "Search" }] });
  repo.saveRun({ runId: "source-run", goal: "Search hosting", status: "completed", pageIds: ["page-1"], createdAt: 1,
    config: { taskId: task.taskId, taskRevision: task.revision, contextWorkspaceId: workspace.workspaceId } });
  for (const step of trace()) repo.saveStep(step);
  const execute = vi.fn(async () => ({ status: "completed" as const, steps: [
    { stepId: "skill-1", op: "fill", status: "ok" as const, startedAt: 1, durationMs: 1 },
    { stepId: "skill-2", op: "click", status: "ok" as const, startedAt: 2, durationMs: 1 },
    { stepId: "skill-3", op: "waitFor", status: "ok" as const, startedAt: 3, durationMs: 1 },
  ] }));
  const pages = { get: () => ({ url: "https://example.test/search", ownedByRuntime: false }),
    isAttached: () => true, execute } as unknown as PageService;
  let routines!: RoutineService;
  routines = new RoutineService(repo, events, async (routine, parameters) =>
    startSkillReplay({ repo, pages, events, routine, pageId: "page-1", parameters }));
  const created = routines.fromResult({ taskId: task.taskId, runId: "source-run", title: "Reusable search",
    parameters: [{ name: "topic", label: "Topic" }] });
  expect(created).toMatchObject({ paused: true, activationReview: "run_result" });
  repo.saveRun({ runId: "foreign-run", goal: "Search elsewhere", status: "completed", pageIds: ["page-1"], createdAt: 2,
    config: { taskId: task.taskId, taskRevision: task.revision, contextWorkspaceId: "other-space" } });
  expect(() => routines.compileReplay({ routineId: created.routineId, expectedRevision: created.revision,
    sourceRunId: "foreign-run", pageId: "page-1", samples: { topic: "hosting" } }, pages)).toThrow(/exact saved task/);
  const candidate = routines.compileReplay({ routineId: created.routineId, expectedRevision: created.revision,
    sourceRunId: "source-run", pageId: "page-1", samples: { topic: "hosting" } }, pages);
  expect(candidate.replay).toMatchObject({ state: "untested", siteOrigin: "https://example.test" });
  expect(candidate.paused).toBe(true);
  expect(() => routines.update({ routineId: candidate.routineId, expectedRevision: candidate.revision,
    paused: false, activationReviewed: true })).toThrow(/Test the current/);
  const testing = routines.testReplay({ routineId: candidate.routineId, expectedRevision: candidate.revision,
    pageId: "page-1", parameters: { topic: "payments" } }, pages);
  await vi.waitFor(() => expect(repo.getRun(testing.runId)?.status).toBe("completed"));
  // Native executor normally flushes these step rows; the fixture records the same durable ledger.
  for (const [index, step] of trace().entries()) repo.saveStep({ ...step, runId: testing.runId,
    stepId: `test-${index}`, inputs: index === 0 ? { target: "css:#query", value: "payments" }
      : index === 2 ? { condition: { kind: "textVisible", text: "payments" } } : step.inputs,
    outcome: { ...step.outcome!, stepId: `test-${index}` } });
  expect(() => routines.resultReplay({ routineId: candidate.routineId, expectedRevision: testing.revision,
    runId: "source-run" })).toThrow(/pending test/);
  const tested = routines.resultReplay({ routineId: candidate.routineId, expectedRevision: testing.revision,
    runId: testing.runId });
  expect(tested.replay).toMatchObject({ state: "tested", testedRevision: tested.revision });
  const active = routines.update({ routineId: tested.routineId, expectedRevision: tested.revision,
    paused: false, activationReviewed: true });
  expect(active.replay?.testedRevision).toBe(active.revision);
  expect((await routines.run({ routineId: active.routineId, expectedRevision: active.revision,
    parameters: { topic: "analytics" } })).status).toBe("running");
  expect(execute).toHaveBeenCalledWith(expect.objectContaining({ steps: expect.arrayContaining([
    expect.objectContaining({ op: "fill", value: "analytics" })]) }),
    expect.objectContaining({ allowEval: false, taskId: task.taskId }));
  execute.mockResolvedValueOnce({ status: "failed", steps: [], error: "The result selector changed" } as never);
  const driftedRun = await routines.run({ routineId: active.routineId, expectedRevision: active.revision,
    parameters: { topic: "new topic" } });
  await vi.waitFor(() => expect(repo.getRun(driftedRun.runId!)?.status).toBe("failed"));
  const drifted = routines.get(active.routineId).routine;
  expect(drifted).toMatchObject({ paused: true, activationReview: "run_result", replay: { state: "needs_repair" } });
  expect(() => routines.testReplay({ routineId: drifted.routineId, expectedRevision: drifted.revision,
    pageId: "page-1", parameters: { topic: "again" } }, pages)).toThrow(/changed or is already testing/);
  const changed = routines.update({ routineId: drifted.routineId, expectedRevision: drifted.revision,
    objective: "Changed objective" });
  expect(changed).toMatchObject({ paused: true, activationReview: "run_result", replay: { state: "needs_repair" } });
  await expect(routines.run({ routineId: changed.routineId, expectedRevision: changed.revision })).rejects.toThrow(/Resume/);
});

it("fails a completed executor result when its page leaves the tested site before settlement", async () => {
  const db = openDb(":memory:"); handles.push(db);
  const repo = new Repo(db), events = new EventBus(repo);
  let url = "https://example.test/search";
  const pages = { get: () => ({ url, ownedByRuntime: false }), isAttached: () => true,
    execute: vi.fn(async () => { url = "https://other.test/"; return { status: "completed" as const, steps: [] }; }) } as unknown as PageService;
  const routine = { routineId: "routine-1", title: "Search", parameters: [{ name: "topic" }],
    replay: { sourceRunId: "source", siteOrigin: "https://example.test", steps: compileSkillTrace(trace(), { topic: "hosting" }),
      digest: "" } } as unknown as Parameters<typeof startSkillReplay>[0]["routine"];
  routine.replay!.digest = (await import("../../apps/runtime/src/services/skill-replay.js")).replayDigest(
    "source", "https://example.test", routine.replay!.steps);
  const { runId } = startSkillReplay({ repo, pages, events, routine, pageId: "page-1", parameters: { topic: "new" } });
  await vi.waitFor(() => expect(repo.getRun(runId)?.status).toBe("failed"));
  expect(repo.getRun(runId)?.error).toMatch(/page changed/);
});
