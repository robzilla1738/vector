import { afterEach, expect, it } from "vitest";
import { mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EventBus, openDb, Repo, RoutineService, TaskEvidenceService, TaskService, nextScheduledTime } from "@aux/runtime";
import { AuxError, routineOccurrenceIdentity, type RoutineShare } from "@aux/contracts";

const cleanup: (() => void)[] = [];
afterEach(() => { for (const fn of cleanup.splice(0).reverse()) fn(); });

function fixture(startWork?: (routine: { title: string }, parameters: Record<string, string>) => Promise<{ chatId?: string; runId?: string }>, dbPath = ":memory:") {
  const db = openDb(dbPath);
  cleanup.push(() => { try { db.close(); } catch { /* restarted during the test */ } });
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Research");
  const task = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Compare vendors",
    objective: "Compare {{topic}} vendors",
    criteria: [{ criterionId: "c", description: "Table saved", verification: "manual" }],
    resources: [{ resourceId: "site", kind: "url", locator: "https://example.com/pricing", label: "Pricing" }],
  });
  const routines = new RoutineService(repo, events, startWork);
  return { db, repo, events, tasks, workspace, task, routines };
}

it("reruns a saved Skill with changed parameters after a restart", async () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-skill-rerun-"));
  cleanup.push(() => rmSync(dir, { recursive: true, force: true }));
  const path = join(dir, "state.sqlite");
  const dispatched: string[] = [];
  const start = async (_routine: { title: string }, parameters: Record<string, string>) => {
    dispatched.push(parameters.topic ?? "");
    return { runId: `run-${dispatched.length}` };
  };
  const f = fixture(start, path);
  const skill = f.routines.fromResult({ taskId: f.task.taskId, title: "Vendor check",
    parameters: [{ name: "topic", label: "Topic", value: "hosting" }] });
  const first = await f.routines.run({ routineId: skill.routineId, expectedRevision: skill.revision });
  expect(first).toMatchObject({ status: "running", parameters: { topic: "hosting" } });
  f.db.prepare("UPDATE routine_runs SET status='completed',ended_at=? WHERE routine_run_id=?").run(Date.now(), first.routineRunId);
  f.db.close();
  const reopened = openDb(path);
  cleanup.push(() => reopened.close());
  const repo = new Repo(reopened);
  const routines = new RoutineService(repo, new EventBus(repo), start);
  const second = await routines.run({ routineId: skill.routineId, expectedRevision: skill.revision,
    parameters: { topic: "payments" } });
  expect(second).toMatchObject({ status: "running", parameters: { topic: "payments" } });
  expect(dispatched).toEqual(["hosting", "payments"]);
  expect(routines.runs(skill.routineId).map(run => run.parameters.topic)).toEqual(["payments", "hosting"]);
});

it("searches Skills by name, objective, and output within their Space", () => {
  const f = fixture();
  const skill = f.routines.fromResult({ taskId: f.task.taskId, title: "Vendor check" });
  const revised = f.routines.update({ routineId: skill.routineId, expectedRevision: skill.revision, outputHint: "Sourced matrix" });
  const other = f.tasks.createWorkspace("Other");
  f.routines.importRoutines(f.routines.exportRoutines([skill.routineId]).routines, other.workspaceId);
  for (const query of ["VENDOR", "compare", "MATRIX"]) {
    expect(f.routines.list({ workspaceId: f.workspace.workspaceId, query }).map(item => item.routineId)).toEqual([revised.routineId]);
  }
  expect(f.routines.list({ workspaceId: other.workspaceId, query: "matrix" })).toHaveLength(1);
  expect(f.routines.list({ workspaceId: f.workspace.workspaceId, query: "missing" })).toEqual([]);
});

it("suggests enabled Skills for bounded keyword and exact-origin URL context without running them", () => {
  let started = 0;
  const f = fixture(async () => { started++; return { runId: "unexpected" }; });
  const saved = f.routines.fromResult({ taskId: f.task.taskId, title: "Vendor check" });
  const skill = f.routines.update({ routineId: saved.routineId, expectedRevision: saved.revision,
    icon: "chart", autoInject: { keywords: ["vendor pricing"], urls: ["https://example.com/pricing"] } });
  expect(f.routines.suggest({ workspaceId: f.workspace.workspaceId, text: "Review vendor pricing today", pageUrl: "https://example.com/pricing/plan" }))
    .toEqual([{ routineId: skill.routineId, title: skill.title, reasons: ["keyword", "url"] }]);
  expect(f.routines.suggest({ text: "vendor pricing", pageUrl: "https://example.com.evil.test/pricing" })[0]?.reasons).toEqual(["keyword"]);
  expect(f.routines.suggest({ text: "vendor pricings", pageUrl: "https://example.com/price" })).toEqual([]);
  expect(started).toBe(0);
  f.routines.pause(skill.routineId, skill.revision, true);
  expect(f.routines.suggest({ text: "vendor pricing", pageUrl: "https://example.com/pricing" })).toEqual([]);
});

