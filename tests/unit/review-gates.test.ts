import { describe, it, expect, vi } from "vitest";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  authorizeProgram,
  attributeTodoMvc,
  BrowserAuthority,
  compileAction,
  beginConsequentialWrite,
  compileAndAuthorize,
  compileSkill,
  DurableWriteLedger,
  EventBus,
  markSkillFailed,
  MemoryRouterStore,
  MockModelClient,
  NullNativeBridge,
  PageService,
  queryPage,
  rebindSteps,
  Repo,
  Router,
  runMemberAgent,
  openDb,
  stepSignature,
  tryReuseSkill,
  type DriverSet,
} from "@vector/runtime";
import type { ObservationContent, Program, SetMember, Step } from "@vector/contracts";
import type { BrowserDriver, DriverPage, ExecuteProgramResult } from "@vector/engine-client";

const obs = (opts?: { ref?: string; name?: string; url?: string }): ObservationContent =>
  ({
    title: "t",
    url: opts?.url ?? "https://app.test/form",
    headings: [],
    elements: [
      { ref: opts?.ref ?? "r9", role: "button", name: opts?.name ?? "Save", tag: "button" },
    ],
    formFields: [],
    tables: [],
    links: [],
    dialogs: [],
    text: "form",
    viewport: { width: 800, height: 600, scale: 1 },
    scroll: { x: 0, y: 0, maxY: 0 },
    frames: [],
    truncated: false,
    stats: { elementsTotal: 1, elementsShown: 1, textChars: 4, approxTokens: 1 },
  }) as unknown as ObservationContent;

