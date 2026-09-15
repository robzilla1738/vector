import { describe, it, expect } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDb, Repo, EventBus, ArtifactStore, ResponseStore } from "@vector/runtime";
import type { VectorEvent } from "@vector/contracts";

function setup() {
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const seen: VectorEvent[] = [];
  events.subscribe((e) => seen.push(e));
  const artifacts = new ArtifactStore(mkdtempSync(join(tmpdir(), "vector-resp-")), repo, events);
  const store = new ResponseStore({ repo, events, artifacts, flushDelayMs: 20 });
  return { repo, events, seen, artifacts, store };
}

const info = (i: number, body?: string) => ({
  requestId: `rq_${i}`,
  url: `http://app.test/api/${i}`,
  method: "GET",
  status: 200,
  contentType: body ? "application/json" : "text/html",
  resourceType: body ? "fetch" : "document",
  startedAt: 1000 + i,
  endedAt: 1050 + i,
  ...(body ? { body: Buffer.from(body), bodyBytes: body.length } : {}),
});

describe("ResponseStore (batched async capture)", () => {
  it("queues on record and persists everything in one flush with a single aggregated event", async () => {
    const { store, seen, repo } = setup();
    const onResponse = store.record("p1");
    onResponse(info(1, '{"a":1}'));
    onResponse(info(2));
    onResponse(info(3, '{"c":3}'));
    onResponse(info(4));
    expect(store.pendingCount()).toBe(4);
    expect(store.list("p1")).toHaveLength(0); // nothing hit SQLite on the driver callback
    expect(seen.filter((e) => e.type === "artifact.added")).toHaveLength(0);

    await store.flush();
    expect(store.pendingCount()).toBe(0);
    const rows = store.list("p1");
    expect(rows).toHaveLength(4);
    const withBody = rows.filter((r) => r.bodyArtifactId);
    expect(withBody).toHaveLength(2);
    expect(store.body("rq_3")?.buffer.toString()).toBe('{"c":3}');
    expect(store.body("rq_2")).toBeUndefined();
    expect(repo.listArtifacts({ pageId: "p1" })).toHaveLength(2);

    // one responses.updated for the page, no per-response/per-artifact events
    const updated = seen.filter((e) => e.type === "responses.updated");
    expect(updated).toHaveLength(1);
    expect(updated[0]!.payload).toMatchObject({ pageId: "p1", count: 4, bodies: 2 });
    expect(seen.filter((e) => e.type === "artifact.added")).toHaveLength(0);
  });

  it("flushes on its own timer and groups the event per page", async () => {
    const { store, seen } = setup();
    store.record("p1")(info(1, "{}"));
    store.record("p2")(info(2, "{}"));
    store.record("p1")(info(3));
    await new Promise((r) => setTimeout(r, 80));
    expect(store.pendingCount()).toBe(0);
    expect(store.list("p1")).toHaveLength(2);
    expect(store.list("p2")).toHaveLength(1);
    const updated = seen.filter((e) => e.type === "responses.updated").map((e) => e.payload);
    expect(updated).toHaveLength(2);
    expect(updated.find((p) => p.pageId === "p1")).toMatchObject({ count: 2 });
    expect(updated.find((p) => p.pageId === "p2")).toMatchObject({ count: 1 });
  });

  it("records arriving during a flush are not lost", async () => {
    const { store } = setup();
    const on = store.record("p1");
    on(info(1, "{}"));
    const f = store.flush();
    on(info(2, "{}"));
    await f;
    await store.flush();
    expect(store.list("p1")).toHaveLength(2);
  });
});

describe("Repo.transaction", () => {
  it("commits a batch atomically and rolls back on error", () => {
    const repo = new Repo(openDb(":memory:"));
    repo.transaction(() => {
      repo.saveResponse({ requestId: "a", pageId: "p", url: "u", method: "GET", startedAt: 1 });
      repo.transaction(() => repo.saveResponse({ requestId: "b", pageId: "p", url: "u", method: "GET", startedAt: 2 })); // nested joins
    });
    expect(repo.listResponses("p")).toHaveLength(2);
    expect(() =>
      repo.transaction(() => {
        repo.saveResponse({ requestId: "c", pageId: "p", url: "u", method: "GET", startedAt: 3 });
        throw new Error("boom");
      }),
    ).toThrow("boom");
    expect(repo.listResponses("p")).toHaveLength(2);
    // the connection is usable after a rollback
    repo.saveResponse({ requestId: "d", pageId: "p", url: "u", method: "GET", startedAt: 4 });
    expect(repo.listResponses("p")).toHaveLength(3);
  });
});
