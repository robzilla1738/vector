import { randomBytes, createHash } from "node:crypto";
import { initializeFieldCodec } from "../../apps/runtime/src/store/field-codec.js";
import { afterEach, expect, it, vi } from "vitest";
import {
  EventBus,
  HookService,
  installRunEndHooks,
  nextScheduledTime,
  openDb,
  Repo,
  TaskService,
} from "@aux/runtime";
import type { PageService } from "../../apps/runtime/src/services/pages.js";
import { RoutineService } from "../../apps/runtime/src/services/routines.js";
import {
  bindSkillParameters,
  compileSkillTrace,
  replayDigest,
  requireRoutineTriggerPage,
  selectSkillReplayPage,
  startSkillReplay,
} from "../../apps/runtime/src/services/skill-replay.js";
import type { StepRecord } from "@aux/contracts";

async function protectedRepo(db: ReturnType<typeof openDb>) {
  const keys = new Map<string, string>();
  const make = (key: string) => {
    if (!keys.has(key)) keys.set(key, randomBytes(32).toString("base64"));
    return { value: keys.get(key)! };
  };
  const cipher = await initializeFieldCodec(
    db,
    {
      readSecret: async (key) => ({ value: keys.get(key) }),
      storeSecret: async (key, value) => {
        keys.set(key, value);
        return { ok: true };
      },
      profileStorageRoot: async () =>
        make(`aux_root_v1_${createHash("sha256").update("fixture").digest("hex").slice(0, 24)}`),
      profileStorageFactor: async () =>
        make(`sqlite_factor_v1_${createHash("sha256").update("fixture").digest("hex").slice(0, 24)}`),
    },
    "fixture",
  );
  return new Repo(db, cipher);
}
function saveDirectRoutine(repo: Repo, routine: Parameters<typeof startSkillReplay>[0]["routine"]) {
  repo.insertWorkspace("direct-fixture", "Direct replay", 1);
  routine.revision = 1;
  routine.workspaceId = "direct-fixture";
  repo.db
    .prepare("INSERT INTO routines VALUES(?,?,?,?,?,?,?)")
    .run(routine.routineId, routine.workspaceId, 1, 1, null, 1, JSON.stringify(routine));
}
const sourceStep = (
  op: string,
  inputs: Record<string, unknown>,
  index: number,
  pageId = "page-1",
): StepRecord => ({
  stepId: `source-${index}`,
  runId: "source-run",
  pageId,
  op,
  inputs,
  startedAt: index,
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
  expect(steps.at(-1)).toMatchObject({
    op: "waitFor",
    condition: { kind: "textVisible", text: "{{topic}}" },
  });
  expect(bindSkillParameters(steps, { topic: 'new "value"' }, ["topic"])).toMatchObject([
    { op: "fill", value: 'new "value"' },
    { op: "click" },
    { op: "waitFor", condition: { text: 'new "value"' } },
  ]);
  expect(() => bindSkillParameters(steps, { other: "new" }, ["topic"])).toThrow(/reviewed value/);
  expect(() => compileSkillTrace(trace().slice(0, 2), { topic: "hosting" })).toThrow(/oracle/);
  expect(() =>
    compileSkillTrace(
      [sourceStep("fill", { target: "css:#password", value: "hosting" }, 1), ...trace().slice(1)],
      { topic: "hosting" },
    ),
  ).toThrow(/Credential/);
  expect(() =>
    compileSkillTrace([sourceStep("fill", { target: "r1", value: "hosting" }, 1), ...trace().slice(1)], {
      topic: "hosting",
    }),
  ).toThrow(/stable/);
  expect(() =>
    compileSkillTrace(
      [trace()[0]!, sourceStep("click", { target: "css:#search" }, 2, "other"), trace()[2]!],
      { topic: "hosting" },
    ),
  ).toThrow(/one browser page/);
  expect(() =>
    compileSkillTrace(
      trace().map((step, index, all) =>
        index === all.length - 1
          ? {
              ...step,
              outcome: {
                ...step.outcome!,
                effect: "uncertain",
                receipt: { uncertain: true, remoteConfirmed: false, dispatchedBeforeTakeover: false },
              },
            }
          : step,
      ),
      { topic: "hosting" },
    ),
  ).toThrow(/verified/);
});

