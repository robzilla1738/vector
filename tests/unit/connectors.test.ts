import { afterEach, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { CalendarConnectionService } from "../../apps/runtime/src/services/calendar-connections.js";
import { ConnectorCatalogService } from "../../apps/runtime/src/services/connectors.js";
import { OutboundMcpService } from "../../apps/runtime/src/services/outbound-mcp.js";
import { OperationService } from "../../apps/runtime/src/services/operations.js";
import { SettingsService } from "../../apps/runtime/src/services/settings.js";
import { TaskService } from "../../apps/runtime/src/services/tasks.js";
import { EventBus } from "../../apps/runtime/src/events.js";
import { openDb } from "../../apps/runtime/src/store/db.js";
import { Repo } from "../../apps/runtime/src/store/repo.js";
import { makeInvoker, type Services } from "../../apps/runtime/src/api/handlers.js";
import type { NativeBridge } from "../../apps/runtime/src/native.js";

const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => { vi.unstubAllGlobals(); for (const db of databases.splice(0)) db.close(); });

async function fixture(githubToken = "synthetic-token") {
  const db = openDb(":memory:"); databases.push(db);
  const repo = new Repo(db), events = new EventBus(repo), tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Connector review");
  const projectId = randomUUID();
  const task = tasks.create({ workspaceId: workspace.workspaceId, title: "Inspect project", objective: "Read review data",
    criteria: [{ criterionId: "review", description: "Review", verification: "manual" }],
    resources: [{ resourceId: "repo", kind: "repository", projectId, locator: "/synthetic/project", label: "Project", access: "read" }] });
  const native = { available: () => true, readSecret: async (name: string) => ({ value: name === "githubToken" ? githubToken || undefined : undefined }),
    storeSecret: async () => ({ ok: true as const }) } as unknown as NativeBridge;
  const settings = new SettingsService(repo, `/tmp/aux-connectors-${randomUUID()}.json`, {});
  settings.attachNative(native); await settings.initializeCredentials();
  const calendar = new CalendarConnectionService({ repo, native, clientId: "synthetic-client" });
  const mcp = new OutboundMcpService(repo);
  const catalog = new ConnectorCatalogService({ repo, tasks, settings, calendar, mcp });
  const operations = new OperationService({ repo, events, pages: {} as never, calendar });
  return { db, repo, events, tasks, workspace, task, projectId, native, settings, calendar, mcp, catalog, operations };
}