it("round-trips a SKILL.md as an inert portable definition", async () => {
  const f = fixture();
  const saved = f.routines.fromResult({ taskId: f.task.taskId, title: "Vendor check", parameters: [{ name: "topic", label: "Topic" }] });
  f.routines.update({ routineId: saved.routineId, expectedRevision: saved.revision,
    description: "Compare vendors", icon: "chart", autoInject: { keywords: ["vendor pricing"], urls: ["https://example.com/pricing"] } });
  const exported = f.routines.exportSkillDocument(saved.routineId);
  expect(exported.filename).toBe("SKILL.md");
  expect(exported.content).toContain('autoInject: {"keywords":["vendor pricing"]');
  const dir = mkdtempSync(join(tmpdir(), "aux-skill-md-"));
  cleanup.push(() => rmSync(dir, { recursive: true, force: true }));
  const path = join(dir, "SKILL.md");
  writeFileSync(path, exported.content);
  const other = f.tasks.createWorkspace("Other");
  const imported = await f.routines.importSkillDocument(path, other.workspaceId);
  const copy = f.routines.get(imported.routineIds[0]!).routine;
  expect(copy).toMatchObject({ title: "Vendor check", description: "Compare vendors", icon: "chart",
    autoInject: { keywords: ["vendor pricing"], urls: ["https://example.com/pricing"] },
    paused: true, trigger: { kind: "manual" } });
  expect(copy.sourceTaskId).toBeUndefined();
  expect(copy.parameters).toEqual(saved.parameters);
  await expect(f.routines.importSkillDocument(path, other.workspaceId)).resolves.toMatchObject({ imported: 0, skipped: 1 });
  const link = join(dir, "linked.md");
  symlinkSync(path, link);
  await expect(f.routines.importSkillDocument(link, other.workspaceId)).rejects.toThrow(/regular SKILL.md/);
});

it("runs reviewed site notifications once and records stale delivery as missed", async () => {
  const started: string[] = [];
  const f = fixture(async routine => { started.push(routine.title); return { runId: `event-run-${started.length}` }; });
  const skill = f.routines.create({
    title: "Notification check", objective: "Review the notification", workspaceId: f.workspace.workspaceId,
    sourceTaskId: f.task.taskId, parameters: [], siteOrigins: ["https://example.com"], accountLabels: [],
    reviewRequired: false, cloudCapable: false, consecutive: false, paused: false,
    trigger: { kind: "site_notification", origin: "https://example.com" },
  });
  const event = { kind: "site_notification" as const, eventId: "notice-1", origin: "https://example.com", permissionGranted: true as const, observedAt: Date.now() };
  expect(await f.routines.ingestEvent({ ...event, origin: "https://example.com.evil.test" })).toEqual([]);
  const first = await f.routines.ingestEvent(event);
  expect(first).toHaveLength(1);
  expect(first[0]?.status).toBe("running");
  expect(await f.routines.ingestEvent(event)).toEqual([]);
  expect(started).toEqual(["Notification check"]);
  const missed = await f.routines.ingestEvent({ ...event, eventId: "notice-2", observedAt: Date.now() - 6 * 60_000 });
  expect(missed[0]?.status).toBe("missed");
  expect(started).toHaveLength(1);
  expect(f.routines.get(skill.routineId).runs).toHaveLength(2);
});

it("builds parameterized routines from a saved task and versions edits", () => {
  const f = fixture();
  const routine = f.routines.fromResult({
    taskId: f.task.taskId,
    title: "Vendor check",
    parameters: [{ name: "topic", label: "Topic", value: "hosting" }],
  });
  expect(routine.sourceTaskId).toBe(f.task.taskId);
  expect(routine.siteOrigins).toContain("https://example.com");
  expect(routine.reviewRequired).toBe(true);
  expect(routine.successCriteria).toEqual(f.task.criteria);
  const updated = f.routines.update({ routineId: routine.routineId, expectedRevision: 1, title: "Vendor check v2" });
  expect(updated.revision).toBe(2);
  expect(() => f.routines.update({ routineId: routine.routineId, expectedRevision: 1, title: "stale" })).toThrow(/changed/i);
  const paused = f.routines.pause(routine.routineId, 2, true);
  expect(paused.paused).toBe(true);
});

it("versions Skill outcome criteria and blocks reruns after the source task changes", async () => {
  const f = fixture(async () => ({ runId: "skill-run" }));
  const skill = f.routines.fromResult({ taskId: f.task.taskId, title: "Vendor Skill" });
  const changed = f.tasks.update({ taskId: f.task.taskId, expectedRevision: f.task.revision,
    criteria: [{ criterionId: "c", description: "Report saved with sources", verification: "artifact" }] });
  await expect(f.routines.run({ routineId: skill.routineId, expectedRevision: skill.revision })).rejects.toThrow(/source task changed/);
  const reviewed = f.routines.update({ routineId: skill.routineId, expectedRevision: skill.revision, successCriteria: changed.criteria, sourceTaskRevision: changed.revision, outputHint: "A sourced report" });
  expect(reviewed.revision).toBe(2);
  expect(reviewed.successCriteria).toEqual(changed.criteria);
  expect((await f.routines.run({ routineId: skill.routineId, expectedRevision: reviewed.revision })).status).toBe("running");
});

