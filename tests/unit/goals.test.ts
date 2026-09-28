import { expect, it } from "vitest";
import { EventBus, GoalService, openDb, Repo, TaskService } from "@aux/runtime";
import type { Run } from "@aux/contracts";
import type { RunService } from "@aux/runtime";

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
      const run: Run = { runId: String(opts.deliveryRunId), goal: String(opts.goal), pageIds: opts.pageIds as string[],
        status: "running", createdAt: Date.now() };
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
  const goal = f.goals.create({ workspaceId: f.workspace.workspaceId, objective: "Compare sources",
    budget: { maxTokens: 10_000, maxCostUsd: 2, deadlineMs: 120_000 } });
  expect(goal.status).toBe("draft");
  await expect(f.goals.start(goal.goalId, [])).rejects.toThrow(/one to eight/);
  const active = await f.goals.start(goal.goalId, ["p1"]);
  expect(active).toMatchObject({ status: "active", runId: expect.stringMatching(/^run_/) });
  expect(f.started()).toMatchObject({ goal: "Compare sources", pageIds: ["p1"], engine: "agent-loop",
    defaultWorkspaceId: f.workspace.workspaceId, maxTokens: 10_000, maxCostUsd: 2, deadlineMs: 120_000 });
  await expect(f.goals.start(goal.goalId, ["p1"])).rejects.toThrow(/already started/);
  f.repo.saveModelCall({ callId: "call-1", runId: active.runId!, role: "planner", modelId: "fixture",
    durationMs: 1, inputTokens: 100, outputTokens: 50, costUsd: 0.3, createdAt: Date.now() });
  expect(f.goals.get(goal.goalId)).toMatchObject({ usedTokens: 150, knownCostUsd: 0.3, costComplete: true });
  expect(f.goals.pause(goal.goalId).status).toBe("paused");
  expect(f.goals.resume(goal.goalId).status).toBe("active");
  expect(f.goals.cancel(goal.goalId).status).toBe("cancelled");
  expect(f.goals.list(f.workspace.workspaceId)).toHaveLength(1);
  f.db.close();
});

it("does not retry a goal whose run linkage was interrupted", async () => {
  const f = fixture();
  const goal = f.goals.create({ workspaceId: f.workspace.workspaceId, objective: "Review", budget: { maxTokens: 100 } });
  f.repo.db.prepare("UPDATE goals SET status='starting' WHERE goal_id=?").run(goal.goalId);
  const recovered = new GoalService(f.repo, f.runs);
  expect(recovered.get(goal.goalId).status).toBe("needs_input");
  await expect(f.goals.start(goal.goalId, ["p1"])).rejects.toThrow(/needs review/);
  expect(recovered.cancel(goal.goalId).status).toBe("cancelled");
  f.db.close();
});

it("reserves the Goal run identity before the coordinator can launch a model turn", async () => {
  const f = fixture();
  const goal = f.goals.create({ workspaceId: f.workspace.workspaceId, objective: "Check",
    budget: { maxTokens: 100 } });
  const originalStart = f.runs.start;
  f.runs.start = async (opts) => {
    const reserved = f.repo.db.prepare("SELECT run_id,status FROM goals WHERE goal_id=?")
      .get(goal.goalId) as { run_id: string; status: string };
    expect(reserved).toMatchObject({ run_id: opts.deliveryRunId, status: "starting" });
    return originalStart(opts);
  };
  await f.goals.start(goal.goalId, ["p1"]);
  f.db.close();
});

it("keeps one unfinished Goal per conversation and carries that conversation into the run", async () => {
  const f = fixture();
  const input = { workspaceId: f.workspace.workspaceId, chatId: "chat-one", objective: "Review the page",
    budget: { maxTokens: 1200 } };
  const first = f.goals.create(input);
  expect(() => f.goals.create(input)).toThrow(/Finish or cancel/);
  expect(f.goals.cancel(first.goalId).status).toBe("cancelled");
  const second = f.goals.create(input);
  await f.goals.start(second.goalId, ["p1"]);
  expect(f.started()).toMatchObject({ chatId: "chat-one", maxTokens: 1200 });
  expect(() => f.goals.create(input)).toThrow(/Finish or cancel/);
  f.goals.cancel(second.goalId);
  expect(f.goals.create(input).chatId).toBe("chat-one");
  f.repo.setSetting("conversationWorkspace:chat-other", "different-space");
  expect(() => f.goals.create({ ...input, chatId: "chat-other" })).toThrow(/another Space/);
  f.db.close();
});

it("requires the same blocker in three consecutive model turns and leaves owner limits untouched", async () => {
  const f = fixture();
  const goal = f.goals.create({ workspaceId: f.workspace.workspaceId, objective: "Investigate",
    budget: { maxTokens: 1_200 } });
  const active = await f.goals.start(goal.goalId, ["p1"]);
  const runId = active.runId!;
  expect(() => f.goals.report("not-a-goal", "paused", undefined, 1)).toThrow(/not a Goal/);
  expect(f.goals.report(runId, "blocked", "Authentication needed", 1)).toEqual({ status: "still_active", remaining: 2 });
  expect(f.goals.report(runId, "blocked", "Different blocker", 2)).toEqual({ status: "still_active", remaining: 2 });
  expect(f.goals.report(runId, "blocked", "Authentication needed", 3)).toEqual({ status: "still_active", remaining: 2 });
  expect(f.goals.report(runId, "blocked", "Authentication needed", 4)).toEqual({ status: "still_active", remaining: 1 });
  expect(() => f.goals.report(runId, "blocked", "Authentication needed", 4)).toThrow(/at most once/);
  expect(f.goals.report(runId, "blocked", "Authentication needed", 5)).toEqual({ status: "blocked" });
  expect(f.goals.get(goal.goalId)).toMatchObject({ status: "blocked", blocker: "Authentication needed",
    blockerStreak: 3, budget: { maxTokens: 1_200 } });
  expect(f.goals.resume(goal.goalId)).toMatchObject({ status: "active", blockerStreak: 0 });
  expect(f.goals.report(runId, "paused", undefined, 6)).toEqual({ status: "paused" });
  expect(f.goals.get(goal.goalId).status).toBe("paused");
  f.db.close();
});
