import { afterEach, expect, it, vi } from "vitest";
import { AgentConnectionService, EventBus, openDb, Repo, TaskService } from "@aux/runtime";
import { AuxClient } from "../../packages/sdk/src/index";

afterEach(() => vi.useRealTimers());

function setup() {
  const db = openDb(":memory:");
  const repo = new Repo(db),
    tasks = new TaskService(repo, new EventBus(repo));
  const workspace = tasks.createWorkspace("Cached workspace");
  const service = new AgentConnectionService(repo);
  const created = service.create({
    name: "Agent",
    client: "codex",
    scope: { kind: "workspace", workspaceId: workspace.workspaceId },
  });
  const lastUsed = () =>
    (db.prepare("SELECT last_used_at FROM agent_connections").get() as { last_used_at: number }).last_used_at;
  return { db, service, created, lastUsed };
}

it("rechecks live authority on repeat requests and writes last_used_at at most once a minute", () => {
  vi.useFakeTimers({ now: 1_000_000 });
  const { db, service, created, lastUsed } = setup();
  const prepare = vi.spyOn(db, "prepare");
  expect(service.authorize(created.token)?.connectionId).toBe(created.connection.connectionId);
  const first = lastUsed();
  const queries = prepare.mock.calls.length;
  vi.setSystemTime(1_030_000);
  expect(service.authorize(created.token)?.connectionId).toBe(created.connection.connectionId);
  expect(prepare.mock.calls.length).toBe(queries + 1); // one live row check, no write
  expect(lastUsed()).toBe(first);
  vi.setSystemTime(1_061_000);
  service.authorize(created.token);
  expect(lastUsed()).toBe(1_061_000);
});

it("revocation takes effect on the very next request", () => {
  const { service, created } = setup();
  expect(service.authorize(created.token)).not.toBeNull();
  service.revoke(created.connection.connectionId);
  expect(service.authorize(created.token)).toBeNull();
});

it("the SDK validates requests always and results unless the method is on the hot page loop", async () => {
  const bodies: unknown[] = [];
  const fetch = (async (_url: string, init: { body: string }) => {
    bodies.push(JSON.parse(init.body));
    return new Response(JSON.stringify({ result: { content: { elements: [{ ref: "r1", tag: "a" }] } } }), {
      status: 200,
    });
  }) as unknown as typeof globalThis.fetch;
  const raw = new AuxClient({ port: 1, token: "t" }, { fetch });
  const observed = (await raw.call("pages.observe", { pageId: "p1" })) as unknown as {
    content: { elements: Record<string, unknown>[] };
  };
  expect(observed.content.elements[0]).toEqual({ ref: "r1", tag: "a" }); // wire value, no schema defaults
  await expect(raw.call("pages.observe", { pageId: 5 } as never)).rejects.toThrow();
  const strict = new AuxClient({ port: 1, token: "t" }, { fetch, validateResults: true });
  await expect(strict.call("pages.observe", { pageId: "p1" })).rejects.toThrow(); // not a valid Observation
  expect(bodies).toHaveLength(2);
});

it("the SDK pins the streamId, surfaces resync via onResync, and continues from the head", async () => {
  const sockets: FakeSocket[] = [];
  const event = (seq: number) => ({ seq, streamId: "s1", type: "task.updated", payload: {}, ts: 1 });
  class FakeSocket {
    onmessage?: (m: unknown) => void;
    onclose?: () => void;
    onerror?: () => void;
    constructor(readonly url: string) {
      sockets.push(this);
      const params = new URL(url).searchParams;
      const afterSeq = Number(params.get("afterSeq") ?? 0);
      setTimeout(() => {
        this.onmessage?.({ data: JSON.stringify({ kind: "hello", streamId: "s1", lastSeq: 6 }) });
        // The durable buffer only replays events above the resume cursor.
        if (4 > afterSeq) this.onmessage?.({ data: JSON.stringify({ event: event(4) }) });
        // A stale cursor resyncs once; a pinned streamId resumes cleanly.
        if (params.get("streamId") !== "s1")
          this.onmessage?.({ data: JSON.stringify({ kind: "resync", streamId: "s1", lastSeq: 6 }) });
        setTimeout(() => this.close(), 2);
      }, 0);
    }
    close() {
      this.onclose?.();
    }
  }
  const client = new AuxClient({ port: 1, token: "t" });
  const resyncs: { streamId: string; lastSeq: number }[] = [];
  const signal = AbortSignal.timeout(200);
  const stream = client.events(0, {
    signal,
    reconnectMs: 5,
    onResync: (r) => resyncs.push(r),
    webSocket: FakeSocket as unknown as typeof WebSocket,
  });
  const seen: number[] = [];
  for await (const e of stream) seen.push(e.seq);
  expect(seen).toEqual([4]);
  expect(resyncs).toEqual([{ streamId: "s1", lastSeq: 6 }]);
  // Reconnects present the pinned streamId and last delivered seq.
  expect(sockets[0]!.url).toContain("afterSeq=0");
  expect(sockets[1]!.url).toContain("afterSeq=6");
  expect(sockets[1]!.url).toContain("streamId=s1");
});