describe("Gate F page query and action compiler", () => {
  it("rebinds a recorded ref across a layout change", () => {
    const steps = [{ id: "c", op: "click", target: "r1" }] as Step[];
    const rebound = rebindSteps(steps, obs({ ref: "r9", name: "Save" }), [
      { role: "button", nameIncludes: "Save" },
    ]);
    expect(rebound[0]).toMatchObject({ op: "click", target: "r9" });
  });

  it("compileAndAuthorize is required before streamed dispatch", () => {
    const stale = compileAndAuthorize({
      pageId: "p1",
      documentEpoch: 2,
      observedEpoch: 1,
      steps: [{ id: "c", op: "click", target: "r9" }],
      observation: obs(),
      url: "https://app.test/form",
      grants: ["effect:read", "effect:write"],
    });
    expect("rejected" in stale).toBe(true);
    const denied = compileAndAuthorize({
      pageId: "p1",
      documentEpoch: 2,
      steps: [{ id: "c", op: "click", target: "r9" }],
      observation: obs(),
      url: "https://app.test/form",
      grants: ["effect:read"],
    });
    expect("denied" in denied).toBe(true);
    const ok = compileAndAuthorize({
      pageId: "p1",
      documentEpoch: 2,
      steps: [{ id: "c", op: "click", target: "r9" }],
      observation: obs(),
      url: "https://app.test/form",
      grants: ["effect:read", "effect:write"],
    });
    expect("program" in ok).toBe(true);
  });

  it("member-agent compileAndAuthorize rejects stale and denied planner steps before execute", async () => {
    const member = { memberId: "m1", url: "https://app.test/form", status: "running" } as SetMember;
    const model = new MockModelClient().always(() => ({
      status: "continue",
      message: "click save",
      steps: [{ id: "c", op: "click", target: "r9" }],
    }));
    const deniedPages = {
      get: () => ({ pageId: "p1", url: "https://app.test/form", documentEpoch: 2 }),
      observe: async () => ({ pageId: "p1", documentEpoch: 2, content: obs() }),
      execute: async () => {
        throw new Error("pages.execute must not run when write is not granted");
      },
    } as unknown as PageService;
    const denied = await runMemberAgent({
      member,
      pageId: "p1",
      goal: "click save",
      runId: "run-deny",
      pages: deniedPages,
      model,
      modelId: "mock",
      signal: new AbortController().signal,
      grants: ["effect:read"],
    });
    expect(denied.result.status).toBe("partial");
    expect(denied.result.error).toMatch(/permission denied/i);
    expect(denied.executedSteps).toEqual([]);

    const stalePages = {
      get: () => ({ pageId: "p1", url: "https://app.test/form", documentEpoch: 3 }),
      observe: async () => ({ pageId: "p1", documentEpoch: 2, content: obs() }),
      execute: async () => {
        throw new Error("pages.execute must not run on a stale document epoch");
      },
    } as unknown as PageService;
    const stale = await runMemberAgent({
      member,
      pageId: "p1",
      goal: "click save",
      runId: "run-stale",
      pages: stalePages,
      model,
      modelId: "mock",
      signal: new AbortController().signal,
      grants: ["effect:read", "effect:write"],
    });
    expect(stale.result.status).toBe("partial");
    expect(stale.result.error).toMatch(/epoch/i);
    expect(stale.executedSteps).toEqual([]);
  });

  it("member-agent persist-before-dispatch skips a duplicate write", async () => {
    let executes = 0;
    const pages = {
      get: () => ({ pageId: "p1", url: "https://app.test/form", documentEpoch: 2 }),
      observe: async () => ({ pageId: "p1", documentEpoch: 2, content: obs() }),
      execute: async () => {
        executes++;
        return { status: "completed", steps: [] };
      },
    } as unknown as PageService;
    const ledger = new DurableWriteLedger();
    const member = { memberId: "m1", url: "https://app.test/form", status: "running" } as SetMember;
    const model = new MockModelClient().scripted([
      () => ({ status: "continue", message: "click save", steps: [{ id: "c", op: "click", target: "r9" }] }),
      () => ({ status: "done", message: "done", result: { ok: true } }),
    ]);
    const first = await runMemberAgent({
      member,
      pageId: "p1",
      goal: "click save",
      runId: "run-dup",
      pages,
      model,
      modelId: "mock",
      signal: new AbortController().signal,
      grants: ["effect:read", "effect:write"],
      durable: ledger,
    });
    expect(first.result.status).toBe("ok");
    expect(executes).toBe(1);
    const replayModel = new MockModelClient().scripted([
      () => ({ status: "continue", message: "click save", steps: [{ id: "c", op: "click", target: "r9" }] }),
      () => ({ status: "done", message: "done", result: { ok: true } }),
    ]);
    const replay = await runMemberAgent({
      member,
      pageId: "p1",
      goal: "click save",
      runId: "run-dup",
      pages,
      model: replayModel,
      modelId: "mock",
      signal: new AbortController().signal,
      grants: ["effect:read", "effect:write"],
      durable: ledger,
    });
    expect(replay.result.status).toBe("ok");
    expect(executes).toBe(1);
  });

  it("rejects a compiled write when the origin does not match", () => {
    const result = compileAction({
      pageId: "p1",
      documentEpoch: 2,
      steps: [{ id: "c", op: "click", target: "r1" }],
      observation: obs(),
      url: "https://other.test/",
      guards: [{ exactOrigin: "https://app.test", role: "button", nameIncludes: "Save" }],
    });
    expect("rejected" in result).toBe(true);
  });

  it("queryPage matches role and name on the live observation", () => {
    const hit = queryPage(obs({ name: "Checkout" }), { role: "button", nameIncludes: "Check" });
    expect(hit?.ref).toBe("r9");
  });
});

