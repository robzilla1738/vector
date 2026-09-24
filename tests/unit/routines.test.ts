import { afterEach, expect, it } from "vitest";
import { EventBus, openDb, Repo, RoutineService, TaskEvidenceService, TaskService, nextScheduledTime } from "@aux/runtime";
import { AuxError, type RoutineShare } from "@aux/contracts";

const cleanup: (() => void)[] = [];
afterEach(() => { for (const fn of cleanup.splice(0).reverse()) fn(); });

function fixture(startWork?: (routine: { title: string }, parameters: Record<string, string>) => Promise<{ chatId?: string; runId?: string }>) {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
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
  return { repo, events, tasks, workspace, task, routines };
}

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
    reviewRequired: false, cloudCapable: true, consecutive: true,
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
