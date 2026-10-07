import { fixturePage, fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import {
  AgentConnectionService,
  EventBus,
  EXTERNAL_SESSION_IDLE_MS,
  ExternalSessionService,
  makeInvoker,
  openDb,
  Repo,
  startRuntime,
  SettingsService,
  TaskService,
  type Services,
} from "@aux/runtime";

const cleanup: Array<() => void> = [];
afterEach(() => {
  for (const dispose of cleanup.splice(0).reverse()) dispose();
});

it("gives one scoped connection one session run, then a new run after that one ends", async () => {
  expect(EXTERNAL_SESSION_IDLE_MS).toBe(10 * 60_000);
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("External");
  const task = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Review",
    objective: "Read the page",
    criteria: [{ criterionId: "c", description: "Read", verification: "manual" }],
    resources: [{ resourceId: "page", kind: "page", locator: "p1", label: "Tab" }],
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
  const executed: { runId?: string }[] = [];
  const sessions = new ExternalSessionService(
    repo,
    events,
    fixtureTurnMentions((pageId: string) => repo.getPage(pageId)), async () => {});
  const invoke = sessionInvoker(repo, events, connections, sessions, executed);

  await invoke("pages.list", {}, client);
  await invoke("pages.list", {}, client);
  const first = thread(repo, created.connection.connectionId);
  expect(first.map((run) => run.status)).toEqual(["running"]);
  const runId = first[0]!.runId;

  const resumed = new ExternalSessionService(
    repo,
    events,
    fixtureTurnMentions((pageId: string) => repo.getPage(pageId)), async () => {});
  const resumeInvoke = sessionInvoker(repo, events, connections, resumed, executed);
  await resumeInvoke("pages.list", {}, client);
  expect(thread(repo, created.connection.connectionId).map((run) => run.runId)).toEqual([runId]);

  await invoke(
    "pages.execute",
    {
      program: { pageId: "p1", steps: [{ id: "s", op: "click", target: "r1" }] },
      taskId: task.taskId,
      expectedRevision: task.revision,
    },
    client,
  );
  expect(repo.getRun(runId)?.pageIds).toEqual(["p1"]);
  expect(executed.at(-1)?.runId).toBe(runId);
  expect(repo.listSteps(runId)).toMatchObject([{ op: "pages.execute", outcome: { status: "ok" } }]);
  expect(repo.listSteps(runId)[0]?.inputs).toBeUndefined();

  await expect(
    invoke(
      "agent.web.fetch",
      {
        taskId: task.taskId,
        expectedRevision: task.revision,
        url: "https://example.com/fixture",
      },
      client,
    ),
  ).rejects.toMatchObject({ code: "needs_input" });
  expect(repo.listSteps(runId).map((step) => [step.op, step.outcome?.status])).toEqual([
    ["pages.execute", "ok"],
  ]);
  expect(JSON.stringify(repo.listSteps(runId))).not.toContain("https://example.com/fixture");
  const anchored = decisions(repo).filter((row) => row.request.runId === runId);
  const approval = anchored.find(
    (row) => row.decision.status === "ask" && row.decision.suspension?.approvalId,
  );
  const approvalId = approval?.decision.suspension?.approvalId;
  if (!approval || !approvalId) throw new Error("expected an approval anchored to the session run");
  expect(approval.request).toMatchObject({ runId, action: "agent.web.fetch" });
  expect(
    repo.db.prepare("SELECT approval_id FROM safety_approval_requests WHERE approval_id=?").get(approvalId),
  ).toMatchObject({ approval_id: approvalId });

  await sessions.sweepIdle(Date.now());
  expect(repo.getRun(runId)?.status).toBe("needs_input");
  await sessions.sweepIdle(Date.now() + EXTERNAL_SESSION_IDLE_MS);
  expect(repo.getRun(runId)).toMatchObject({ status: "completed", statusMessage: "Session idle" });

  await invoke("pages.list", {}, client);
  const continued = thread(repo, created.connection.connectionId);
  expect(continued.filter((run) => run.status === "running")).toHaveLength(1);
  expect(continued).toHaveLength(2);
  const nextId = continued.find((run) => run.status === "running")!.runId;
  expect(nextId).not.toBe(runId);

  await invoke(
    "agentConnections.revoke",
    { connectionId: created.connection.connectionId },
    { external: false },
  );
  expect(repo.getRun(nextId)).toMatchObject({ status: "cancelled", statusMessage: "Connection revoked" });
  await expect(invoke("pages.list", {}, client)).rejects.toMatchObject({ code: "permission_denied" });
  expect(thread(repo, created.connection.connectionId).some((run) => run.status === "running")).toBe(false);

  const expiring = connections.create({
    name: "Short",
    client: "codex",
    scope: { kind: "task", workspaceId: workspace.workspaceId, taskId: task.taskId },
    expiresAt: Date.now() + 60_000,
  });
  const expiringClient = {
    external: true as const,
    connectionId: expiring.connection.connectionId,
    scope: expiring.connection.scope,
  };
  await invoke("pages.list", {}, expiringClient);
  const expiredId = thread(repo, expiring.connection.connectionId)[0]!.runId;
  repo.db
    .prepare("UPDATE agent_connections SET expires_at=? WHERE connection_id=?")
    .run(Date.now() - 1, expiring.connection.connectionId);
  await expect(invoke("pages.list", {}, expiringClient)).rejects.toMatchObject({ code: "permission_denied" });
  expect(repo.getRun(expiredId)).toMatchObject({ status: "completed", statusMessage: "Connection expired" });
  expect(thread(repo, expiring.connection.connectionId).some((run) => run.status === "running")).toBe(false);
});

it("answers /health not-ready before bootstrap and ready after, on two boots", async () => {
  for (let boot = 0; boot < 2; boot += 1) {
    const parent = mkdtempSync(join(tmpdir(), "aux-external-health-"));
    cleanup.push(() => rmSync(parent, { recursive: true, force: true }));
    const dataDir = join(parent, "data");
    const env = runtimeEnv(dataDir);
    let markEntered!: () => void;
    let release!: () => void;
    const entered = new Promise<void>((resolve) => {
      markEntered = resolve;
    });
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const initialize = SettingsService.prototype.initializeCredentials;
    const bootstrap = vi
      .spyOn(SettingsService.prototype, "initializeCredentials")
      .mockImplementation(async function (this: SettingsService) {
        markEntered();
        await gate;
        await initialize.call(this);
      });
    const pending = startRuntime(env);
    let handle: Awaited<ReturnType<typeof startRuntime>> | undefined;
    try {
      await Promise.race([
        entered,
        pending.then(() => {
          throw new Error("Runtime bypassed the bootstrap readiness barrier");
        }),
      ]);
      const port = await publishedPort(dataDir);
      const early = await fetch(`http://127.0.0.1:${port}/health`);
      const earlyBody = await early.json();
      expect(early.status).toBe(503);
      expect(earlyBody).toEqual({ ok: false, service: "aux-runtime", ready: false });
      release();
      handle = await pending;
      const late = await fetch(`http://127.0.0.1:${port}/health`);
      const lateBody = await late.json();
      expect(late.status).toBe(200);
      expect(lateBody).toEqual({ ok: true, service: "aux-runtime", ready: true });
    } finally {
      release();
      handle ??= await pending.catch(() => undefined);
      try {
        await handle?.close();
      } finally {
        bootstrap.mockRestore();
      }
    }
  }
});

it("lets the unscoped loopback owner mint and revoke connections and refuses a scoped agent", async () => {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Owner");
  const task = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Hold",
    objective: "Stay running",
    criteria: [{ criterionId: "held", description: "Stay running", verification: "manual" }],
  });
  const connections = new AgentConnectionService(repo);
  const sessions = new ExternalSessionService(
    repo,
    events,
    fixtureTurnMentions((pageId: string) => repo.getPage(pageId)), async () => {});
  const invoke = sessionInvoker(repo, events, connections, sessions, []);
  const scope = { kind: "task" as const, workspaceId: workspace.workspaceId, taskId: task.taskId };
  const params = { name: "Trust peer", client: "codex", scope };
  const created = (await invoke("agentConnections.create", params, { external: true })) as {
    connection: { connectionId: string; scope: typeof scope };
    token: string;
  };
  expect(created.token).toMatch(/^auxc_/);
  const scoped = {
    external: true as const,
    connectionId: created.connection.connectionId,
    scope: created.connection.scope,
  };
  await expect(invoke("agentConnections.create", params, scoped)).rejects.toMatchObject({
    code: "permission_denied",
  });
  await expect(invoke("agentConnections.list", {}, scoped)).rejects.toMatchObject({
    code: "permission_denied",
  });
  await expect(
    invoke("agentConnections.revoke", { connectionId: created.connection.connectionId }, scoped),
  ).rejects.toMatchObject({ code: "permission_denied" });
  await invoke("pages.list", {}, scoped);
  expect(thread(repo, created.connection.connectionId).map((run) => run.status)).toEqual(["running"]);
  await invoke(
    "agentConnections.revoke",
    { connectionId: created.connection.connectionId },
    { external: true },
  );
  expect(thread(repo, created.connection.connectionId).map((run) => run.status)).toEqual(["cancelled"]);
  const listed = (await invoke("agentConnections.list", {}, { external: true })) as Array<{
    revokedAt?: number;
  }>;
  expect(listed[0]?.revokedAt).toEqual(expect.any(Number));
  const settings = (await invoke(
    "agentConnections.create",
    { name: "Settings", client: "claude", scope },
    { external: false },
  )) as {
    token: string;
  };
  expect(settings.token).toMatch(/^auxc_/);
});

