import { runInNewContext } from "node:vm";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { afterEach, expect, it, vi } from "vitest";
import { openDb, Repo } from "@aux/runtime";
import { createClock } from "@aux/contracts";
import { SqliteColumnCipher } from "../../apps/runtime/src/store/sqlite-protection.js";
import { DemoRecorder, RECORDER_SOURCE, type RecorderObserver } from "../../apps/runtime/src/services/demo-recorder.js";
import { NightShiftService, nightWindow, type NightShiftRuntime } from "../../apps/runtime/src/services/night-shift.js";
import { BudgetsService } from "../../apps/runtime/src/services/budgets.js";
import { compileDemonstration } from "../../apps/runtime/src/services/skill-replay.js";
const closes: (() => void)[] = [];
afterEach(() => { for (const close of closes.splice(0)) close(); });
async function fixture() {
  const db = openDb(":memory:"); closes.push(() => db.close());
  const stored = new Map<string, string>();
  const key = (prefix: string) => `${prefix}_${createHash("sha256").update("fixture").digest("hex").slice(0, 24)}`;
  const create = (name: string) => { if (!stored.has(name)) stored.set(name, randomBytes(32).toString("base64")); return { value: stored.get(name)! }; };
  const cipher = await SqliteColumnCipher.create({
    readSecret: async name => ({ value: stored.get(name) }),
    storeSecret: async (name, value) => { stored.set(name, value); return { ok: true }; },
    profileStorageRoot: async () => create(key("aux_root_v1")),
    profileStorageFactor: async () => create(key("sqlite_factor_v1")),
  }, "fixture", false);
  return { db, repo: new Repo(db, cipher) };
}
it("encrypts actual recorder rows, excludes detached callbacks and removes observer listeners", async () => {
  const { db, repo } = await fixture();
  const listeners = new Map<string, (params: Record<string, unknown>) => void>();
  const sent: string[] = []; let closed = false;
  const observer: RecorderObserver = {
    send: async method => { sent.push(method); return method === "Page.getFrameTree" ? { frameTree: { frame: { id: "main" } } }
      : method === "Page.createIsolatedWorld" ? { executionContextId: 4 } : { identifier: "script" }; },
    on: (event, listener) => { listeners.set(event, listener); return () => { listeners.delete(event); }; },
    close: async () => { closed = true; },
  };
  let sessionId = "attachment-one";
  const recorder = new DemoRecorder(repo, () => ({ attached: true, sessionId, ownedByRuntime: false, url: "https://fixture.test/one" }), async () => observer, () => {});
  const demo = await recorder.start("page");
  const target = { candidates: [{ selector: "label:Company", matches: 1 }] };
  listeners.get("Runtime.bindingCalled")!({ name: "__auxRec", executionContextId: 4, payload: JSON.stringify({ kind: "input", control: "text", value: "Acme", label: "Company", target }) });
  listeners.get("Page.frameNavigated")!({ frame: { id: "main", url: "https://fixture.test/two" } });
  expect(recorder.get(demo.id).steps).toHaveLength(3);
  expect(JSON.stringify(db.prepare("SELECT payload FROM demonstrations").get())).not.toMatch(/Acme|Company|fixture.test/);
  sessionId = "replacement";
  listeners.get("Runtime.bindingCalled")!({ name: "__auxRec", executionContextId: 4, payload: JSON.stringify({ kind: "input", control: "text", value: "Wrong", label: "Company", target }) });
  expect(recorder.get(demo.id).steps).toHaveLength(3);
  await recorder.control(demo.id, "stopped");
  expect(sent).toContain("Page.removeScriptToEvaluateOnNewDocument"); expect(closed).toBe(true); expect(listeners.size).toBe(0);
  await recorder.discard(demo.id); expect(() => recorder.get(demo.id)).toThrow(/unavailable/);
});
it("compiles multi-page reviewed variables with fixed origins and a final oracle", () => {
  const demo = { id: "demo", pageId: "page", state: "stopped" as const, startedAt: 1,
    steps: [{ kind: "input" as const, control: "text" as const, target: { candidates: [{ selector: "label:Company", matches: 1 }] }, value: "Acme", label: "Company" },
      { kind: "navigate" as const, url: "https://fixture.test/next" }] };
  const review = { inputs: [{ step: 0, parameter: "company", confirmed: true }], targets: [{ step: 0, selector: "label:Company", confirmed: true }],
    navigationTemplates: [{ step: 1, url: "https://fixture.test/company/{{company}}" }],
    finalWait: { id: "oracle", op: "waitFor" as const, condition: { kind: "selector" as const, selector: "#done", state: "visible" as const } } };
  const steps = compileDemonstration(demo, review, ["https://fixture.test"]);
  expect(JSON.stringify(steps)).not.toContain("Acme"); expect(steps.at(-1)?.op).toBe("waitFor");
  expect(() => compileDemonstration(demo, { ...review, targets: [] }, ["https://fixture.test"])).toThrow(/target/);
  expect(() => compileDemonstration(demo, { ...review, navigationTemplates: [{ step: 1, url: "https://other.test/" }] }, ["https://fixture.test"])).toThrow(/origin/);
});
it("keeps midnight-crossing windows bounded to one local night", () => {
  const now = new Date(2026, 9, 1, 2, 0).getTime();
  const window = nightWindow(now, "23:00", "08:00");
  expect(window.inside).toBe(true); expect(window.windowDate).toBe("2026-09-30");
  expect(nightWindow(new Date(2026, 9, 1, 8, 0).getTime(), "23:00", "08:00").inside).toBe(false);
});
it("never starts proposals, serializes actual queue claims and links identity before launch", async () => {
  const { repo, db } = await fixture(); let now = new Date(2026, 9, 1, 2, 0).getTime(); let ac = false; let background = true; let count = 0;
  repo.setSetting("nightShift", { enabled: true, start: "00:00", end: "08:00", nightlyUsd: 2, perTaskUsd: 0.5, requireAC: true });
  let release: (() => void) | undefined;
  const runtime: NightShiftRuntime = { backgroundEnabled: () => background, onAC: async () => ac,
    releaseActivity: async () => {}, powerActivity: async () => ({ active: ac }),
    start: async (_payload, item, id) => {
      count++; expect(db.prepare("SELECT run_id FROM night_queue WHERE id=?").get(item.id)).toMatchObject({ run_id: id });
      await new Promise<void>(resolve => { release = resolve; }); return id;
    }, cancel: () => {}, resume: async () => {}, consolidate: async () => {}, reindex: async () => {} };
  const service = new NightShiftService(repo, runtime, new BudgetsService(db, () => ({})), createClock(1, () => now));
  const proposed = service.propose({ payload: { kind: "goal", goalId: "goal" }, budgetUsd: 0.4 });
  await service.tick(); expect(count).toBe(0);
  ac = true; await service.tick(); expect(count).toBe(0);
  await service.review(proposed.id, "approve"); background = false; await service.tick(); expect(count).toBe(0);
  background = true; const tick = service.tick();
  await service.tick(); await vi.waitFor(() => expect(count).toBe(1)); release!(); await tick;
  expect(service.get(proposed.id).runId).toBeTruthy();
  now = new Date(2026, 9, 1, 8, 0).getTime(); await service.tick();
  expect(service.get(proposed.id).status).toBe("needs_review");
});
it("refuses protected storage absence rather than persisting plaintext", () => {
  const db = openDb(":memory:"); closes.push(() => db.close()); const repo = new Repo(db);
  const service = new NightShiftService(repo, { backgroundEnabled: () => true, onAC: async () => true,
    releaseActivity: async () => {}, powerActivity: async () => ({ active: true }), start: async () => "run", cancel: () => {}, resume: async () => {}, consolidate: async () => {}, reindex: async () => {} }, new BudgetsService(db, () => ({})));
  expect(() => service.queue({ payload: { kind: "goal", goalId: "goal" }, budgetUsd: 0.2 })).toThrow(/protected/);
});

