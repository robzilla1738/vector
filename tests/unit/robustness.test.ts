import { fixturePage, fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { describe, it, expect, vi } from "vitest";
import { DatabaseSync } from "node:sqlite";
import { applyMigrations, EventBus, executeProgram, openDb, Repo, RunCoordinator } from "@aux/runtime";
import type { ModelClient } from "@aux/runtime";
import type { DriverPage, } from "@aux/chromium-driver";
import type { Observation } from "@aux/contracts";

const memRepo = () => new Repo(openDb(":memory:"));
const tab = (pageId: string, ordinal: number) => ({ pageId, ordinal, url: `http://x.test/${pageId}`, title: pageId, backend: "aux", active: ordinal === 0 });
const seedPage = (r: Repo, pageId: string) =>
  r.db.prepare("INSERT OR IGNORE INTO pages(page_id,backend,target_id,url,created_at,active_at) VALUES(?,?,?,?,?,?)")
    .run(pageId, "aux", `t-${pageId}`, `http://x.test/${pageId}`, 1, 1);

describe("Repo.transaction (P1-9)", () => {
  it("commits multi-statement writes atomically and rolls back on failure", () => {
    const r = memRepo();
    for (const pageId of ["a", "b", "c", "z"]) seedPage(r, pageId);
    r.saveTabs([tab("a", 0), tab("b", 1)]);
    expect(r.loadTabs().map((t) => t.page_id)).toEqual(["a", "b"]);
    // a failure mid-way must leave the previous snapshot intact
    expect(() =>
      r.transaction(() => {
        r.db.prepare("DELETE FROM tabs").run();
        r.db.prepare("INSERT INTO tabs(page_id,ordinal,url,title,backend,active) VALUES(?,?,?,?,?,?)").run("c", 0, "u", "t", "aux", 1);
        throw new Error("crash between delete and inserts");
      }),
    ).toThrow(/crash/);
    expect(r.loadTabs().map((t) => t.page_id)).toEqual(["a", "b"]);
    // saveTabs itself rolls back if an insert fails (duplicate page_id)
    expect(() => r.saveTabs([tab("z", 0), tab("z", 1)])).toThrow();
    expect(r.loadTabs().map((t) => t.page_id)).toEqual(["a", "b"]);
    // nested calls join the outer transaction
    const v = r.transaction(() => r.transaction(() => 42));
    expect(v).toBe(42);
    r.saveTabs([]);
    expect(r.loadTabs()).toEqual([]);
  });

  it("saveProgram upsert updates steps_json, site_key and parameters", () => {
    const r = memRepo();
    const base = { programId: "pr1", name: "n", version: 1, siteKey: "a.test", parameters: [] as string[], stepsJson: "[]", useCount: 0, createdAt: 1 };
    r.saveProgram(base);
    r.saveProgram({ ...base, version: 2, siteKey: "b.test", parameters: ["who"], stepsJson: '[{"id":"s1","op":"reload"}]', description: "d" });
    const got = r.getProgram("pr1")!;
    expect(got.version).toBe(2);
    expect(got.siteKey).toBe("b.test");
    expect(got.parameters).toEqual(["who"]);
    expect(got.stepsJson).toBe('[{"id":"s1","op":"reload"}]');
    expect(got.description).toBe("d");
  });

  it("migrations apply atomically and roll back on any error", () => {
    const db = new DatabaseSync(":memory:");
    db.exec("CREATE TABLE t(a INTEGER); INSERT INTO t VALUES (1)");
    applyMigrations(db, ["ALTER TABLE t ADD COLUMN b INTEGER"]);
    expect(db.prepare("SELECT b FROM t").all()).toEqual([{ b: null }]);
    // a failure mid-batch rolls back every statement in it
    expect(() => applyMigrations(db, ["ALTER TABLE t ADD COLUMN c INTEGER", "THIS IS NOT SQL"])).toThrow();
    expect(() => db.prepare("SELECT c FROM t")).toThrow(/no such column/);
    expect(() => applyMigrations(db, ["ALTER TABLE nope ADD COLUMN d INTEGER"])).toThrow(/no such table/);
  });
});

describe("pages.execute allowEval spread order", () => {
  it("explicit allowEval: undefined stays disabled", async () => {
    const evals: string[] = [];
    const page = {
      identity: { pageId: "p1", targetId: "t", backend: "aux" },
      isAttached: () => true,
      url: () => "http://x.test/",
      evaluate: async (e: string) => { evals.push(e); return 1; },
      setEvents: () => {},
    } as unknown as DriverPage;
    // executor default is false; the PageService applies `allowEval: ctx.allowEval ?? false` after the spread
    const ctx = { allowEval: undefined as boolean | undefined };
    const res = await executeProgram(page, { pageId: "p1", steps: [{ id: "e", op: "evaluate", expression: "1" }] }, { ...ctx, allowEval: ctx.allowEval ?? false });
    expect(res.status).toBe("failed");
    expect(evals).toEqual([]);
  });
});

const obs = (): Observation =>
  ({
    pageId: "p1", documentEpoch: 1, revision: 1, observedAt: Date.now(), scope: "full",
    content: {
      url: "http://x.test/", title: "x", viewport: { width: 1, height: 1, scale: 1 }, scroll: { y: 0, maxY: 0 }, frames: [],
      text: "some page text here for the planner", headings: [], elements: [{ ref: "r1", tag: "button", frame: "main" }],
      formFields: [], tables: [], links: [], dialogs: [], truncated: false, stats: { elementsTotal: 1, elementsShown: 1 },
    },
  }) as unknown as Observation;

describe("RunCoordinator.failActive (P1-10)", () => {
  it("aborts in-flight runs and records the fault as the run error", async () => {
    const repo = memRepo();
    const events = new EventBus(repo);
    let seen: AbortSignal | undefined;
    const model: ModelClient = {
      generateStructured: (o) =>
        new Promise((_res, rej) => {
          seen = o.signal;
          o.signal?.addEventListener("abort", () => rej(new DOMException("aborted", "AbortError")), { once: true });
        }),
      generateText: async () => ({ text: "", durationMs: 0 }),
      listModels: async () => [],
    };
    const coordinator = new RunCoordinator({ turnMentions: fixtureTurnMentions((pageId: string): import("@aux/contracts").PageTarget | undefined => fixturePage(pageId, obs().content.url, obs().documentEpoch)),
      repo, events,
      pages: { observe: vi.fn(async () => obs()), execute: vi.fn(), capture: vi.fn(), livePageIds: () => ["p1"], get: (pageId: string) => fixturePage(pageId, obs().content.url, obs().documentEpoch) } as never,
      model: () => model, defaultModel: () => "m", recoveryModel: () => undefined, recordModelCall: () => {},
      grants: ["effect:read", "effect:write", "effect:destructive", "effect:egress"],
    });
    const run = await coordinator.start({ goal: "g", pageIds: ["p1"] });
    for (let i = 0; i < 50 && !seen; i++) await new Promise((r) => setTimeout(r, 10));
    expect(seen).toBeDefined();
    // a finished run is left alone
    repo.saveRun({ runId: "done", goal: "g", status: "completed", pageIds: [], createdAt: Date.now() });
    const failed = await coordinator.failActive("runtime fault — unhandled rejection: TypeError: boom");
    expect(failed).toEqual([run.runId]);
    expect(seen!.aborted).toBe(true);
    const r = repo.getRun(run.runId)!;
    expect(r.status).toBe("failed");
    expect(r.error).toMatch(/unhandled rejection: TypeError: boom/);
    expect(repo.getRun("done")!.status).toBe("completed");
    await new Promise((r) => setTimeout(r, 30));
    expect(repo.getRun(run.runId)!.status).toBe("failed"); // the aborted loop did not overwrite it
  });
});
