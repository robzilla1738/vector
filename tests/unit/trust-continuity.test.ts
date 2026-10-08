import { SafetyDispatchGate } from "../../apps/runtime/src/safety/dispatch.js";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { DecisionJournal } from "../../apps/runtime/src/safety/decide.js";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { afterEach, expect, it } from "vitest";
import type { BrowserDriver, DriverPage } from "@aux/chromium-driver";
import type { AgentConnectionScope, AuxEvent } from "@aux/contracts";
import {
  AgentConnectionService,
  ApiServer,
  EventBus,
  ExternalSessionService,
  makeInvoker,
  NullNativeBridge,
  openDb,
  PageService,
  Repo,
  SCHEMA_VERSION,
  startRuntime,
  TaskService,
  type Services,
} from "@aux/runtime";
import { PageOwnership } from "../../apps/runtime/src/scheduler/page-ownership.js";
import {
  assessDevelopmentPeer,
  developmentPeerIdentity,
  peerProcessIdentity,
  readRuntimeDescriptor,
  resolvePortInUse,
  type DevelopmentPeerIdentity,
  type RuntimeDescriptor,
} from "../../apps/runtime/src/lifecycle.js";

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
  (
    method: string,
    params: unknown,
    client?: {
      external: boolean;
      connectionId?: string;
      scope?: AgentConnectionScope;
    },
  ): Promise<unknown>;
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
    settings: { agentPolicy: () => ({ agentMode: "auto", agentPolicyRevision: 0, agentPolicies: [] }) },
  } as unknown as Services) as Gate;
  cleanup.push(() => void gate.dispose());

  const anchor = events.emit("task.updated", {
    task: { taskId: task.taskId, workspaceId: workspace.workspaceId },
  });
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

  const gap = (await gate(
    "events.since",
    {
      sinceSeq: anchor.seq,
      limit: 50,
      streamId: events.streamId,
    },
    client,
  )) as SinceBody;
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

  const gapped = openSocket(
    `${wsBase}&afterSeq=${anchor.seq}&streamId=${encodeURIComponent(events.streamId)}`,
  );
  await gapped.ready;
  await delay(80);
  expect(gapped.frames.some((frame) => frame.kind === "resync" && frame.streamId === events.streamId)).toBe(
    true,
  );
  expect(gapped.frames.filter((frame) => frame.event)).toEqual([]);

  const replay = openSocket(
    `${wsBase}&afterSeq=${dropped.seq}&streamId=${encodeURIComponent(events.streamId)}`,
  );
  await replay.ready;
  await delay(80);
  expect(replay.frames.some((frame) => frame.kind === "resync")).toBe(false);
  expect(replay.frames.filter((frame) => frame.event).map((frame) => mark(frame.event!))).toEqual([
    "page:p1",
  ]);
  replay.ws.close();

  const beforeLive = gapped.frames.length;
  events.emit("page.emitted", { pageId: "p1" });
  events.emit("task.updated", { task: { taskId: sibling.taskId, workspaceId: workspace.workspaceId } });
  await delay(80);
  expect(
    gapped.frames
      .slice(beforeLive)
      .filter((frame) => frame.event)
      .map((frame) => mark(frame.event!)),
  ).toEqual(["page:p1"]);
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

const ours: DevelopmentPeerIdentity = { uid: 501, executable: "/opt/aux/dev-runtime" };

function writePeerFile(dataDir: string, peer: RuntimeDescriptor) {
  const path = join(dataDir, "runtime.json");
  writeFileSync(path, JSON.stringify(peer), { mode: 0o600 });
  chmodSync(path, 0o600);
}

function identityPeer(schema: number, extra: Partial<RuntimeDescriptor> = {}): RuntimeDescriptor {
  return {
    port: 40111,
    pid: 4242,
    token: "peer-secret",
    instanceId: "peer-instance",
    startedAt: 1234,
    version: { schema },
    uid: ours.uid,
    executable: ours.executable,
    ...extra,
  };
}

function authorizationOf(init?: RequestInit): string | null {
  const headers = init?.headers;
  if (!headers) return null;
  if (headers instanceof Headers) return headers.get("authorization");
  if (Array.isArray(headers))
    return headers.find(([key]) => key.toLowerCase() === "authorization")?.[1] ?? null;
  return headers.authorization ?? null;
}

