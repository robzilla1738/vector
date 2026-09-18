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
  compileSkill,
  DurableWriteLedger,
  EventBus,
  markSkillFailed,
  MemoryRouterStore,
  NullNativeBridge,
  PageService,
  queryPage,
  rebindSteps,
  Repo,
  Router,
  openDb,
  stepSignature,
  tryReuseSkill,
  type DriverSet,
} from "@vector/runtime";
import type { ObservationContent, Step } from "@vector/contracts";
import type { BrowserDriver, DriverPage, ExecuteProgramResult } from "@vector/browser-driver";

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