describe("Gate D permissions and durable writes", () => {
  it("denies a write when effect:write is not granted", () => {
    const auth = authorizeProgram([{ id: "c", op: "click", target: "r1" }], ["effect:read"]);
    expect(auth.ok).toBe(false);
    if (!auth.ok) expect(auth.effect).toBe("write");
  });

  it("honours origin and expiresAt on structured grants (H2-C4)", () => {
    const click = [{ id: "c", op: "click", target: "r1" }] satisfies Program["steps"];
    const scoped = [{ effect: "write" as const, origin: "https://app.test", scope: "*", expiresAt: 0 }];
    expect(authorizeProgram(click, scoped, "https://app.test").ok).toBe(true);
    expect(authorizeProgram(click, scoped, "https://evil.test").ok).toBe(false);
    const expired = [{ effect: "write" as const, origin: "*", scope: "*", expiresAt: 1 }];
    expect(authorizeProgram(click, expired, "https://app.test", 2).ok).toBe(false);
    expect(authorizeProgram(click, ["effect:write"], "https://anywhere.test").ok).toBe(true);
  });

  it("pages.execute is the permission chokepoint; RPC grants cannot expand it", async () => {
    const makePage = (pageId: string, url: string): DriverPage => ({
      identity: { pageId, targetId: "engine-perm", backend: "vector-engine" },
      url: () => url,
      title: async () => "form",
      isAttached: () => true,
      navigate: async () => {},
      back: async () => {},
      forward: async () => {},
      reload: async () => {},
      stop: async () => {},
      click: async () => {
        throw new Error("click must not dispatch when write is not granted");
      },
      dblclick: async () => {},
      hover: async () => {},
      fill: async () => {},
      typeText: async () => {},
      press: async () => {},
      check: async () => {},
      uncheck: async () => {},
      select: async () => {},
      scroll: async () => {},
      dragTo: async () => {},
      clickPoint: async () => {},
      uploadFiles: async () => {},
      waitFor: async () => ({ ok: true, timedOut: false }),
      waitForDownload: async () => ({ suggestedFilename: "f" }),
      handleDialog: async () => {},
      collectScroll: async () => ({ items: [], collected: 0 }),
      screenshot: async () => ({ buffer: Buffer.alloc(0), width: 0, height: 0, scale: 1 }),
      observe: async () => obs({ url }) as unknown as ObservationContent,
      expandRef: async () => [],
      extract: async () => ({ t: "ok" }),
      evaluate: async () => null,
      setEvents: () => {},
      dispose: async () => {},
      executeProgram: async (steps) => {
        if (steps.some((s) => s.op === "click")) {
          throw new Error("click must not reach the driver");
        }
        return {
          status: "completed",
          steps: steps.map((s) => ({
            stepId: s.id,
            op: s.op,
            status: "ok",
            startedAt: 1,
            durationMs: 1,
          })),
        } as ExecuteProgramResult;
      },
    });
    const driver: BrowserDriver = {
      backend: "vector-engine",
      connect: async () => {},
      disconnect: async () => {},
      isConnected: () => true,
      listTargets: async () => [],
      createTarget: async () => "engine-perm",
      routingOf: () => ({ requiresScript: false }),
      attach: async (_targetId, pageId) => makePage(pageId, "https://app.test/form"),
    };
    const repo = new Repo(openDb(":memory:"));
    const pages = new PageService({
      repo,
      events: new EventBus(repo),
      native: new NullNativeBridge(),
      grants: ["effect:read"],
      drivers: () => ({ vector: null, chrome: null, engine: driver }),
      router: new Router({
        mode: () => "always",
        engineAvailable: () => true,
        store: new MemoryRouterStore(),
      }),
    });
    const opened = await pages.open({ url: "https://app.test/form", background: true, ownedByRuntime: true });
    const read = await pages.execute({
      pageId: opened.pageId,
      steps: [{ id: "e", op: "extract", fields: [{ name: "t", selector: "h1" }] }],
    });
    expect(read.status).toBe("completed");
    await expect(
      pages.execute({
        pageId: opened.pageId,
        steps: [{ id: "c", op: "click", target: "r9" }],
        grants: ["effect:write", "effect:*"],
      } as never),
    ).rejects.toMatchObject({ code: "permission_denied", message: /effect:write/ });
    await expect(
      pages.execute(
        { pageId: opened.pageId, steps: [{ id: "c", op: "click", target: "r9" }] },
        { runId: "run_unsolicited_does_not_expand_page_grants" },
      ),
    ).rejects.toMatchObject({ code: "permission_denied", message: /effect:write/ });
  });

  it("runs.start grants write; unsolicited pages.execute stays read-only", async () => {
    let clicked = 0;
    const makePage = (pageId: string, url: string): DriverPage => ({
      identity: { pageId, targetId: "engine-run-grant", backend: "vector-engine" },
      url: () => url,
      title: async () => "counter",
      isAttached: () => true,
      navigate: async () => {},
      back: async () => {},
      forward: async () => {},
      reload: async () => {},
      stop: async () => {},
      click: async () => {
        clicked++;
      },
      dblclick: async () => {},
      hover: async () => {},
      fill: async () => {},
      typeText: async () => {},
      press: async () => {},
      check: async () => {},
      uncheck: async () => {},
      select: async () => {},
      scroll: async () => {},
      dragTo: async () => {},
      clickPoint: async () => {},
      uploadFiles: async () => {},
      waitFor: async () => ({ ok: true, timedOut: false }),
      waitForDownload: async () => ({ suggestedFilename: "f" }),
      handleDialog: async () => {},
      collectScroll: async () => ({ items: [], collected: 0 }),
      screenshot: async () => ({ buffer: Buffer.alloc(0), width: 0, height: 0, scale: 1 }),
      observe: async () => obs({ url }) as unknown as ObservationContent,
      expandRef: async () => [],
      extract: async () => ({ t: "ok" }),
      evaluate: async () => null,
      setEvents: () => {},
      dispose: async () => {},
      executeProgram: async (steps) => {
        clicked += steps.filter((s) => s.op === "click").length;
        return {
          status: "completed",
          steps: steps.map((s) => ({
            stepId: s.id,
            op: s.op,
            status: "ok",
            startedAt: 1,
            durationMs: 1,
          })),
        } as ExecuteProgramResult;
      },
    });
    const driver: BrowserDriver = {
      backend: "vector-engine",
      connect: async () => {},
      disconnect: async () => {},
      isConnected: () => true,
      listTargets: async () => [],
      createTarget: async () => "engine-run-grant",
      routingOf: () => ({ requiresScript: false }),
      attach: async (_targetId, pageId) => makePage(pageId, "https://app.test/counter"),
    };
    const repo = new Repo(openDb(":memory:"));
    const pages = new PageService({
      repo,
      events: new EventBus(repo),
      native: new NullNativeBridge(),
      grants: ["effect:read"],
      grantsForRun: ["effect:read", "effect:write", "effect:egress"],
      drivers: () => ({ vector: null, chrome: null, engine: driver }),
      router: new Router({
        mode: () => "always",
        engineAvailable: () => true,
        store: new MemoryRouterStore(),
      }),
    });
    const opened = await pages.open({ url: "https://app.test/counter", background: true, ownedByRuntime: true });
    await expect(
      pages.execute({
        pageId: opened.pageId,
        steps: [{ id: "c", op: "click", target: "r9" }],
      }),
    ).rejects.toMatchObject({ code: "permission_denied", message: /effect:write/ });
    const run = await pages.execute(
      { pageId: opened.pageId, steps: [{ id: "c", op: "click", target: "r9" }] },
      { runId: "run_user_started" },
    );
    expect(run.status).toBe("completed");
    expect(clicked).toBe(1);
  });

  it("does not dispatch a second write with the same idempotency key", () => {
    const ledger = new DurableWriteLedger();
    const signature = stepSignature([{ op: "click", target: "r1" }]);
    const first = ledger.begin({ runId: "run1", pageId: "p1", documentEpoch: 3, signature });
    expect(first.duplicate).toBe(false);
    ledger.confirm(first.intent.id);
    const second = ledger.begin({ runId: "run1", pageId: "p1", documentEpoch: 3, signature });
    expect(second.duplicate).toBe(true);
    expect(second.intent.status).toBe("confirmed");
  });

  it("beginConsequentialWrite persists before dispatch and skips a confirmed write", () => {
    const ledger = new DurableWriteLedger();
    const steps = [{ id: "c", op: "click", target: "r9" }];
    const first = beginConsequentialWrite(ledger, {
      runId: "run1",
      pageId: "p1",
      documentEpoch: 2,
      steps,
    });
    expect(first.skip).toBe(false);
    expect(first.intentId).toBeTruthy();
    ledger.confirm(first.intentId!);
    const streamed = beginConsequentialWrite(ledger, {
      runId: "run1",
      pageId: "p1",
      documentEpoch: 2,
      steps,
    });
    expect(streamed.skip).toBe(true);
    const read = beginConsequentialWrite(ledger, {
      runId: "run1",
      pageId: "p1",
      documentEpoch: 2,
      steps: [{ op: "extract" }],
    });
    expect(read.skip).toBe(false);
    expect(read.intentId).toBeUndefined();
    const nextObserve = beginConsequentialWrite(ledger, {
      runId: "run1",
      pageId: "p1",
      documentEpoch: 2,
      revision: 3,
      steps,
    });
    expect(nextObserve.skip).toBe(false);
  });

  it("does not reuse a skill on a different origin", () => {
    const skill = compileSkill({
      id: "save",
      goalPattern: "save",
      pageId: "p1",
      steps: [{ id: "c", op: "click", target: "r1" }],
      preconditions: [{ exactOrigin: "https://app.test", role: "button", nameIncludes: "Save" }],
      postconditions: [{ exactOrigin: "https://app.test" }],
      evidence: "exact origin",
    });
    const skip = tryReuseSkill([skill], "save the form", obs({ url: "https://evil.test/" }), "https://evil.test/");
    expect("skipped" in skip).toBe(true);
  });
});