function sessionInvoker(
  repo: Repo,
  events: EventBus,
  agentConnections: AgentConnectionService,
  externalSessions: ExternalSessionService,
  executed: { runId?: string }[],
) {
  const pages = {
    list: () => [],
    get: (pageId: string) => fixturePage(pageId, "https://fixture.test/", 1),
    execute: async (_program: unknown, opts: { runId?: string }) => {
      executed.push(opts);
      return { steps: [] };
    },
    activate: async () => undefined,
    open: async () => ({ pageId: "p1" }),
    isAttached: () => true,
  };
  const settings = {
    agentPolicy: () => ({
      agentMode: "ask",
      agentPolicyRevision: 0,
      agentPolicies: [{ category: "read", access: "ask" }],
    }),
  };
  return makeInvoker({
    turnMentions: fixtureTurnMentions((pageId) => pages.get(pageId)),
    repo,
    events,
    pages,
    runs: { pageOwnership: { tryAcquire: () => () => undefined } },
    settings,
    agentConnections,
    externalSessions,
  } as unknown as Services);
}

function thread(repo: Repo, connectionId: string) {
  return repo.conversationRuns(`external:${connectionId}`);
}

function decisions(repo: Repo): Array<{
  request: { runId?: string; action?: string };
  decision: { status?: string; suspension?: { approvalId?: string } };
}> {
  return (
    repo.db
      .prepare("SELECT request_json AS requestJson, decision_json AS decisionJson FROM safety_decisions")
      .all() as {
      requestJson: string;
      decisionJson: string;
    }[]
  ).map((row) => ({ request: JSON.parse(row.requestJson), decision: JSON.parse(row.decisionJson) }));
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

async function publishedPort(dataDir: string): Promise<number> {
  const deadline = Date.now() + 8_000;
  while (Date.now() < deadline) {
    try {
      const descriptor = JSON.parse(readFileSync(join(dataDir, "runtime.json"), "utf8")) as {
        port?: unknown;
      };
      if (typeof descriptor.port === "number") return descriptor.port;
    } catch {
      /* not published yet */
    }
    await new Promise((resolve) => setImmediate(resolve));
  }
  throw new Error("runtime.json was not published");
}

it("retires admission before cancellation ACK and retains failed original ownership for retry", async () => {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db), events = new EventBus(repo), tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Retirement");
  const task = tasks.create({workspaceId: workspace.workspaceId, title: "Original", objective: "Original", criteria: [{criterionId: "c", description: "Done", verification: "manual"}]});
  const connections = new AgentConnectionService(repo);
  const connection = connections.create({name: "Claude", client: "claude", scope: {kind: "task", workspaceId: workspace.workspaceId, taskId: task.taskId}}).connection;
  let reject: (reason: Error) => void = () => {};
  const retire = vi.fn(() => new Promise<void>((_, fail) => {reject = fail;}));
  const sessions = new ExternalSessionService(repo, events, fixtureTurnMentions(id => repo.getPage(id)), retire);
  const owner = {connectionId: connection.connectionId, scope: connection.scope};
  const runId = sessions.ensure(owner)!;
  const ending = sessions.end(connection.connectionId, "cancelled");
  expect(repo.getRun(runId)).toMatchObject({status: "paused", config: {externalRetirementPending: true}});
  expect(sessions.ensure(owner)).toBeUndefined();
  reject(new Error("native ACK missing"));
  await expect(ending).rejects.toThrow("native ACK missing");
  expect(repo.getRun(runId)?.status).toBe("needs_input");
  expect(sessions.ensure(owner)).toBeUndefined();
  retire.mockImplementationOnce(async () => {});
  await sessions.end(connection.connectionId, "cancelled");
  expect(repo.getRun(runId)?.status).toBe("cancelled");
  expect(retire).toHaveBeenCalledTimes(2);
});