async function review(opts: {
  peer: RuntimeDescriptor;
  identity?: DevelopmentPeerIdentity;
  identify?: (pid: number) => Promise<DevelopmentPeerIdentity | null>;
  realIdentity?: boolean;
  runs?: () => { status?: string }[];
  onRpc?: (directory: string) => void;
  idleWaitMs?: number;
  sleep?: (ms: number) => Promise<void>;
}) {
  const directory = mkdtempSync(join(tmpdir(), "aux-trust-peer-"));
  cleanup.push(() => rmSync(directory, { recursive: true, force: true }));
  writePeerFile(directory, opts.peer);
  const killed: string[] = [];
  let living = true;
  const identity = opts.identity ?? ours;
  const outcome = await resolvePortInUse({
    dataDir: directory,
    ourSchema: SCHEMA_VERSION,
    boundPort: opts.peer.port,
    identity,
    ...(opts.realIdentity
      ? {}
      : {
          identify: opts.identify ?? (async () => ({ uid: identity.uid, executable: identity.executable })),
        }),
    idleWaitMs: opts.idleWaitMs,
    alive: () => living,
    ownsPort: async () => true,
    verify: async () => true,
    kill: (_pid, signal) => {
      killed.push(signal);
      living = false;
    },
    log: () => {},
    sleep:
      opts.sleep ??
      (async () => {
        throw new Error("refused peer must not be waited on");
      }),
    fetchImpl: (async (input: unknown, init?: RequestInit) => {
      const url = String(input);
      if (url.includes("/internal/peer")) {
        if (authorizationOf(init) !== `Bearer ${opts.peer.token}`) return new Response("no", { status: 401 });
        const nonce = new URL(url).searchParams.get("nonce") ?? "";
        return Response.json({
          service: "aux-runtime",
          nonce,
          instanceId: opts.peer.instanceId,
          pid: opts.peer.pid,
          schema: opts.peer.version?.schema,
          startedAt: opts.peer.startedAt,
          ready: true,
        });
      }
      if (url.endsWith("/health")) return Response.json({ ok: true, ready: true });
      opts.onRpc?.(directory);
      return Response.json({ result: (opts.runs ?? (() => []))() });
    }) as typeof fetch,
  });
  return { outcome, killed };
}

function runtimeEnv(dataDir: string): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {
    ...process.env,
    AUX_DATA_DIR: dataDir,
    AUX_STANDALONE: "0",
    AUX_IPC: "0",
    AUX_API_PORT: "0",
    AUX_LOAD_DOTENV: "0",
  };
  for (const key of [
    "AUX_HOST_SOCKET",
    "AUX_HOST_TOKEN",
    "AUX_BROWSER_PROFILE_ID",
    "AUX_INTERNAL_CDP",
    "AUX_RUNTIME_AUTOSTART",
  ])
    delete env[key];
  return env;
}

function holdExecute(pages: PageService) {
  let started = false;
  let releaseHold!: () => void;
  const hold = new Promise<void>((resolve) => {
    releaseHold = resolve;
  });
  pages.execute = (async () => {
    started = true;
    await hold;
    return { steps: [] };
  }) as unknown as PageService["execute"];
  return { release: releaseHold, started: () => started };
}

async function untilStarted(started: () => boolean, pending: Promise<unknown>) {
  const deadline = Date.now() + 2_000;
  while (!started() && Date.now() < deadline) await delay(10);
  if (started()) return;
  const outcome = await Promise.race([
    pending.then(
      (value) => value,
      (error: unknown) => error,
    ),
    delay(50).then(() => new Error("page program did not start")),
  ]);
  throw outcome instanceof Error ? outcome : new Error("page program finished before it was held");
}

