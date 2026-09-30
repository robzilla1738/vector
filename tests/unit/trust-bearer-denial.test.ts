import { expect, it } from "vitest";
import {
  AgentConnectionService,
  ApiServer,
  EventBus,
  ExternalSessionService,
  makeInvoker,
  openDb,
  Repo,
  TaskService,
  type Services,
} from "@aux/runtime";

it("denies an expired or revoked scoped bearer and leaves an unknown bearer unauthorized", async () => {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Bearer denial");
  const task = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Read",
    objective: "Read the page",
    criteria: [{ criterionId: "c", description: "Read", verification: "manual" }],
  });
  const connections = new AgentConnectionService(repo);
  const sessions = new ExternalSessionService(repo, events);
  const invoke = makeInvoker({
    repo,
    events,
    pages: { list: () => [], get: () => ({ controller: "none" }) },
    runs: { pageOwnership: { tryAcquire: () => () => undefined } },
    settings: { effectGrants: () => [], originPolicies: () => [], safetyCeiling: () => "ask" },
    agentConnections: connections,
    externalSessions: sessions,
  } as unknown as Services);
  const server = new ApiServer({
    token: "master-token",
    events,
    invoke: (method, params, caller) => invoke(method, params, caller),
    authorizeScopedToken: (token) => connections.authorize(token),
    closedScopedToken: (token) => connections.closedClient(token),
  });
  const port = await server.listen(0);
  server.setReady();
  const rpc = async (token: string | undefined, method: string, params: unknown = {}) => {
    const response = await fetch(`http://127.0.0.1:${port}/rpc`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ id: 1, method, params }),
    });
    const body = await response.json() as { result?: unknown; error?: { code?: string } };
    return { status: response.status, body };
  };
  const scope = { kind: "task" as const, workspaceId: workspace.workspaceId, taskId: task.taskId };
  try {
    const missing = await rpc(undefined, "pages.list");
    expect(missing.status).toBe(401);
    expect(missing.body.error?.code).toBe("unauthorized");
    const unknown = await rpc("auxc_not-a-connection", "pages.list");
    expect(unknown.status).toBe(401);
    expect(unknown.body.error?.code).toBe("unauthorized");
    const malformed = await rpc("not-a-scoped-token", "pages.list");
    expect(malformed.status).toBe(401);
    expect(malformed.body.error?.code).toBe("unauthorized");

    const expiring = connections.create({
      name: "Trust expiry",
      client: "codex",
      scope,
      expiresAt: Date.now() + 60_000,
    });
    expect((await rpc(expiring.token, "pages.list")).status).toBe(200);
    repo.db.prepare("UPDATE agent_connections SET expires_at=? WHERE connection_id=?").run(
      Date.now() - 1,
      expiring.connection.connectionId,
    );
    const expired = await rpc(expiring.token, "pages.list");
    expect(expired.status).toBe(200);
    expect(expired.body.error?.code).toBe("permission_denied");
    const expiredRunId = repo.conversationRuns(`external:${expiring.connection.connectionId}`)[0]?.runId;
    const expiredRun = expiredRunId ? repo.getRun(expiredRunId) : undefined;
    if (!expiredRun) throw new Error("expected the expired session run");
    expect(expiredRun.status).toBe("completed");
    expect(expiredRun.statusMessage).toBe("Connection expired");

    const revocable = connections.create({
      name: "Trust revoke",
      client: "codex",
      scope,
      expiresAt: Date.now() + 60_000,
    });
    expect((await rpc(revocable.token, "pages.list")).status).toBe(200);
    const revoked = await rpc("master-token", "agentConnections.revoke", {
      connectionId: revocable.connection.connectionId,
    });
    expect(revoked.status).toBe(200);
    expect(revoked.body.result).toMatchObject({ connectionId: revocable.connection.connectionId });
    const afterRevoke = await rpc(revocable.token, "pages.list");
    expect(afterRevoke.status).toBe(200);
    expect(afterRevoke.body.error?.code).toBe("permission_denied");
    const revokedRunId = repo.conversationRuns(`external:${revocable.connection.connectionId}`)[0]?.runId;
    const revokedRun = revokedRunId ? repo.getRun(revokedRunId) : undefined;
    if (!revokedRun) throw new Error("expected the revoked session run");
    expect(revokedRun.status).toBe("cancelled");
    expect(revokedRun.statusMessage).toBe("Connection revoked");
  } finally {
    await server.close();
    db.close();
  }
});
