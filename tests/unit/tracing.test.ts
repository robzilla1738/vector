import { describe, it, expect } from "vitest";
import { openDb, Tracer } from "@vector/runtime";

const kvCounter = (db: ReturnType<typeof openDb>, name: string) => {
  const row = db.prepare("SELECT value FROM kv WHERE key=?").get(`counter:${name}`) as { value: string } | undefined;
  return row ? Number(row.value) : undefined;
};

describe("Tracer counters (in-memory, flushed per span end)", () => {
  it("incr does not touch SQLite until a span ends", () => {
    const db = openDb(":memory:");
    const t = new Tracer(db, { counterFlushMs: 60_000 });
    t.incr("actions.dispatched");
    t.incr("actions.dispatched");
    t.incr("actions.completed", 3);
    expect(kvCounter(db, "actions.dispatched")).toBeUndefined();
    expect(t.counter("actions.dispatched")).toBe(2); // pending included
    expect(t.counter("actions.completed")).toBe(3);

    const span = t.start("program.execute", { pageId: "p1" });
    span.end("ok");
    expect(kvCounter(db, "actions.dispatched")).toBe(2);
    expect(kvCounter(db, "actions.completed")).toBe(3);
    expect(t.counter("actions.dispatched")).toBe(2);
    t.incr("actions.dispatched");
    expect(t.counter("actions.dispatched")).toBe(3);
    expect(t.counters()).toMatchObject({ "actions.dispatched": 3, "actions.completed": 3 });
    expect(kvCounter(db, "actions.dispatched")).toBe(3);
  });

  it("flushes on the safety timer when no span ends", async () => {
    const db = openDb(":memory:");
    const t = new Tracer(db, { counterFlushMs: 20 });
    t.incr("model.calls");
    await new Promise((r) => setTimeout(r, 60));
    expect(kvCounter(db, "model.calls")).toBe(1);
  });

  it("spans still persist with their attrs", () => {
    const db = openDb(":memory:");
    const t = new Tracer(db);
    t.start("run", { runId: "r1", attrs: { a: 1 } }).end("failed", { error: "x" });
    const rows = t.spansSince(0, 10, "r1") as { name: string; outcome: string; attrs: string }[];
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ name: "run", outcome: "failed" });
    expect(JSON.parse(rows[0]!.attrs)).toEqual({ a: 1, error: "x" });
    expect(t.summary("r1")).toHaveProperty("run");
  });
});