it("accepts a new peer, an old idle peer, and an old busy peer with the same unsigned development identity", async () => {
  const newer = await review({ peer: identityPeer(SCHEMA_VERSION + 1) });
  expect(newer.outcome.action).toBe("peer-serves");
  expect(newer.killed).toEqual([]);

  const idle = await review({ peer: identityPeer(SCHEMA_VERSION - 1) });
  expect(idle.outcome.action).toBe("takeover");
  expect(idle.killed).toEqual(["SIGTERM"]);

  let polls = 0;
  const busy = await review({
    peer: identityPeer(SCHEMA_VERSION - 1, { port: 40112, pid: 4243, instanceId: "busy-peer" }),
    idleWaitMs: 60_000,
    sleep: async () => {},
    runs: () => (polls++ === 0 ? [{ status: "running" }] : []),
  });
  expect(busy.outcome.action).toBe("takeover");
  expect(busy.killed).toEqual(["SIGTERM"]);

  const stillBusy = await review({
    peer: identityPeer(SCHEMA_VERSION - 1, { port: 40113, pid: 4244, instanceId: "still-busy" }),
    idleWaitMs: 0,
    runs: () => [{ status: "running" }],
  });
  expect(stillBusy.outcome.action).toBe("defer");
  expect(stillBusy.outcome.reason).toContain("idle wait");
  expect(stillBusy.killed).toEqual([]);
});

it("refuses a foreign or changed development peer even when the command line looks like aux", async () => {
  const foreign = await review({
    peer: identityPeer(SCHEMA_VERSION + 1),
    identify: async () => ({ uid: 999, executable: ours.executable }),
  });
  expect(foreign.outcome).toMatchObject({
    action: "defer",
    reason: "peer user does not match this development identity",
  });
  expect(foreign.killed).toEqual([]);

  const changed = await review({
    peer: identityPeer(SCHEMA_VERSION - 1),
    identify: async () => ({ uid: ours.uid, executable: "/opt/aux/other" }),
  });
  expect(changed.outcome).toMatchObject({ action: "defer", reason: "peer executable changed" });
  expect(changed.killed).toEqual([]);

  const recordedUser = await review({ peer: identityPeer(SCHEMA_VERSION - 1, { uid: 999 }) });
  expect(recordedUser.outcome).toMatchObject({
    action: "defer",
    reason: "peer user does not match this development identity",
  });
  expect(recordedUser.killed).toEqual([]);

  const recordedExecutable = await review({
    peer: identityPeer(SCHEMA_VERSION - 1, { executable: "/opt/aux/other" }),
  });
  expect(recordedExecutable.outcome).toMatchObject({ action: "defer", reason: "peer executable changed" });
  expect(recordedExecutable.killed).toEqual([]);

  const unproven = await review({
    peer: identityPeer(SCHEMA_VERSION - 1),
    identify: async () => null,
  });
  expect(unproven.outcome).toMatchObject({
    action: "defer",
    reason: "peer development identity could not be verified",
  });
  expect(unproven.killed).toEqual([]);

  const replaced = await review({
    peer: identityPeer(SCHEMA_VERSION - 1),
    onRpc: (directory) =>
      writePeerFile(directory, identityPeer(SCHEMA_VERSION - 1, { executable: "/opt/aux/replaced" })),
  });
  expect(replaced.outcome).toMatchObject({ action: "defer", reason: "peer executable changed" });
  expect(replaced.killed).toEqual([]);
});

it("development identity is the user and executable, not a code signature", async () => {
  const identity = developmentPeerIdentity();
  expect(identity.executable.startsWith("/")).toBe(true);
  expect(await peerProcessIdentity(process.pid)).toEqual(identity);
  expect(
    assessDevelopmentPeer({
      ours: identity,
      peerUid: identity.uid,
      peerExecutable: identity.executable,
    }),
  ).toBe("accept");
  expect(
    assessDevelopmentPeer({
      ours: identity,
      peerUid: identity.uid + 1,
      peerExecutable: identity.executable,
    }),
  ).toBe("foreign");
  expect(
    assessDevelopmentPeer({
      ours: identity,
      peerUid: identity.uid,
      peerExecutable: "/not/aux",
    }),
  ).toBe("changed");
  expect(assessDevelopmentPeer({ ours: identity, peerUid: null, peerExecutable: null })).toBe("unproven");
  expect(
    assessDevelopmentPeer({
      ours: identity,
      peerUid: identity.uid,
      peerExecutable: identity.executable,
      descriptorExecutable: "/opt/aux/replaced",
    }),
  ).toBe("changed");

  const sameBinary = await review({
    peer: identityPeer(SCHEMA_VERSION - 1, {
      pid: process.pid,
      uid: identity.uid,
      executable: identity.executable,
      port: 40121,
    }),
    identity,
    realIdentity: true,
    sleep: async () => {},
  });
  expect(sameBinary.outcome.action).toBe("takeover");
  expect(sameBinary.killed).toEqual(["SIGTERM"]);

  const parent = mkdtempSync(join(tmpdir(), "aux-trust-boot-"));
  cleanup.push(() => rmSync(parent, { recursive: true, force: true }));
  let handle: Awaited<ReturnType<typeof startRuntime>> | undefined;
  try {
    handle = await startRuntime(runtimeEnv(join(parent, "data")));
    expect(readRuntimeDescriptor(join(parent, "data"))).toMatchObject({
      uid: identity.uid,
      executable: identity.executable,
      pid: process.pid,
    });
  } finally {
    await handle?.close();
  }
});

