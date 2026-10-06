import { expect, it } from "vitest";
import { EventBus, GoalService, openDb, Repo, TaskService } from "@aux/runtime";
import type { Run } from "@aux/contracts";
import type { RunService } from "@aux/runtime";
import { DEFAULT_PLANNER_MODEL_ID } from "@aux/contracts/model-registry";

function fixture() {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  const workspace = new TaskService(repo, new EventBus(repo)).createWorkspace("Research");
  let started: Record<string, unknown> | undefined;
  const transition = (runId: string, status: Run["status"]) => {
    const run = repo.getRun(runId)!;
    repo.saveRun({ ...run, status });
    return repo.getRun(runId)!;
  };
  const runs = {
    start: async (opts: Record<string, unknown>) => {
      started = opts;
      const run: Run = {
        runId: String(opts.deliveryRunId),
        goal: String(opts.goal),
        pageIds: opts.pageIds as string[],
        status: "running",
        createdAt: Date.now(),
      };
      repo.saveRun(run);
      return run;
    },
    pause: (id: string) => transition(id, "paused"),
    resume: (id: string) => transition(id, "running"),
    cancel: (id: string) => transition(id, "cancelled"),
  } as unknown as Pick<RunService, "start" | "pause" | "resume" | "cancel">;
  return { db, repo, workspace, goals: new GoalService(repo, runs), runs, started: () => started };
}

it("runs a durable goal with the coordinator's token, cost and wall-time limits", async () => {
  const f = fixture();
  const goal = f.goals.create({
    workspaceId: f.workspace.workspaceId,
    objective: "Compare sources",
    budget: { maxTokens: 10_000, maxCostUsd: 2, deadlineMs: 120_000 },
  });
  expect(goal.status).toBe("draft");
  await expect(f.goals.start(goal.goalId, [])).rejects.toThrow(/one to eight/);
  const active = await f.goals.start(goal.goalId, ["p1"]);
  expect(active).toMatchObject({ status: "active", runId: expect.stringMatching(/^run_/) });
  expect(f.started()).toMatchObject({
    goal: "Compare sources",
    pageIds: ["p1"],
    engine: "agent-loop",
    defaultWorkspaceId: f.workspace.workspaceId,
    maxTokens: 10_000,
    maxCostUsd: 2,
    deadlineMs: 120_000,
  });
  await expect(f.goals.start(goal.goalId, ["p1"])).rejects.toThrow(/already started/);
  f.repo.saveModelCall({
    callId: "call-1",
    runId: active.runId!,
    role: "planner",
    modelId: "fixture",
    durationMs: 1,
    inputTokens: 100,
    outputTokens: 50,
    costUsd: 0.3,
    createdAt: Date.now(),
  });
  expect(f.goals.get(goal.goalId)).toMatchObject({ usedTokens: 150, knownCostUsd: 0.3, costComplete: true });
  expect((await f.goals.pause(goal.goalId)).status).toBe("paused");
  expect((await f.goals.resume(goal.goalId)).status).toBe("active");
  expect((await f.goals.cancel(goal.goalId)).status).toBe("cancelled");
  expect(f.goals.list(f.workspace.workspaceId)).toHaveLength(1);
  f.db.close();
});

it("does not retry a goal whose run linkage was interrupted", async () => {
  const f = fixture();
  const goal = f.goals.create({
    workspaceId: f.workspace.workspaceId,
    objective: "Review",
    budget: { maxTokens: 100 },
  });
  f.repo.db.prepare("UPDATE goals SET status='starting' WHERE goal_id=?").run(goal.goalId);
  const recovered = new GoalService(f.repo, f.runs);
  expect(recovered.get(goal.goalId).status).toBe("needs_input");
  await expect(f.goals.start(goal.goalId, ["p1"])).rejects.toThrow(/needs review/);
  expect((await recovered.cancel(goal.goalId)).status).toBe("cancelled");
  f.db.close();
});

it("reserves the Goal run identity before the coordinator can launch a model turn", async () => {
  const f = fixture();
  const goal = f.goals.create({
    workspaceId: f.workspace.workspaceId,
    objective: "Check",
    budget: { maxTokens: 100 },
  });
  const originalStart = f.runs.start;
  f.runs.start = async (opts) => {
    const reserved = f.repo.db
      .prepare("SELECT run_id,status FROM goals WHERE goal_id=?")
      .get(goal.goalId) as { run_id: string; status: string };
    expect(reserved).toMatchObject({ run_id: opts.deliveryRunId, status: "starting" });
    return originalStart(opts);
  };
  await f.goals.start(goal.goalId, ["p1"]);
  f.db.close();
});

