import { afterEach, expect, it } from "vitest";
import { EventBus, openDb, Repo, RoutineService, TaskService, nextScheduledTime } from "@aux/runtime";
import { AuxError, scheduleOccurrenceIdentity } from "@aux/contracts";

const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const fn of cleanup.splice(0).reverse()) fn();
});
function fixture(
  startWork: () => Promise<{ runId: string }> = async () => ({ runId: `agent-${crypto.randomUUID()}` }),
) {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db),
    events = new EventBus(repo),
    tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Research");
  const task = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Watch site",
    objective: "Inspect the site",
    criteria: [{ criterionId: "checked", description: "Checked", verification: "manual" }],
    resources: [{ resourceId: "url", kind: "url", locator: "https://example.com/page", label: "Page" }],
  });
  const routines = new RoutineService(repo, events, startWork);
  return { db, repo, events, tasks, workspace, task, routines };
}
const notification = (eventId: string, observedAt = Date.now()) => ({
  kind: "site_notification" as const,
  origin: "https://example.com",
  eventId,
  permissionGranted: true as const,
  observedAt,
});

it("fires a permissioned site notification once, records overlap and stale events, and exposes a read-tracked inbox", async () => {
  const f = fixture();
  const routine = f.routines.fromResult({
    taskId: f.task.taskId,
    title: "Site update",
    trigger: { kind: "site_notification", origin: "https://example.com" },
    reviewRequired: false,
  });
  const [first] = await f.routines.ingestEvent(notification("notification-1"));
  expect(first?.status).toBe("running");
  expect(await f.routines.ingestEvent(notification("notification-1"))).toEqual([]);
  const [overlap] = await f.routines.ingestEvent(notification("notification-2"));
  expect(overlap?.status).toBe("missed");
  expect(overlap?.reason).toMatch(/already in progress/i);
  const inbox = f.routines.inbox({ workspaceId: f.workspace.workspaceId });
  expect(inbox.map((item) => item.run.routineRunId)).toEqual([overlap!.routineRunId, first!.routineRunId]);
  expect(inbox[0]).toMatchObject({ title: "Site update", triggerKind: "site_notification" });
  const read = f.routines.markInboxRead(overlap!.routineRunId);
  expect(f.routines.markInboxRead(overlap!.routineRunId)).toEqual(read);
  expect(f.routines.inbox({ unreadOnly: true }).map((item) => item.run.routineRunId)).toEqual([
    first!.routineRunId,
  ]);
  await expect(
    f.routines.ingestEvent({ ...notification("bad"), permissionGranted: false } as never),
  ).rejects.toThrow();
  expect((await f.routines.ingestEvent(notification("old", Date.now() - 6 * 60_000)))[0]?.status).toBe(
    "missed",
  );
  expect(routine.siteOrigins).toContain("https://example.com");
});

it("uses a page fingerprint baseline and exact URL, epoch, and task resource before firing", async () => {
  const f = fixture();
  f.db
    .prepare(
      "INSERT INTO pages(page_id,backend,target_id,url,title,epoch,created_at,active_at) VALUES('p1','aux','target','https://example.com/page','Page',3,1,1)",
    )
    .run();
  f.routines.fromResult({
    taskId: f.task.taskId,
    trigger: { kind: "page_change", url: "https://example.com/page", minimumIntervalMinutes: 5 },
    reviewRequired: false,
  });
  const observedAt = Date.now();
  const source = {
    kind: "page_change" as const,
    pageId: "p1",
    url: "https://example.com/page",
    documentEpoch: 3,
    contentSha256: "a".repeat(64),
    eventId: "page-1",
    observedAt,
  };
  expect(await f.routines.ingestEvent(source)).toEqual([]);
  expect(await f.routines.ingestEvent({ ...source, eventId: "page-2" })).toEqual([]);
  expect(
    (await f.routines.ingestEvent({ ...source, eventId: "page-3", contentSha256: "b".repeat(64) }))[0]
      ?.status,
  ).toBe("running");
  expect(
    await f.routines.ingestEvent({
      ...source,
      eventId: "page-4",
      documentEpoch: 2,
      contentSha256: "c".repeat(64),
    }),
  ).toEqual([]);
  expect(
    await f.routines.ingestEvent({
      ...source,
      eventId: "page-5",
      url: "https://evil.test/page",
      contentSha256: "c".repeat(64),
    }),
  ).toEqual([]);
});