function userVersion(dbPath: string): number {
  const db = new DatabaseSync(dbPath, { readOnly: true });
  try {
    return (db.prepare("PRAGMA user_version").get() as { user_version: number }).user_version;
  } finally {
    db.close();
  }
}

function rewindDatabase(dataDir: string): string {
  mkdirSync(dataDir, { recursive: true });
  const dbPath = join(dataDir, "aux-state.sqlite");
  const prepared = openDb(dbPath);
  prepared.exec(
    `DROP TABLE document_segments; DROP TABLE document_snapshots; PRAGMA user_version = ${SCHEMA_VERSION - 1}`,
  );
  prepared.close();
  return dbPath;
}

it("leaves a strictly older database unchanged when the loopback port is already taken", async () => {
  const parent = mkdtempSync(join(tmpdir(), "aux-trust-preflight-"));
  cleanup.push(() => rmSync(parent, { recursive: true, force: true }));
  const dataDir = join(parent, "data");
  const dbPath = rewindDatabase(dataDir);
  const holder = createServer();
  cleanup.push(() => holder.close());
  await new Promise<void>((resolve, reject) => {
    holder.once("error", reject);
    holder.listen(0, "127.0.0.1", () => resolve());
  });
  const address = holder.address();
  if (!address || typeof address === "string") throw new Error("expected a loopback port");
  const env = { ...runtimeEnv(dataDir), AUX_API_PORT: String(address.port) };
  const lines: string[] = [];
  const original = process.stderr.write;
  process.stderr.write = ((chunk: string | Uint8Array) => {
    lines.push(typeof chunk === "string" ? chunk : Buffer.from(chunk).toString());
    return true;
  }) as typeof process.stderr.write;
  let handle: Awaited<ReturnType<typeof startRuntime>> | undefined;
  let failure: unknown;
  try {
    handle = await startRuntime(env);
  } catch (error) {
    failure = error;
  } finally {
    process.stderr.write = original;
    await handle?.close();
  }
  expect((failure as Error).message).toBe(
    "runtime port takeover declined: port in use but no runtime descriptor found; refusing to signal an unknown owner",
  );
  expect(lines.join("")).toContain(
    "[runtime] defer: port in use but no runtime descriptor found; refusing to signal an unknown owner\n",
  );
  expect(userVersion(dbPath)).toBe(SCHEMA_VERSION - 1);
});

it("refuses an incompatible database even when the loopback port is free", async () => {
  const parent = mkdtempSync(join(tmpdir(), "aux-trust-preflight-free-"));
  cleanup.push(() => rmSync(parent, { recursive: true, force: true }));
  const dataDir = join(parent, "data");
  const dbPath = rewindDatabase(dataDir);
  const probe = createServer();
  const port = await new Promise<number>((resolve, reject) => {
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      probe.close(() => {
        if (!address || typeof address === "string") reject(new Error("expected a loopback port"));
        else resolve(address.port);
      });
    });
  });
  await expect(startRuntime({ ...runtimeEnv(dataDir), AUX_API_PORT: String(port) })).rejects.toThrow(
    /incompatible with Aux v3/,
  );
  expect(userVersion(dbPath)).toBe(SCHEMA_VERSION - 1);
});