it("selects the attached task tab on the tested origin without falling back to another site", () => {
  const pages = {
    get: (pageId: string) => ({
      url: pageId === "right" ? "https://example.test/search" : "https://other.test/",
      ownedByRuntime: false,
      sessionId: "fixture-attachment",
      documentEpoch: 0,
      controllerEpoch: 0,
    }),
    isAttached: (pageId: string) => pageId !== "detached",
  } as unknown as PageService;
  expect(selectSkillReplayPage(pages, ["detached", "wrong", "right"], "https://example.test")).toBe("right");
  expect(() => selectSkillReplayPage(pages, ["wrong"], "https://example.test")).toThrow(/tested site/);
});

it("refuses a different same-site tab or changed document at automation dispatch", () => {
  const pages = {
    get: (pageId: string) => ({
      url: "https://example.test/search",
      documentEpoch: pageId === "watched" ? 4 : 3,
      ownedByRuntime: false,
      sessionId: "fixture-attachment",
      controllerEpoch: 0,
    }),
    isAttached: () => true,
  } as unknown as PageService;
  expect(() => requireRoutineTriggerPage(pages, "watched", "https://example.test/search", 3)).toThrow(
    /document changed/,
  );
  expect(() => requireRoutineTriggerPage(pages, "other", "https://example.test/search", 4)).toThrow(
    /document changed/,
  );
  expect(requireRoutineTriggerPage(pages, "watched", "https://example.test/search", 4)).toBe("watched");
});

const handles: { close(): void }[] = [];
afterEach(() => {
  for (const handle of handles.splice(0)) handle.close();
});