describe("reviewed connector catalog", () => {
  it("does not expose project access as a GitHub grant without a saved credential", async () => {
    const f = await fixture("");
    const result = f.catalog.list({ workspaceId: f.workspace.workspaceId, taskId: f.task.taskId,
      expectedRevision: f.task.revision });
    expect(result.entries.find(item => item.kind === "github")).toMatchObject({ state: "disconnected" });
    expect(result.access).toEqual([]);
    await f.calendar.close();
  });

  it("derives Calendar, GitHub and MCP access from their original grants and removes it on revocation", async () => {
    const f = await fixture();
    const connectionId = randomUUID(), now = Date.now();
    f.db.prepare("INSERT INTO calendar_connections(connection_id,provider,account_key,label,secret_name,scopes,state,created_at,updated_at) VALUES(?,'google',?,?,?,?, 'active',?,?)")
      .run(connectionId, "alice@example.test", "Alice", "synthetic-secret", JSON.stringify(["https://www.googleapis.com/auth/calendar.readonly"]), now, now);
    const calendarGrant = f.calendar.grantTask(f.task.taskId, f.task.revision, connectionId);
    const server = await f.mcp.register({ workspaceId: f.workspace.workspaceId, name: "Research tools",
      source: { kind: "remote", url: "https://mcp.example.test/api", auth: "none" } });
    f.mcp.approve(server.serverId, server.sourceDigest);
    const mcpGrant = f.mcp.grant({ serverId: server.serverId, toolName: "search", scope: { kind: "task",
      taskId: f.task.taskId, revision: f.task.revision }, mode: "standing", outputTokenLimit: 1000 });
    const first = f.catalog.list({ workspaceId: f.workspace.workspaceId, taskId: f.task.taskId, expectedRevision: f.task.revision });
    expect(first.access.map(item => item.kind).sort()).toEqual(["calendar", "github", "mcp"]);
    expect(first.entries.find(item => item.kind === "github")).toMatchObject({ state: "saved", authority: "saved_credential_and_task_project" });
    expect(first.access.find(item => item.kind === "github")).toMatchObject({ projectId: f.projectId, authority: "task_project_resource" });
    expect(first.access.find(item => item.kind === "calendar")).toMatchObject({ grantId: calendarGrant.grantId });
    expect(first.access.find(item => item.kind === "mcp")).toMatchObject({ grantId: mcpGrant.grantId, toolName: "search", scope: "task" });

    f.calendar.revokeTaskGrant(f.task.taskId, calendarGrant.grantId);
    f.mcp.revokeGrant(mcpGrant.grantId);
    const second = f.catalog.list({ workspaceId: f.workspace.workspaceId, taskId: f.task.taskId, expectedRevision: f.task.revision });
    expect(second.access.map(item => item.kind)).toEqual(["github"]);
    const revised = f.tasks.update({ taskId: f.task.taskId, expectedRevision: f.task.revision, resources: [] });
    expect(f.catalog.list({ workspaceId: f.workspace.workspaceId, taskId: revised.taskId, expectedRevision: revised.revision }).access).toEqual([]);
    expect(() => f.catalog.list({ workspaceId: f.workspace.workspaceId, taskId: f.task.taskId, expectedRevision: f.task.revision })).toThrow();
    await f.calendar.close();
  });

  it("keeps connector account inventory inside Aux and rejects stale or cross-Space review", async () => {
    const f = await fixture();
    const other = f.tasks.createWorkspace("Other");
    const invoke = makeInvoker({ repo: f.repo, events: f.events, settings: f.settings, calendar: f.calendar,
      operations: f.operations, pages: {} } as Services);
    const params = { workspaceId: f.workspace.workspaceId, taskId: f.task.taskId, expectedRevision: f.task.revision };
    expect(await invoke("connectors.catalog", params, { external: false })).toMatchObject({ access: [{ kind: "github" }] });
    await expect(invoke("connectors.catalog", params, { external: true })).rejects.toMatchObject({ code: "permission_denied" });
    expect(() => f.catalog.list({ ...params, workspaceId: other.workspaceId })).toThrow();
    await f.calendar.close();
  });

  it("dispatches GitHub status through the sealed read journal without persisting credentials", async () => {
    const f = await fixture();
    vi.stubGlobal("fetch", async (url: string) => {
      if (url.endsWith("/repos/example/project")) return Response.json({ default_branch: "main", permissions: { pull: true } });
      if (url.includes("/pulls?") || url.includes("/issues?")) return Response.json([]);
      return Response.json({});
    });
    const identity = { owner: "example", repository: "project", remoteUrl: "https://github.com/example/project.git",
      branch: "main", baseCommit: "a".repeat(40), headCommit: "b".repeat(40) };
    const native = { githubProject: async () => identity, recordGithubStatus: async (_id: string, status: unknown) => status } as unknown as NativeBridge;
    const result = await f.operations.invokeGithubProjectStatus({ taskId: f.task.taskId, taskRevision: f.task.revision,
      projectId: f.projectId }, { settings: f.settings, native });
    expect(result).toMatchObject({ owner: "example", repository: "project", defaultBranch: "main", account: "unverified" });
    const row = f.db.prepare("SELECT inputs,status,effect_outcome,route_reason FROM operation_invocations WHERE operation_id='aux-connector-github-repository-status'")
      .get() as { inputs: string; status: string; effect_outcome: string; route_reason: string };
    expect(row).toMatchObject({ status: "completed", effect_outcome: "observed",
      route_reason: "saved GitHub credential and task-attached project" });
    expect(row.inputs).not.toContain("synthetic-token");
    expect(() => f.operations.saveFromProgram({ siteKey: "aux.connector.github", name: "shadow",
      program: { version: 1, steps: [] } as never })).toThrow();
    await f.calendar.close();
  });

  it("journals GitHub reads and suppresses a result when project access changes in flight", async () => {
    const f = await fixture();
    const identity = { owner: "example", repository: "project", remoteUrl: "https://github.com/example/project.git",
      branch: "main", baseCommit: "a".repeat(40), headCommit: "b".repeat(40) };
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    let requested!: () => void;
    const entered = new Promise<void>(resolve => { requested = resolve; });
    let fetches = 0, recorded = 0;
    vi.stubGlobal("fetch", async (url: string) => {
      fetches++;
      if (url.endsWith("/repos/example/project")) { requested(); await gate; return Response.json({ default_branch: "main", permissions: { pull: true } }); }
      if (url.includes("/pulls?") || url.includes("/issues?")) return Response.json([]);
      return Response.json({});
    });
    const native = { githubProject: async () => identity, recordGithubStatus: async (_id: string, status: unknown) => {
      recorded++; return status;
    } } as unknown as NativeBridge;
    const pending = f.operations.invokeGithubProjectStatus({ taskId: f.task.taskId, taskRevision: f.task.revision,
      projectId: f.projectId }, { settings: f.settings, native });
    await entered;
    f.tasks.update({ taskId: f.task.taskId, expectedRevision: f.task.revision, resources: [] });
    release();
    await expect(pending).rejects.toMatchObject({ code: "conflict" });
    expect(fetches).toBeGreaterThan(0);
    expect(recorded).toBe(0);
    expect(f.db.prepare("SELECT status,effect_outcome FROM operation_invocations WHERE operation_id='aux-connector-github-repository-status'").get())
      .toEqual({ status: "failed", effect_outcome: "not-applicable" });
    await f.calendar.close();
  });

  it("rejects a GitHub result after the saved credential is reloaded during the read", async () => {
    const f = await fixture();
    const identity = { owner: "example", repository: "project", remoteUrl: "https://github.com/example/project.git",
      branch: "main", baseCommit: "a".repeat(40), headCommit: "b".repeat(40) };
    let release!: () => void, entered!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    const requested = new Promise<void>(resolve => { entered = resolve; });
    vi.stubGlobal("fetch", async (url: string) => {
      if (url.endsWith("/repos/example/project")) { entered(); await gate; return Response.json({ default_branch: "main" }); }
      if (url.includes("/pulls?") || url.includes("/issues?")) return Response.json([]);
      return Response.json({});
    });
    let recorded = 0;
    const native = { githubProject: async () => identity, recordGithubStatus: async (_id: string, status: unknown) => {
      recorded++; return status;
    } } as unknown as NativeBridge;
    const pending = f.operations.invokeGithubProjectStatus({ taskId: f.task.taskId, taskRevision: f.task.revision,
      projectId: f.projectId }, { settings: f.settings, native });
    await requested;
    await f.settings.initializeCredentials();
    release();
    await expect(pending).rejects.toMatchObject({ code: "conflict" });
    expect(recorded).toBe(0);
    await f.calendar.close();
  });
});