async function spawnFormsWriteCounter(): Promise<{
  origin: string;
  stop: () => void;
  dir: string;
}> {
  const dir = mkdtempSync(join(tmpdir(), "vector-writes-"));
  const here = dirname(fileURLToPath(import.meta.url));
  const script = join(here, "../../fixtures/forms-app/serve.ts");
  const child = spawn(process.execPath, ["--experimental-strip-types", script], {
    env: {
      ...process.env,
      PORT: "0",
      VECTOR_WRITE_COUNTER_PATH: join(dir, "writes.json"),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const origin = await new Promise<string>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) reject(new Error("forms-app did not bind"));
    }, 10_000);
    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      fn();
    };
    const onData = (chunk: Buffer) => {
      const text = chunk.toString("utf8");
      const m = /http:\/\/127\.0\.0\.1:(\d+)/.exec(text);
      if (m) finish(() => resolve(`http://127.0.0.1:${m[1]}`));
    };
    child.stdout?.on("data", onData);
    child.stderr?.on("data", onData);
    child.once("exit", (code) => {
      finish(() => reject(new Error(`forms-app exited ${code}`)));
    });
  });
  return {
    origin,
    dir,
    stop: () => {
      child.kill();
      rmSync(dir, { recursive: true, force: true });
    },
  };
}