it("keeps a run-derived Skill paused through compile/test, binds exact proof, and pauses on drift", async () => {
  const db = openDb(":memory:");
  handles.push(db);
  const repo = await protectedRepo(db),
    events = new EventBus(repo),
    tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Skill fixture");
  const task = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Search fixture",
    objective: "Search {{topic}}",
    criteria: [{ criterionId: "found", description: "Result visible", verification: "manual" }],
    resources: [
      { resourceId: "source", kind: "url", locator: "https://example.test/search", label: "Search" },
    ],
  });
  repo.saveRun({
    runId: "source-run",
    goal: "Search hosting",
    status: "completed",
    pageIds: ["page-1"],
    createdAt: 1,
    config: { taskId: task.taskId, taskRevision: task.revision, contextWorkspaceId: workspace.workspaceId },
  });
  for (const step of trace()) repo.saveStep(step);
  const execute = vi.fn(
    async (
      program: { steps: Array<{ id: string; op: string; [key: string]: unknown }> },
      ctx: { runId?: string },
    ) => {
      for (const [index, step] of program.steps.entries()) {
        const { id: _id, op, timeoutMs: _timeoutMs, optional: _optional, expect: _expect, ...inputs } = step;
        repo.saveStep({
          stepId: `verified-${ctx.runId}-${step.id}`,
          runId: ctx.runId!,
          pageId: "page-1",
          op,
          inputs,
          startedAt: index,
          outcome: {
            stepId: `verified-${ctx.runId}-${step.id}`,
            op,
            status: "ok",
            startedAt: index,
            durationMs: 1,
          },
        });
      }
      return {
        status: "completed" as const,
        steps: [
          { stepId: "skill-1", op: "fill", status: "ok" as const, startedAt: 1, durationMs: 1 },
          { stepId: "skill-2", op: "click", status: "ok" as const, startedAt: 2, durationMs: 1 },
          { stepId: "skill-3", op: "waitFor", status: "ok" as const, startedAt: 3, durationMs: 1 },
        ],
      };
    },
  );
  const pages = {
    get: () => ({
      url: "https://example.test/search",
      ownedByRuntime: false,
      sessionId: "fixture-attachment",
      documentEpoch: 0,
      controllerEpoch: 0,
    }),
    isAttached: () => true,
    execute,
  } as unknown as PageService;
  let routines!: RoutineService;
  routines = new RoutineService(repo, events, async (routine, parameters) =>
    startSkillReplay({ repo, pages, events, routine, pageId: "page-1", parameters }),
  );
  const created = routines.fromResult({
    taskId: task.taskId,
    runId: "source-run",
    title: "Reusable search",
    parameters: [{ name: "topic", label: "Topic", value: "hosting" }],
    reviewRequired: false,
    trigger: { kind: "schedule", timezone: "UTC", hour: 9, minute: 0, days: [0, 1, 2, 3, 4, 5, 6] },
  });
  expect(created).toMatchObject({ paused: true, activationReview: "run_result" });
  repo.saveRun({
    runId: "foreign-run",
    goal: "Search elsewhere",
    status: "completed",
    pageIds: ["page-1"],
    createdAt: 2,
    config: { taskId: task.taskId, taskRevision: task.revision, contextWorkspaceId: "other-space" },
  });
  expect(() =>
    routines.compileReplay(
      {
        routineId: created.routineId,
        expectedRevision: created.revision,
        sourceRunId: "foreign-run",
        pageId: "page-1",
        samples: { topic: "hosting" },
      },
      pages,
    ),
  ).toThrow(/exact saved task/);
  const candidate = routines.compileReplay(
    {
      routineId: created.routineId,
      expectedRevision: created.revision,
      sourceRunId: "source-run",
      pageId: "page-1",
      samples: { topic: "hosting" },
    },
    pages,
  );
  expect(candidate.replay).toMatchObject({ state: "untested", siteOrigin: "https://example.test" });
  expect(candidate.paused).toBe(true);
  expect(() =>
    routines.update({
      routineId: candidate.routineId,
      expectedRevision: candidate.revision,
      paused: false,
      activationReviewed: true,
    }),
  ).toThrow(/Test the current/);
  const testing = routines.testReplay(
    {
      routineId: candidate.routineId,
      expectedRevision: candidate.revision,
      pageId: "page-1",
      parameters: { topic: "payments" },
    },
    pages,
  );
  await vi.waitFor(() => expect(repo.getRun(testing.runId)?.status).toBe("completed"));
  expect(() =>
    routines.resultReplay({
      routineId: candidate.routineId,
      expectedRevision: testing.revision,
      runId: "source-run",
    }),
  ).toThrow(/pending test/);
  const tested = routines.resultReplay({
    routineId: candidate.routineId,
    expectedRevision: testing.revision,
    runId: testing.runId,
  });
  expect(tested.replay).toMatchObject({ state: "tested", testedRevision: tested.revision });
  const active = routines.update({
    routineId: tested.routineId,
    expectedRevision: tested.revision,
    paused: false,
    activationReviewed: true,
  });
  expect(active.replay?.testedRevision).toBe(active.revision);
  const hooks = new HookService(repo, (handler, workspaceId) => {
    expect(workspaceId).toBe(workspace.workspaceId);
    expect(handler).toMatchObject({ type: "mcp_tool", serverId: "fixture", toolName: "record_result" });
  });
  const hook = hooks.register({
    workspaceId: workspace.workspaceId,
    event: "run.end",
    handler: {
      type: "mcp_tool",
      serverId: "fixture",
      toolName: "record_result",
    },
  });
  expect(hook.trust).toBe("approved");
  let hookCalls = 0;
  const stopHooks = installRunEndHooks(events, hooks, async () => {
    hookCalls++;
  });
  const scheduledFor = nextScheduledTime(
    active.trigger as Extract<typeof active.trigger, { kind: "schedule" }>,
    Date.now(),
  );
  const occurrence = (await routines.due(scheduledFor))[0]!;
  expect(occurrence.status).toBe("running");
  expect(occurrence).toMatchObject({ routineId: active.routineId, revision: active.revision });
  expect(occurrence.occurrenceIdentity).toBeTruthy();
  await vi.waitFor(() => expect(repo.getRun(occurrence.runId!)?.status).toBe("completed"));
  await vi.waitFor(() => expect(hooks.invocations(hook.hookId)).toHaveLength(1));
  expect(hooks.invocations(hook.hookId)[0]).toMatchObject({
    eventId: `run:${occurrence.runId}:end`,
    state: "completed",
  });
  expect(hookCalls).toBe(1);
  expect(routines.inbox({ workspaceId: workspace.workspaceId })[0]?.run).toMatchObject({
    routineRunId: occurrence.routineRunId,
    status: "completed",
    runId: occurrence.runId,
  });
  expect(await routines.due(scheduledFor)).toEqual([]);
  expect(hookCalls).toBe(1);
  stopHooks();
  const analytics = await routines.run({
    routineId: active.routineId,
    expectedRevision: active.revision,
    parameters: { topic: "analytics" },
  });
  expect(analytics.status).toBe("running");
  expect(execute).toHaveBeenCalledWith(
    expect.objectContaining({
      steps: expect.arrayContaining([expect.objectContaining({ op: "fill", value: "analytics" })]),
    }),
    expect.objectContaining({ allowEval: false, taskId: task.taskId }),
  );
  await vi.waitFor(() => expect(repo.getRun(analytics.runId!)?.status).toBe("completed"));
  execute.mockResolvedValueOnce({
    status: "failed",
    steps: [],
    error: "The result selector changed",
  } as never);
  const driftedRun = await routines.run({
    routineId: active.routineId,
    expectedRevision: active.revision,
    parameters: { topic: "new topic" },
  });
  await vi.waitFor(() => expect(repo.getRun(driftedRun.runId!)?.status).toBe("failed"));
  const drifted = routines.get(active.routineId).routine;
  expect(drifted).toMatchObject({
    paused: true,
    activationReview: "run_result",
    replay: { state: "needs_repair" },
  });
  expect(() =>
    routines.testReplay(
      {
        routineId: drifted.routineId,
        expectedRevision: drifted.revision,
        pageId: "page-1",
        parameters: { topic: "again" },
      },
      pages,
    ),
  ).toThrow(/changed or is already testing/);
  const changed = routines.update({
    routineId: drifted.routineId,
    expectedRevision: drifted.revision,
    objective: "Changed objective",
  });
  expect(changed).toMatchObject({
    paused: true,
    activationReview: "run_result",
    replay: { state: "needs_repair" },
  });
  await expect(
    routines.run({ routineId: changed.routineId, expectedRevision: changed.revision }),
  ).rejects.toThrow(/Resume/);
});

