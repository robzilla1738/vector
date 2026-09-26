import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  EventBus,
  NullNativeBridge,
  PageClaimStore,
  PageService,
  Repo,
  executeProgram,
  openDb,
} from "@aux/runtime";
import { PageOwnership } from "../../apps/runtime/src/scheduler/page-ownership";
import { READINESS_POLICIES } from "@aux/chromium-driver";
import type { BrowserDriver, DriverPage } from "@aux/chromium-driver";
import { AuxError, ObservationRequestSchema, type AuxErrorCode, type Condition, type ElementRef, type ObservationContent, type Program } from "@aux/contracts";

const cleanup: (() => void)[] = [];
afterEach(() => { for (const fn of cleanup.splice(0).reverse()) fn(); });
function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "aux-claims-"));
  cleanup.push(() => rmSync(directory, { recursive: true, force: true }));
  const db = openDb(join(directory, "state.sqlite"));
  cleanup.push(() => db.close());
  return { db, claims: new PageClaimStore(db) };
}

describe("durable page claims (S4)", () => {
  it("records owned/borrowed claims and releases by page or run", () => {
    const { claims } = fixture();
    claims.claim({ pageId: "p1", runId: "r1", kind: "owned", now: 1 });
    claims.claim({ pageId: "p2", runId: "r1", kind: "borrowed", now: 2 });
    claims.claim({ pageId: "p3", runId: "r2", kind: "borrowed", now: 3 });
    expect(claims.activeForPage("p1")).toMatchObject({ runId: "r1", kind: "owned", status: "active" });
    expect(claims.activeForRun("r1")).toHaveLength(2);
    // re-claiming the same (run,page) reuses the active row
    expect(claims.claim({ pageId: "p1", runId: "r1", kind: "owned" }).claimId)
      .toBe(claims.activeForPage("p1")!.claimId);
    claims.release("p1");
    expect(claims.activeForPage("p1")).toBeUndefined();
    claims.releaseRun("r1");
    expect(claims.activeForRun("r1")).toHaveLength(0);
    expect(claims.activeForPage("p3")).toMatchObject({ runId: "r2" });
  });

  it("releaseOrphans frees only claims whose run did not survive", () => {
    const { claims } = fixture();
    claims.claim({ pageId: "live", runId: "still-running", kind: "owned" });
    claims.claim({ pageId: "dead", runId: "interrupted", kind: "borrowed" });
    expect(claims.releaseOrphans(new Set(["still-running"]))).toBe(1);
    expect(claims.activeForPage("dead")).toBeUndefined();
    expect(claims.activeForPage("live")).toMatchObject({ runId: "still-running" });
  });

  it("PageOwnership writes the lease through to the ledger, including handoffs", async () => {
    const { claims } = fixture();
    const ownership = new PageOwnership({
      claims,
      kindOf: (pageId) => (pageId === "owned-page" ? "owned" : "borrowed"),
    });
    const release1 = ownership.tryAcquire({ pageId: "owned-page", actor: "coordinator", runId: "run-1" });
    expect(claims.activeForPage("owned-page")).toMatchObject({ runId: "run-1", kind: "owned" });
    const next = ownership.acquire({ pageId: "owned-page", actor: "coordinator", runId: "run-2" });
    release1();
    // handoff: the outgoing claim closes and the waiter's claim becomes active
    const release2 = await next;
    expect(claims.activeForPage("owned-page")).toMatchObject({ runId: "run-2" });
    expect(claims.activeForRun("run-1")).toHaveLength(0);
    release2();
    expect(claims.activeForPage("owned-page")).toBeUndefined();
  });

  it("an owner without a runId claims under its actor handle", () => {
    const { claims } = fixture();
    const ownership = new PageOwnership({ claims });
    const release = ownership.tryAcquire({ pageId: "ext-page", actor: "external", connectionId: "conn-9" });
    expect(claims.activeForPage("ext-page")).toMatchObject({ runId: "external:conn-9", kind: "borrowed" });
    release();
  });
});