describe("Gate D fixture write counter", () => {
  it("lost response does not increment a fixture write counter twice", async () => {
    const fixture = await spawnFormsWriteCounter();
    try {
      const path = join(fixture.dir, "ledger.json");
      const ledger = new DurableWriteLedger(path);
      const signature = stepSignature([{ op: "click", target: "pay" }]);
      const first = ledger.begin({ runId: "run1", pageId: "p1", documentEpoch: 1, signature });
      expect(first.duplicate).toBe(false);
      expect(first.intent.status).toBe("pending");
      await fetch(`${fixture.origin}/api/writes`, { method: "POST" });
      ledger.confirm(first.intent.id);
      const restarted = new DurableWriteLedger(path);
      const lost = restarted.begin({ runId: "run1", pageId: "p1", documentEpoch: 1, signature });
      expect(lost.duplicate).toBe(true);
      if (!lost.duplicate) {
        await fetch(`${fixture.origin}/api/writes`, { method: "POST" });
      }
      const counted = (await (await fetch(`${fixture.origin}/api/writes`)).json()) as { writes: number };
      expect(counted.writes).toBe(1);
    } finally {
      fixture.stop();
    }
  });

  it("kill-9 mid-write is exactly one POST", async () => {
    const fixture = await spawnFormsWriteCounter();
    try {
      const path = join(fixture.dir, "ledger-kill9.json");
      const signature = stepSignature([{ op: "click", target: "pay" }]);
      const first = new DurableWriteLedger(path);
      const begun = first.begin({ runId: "run-k9", pageId: "p1", documentEpoch: 1, signature });
      expect(begun.duplicate).toBe(false);
      await fetch(`${fixture.origin}/api/writes`, { method: "POST" });
      // Process dies before confirm() — the pending row is already on disk.
      const afterKill = new DurableWriteLedger(path);
      const replay = afterKill.begin({ runId: "run-k9", pageId: "p1", documentEpoch: 1, signature });
      expect(replay.duplicate).toBe(true);
      if (!replay.duplicate) {
        await fetch(`${fixture.origin}/api/writes`, { method: "POST" });
      }
      const counted = (await (await fetch(`${fixture.origin}/api/writes`)).json()) as { writes: number };
      expect(counted.writes).toBe(1);
    } finally {
      fixture.stop();
    }
  });

  it("pending intent persisted before dispatch blocks a restart replay", () => {
    const dir = mkdtempSync(join(tmpdir(), "vector-ledger-"));
    const path = join(dir, "ledger.json");
    const ledger = new DurableWriteLedger(path);
    const signature = stepSignature([{ op: "click", target: "pay" }]);
    const first = ledger.begin({ runId: "run1", pageId: "p1", documentEpoch: 1, signature });
    expect(first.duplicate).toBe(false);
    expect(first.intent.status).toBe("pending");
    const restarted = new DurableWriteLedger(path);
    const replay = restarted.begin({ runId: "run1", pageId: "p1", documentEpoch: 1, signature });
    expect(replay.duplicate).toBe(true);
    expect(replay.intent.status).toBe("pending");
    rmSync(dir, { recursive: true, force: true });
  });
});