it("fails a completed executor result when its page leaves the tested site before settlement", async () => {
  const db = openDb(":memory:");
  handles.push(db);
  const repo = await protectedRepo(db),
    events = new EventBus(repo);
  let url = "https://example.test/search";
  const pages = {
    get: () => ({
      url,
      ownedByRuntime: false,
      sessionId: "fixture-attachment",
      documentEpoch: 0,
      controllerEpoch: 0,
    }),
    isAttached: () => true,
    execute: vi.fn(async () => {
      url = "https://other.test/";
      return { status: "completed" as const, steps: [] };
    }),
  } as unknown as PageService;
  const routine = {
    routineId: "routine-1",
    title: "Search",
    parameters: [{ name: "topic" }],
    replay: {
      format: 2,
      sourceRunId: "source",
      siteOrigin: "https://example.test",
      siteOrigins: ["https://example.test"],
      steps: compileSkillTrace(trace(), { topic: "hosting" }),
      digest: "",
    },
  } as unknown as Parameters<typeof startSkillReplay>[0]["routine"];
  routine.replay!.digest = (await import("../../apps/runtime/src/services/skill-replay.js")).replayDigest(
    "source",
    "https://example.test",
    routine.replay!.steps,
  );
  saveDirectRoutine(repo, routine);
  const { runId } = startSkillReplay({
    repo,
    pages,
    events,
    routine,
    pageId: "page-1",
    parameters: { topic: "new" },
  });
  await vi.waitFor(() => expect(repo.getRun(runId)?.status).toBe("failed"));
  expect(repo.getRun(runId)?.error).toMatch(/verified receipt|site changed/);
});

it("refuses a completed replay without exact durable step receipts", async () => {
  const db = openDb(":memory:");
  handles.push(db);
  const repo = await protectedRepo(db),
    events = new EventBus(repo);
  const pages = {
    get: () => ({
      url: "https://example.test/search",
      ownedByRuntime: false,
      sessionId: "fixture-attachment",
      documentEpoch: 0,
      controllerEpoch: 0,
    }),
    isAttached: () => true,
    execute: vi.fn(async () => ({ status: "completed" as const, steps: [] })),
  } as unknown as PageService;
  const steps = compileSkillTrace(trace(), { topic: "hosting" });
  const routine = {
    routineId: "routine-1",
    title: "Search",
    parameters: [{ name: "topic" }],
    replay: {
      format: 2,
      sourceRunId: "source",
      siteOrigin: "https://example.test",
      siteOrigins: ["https://example.test"],
      steps,
      digest: (await import("../../apps/runtime/src/services/skill-replay.js")).replayDigest(
        "source",
        "https://example.test",
        steps,
      ),
    },
  } as unknown as Parameters<typeof startSkillReplay>[0]["routine"];
  saveDirectRoutine(repo, routine);
  const { runId } = startSkillReplay({
    repo,
    pages,
    events,
    routine,
    pageId: "page-1",
    parameters: { topic: "new" },
  });
  await vi.waitFor(() => expect(repo.getRun(runId)?.status).toBe("failed"));
  expect(repo.getRun(runId)?.error).toMatch(/verified receipt/);
});