it("pins Calendar grants when saving a Skill and requires review after grant changes", async () => {
  const f = fixture(async () => ({ runId: "calendar-skill-run" }));
  const addGrant = (suffix: string) => {
    const connectionId = `00000000-0000-4000-8000-00000000000${suffix}`;
    const grantId = `10000000-0000-4000-8000-00000000000${suffix}`;
    f.repo.db.prepare("INSERT INTO calendar_connections(connection_id,provider,account_key,label,secret_name,scopes,state,created_at,updated_at) VALUES(?,'google',?,?,?,?, 'active',1,1)")
      .run(connectionId, `${suffix}@example.test`, suffix, `calendar-${suffix}`, "[]");
    f.repo.db.prepare("INSERT INTO calendar_task_grants(grant_id,task_id,task_revision,connection_id,created_at) VALUES(?,?,?,?,1)")
      .run(grantId, f.task.taskId, f.task.revision, connectionId);
    return grantId;
  };
  const first = addGrant("1");
  const skill = f.routines.fromResult({ taskId: f.task.taskId, title: "Account-bound brief" });
  expect(skill.calendarGrantIds).toEqual([first]);
  const second = addGrant("2");
  expect(f.routines.get(skill.routineId).routine.calendarGrantIds).toEqual([first]);
  expect(f.routines.exportRoutines([skill.routineId]).routines[0]).not.toHaveProperty("calendarGrantIds");
  f.repo.db.prepare("UPDATE calendar_task_grants SET revoked_at=2 WHERE grant_id=?").run(first);
  await expect(f.routines.run({ routineId: skill.routineId, expectedRevision: skill.revision }))
    .rejects.toThrow(/Calendar grant is no longer available/);
  const reviewed = f.routines.update({ routineId: skill.routineId, expectedRevision: skill.revision, calendarGrantIds: [second] });
  expect(reviewed.calendarGrantIds).toEqual([second]);
  f.repo.db.prepare("UPDATE calendar_connections SET state='needs_reauth' WHERE connection_id=(SELECT connection_id FROM calendar_task_grants WHERE grant_id=?)").run(second);
  await expect(f.routines.run({ routineId: skill.routineId, expectedRevision: reviewed.revision }))
    .rejects.toThrow(/Reconnect a selected Calendar account/);
  f.repo.db.prepare("UPDATE calendar_connections SET state='active' WHERE connection_id=(SELECT connection_id FROM calendar_task_grants WHERE grant_id=?)").run(second);
  expect((await f.routines.run({ routineId: skill.routineId, expectedRevision: reviewed.revision })).status).toBe("running");
});

it("shows criterion evidence only for the linked Skill run and marks it stale after a later task run", async () => {
  const f = fixture(async () => ({ runId: "skill-agent-run" }));
  const evidence = new TaskEvidenceService(f.repo, f.events);
  const skill = f.routines.fromResult({ taskId: f.task.taskId, title: "Evidence Skill" });
  const occurrence = await f.routines.run({ routineId: skill.routineId, expectedRevision: skill.revision });
  f.repo.saveRun({ runId: "skill-agent-run", goal: "Compare vendors", status: "completed", pageIds: [], createdAt: Date.now(), endedAt: Date.now(), config: { taskId: f.task.taskId, taskRevision: f.task.revision } });
  const note = evidence.recordNote({ taskId: f.task.taskId, expectedRevision: f.task.revision, criterionId: "c", summary: "Report saved" }, "desktop_user");
  const review = evidence.review({ taskId: f.task.taskId, expectedRevision: f.task.revision, criterionId: "c", outcome: "accepted", evidenceIds: [note.evidenceId], note: "Checked the report." });
  let result = f.routines.outcome(occurrence.routineRunId, evidence);
  expect(result.run.status).toBe("completed");
  expect(result.linkedRunFound).toBe(true);
  expect(result.criteria[0]).toMatchObject({ status: "accepted", review: { reviewId: review.reviewId }, evidence: [{ record: { evidenceId: note.evidenceId }, stale: false }] });
  f.routines.update({ routineId: skill.routineId, expectedRevision: skill.revision, title: "New Skill revision" });
  f.repo.saveRun({ runId: "later-task-run", goal: "Later task run", status: "completed", pageIds: [], createdAt: Date.now(), endedAt: Date.now(), config: { taskId: f.task.taskId, taskRevision: f.task.revision } });
  evidence.recordNote({ taskId: f.task.taskId, expectedRevision: f.task.revision, criterionId: "c", summary: "Later evidence" }, "desktop_user");
  result = f.routines.outcome(occurrence.routineRunId, evidence);
  expect(result.run.revision).toBe(skill.revision);
  expect(result.criteria[0]?.status).toBe("stale");
  expect(result.criteria[0]?.evidence.map(item => item.record.evidenceId)).toEqual([note.evidenceId]);
});

