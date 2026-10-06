import { AuxError, PageTargetSchema } from "@aux/contracts";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { describe, it, expect, vi } from "vitest";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  authorizeProgram,
  compileAction,
  beginConsequentialWrite,
  compileAndAuthorize,
  compileSkill,
  DurableWriteLedger,
  EventBus,
  markSkillFailed,
  MockModelClient,
  NullNativeBridge,
  PageService,
  queryPage,
  rebindSteps,
  Repo,
  runMemberAgent,
  openDb,
  stepSignature,
  tryReuseSkill,
} from "@aux/runtime";
import type { ObservationContent, Program, SetMember, Step } from "@aux/contracts";
import type { BrowserDriver, DriverPage } from "@aux/chromium-driver";

const memberAuthorities = new WeakMap<PageService, ReturnType<typeof fixtureTurnMentions>>();
async function memberAuthority(pages: PageService, runId: string) {
  let turnMentions = memberAuthorities.get(pages);
  if (!turnMentions) {
    turnMentions = fixtureTurnMentions((id) => pages.get(id));
    memberAuthorities.set(pages, turnMentions);
  }
  const source = pages.get("p1");
  if (!turnMentions.has(runId)) await turnMentions.begin(runId, [], []);
  return {
    turnMentions,
    checkSource: () => {
      const current = pages.get("p1");
      if (
        current.pageId !== source.pageId ||
        current.sessionId !== source.sessionId ||
        current.url !== source.url ||
        current.documentEpoch !== source.documentEpoch
      )
        throw new AuxError("ref_stale", "The synthetic member source lease changed.");
    },
  };
}
const memberPage = (documentEpoch: number) =>
  PageTargetSchema.parse({
    pageId: "p1",
    targetId: "fixture-target",
    backend: "aux",
    windowId: "main",
    url: "https://app.test/form",
    title: "Fixture",
    documentEpoch,
    sessionId: "synthetic-member-attachment",
    lastRevision: 0,
    viewStatus: "visible",
    lifecycle: "live",
    controller: "none",
    controllerEpoch: 0,
    ownedByRuntime: false,
    createdAt: 1,
    lastActiveAt: 1,
  });