it("reopens a crashed runtime without widening a scoped replay gap", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-trust-restart-"));
  cleanup.push(() => rmSync(directory, { recursive: true, force: true }));
  const db = openDb(join(directory, "state.sqlite"));
  let current = db;
  cleanup.push(() => {
    try {
      current.close();
    } catch {
      /* Repo.close already released it */
    }
  });
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
    settings: { agentPolicy: () => ({ agentMode: "auto", agentPolicyRevision: 0, agentPolicies: [] }) },
  } as unknown as Services) as Gate;
  const anchor = events.emit("task.updated", {
    task: { taskId: task.taskId, workspaceId: workspace.workspaceId },
  });
  const dropped = events.emit("task.updated", {
    task: { taskId: other.taskId, workspaceId: otherWorkspace.workspaceId },
  });
  events.lastSeq();
  repo.db.prepare("DELETE FROM events WHERE seq <= ?").run(dropped.seq);
  events.emit("page.emitted", { pageId: "p1" });
  events.emit("task.updated", { task: { taskId: sibling.taskId, workspaceId: workspace.workspaceId } });
  events.emit("task.updated", { task: { taskId: other.taskId, workspaceId: otherWorkspace.workspaceId } });
  events.emit("settings.changed", { category: "calendar" });
  const streamId = events.streamId;
  events.lastSeq();
  db.exec("PRAGMA wal_checkpoint(TRUNCATE)");
  await gate.dispose();
  repo.close();

  current = openDb(join(directory, "state.sqlite"));
  const restartedRepo = new Repo(current);
  const restartedEvents = new EventBus(restartedRepo);
  const restartedConnections = new AgentConnectionService(restartedRepo);
  const restarted = makeInvoker({
    repo: restartedRepo,
    events: restartedEvents,
    agentConnections: restartedConnections,
    pages: { list: () => [], get: () => ({ controller: "none" }) },
    settings: { agentPolicy: () => ({ agentMode: "auto", agentPolicyRevision: 0, agentPolicies: [] }) },
  } as unknown as Services) as Gate;
  cleanup.push(() => void restarted.dispose());
  expect(restartedEvents.streamId).toBe(streamId);
  expect(restartedConnections.authorize(created.token)?.connectionId).toBe(created.connection.connectionId);

  const gap = (await restarted(
    "events.since",
    {
      sinceSeq: anchor.seq,
      limit: 50,
      streamId,
    },
    client,
  )) as SinceBody;
  expect(gap.resync).toBe(true);
  expect(gap.events).toEqual([]);
  expect(JSON.stringify(gap)).not.toContain(sibling.taskId);
  expect(JSON.stringify(gap)).not.toContain(other.taskId);
  const snapshot = (await restarted("events.since", { sinceSeq: 0, limit: 50 }, client)) as SinceBody;
  const master = (await restarted(
    "events.since",
    { sinceSeq: 0, limit: 50 },
    { external: true },
  )) as SinceBody;
  expect(snapshot.events.map(mark)).toEqual(["page:p1"]);
  expect(master.events.map(mark)).toEqual([
    "page:p1",
    `task:${sibling.taskId}`,
    `task:${other.taskId}`,
    "settings:calendar",
  ]);
});