it("starts scoped runs with original task revision and connection ownership, never an unrelated attachment", async () => {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db), events = new EventBus(repo), tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Original");
  const task = tasks.create({workspaceId: workspace.workspaceId, title: "Task", objective: "Original objective", criteria: [{criterionId: "c", description: "Done", verification: "manual"}], resources: [{resourceId: "p", kind: "page", locator: "approved", label: "Approved"}]});
  const connections = new AgentConnectionService(repo);
  const connection = connections.create({name: "Codex", client: "codex", scope: {kind: "task", workspaceId: workspace.workspaceId, taskId: task.taskId}}).connection;
  repo.upsertPage(fixturePage("approved", "https://example.test/", 1));
  const turnMentions = fixtureTurnMentions(id => repo.getPage(id));
  const sessions = new ExternalSessionService(repo, events, turnMentions, async () => {});
  const start = vi.fn(async (input: unknown) => input);
  const invoke = makeInvoker({repo, events, turnMentions, tasks, pages: {get: (id: string) => repo.getPage(id)}, runs: {start}, settings: {agentPolicy: () => ({agentMode: "auto", agentPolicyRevision: 0, agentPolicies: []})}, agentConnections: connections, externalSessions: sessions} as unknown as Services);
  const client = {external: true as const, connectionId: connection.connectionId, scope: connection.scope};
  const input = {goal: "Review approved page", taskId: task.taskId, expectedRevision: task.revision, pageIds: ["approved"]};
  await expect(invoke("runs.start", {...input, pageIds: ["unrelated"]}, client)).rejects.toMatchObject({code: "permission_denied"});
  expect(start).not.toHaveBeenCalled();
  await invoke("runs.start", input, client);
  expect(start).toHaveBeenCalledWith(expect.objectContaining({taskId: task.taskId, taskRevision: task.revision, externalConnectionId: connection.connectionId, externalParentRunId: expect.any(String), pageIds: ["approved"]}));
});