it("the actual isolated script filters untrusted events and never reads secret values", () => {
  const listeners = new Map<string, (event: { isTrusted: boolean; target: Element }) => void>();
  const emitted: unknown[] = [];
  class Control {
    type = "password"; autocomplete = ""; name = "password"; id = "password"; tagName = "INPUT";
    labels = [{ textContent: "Password" }];
    get value(): never { throw new Error("Secret value accessed"); }
    getAttribute() { return null; }
    closest() { return this; }
  }
  const input = new Control();
  runInNewContext(RECORDER_SOURCE, { Element: Control, CSS: { escape: (value: string) => value },
    document: { addEventListener: (event: string, fn: (event: { isTrusted: boolean; target: Element }) => void) => listeners.set(event, fn), querySelectorAll: () => [input] },
    __auxRec: (payload: string) => emitted.push(JSON.parse(payload)),
  });
  const fire = listeners.get("input")!;
  fire({ isTrusted: false, target: input as unknown as Element }); expect(emitted).toEqual([]);
  fire({ isTrusted: true, target: input as unknown as Element });
  expect(emitted).toMatchObject([{ kind: "credentialFill" }]); expect(JSON.stringify(emitted)).not.toContain('"value"');
  input.type = "text"; input.autocomplete = "section-billing cc-number";
  fire({ isTrusted: true, target: input as unknown as Element }); expect(emitted).toHaveLength(2);
  input.autocomplete = "one-time-code";
  fire({ isTrusted: true, target: input as unknown as Element }); expect(emitted).toHaveLength(3);
});