it("keeps browsing usable when the runtime is not ready and when an external session expires or is revoked during activity", async () => {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const driverPage = {
    url: () => "https://start.example/",
    title: async () => "Start",
    isAttached: () => true,
    navigate: async () => undefined,
    observe: async () => ({}),
    setEvents: () => undefined,
    dispose: async () => undefined,
  } as unknown as DriverPage;
  const driver = {
    backend: "aux",
    isConnected: () => true,
    createTarget: async () => "t",
    attach: async () => driverPage,
  } as unknown as BrowserDriver;
  const pagesTurnMentions = fixtureTurnMentions(
    (pageId: string): import("@aux/contracts").PageTarget | undefined => pages.get(pageId),
  );
  const pages = new PageService({
    turnMentions: pagesTurnMentions,
    safetyGate: new SafetyDispatchGate({
      approvals: new ApprovalStore(db),
      journal: new DecisionJournal(db),
      managedRules: () => [],
      agentPolicy: () => ({ agentMode: "auto", agentPolicyRevision: 0, agentPolicies: [] }),
      audit: () => {},
    }),
    repo,
    events,
    native: new NullNativeBridge(),
    drivers: () => ({ aux: driver, chrome: null }),
  });
  const opened = await pages.open({ url: "https://start.example/", background: true, ownedByRuntime: false });
  const tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Browsing");
  const task = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Read",
    objective: "Read the page",
    criteria: [{ criterionId: "c", description: "Read", verification: "manual" }],
    resources: [{ resourceId: "page", kind: "page", locator: opened.pageId, label: "Tab" }],
  });
  const connections = new AgentConnectionService(repo);
  const sessions = new ExternalSessionService(repo, events, pagesTurnMentions, async () => {});
  const gate = makeInvoker({
    repo,
    events,
    pages,
    runs: { pageOwnership: { tryAcquire: () => () => undefined } },
    settings: { agentPolicy: () => ({ agentMode: "auto", agentPolicyRevision: 0, agentPolicies: [] }) },
    agentConnections: connections,
    externalSessions: sessions,
    turnMentions: pagesTurnMentions,
  } as unknown as Services) as Gate;
  cleanup.push(() => void gate.dispose());
  const server = new ApiServer({
    token: "master-token",
    events,
    invoke: (method, params, caller) => gate(method, params, caller),
    authorizeScopedToken: (token) => connections.authorize(token),
  });
  const port = await server.listen(0);
  cleanup.push(() => void server.close());
  const health = await fetch(`http://127.0.0.1:${port}/health`);
  expect(health.status).toBe(503);
  expect(await health.json()).toMatchObject({ ok: false, ready: false });
  const owner = { external: false as const };
  await gate("pages.navigate", { pageId: opened.pageId, url: "https://example.com/during-startup" }, owner);
  expect(pages.get(opened.pageId).url).toBe("https://example.com/during-startup");

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
  await gate("pages.list", {}, client);
  const program = {
    program: { pageId: opened.pageId, steps: [{ id: "s", op: "click", target: "r1" }] },
    taskId: task.taskId,
    expectedRevision: task.revision,
  };
  const held = holdExecute(pages);
  let settled = false;
  const inflight = gate("pages.execute", program, client).finally(() => {
    settled = true;
  });
  await untilStarted(held.started, inflight);
  expect(settled).toBe(false);
  await gate("pages.navigate", { pageId: opened.pageId, url: "https://example.com/during-activity" }, owner);
  expect(pages.get(opened.pageId).url).toBe("https://example.com/during-activity");
  const runId = repo.conversationRuns(`external:${created.connection.connectionId}`)[0]?.runId;
  if (!runId) throw new Error("expected a session run");
  repo.db
    .prepare("UPDATE agent_connections SET expires_at=? WHERE connection_id=?")
    .run(Date.now() - 1, created.connection.connectionId);
  await expect(
    gate(
      "pages.navigate",
      {
        pageId: opened.pageId,
        url: "https://evil.example/exfil",
      },
      client,
    ),
  ).rejects.toMatchObject({ code: "permission_denied" });
  expect(pages.get(opened.pageId).url).toBe("https://example.com/during-activity");
  await expect(gate("pages.list", {}, client)).rejects.toMatchObject({ code: "permission_denied" });
  expect(repo.getRun(runId)).toMatchObject({ status: "completed", statusMessage: "Connection expired" });
  held.release();
  await expect(inflight).rejects.toMatchObject({ code: "permission_denied" });

  const revoked = connections.create({
    name: "Later",
    client: "codex",
    scope: { kind: "task", workspaceId: workspace.workspaceId, taskId: task.taskId },
    expiresAt: Date.now() + 60 * 60_000,
  });
  const revokedClient = {
    external: true as const,
    connectionId: revoked.connection.connectionId,
    scope: revoked.connection.scope,
  };
  await gate("pages.list", {}, revokedClient);
  const again = holdExecute(pages);
  let revokeSettled = false;
  const second = gate("pages.execute", program, revokedClient).finally(() => {
    revokeSettled = true;
  });
  await untilStarted(again.started, second);
  expect(revokeSettled).toBe(false);
  await gate("agentConnections.revoke", { connectionId: revoked.connection.connectionId }, owner);
  await expect(gate("pages.list", {}, revokedClient)).rejects.toMatchObject({ code: "permission_denied" });
  const revokedRun = repo.conversationRuns(`external:${revoked.connection.connectionId}`)[0]?.runId;
  if (!revokedRun) throw new Error("expected the revoked session run");
  expect(repo.getRun(revokedRun)).toMatchObject({ status: "cancelled", statusMessage: "Connection revoked" });
  await gate("pages.navigate", { pageId: opened.pageId, url: "https://example.com/after-revoke" }, owner);
  expect(pages.get(opened.pageId).url).toBe("https://example.com/after-revoke");
  again.release();
  await expect(second).rejects.toMatchObject({ code: "permission_denied" });
});