it("requires the pinned active Calendar task grant for an event", async () => {
  const f = fixture();
  const connectionId = "00000000-0000-4000-8000-000000000001",
    grantId = "10000000-0000-4000-8000-000000000001";
  f.db
    .prepare(
      "INSERT INTO calendar_connections(connection_id,provider,account_key,label,secret_name,scopes,state,created_at,updated_at) VALUES(?,'google','acct','Calendar','secret','[]','active',1,1)",
    )
    .run(connectionId);
  f.db
    .prepare(
      "INSERT INTO calendar_task_grants(grant_id,task_id,task_revision,connection_id,created_at) VALUES(?,?,?,?,1)",
    )
    .run(grantId, f.task.taskId, f.task.revision, connectionId);
  f.routines.fromResult({
    taskId: f.task.taskId,
    trigger: { kind: "calendar_event", grantId, calendarId: "primary", beforeMinutes: 0 },
    reviewRequired: false,
  });
  const now = Date.now();
  const event = {
    kind: "calendar_event" as const,
    grantId,
    connectionId,
    calendarId: "primary",
    eventId: "evt-1",
    startAt: now,
    observedAt: now,
  };
  expect((await f.routines.ingestEvent(event, now))[0]?.status).toBe("running");
  expect(await f.routines.ingestEvent(event, now)).toEqual([]);
  f.db.prepare("UPDATE calendar_task_grants SET revoked_at=? WHERE grant_id=?").run(now + 1, grantId);
  expect(await f.routines.ingestEvent({ ...event, eventId: "evt-2" }, now)).toEqual([]);
});

it("auto-pauses after three failed event runs and after a configured spend cap", async () => {
  const failed = fixture(async () => {
    throw new AuxError("permission_denied", "site denied");
  });
  const routine = failed.routines.fromResult({
    taskId: failed.task.taskId,
    trigger: { kind: "site_notification", origin: "https://example.com" },
    reviewRequired: false,
  });
  for (const id of ["one", "two", "three"])
    expect((await failed.routines.ingestEvent(notification(id)))[0]?.status).toBe("failed");
  expect(failed.routines.get(routine.routineId).routine.paused).toBe(true);
  expect(failed.routines.inbox().some((item) => /Auto-paused/.test(item.run.reason ?? ""))).toBe(true);
  expect(await failed.routines.ingestEvent(notification("four"))).toEqual([]);

  const spent = fixture(async () => ({ runId: "costed-run" }));
  const budgeted = spent.routines.fromResult({
    taskId: spent.task.taskId,
    trigger: { kind: "site_notification", origin: "https://example.com" },
    reviewRequired: false,
  });
  spent.routines.update({
    routineId: budgeted.routineId,
    expectedRevision: budgeted.revision,
    spendCapUsd: 0.05,
  });
  await spent.routines.ingestEvent(notification("budget"));
  spent.repo.saveModelCall({
    callId: "call",
    runId: "costed-run",
    role: "planner",
    modelId: "fixture",
    durationMs: 1,
    costUsd: 0.06,
    createdAt: Date.now(),
  });
  spent.repo.saveRun({
    runId: "costed-run",
    goal: "Watch",
    status: "completed",
    pageIds: [],
    createdAt: Date.now(),
    endedAt: Date.now(),
  });
  expect(spent.routines.inbox()[0]?.run.status).toBe("completed");
  expect(spent.routines.get(budgeted.routineId).routine.paused).toBe(true);
});

it("gives fall-back wall minutes one identity and skips nonexistent spring-forward time", () => {
  const first = Date.parse("2026-11-01T05:30:00Z"),
    second = Date.parse("2026-11-01T06:30:00Z");
  expect(scheduleOccurrenceIdentity("routine", "America/New_York", first)).toBe(
    scheduleOccurrenceIdentity("routine", "America/New_York", second),
  );
  const spring = nextScheduledTime(
    { kind: "schedule", timezone: "America/New_York", hour: 2, minute: 30, days: [0] },
    Date.parse("2026-03-08T05:00:00Z"),
  );
  expect(new Date(spring).toISOString()).toBe("2026-03-15T06:30:00.000Z");
});

it("pages inbox and per-Skill occurrences with tied timestamps and retains unread filtering", async () => {
  const f = fixture();
  const routine = f.routines.fromResult({ taskId: f.task.taskId, title: "Older results" });
  const insert = f.db.prepare(
    "INSERT INTO routine_runs(routine_run_id,routine_id,revision,occurrence_identity,status,parameters,created_at) VALUES(?,?,1,?,'completed','{}',?)",
  );
  for (let index = 0; index < 65; index++) {
    const id = `occurrence-${String(index).padStart(3, "0")}`;
    insert.run(id, routine.routineId, id, 100);
  }
  f.routines.markInboxRead("occurrence-064");
  const ids: string[] = [];
  let cursor: { createdAt: number; routineRunId: string } | undefined;
  for (;;) {
    const page = f.routines.inbox({ workspaceId: routine.workspaceId, unreadOnly: true, limit: 30, cursor });
    ids.push(...page.map((item) => item.run.routineRunId));
    const last = page.at(-1)?.run;
    if (!last || page.length < 30) break;
    cursor = last;
  }
  expect(ids).toHaveLength(64);
  expect(new Set(ids).size).toBe(64);
  expect(ids).not.toContain("occurrence-064");
  expect(ids.at(-1)).toBe("occurrence-000");
  const owned: string[] = [];
  cursor = undefined;
  for (;;) {
    const page = f.routines.runs(routine.routineId, 30, cursor);
    owned.push(...page.map((run) => run.routineRunId));
    const last = page.at(-1);
    if (!last || page.length < 30) break;
    cursor = last;
  }
  expect(owned).toHaveLength(65);
  expect(new Set(owned).size).toBe(65);
  expect(owned.at(-1)).toBe("occurrence-000");
  expect(f.routines.runs("other-Skill", 30)).toEqual([]);
});