const obs = (opts?: { ref?: string; name?: string; url?: string }): ObservationContent =>
  ({
    title: "t",
    url: opts?.url ?? "https://app.test/form",
    headings: [],
    elements: [{ ref: opts?.ref ?? "r9", role: "button", name: opts?.name ?? "Save", tag: "button" }],
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
      get: () => memberPage(2),
      observe: async () => ({ pageId: "p1", documentEpoch: 2, content: obs() }),
      execute: async () => {
        throw new Error("pages.execute must not run when write is not granted");
      },
    } as unknown as PageService;
    const denied = await runMemberAgent({
      ...(await memberAuthority(deniedPages, "run-deny")),
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
      get: () => memberPage(3),
      observe: async () => ({ pageId: "p1", documentEpoch: 2, content: obs() }),
      execute: async () => {
        throw new Error("pages.execute must not run on a stale document epoch");
      },
    } as unknown as PageService;
    const stale = await runMemberAgent({
      ...(await memberAuthority(stalePages, "run-stale")),
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
      get: () => memberPage(2),
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
      ...(await memberAuthority(pages, "run-dup")),
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
      ...(await memberAuthority(pages, "run-dup")),
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
    expect(replay.result.status).toBe("partial");
    expect(replay.result.error).toContain("No new action was executed");
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
    expect(auth).toMatchObject({ ok: false, effect: "write" });
  });

  it("authorizes absolute destinations from opaque pages without bypassing scoped grants", () => {
    const steps = [{ id: "nav", op: "navigate", url: "https://github.com" }] satisfies Program["steps"];
    const grants = [{ effect: "egress" as const, origin: "https://github.com", scope: "*", expiresAt: 0 }];
    expect(authorizeProgram(steps, grants, "null").ok).toBe(true);
    expect(authorizeProgram(steps, ["effect:read"], "null")).toMatchObject({
      ok: false,
      effect: "egress",
      denied: "permission denied for navigate (effect:egress)",
    });
    expect(authorizeProgram([{ id: "nav", op: "navigate", url: "/relative" }], grants, "null").ok).toBe(
      false,
    );
    expect(
      authorizeProgram([{ id: "nav", op: "navigate", url: "https://elsewhere.test" }], grants, "null").ok,
    ).toBe(false);
  });

  it("allows same-origin navigate on a user run and still denies a different origin", () => {
    const grants = ["effect:read", "effect:write"];
    expect(
      authorizeProgram(
        [{ id: "nav", op: "navigate", url: "http://127.0.0.1:4810/records/rec-11" }],
        grants,
        "http://127.0.0.1:4810",
      ).ok,
    ).toBe(true);
    expect(
      authorizeProgram(
        [{ id: "nav", op: "navigate", url: "https://elsewhere.test/records" }],
        grants,
        "http://127.0.0.1:4810",
      ),
    ).toMatchObject({ ok: false, effect: "egress" });
    expect(authorizeProgram([{ id: "b", op: "back" }], grants, "http://127.0.0.1:4810").ok).toBe(true);
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
      identity: { pageId, targetId: "engine-perm", backend: "aux" },
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
    });
    const driver: BrowserDriver = {
      backend: "aux",
      connect: async () => {},
      disconnect: async () => {},
      isConnected: () => true,
      listTargets: async () => [],
      createTarget: async () => "engine-perm",
      attach: async (_targetId, pageId) => makePage(pageId, "https://app.test/form"),
    };
    const repo = new Repo(openDb(":memory:"));
    const pagesTurnMentions = fixtureTurnMentions(
      (pageId: string): import("@aux/contracts").PageTarget | undefined => pages.get(pageId),
    );
    const pages = new PageService({
      turnMentions: pagesTurnMentions,
      repo,
      events: new EventBus(repo),
      native: new NullNativeBridge(),
      grants: ["effect:read"],
      drivers: () => ({ aux: driver, chrome: null }),
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
      identity: { pageId, targetId: "engine-run-grant", backend: "aux" },
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
    });
    const driver: BrowserDriver = {
      backend: "aux",
      connect: async () => {},
      disconnect: async () => {},
      isConnected: () => true,
      listTargets: async () => [],
      createTarget: async () => "engine-run-grant",
      attach: async (_targetId, pageId) => makePage(pageId, "https://app.test/counter"),
    };
    const repo = new Repo(openDb(":memory:"));
    const pagesTurnMentions = fixtureTurnMentions(
      (pageId: string): import("@aux/contracts").PageTarget | undefined => pages.get(pageId),
    );
    const pages = new PageService({
      turnMentions: pagesTurnMentions,
      repo,
      events: new EventBus(repo),
      native: new NullNativeBridge(),
      grants: ["effect:read"],
      grantsForRun: ["effect:read", "effect:write", "effect:egress"],
      drivers: () => ({ aux: driver, chrome: null }),
    });
    const opened = await pages.open({
      url: "https://app.test/counter",
      background: true,
      ownedByRuntime: true,
    });
    await expect(
      pages.execute({
        pageId: opened.pageId,
        steps: [{ id: "c", op: "click", target: "r9" }],
      }),
    ).rejects.toMatchObject({ code: "permission_denied", message: /effect:write/ });
    await pagesTurnMentions.begin(
      "run_user_started",
      [
        {
          kind: "tab",
          pageId: opened.pageId,
          title: opened.title,
          url: opened.url,
          documentEpoch: opened.documentEpoch,
          sessionId: opened.sessionId!,
          access: "act",
        },
      ],
      [],
    );
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
    const skip = tryReuseSkill(
      [skill],
      "save the form",
      obs({ url: "https://evil.test/" }),
      "https://evil.test/",
    );
    expect("skipped" in skip).toBe(true);
  });
});

async function spawnFormsWriteCounter(): Promise<{
  origin: string;
  stop: () => void;
  dir: string;
}> {
  const dir = mkdtempSync(join(tmpdir(), "aux-writes-"));
  const here = dirname(fileURLToPath(import.meta.url));
  const script = join(here, "../../fixtures/forms-app/serve.ts");
  const child = spawn(process.execPath, ["--experimental-strip-types", script], {
    env: {
      ...process.env,
      PORT: "0",
      AUX_WRITE_COUNTER_PATH: join(dir, "writes.json"),
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

  it("restart before confirmation preserves the unresolved POST intent", async () => {
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
    const dir = mkdtempSync(join(tmpdir(), "aux-ledger-"));
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
    expect(skip).toMatchObject({ skipped: expect.stringMatching(/blocked after failed postconditions/) });
  });
});

describe("vitest import surface", () => {
  it("keeps vi available for coordinator tests", () => {
    expect(typeof vi.fn).toBe("function");
  });
});