describe("Gate E attribution", () => {
  it("splits a TodoMVC sample into named phases", () => {
    const sample = attributeTodoMvc({
      openMs: 12000,
      jsMs: 40000,
      settleMs: 8000,
      observeMs: 2000,
      totalMs: 64000,
    });
    expect(sample.label).toBe("speedometer.3.0.TodoMVC-JavaScript-ES5");
    expect(sample.accountedMs).toBe(62000);
    expect(sample.unaccountedMs).toBe(2000);
    expect(sample.phases.jsMs).toBe(40000);
    expect(sample.phases.parseMs + sample.phases.styleMs + sample.phases.layoutMs).toBe(12000);
  });
});

describe("skill compile does not freeze a document epoch", () => {
  it("reuses a read skill after the document epoch advances", () => {
    const skill = compileSkill({
      id: "read",
      goalPattern: "list",
      pageId: "p1",
      steps: [{ id: "e", op: "extract", fields: [{ name: "t", selector: "h1" }] }],
      preconditions: [{ exactOrigin: "https://app.test", role: "button", nameIncludes: "Save" }],
      postconditions: [{ exactOrigin: "https://app.test" }],
      evidence: "epoch is checked at dispatch, not stored on the skill",
    });
    const later = tryReuseSkill([skill], "list rows", obs(), "https://app.test/form", 99);
    expect("skill" in later).toBe(true);
  });
});

describe("Finding 5 skill reuse after failed postconditions", () => {
  it("blocks later reuse of a skill whose postconditions failed", () => {
    const skill = compileSkill({
      id: "save",
      goalPattern: "save",
      pageId: "p1",
      steps: [{ id: "c", op: "click", target: "r1" }],
      preconditions: [{ exactOrigin: "https://app.test", role: "button", nameIncludes: "Save" }],
      postconditions: [{ exactOrigin: "https://app.test", role: "button", nameIncludes: "Saved" }],
      evidence: "must see Saved",
    });
    expect(tryReuseSkill([skill], "save the form", obs(), "https://app.test/form")).toMatchObject({
      skill: { id: "save" },
    });
    markSkillFailed(skill);
    const skip = tryReuseSkill([skill], "save the form", obs(), "https://app.test/form");
    expect("skipped" in skip).toBe(true);
    if ("skipped" in skip) expect(skip.skipped).toMatch(/blocked after failed postconditions/);
  });
});