function fakePage(failOnce?: { code: AuxErrorCode }) {
  const calls: string[] = [];
  let failed = false;
  const page = {
    identity: { pageId: "p1", targetId: "t1", backend: "aux" },
    url: () => "http://x.test/",
    isAttached: () => true,
    click: async (t: string) => { calls.push(`click:${t}`); if (failOnce && !failed) { failed = true; throw new AuxError(failOnce.code, `${t} gone`); } },
    fill: async (t: string, v: string) => { calls.push(`fill:${t}=${v}`); if (failOnce && !failed) { failed = true; throw new AuxError(failOnce.code, `${t} gone`); } },
    waitFor: async (c: Condition) => { calls.push(`waitFor:${c.kind}`); return { ok: true, timedOut: false }; },
    fieldState: async (t: string) => { calls.push(`state:${t}`); return { value: "previous" }; },
    observe: async () => ({}) as never,
    setEvents: () => {},
    dispose: async () => {},
  } as unknown as DriverPage;
  return { page, calls };
}

describe("executor: named retry policy (S4)", () => {
  const clickProgram: Program = { pageId: "p1", steps: [{ id: "s1", op: "click", target: "r5" }] };

  it("retries target_detached once after an interactive settle, then succeeds", async () => {
    const { page, calls } = fakePage({ code: "target_detached" });
    const res = await executeProgram(page, clickProgram);
    expect(res.status).toBe("completed");
    expect(calls).toEqual(["click:r5", "waitFor:settled", "click:r5"]);
  });

  it("never replays a failure that is not a named resolution code", async () => {
    const { page, calls } = fakePage({ code: "ref_stale" });
    const res = await executeProgram(page, clickProgram);
    expect(res.status).toBe("failed");
    expect(calls).toEqual(["click:r5"]);
    expect(res.steps[0]?.error?.code).toBe("ref_stale");
  });

  it("never replays an uncertain effect failure — only pre-dispatch resolution codes", async () => {
    const { page, calls } = fakePage({ code: "conflict" });
    const res = await executeProgram(page, clickProgram);
    expect(res.status).toBe("failed");
    expect(calls).toEqual(["click:r5"]);
  });
});

describe("executor: before-state ledger (S4)", () => {
  it("records the control's prior value for setter steps, before dispatch", async () => {
    const { page, calls } = fakePage();
    const res = await executeProgram(page, {
      pageId: "p1",
      steps: [
        { id: "s1", op: "fill", target: "r1", value: "new" },
        { id: "s2", op: "click", target: "r2" },
      ],
    });
    expect(res.status).toBe("completed");
    expect(res.steps[0]?.before).toEqual({ value: "previous" });
    expect(res.steps[1]?.before).toBeUndefined(); // click is not a setter
    expect(calls.indexOf("state:r1")).toBeLessThan(calls.indexOf("fill:r1=new"));
  });

  it("keeps before-state on a failed setter outcome", async () => {
    const page = {
      ...fakePage().page,
      fill: async () => { throw new AuxError("step_failed", "broken"); },
    } as DriverPage;
    const res = await executeProgram(page, { pageId: "p1", steps: [{ id: "s1", op: "fill", target: "r1", value: "new" }] });
    expect(res.status).toBe("failed");
    expect(res.steps[0]?.before).toEqual({ value: "previous" });
  });
});

describe("readiness: named policies (S4)", () => {
  it("exposes the policy map with bounded deadlines", () => {
    expect(Object.keys(READINESS_POLICIES).sort()).toEqual(["interactive", "load", "networkIdle"]);
    expect(READINESS_POLICIES.load.networkIdle).toBe(false);
    expect(READINESS_POLICIES.interactive.networkIdle).toBe(false);
    expect(READINESS_POLICIES.networkIdle.networkIdle).toBe(true);
    for (const p of Object.values(READINESS_POLICIES)) expect(p.timeoutMs).toBeGreaterThan(0);
  });

  it("forwards a settled condition's named policy to the driver unchanged", async () => {
    const seen: Condition[] = [];
    const page = {
      identity: { pageId: "p1", targetId: "t", backend: "aux" },
      waitFor: async (c: Condition) => { seen.push(c); return { ok: true, timedOut: false }; },
    } as unknown as DriverPage;
    const res = await executeProgram(page, {
      pageId: "p1",
      steps: [{ id: "w", op: "waitFor", condition: { kind: "settled", policy: "interactive", timeoutMs: 900 } }],
    });
    expect(res.status).toBe("completed");
    expect(seen).toEqual([{ kind: "settled", policy: "interactive", timeoutMs: 900 }]);
  });
});

