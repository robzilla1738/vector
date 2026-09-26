import { afterEach, expect, it, vi } from "vitest";
import { AgentConnectionService, EventBus, openDb, Repo, TaskService } from "@aux/runtime";
import { AuxClient } from "../../packages/sdk/src/index";

afterEach(() => vi.useRealTimers());

function setup() {
  const db = openDb(":memory:");
  const repo = new Repo(db), tasks = new TaskService(repo, new EventBus(repo));
  const workspace = tasks.createWorkspace("Cached workspace");
  const service = new AgentConnectionService(repo);
  const created = service.create({ name: "Agent", client: "codex", scope: { kind: "workspace", workspaceId: workspace.workspaceId } });
  const lastUsed = () => (db.prepare("SELECT last_used_at FROM agent_connections").get() as { last_used_at: number }).last_used_at;
  return { db, service, created, lastUsed };
}

it("authorizes repeat requests from memory and writes last_used_at at most once a minute", () => {
  vi.useFakeTimers({ now: 1_000_000 });
  const { db, service, created, lastUsed } = setup();
  const prepare = vi.spyOn(db, "prepare");
  expect(service.authorize(created.token)?.connectionId).toBe(created.connection.connectionId);
  const first = lastUsed();
  const queries = prepare.mock.calls.length;
  vi.setSystemTime(1_030_000);
  expect(service.authorize(created.token)?.connectionId).toBe(created.connection.connectionId);
  expect(prepare.mock.calls.length).toBe(queries); // no lookup, no write
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
    return new Response(JSON.stringify({ result: { content: { elements: [{ ref: "r1", tag: "a" }] } } }), { status: 200 });
  }) as unknown as typeof globalThis.fetch;
  const raw = new AuxClient({ port: 1, token: "t" }, { fetch });
  const observed = (await raw.call("pages.observe", { pageId: "p1" })) as unknown as { content: { elements: Record<string, unknown>[] } };
  expect(observed.content.elements[0]).toEqual({ ref: "r1", tag: "a" }); // wire value, no schema defaults
  await expect(raw.call("pages.observe", { pageId: 5 } as never)).rejects.toThrow();
  const strict = new AuxClient({ port: 1, token: "t" }, { fetch, validateResults: true });
  await expect(strict.call("pages.observe", { pageId: "p1" })).rejects.toThrow(); // not a valid Observation
  expect(bodies).toHaveLength(2);
});

it("the SDK pins the streamId, surfaces resync via onResync, and continues from the head", async () => {
  const paramsSeen: Record<string, unknown>[] = [];
  let calls = 0;
  const event = (seq: number) => ({ seq, streamId: "s1", type: "task.updated", payload: {}, ts: 1 });
  const fetch = (async (_url: string, init: { body: string }) => {
    paramsSeen.push((JSON.parse(init.body) as { params: Record<string, unknown> }).params);
    calls++;
    const result =
      calls === 1 ? { streamId: "s1", events: [event(4)], lastSeq: 4 }
      : calls === 2 ? { streamId: "s1", events: [], lastSeq: 6, resync: true }
      : { streamId: "s1", events: [], lastSeq: 6 };
    return new Response(JSON.stringify({ result }), { status: 200 });
  }) as unknown as typeof globalThis.fetch;
  const client = new AuxClient({ port: 1, token: "t" }, { fetch });
  const resyncs: { streamId: string; lastSeq: number }[] = [];
  const signal = AbortSignal.timeout(50);
  const stream = client.events(0, { pollMs: 5, signal, onResync: (r) => resyncs.push(r) });
  const seen: number[] = [];
  for await (const e of stream) seen.push(e.seq);
  expect(seen).toEqual([4]);
  expect(resyncs).toEqual([{ streamId: "s1", lastSeq: 6 }]);
  // The first reply pinned s1; later polls present it for mismatch detection.
  expect(paramsSeen[1]).toMatchObject({ streamId: "s1", sinceSeq: 4 });
  expect(paramsSeen[2]).toMatchObject({ streamId: "s1", sinceSeq: 6 });
});