it("does not expose evidence through a mismatched Skill run link", async () => {
  const f = fixture(async () => ({ runId: "wrong-task-run" }));
  const skill = f.routines.fromResult({ taskId: f.task.taskId });
  const occurrence = await f.routines.run({ routineId: skill.routineId, expectedRevision: skill.revision });
  const other = f.tasks.createWorkspace("Other");
  const otherTask = f.tasks.create({ workspaceId: other.workspaceId, title: "Private", objective: "Private task", criteria: [{ criterionId: "private", description: "Private outcome", verification: "manual" }], resources: [] });
  f.repo.saveRun({ runId: "wrong-task-run", goal: "Private", status: "completed", pageIds: [], createdAt: Date.now(), endedAt: Date.now(), config: { taskId: otherTask.taskId, taskRevision: otherTask.revision } });
  expect(() => f.routines.outcome(occurrence.routineRunId, new TaskEvidenceService(f.repo, f.events))).toThrow(/does not belong/i);
});

it("rejects a source run from another saved task", () => {
  const f = fixture();
  f.repo.saveRun({ runId: "other-task-run", goal: "Other", status: "completed", pageIds: [], createdAt: Date.now(), config: { taskId: "another-task" } });
  expect(() => f.routines.fromResult({ taskId: f.task.taskId, runId: "other-task-run" })).toThrow(/this saved task/);
});

it("holds a Skill dispatch orphaned by restart until a person reconciles it", async () => {
  let calls = 0;
  const f = fixture(async () => { calls += 1; return { runId: "new-run" }; });
  const skill = f.routines.fromResult({ taskId: f.task.taskId, title: "Restart boundary" });
  f.repo.db.prepare("INSERT INTO routine_runs(routine_run_id,routine_id,revision,status,parameters,created_at) VALUES(?,?,?,?,?,?)")
    .run("orphaned-dispatch", skill.routineId, skill.revision, "queued", "{}", Date.now());
  const restarted = new RoutineService(f.repo, f.events, async () => { calls += 1; return { runId: "new-run" }; });
  const recovered = restarted.runs(skill.routineId)[0]!;
  expect(recovered.status).toBe("uncertain");
  expect(recovered.reason).toMatch(/will not retry/i);
  expect(calls).toBe(0);
  await expect(restarted.run({ routineId: skill.routineId, expectedRevision: skill.revision })).rejects.toThrow(/reconcile/i);
  await expect(restarted.reconcile(recovered.routineRunId, "not_applied", " ")).rejects.toThrow(/review note/i);
  await restarted.reconcile(recovered.routineRunId, "not_applied", "Confirmed no work was sent.");
  expect((await restarted.run({ routineId: skill.routineId, expectedRevision: skill.revision })).status).toBe("running");
  expect(calls).toBe(1);
});

it("does not mark a dispatch in progress in this service as orphaned", async () => {
  let finish!: (value: { runId: string }) => void;
  const f = fixture(() => new Promise(resolve => { finish = resolve; }));
  const skill = f.routines.fromResult({ taskId: f.task.taskId, title: "Active dispatch" });
  const pending = f.routines.run({ routineId: skill.routineId, expectedRevision: skill.revision });
  expect(f.routines.runs(skill.routineId)[0]?.status).toBe("queued");
  finish({ runId: "live-run" });
  expect((await pending).status).toBe("running");
});

it("does not dispatch a reviewed schedule after its task scope changes", async () => {
  let calls = 0;
  const f = fixture(async () => { calls += 1; return { runId: "unexpected" }; });
  const skill = f.routines.fromResult({ taskId: f.task.taskId,
    trigger: { kind: "schedule", timezone: "UTC", hour: 9, minute: 0, days: [1, 2, 3, 4, 5] } });
  const scheduledFor = nextScheduledTime(skill.trigger as Extract<typeof skill.trigger, { kind: "schedule" }>, Date.now());
  const waiting = (await f.routines.due(scheduledFor))[0]!;
  expect(waiting.status).toBe("needs_review");
  f.tasks.update({ taskId: f.task.taskId, expectedRevision: f.task.revision, resources: [] });
  const denied = await f.routines.reconcile(waiting.routineRunId, "applied", "Reviewed in Aux.");
  expect(denied.status).toBe("failed");
  expect(denied.reason).toMatch(/source task changed/i);
  expect(calls).toBe(0);
});