describe("Gate B/F one session without Chromium", () => {
  it("human edit, agent observe, compile, takeover, resume share one page", async () => {
    const repo = new Repo(openDb(":memory:"));
    const events = new EventBus(repo);
    let fieldValue = "old";
    const makePage = (pageId: string, url: string): DriverPage => {
      const page: DriverPage = {
        identity: { pageId, targetId: "engine-t1", backend: "vector-engine" },
        url: () => url,
        title: async () => "form",
        isAttached: () => true,
        navigate: async () => {},
        back: async () => {},
        forward: async () => {},
        reload: async () => {},
        stop: async () => {},
        click: async () => {},
        dblclick: async () => {},
        hover: async () => {},
        fill: async (_t, v) => {
          fieldValue = v;
        },
        typeText: async (_t, v) => {
          fieldValue = v;
        },
        press: async () => {},
        check: async () => {},
        uncheck: async () => {},
        select: async () => {},
        scroll: async () => {},
        dragTo: async () => {},
        clickPoint: async () => {},
        uploadFiles: async () => {},
        waitFor: async () => ({ ok: true, timedOut: false }),
        waitForDownload: async () => ({ suggestedFilename: "f" }),
        handleDialog: async () => {},
        collectScroll: async () => ({ items: [], collected: 0 }),
        screenshot: async () => ({ buffer: Buffer.alloc(0), width: 0, height: 0, scale: 1 }),
        observe: async () =>
          ({
            ...obs({ ref: "r9", name: "Save", url }),
            formFields: [{ ref: "r1", name: "Name", tag: "input", value: fieldValue }],
            elements: [
              { ref: "r1", role: "textbox", name: "Name", tag: "input", value: fieldValue },
              { ref: "r9", role: "button", name: "Save", tag: "button" },
            ],
          }) as unknown as ObservationContent,
        expandRef: async () => [],
        extract: async () => ({ value: fieldValue }),
        evaluate: async () => fieldValue,
        setEvents: () => {},
        dispose: async () => {},
        executeProgram: async (steps) => {
          for (const s of steps) {
            if (s.op === "fill" && "value" in s) fieldValue = String(s.value);
            if (s.op === "type" && "value" in s) fieldValue = String(s.value);
          }
          return {
            status: "completed",
            steps: steps.map((s) => ({
              stepId: s.id,
              op: s.op,
              status: "ok",
              startedAt: 1,
              durationMs: 1,
            })),
          } as ExecuteProgramResult;
        },
      };
      return page;
    };
    const driver: BrowserDriver = {
      backend: "vector-engine",
      connect: async () => {},
      disconnect: async () => {},
      isConnected: () => true,
      listTargets: async () => [],
      createTarget: async () => "engine-t1",
      routingOf: () => ({ requiresScript: false }),
      attach: async (_targetId, pageId) => makePage(pageId, "https://app.test/form"),
    };
    const drivers: DriverSet = { vector: null, chrome: null, engine: driver };
    const router = new Router({
      mode: () => "always",
      engineAvailable: () => true,
      store: new MemoryRouterStore(),
    });
    const pages = new PageService({
      repo,
      events,
      native: new NullNativeBridge(),
      grants: ["effect:read", "effect:write"],
      drivers: () => drivers,
      router,
    });
    const opened = await pages.open({ url: "https://app.test/form", background: true, ownedByRuntime: true });
    expect(opened.backend).toBe("vector-engine");
    const authority = new BrowserAuthority(pages);
    expect(authority.identity(opened.pageId).chromium).toBe(false);
    await pages.execute(
      { pageId: opened.pageId, steps: [{ id: "h", op: "fill", target: "r1", value: "typed-by-human" }] },
      {},
    );
    const seen = await authority.observe(opened.pageId);
    expect(seen.pageId).toBe(opened.pageId);
    const compiled = compileAction({
      pageId: opened.pageId,
      documentEpoch: opened.documentEpoch,
      steps: [{ id: "c", op: "click", target: "r0" }],
      observation: obs({ ref: "r9", name: "Save", url: "https://app.test/form" }),
      url: "https://app.test/form",
      guards: [{ exactOrigin: "https://app.test", role: "button", nameIncludes: "Save" }],
    });
    expect("program" in compiled).toBe(true);
    if ("program" in compiled) {
      const agent = await authority.execute(compiled.program);
      expect(agent.status).toBe("completed");
    }
    await authority.takeover(opened.pageId);
    expect(authority.identity(opened.pageId).controller).toBe("human");
    await expect(
      authority.execute({ pageId: opened.pageId, steps: [{ id: "x", op: "click", target: "r9" }] }),
    ).rejects.toMatchObject({ message: /human control/i });
    const resumed = await authority.resume(opened.pageId);
    expect(resumed.controller).not.toBe("human");
    const hit = queryPage(obs({ name: "Save" }), { role: "button", nameIncludes: "Save" });
    expect(hit?.ref).toBe("r9");
    const stale = compileAction({
      pageId: opened.pageId,
      documentEpoch: opened.documentEpoch,
      observedEpoch: opened.documentEpoch + 1,
      steps: [{ id: "c", op: "click", target: "r9" }],
      observation: obs(),
      url: "https://app.test/form",
    });
    expect("rejected" in stale).toBe(true);
  });

  it("Node takeover forwards to BrowserService so a second client is blocked", async () => {
    let serviceController = "none";
    let serviceEpoch = 0;
    const clicks: string[] = [];
    const keys: string[] = [];
    const human: Record<string, unknown>[] = [];
    const makePage = (pageId: string, url: string): DriverPage => ({
      identity: { pageId, targetId: "engine-t2", backend: "vector-engine" },
      url: () => url,
      title: async () => "form",
      isAttached: () => true,
      navigate: async () => {},
      back: async () => {},
      forward: async () => {},
      reload: async () => {},
      stop: async () => {},
      click: async () => {},
      dblclick: async () => {},
      hover: async () => {},
      fill: async () => {},
      typeText: async () => {},
      press: async (key) => {
        keys.push(key);
      },
      check: async () => {},
      uncheck: async () => {},
      select: async () => {},
      scroll: async () => {},
      dragTo: async () => {},
      clickPoint: async (x, y) => {
        clicks.push(`${x},${y}`);
      },
      humanEvent: async (event) => {
        human.push(event);
      },
      uploadFiles: async () => {},
      waitFor: async () => ({ ok: true, timedOut: false }),
      waitForDownload: async () => ({ suggestedFilename: "f" }),
      handleDialog: async () => {},
      collectScroll: async () => ({ items: [], collected: 0 }),
      screenshot: async () => ({ buffer: Buffer.alloc(0), width: 0, height: 0, scale: 1 }),
      observe: async () => obs({ url }) as unknown as ObservationContent,
      expandRef: async () => [],
      extract: async () => ({}),
      evaluate: async () => null,
      setEvents: () => {},
      dispose: async () => {},
      executeProgram: async (steps) =>
        ({
          status: "completed",
          steps: steps.map((s) => ({
            stepId: s.id,
            op: s.op,
            status: "ok",
            startedAt: 1,
            durationMs: 1,
          })),
        }) as ExecuteProgramResult,
    });
    const driver: BrowserDriver = {
      backend: "vector-engine",
      connect: async () => {},
      disconnect: async () => {},
      isConnected: () => true,
      listTargets: async () => [],
      createTarget: async () => "engine-t2",
      routingOf: () => ({ requiresScript: false }),
      attach: async (_targetId, pageId) => makePage(pageId, "https://app.test/form"),
      takeover: async () => {
        serviceController = "human";
        serviceEpoch += 1;
        return { controller: "human", controllerEpoch: serviceEpoch };
      },
      resume: async () => {
        serviceController = "none";
        serviceEpoch += 1;
        return { controller: "none", controllerEpoch: serviceEpoch };
      },
    };
    const repo = new Repo(openDb(":memory:"));
    const events = new EventBus(repo);
    const pages = new PageService({
      repo,
      events,
      native: new NullNativeBridge(),
      drivers: () => ({ vector: null, chrome: null, engine: driver }),
      router: new Router({
        mode: () => "always",
        engineAvailable: () => true,
        store: new MemoryRouterStore(),
      }),
    });
    const opened = await pages.open({ url: "https://app.test/form", background: true, ownedByRuntime: true });
    expect(opened.backend).toBe("vector-engine");
    const taken = await pages.takeover(opened.pageId);
    expect(taken.controller).toBe("human");
    expect(serviceController).toBe("human");
    expect(serviceEpoch).toBe(1);
    await expect(
      pages.execute({ pageId: opened.pageId, steps: [{ id: "x", op: "click", target: "r9" }] }),
    ).rejects.toMatchObject({ message: /human control/i });
    await pages.onEngineInput(opened.pageId, { type: "click", x: 40, y: 12 });
    await pages.onEngineInput(opened.pageId, { type: "key", key: "a" });
    await pages.onEngineInput(opened.pageId, { type: "imePreedit", text: "ni" });
    await pages.onEngineInput(opened.pageId, { type: "ime", text: "typed-by-human" });
    await pages.onEngineInput(opened.pageId, { type: "select", start: 0, end: 4 });
    expect(human).toEqual([
      { type: "pointerDown", x: 40, y: 12, button: 0 },
      { type: "key", key: "a" },
      { type: "imePreedit", text: "ni" },
      { type: "ime", text: "typed-by-human" },
      { type: "select", start: 0, end: 4 },
    ]);
    expect(clicks).toEqual([]);
    expect(keys).toEqual([]);
    const seen = await pages.observe(opened.pageId, {});
    expect(seen.content.url).toContain("app.test");
    const resumed = await pages.resume(opened.pageId);
    expect(resumed.controller).toBe("none");
    expect(serviceController).toBe("none");
    expect(serviceEpoch).toBe(2);
  });
});

describe("vitest import surface", () => {
  it("keeps vi available for coordinator tests", () => {
    expect(typeof vi.fn).toBe("function");
  });
});