it("rejects captured target ambiguity even after an explicit checkbox review", () => {
  const demo = { id: "demo", pageId: "page", state: "stopped" as const, startedAt: 1,
    steps: [{ kind: "click" as const, target: { candidates: [{ selector: "role:button|Send", matches: 2 }] } }] };
  expect(() => compileDemonstration(demo, { inputs: [], targets: [{ step: 0, selector: "role:button|Send", confirmed: true }], navigationTemplates: [],
    finalWait: { id: "done", op: "waitFor", condition: { kind: "selector", selector: "#done", state: "visible" } } }, ["https://fixture.test"]))
    .toThrow(/target/);
});

it("compiles reviewed password entry only to the native secure handoff and refuses OTP", () => {
  const demo = { id: "demo", pageId: "page", state: "stopped" as const, startedAt: 1,
    steps: [{ kind: "credentialFill" as const, secretType: "password" as const, target: { candidates: [{ selector: "css:#password", matches: 1 }] } }] };
  const review = { inputs: [], targets: [{ step: 0, selector: "css:#password", confirmed: true }], navigationTemplates: [],
    finalWait: { id: "done", op: "waitFor" as const, condition: { kind: "selector" as const, selector: "#done", state: "visible" as const } } };
  expect(compileDemonstration(demo, review, ["https://fixture.test"])[0]).toMatchObject({ op: "fillCredential", passwordSelector: "#password" });
  expect(() => compileDemonstration({ ...demo, steps: [{ ...demo.steps[0]!, secretType: "otp" }] }, review, ["https://fixture.test"]))
    .toThrow(/one|OTP|person/);
});

it("uses actual billed calls for nightly scope, exhaustion and the morning summary", async () => {
  const { repo, db } = await fixture(); const now = new Date(2026, 9, 1, 2).getTime();
  repo.setSetting("nightShift", { enabled: true, start: "00:00", end: "08:00", nightlyUsd: 1, perTaskUsd: 0.5, requireAC: true });
  let releases = 0;
  const runtime: NightShiftRuntime = { backgroundEnabled: () => true, onAC: async () => true,
    releaseActivity: async () => { releases++; }, powerActivity: async () => ({ active: true }),
    start: async (_payload, _item, runId) => {
      repo.saveRun({ runId, goal: "Night fixture", pageIds: [], status: "running", createdAt: now }); return runId;
    }, cancel: () => {}, resume: async () => {}, consolidate: async () => {}, reindex: async () => {} };
  const budgets = new BudgetsService(db, () => ({}));
  const service = new NightShiftService(repo, runtime, budgets, createClock(1, () => now));
  const item = service.queue({ payload: { kind: "goal", goalId: "goal" }, budgetUsd: 0.4 }); await service.tick();
  const runId = service.get(item.id).runId!;
  repo.saveModelCall({ callId: randomUUID(), runId, role: "agent", modelId: "fixture/test", durationMs: 1, costUsd: 0.4, createdAt: now });
  repo.saveModelCall({ callId: randomUUID(), runId: "other", role: "agent", modelId: "fixture/test", durationMs: 1, costUsd: 9, createdAt: now });
  expect(service.budgetStatus(runId)).toMatchObject([{ scope: "nightShift", limitUsd: 0.4, spentUsd: 0.4, exceeded: true }, { scope: "nightShift", spentUsd: 0.4 }]);
  expect(() => service.assertRun(runId)).toThrow(/budget/);
  expect(service.summary()).toMatchObject({ spentUsd: 0.4, limitUsd: 1, done: 0 });
  await service.close(); expect(releases).toBeGreaterThan(0); expect(service.get(item.id).status).toBe("needs_review");
});