it("blocks overlapping runs and uncertain writes, and holds scheduled writes for review", async () => {
  const started: string[] = [];
  const f = fixture(async (_routine, parameters) => {
    started.push(parameters.topic ?? "");
    return { chatId: "c1", runId: "r1" };
  });
  const routine = f.routines.create({
    title: "Write report",
    objective: "Write {{topic}}",
    workspaceId: f.workspace.workspaceId,
    sourceTaskId: f.task.taskId,
    parameters: [{ name: "topic", label: "Topic", value: "alpha" }],
    siteOrigins: ["https://example.com"],
    accountLabels: [],
    reviewRequired: true,
    cloudCapable: false,
    consecutive: false,
    trigger: { kind: "schedule", timezone: "UTC", hour: 9, minute: 0, days: [1, 2, 3, 4, 5] },
    paused: false,
  });
  const scheduledFor = nextScheduledTime(routine.trigger as Extract<typeof routine.trigger, { kind: "schedule" }>, Date.now());
  const waiting = (await f.routines.due(scheduledFor))[0];
  expect(waiting?.status).toBe("needs_review");
  expect(started).toEqual([]);
  const running = await f.routines.reconcile(waiting!.routineRunId, "applied", "Reviewed in Aux.");
  expect(running.status).toBe("running");
  expect(started).toEqual(["alpha"]);
  await expect(f.routines.run({ routineId: routine.routineId, expectedRevision: routine.revision + 1, parameters: { topic: "beta" } })).rejects.toThrow(/changed/i);
  const current = f.routines.get(routine.routineId).routine;
  await expect(f.routines.run({ routineId: current.routineId, expectedRevision: current.revision, parameters: { topic: "beta" } })).rejects.toThrow(/already in progress/i);
  f.repo.db.prepare("UPDATE routine_runs SET status='uncertain' WHERE routine_run_id=?").run(running.routineRunId);
  await expect(f.routines.run({ routineId: current.routineId, expectedRevision: current.revision, parameters: { topic: "beta" } })).rejects.toThrow(/uncertain write/i);
});

it("records missed consequential schedules and coalesces missed monitors", async () => {
  const f = fixture(async () => ({ chatId: "c", runId: "r" }));
  const scheduled = f.routines.create({
    title: "Weekday write",
    objective: "Do the write",
    workspaceId: f.workspace.workspaceId,
    sourceTaskId: f.task.taskId,
    parameters: [],
    siteOrigins: [],
    accountLabels: [],
    reviewRequired: true,
    cloudCapable: false,
    consecutive: false,
    trigger: { kind: "schedule", timezone: "UTC", hour: 9, minute: 0, days: [1, 2, 3, 4, 5] },
    paused: false,
  });
  const scheduledFor = nextScheduledTime(scheduled.trigger as Extract<typeof scheduled.trigger, { kind: "schedule" }>, Date.now());
  const missed = await f.routines.due(scheduledFor + 120_000);
  expect(missed[0]?.status).toBe("missed");
  expect(missed[0]?.reason).toMatch(/not started automatically/i);

  const monitor = f.routines.create({
    title: "Read check",
    objective: "Check the page",
    workspaceId: f.workspace.workspaceId,
    sourceTaskId: f.task.taskId,
    parameters: [],
    siteOrigins: [],
    accountLabels: [],
    reviewRequired: false,
    cloudCapable: false,
    consecutive: false,
    trigger: { kind: "monitor", timezone: "UTC", intervalMinutes: 60 },
    paused: false,
  });
  f.repo.db.prepare("INSERT INTO routine_runs(routine_run_id,routine_id,revision,occurrence_identity,status,reason,parameters,created_at,ended_at) VALUES(?,?,?,?,?,?,?,?,?)")
    .run("missed-1", monitor.routineId, monitor.revision, "old-miss", "missed", "desktop closed", "{}", Date.now(), Date.now());
  const due = await f.routines.due(Date.now());
  const monitorRun = due.find(run => run.routineId === monitor.routineId);
  expect(monitorRun?.status).toBe("running");
  expect(monitorRun?.reason).toMatch(/Coalesced 2 missed/i);
});

it("records each missed daily occurrence after downtime without replaying writes", async () => {
  const started: string[] = [];
  const f = fixture(async routine => { started.push(routine.title); return { runId: "unexpected" }; });
  const routine = f.routines.create({ title: "Daily report", objective: "Publish a report",
    workspaceId: f.workspace.workspaceId, sourceTaskId: f.task.taskId,
    parameters: [], siteOrigins: [], accountLabels: [], reviewRequired: true,
    cloudCapable: false, consecutive: false,
    trigger: { kind: "schedule", timezone: "UTC", hour: 9, minute: 0, days: [0, 1, 2, 3, 4, 5, 6] }, paused: false });
  const first = nextScheduledTime(routine.trigger as Extract<typeof routine.trigger, { kind: "schedule" }>, Date.now() + 60_000);
  const now = first + 3 * 24 * 60 * 60_000 + 120_000;
  const missed = await f.routines.due(now);
  expect(missed.filter(run => run.routineId === routine.routineId)).toHaveLength(4);
  expect(missed.every(run => run.status === "missed")).toBe(true);
  expect(started).toEqual([]);
  expect(await f.routines.due(now)).toEqual([]);
});