it("keeps one unfinished Goal per conversation and carries that conversation into the run", async () => {
  const f = fixture();
  const input = {
    workspaceId: f.workspace.workspaceId,
    chatId: "chat-one",
    objective: "Review the page",
    budget: { maxTokens: 1200 },
  };
  const first = f.goals.create(input);
  expect(() => f.goals.create(input)).toThrow(/Finish or cancel/);
  const otherSpace = new TaskService(f.repo, new EventBus(f.repo)).createWorkspace("Other");
  expect(() => f.goals.create({ ...input, workspaceId: otherSpace.workspaceId })).toThrow(/Finish or cancel/);
  expect((await f.goals.cancel(first.goalId)).status).toBe("cancelled");
  const second = f.goals.create(input);
  await f.goals.start(second.goalId, ["p1"]);
  expect(f.started()).toMatchObject({ chatId: "chat-one", maxTokens: 1200 });
  expect(() => f.goals.create(input)).toThrow(/Finish or cancel/);
  await f.goals.cancel(second.goalId);
  expect(f.goals.create(input).chatId).toBe("chat-one");
  f.repo.setSetting("conversationWorkspace:chat-other", "different-space");
  expect(() => f.goals.create({ ...input, chatId: "chat-other" })).toThrow(/another Space/);
  f.db.close();
});

it("requires the same blocker in three consecutive model turns and leaves owner limits untouched", async () => {
  const f = fixture();
  const goal = f.goals.create({
    workspaceId: f.workspace.workspaceId,
    objective: "Investigate",
    budget: { maxTokens: 1_200 },
  });
  const active = await f.goals.start(goal.goalId, ["p1"]);
  const runId = active.runId!;
  await expect(f.goals.report("not-a-goal", "paused", undefined, 1)).rejects.toThrow(/not a Goal/);
  expect(await f.goals.report(runId, "blocked", "Authentication needed", 1)).toEqual({
    status: "still_active",
    remaining: 2,
  });
  expect(await f.goals.report(runId, "blocked", "Different blocker", 2)).toEqual({
    status: "still_active",
    remaining: 2,
  });
  expect(await f.goals.report(runId, "blocked", "Authentication needed", 3)).toEqual({
    status: "still_active",
    remaining: 2,
  });
  expect(await f.goals.report(runId, "blocked", "Authentication needed", 4)).toEqual({
    status: "still_active",
    remaining: 1,
  });
  await expect(f.goals.report(runId, "blocked", "Authentication needed", 4)).rejects.toThrow(/at most once/);
  expect(await f.goals.report(runId, "blocked", "Authentication needed", 5)).toEqual({ status: "blocked" });
  expect(f.goals.get(goal.goalId)).toMatchObject({
    status: "blocked",
    blocker: "Authentication needed",
    blockerStreak: 3,
    budget: { maxTokens: 1_200 },
  });
  expect(await f.goals.resume(goal.goalId)).toMatchObject({ status: "active", blockerStreak: 0 });
  expect(await f.goals.report(runId, "paused", undefined, 6)).toEqual({ status: "paused" });
  expect(f.goals.get(goal.goalId).status).toBe("paused");
  f.db.close();
});

it("funds one provider attempt before dispatch and reconciles actual usage across restart", async () => {
  const f = fixture();
  const goal = f.goals.create({
    workspaceId: f.workspace.workspaceId,
    objective: "Read fixture",
    budget: { maxTokens: 1350, maxCostUsd: 1 },
  });
  const { runId } = await f.goals.start(goal.goalId, ["p1"]);
  const request = {
    modelId: DEFAULT_PLANNER_MODEL_ID,
    promptBytes: 100,
    toolsBytes: 100,
    maxOutputTokens: 100,
  };
  const reservation = await f.goals.reserveModelCall(runId!, request);
  expect(reservation).toBeTruthy();
  expect(f.goals.get(goal.goalId).reservedTokens).toBe(1324);
  const afterRestart = new GoalService(f.repo, f.runs);
  await expect(afterRestart.reserveModelCall(runId!, request)).rejects.toThrow(/uncertain charge/);
  // The call is written durably before capacity is refunded.
  f.repo.saveModelCall({
    callId: "funded-1",
    runId,
    role: "agent",
    modelId: request.modelId,
    durationMs: 1,
    inputTokens: 10,
    outputTokens: 5,
    costUsd: 0.001,
    createdAt: Date.now(),
  });
  afterRestart.settleModelCall(runId!, reservation, [
    { modelId: request.modelId, durationMs: 1, inputTokens: 10, outputTokens: 5 },
  ]);
  expect(afterRestart.get(goal.goalId)).toMatchObject({ usedTokens: 15, reservedTokens: 0 });
  const second = await afterRestart.reserveModelCall(runId!, request);
  f.repo.saveModelCall({
    callId: "funded-2",
    runId,
    role: "agent",
    modelId: request.modelId,
    durationMs: 1,
    inputTokens: 10,
    outputTokens: 5,
    costUsd: 0.001,
    createdAt: Date.now(),
  });
  afterRestart.settleModelCall(runId!, second, [
    { modelId: request.modelId, durationMs: 1, inputTokens: 10, outputTokens: 5 },
  ]);
  await expect(afterRestart.reserveModelCall(runId!, request)).rejects.toThrow(/token limit/);
  f.db.close();
});

