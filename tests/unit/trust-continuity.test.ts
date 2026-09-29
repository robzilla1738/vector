import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import type { AgentConnectionScope, AuxEvent } from "@aux/contracts";
import {
  AgentConnectionService,
  ApiServer,
  EventBus,
  makeInvoker,
  openDb,
  Repo,
  SCHEMA_VERSION,
  TaskService,
  type Services,
} from "@aux/runtime";
import { resolvePortInUse, type RuntimeDescriptor } from "../../apps/runtime/src/lifecycle.js";

const cleanup: Array<() => void> = [];
afterEach(() => {
  for (const dispose of cleanup.splice(0).reverse()) dispose();
});

type SinceBody = {
  resync?: true;
  streamId: string;
  lastSeq: number;
  events: { type: string; payload: Record<string, unknown> }[];
};

type StreamFrame = {
  kind?: string;
  streamId?: string;
  event?: { type: string; payload: Record<string, unknown> };
};

type Gate = {
  (method: string, params: unknown, client?: {
    external: boolean;
    connectionId?: string;
    scope?: AgentConnectionScope;
  }): Promise<unknown>;
  eventVisible: (scope: AgentConnectionScope, connectionId: string | undefined, event: AuxEvent) => boolean;
  dispose: () => Promise<void>;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function mark(event: { type: string; payload: Record<string, unknown> }): string {
  const task = event.payload.task as { taskId?: string } | undefined;
  if (typeof event.payload.pageId === "string") return `page:${event.payload.pageId}`;
  if (task?.taskId) return `task:${task.taskId}`;
  if (typeof event.payload.category === "string") return `settings:${event.payload.category}`;
  return event.type;
}

function openSocket(url: string) {
  const frames: StreamFrame[] = [];
  const ws = new WebSocket(url);
  ws.onmessage = (ev) => frames.push(JSON.parse(String(ev.data)) as StreamFrame);
  const ready = new Promise<void>((resolve, reject) => {
    ws.onopen = () => resolve();
    ws.onerror = () => reject(new Error("ws failed"));
  });
  return { ws, frames, ready };
}

it("resyncs a scoped replay gap without widening scope or killing an unverifiable peer", async () => {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Scoped");
  const task = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Read",
    objective: "Read the page",
    criteria: [{ criterionId: "c", description: "Read", verification: "manual" }],
    resources: [{ resourceId: "page", kind: "page", locator: "p1", label: "Tab" }],
  });
  const sibling = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Sibling",
    objective: "Elsewhere in the space",
    criteria: [{ criterionId: "c", description: "Elsewhere", verification: "manual" }],
  });
  const otherWorkspace = tasks.createWorkspace("Other");
  const other = tasks.create({
    workspaceId: otherWorkspace.workspaceId,
    title: "Other",
    objective: "Outside",
    criteria: [{ criterionId: "c", description: "Outside", verification: "manual" }],
  });
  const connections = new AgentConnectionService(repo);
  const created = connections.create({
    name: "Codex",
    client: "codex",
    scope: { kind: "task", workspaceId: workspace.workspaceId, taskId: task.taskId },
    expiresAt: Date.now() + 60 * 60_000,
  });
  const client = {
    external: true as const,
    connectionId: created.connection.connectionId,
    scope: created.connection.scope,
  };
  const gate = makeInvoker({
    repo,
    events,
    agentConnections: connections,
    pages: { list: () => [], get: () => ({ controller: "none" }) },
    settings: { effectGrants: () => [], originPolicies: () => [], safetyCeiling: () => "ask" },
  } as unknown as Services) as Gate;
  cleanup.push(() => void gate.dispose());

  const anchor = events.emit("task.updated", { task: { taskId: task.taskId, workspaceId: workspace.workspaceId } });
  const dropped = events.emit("task.updated", {
    task: { taskId: other.taskId, workspaceId: otherWorkspace.workspaceId },
  });
  expect(dropped.seq).toBe(anchor.seq + 1);
  events.lastSeq();
  repo.db.prepare("DELETE FROM events WHERE seq <= ?").run(dropped.seq);
  events.emit("page.emitted", { pageId: "p1" });
  events.emit("task.updated", { task: { taskId: sibling.taskId, workspaceId: workspace.workspaceId } });
  events.emit("task.updated", { task: { taskId: other.taskId, workspaceId: otherWorkspace.workspaceId } });
  events.emit("settings.changed", { category: "calendar" });

  const gap = (await gate("events.since", {
    sinceSeq: anchor.seq,
    limit: 50,
    streamId: events.streamId,
  }, client)) as SinceBody;
  // A hole answers resync with no rows. It must not fill the hole from the retained buffer.
  expect(gap.resync).toBe(true);
  expect(gap.events).toEqual([]);
  expect(JSON.stringify(gap)).not.toContain(sibling.taskId);
  expect(JSON.stringify(gap)).not.toContain(other.taskId);

  const snapshot = (await gate("events.since", { sinceSeq: 0, limit: 50 }, client)) as SinceBody;
  const master = (await gate("events.since", { sinceSeq: 0, limit: 50 }, { external: true })) as SinceBody;
  expect(snapshot.events.map(mark)).toEqual(["page:p1"]);
  expect(master.events.map(mark)).toEqual([
    "page:p1",
    `task:${sibling.taskId}`,
    `task:${other.taskId}`,
    "settings:calendar",
  ]);
  expect(snapshot.lastSeq).toBe(master.lastSeq);

  const server = new ApiServer({
    token: "master-token",
    events,
    invoke: (method, params, caller) => gate(method, params, caller),
    authorizeScopedToken: (token) => connections.authorize(token),
    filterEvent: (caller, event) =>
      caller.scope ? gate.eventVisible(caller.scope, caller.connectionId, event) : true,
  });
  const port = await server.listen(0);
  server.setReady();
  cleanup.push(() => void server.close());
  const wsBase = `ws://127.0.0.1:${port}/ws?token=${encodeURIComponent(created.token)}`;

  const gapped = openSocket(`${wsBase}&afterSeq=${anchor.seq}&streamId=${encodeURIComponent(events.streamId)}`);
  await gapped.ready;
  await delay(80);
  expect(gapped.frames.some((frame) => frame.kind === "resync" && frame.streamId === events.streamId)).toBe(true);
  expect(gapped.frames.filter((frame) => frame.event)).toEqual([]);

  const replay = openSocket(`${wsBase}&afterSeq=${dropped.seq}&streamId=${encodeURIComponent(events.streamId)}`);
  await replay.ready;
  await delay(80);
  expect(replay.frames.some((frame) => frame.kind === "resync")).toBe(false);
  expect(replay.frames.filter((frame) => frame.event).map((frame) => mark(frame.event!))).toEqual(["page:p1"]);
  replay.ws.close();

  const beforeLive = gapped.frames.length;
  events.emit("page.emitted", { pageId: "p1" });
  events.emit("task.updated", { task: { taskId: sibling.taskId, workspaceId: workspace.workspaceId } });
  await delay(80);
  expect(gapped.frames.slice(beforeLive).filter((frame) => frame.event).map((frame) => mark(frame.event!)))
    .toEqual(["page:p1"]);
  gapped.ws.close();

  const directory = mkdtempSync(join(tmpdir(), "aux-trust-peer-"));
  cleanup.push(() => rmSync(directory, { recursive: true, force: true }));
  const peer: RuntimeDescriptor = {
    port: 9,
    pid: process.pid,
    token: "peer-secret",
    instanceId: "peer-instance",
    startedAt: 1234,
    version: { schema: SCHEMA_VERSION - 1 },
  };
  writeFileSync(join(directory, "runtime.json"), JSON.stringify(peer), { mode: 0o600 });
  const killed: string[] = [];
  const outcome = await resolvePortInUse({
    dataDir: directory,
    ourSchema: SCHEMA_VERSION,
    alive: () => true,
    ownsPort: async () => true,
    verify: async () => true,
    kill: (_pid, signal) => killed.push(signal),
    fetchImpl: (async (input: unknown) => {
      const url = String(input);
      if (url.includes("/internal/peer")) {
        const nonce = new URL(url).searchParams.get("nonce") ?? "";
        return Response.json({
          service: "aux-runtime",
          nonce: `foreign-${nonce}`,
          instanceId: peer.instanceId,
          pid: peer.pid,
          schema: peer.version?.schema,
          startedAt: peer.startedAt,
          ready: true,
        });
      }
      if (url.endsWith("/health")) return Response.json({ ok: true, ready: true });
      return Response.json({ result: [] });
    }) as typeof fetch,
  });
  expect(outcome.action).toBe("defer");
  expect(outcome.reason).toContain("could not be verified");
  expect(killed).toEqual([]);
});
