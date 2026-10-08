import { afterEach, expect, it, vi } from "vitest";
import { EventBus, openDb, Repo, RoutineService, TaskService, nextScheduledTime } from "@aux/runtime";
import {
  previousRecurrenceTime,
  validateRecurrence,
} from "../../apps/runtime/src/services/routines/recurrence.js";
import type { RoutineTrigger } from "@aux/contracts";

const close: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  vi.useRealTimers();
  for (const fn of close.splice(0)) await fn();
});
function pendingLaunch() {
  let acknowledge!: () => void;
  let finish!: (value: { runId: string }) => void;
  const started = new Promise<void>((resolve) => {
    acknowledge = resolve;
  });
  const result = new Promise<{ runId: string }>((resolve) => {
    finish = resolve;
  });
  close.push(() => finish({ runId: "fixture-cleanup" }));
  const start = vi.fn(() => {
    acknowledge();
    return result;
  });
  return { start, started, finish };
}
function fixture(
  start?: ConstructorParameters<typeof RoutineService>[2],
  stop?: ConstructorParameters<typeof RoutineService>[3],
) {
  const db = openDb(":memory:");
  const repo = new Repo(db),
    events = new EventBus(repo),
    tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Recurrence");
  const task = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Check report",
    objective: "Read the saved report",
    criteria: [{ criterionId: "report-read", description: "Report reviewed", verification: "manual" }],
    resources: [],
  });
  const routines = new RoutineService(repo, events, start, stop);
  close.push(async () => {
    await routines.close();
    repo.close();
  });
  const create = (trigger: RoutineTrigger, spendCapUsd?: number) => {
    const routine = routines.fromResult({ taskId: task.taskId, trigger });
    return spendCapUsd === undefined
      ? routine
      : routines.update({ routineId: routine.routineId, expectedRevision: routine.revision, spendCapUsd });
  };
  return { repo, events, tasks, workspace, task, routines, create };
}
it("evaluates ordinal monthly and leap-year rules beyond the catch-up window", () => {
  const monthly = {
    kind: "rrule",
    timezone: "America/Chicago",
    startAt: Date.parse("2026-01-01T09:00:00-06:00"),
    rrule: "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1",
  } as const;
  expect(previousRecurrenceTime(monthly, Date.parse("2026-04-20T00:00:00Z"))).toBe(
    Date.parse("2026-04-06T09:00:00-05:00"),
  );
  const leap = {
    kind: "rrule",
    timezone: "UTC",
    startAt: Date.parse("2024-02-29T09:00:00Z"),
    rrule: "FREQ=YEARLY;COUNT=2",
  } as const;
  expect(previousRecurrenceTime(leap, Date.parse("2029-01-01T00:00:00Z"))).toBe(
    Date.parse("2028-02-29T09:00:00Z"),
  );
});
it("skips nonexistent local times and selects the first repeated wall time", () => {
  expect(
    nextScheduledTime(
      { kind: "schedule", timezone: "America/Chicago", hour: 2, minute: 30, days: [0] },
      Date.parse("2026-03-08T00:00:00-06:00"),
    ),
  ).toBe(Date.parse("2026-03-15T02:30:00-05:00"));
  expect(
    nextScheduledTime(
      { kind: "schedule", timezone: "America/Chicago", hour: 1, minute: 30, days: [0] },
      Date.parse("2026-11-01T00:00:00-05:00"),
    ),
  ).toBe(Date.parse("2026-11-01T01:30:00-05:00"));
});
it("rejects invalid recurrence instruction syntax without accepting a schedule", () => {
  expect(() =>
    validateRecurrence({ kind: "rrule", timezone: "UTC", startAt: 0, rrule: "FREQ=INVALID" }),
  ).toThrow(/recurrence/);
});
it("coalesces overlapping heartbeat ticks into one original occurrence", async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(Date.parse("2026-10-06T12:00:00Z"));
  const { start, started, finish } = pendingLaunch();
  const f = fixture(start);
  f.create({ kind: "heartbeat", timezone: "UTC", intervalMinutes: 60 });
  const first = f.routines.due(Date.now()),
    second = f.routines.due(Date.now());
  await started;
  expect(start).toHaveBeenCalledTimes(1);
  finish({ runId: "original-heartbeat" });
  const [a, b] = await Promise.all([first, second]);
  expect(a).toEqual(b);
  expect(a[0]?.runId).toBe("original-heartbeat");
  expect(await f.routines.due(Date.now())).toEqual([]);
});
it("waits for exact original run cancellation when a routine pauses during launch", async () => {
  const { start, started, finish } = pendingLaunch();
  const stop = vi.fn(async () => {});
  const f = fixture(start, stop);
  const routine = f.create({ kind: "heartbeat", timezone: "UTC", intervalMinutes: 60 });
  const pending = f.routines.due();
  await started;
  f.routines.pause(routine.routineId, routine.revision, true);
  finish({ runId: "original-only" });
  expect((await pending)[0]).toMatchObject({ runId: "original-only", status: "cancelled" });
  expect(stop).toHaveBeenCalledExactlyOnceWith("original-only");
});
it("suggests only repeated completed work from the current saved task revision", () => {
  const f = fixture();
  for (let index = 0; index < 3; index++)
    f.repo.saveRun({
      runId: `completed-${index}`,
      goal: f.task.objective,
      status: "completed",
      pageIds: [],
      createdAt: index + 1,
      endedAt: index + 10,
      config: {
        taskId: f.task.taskId,
        taskRevision: f.task.revision,
        contextWorkspaceId: f.workspace.workspaceId,
      },
    });
  expect(f.routines.scan({ workspaceId: f.workspace.workspaceId })).toMatchObject([
    { taskId: f.task.taskId, completedRuns: 3, runId: "completed-2" },
  ]);
  f.create({ kind: "manual" });
  expect(f.routines.scan({ workspaceId: f.workspace.workspaceId })).toEqual([]);
});
it("keeps routine caps explicit and allows the person to remove them", () => {
  const f = fixture();
  const routine = f.create({ kind: "manual" }, 100);
  expect(routine.spendCapUsd).toBe(100);
  expect(
    f.routines.update({ routineId: routine.routineId, expectedRevision: routine.revision, spendCapUsd: null })
      .spendCapUsd,
  ).toBeUndefined();
});
it("keeps the original launch uncertain when cancellation is not acknowledged", async () => {
  const { start, started, finish } = pendingLaunch();
  const f = fixture(start, async () => {
    throw new Error("cancel ACK unavailable");
  });
  const routine = f.create({ kind: "heartbeat", timezone: "UTC", intervalMinutes: 60 });
  const pending = f.routines.due();
  await started;
  f.routines.pause(routine.routineId, routine.revision, true);
  finish({ runId: "original-unacknowledged" });
  expect((await pending)[0]).toMatchObject({ runId: "original-unacknowledged", status: "uncertain" });
  expect(f.routines.runs(routine.routineId)[0]?.reason).toMatch(/not acknowledged/);
});