it("continues only the owner-resolved pending Skill step and never repeats the earlier verified write", async () => {
  const { repo, db } = await fixture();
  const { EventBus } = await import("@aux/runtime");
  const { AuxError } = await import("@aux/contracts");
  const { startSkillReplay, replayDigest } = await import("../../apps/runtime/src/services/skill-replay.js");
  const { resumeSkillApproval } = await import("../../apps/runtime/src/services/skill-continuation.js");
  const { SuspensionStore } = await import("../../apps/runtime/src/safety/suspensions.js");
  const steps: import("@aux/contracts").PlanStep[] = [
    { id: "fill", op: "fill", target: "css:#company", value: "{{company}}" },
    { id: "send", op: "click", target: "css:#send", expect: [{ kind: "selector", selector: "#done", state: "visible" }] },
    { id: "oracle", op: "waitFor", condition: { kind: "selector", selector: "#done", state: "visible" } },
  ];
  const routine = { routineId: "reviewed", revision: 1, workspaceId: "workspace", title: "Company", parameters: [{ name: "company" }],
    replay: { format: 2, sourceRunId: "source", siteOrigin: "https://fixture.test", siteOrigins: ["https://fixture.test"], steps,
      digest: replayDigest("source", "https://fixture.test", steps) } } as unknown as import("@aux/contracts").Routine;
  repo.insertWorkspace("workspace", "Fixture", 1);
  db.prepare("INSERT INTO routines VALUES(?,?,?,?,?,?,?)").run("reviewed", "workspace", 1, 1, null, 1, JSON.stringify(routine));
  const suspensions = new SuspensionStore(db);
  const { ApprovalStore } = await import("../../apps/runtime/src/safety/approval.js");
  const approvals = new ApprovalStore(db, () => {}, repo.columnCipher);
  let actualApproval = "";
  const invoked: string[] = [];
  const page = { sessionId: "actual-attachment", documentEpoch: 0, controllerEpoch: 0, url: "https://fixture.test", ownedByRuntime: false };
  const pages = { get: () => page, isAttached: () => true,
    execute: async (program: { steps: import("@aux/contracts").PlanStep[] }, ctx: { runId: string; safety?: { steps?: Record<string, { approvalId?: string }> } }) => {
      const step = program.steps[0]!;
      if (step.id === "send" && (!actualApproval || ctx.safety?.steps?.send?.approvalId !== actualApproval)) {
        actualApproval = approvals.issue({ profileId: "fixture", scope: { kind: "workspace", id: "workspace" }, effect: "egress",
          action: "browser.click", category: "send", confirmation: "action", invocationDigest: "a".repeat(64),
          origin: "https://fixture.test", turnId: ctx.runId, threadId: "page:page", requestedAt: Date.now() }, "turn");
        suspensions.park({ runId: ctx.runId, threadId: "page:page", turnId: ctx.runId, kind: "approval", request: { kind: "approval", guidance: "Review this send", instruction: "Approve send", approvalId: actualApproval } });
        throw new AuxError("needs_input", "Approve send");
      }
      invoked.push(step.id);
      const { id: _id, op, timeoutMs: _timeout, optional: _optional, expect: _expect, ...inputs } = step;
      repo.saveStep({ stepId: randomUUID(), runId: ctx.runId, pageId: "page", op, inputs, startedAt: Date.now(),
        outcome: { stepId: step.id, op, status: "ok", startedAt: Date.now(), durationMs: 1, effect: "observed" } });
      return { status: "completed", steps: [] };
    } } as unknown as import("../../apps/runtime/src/services/pages.js").PageService;
  const context = { repo, pages, events: new EventBus(repo) };
  const { runId } = startSkillReplay({ ...context, routine, pageId: "page", parameters: { company: "Globex" } });
  await vi.waitFor(() => expect(repo.getRun(runId)?.status).toBe("needs_input"));
  expect(invoked).toEqual(["fill"]);
  expect(JSON.stringify(db.prepare("SELECT payload FROM skill_continuations").get())).not.toContain("Globex");
  expect(() => resumeSkillApproval(context, runId, "forged", true)).toThrow(/resolved/);
  repo.saveRun({ ...repo.getRun(runId)!, config: { ...repo.getRun(runId)!.config, nightShiftItemId: "night-item" } });
  expect(() => resumeSkillApproval(context, runId, actualApproval, true)).toThrow(/Apply/);
  const { nightShiftItemId: _night, ...foreground } = repo.getRun(runId)!.config!;
  repo.saveRun({ ...repo.getRun(runId)!, config: foreground });
  approvals.decideLocal({ decision: "accept", approvalId: actualApproval }, runId);
  suspensions.resolveByApprovalId(actualApproval, "answered");
  expect(resumeSkillApproval(context, runId, actualApproval, true)).toBe(true);
  await vi.waitFor(() => expect(repo.getRun(runId)?.status).toBe("completed"));
  expect(invoked).toEqual(["fill", "send", "oracle"]);
  expect(repo.listSteps(runId)).toHaveLength(3);
  expect(() => resumeSkillApproval(context, runId, actualApproval, true)).toThrow(/no longer/);
});