it("lets the unscoped loopback owner navigate while an external program holds the tab", async () => {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db);
  const events = new EventBus(repo);
  let url = "https://start.example/";
  let releaseWait: () => void = () => {};
  const waiting = new Promise<void>((resolve) => {
    releaseWait = resolve;
  });
  let waitStarted = false;
  const driverPage = {
    identity: { pageId: "", targetId: "t", backend: "aux" as const },
    url: () => url,
    title: async () => "Start",
    isAttached: () => true,
    navigate: async (next: string) => {
      url = next;
    },
    waitFor: async () => {
      waitStarted = true;
      await waiting;
      return { ok: true, timedOut: false };
    },
    observe: async () => ({}),
    setEvents: () => undefined,
    dispose: async () => undefined,
  };
  const driver = {
    backend: "aux",
    isConnected: () => true,
    createTarget: async () => "t",
    attach: async (_target: string, pageId: string) => {
      driverPage.identity = { pageId, targetId: "t", backend: "aux" };
      return driverPage as unknown as DriverPage;
    },
  } as unknown as BrowserDriver;
  const pagesTurnMentions = fixtureTurnMentions(
    (pageId: string): import("@aux/contracts").PageTarget | undefined => pages.get(pageId),
  );
  const pages = new PageService({
    turnMentions: pagesTurnMentions,
    safetyGate: new SafetyDispatchGate({
      approvals: new ApprovalStore(db),
      journal: new DecisionJournal(db),
      managedRules: () => [],
      agentPolicy: () => ({ agentMode: "auto", agentPolicyRevision: 0, agentPolicies: [] }),
      audit: () => {},
    }),
    repo,
    events,
    native: new NullNativeBridge(),
    drivers: () => ({ aux: driver, chrome: null }),
  });
  const opened = await pages.open({ url: "https://start.example/", background: true, ownedByRuntime: false });
  const tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Browsing");
  const task = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Read",
    objective: "Read the page",
    criteria: [{ criterionId: "c", description: "Read", verification: "manual" }],
    resources: [{ resourceId: "page", kind: "page", locator: opened.pageId, label: "Tab" }],
  });
  const connections = new AgentConnectionService(repo);
  const sessions = new ExternalSessionService(repo, events, pagesTurnMentions, async () => {});
  const pageOwnership = new PageOwnership();
  const gate = makeInvoker({
    repo,
    events,
    pages,
    runs: { pageOwnership },
    settings: { agentPolicy: () => ({ agentMode: "auto", agentPolicyRevision: 0, agentPolicies: [] }) },
    agentConnections: connections,
    externalSessions: sessions,
    turnMentions: pagesTurnMentions,
  } as unknown as Services) as Gate;
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
  let settled = false;
  const inflight = gate(
    "pages.execute",
    {
      program: {
        pageId: opened.pageId,
        steps: [
          {
            id: "s",
            op: "waitFor",
            condition: { kind: "selector", selector: "#absent", state: "visible", timeoutMs: 30_000 },
          },
        ],
      },
      taskId: task.taskId,
      expectedRevision: task.revision,
    },
    client,
  ).finally(() => {
    settled = true;
  });
  const deadline = Date.now() + 2_000;
  while (!waitStarted && !settled && Date.now() < deadline) await delay(10);
  if (!waitStarted) {
    releaseWait();
    await inflight;
    throw new Error("the external program never reached its wait");
  }
  const reads = db
    .prepare("SELECT request_json AS requestJson, decision_json AS decisionJson FROM safety_decisions")
    .all()
    .map((row) => ({
      request: JSON.parse(String(row.requestJson)),
      decision: JSON.parse(String(row.decisionJson)),
    }));
  expect(reads).toContainEqual(
    expect.objectContaining({
      request: expect.objectContaining({ action: "waitFor", actor: "external_token", category: "read" }),
      decision: expect.objectContaining({
        status: "allow",
        authorizedBy: expect.objectContaining({
          authorizedBy: "task_resource",
          taskId: task.taskId,
          taskRevision: task.revision,
        }),
      }),
    }),
  );
  try {
    const navigated = Promise.race([
      gate(
        "pages.navigate",
        { pageId: opened.pageId, url: "https://example.com/during-activity" },
        { external: true },
      ),
      delay(500).then(() => {
        throw new Error("owner navigate waited on the external program");
      }),
    ]);
    await navigated;
    expect(pages.get(opened.pageId).url).toBe("https://example.com/during-activity");
    expect(settled).toBe(false);
    expect(pageOwnership.snapshot()[opened.pageId]).toMatchObject({
      actor: "external",
      connectionId: created.connection.connectionId,
    });
  } finally {
    releaseWait();
    await expect(inflight).rejects.toMatchObject({ code: "ref_stale" });
  }
});