describe("observation scope contract (S4)", () => {
  it("accepts every v2 scope", () => {
    for (const scope of ["full", "all", "interactive", "viewport", "forms", "links", "tables", "subtree"] as const) {
      expect(ObservationRequestSchema.parse({ scope }).scope).toBe(scope);
    }
  });
});

describe("downloads into session storage (S4)", () => {
  it("attaches the configured downloads dir to every live page", async () => {
    const dirs: string[] = [];
    const page = {
      identity: { pageId: "p", targetId: "t", backend: "aux" }, url: () => "https://a.test/", title: async () => "A",
      isAttached: () => true, navigate: async () => {}, observe: async () => ({}) as never,
      setEvents: () => {}, dispose: async () => {},
      setDownloadDir: (d: string) => { dirs.push(d); },
    } as unknown as DriverPage;
    const driver = { backend: "aux", isConnected: () => true, createTarget: async () => "t", attach: async () => page } as unknown as BrowserDriver;
    const repo = new Repo(openDb(":memory:"));
    cleanup.push(() => repo.db.close());
    const pages = new PageService({
      repo, events: new EventBus(repo), native: new NullNativeBridge(),
      drivers: () => ({ aux: driver, chrome: null }),
      downloadsDir: "/tmp/aux-downloads",
    });
    await pages.open({ url: "about:blank", background: true, ownedByRuntime: true });
    expect(dirs).toEqual(["/tmp/aux-downloads"]);
  });
});

describe("sinceRevision delta size gate (S4)", () => {
  const el = (ref: string, over: Partial<ElementRef> = {}): ElementRef => ({
    ref, frame: "main", tag: "button", role: "button", name: ref.toUpperCase(),
    selector: { css: `#${ref}` }, rect: { x: 1, y: 2, w: 3, h: 4 }, ...over,
  });
  const content = (elements: ElementRef[], text = "hello"): ObservationContent => ({
    url: "https://a.test/", title: "A", viewport: { width: 800, height: 600, scale: 1 }, scroll: { x: 0, y: 0, maxY: 0 },
    frames: [], text, headings: [], elements,
    formFields: [], tables: [], links: [], dialogs: [], console: [],
    truncated: false, stats: { elementsTotal: elements.length, elementsShown: elements.length, textChars: text.length, approxTokens: 1 },
  });

  function harness(initial: ObservationContent) {
    let current = initial;
    const page = {
      identity: { pageId: "p", targetId: "t", backend: "aux" }, url: () => current.url, title: async () => "A", isAttached: () => true,
      navigate: async () => {}, observe: async () => current, setEvents: () => {}, dispose: async () => {},
    } as unknown as DriverPage;
    const driver = { backend: "aux", isConnected: () => true, createTarget: async () => "t", attach: async () => page } as unknown as BrowserDriver;
    const repo = new Repo(openDb(":memory:"));
    cleanup.push(() => repo.db.close());
    const pages = new PageService({ repo, events: new EventBus(repo), native: new NullNativeBridge(), drivers: () => ({ aux: driver, chrome: null }) });
    return { pages, set: (c: ObservationContent) => { current = c; } };
  }

  it("returns a delta only when it is materially smaller than the full observation", async () => {
    const h = harness(content([el("r1"), el("r2"), el("r3"), el("r4"), el("r5"), el("r6")]));
    const page = await h.pages.open({ url: "about:blank", background: true, ownedByRuntime: true });
    const first = await h.pages.observe(page.pageId, {});
    // One small change → delta is under half the full view.
    h.set(content([el("r1"), el("r2"), el("r3"), el("r4"), el("r5"), el("r6", { name: "renamed" })]));
    const small = await h.pages.observe(page.pageId, { sinceRevision: first.revision });
    expect(small.delta).toBeDefined();
    // Every element changed → the delta costs as much as the tree, so the
    // service returns the full observation instead.
    h.set(content([1, 2, 3, 4, 5, 6].map((i) => el(`n${i}`))));
    const big = await h.pages.observe(page.pageId, { sinceRevision: first.revision });
    expect(big.delta).toBeUndefined();
  });
});