it("stores only a repair proposal until owner review, refuses ambiguity and stale attachments, and requires retesting", async () => {
  const { repo, db } = await fixture();
  const { SkillReplayRepairs } = await import("../../apps/runtime/src/services/skill-repair.js");
  const { replayDigest } = await import("../../apps/runtime/src/services/skill-replay.js");
  const steps: import("@aux/contracts").PlanStep[] = [
    { id: "send", op: "click", target: "css:#old" },
    { id: "oracle", op: "waitFor", condition: { kind: "selector", selector: "#done", state: "visible" } },
  ];
  const routine = { routineId: "skill", revision: 3, paused: true,
    replay: { format: 2, sourceRunId: "source", siteOrigin: "https://fixture.test", siteOrigins: ["https://fixture.test"], steps,
      digest: replayDigest("source", "https://fixture.test", steps), state: "needs_repair", testRunId: "old-test", testedRevision: 2 } } as unknown as import("@aux/contracts").Routine;
  let sessionId = "attachment"; let duplicates = false; let dispatched = 0;
  const pages = { get: () => ({ sessionId, documentEpoch: 2, url: "https://fixture.test", ownedByRuntime: false }), isAttached: () => true,
    observe: async () => ({ content: { elements: Array.from({ length: duplicates ? 2 : 1 }, () => ({ selector: { css: "#new" } })) } }),
    execute: () => { dispatched++; } } as unknown as import("../../apps/runtime/src/services/pages.js").PageService;
  const repairs = new SkillReplayRepairs(repo);
  duplicates = true;
  await expect(repairs.propose(routine, "page", [{ stepId: "send", selector: "css:#new" }], pages)).rejects.toThrow(/unambiguous/);
  duplicates = false;
  const proposal = await repairs.propose(routine, "page", [{ stepId: "send", selector: "css:#new" }], pages);
  expect(dispatched).toBe(0); expect(routine.replay!.steps[0]).toMatchObject({ target: "css:#old" });
  expect(JSON.stringify(db.prepare("SELECT payload FROM skill_replay_repairs").get())).not.toContain("css:#new");
  sessionId = "replacement";
  expect(() => repairs.apply(routine, proposal.proposalId, pages)).toThrow(/attachment changed/);
  sessionId = "attachment";
  expect(() => repairs.apply({ ...routine, revision: 4 }, proposal.proposalId, pages)).toThrow(/changed/);
  const applied = repairs.apply(routine, proposal.proposalId, pages);
  expect(applied).toMatchObject({ state: "untested", testRunId: undefined, testedRevision: undefined });
  expect(applied!.digest).not.toBe(routine.replay!.digest);
  expect(applied!.steps[0]).toMatchObject({ target: "css:#new" });
  expect(dispatched).toBe(0);
  expect(() => repairs.apply(routine, proposal.proposalId, pages)).toThrow(/no longer current/);
});

it("records one trusted Enter activation without also replaying its synthesized click or submit", () => {
  const handlers = new Map<string, (event: Record<string, unknown>) => void>();
  const emitted: { kind: string }[] = [];
  class Control {
    id = "send"; tagName = "BUTTON"; textContent = "Send"; type = "submit"; name = ""; labels = []; form = {};
    closest() { return this; } getAttribute() { return ""; }
  }
  const button = new Control();
  runInNewContext(RECORDER_SOURCE, { Element: Control, CSS: { escape: (value: string) => value },
    document: { addEventListener: (event: string, fn: (event: Record<string, unknown>) => void) => handlers.set(event, fn), querySelectorAll: () => [button] },
    __auxRec: (payload: string) => emitted.push(JSON.parse(payload)) });
  handlers.get("keydown")!({ isTrusted: true, target: button, key: "Enter" });
  handlers.get("click")!({ isTrusted: true, target: button, detail: 0 });
  expect(handlers.has("submit")).toBe(false);
  expect(emitted).toMatchObject([{ kind: "key", key: "Enter" }]);
  handlers.get("click")!({ isTrusted: true, target: button, detail: 1 });
  expect(emitted).toHaveLength(2); // A separate physical pointer click remains a separate action.
});