it("keeps opaque charges held, rejects unknown prices, and requires verified completion", async () => {
  const f = fixture();
  const goal = f.goals.create({
    workspaceId: f.workspace.workspaceId,
    objective: "Read fixture",
    budget: { maxTokens: 1500, maxCostUsd: 1 },
  });
  const { runId } = await f.goals.start(goal.goalId, ["p1"]);
  await expect(
    f.goals.reserveModelCall(runId!, {
      modelId: "custom/unpriced",
      promptBytes: 1,
      toolsBytes: 1,
      maxOutputTokens: 1,
    }),
  ).rejects.toThrow(/priced model/);
  const request = {
    modelId: DEFAULT_PLANNER_MODEL_ID,
    promptBytes: 100,
    toolsBytes: 100,
    maxOutputTokens: 100,
  };
  const held = await f.goals.reserveModelCall(runId!, request);
  f.repo.saveModelCall({
    callId: "opaque-1",
    runId,
    role: "agent",
    modelId: request.modelId,
    durationMs: 1,
    error: "provider response lost",
    createdAt: Date.now(),
  });
  f.goals.settleModelCall(runId!, held, []);
  expect(f.goals.get(goal.goalId).reservedTokens).toBe(1324);
  await expect(f.goals.reserveModelCall(runId!, request)).rejects.toThrow(/uncertain charge/);
  const current = f.repo.getRun(runId!)!;
  f.repo.saveRun({ ...current, status: "completed" });
  expect(f.goals.get(goal.goalId).status).toBe("failed");
  f.repo.saveCheckpoint(`run:${runId}`, "goal_verified", { accepted: true });
  expect(f.goals.get(goal.goalId).status).toBe("completed");
  f.db.close();
});

it("refuses an unfunded price or expired wall clock before any model dispatch", async () => {
  const f = fixture();
  const priced = new GoalService(f.repo, f.runs, async () => [
    {
      id: "fixture/expensive",
      source: "configured",
      inputUsdPerMTok: 1_000_000,
      outputUsdPerMTok: 1_000_000,
    },
  ]);
  const costGoal = priced.create({
    workspaceId: f.workspace.workspaceId,
    objective: "Cost bound",
    budget: { maxCostUsd: 1 },
  });
  const costRun = await priced.start(costGoal.goalId, ["p1"]);
  await expect(
    priced.reserveModelCall(costRun.runId!, {
      modelId: "fixture/expensive",
      promptBytes: 1,
      toolsBytes: 1,
      maxOutputTokens: 1,
    }),
  ).rejects.toThrow(/cost limit exhausted/);
  const timed = f.goals.create({
    workspaceId: f.workspace.workspaceId,
    objective: "Time bound",
    budget: { deadlineMs: 60_000 },
  });
  const timedRun = await f.goals.start(timed.goalId, ["p1"]);
  f.repo.db.prepare("UPDATE runs SET created_at=? WHERE run_id=?").run(Date.now() - 61_000, timedRun.runId!);
  await expect(
    f.goals.reserveModelCall(timedRun.runId!, {
      modelId: DEFAULT_PLANNER_MODEL_ID,
      promptBytes: 1,
      toolsBytes: 1,
      maxOutputTokens: 1,
    }),
  ).rejects.toThrow(/time limit exhausted/);
  f.db.close();
});

it("keeps an interrupted ambiguous charge for owner review and does not restart dispatch", async () => {
  const f = fixture();
  const goal = f.goals.create({
    workspaceId: f.workspace.workspaceId,
    chatId: "chat-goal",
    objective: "Read fixture",
    budget: { maxTokens: 5000 },
  });
  const { runId } = await f.goals.start(goal.goalId, ["p1"]);
  await f.goals.reserveModelCall(runId!, {
    modelId: DEFAULT_PLANNER_MODEL_ID,
    promptBytes: 100,
    toolsBytes: 100,
    maxOutputTokens: 100,
  });
  f.repo.saveRun({ ...f.repo.getRun(runId!)!, status: "interrupted" });
  const recovered = new GoalService(f.repo, f.runs);
  expect(recovered.get(goal.goalId)).toMatchObject({ status: "needs_input", reservedTokens: 1324 });
  expect(() =>
    recovered.create({
      workspaceId: f.workspace.workspaceId,
      chatId: "chat-goal",
      objective: "Again",
      budget: { maxTokens: 5000 },
    }),
  ).toThrow(/Finish or cancel/);
  expect((await recovered.cancel(goal.goalId)).status).toBe("cancelled");
  f.db.close();
});
