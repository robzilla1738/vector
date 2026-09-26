import { afterEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { BudgetsService, dayStartMs, openDb, Repo } from "@aux/runtime";

const databases: DatabaseSync[] = [];
const db = () => { const d = openDb(":memory:"); databases.push(d); return d; };
afterEach(() => { while (databases.length) databases.pop()!.close(); });

const call = (runId: string | null, costUsd: number, createdAt = Date.now()) => ({
  callId: randomUUID(), runId: runId ?? undefined, role: "agent" as const, modelId: "m/x",
  durationMs: 5, costUsd, createdAt,
});

const insertRoutineRun = (d: DatabaseSync, routineId: string, runId: string | null) => {
  d.prepare("INSERT OR IGNORE INTO workspaces(workspace_id, name, created_at) VALUES(?,?,?)").run("ws", "ws", Date.now());
  d.prepare(
    "INSERT OR IGNORE INTO routines(routine_id, workspace_id, revision, json, updated_at) VALUES(?,?,?,?,?)",
  ).run(routineId, "ws", 1, "{}", Date.now());
  d.prepare(
    "INSERT INTO routine_runs(routine_run_id, routine_id, revision, status, run_id, created_at) VALUES(?,?,?,?,?,?)",
  ).run(randomUUID(), routineId, 1, "done", runId, Date.now());
};

describe("BudgetsService", () => {
  it("sums spend per run, per day, and per routine from the model_calls ledger", () => {
    const repo = new Repo(db());
    repo.saveModelCall(call("run-a", 0.10));
    repo.saveModelCall(call("run-a", 0.05));
    repo.saveModelCall(call("run-b", 0.25));
    repo.saveModelCall(call(null, 0.99)); // unattributed — day scope only
    const budgets = new BudgetsService(repo.db, () => ({}));
    expect(budgets.spentRunUsd("run-a")).toBeCloseTo(0.15);
    expect(budgets.spentRunUsd("run-b")).toBeCloseTo(0.25);
    expect(budgets.spentDayUsd()).toBeCloseTo(1.39);
    repo.saveModelCall(call("run-a", 7.00, dayStartMs() - 60_000)); // last night
    expect(budgets.spentRunUsd("run-a")).toBeCloseTo(7.15);
    expect(budgets.spentDayUsd()).toBeCloseTo(1.39); // last night's call is outside today's window
    expect(budgets.spentDayUsd(dayStartMs() - 1)).toBeCloseTo(8.39); // yesterday's window sees it
  });

  it("links routine spend through routine_runs and finds the routine for a run", () => {
    const d = db();
    const repo = new Repo(d);
    insertRoutineRun(d, "routine-1", "run-a");
    insertRoutineRun(d, "routine-1", "run-c");
    repo.saveModelCall(call("run-a", 0.30));
    repo.saveModelCall(call("run-c", 0.20));
    repo.saveModelCall(call("run-b", 9.99));
    const budgets = new BudgetsService(repo.db, () => ({}));
    expect(budgets.routineForRun("run-a")).toBe("routine-1");
    expect(budgets.routineForRun("run-b")).toBeUndefined();
    expect(budgets.spentRoutineUsd("routine-1")).toBeCloseTo(0.50);
  });

  it("assertWithin names the first exhausted scope and passes when limits are clear", () => {
    const d = db();
    const repo = new Repo(d);
    insertRoutineRun(d, "routine-1", "run-a");
    repo.saveModelCall(call("run-a", 0.60));
    const budgets = new BudgetsService(repo.db, () => ({ runUsd: 1.0, dayUsd: 5.0, routineUsd: 0.5 }));
    expect(() => budgets.assertWithin({ runId: "run-a" })).toThrowError(/routine budget.*0\.50/);
    const thrown = (() => { try { budgets.assertWithin({ runId: "run-a" }); return undefined; } catch (e) { return e; } })() as
      { code?: string; detail?: { scope?: string } } | undefined;
    expect(thrown?.code).toBe("permission_denied");
    expect(thrown?.detail?.scope).toBe("routine");
    const generous = new BudgetsService(repo.db, () => ({ runUsd: 1.0, dayUsd: 5.0, routineUsd: 10 }));
    expect(() => generous.assertWithin({ runId: "run-a" })).not.toThrow();
    const runCap = new BudgetsService(repo.db, () => ({ runUsd: 0.5 }));
    expect(() => runCap.assertWithin({ runId: "run-a" })).toThrowError(/run budget/);
  });

  it("unset limits mean unlimited — status reports spend without a cap", () => {
    const repo = new Repo(db());
    repo.saveModelCall(call("run-a", 42));
    const budgets = new BudgetsService(repo.db, () => ({}));
    const status = budgets.status({ runId: "run-a" });
    expect(status).toHaveLength(2); // run + day; routine omitted without a scope
    expect(status[0]).toMatchObject({ scope: "run", spentUsd: 42, exceeded: false, limitUsd: undefined });
    expect(() => budgets.assertWithin({ runId: "run-a" })).not.toThrow();
  });
});