it("replays a new parameter through the final oracle and does not keep a drifted oracle", async () => {
  const db = openDb(":memory:");
  handles.push(db);
  const repo = await protectedRepo(db),
    events = new EventBus(repo);
  const steps = compileSkillTrace(
    trace().map((step, index) =>
      index === 1
        ? {
            ...step,
            outcome: {
              ...step.outcome!,
              effect: "uncertain",
              receipt: {
                uncertain: true,
                remoteConfirmed: false,
                unconfirmed: false,
                dispatchedBeforeTakeover: false,
              },
            },
          }
        : step,
    ),
    { topic: "hosting" },
  );
  expect(JSON.stringify(steps)).not.toContain("hosting");
  expect(steps[1]).toMatchObject({ op: "click", expect: [{ kind: "textVisible", text: "{{topic}}" }] });
  expect(steps.at(-1)).toMatchObject({
    op: "waitFor",
    condition: { kind: "textVisible", text: "{{topic}}" },
  });
  const routine = {
    routineId: "routine-1",
    title: "Search",
    parameters: [{ name: "topic" }],
    replay: {
      format: 2,
      sourceRunId: "source",
      siteOrigin: "https://example.test",
      siteOrigins: ["https://example.test"],
      steps,
      digest: replayDigest("source", "https://example.test", steps),
    },
  } as unknown as Parameters<typeof startSkillReplay>[0]["routine"];
  let drift = false;
  const execute = vi.fn(
    async (
      program: { steps: Array<{ id: string; op: string; [key: string]: unknown }> },
      ctx: { runId?: string },
    ) => {
      program.steps.forEach((step, index) => {
        const { id: _id, op, timeoutMs: _timeoutMs, optional: _optional, expect: _expect, ...inputs } = step;
        const oracle = step.op === "waitFor";
        const recorded =
          drift && oracle ? { ...inputs, condition: { kind: "textVisible", text: "hosting" } } : inputs;
        repo.saveStep({
          stepId: `${ctx.runId}-${step.id}`,
          runId: ctx.runId!,
          pageId: "page-1",
          op,
          inputs: recorded,
          startedAt: index,
          outcome: {
            stepId: `${ctx.runId}-${step.id}`,
            op,
            status: "ok",
            startedAt: index,
            durationMs: 1,
            effect: "observed",
            receipt: {
              remoteConfirmed: false,
              uncertain: false,
              unconfirmed: false,
              dispatchedBeforeTakeover: false,
              observed:
                op === "click"
                  ? "postconditions satisfied: textVisible"
                  : op === "waitFor"
                    ? "textVisible"
                    : "control value changed after action",
            },
          },
        });
      });
      return { status: "completed" as const, steps: [], extracted: { visible: "payments" } };
    },
  );
  const pages = {
    get: () => ({
      url: "https://example.test/search",
      ownedByRuntime: false,
      sessionId: "fixture-attachment",
      documentEpoch: 0,
      controllerEpoch: 0,
    }),
    isAttached: () => true,
    execute,
  } as unknown as PageService;
  saveDirectRoutine(repo, routine);
  const proven = startSkillReplay({
    repo,
    pages,
    events,
    routine,
    pageId: "page-1",
    parameters: { topic: "payments" },
  });
  await vi.waitFor(() => expect(repo.getRun(proven.runId)?.status).toBe("completed"));
  expect(execute.mock.calls.map(([program]) => program.steps[0])).toMatchObject([
    { op: "fill", value: "payments" },
    { op: "click", target: "css:#search", expect: [{ kind: "textVisible", text: "payments" }] },
    { op: "waitFor", condition: { kind: "textVisible", text: "payments" } },
  ]);
  expect(
    execute.mock.calls.every(([, context]) => (context as { allowEval?: boolean }).allowEval === false),
  ).toBe(true);
  expect(repo.getRun(proven.runId)?.result).toEqual({ visible: "payments" });
  drift = true;
  const drifted = startSkillReplay({
    repo,
    pages,
    events,
    routine,
    pageId: "page-1",
    parameters: { topic: "payments" },
  });
  await vi.waitFor(() => expect(repo.getRun(drifted.runId)?.status).toBe("failed"));
  expect(repo.getRun(drifted.runId)?.result).toBeUndefined();
  expect(repo.getRun(drifted.runId)?.error).toMatch(/verified receipt/);
});
