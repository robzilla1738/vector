import { afterEach, expect, it } from "vitest";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AgentConnectionService, EventBus, openDb, Repo, TaskService } from "@aux/runtime";

const cleanup: Array<() => void> = [];
afterEach(() => { for (const dispose of cleanup.splice(0).reverse()) dispose(); });

it("persists task-scoped connections as hashes and revokes their tokens immediately", () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-agent-connection-"));
  cleanup.push(() => rmSync(directory, { recursive: true, force: true }));
  const path = join(directory, "state.sqlite");
  const db = openDb(path); cleanup.push(() => db.close());
  const repo = new Repo(db), tasks = new TaskService(repo, new EventBus(repo));
  const workspace = tasks.createWorkspace("Scoped workspace");
  const task = tasks.create({ workspaceId: workspace.workspaceId, title: "Scoped task", objective: "Inspect one page",
    criteria: [{ criterionId: "page", description: "Page is inspected", verification: "browser" }] });
  const service = new AgentConnectionService(repo);
  const created = service.create({ name: "Codex review", client: "codex", scope: { kind: "task", workspaceId: workspace.workspaceId, taskId: task.taskId } });
  expect(created.token).toMatch(/^auxc_/);
  expect(service.authorize(created.token)).toMatchObject({ connectionId: created.connection.connectionId, scope: created.connection.scope });
  expect(service.isLive({ external: true, connectionId: created.connection.connectionId, scope: created.connection.scope })).toBe(true);
  expect(service.isLive({ external: true, connectionId: created.connection.connectionId,
    scope: { kind: "workspace", workspaceId: workspace.workspaceId } })).toBe(false);
  expect(readFileSync(path).includes(created.token)).toBe(false);
  expect(service.list()[0]).toMatchObject({ name: "Codex review", lastUsedAt: expect.any(Number) });
  service.revoke(created.connection.connectionId);
  expect(service.isLive({ external: true, connectionId: created.connection.connectionId, scope: created.connection.scope })).toBe(false);
  expect(service.authorize(created.token)).toBeNull();
  expect(service.list()[0]?.revokedAt).toEqual(expect.any(Number));
  expect(() => service.create({ name: "Wrong task", client: "claude", scope: { kind: "task", workspaceId: workspace.workspaceId, taskId: "missing" } })).toThrow("does not belong");
});

it("creates session-scoped connections only for existing browser sessions", () => {
  const db = openDb(":memory:"); cleanup.push(() => db.close());
  const repo = new Repo(db), tasks = new TaskService(repo, new EventBus(repo));
  const workspace = tasks.createWorkspace("Session workspace");
  const service = new AgentConnectionService(repo);
  expect(() => service.create({ name: "No session", client: "codex",
    scope: { kind: "session", workspaceId: workspace.workspaceId, sessionId: "missing" } })).toThrow("session does not exist");
  repo.upsertSession({ sessionId: "sess-1", backend: "chrome", label: "Chrome", status: "connected" });
  const created = service.create({ name: "Cloud driver", client: "codex",
    scope: { kind: "session", workspaceId: workspace.workspaceId, sessionId: "sess-1" } });
  expect(service.authorize(created.token)).toMatchObject({
    scope: { kind: "session", workspaceId: workspace.workspaceId, sessionId: "sess-1" },
  });
  expect(service.list()[0]?.scope).toEqual(created.connection.scope);
});

it("enforces token expiry at create and authorize time, including cached entries", async () => {
  const db = openDb(":memory:"); cleanup.push(() => db.close());
  const repo = new Repo(db), tasks = new TaskService(repo, new EventBus(repo));
  const workspace = tasks.createWorkspace("Expiry workspace");
  const service = new AgentConnectionService(repo);
  const scope = { kind: "workspace" as const, workspaceId: workspace.workspaceId };
  expect(() => service.create({ name: "Already dead", client: "codex", scope,
    expiresAt: Date.now() - 1 })).toThrow("in the future");
  const created = service.create({ name: "Short-lived", client: "codex", scope,
    expiresAt: Date.now() + 40 });
  expect(service.authorize(created.token)?.connectionId).toBe(created.connection.connectionId);
  await new Promise((resolve) => setTimeout(resolve, 60));
  // The cached entry must not outlive the expiry.
  expect(service.authorize(created.token)).toBeNull();
});
