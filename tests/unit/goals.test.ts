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
      const run: Run = { runId: "goal-run", goal: String(opts.goal), pageIds: opts.pageIds as string[],
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
  expect(active).toMatchObject({ status: "active", runId: "goal-run" });
  expect(f.started()).toMatchObject({ goal: "Compare sources", pageIds: ["p1"],
    defaultWorkspaceId: f.workspace.workspaceId, maxTokens: 10_000, maxCostUsd: 2, deadlineMs: 120_000 });
  await expect(f.goals.start(goal.goalId, ["p1"])).rejects.toThrow(/already started/);
  f.repo.saveModelCall({ callId: "call-1", runId: "goal-run", role: "planner", modelId: "fixture",
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