it("retires a sweep before its first cooperative dispatch", async () => {
  const start = vi.fn(async () => ({ runId: "must-not-start" }));
  const f = fixture(start);
  f.create({ kind: "heartbeat", timezone: "UTC", intervalMinutes: 60 });
  const pending = f.routines.due();
  await f.routines.close();
  expect(await pending).toEqual([]);
  expect(await f.routines.due()).toEqual([]);
  expect(start).not.toHaveBeenCalled();
});

it("joins an accepted launch and leaves later occurrences unconsumed on shutdown", async () => {
  const { start, started, finish } = pendingLaunch();
  const f = fixture(start);
  const first = f.create({ kind: "heartbeat", timezone: "UTC", intervalMinutes: 60 });
  const later = f.create({ kind: "heartbeat", timezone: "UTC", intervalMinutes: 60 });
  const pending = f.routines.due();
  await started;
  let closed = false;
  const closing = f.routines.close().then(() => {
    closed = true;
  });
  expect(closed).toBe(false);
  expect(await f.routines.due()).toEqual([]);
  expect(closed).toBe(false);
  finish({ runId: "accepted-original" });
  await closing;
  expect(await pending).toMatchObject([{ routineId: first.routineId, runId: "accepted-original" }]);
  expect(f.routines.runs(first.routineId)[0]?.runId).toBe("accepted-original");
  expect(f.routines.runs(later.routineId)).toEqual([]);
  expect(start).toHaveBeenCalledTimes(1);
});