it("fresh window and background checks preserve real parked approvals for person review", async () => {
  const { repo, db } = await fixture();
  const now = new Date(2026, 9, 1, 2, 0).getTime();
  const settings = { enabled: true, start: "00:00", end: "08:00", nightlyUsd: 2, perTaskUsd: 0.5, requireAC: true };
  repo.setSetting("nightShift", settings);
  let background = true; let cancelled = 0; let released = 0;
  const runtime: NightShiftRuntime = { backgroundEnabled: () => background, onAC: async () => true,
    releaseActivity: async () => { released++; }, powerActivity: async () => ({ active: true }),
    start: async (_payload, _item, runId) => runId, cancel: () => { cancelled++; }, resume: async () => {}, consolidate: async () => {}, reindex: async () => {} };
  const service = new NightShiftService(repo, runtime, new BudgetsService(db, () => ({})), createClock(1, () => now));
  const item = service.queue({ payload: { kind: "goal", goalId: "goal" }, budgetUsd: 0.2 });
  await service.tick();
  const runId = service.get(item.id).runId!;
  repo.setSetting("nightShift", { ...settings, start: "03:00" });
  await expect(service.assertDispatch(runId)).rejects.toThrow(/window/);
  // This metadata transition represents a real preflight approval park, never a consent grant.
  db.prepare("UPDATE night_queue SET status='parked' WHERE id=?").run(item.id);
  background = false;
  await service.tick();
  expect(service.get(item.id).status).toBe("needs_review");
  expect(cancelled).toBe(0); expect(released).toBeGreaterThan(0);
});

it("stores reviewed overnight Skill variables only in the protected queue and refuses excessive inputs", async () => {
  const { repo, db } = await fixture();
  const service = new NightShiftService(repo, { backgroundEnabled: () => false, onAC: async () => true,
    releaseActivity: async () => {}, powerActivity: async () => ({ active: false }), start: async () => { throw new Error("Never launch outside authority"); }, cancel: () => {}, resume: async () => {}, consolidate: async () => {}, reindex: async () => {} }, new BudgetsService(db, () => ({})));
  const payload = { kind: "routine", routineId: "skill", revision: 2, parameters: { company: "Synthetic reviewed company" } };
  const item = service.queue({ payload, budgetUsd: 0.2 });
  expect(service.get(item.id).payload).toEqual(payload);
  expect(JSON.stringify(db.prepare("SELECT payload FROM night_queue").all())).not.toContain("Synthetic reviewed company");
  expect(() => service.queue({ payload: { ...payload, parameters: Object.fromEntries(Array.from({ length: 21 }, (_, index) => [`v${index}`, "value"])) }, budgetUsd: 0.2 })).toThrow(/variables/);
});

it("resolves real saved-task goals and refuses a changed queued task before run launch", async () => {
  const { repo } = await fixture();
  const { EventBus, TaskService } = await import("@aux/runtime");
  const { GoalService } = await import("../../apps/runtime/src/services/goals.js");
  const { resolveNightGoalTask, overnightRuntime } = await import("../../apps/runtime/src/features/overnight-review/runtime.js");
  const events = new EventBus(repo), tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Night goal binding");
  const task = tasks.create({ workspaceId: workspace.workspaceId, title: "Read fixture", objective: "Read the reviewed fixture", criteria: [{ criterionId: "done", description: "Heading read", verification: "browser" }], resources: [] });
  let launches = 0;
  const control = { start: async () => { launches++; throw new Error("Unreviewed task must never launch"); }, pause: () => {}, resume: () => {}, cancel: () => {} };
  const goals = new GoalService(repo, control as never);
  const goal = goals.create({ workspaceId: workspace.workspaceId, chatId: `task:${task.taskId}`, objective: task.objective, budget: { maxCostUsd: 0.2 } });
  const services = { repo, events, goals, runs: control } as unknown as import("../../apps/runtime/src/api/methods/context.js").Services;
  expect(resolveNightGoalTask(services, goal.goalId).taskId).toBe(task.taskId);
  const runtime = overnightRuntime(services, { status: async () => ({ onAC: true, backgroundEnabled: true }), activity: async () => ({ active: true }), release: async () => {} });
  const payload = { kind: "goal" as const, goalId: goal.goalId, taskId: task.taskId, taskRevision: task.revision };
  tasks.update({ taskId: task.taskId, expectedRevision: task.revision, objective: "Changed fixture authority" });
  await expect(runtime.start(payload, { id: "night-item", payload, budgetUsd: 0.2, status: "running", createdBy: "person", createdAt: 1 }, "reserved-run")).rejects.toThrow(/queued task changed/);
  expect(launches).toBe(0);
  goals.cancel(goal.goalId);
  const other = tasks.createWorkspace("Other Space");
  const wrong = goals.create({ workspaceId: other.workspaceId, chatId: `task:${task.taskId}`, objective: task.objective, budget: { maxCostUsd: 0.2 } });
  expect(() => resolveNightGoalTask(services, wrong.goalId)).toThrow(/reviewed saved task/);
});

