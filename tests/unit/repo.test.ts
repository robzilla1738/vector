import { describe, it, expect } from "vitest";
import { openDb } from "@aux/runtime/database";
import { Repo } from "@aux/runtime/repository";
import type { PageTarget, Run } from "@aux/contracts";

const memRepo = () => new Repo(openDb(":memory:"));

const page = (id: string, over: Partial<PageTarget> = {}): PageTarget => ({
  pageId: id,
  backend: "aux",
  targetId: `atab-${id}`,
  url: "http://x.test/",
  title: id,
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

const run = (id: string, over: Partial<Run> = {}): Run => ({
  runId: id,
  goal: "g",
  status: "running",
  pageIds: ["p1"],
  createdAt: Date.now(),
  ...over,
});

describe("Repo", () => {
  it("round-trips pages with explicit identity", () => {
    const r = memRepo();
    r.upsertPage(page("a"));
    r.upsertPage(page("b", { url: "http://x.test/same" }));
    r.upsertPage(page("c", { url: "http://x.test/same", backend: "chrome", targetId: "CDP-9" }));
    const pages = r.listPages();
    expect(pages).toHaveLength(3);
    // two tabs, same URL, distinct identities — the roadmap's hard case
    const same = pages.filter((p) => p.url === "http://x.test/same");
    expect(same.map((p) => p.targetId).sort()).toEqual(["CDP-9", "atab-b"]);
    r.upsertPage(page("a", { title: "new title", controller: "agent" }));
    expect(r.getPage("a")?.title).toBe("new title");
    expect(r.getPage("a")?.controller).toBe("agent");
  });

  it("assigns monotonically increasing event seq numbers", () => {
    const r = memRepo();
    const s1 = r.appendEvent({ type: "a", payload: {}, ts: Date.now() });
    const s2 = r.appendEvent({ type: "b", payload: {}, ts: Date.now() });
    const s3 = r.appendEvent({ type: "c", payload: {}, ts: Date.now(), runId: "run-1" });
    expect(s2).toBeGreaterThan(s1);
    expect(s3).toBeGreaterThan(s2);
    const { events, lastSeq } = r.eventsSince(s1);
    expect(lastSeq).toBe(s3);
    expect(events.map((e) => e.type)).toEqual(["b", "c"]);
    expect(r.eventsSince(0, 10, "run-1").events.map((e) => e.type)).toEqual(["c"]);
  });

  it("prunes events older than the retention window", () => {
    const r = memRepo();
    r.appendEvent({ type: "old", payload: {}, ts: Date.now() - 8 * 24 * 60 * 60 * 1000 });
    r.appendEvent({ type: "new", payload: {}, ts: Date.now() });
    expect(r.pruneEvents()).toBeGreaterThanOrEqual(1);
    expect(r.eventsSince(0).events.map((e) => e.type)).toEqual(["new"]);
  });

  it("D9: carries a durable streamId and resyncs cursors that cannot be replayed", () => {
    const r = memRepo();
    const streamId = r.streamId();
    expect(r.streamId()).toBe(streamId); // stable for the store's life
    const s1 = r.appendEvent({ type: "a", payload: {}, ts: Date.now() });
    const s2 = r.appendEvent({ type: "b", payload: {}, ts: Date.now() });
    // Replayed events carry the stream identity.
    const page = r.eventsSince(s1);
    expect(page.streamId).toBe(streamId);
    expect(page.events.map((e) => e.streamId)).toEqual([streamId]);
    // A cursor presenting a foreign stream resyncs.
    expect(r.eventsSince(s1, 500, undefined, "dead-stream").resync).toBe(true);
    // A cursor beyond the stream head resyncs.
    expect(r.eventsSince(s2 + 50).resync).toBe(true);
    // A cursor whose next events were pruned below the floor resyncs.
    r.appendEvent({ type: "c", payload: {}, ts: Date.now() });
    r.db.prepare("DELETE FROM events WHERE seq <= ?").run(s2);
    expect(r.eventsSince(s1).resync).toBe(true);
    // …but a cursor at the floor boundary still replays.
    expect(r.eventsSince(s2).resync).toBeUndefined();
    // A fresh read (sinceSeq 0) is never a gap.
    expect(r.eventsSince(0).resync).toBeUndefined();
    // After a full drain a stale positive cursor still resyncs.
    r.db.prepare("DELETE FROM events").run();
    expect(r.eventsSince(2).resync).toBe(true);
  });

  it("persists runs, steps, results, programs, history", () => {
    const r = memRepo();
    r.saveRun(run("r1"));
    r.saveStep({
      stepId: "s1",
      runId: "r1",
      op: "click",
      startedAt: Date.now(),
      outcome: { stepId: "s1", op: "click", status: "ok", startedAt: 0, durationMs: 5 },
    });
    r.saveResult({
      resultId: "res1",
      runId: "r1",
      sourceUrl: "http://x",
      values: { a: 1 },
      observedAt: Date.now(),
      status: "ok",
    });
    r.saveProgram({
      programId: "pr1",
      name: "n",
      version: 1,
      siteKey: "x.test",
      parameters: [],
      stepsJson: "[]",
      useCount: 0,
      createdAt: Date.now(),
    });
    r.addHistory("http://x.test", "X", "p1");
    expect(r.getRun("r1")?.status).toBe("running");
    expect(r.listSteps("r1")).toHaveLength(1);
    expect(r.listResults({ runId: "r1" })[0]?.values).toEqual({ a: 1 });
    expect(r.listPrograms()[0]?.siteKey).toBe("x.test");
    expect(r.listHistory("x.test")[0]?.url).toBe("http://x.test");
  });

  it("survives reopen (persistence across restart)", async () => {
    const { mkdtempSync } = await import("node:fs");
    const { tmpdir } = await import("node:os");
    const { join } = await import("node:path");
    const dir = mkdtempSync(join(tmpdir(), "aux-repo-"));
    const dbPath = join(dir, "v.sqlite");
    const r1 = new Repo(openDb(dbPath));
    r1.saveRun(run("r1", { status: "running" }));
    r1.db.close();
    const r2 = new Repo(openDb(dbPath));
    expect(r2.getRun("r1")?.status).toBe("running"); // → recovery marks it interrupted
    r2.db.close();
  });
});
