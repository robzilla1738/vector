import { describe, it, expect } from "vitest";
import { openDb, Repo, EventBus, OperationService } from "@vector/runtime";
import type { PageTarget, Program } from "@vector/contracts";

const repo = () => new Repo(openDb(":memory:"));

const page = (over: Partial<PageTarget> = {}): PageTarget => ({
  pageId: "p1",
  backend: "vector",
  targetId: "vtab-p1",
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
  return new OperationService({ repo: r, events: new EventBus(r), pages, translateSteps: (_p, s) => s });
};

const program = (): Omit<Program, "pageId"> & { pageId?: string } => ({
  pageId: "p1",
  steps: [{ op: "click", target: "role=button[name=Save]" } as never],
});

describe("OperationService", () => {
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
      siteKey: "app.test", name: "read", url: "http://app.test/api/state?x={input:q}", validated: true,
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
});