it("refuses code-mode recorder and overnight owner actions before touching services", async () => {
  const { demonstrationMethods } = await import("../../apps/runtime/src/api/methods/demonstration.js");
  const { nightShiftMethods } = await import("../../apps/runtime/src/api/methods/night-shift.js");
  for (const [method, handler] of [...Object.entries(demonstrationMethods), ...Object.entries(nightShiftMethods).filter(([method]) => method !== "nightShift.propose")]) {
    await expect(handler!({ method, client: { external: false, codeMode: true }, s: {}, params: {} } as unknown as import("../../apps/runtime/src/api/methods/context.js").MethodCtx))
      .rejects.toMatchObject({ code: "permission_denied" });
  }
});

it("checks the real overnight window before each replayed Skill dispatch", async () => {
  const { repo, db } = await fixture();
  const { EventBus } = await import("@aux/runtime");
  const { startSkillReplay, replayDigest } = await import("../../apps/runtime/src/services/skill-replay.js");
  const { installNightShift } = await import("../../apps/runtime/src/features/overnight-review/service.js");
  let now = new Date(2026, 9, 1, 1).getTime();
  repo.setSetting("nightShift", { enabled: true, start: "00:00", end: "08:00", nightlyUsd: 2, perTaskUsd: 0.5, requireAC: true });
  const steps: import("@aux/contracts").PlanStep[] = [
    { id: "first", op: "fill", target: "css:#company", value: "Globex" },
    { id: "later", op: "waitFor", condition: { kind: "selector", selector: "#done", state: "visible" } },
  ];
  const routine = { routineId: "night-skill", revision: 1, workspaceId: "workspace", title: "Night Skill", parameters: [],
    replay: { sourceRunId: "source", siteOrigin: "https://fixture.test", siteOrigins: ["https://fixture.test"], steps,
      digest: replayDigest("source", "https://fixture.test", steps) } } as unknown as import("@aux/contracts").Routine;
  repo.insertWorkspace("workspace", "Fixture", 1);
  db.prepare("INSERT INTO routines VALUES(?,?,?,?,?,?,?)").run(routine.routineId, "workspace", 1, 1, null, 1, JSON.stringify(routine));
  const dispatched: string[] = [];
  const page = { sessionId: "live", documentEpoch: 0, controllerEpoch: 0, url: "https://fixture.test", ownedByRuntime: false };
  const pages = { get: () => page, isAttached: () => true, execute: async (program: { steps: import("@aux/contracts").PlanStep[] }, ctx: { runId: string }) => {
    const step = program.steps[0]!; dispatched.push(step.id);
    const { id: _id, op, ...inputs } = step;
    repo.saveStep({ stepId: randomUUID(), runId: ctx.runId, pageId: "page", op, inputs, startedAt: now,
      outcome: { stepId: step.id, op, status: "ok", startedAt: now, durationMs: 1, effect: "observed" } });
    now = new Date(2026, 9, 1, 8).getTime();
    return { status: "completed", steps: [] };
  } } as unknown as import("../../apps/runtime/src/services/pages.js").PageService;
  const events = new EventBus(repo);
  const runtime: NightShiftRuntime = { backgroundEnabled: () => true, onAC: async () => true,
    releaseActivity: async () => {}, powerActivity: async () => ({ active: true }), cancel: () => {}, resume: async () => {},
    consolidate: async () => {}, reindex: async () => {}, start: async (_payload, item, runId) => {
      return startSkillReplay({ repo, pages, events, routine, pageId: "page", parameters: {}, deliveryRunId: runId, nightShiftItemId: item.id }).runId;
    } };
  const service = new NightShiftService(repo, runtime, new BudgetsService(db, () => ({})), createClock(1, () => now));
  const remove = installNightShift({ repo } as import("../../apps/runtime/src/api/methods/context.js").Services, service);
  try {
    const item = service.queue({ payload: { kind: "routine", routineId: routine.routineId, revision: 1 }, budgetUsd: 0.4 });
    await service.tick();
    await vi.waitFor(() => expect(repo.getRun(service.get(item.id).runId!)?.status).toBe("failed"));
    expect(dispatched).toEqual(["first"]);
    expect(repo.listSteps(service.get(item.id).runId!)).toHaveLength(1);
  } finally { await remove(); }
});


