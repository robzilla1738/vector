import { setMemberSourceDigest } from "../../apps/runtime/src/services/set-member-lineage.js";
import { budgetLineage } from "../fixtures/budget-lineage.js";
import { afterEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import { BudgetsService, dayStartMs, monthStartMs, openDb, Repo } from "@aux/runtime";

const databases: DatabaseSync[] = [];
const db = () => {
  const d = openDb(":memory:");
  databases.push(d);
  return d;
};
afterEach(() => {
  while (databases.length) databases.pop()!.close();
});

const call = (runId: string | null, costUsd: number, createdAt = Date.now()) => ({
  callId: randomUUID(),
  runId: runId ?? undefined,
  role: "agent" as const,
  modelId: "m/x",
  durationMs: 5,
  costUsd,
  createdAt,
});

const insertRoutineRun = (d: DatabaseSync, routineId: string, runId: string | null) => {
  d.prepare("INSERT OR IGNORE INTO workspaces(workspace_id, name, created_at) VALUES(?,?,?)").run(
    "ws",
    "ws",
    Date.now(),
  );
  d.prepare(
    "INSERT OR IGNORE INTO routines(routine_id, workspace_id, revision, json, updated_at) VALUES(?,?,?,?,?)",
  ).run(routineId, "ws", 1, "{}", Date.now());
  d.prepare(
    "INSERT INTO routine_runs(routine_run_id, routine_id, revision, status, run_id, created_at) VALUES(?,?,?,?,?,?)",
  ).run(randomUUID(), routineId, 1, "done", runId, Date.now());
};

describe("BudgetsService", () => {
  it("replaces only an inherited funded cap while preserving explicit Profile spend limits", () => {
    const d = db();
    const repo = new Repo(d);
    repo.saveRun({
      runId: "funded-run",
      goal: "funded",
      pageIds: [],
      status: "running",
      config: { maxCostUsd: 0.5 },
      createdAt: Date.now(),
    });
    repo.saveModelCall(call("funded-run", 0.5));
    let runUsd = 1;
    const budgets = new BudgetsService(d, () => ({ runUsd, monthUsd: 5 }), budgetLineage(repo));
    expect(() => budgets.assertWithin({ runId: "funded-run", requiredUsd: 0.1 })).toThrow("run budget");
    expect(() =>
      budgets.assertWithin({ runId: "funded-run", requiredUsd: 0.1, excludeRunLimit: true }),
    ).not.toThrow();
    runUsd = 0.5;
    expect(() =>
      budgets.assertWithin({ runId: "funded-run", requiredUsd: 0.1, excludeRunLimit: true }),
    ).toThrow("run budget");
  });

  it("enforces the local month across attributed and unattributed recorded calls", () => {
    const d = db();
    const repo = new Repo(d);
    const now = new Date(2026, 9, 6, 12).getTime();
    const start = new Date(2026, 9, 1).getTime();
    expect(monthStartMs(now)).toBe(start);
    repo.saveModelCall(call(null, 4, start - 1));
    repo.saveModelCall(call(null, 0.75, start));
    repo.saveRun({
      runId: "month-run",
      goal: "monthly budget",
      pageIds: [],
      status: "running",
      createdAt: now,
      config: {},
    });
    repo.saveModelCall(call("month-run", 0.25, now));
    const budgets = new BudgetsService(d, () => ({ monthUsd: 1.1 }), budgetLineage(repo));
    expect(budgets.spentMonthUsd(now)).toBe(1);
    expect(budgets.status({}, now).find((s) => s.scope === "month")).toMatchObject({
      limitUsd: 1.1,
      spentUsd: 1,
      exceeded: false,
    });
    expect(() => budgets.assertWithin({ runId: "month-run", requiredUsd: 0.2 }, now)).toThrow("this month");
    expect(() => budgets.assertWithin({ runId: "month-run", requiredUsd: 0.05 }, now)).not.toThrow();
  });

  it("charges completed descendants once to the original parent and routine after Set deletion", () => {
    const repo = new Repo(db());
    repo.saveRun({
      runId: "parent",
      goal: "Batch",
      status: "completed",
      pageIds: [],
      createdAt: 1,
      config: { maxCostUsd: 0.55 },
    });
    for (const [childId, parentId, memberId] of [
      ["child", "parent", "one"],
      ["grandchild", "child", "two"],
    ]) {
      const source = {
        parentRunId: parentId!,
        setId: "deleted-set",
        memberId: memberId!,
        url: "https://source.test/",
      };
      const sourceDigest = setMemberSourceDigest(source);
      repo.saveRun({
        runId: childId!,
        goal: "Member",
        status: "completed",
        pageIds: [],
        createdAt: 1,
        config: { setMemberSource: { ...source, sourceDigest } },
      });
      repo.db
        .prepare(
          "INSERT INTO set_run_members(child_run_id,parent_run_id,set_id,member_id,source_digest,state,created_at,updated_at) VALUES(?,?,?,?,?,'completed',1,1)",
        )
        .run(childId!, parentId!, source.setId, source.memberId, sourceDigest);
    }
    repo.saveModelCall(call("parent", 0.1));
    repo.saveModelCall(call("child", 0.2));
    repo.saveModelCall(call("grandchild", 0.3));
    repo.saveModelCall(call("unrelated", 1));
    insertRoutineRun(repo.db, "routine", "parent");
    insertRoutineRun(repo.db, "routine", "child");
    const budgets = new BudgetsService(repo.db, () => ({ runUsd: 0.5 }), budgetLineage(repo));
    const originalCap = new BudgetsService(repo.db, () => ({}), budgetLineage(repo));
    expect(originalCap.status({ runId: "grandchild" })[0]).toMatchObject({
      scopeId: "parent",
      limitUsd: 0.55,
      exceeded: true,
    });
    expect(() => originalCap.assertWithin({ runId: "grandchild" })).toThrow(/run budget/);
    expect(budgets.status({ runId: "grandchild" })[0]?.limitUsd).toBe(0.5);
    expect(budgets.spentRunUsd("grandchild")).toBeCloseTo(0.6);
    expect(budgets.spentRoutineUsd("routine")).toBeCloseTo(0.6);
    expect(budgets.routineForRun("grandchild")).toBe("routine");
    expect(budgets.spentDayUsd()).toBeCloseTo(1.6);
    expect(() => budgets.assertWithin({ runId: "grandchild" })).toThrow(/run budget/);
    repo.saveModelCall({ ...call("grandchild", 0), costUsd: undefined });
    expect(budgets.runCostComplete("parent")).toBe(false);
    repo.db
      .prepare("UPDATE set_run_members SET source_digest=? WHERE child_run_id='child'")
      .run("0".repeat(64));
    expect(() => budgets.spentRunUsd("parent")).toThrow(/provenance changed/);
  });

  it("sums spend per run, per day, and per routine from the model_calls ledger", () => {
    const repo = new Repo(db());
    repo.saveModelCall(call("run-a", 0.1));
    repo.saveModelCall(call("run-a", 0.05));
    repo.saveModelCall(call("run-b", 0.25));
    repo.saveModelCall(call(null, 0.99)); // unattributed — day scope only
    const budgets = new BudgetsService(repo.db, () => ({}), budgetLineage(repo));
    expect(budgets.spentRunUsd("run-a")).toBeCloseTo(0.15);
    expect(budgets.spentRunUsd("run-b")).toBeCloseTo(0.25);
    expect(budgets.spentDayUsd()).toBeCloseTo(1.39);
    repo.saveModelCall(call("run-a", 7.0, dayStartMs() - 60_000)); // last night
    expect(budgets.spentRunUsd("run-a")).toBeCloseTo(7.15);
    expect(budgets.spentDayUsd()).toBeCloseTo(1.39); // last night's call is outside today's window
    expect(budgets.spentDayUsd(dayStartMs() - 1)).toBeCloseTo(8.39); // yesterday's window sees it
  });

  it("links routine spend through routine_runs and finds the routine for a run", () => {
    const d = db();
    const repo = new Repo(d);
    insertRoutineRun(d, "routine-1", "run-a");
    insertRoutineRun(d, "routine-1", "run-c");
    repo.saveModelCall(call("run-a", 0.3));
    repo.saveModelCall(call("run-c", 0.2));
    repo.saveModelCall(call("run-b", 9.99));
    const budgets = new BudgetsService(repo.db, () => ({}), budgetLineage(repo));
    expect(budgets.routineForRun("run-a")).toBe("routine-1");
    expect(budgets.routineForRun("run-b")).toBeUndefined();
    expect(budgets.spentRoutineUsd("routine-1")).toBeCloseTo(0.5);
  });

  it("assertWithin names the first exhausted scope and passes when limits are clear", () => {
    const d = db();
    const repo = new Repo(d);
    insertRoutineRun(d, "routine-1", "run-a");
    repo.saveModelCall(call("run-a", 0.6));
    const budgets = new BudgetsService(
      repo.db,
      () => ({ runUsd: 1.0, dayUsd: 5.0, routineUsd: 0.5 }),
      budgetLineage(repo),
    );
    expect(() => budgets.assertWithin({ runId: "run-a" })).toThrowError(/routine budget.*0\.50/);
    const thrown = (() => {
      try {
        budgets.assertWithin({ runId: "run-a" });
        return undefined;
      } catch (e) {
        return e;
      }
    })() as { code?: string; detail?: { scope?: string } } | undefined;
    expect(thrown?.code).toBe("permission_denied");
    expect(thrown?.detail?.scope).toBe("routine");
    const generous = new BudgetsService(
      repo.db,
      () => ({ runUsd: 1.0, dayUsd: 5.0, routineUsd: 10 }),
      budgetLineage(repo),
    );
    expect(() => generous.assertWithin({ runId: "run-a" })).not.toThrow();
    const runCap = new BudgetsService(repo.db, () => ({ runUsd: 0.5 }), budgetLineage(repo));
    expect(() => runCap.assertWithin({ runId: "run-a" })).toThrowError(/run budget/);
  });

  it("unset limits mean unlimited — status reports spend without a cap", () => {
    const repo = new Repo(db());
    repo.saveModelCall(call("run-a", 42));
    const budgets = new BudgetsService(repo.db, () => ({}), budgetLineage(repo));
    const status = budgets.status({ runId: "run-a" });
    expect(status).toHaveLength(3); // run + day + month; routine omitted without a scope
    expect(status[0]).toMatchObject({ scope: "run", spentUsd: 42, exceeded: false, limitUsd: undefined });
    expect(() => budgets.assertWithin({ runId: "run-a" })).not.toThrow();
  });
});