it("gives the repeated fall DST minute one occurrence identity", () => {
  const before = routineOccurrenceIdentity("routine", "America/New_York", Date.parse("2026-11-01T05:30:00Z"));
  const after = routineOccurrenceIdentity("routine", "America/New_York", Date.parse("2026-11-01T06:30:00Z"));
  expect(before).toBe(after);
});

it("pauses an automated Skill after three consecutive failed runs", async () => {
  const f = fixture(async () => { throw new Error("fixture dispatch failure"); });
  const routine = f.routines.fromResult({ taskId: f.task.taskId, title: "Failing Skill",
    trigger: { kind: "schedule", timezone: "UTC", hour: 9, minute: 0, days: [1, 2, 3, 4, 5] } });
  for (let attempt = 0; attempt < 3; attempt++) {
    const current = f.routines.get(routine.routineId).routine;
    expect((await f.routines.run({ routineId: current.routineId, expectedRevision: current.revision })).status).toBe("failed");
  }
  expect(f.routines.get(routine.routineId).routine.paused).toBe(true);
  expect(f.routines.alerts().some(alert => alert.routineId === routine.routineId)).toBe(true);
});

it("records an overlapping occurrence and still starts other due Skills", async () => {
  const started: string[] = [];
  const f = fixture(async routine => { started.push(routine.title); return { runId: `run-${started.length}` }; });
  const createMonitor = (title: string) => f.routines.create({
    title, objective: `Check ${title}`, workspaceId: f.workspace.workspaceId,
    sourceTaskId: f.task.taskId, parameters: [], siteOrigins: [], accountLabels: [],
    reviewRequired: false, cloudCapable: false, consecutive: false,
    trigger: { kind: "monitor", timezone: "UTC", intervalMinutes: 5 }, paused: false,
  });
  const blocked = createMonitor("Blocked");
  const ready = createMonitor("Ready");
  await f.routines.run({ routineId: blocked.routineId, expectedRevision: blocked.revision });
  const now = Date.now();
  const occurrences = await f.routines.due(now);
  expect(occurrences.find(run => run.routineId === blocked.routineId)).toMatchObject({ status: "missed" });
  expect(occurrences.find(run => run.routineId === ready.routineId)).toMatchObject({ status: "running" });
  expect(started).toEqual(["Blocked", "Ready"]);
  expect(await f.routines.due(now)).toEqual([]);
});

it("lists coalesced monitor alerts and compares runs without claiming a business outcome", async () => {
  const f = fixture();
  const routine = f.routines.fromResult({ taskId: f.task.taskId, title: "Vendor check", parameters: [] });
  const left = await f.routines.run({ routineId: routine.routineId, expectedRevision: routine.revision, parameters: {} });
  const right = { ...left, routineRunId: "compare-right", status: "completed" as const, createdAt: left.createdAt + 1 };
  f.repo.db.prepare("INSERT INTO routine_runs(routine_run_id,routine_id,revision,status,parameters,created_at) VALUES(?,?,?,?,?,?)")
    .run(right.routineRunId, right.routineId, right.revision, right.status, "{}", right.createdAt);
  const comparison = f.routines.compare(left.routineRunId, right.routineRunId);
  expect(comparison.routineId).toBe(routine.routineId);
  expect(comparison.statusChanged).toBe(true);
  expect(comparison.summary).toMatch(/does not prove a business outcome/i);
  f.repo.db.prepare("UPDATE routine_runs SET status='missed', reason='Missed scheduled run. Consequential work was not started automatically.' WHERE routine_run_id=?")
    .run(left.routineRunId);
  expect(f.routines.alerts().some(alert => alert.routineRunId === left.routineRunId && alert.status === "missed")).toBe(true);
});

it("records cloud-capable missed runs honestly when no cloud starter exists", async () => {
  const f = fixture();
  const routine = f.routines.create({
    title: "Cloud check",
    objective: "Check while closed",
    workspaceId: f.workspace.workspaceId,
    sourceTaskId: f.task.taskId,
    parameters: [],
    siteOrigins: [],
    accountLabels: [],
    reviewRequired: false,
    cloudCapable: true,
    consecutive: false,
    trigger: { kind: "manual" },
    paused: false,
  });
  const run = await f.routines.run({ routineId: routine.routineId, expectedRevision: 1, parameters: {} });
  expect(run.status).toBe("missed");
  expect(run.reason).toMatch(/desktop is closed/i);
});