it("the actual page executor stops later program steps when the overnight window closes", async () => {
  const { repo, db } = await fixture();
  const { EventBus, NullNativeBridge } = await import("@aux/runtime");
  const { PageService } = await import("../../apps/runtime/src/services/pages.js");
  const { fixtureTurnMentions } = await import("../fixtures/turn-mentions.js");
  const { installNightShift } = await import("../../apps/runtime/src/features/overnight-review/service.js");
  let now = new Date(2026, 9, 1, 1).getTime();
  repo.setSetting("nightShift", { enabled: true, start: "00:00", end: "08:00", nightlyUsd: 2, perTaskUsd: 0.5, requireAC: true });
  const dispatched: string[] = [];
  const driver: import("@aux/chromium-driver").BrowserDriver = {
    backend: "aux", connect: async () => {}, disconnect: async () => {}, isConnected: () => true,
    listTargets: async () => [], createTarget: async () => "fixture-target",
    attach: async (_targetId, pageId) => ({ identity: { pageId, targetId: "fixture-target", backend: "aux" },
      url: () => "https://fixture.test/", title: async () => "Overnight fixture", isAttached: () => true,
      navigate: async () => {}, setEvents: () => {}, dispose: async () => {},
      waitFor: async (condition: import("@aux/contracts").Condition) => {
        dispatched.push(condition.kind === "selector" ? condition.selector : condition.kind);
        now = new Date(2026, 9, 1, 8).getTime(); return { ok: true, timedOut: false };
      },
    }) as unknown as import("@aux/chromium-driver").DriverPage,
  };
  const events = new EventBus(repo);
  const mentions = fixtureTurnMentions(id => pages.get(id));
  const pages = new PageService({ repo, events, turnMentions: mentions, native: new NullNativeBridge(),
    drivers: () => ({ aux: driver, chrome: null }), grants: ["effect:read"] });
  const page = await pages.open({ url: "https://fixture.test/", ownedByRuntime: true, background: true });
  let runId = "";
  const service = new NightShiftService(repo, { backgroundEnabled: () => true, onAC: async () => true,
    releaseActivity: async () => {}, powerActivity: async () => ({ active: true }), cancel: () => {}, resume: async () => {},
    consolidate: async () => {}, reindex: async () => {}, start: async (_payload, item, reserved) => {
      runId = reserved;
      repo.saveRun({ runId, goal: "Read overnight fixture", pageIds: [page.pageId], status: "running", createdAt: now,
        config: { implementation: "builtin-agent", nightShiftItemId: item.id } });
      await mentions.begin(runId, [], [page.pageId]); return runId;
    } }, new BudgetsService(db, () => ({})), createClock(1, () => now));
  const remove = installNightShift({ repo } as import("../../apps/runtime/src/api/methods/context.js").Services, service);
  try {
    const item = service.queue({ payload: { kind: "goal", goalId: "fixture-goal" }, budgetUsd: 0.4 });
    await service.tick();
    const result = await pages.execute({ pageId: page.pageId, steps: [
      { id: "first", op: "waitFor", condition: { kind: "selector", selector: "#first", state: "visible" } },
      { id: "later", op: "waitFor", condition: { kind: "selector", selector: "#later", state: "visible" } },
    ] }, { runId });
    expect(result.status).toBe("failed");
    expect(result.steps[1]?.error).toMatchObject({ code: "permission_denied" });
    expect(dispatched).toEqual(["#first"]);
    expect(repo.getRun(runId)?.status).toBe("running");
    expect(service.get(item.id).status).toBe("running");
  } finally { await remove(); }
});