it("loads an owner address through the native tab command instead of page.goto", async () => {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const commands: Array<{ kind: string; url?: string }> = [];
  let driverNavigations = 0;
  let reported = "https://start.example/";
  const driverPage = {
    identity: { pageId: "", targetId: "t", backend: "aux" as const },
    url: () => reported,
    title: async () => "Start",
    isAttached: () => true,
    navigate: async (next: string) => {
      driverNavigations += 1;
      reported = next;
    },
    observe: async () => ({}),
    setEvents: () => undefined,
    dispose: async () => undefined,
  };
  const driver = {
    backend: "aux" as const,
    isConnected: () => true,
    attach: async (_target: string, pageId: string) => {
      driverPage.identity = { pageId, targetId: "t", backend: "aux" as const };
      return driverPage as unknown as DriverPage;
    },
  } as unknown as BrowserDriver;
  type TabAck = {
    commandId: string;
    status: "applied" | "rejected";
    catalogVersion: number;
    pageId?: string;
    targetId?: string;
    error?: { code: string; message: string };
  };
  const native = {
    available: () => true,
    tabCommand: async (envelope: {
      commandId: string;
      command: { kind: string; url?: string; pageId?: string };
    }): Promise<TabAck> => {
      commands.push(envelope.command);
      if (envelope.command.kind === "navigate") reported = envelope.command.url ?? reported;
      return {
        commandId: envelope.commandId,
        status: "applied",
        catalogVersion: 1,
        pageId: envelope.command.pageId,
        targetId: "cdp-1",
      };
    },
  };
  const pagesTurnMentions = fixtureTurnMentions(
    (pageId: string): import("@aux/contracts").PageTarget | undefined => pages.get(pageId),
  );
  const pages = new PageService({
    turnMentions: pagesTurnMentions,
    safetyGate: new SafetyDispatchGate({
      approvals: new ApprovalStore(db),
      journal: new DecisionJournal(db),
      managedRules: () => [],
      agentPolicy: () => ({ agentMode: "auto", agentPolicyRevision: 0, agentPolicies: [] }),
      audit: () => {},
    }),
    repo,
    events,
    native: native as never,
    drivers: () => ({ aux: driver, chrome: null }),
  });
  const opened = await pages.open({ url: "https://start.example/", background: true, ownedByRuntime: false });
  const navigationsAfterOpen = driverNavigations;
  const target = await pages.navigate(opened.pageId, "https://example.com/native-load");
  expect(target.url).toBe("https://example.com/native-load");
  expect(commands).toContainEqual({
    kind: "navigate",
    pageId: opened.pageId,
    url: "https://example.com/native-load",
  });
  expect(driverNavigations).toBe(navigationsAfterOpen);

  reported = "https://start.example/";
  native.tabCommand = async (envelope) => {
    commands.push(envelope.command);
    return {
      commandId: envelope.commandId,
      status: "rejected",
      catalogVersion: 1,
      error: { code: "not_found", message: "Tab is not in this window" },
    };
  };
  await pages.navigate(opened.pageId, "https://example.com/driver-fallback");
  expect(driverNavigations).toBe(navigationsAfterOpen + 1);
  expect(pages.get(opened.pageId).url).toBe("https://example.com/driver-fallback");

  const beforeRejection = driverNavigations;
  native.tabCommand = async (envelope) => ({
    commandId: envelope.commandId,
    status: "rejected",
    catalogVersion: 1,
    error: { code: "invalid_params", message: "Invalid navigation URL" },
  });
  await expect(pages.navigate(opened.pageId, "not a url")).rejects.toMatchObject({ code: "invalid_params" });
  expect(driverNavigations).toBe(beforeRejection);
  expect(pages.get(opened.pageId).url).toBe("https://example.com/driver-fallback");
});