it("round-trips routines through export and import without ids, deduping on repeat", () => {
  const f = fixture();
  const routine = f.routines.fromResult({ taskId: f.task.taskId, title: "Vendor check", parameters: [{ name: "topic", label: "Topic", value: "hosting" }] });
  const envelope = f.routines.exportRoutines([routine.routineId]);
  expect(envelope.format).toBe("aux-routine@1");
  expect(envelope.routines).toHaveLength(1);
  const share = envelope.routines[0]!;
  expect(share).not.toHaveProperty("workspaceId");
  expect(share).not.toHaveProperty("routineId");
  expect(share).not.toHaveProperty("sourceTaskId");
  expect(share).not.toHaveProperty("sourceRunId");
  expect(share.workspaceName).toBe("Research");
  expect(share.title).toBe("Vendor check");
  expect(share.siteOrigins).toContain("https://example.com");
  expect(share.successCriteria).toEqual(f.task.criteria);

  // same workspace, same content → skipped as duplicate
  const again = f.routines.importRoutines([share], f.workspace.workspaceId);
  expect(again).toMatchObject({ ok: true, imported: 0, skipped: 1, routineIds: [] });

  // a second workspace receives a fresh routine with its own id
  const other = f.tasks.createWorkspace("Operations");
  const imported = f.routines.importRoutines([share], other.workspaceId);
  expect(imported.imported).toBe(1);
  const clone = f.routines.get(imported.routineIds[0]!).routine;
  expect(clone.routineId).not.toBe(routine.routineId);
  expect(clone.revision).toBe(1);
  expect(clone.title).toBe("Vendor check");
  expect(clone.objective).toBe(routine.objective);
  expect(clone.workspaceId).toBe(other.workspaceId);
  expect(clone.parameters).toEqual(routine.parameters);
  expect(clone.sourceTaskId).toBeUndefined();
  expect(clone.paused).toBe(true);
  expect(clone.trigger.kind).toBe("manual");
});

it("imports an inactive definition without local task authority or its schedule", async () => {
  const started: string[] = [];
  const f = fixture(async (_routine, parameters) => { started.push(parameters.topic ?? ""); return { runId: "r1" }; });
  const other = f.tasks.createWorkspace("Other");
  const foreign = f.tasks.create({ workspaceId: other.workspaceId, title: "Foreign", objective: "Foreign", criteria: [{ criterionId: "c", description: "Done", verification: "manual" }], resources: [] });
  const imported = f.routines.importRoutines([{
    title: "Shared", objective: "Check {{topic}}", sourceTaskId: f.task.taskId,
    parameters: [{ name: "topic", label: "Topic", value: "default" }], siteOrigins: [], accountLabels: ["Private"], successCriteria: [],
    autoInject: { keywords: [], urls: [] }, reviewRequired: false, cloudCapable: true, consecutive: true,
    trigger: { kind: "monitor", timezone: "UTC", intervalMinutes: 5 }, paused: false,
  } as RoutineShare], f.workspace.workspaceId);
  const routine = f.routines.get(imported.routineIds[0]!).routine;
  expect(routine.sourceTaskId).toBeUndefined();
  expect(routine).toMatchObject({ accountLabels: [], reviewRequired: true, cloudCapable: false, paused: true, trigger: { kind: "manual" } });
  expect(() => f.routines.pause(routine.routineId, routine.revision, false)).toThrow(/Choose a saved task/);
  expect(() => f.routines.update({ routineId: routine.routineId, expectedRevision: routine.revision, paused: false })).toThrow(/Choose a saved task/);
  expect(await f.routines.due()).toEqual([]);
  expect(() => f.routines.update({ routineId: routine.routineId, expectedRevision: routine.revision, sourceTaskId: foreign.taskId })).toThrow(/this Space/i);
  const bound = f.routines.update({ routineId: routine.routineId, expectedRevision: routine.revision, sourceTaskId: f.task.taskId });
  const ready = f.routines.pause(bound.routineId, bound.revision, false);
  await expect(f.routines.run({ routineId: ready.routineId, expectedRevision: ready.revision, parameters: { hidden: "x" } })).rejects.toThrow(/Unknown routine parameter/);
  expect(started).toEqual([]);
  await f.routines.run({ routineId: ready.routineId, expectedRevision: ready.revision, parameters: { topic: "hosting" } });
  expect(started).toEqual(["hosting"]);
});

it("resolves a workspace by name or falls back, and rejects a named space that does not exist", () => {
  const f = fixture();
  const share = {
    title: "Daily standup watch",
    objective: "Collect the standup notes",
    parameters: [], siteOrigins: [], accountLabels: [],
    reviewRequired: true, cloudCapable: false, consecutive: false,
    trigger: { kind: "manual" as const }, paused: false,
  };
  const byName = f.routines.importRoutines([{ ...share, workspaceName: "Research" }]);
  expect(byName.imported).toBe(1);
  expect(f.routines.get(byName.routineIds[0]!).routine.workspaceId).toBe(f.workspace.workspaceId);
  expect(() => f.routines.importRoutines([{ ...share, title: "Other", workspaceName: "Nowhere" }])).toThrow(/No Space named/i);
});