it("joins external Stop after revoking its original token, without reopening the session", async () => {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db), events = new EventBus(repo), tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Stop");
  const task = tasks.create({workspaceId: workspace.workspaceId, title: "Stop", objective: "Stop", criteria: [{criterionId: "c", description: "Done", verification: "manual"}]});
  const connections = new AgentConnectionService(repo);
  const created = connections.create({name: "Codex", client: "codex", scope: {kind: "task", workspaceId: workspace.workspaceId, taskId: task.taskId}});
  let join!: () => void, entered!: () => void;
  const retiring = new Promise<void>(resolve => { entered = resolve; });
  const acknowledgement = new Promise<void>(resolve => { join = resolve; });
  const sessions = new ExternalSessionService(repo, events, fixtureTurnMentions(id => repo.getPage(id)), async () => { entered(); await acknowledgement; });
  const owner = {connectionId: created.connection.connectionId, scope: created.connection.scope};
  const runId = sessions.ensure(owner)!;
  const invoke = makeInvoker({repo, events, tasks, turnMentions: fixtureTurnMentions(id => repo.getPage(id)), agentConnections: connections, externalSessions: sessions, runs: {coordinator: {get: (id: string) => repo.getRun(id)}}, settings: {agentPolicy: () => ({agentMode: "auto", agentPolicyRevision: 0, agentPolicies: []})}} as unknown as Services);
  const stopping = invoke("runs.cancel", {runId}, {external: false});
  await retiring;
  expect(connections.authorize(created.token)).toBeNull();
  expect(sessions.ensure(owner)).toBeUndefined();
  expect(repo.getRun(runId)?.status).toBe("paused");
  join();
  await expect(stopping).resolves.toMatchObject({runId, status: "cancelled"});
  expect(sessions.ensure(owner)).toBeUndefined();
});
