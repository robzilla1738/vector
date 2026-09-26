import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApiServer, EventBus, openDb, Repo } from "@aux/runtime";
import { AuxClient } from "../../packages/sdk/src/index";

const TOKEN = "sdk-events-token";
let server: ApiServer;
let events: EventBus;
let repo: Repo;
let port: number;

beforeAll(async () => {
  repo = new Repo(openDb(":memory:"));
  events = new EventBus(repo);
  server = new ApiServer({ token: TOKEN, events, invoke: async () => ({}) });
  port = await server.listen(0);
  server.setReady();
});
afterAll(async () => {
  await server.close();
});

const event = (taskId: string) => events.emit("task.updated", { task: { taskId } });

describe("AuxClient.events over /ws (D9)", () => {
  it("streams replayed then live events in seq order without polling", async () => {
    const anchor = events.lastSeq();
    event("replayed");
    const client = new AuxClient({ port, token: TOKEN });
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const stream = client.events(anchor, { signal: ctrl.signal, reconnectMs: 10 });
    const seqs: number[] = [];
    const collect = (async () => {
      for await (const e of stream) {
        seqs.push(e.seq);
        if (seqs.length >= 2) return;
      }
    })();
    // Give the socket a beat to connect and replay, then emit live.
    await new Promise((r) => setTimeout(r, 60));
    event("live");
    await collect;
    expect(seqs).toEqual([anchor + 1, anchor + 2]);
    ctrl.abort();
    clearTimeout(timer);
  });

  it("surfaces a forced gap via onResync and keeps streaming from the head", async () => {
    const stale = events.lastSeq();
    event("kept");
    events.lastSeq(); // flush the deferred insert before pruning
    repo.db.prepare("DELETE FROM events WHERE seq <= ?").run(stale + 1);
    const client = new AuxClient({ port, token: TOKEN });
    const resyncs: { streamId: string; lastSeq: number }[] = [];
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const stream = client.events(stale, {
      signal: ctrl.signal,
      reconnectMs: 10,
      onResync: (r) => resyncs.push(r),
    });
    const seqs: number[] = [];
    const collect = (async () => {
      for await (const e of stream) {
        seqs.push(e.seq);
        return;
      }
    })();
    await new Promise((r) => setTimeout(r, 60));
    event("after-resync");
    await collect;
    // The resync head is the durable stream head (0 after the full prune);
    // the socket then keeps streaming from the bus's next seq.
    expect(resyncs).toEqual([{ streamId: events.streamId, lastSeq: 0 }]);
    expect(seqs[0]).toBeGreaterThan(resyncs[0]!.lastSeq);
    ctrl.abort();
    clearTimeout(timer);
  });

  it("reconnects a dropped socket with afterSeq and no duplicates", async () => {
    const first = event("one");
    const client = new AuxClient({ port, token: TOKEN });
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const stream = client.events(first.seq - 1, { signal: ctrl.signal, reconnectMs: 10 });
    const seen: number[] = [];
    const collect = (async () => {
      for await (const e of stream) {
        seen.push(e.seq);
        if (seen.length >= 2) return;
      }
    })();
    await new Promise((r) => setTimeout(r, 60));
    event("two");
    await collect;
    expect(seen).toEqual([first.seq, first.seq + 1]);
    ctrl.abort();
    clearTimeout(timer);
  });
});
