import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
import {
  AgentConnectionService,
  EventBus,
  EXTERNAL_SESSION_IDLE_MS,
  ExternalSessionService,
  makeInvoker,
  openDb,
  Repo,
  startRuntime,
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
  const client = { external: true as const, connectionId: created.connection.connectionId, scope: created.connection.scope };
  const executed: { runId?: string }[] = [];
  const sessions = new ExternalSessionService(repo, events);
  const invoke = sessionInvoker(repo, events, connections, sessions, executed);

  await invoke("pages.list", {}, client);
  await invoke("pages.list", {}, client);
  const first = thread(repo, created.connection.connectionId);
  expect(first.map((run) => run.status)).toEqual(["running"]);
  const runId = first[0]!.runId;

  const resumed = new ExternalSessionService(repo, events);
  const resumeInvoke = sessionInvoker(repo, events, connections, resumed, executed);
  await resumeInvoke("pages.list", {}, client);
  expect(thread(repo, created.connection.connectionId).map((run) => run.runId)).toEqual([runId]);

  await invoke("pages.execute", {
    program: { pageId: "p1", steps: [{ id: "s", op: "click", target: "r1" }] },
    taskId: task.taskId,
    expectedRevision: task.revision,
  }, client);
  expect(repo.getRun(runId)?.pageIds).toEqual(["p1"]);
  expect(executed.at(-1)?.runId).toBe(runId);
  expect(repo.listSteps(runId)).toMatchObject([{ op: "pages.execute", outcome: { status: "ok" } }]);
  expect(repo.listSteps(runId)[0]?.inputs).toBeUndefined();

  await expect(invoke("agent.web.fetch", {
    taskId: task.taskId,
    expectedRevision: task.revision,
    url: "https://example.com/fixture",
  }, client)).rejects.toMatchObject({ code: "permission_denied" });
  expect(repo.listSteps(runId).map(step => [step.op, step.outcome?.status])).toEqual([
    ["pages.execute", "ok"], ["agent.web.fetch", "failed"],
  ]);
  expect(JSON.stringify(repo.listSteps(runId))).not.toContain("https://example.com/fixture");
  const anchored = decisions(repo).filter((row) => row.request.runId === runId);
  const approval = anchored.find((row) => row.decision.status === "ask" && row.decision.suspension?.approvalId);
  const approvalId = approval?.decision.suspension?.approvalId;
  if (!approval || !approvalId) throw new Error("expected an approval anchored to the session run");
  expect(approval.request).toMatchObject({ runId, action: "agent.web.fetch" });
  expect(repo.db.prepare("SELECT approval_id FROM safety_approval_requests WHERE approval_id=?").get(approvalId))
    .toMatchObject({ approval_id: approvalId });

  sessions.sweepIdle(Date.now());
  expect(repo.getRun(runId)?.status).toBe("running");
  sessions.sweepIdle(Date.now() + EXTERNAL_SESSION_IDLE_MS);
  expect(repo.getRun(runId)).toMatchObject({ status: "completed", statusMessage: "Session idle" });

  await invoke("pages.list", {}, client);
  const continued = thread(repo, created.connection.connectionId);
  expect(continued.filter((run) => run.status === "running")).toHaveLength(1);
  expect(continued).toHaveLength(2);
  const nextId = continued.find((run) => run.status === "running")!.runId;
  expect(nextId).not.toBe(runId);

  await invoke("agentConnections.revoke", { connectionId: created.connection.connectionId }, { external: false });
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
  repo.db.prepare("UPDATE agent_connections SET expires_at=? WHERE connection_id=?").run(Date.now() - 1, expiring.connection.connectionId);
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
    const pending = startRuntime(env);
    let handle: Awaited<ReturnType<typeof startRuntime>> | undefined;
    try {
      const port = await publishedPort(dataDir);
      const early = await fetch(`http://127.0.0.1:${port}/health`);
      const earlyBody = await early.json();
      handle = await pending;
      const late = await fetch(`http://127.0.0.1:${port}/health`);
      const lateBody = await late.json();
      expect(early.status).toBe(503);
      expect(earlyBody).toEqual({ ok: false, service: "aux-runtime", ready: false });
      expect(late.status).toBe(200);
      expect(lateBody).toEqual({ ok: true, service: "aux-runtime", ready: true });
    } finally {
      handle ??= await pending.catch(() => undefined);
      await handle?.close();
    }
  }
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
    get: () => ({ controller: "none" as const }),
    execute: async (_program: unknown, opts: { runId?: string }) => {
      executed.push(opts);
      return { steps: [] };
    },
    activate: async () => undefined,
    open: async () => ({ pageId: "p1" }),
    isAttached: () => true,
  };
  const settings = {
    effectGrants: () => [],
    originPolicies: () => [],
    safetyCeiling: () => "ask" as const,
  };
  return makeInvoker({
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
  return (repo.db.prepare("SELECT request_json AS requestJson, decision_json AS decisionJson FROM safety_decisions").all() as {
    requestJson: string;
    decisionJson: string;
  }[]).map((row) => ({ request: JSON.parse(row.requestJson), decision: JSON.parse(row.decisionJson) }));
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
  for (const key of ["AUX_HOST_SOCKET", "AUX_HOST_TOKEN", "AUX_BROWSER_PROFILE_ID", "AUX_INTERNAL_CDP", "AUX_RUNTIME_AUTOSTART"])
    delete env[key];
  return env;
}

async function publishedPort(dataDir: string): Promise<number> {
  const deadline = Date.now() + 8_000;
  while (Date.now() < deadline) {
    try {
      const descriptor = JSON.parse(readFileSync(join(dataDir, "runtime.json"), "utf8")) as { port?: unknown };
      if (typeof descriptor.port === "number") return descriptor.port;
    } catch {
      /* not published yet */
    }
    await new Promise((resolve) => setImmediate(resolve));
  }
  throw new Error("runtime.json was not published");
}
