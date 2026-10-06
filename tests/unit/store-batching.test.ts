import { describe, expect, it } from "vitest";
import { EventBus, Repo, openDb } from "@aux/runtime";
import type { PageTarget } from "@aux/contracts";

const tick = () => new Promise((r) => setImmediate(r));
const sync = (db: ReturnType<typeof openDb>) =>
  (db.prepare("PRAGMA synchronous").get() as { synchronous: number }).synchronous;
const page = (id: string, over: Partial<PageTarget> = {}): PageTarget => ({
  pageId: id,
  backend: "aux",
  targetId: `t-${id}`,
  url: "https://x.test/",
  title: "",
  documentEpoch: 0,
  lastRevision: 0,
  viewStatus: "visible",
  controller: "none",
  controllerEpoch: 0,
  ownedByRuntime: false,
  createdAt: 1,
  lastActiveAt: Date.now(),
  ...over,
});

describe("deferred hot-path writes", () => {
  it("coalesce per key, commit on the next tick, and stay visible to reads before that", async () => {
    const db = openDb(":memory:");
    const repo = new Repo(db);
    const p = page("a");
    repo.deferPage(p);
    p.title = "latest";
    repo.deferPage(p);
    expect((db.prepare("SELECT count(*) n FROM pages").get() as { n: number }).n).toBe(0);
    expect(repo.getPage("a")?.title).toBe("latest"); // reads flush first
    repo.deferPage({ ...p, title: "later" });
    await tick();
    expect((db.prepare("SELECT title FROM pages").get() as { title: string }).title).toBe("later");
  });

  it("commit deferred writes without changing synchronous=NORMAL", () => {
    const db = openDb(":memory:");
    const repo = new Repo(db);
    expect(sync(db)).toBe(1);
    repo.defer("x", () => db.prepare("INSERT INTO kv VALUES('k','v')").run());
    repo.flush();
    expect(sync(db)).toBe(1);
    expect((db.prepare("SELECT value FROM kv WHERE key='k'").get() as { value: string }).value).toBe("v");
  });

  it("join an open transaction instead of failing", () => {
    const db = openDb(":memory:");
    const repo = new Repo(db);
    repo.defer("x", () => db.prepare("INSERT INTO kv VALUES('k','joined')").run());
    repo.transaction(() => repo.flush());
    expect((db.prepare("SELECT value FROM kv WHERE key='k'").get() as { value: string }).value).toBe(
      "joined",
    );
  });

  it("write late rows after the rows they reference", () => {
    const db = openDb(":memory:");
    const repo = new Repo(db);
    repo.defer(
      "tabs",
      () => repo.saveTabs([{ pageId: "a", ordinal: 0, url: "u", title: "", backend: "aux", active: true }]),
      true,
    );
    repo.deferPage(page("a"));
    expect(repo.loadTabs().map((t) => t.page_id)).toEqual(["a"]);
  });
});

describe("event bus", () => {
  it("numbers events in emit order and serves them from since() before the batch lands", async () => {
    const db = openDb(":memory:");
    const repo = new Repo(db);
    repo.appendEvent({ type: "old", payload: {}, ts: Date.now() });
    const bus = new EventBus(repo);
    const a = bus.emit("a", {});
    const b = bus.emit("b", { x: 1 }, "run-1");
    expect([a.seq, b.seq]).toEqual([2, 3]);
    expect(bus.since(1).events.map((e) => e.type)).toEqual(["a", "b"]);
    expect(bus.since(0, 10, "run-1").events.map((e) => e.seq)).toEqual([3]);
    await tick();
    expect(new EventBus(repo).emit("c", {}).seq).toBe(4);
  });
});

describe("boot and retention", () => {
  it("detaches every page in one statement and drops week-old runtime-owned pages not on the tab strip", () => {
    const db = openDb(":memory:");
    const repo = new Repo(db);
    const old = Date.now() - 8 * 24 * 60 * 60 * 1000;
    repo.upsertPage(page("human"));
    repo.upsertPage(page("worker", { ownedByRuntime: true, lastActiveAt: old }));
    repo.upsertPage(page("recent-worker", { ownedByRuntime: true }));
    repo.detachAllPages();
    expect(
      repo
        .listPages({ includeDetached: true })
        .map((p) => [p.pageId, p.viewStatus, p.controller])
        .sort(),
    ).toEqual([
      ["human", "detached", "none"],
      ["recent-worker", "detached", "none"],
    ]);
  });

  it("records one history row per URL within the dedupe window, keeping the latest title", () => {
    const db = openDb(":memory:");
    const repo = new Repo(db);
    repo.recordVisit("https://x.test/", "Loading", "p1");
    repo.recordVisit("https://x.test/", "Final", "p1");
    expect(repo.listHistory().map((h) => h.title)).toEqual(["Final"]);
  });

  it("ages out spans, response metadata and steps in bounded batches", () => {
    const db = openDb(":memory:");
    const repo = new Repo(db);
    const old = Date.now() - 40 * 24 * 60 * 60 * 1000;
    for (let i = 0; i < 3; i++)
      db.prepare("INSERT INTO spans(span_id,name,started_at) VALUES(?,?,?)").run(`s${i}`, "x", old);
    db.prepare("INSERT INTO spans(span_id,name,started_at) VALUES('fresh','x',?)").run(Date.now());
    db.prepare("INSERT INTO steps(step_id,run_id,op,started_at) VALUES('st','r','click',?)").run(old);
    expect(repo.pruneRetention(undefined, 2)).toBe(3); // 2 spans + 1 step
    expect(repo.pruneRetention(undefined, 2)).toBe(1);
    expect(
      (db.prepare("SELECT span_id FROM spans").all() as { span_id: string }[]).map((r) => r.span_id),
    ).toEqual(["fresh"]);
  });
});