it("syncs a dispatched routine run with the underlying run's terminal status", async () => {
  const f = fixture(async () => ({ chatId: "c1", runId: "r1" }));
  const routine = f.routines.create({
    title: "Monitor feed", objective: "Check the feed",
    workspaceId: f.workspace.workspaceId, sourceTaskId: f.task.taskId,
    parameters: [], siteOrigins: [], accountLabels: [],
    reviewRequired: false, cloudCapable: false, consecutive: false,
    trigger: { kind: "manual" as const }, paused: false,
  });
  const record = await f.routines.run({ routineId: routine.routineId, expectedRevision: routine.revision });
  expect(record.status).toBe("running");
  f.repo.saveRun({ runId: "r1", goal: "Check", status: "completed", pageIds: [], createdAt: Date.now(), endedAt: Date.now() });
  const synced = f.routines.runs(routine.routineId)[0]!;
  expect(synced.status).toBe("completed");
  expect(synced.endedAt).toBeDefined();
});

it("surfaces a run waiting for input and resumes when the run continues", async () => {
  const f = fixture(async () => ({ chatId: "c1", runId: "r1" }));
  const routine = f.routines.create({
    title: "Watch", objective: "Watch",
    workspaceId: f.workspace.workspaceId, sourceTaskId: f.task.taskId,
    parameters: [], siteOrigins: [], accountLabels: [],
    reviewRequired: false, cloudCapable: false, consecutive: false,
    trigger: { kind: "manual" as const }, paused: false,
  });
  const record = await f.routines.run({ routineId: routine.routineId, expectedRevision: routine.revision });
  f.repo.saveRun({ runId: "r1", goal: "Watch", status: "needs_input", pageIds: [], createdAt: Date.now() });
  const alerts = f.routines.alerts();
  const waiting = alerts.find(a => a.routineRunId === record.routineRunId);
  expect(waiting?.status).toBe("waiting_input");
  expect(waiting?.reason).toMatch(/input/i);
  f.repo.saveRun({ runId: "r1", goal: "Watch", status: "running", pageIds: [], createdAt: Date.now() });
  expect(f.routines.runs(routine.routineId)[0]!.status).toBe("running");
  f.repo.saveRun({ runId: "r1", goal: "Watch", status: "failed", statusMessage: "nav timed out", pageIds: [], createdAt: Date.now(), endedAt: Date.now() });
  const done = f.routines.runs(routine.routineId)[0]!;
  expect(done.status).toBe("failed");
  expect(done.reason).toBe("nav timed out");
});

it("retries a transient monitor dispatch failure once, then records failed", async () => {
  let calls = 0;
  const f = fixture(async () => { calls += 1; throw new Error("navigation timed out"); });
  const routine = f.routines.create({
    title: "Check feed", objective: "Check the feed",
    workspaceId: f.workspace.workspaceId, sourceTaskId: f.task.taskId,
    parameters: [], siteOrigins: [], accountLabels: [],
    reviewRequired: false, cloudCapable: false, consecutive: false,
    trigger: { kind: "monitor" as const, timezone: "UTC", intervalMinutes: 15 }, paused: false,
  });
  const failed = await f.routines.run({ routineId: routine.routineId, expectedRevision: routine.revision });
  expect(calls).toBe(2);
  expect(failed.status).toBe("failed");
  expect(failed.reason).toMatch(/retried once/);

  let calls2 = 0;
  const f2 = fixture(async () => { calls2 += 1; if (calls2 === 1) throw new Error("navigation timed out"); return { chatId: "c", runId: "r" }; });
  const routine2 = f2.routines.create({
    title: "Check feed 2", objective: "Check the feed",
    workspaceId: f2.workspace.workspaceId, sourceTaskId: f2.task.taskId,
    parameters: [], siteOrigins: [], accountLabels: [],
    reviewRequired: false, cloudCapable: false, consecutive: false,
    trigger: { kind: "monitor" as const, timezone: "UTC", intervalMinutes: 15 }, paused: false,
  });
  const ok = await f2.routines.run({ routineId: routine2.routineId, expectedRevision: routine2.revision });
  expect(calls2).toBe(2);
  expect(ok.status).toBe("running");
});

it("does not retry a non-transient monitor dispatch failure", async () => {
  let calls = 0;
  const f = fixture(async () => { calls += 1; throw new AuxError("permission_denied", "denied"); });
  const routine = f.routines.create({
    title: "Check feed", objective: "Check the feed",
    workspaceId: f.workspace.workspaceId, sourceTaskId: f.task.taskId,
    parameters: [], siteOrigins: [], accountLabels: [],
    reviewRequired: false, cloudCapable: false, consecutive: false,
    trigger: { kind: "monitor" as const, timezone: "UTC", intervalMinutes: 15 }, paused: false,
  });
  const failed = await f.routines.run({ routineId: routine.routineId, expectedRevision: routine.revision });
  expect(failed.status).toBe("failed");
  expect(calls).toBe(1);
});
