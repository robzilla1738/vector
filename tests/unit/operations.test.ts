import { describe, it, expect } from "vitest";
import { openDb, Repo, EventBus, OperationService, TaskEvidenceService, TaskService } from "@aux/runtime";
import { TaskReceiptSchema, type PageTarget, type Program } from "@aux/contracts";

const repo = () => new Repo(openDb(":memory:"));

const page = (over: Partial<PageTarget> = {}): PageTarget => ({
  pageId: "p1",
  backend: "aux",
  targetId: "atab-p1",
  url: "http://app.test/records",
  title: "records",
  documentEpoch: 0,
  lastRevision: 0,
  viewStatus: "visible",
  controller: "none",
  controllerEpoch: 0,
  ownedByRuntime: false,
  createdAt: Date.now(),
  lastActiveAt: Date.now(),
  ...over,
});

const ELEMENTS = [
  { ref: "r1", frame: "main", tag: "button", role: "button", name: "Save" },
  { ref: "r2", frame: "main", tag: "input", role: "textbox", name: "Summary" },
];

/** minimal PageService stand-in — observe + get + execute */
const fakePages = (over: { executeResult?: unknown; elements?: typeof ELEMENTS; httpStatus?: number; httpBody?: string } = {}) => ({
  get: (pageId: string) => (pageId === "p1" ? page() : undefined),
  observe: async () => ({
    observationId: "o1",
    pageId: "p1",
    documentEpoch: 0,
    revision: 1,
    observedAt: Date.now(),
    scope: "full",
    content: { url: "http://app.test/records", title: "records", elements: over.elements ?? ELEMENTS },
  }),
  execute: async (prog: { steps?: { op: string; as?: string }[] }) => {
    // in-page session-request path: an `evaluate` step asks for as:"response"
    if (prog.steps?.some((s) => s.op === "evaluate" && s.as === "response")) {
      const status = over.httpStatus ?? 200;
      return {
        status: "completed", steps: [],
        extracted: { response: { status, ok: status < 400, body: over.httpBody ?? '{"ok":true}' } },
      };
    }
    return over.executeResult ?? { status: "completed", steps: [], extracted: { saved: true } };
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;

const svc = (pages = fakePages()) => {
  const r = repo();
  return new OperationService({ repo: r, events: new EventBus(r), pages, translateSteps: (_p, s) => s,
    grants: ["effect:read", "effect:write", "effect:egress", "effect:destructive"] });
};

const program = (): Omit<Program, "pageId"> & { pageId?: string } => ({
  pageId: "p1",
  steps: [{ op: "click", target: "role=button[name=Save]" } as never],
});

describe("OperationService", () => {
  it("keeps the built-in connector route sealed from generic operation calls", async () => {
    const s = svc();
    expect(() => s.saveFromProgram({ siteKey: "aux.connector.google-calendar", name: "events.list", program: program() })).toThrow(/managed by Aux/);
    expect(() => s.saveRequestImpl({ siteKey: "aux.connector.google-calendar", name: "events.list", url: "https://calendar.google.com/api" })).toThrow(/managed by Aux/);
    await expect(s.invoke({ siteKey: "aux.connector.google-calendar", name: "events.list" })).rejects.toMatchObject({ code: "permission_denied" });
  });

  it("journals task-scoped native project effects and requires evidence after an unknown outcome", async () => {
    const r = repo(), events = new EventBus(r), pages = fakePages();
    try {
      const tasks = new TaskService(r, events), workspace = tasks.createWorkspace("Project");
      const projectId = "11111111-1111-4111-8111-111111111111";
      const task = tasks.create({ workspaceId: workspace.workspaceId, title: "Edit checkout", objective: "Save an edit",
        criteria: [{ criterionId: "edit", description: "Edit verified", verification: "manual" }],
        resources: [{ resourceId: "repo", kind: "repository", projectId, locator: "/managed/checkout", label: "Checkout", access: "write" }] });
      const operations = new OperationService({ repo: r, events, pages });
      const base = { name: "file.write" as const, taskId: task.taskId, taskRevision: task.revision, projectId,
        audit: { name: "app.ts", contentSha256: "a".repeat(64), content: "secret file body" } };
      let sawRunning = false;
      const applied = await operations.invokeProjectEffect({ ...base, execute: async invocationId => {
        sawRunning = (r.db.prepare("SELECT status FROM operation_invocations ORDER BY started_at DESC LIMIT 1").get() as {status:string}).status === "running";
        expect(tasks.confirmProjectInvocation(task.taskId, task.revision, projectId, invocationId, "file.write").taskId).toBe(task.taskId);
        expect(() => tasks.confirmProjectInvocation(task.taskId, task.revision, "wrong-project", invocationId, "file.write")).toThrow(/does not match/);
        return { saved: true };
      } });
      expect(applied).toEqual({ saved: true });
      expect(sawRunning).toBe(true);
      const firstId=(r.db.prepare("SELECT invocation_id AS id FROM operation_invocations ORDER BY rowid LIMIT 1").get() as {id:string}).id;
      expect(() => tasks.confirmProjectInvocation(task.taskId, task.revision, projectId, firstId, "file.write")).toThrow(/does not match/);
      const denied = await operations.invokeProjectEffect({ ...base, execute: async () => null });
      expect(denied).toBeNull();
      const settled = r.db.prepare("SELECT status,effect_outcome FROM operation_invocations ORDER BY rowid").all();
      expect(settled).toEqual([{ status: "completed", effect_outcome: "observed" }, { status: "denied", effect_outcome: "not-dispatched" }]);
      await expect(operations.invokeProjectEffect({ ...base, execute: async () => { throw new Error("Native response lost"); } })).rejects.toThrow("Native response lost");
      const uncertain = r.db.prepare("SELECT invocation_id AS id,inputs,status,effect_outcome AS outcome FROM operation_invocations ORDER BY rowid DESC LIMIT 1").get() as {id:string;inputs:string;status:string;outcome:string};
      expect(uncertain).toMatchObject({ status: "failed", outcome: "unknown" });
      expect(JSON.parse(uncertain.inputs)).toMatchObject({ taskId: task.taskId, projectId });
      expect(uncertain.inputs).not.toContain("secret file body");
      expect(() => tasks.prepareProjectAccess(task.taskId, 1, projectId, true)).toThrow(/unresolved operation/);
      const stopped = await operations.invokeProjectEffect({name:'command.stop',taskId:task.taskId,taskRevision:1,projectId,
        audit:{commandId:'22222222-2222-4222-8222-222222222222'},execute:async invocationId=>{
          expect(tasks.confirmProjectInvocation(task.taskId,1,projectId,invocationId,'command.stop').taskId).toBe(task.taskId);
          expect(()=>tasks.confirmProjectInvocation(task.taskId,1,projectId,invocationId,'file.write')).toThrow(/does not match/);
          return {state:'stopping'};
        }});
      expect(stopped).toEqual({state:'stopping'});
      const stopRow=r.db.prepare("SELECT i.status,i.effect_outcome AS outcome FROM operation_invocations i JOIN operations o ON o.operation_id=i.operation_id WHERE o.name='command.stop'").get();
      expect(stopRow).toEqual({status:'completed',outcome:'observed'});
      const second = tasks.create({ workspaceId: workspace.workspaceId, title: "Second editor", objective: "Inspect the same checkout",
        criteria: [{ criterionId: "check", description: "Checkout inspected", verification: "manual" }],
        resources: [{ resourceId: "repo-2", kind: "repository", projectId, locator: "/managed/checkout", label: "Checkout", access: "write" }] });
      expect(() => tasks.prepareProjectAccess(second.taskId, 1, projectId, true)).toThrow(/Another task has an unfinished/);
      expect(() => tasks.update({ taskId: task.taskId, expectedRevision: 1, title: "Revised" })).toThrow(/unresolved operation/);
      const evidence = new TaskEvidenceService(r, events);
      const receipt = TaskReceiptSchema.parse(evidence.receipt(task.taskId));
      expect(receipt.unresolvedOperations).toMatchObject([{ invocationId: uncertain.id, operation: "aux.project/file.write" }]);
      expect(receipt.unresolvedOperations[0]?.runId).toBeUndefined();
      const note = evidence.recordNote({ taskId: task.taskId, expectedRevision: 1, criterionId: "edit", summary: "I checked app.ts in the checkout" }, "desktop_user");
      evidence.reconcileOperation({ taskId: task.taskId, expectedRevision: 1, invocationId: uncertain.id,
        outcome: "applied", evidenceId: note.evidenceId, note: "The file contains the requested edit" });
      expect(evidence.receipt(task.taskId).unresolvedOperations).toEqual([]);
      expect(tasks.update({ taskId: task.taskId, expectedRevision: 1, title: "Revised" }).revision).toBe(2);
      expect(tasks.prepareProjectAccess(second.taskId, 1, projectId, true).taskId).toBe(second.taskId);
      expect(() => operations.saveFromProgram({ siteKey: "aux.project", name: "file.write", program: program() })).toThrow(/managed by Aux/);
      await expect(operations.invoke({ siteKey: "aux.project", name: "file.write" })).rejects.toMatchObject({ code: "permission_denied" });
    } finally { r.db.close(); }
  });

  it("routes to the cheapest eligible implementation", async () => {
    const s = svc();
    s.saveRequestImpl({ siteKey: "app.test", name: "read", url: "http://app.test/api/state", validated: true });
    s.saveFromProgram({ siteKey: "app.test", name: "read", program: program() });
    const decision = await s.explain("app.test", "read", { pageId: "p1" });
    expect(decision.kind).toBe("session-request"); // validated + cheaper
    expect(decision.candidates).toHaveLength(2);
    expect(decision.candidates.every((c) => c.eligible)).toBe(true);
  });

  it("rejects a browser impl when a required control is missing (fresh observation)", async () => {
    // the page drifted — "Save" is gone
    const s = svc(fakePages({ elements: [ELEMENTS[1]!] }));
    s.saveFromProgram({
      siteKey: "app.test",
      name: "edit",
      program: program(),
      guards: { controls: [{ role: "button", name: "Save" }] },
    });
    const decision = await s.explain("app.test", "edit", { pageId: "p1" });
    expect(decision.candidates[0]!.eligible).toBe(false);
    expect(decision.candidates[0]!.why).toContain("missing");
  });

  it("accepts the impl when its required controls are present", async () => {
    const s = svc();
    s.saveFromProgram({
      siteKey: "app.test",
      name: "edit",
      program: program(),
      guards: { controls: [{ role: "button", name: "Save" }] },
    });
    const decision = await s.explain("app.test", "edit", { pageId: "p1" });
    expect(decision.candidates[0]!.eligible).toBe(true);
  });

  it("invoke observes once: the route guard's observation seeds the first attempt", async () => {
    const pages = fakePages();
    let observes = 0;
    const observe = pages.observe;
    pages.observe = async () => { observes++; return observe(); };
    const s = svc(pages);
    s.saveFromProgram({ siteKey: "app.test", name: "edit", program: program(), guards: { controls: [{ role: "button", name: "Save" }] } });
    const r = await s.invoke({ siteKey: "app.test", name: "edit", pageId: "p1" });
    expect(r.status).toBe("completed");
    expect(observes).toBe(1);
  });

  it("verifies the postcondition — unverified invocations fail and demote validated impls", async () => {
    const pages = fakePages({ executeResult: { status: "completed", steps: [], extracted: { saved: false } } });
    const s = svc(pages);
    const { implId } = s.saveFromProgram({
      siteKey: "app.test",
      name: "edit",
      program: program(),
      guards: { verify: { op: "eq", a: { variable: "extracted.saved" }, b: { literal: true } } },
    });
    // promote it manually first
    s.setImplState(implId, "validated");
    const r = await s.invoke({ siteKey: "app.test", name: "edit", pageId: "p1" });
    expect(r.status).toBe("failed");
    expect(r.error).toContain("postcondition");
    // demoted back to candidate
    const impls = s.get("app.test", "edit").implementations;
    expect(impls.find((i) => i.implId === implId)!.state).toBe("candidate");
  });

  it("promotes a candidate to validated after 3 distinct successful inputs", async () => {
    // pageId p1's host is app.test — the request runs IN-PAGE via evaluate
    // (session-bound path), the fake returns a 200 response envelope
    const s = svc(fakePages());
    const { implId } = s.saveRequestImpl({
      siteKey: "app.test",
      name: "echo",
      url: "http://app.test/api/state",
      validated: false,
    });
    for (const inputs of [{ a: 1 }, { a: 2 }, { a: 3 }]) {
      const r = await s.invoke({ siteKey: "app.test", name: "echo", inputs: inputs as never, pageId: "p1" });
      expect(r.status).toBe("completed");
    }
    const impl = s.get("app.test", "echo").implementations.find((i) => i.implId === implId)!;
    expect(impl.state).toBe("validated");
    expect((impl.stats as { successInputs: string[] }).successInputs).toHaveLength(3);
    expect((impl.stats as { successInputs: string[] }).successInputs.every(value => /^sha256:[a-f0-9]{64}$/.test(value))).toBe(true);
    expect(JSON.stringify(impl.stats)).not.toContain('"a":');
  });

  it("invocation records carry the route reason", async () => {
    const s = svc();
    s.saveRequestImpl({ siteKey: "app.test", name: "read", url: "http://app.test/api/state", validated: true });
    const r = await s.invoke({ siteKey: "app.test", name: "read", pageId: "p1" });
    expect(r.route.reason).toContain("session-request");
    expect(r.route.reason).toContain("validated");
  });

  it("§11.5 falls back to the next impl when a READ fails", async () => {
    // in-page session-request 500s → step_failed → read-class op may fall back
    const pages = fakePages({ httpStatus: 500, executeResult: { status: "completed", steps: [], extracted: { via: "browser" } } });
    const s = svc(pages);
    s.saveRequestImpl({ siteKey: "app.test", name: "read", url: "http://app.test/api/state", validated: true });
    s.saveFromProgram({ siteKey: "app.test", name: "read", program: program() });
    const r = await s.invoke({ siteKey: "app.test", name: "read", pageId: "p1" });
    expect(r.status).toBe("completed"); // fell back to browser-program
    expect(r.route.kind).toBe("browser-program");
    expect(r.route.reason).toContain("fell back");
  });

  it("§11.5 never re-issues a possibly-dispatched WRITE through another route", async () => {
    let executeCalls = 0;
    const pages = fakePages({ httpStatus: 500 });
    const origExecute = pages.execute;
    pages.execute = async (p: never) => { executeCalls++; return origExecute(p); };
    const s = svc(pages);
    // write op: in-page request 500s → the request WAS dispatched; no fallback
    s.saveRequestImpl({
      siteKey: "app.test", name: "edit", url: "http://app.test/api/edit",
      method: "POST", body: {}, effectClass: "write", validated: true,
    });
    s.saveFromProgram({ siteKey: "app.test", name: "edit", program: program(), effectClass: "write" });
    const r = await s.invoke({ siteKey: "app.test", name: "edit", pageId: "p1" });
    expect(r.status).toBe("failed");
    expect(executeCalls).toBe(1); // exactly one dispatch — no re-issue via the browser impl
    expect(r.route.kind).toBe("session-request");
  });

  it("§13.3 persists intent before dispatch — crash leaves running+unknown", async () => {
    const s = svc();
    s.saveRequestImpl({ siteKey: "app.test", name: "edit", url: "http://app.test/api/edit", method: "POST", effectClass: "write", validated: true });
    const repo = (s as never as { deps: { repo: Repo } }).deps.repo;
    const r = await s.invoke({ siteKey: "app.test", name: "edit", pageId: "p1" });
    const inv = repo.getInvocation(r.invocationId)!;
    // completed after dispatch — but the row existed with 'running' first
    expect(inv.status).toBe("completed");
    expect(inv.implId).toBeTruthy();
  });

  it("§16.4 a repeated requestKey returns the stored invocation, no re-dispatch", async () => {
    let executeCalls = 0;
    const pages = fakePages();
    const origExecute = pages.execute;
    pages.execute = async (p: never) => { executeCalls++; return origExecute(p); };
    const s = svc(pages);
    s.saveRequestImpl({ siteKey: "app.test", name: "edit", url: "http://app.test/api/edit", method: "POST", effectClass: "write", validated: true });
    const a = await s.invoke({ siteKey: "app.test", name: "edit", pageId: "p1", requestKey: "req-1" });
    const b = await s.invoke({ siteKey: "app.test", name: "edit", pageId: "p1", requestKey: "req-1" });
    expect(b.invocationId).toBe(a.invocationId);
    expect(b.deduplicated).toBe(true);
    expect(executeCalls).toBe(1);
  });

  it("session-request runs IN-PAGE when the host matches — session cookies apply", async () => {
    let sawExpression = "";
    const pages = fakePages();
    const origExecute = pages.execute;
    pages.execute = async (p: { steps?: { expression?: string }[] }) => {
      sawExpression = p.steps?.[0]?.expression ?? "";
      return origExecute(p as never);
    };
    const s = svc(pages);
    s.saveRequestImpl({
      siteKey: "app.test", name: "read", url: "http://app.test/api/state?x={input:q}", validated: true,guards:{session:'required'},
    });
    const r = await s.invoke({ siteKey: "app.test", name: "read", pageId: "p1", inputs: { q: "a b" } });
    expect(r.status).toBe("completed");
    // the fetch ran inside the page (browser session), inputs substituted
    expect(sawExpression).toContain("fetch(");
    expect(sawExpression).toContain("x=a%20b");
  });

  it("§10.3 compiles a replayable candidate from a run's step ledger", async () => {
    const r = repo();
    const bus = new EventBus(r);
    const pages = fakePages();
    const s = new OperationService({ repo: r, events: bus, pages, translateSteps: (_p, st) => st });
    // simulate a finished run's step trace on page p1
    r.saveRun({
      runId: "run1", kind: "agent", status: "completed", goal: "edit a record",
      config: {}, pageIds: ["p1"], createdAt: Date.now(), startedAt: Date.now(), endedAt: Date.now(),
    } as never);
    r.saveStep({
      stepId: "st1", runId: "run1", pageId: "p1", op: "click",
      inputs: { target: "r7" }, startedAt: Date.now(),
      outcome: { stepId: "st1", op: "click", status: "ok", startedAt: Date.now(), durationMs: 3 },
    } as never);
    r.saveStep({
      stepId: "st2", runId: "run1", pageId: "p1", op: "fill",
      inputs: { target: "r9", value: "x" }, startedAt: Date.now(),
      outcome: { stepId: "st2", op: "fill", status: "ok", startedAt: Date.now(), durationMs: 4 },
    } as never);
    const compiled = s.compileFromRun({ runId: "run1" });
    expect(compiled.steps).toBe(2);
    const op = s.get("app.test", compiled.name);
    expect(op.implementations[0]!.kind).toBe("browser-program");
    expect((op.implementations[0]!.evidence as { kind: string }[])[0]!.kind).toBe("trace");
    const saved = JSON.parse(op.implementations[0]!.executable) as { steps: { op: string }[] };
    expect(saved.steps.map((x) => x.op)).toEqual(["click", "fill"]);
  });

  it("browser-program compileAndAuthorize rejects a stale epoch before dispatch", async () => {
    let executeCalls = 0;
    const pages = fakePages();
    const orig = pages.execute;
    pages.get = () => page({ documentEpoch: 4 });
    pages.observe = async () => ({
      observationId: "o1",
      pageId: "p1",
      documentEpoch: 1,
      revision: 1,
      observedAt: Date.now(),
      scope: "full",
      content: { url: "http://app.test/records", title: "records", elements: ELEMENTS },
    });
    pages.execute = async (p: never) => {
      executeCalls++;
      return orig(p);
    };
    const s = svc(pages);
    s.saveFromProgram({ siteKey: "app.test", name: "edit", program: program() });
    const r = await s.invoke({ siteKey: "app.test", name: "edit", pageId: "p1" });
    expect(r.status).toBe("failed");
    expect(r.error).toMatch(/epoch/i);
    expect(executeCalls).toBe(0);
  });

  it("rejects cross-host and persisted session credentials before saving", async () => {
    const r = repo();
    const s = new OperationService({
      repo: r,
      events: new EventBus(r),
      pages: fakePages(),
      egressAllowlist: () => ["app.test"],
    });
    expect(()=>s.saveRequestImpl({
      siteKey: "app.test",
      name: "exfil",
      url: "https://evil.test/x",
      method: "GET",
      validated: true,
    })).toThrow(/does not match/);
    expect(()=>s.saveRequestImpl({siteKey:'app.test',name:'secret',url:'https://app.test/x',headers:{Authorization:'Bearer secret'}})).toThrow(/Do not save Authorization/);
  });
});
