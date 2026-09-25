import { expect, it } from "vitest";
import { EventBus, openDb, OutboundMcpService, Repo, TaskService, type McpTransportProvider } from "@aux/runtime";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

type Transport = Awaited<ReturnType<McpTransportProvider>>;

function fixture(provider?: ConstructorParameters<typeof OutboundMcpService>[1]) {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  const tasks = new TaskService(repo, new EventBus(repo));
  const workspace = tasks.createWorkspace("MCP");
  return { db, repo, tasks, workspace, service: new OutboundMcpService(repo, provider) };
}

function fakeTransport(calls: string[], toolResult: unknown = { content: [{ type: "text", text: "done" }] }): Transport {
  const transport = {
    onmessage: undefined as ((message: unknown) => void) | undefined,
    async start() {},
    async close() {},
    async send(message: { id?: number; method?: string; params?: { protocolVersion?: string } }) {
      if (message.id === undefined) return;
      calls.push(message.method ?? "");
      const result = message.method === "initialize"
        ? { protocolVersion: message.params?.protocolVersion ?? "2025-11-25", capabilities: { tools: {} }, serverInfo: { name: "fixture", version: "1" } }
        : message.method === "tools/list"
          ? { tools: [{ name: "read", inputSchema: { type: "object", properties: {} } }] }
          : toolResult;
      queueMicrotask(() => transport.onmessage?.({ jsonrpc: "2.0", id: message.id, result }));
    },
  };
  return transport as unknown as Transport;
}

it("requires exact source review and native supervised transport", async () => {
  const f = fixture();
  const server = await f.service.register({ workspaceId: f.workspace.workspaceId, name: "local",
    source: { kind: "local", command: "/bin/echo", args: [], cwd: "/tmp" } });
  expect(() => f.service.grant({ serverId: server.serverId, toolName: "read", scope: { kind: "workspace", workspaceId: f.workspace.workspaceId }, mode: "once", outputTokenLimit: 100 })).toThrow(/Approve/);
  expect(() => f.service.approve(server.serverId, "0".repeat(64))).toThrow(/Review/);
  f.service.approve(server.serverId, server.sourceDigest);
  await expect(f.service.listTools(server.serverId)).rejects.toThrow(/Supervised/);
  expect(() => f.service.approve(server.serverId, server.sourceDigest)).toThrow(/Review/);
  f.db.close();
});

it("inspects a bundle as inert data and pins its exact bytes", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-mcp-bundle-"));
  const f = fixture();
  try {
    writeFileSync(join(directory, "manifest.json"), JSON.stringify({ name: "Example", server: { type: "node", entry_point: "index.js" } }));
    const bundle = join(directory, "example.mcpb");
    execFileSync("/usr/bin/zip", ["-q", bundle, "manifest.json"], { cwd: directory });
    const sha256 = createHash("sha256").update(readFileSync(bundle)).digest("hex");
    expect(await f.service.inspectBundle(bundle)).toMatchObject({ path: bundle, sha256, format: "mcpb", name: "Example" });
    const server = await f.service.register({ workspaceId: f.workspace.workspaceId, name: "bundle",
      source: { kind: "bundle", path: bundle, sha256, format: "mcpb" } });
    expect(server.state).toBe("pending");
    await expect(f.service.register({ workspaceId: f.workspace.workspaceId, name: "changed",
      source: { kind: "bundle", path: bundle, sha256: "0".repeat(64), format: "mcpb" } })).rejects.toThrow(/changed/);
    expect((f.repo.db.prepare("SELECT count(*) AS n FROM outbound_mcp_servers").get() as { n: number }).n).toBe(1);
  } finally { f.db.close(); rmSync(directory, { recursive: true, force: true }); }
});

it("binds a once grant to a task revision and records a single completed call", async () => {
  const methods: string[] = [];
  const f = fixture(async () => fakeTransport(methods));
  const task = f.tasks.create({ workspaceId: f.workspace.workspaceId, title: "Read", objective: "Read", criteria: [{ criterionId: "read", description: "Read", verification: "manual" }] });
  const server = await f.service.register({ workspaceId: f.workspace.workspaceId, name: "server",
    source: { kind: "remote", url: "https://example.test/mcp", auth: "oauth" } });
  f.service.approve(server.serverId, server.sourceDigest);
  const grant = f.service.grant({ serverId: server.serverId, toolName: "read",
    scope: { kind: "task", taskId: task.taskId, revision: task.revision }, mode: "once", outputTokenLimit: 100 });
  await expect(f.service.callTool(grant.grantId, {}, { workspaceId: f.workspace.workspaceId, taskId: task.taskId, revision: task.revision + 1 })).rejects.toThrow(/does not cover/);
  const result = await f.service.callTool(grant.grantId, {}, { workspaceId: f.workspace.workspaceId, taskId: task.taskId, revision: task.revision });
  expect(result.status).toBe("completed");
  expect(result.output).toContain("done");
  expect(methods).toContain("tools/call");
  await expect(f.service.callTool(grant.grantId, {}, { workspaceId: f.workspace.workspaceId, taskId: task.taskId, revision: task.revision })).rejects.toThrow(/not active/);
  expect((f.repo.db.prepare("SELECT count(*) AS n FROM outbound_mcp_calls").get() as { n: number }).n).toBe(1);
  f.db.close();
});

it("recovers interrupted calls as uncertain and never replays them", async () => {
  const f = fixture();
  const server = await f.service.register({ workspaceId: f.workspace.workspaceId, name: "server",
    source: { kind: "remote", url: "https://example.test/mcp", auth: "none" } });
  f.service.approve(server.serverId, server.sourceDigest);
  const grant = f.service.grant({ serverId: server.serverId, toolName: "read",
    scope: { kind: "workspace", workspaceId: f.workspace.workspaceId }, mode: "standing", outputTokenLimit: 100 });
  await expect(f.service.callTool(grant.grantId, {}, { workspaceId: f.workspace.workspaceId })).rejects.toThrow(/Supervised/);
  f.repo.db.prepare("INSERT INTO outbound_mcp_calls(call_id,server_id,grant_id,tool_name,status,created_at) VALUES(?,?,?,?,?,?)")
    .run("crashed", server.serverId, grant.grantId, "read", "invoking", Date.now());
  new OutboundMcpService(f.repo);
  expect((f.repo.db.prepare("SELECT status FROM outbound_mcp_calls WHERE call_id='crashed'").get() as { status: string }).status).toBe("uncertain");
  f.db.close();
});

it("marks a call uncertain if its grant is revoked while a server is responding", async () => {
  let reached!: () => void;
  const ready = new Promise<void>(resolve => { reached = resolve; });
  const f = fixture(async () => {
    const transport = fakeTransport([]) as unknown as { send: (message: { method?: string; id?: number }) => Promise<void> };
    const send = transport.send.bind(transport);
    transport.send = async message => {
      if (message.method === "tools/call") { reached(); return; }
      return send(message);
    };
    return transport as unknown as Transport;
  });
  const server = await f.service.register({ workspaceId: f.workspace.workspaceId, name: "server",
    source: { kind: "remote", url: "https://example.test/mcp", auth: "oauth" } });
  f.service.approve(server.serverId, server.sourceDigest);
  const grant = f.service.grant({ serverId: server.serverId, toolName: "read",
    scope: { kind: "workspace", workspaceId: f.workspace.workspaceId }, mode: "once", outputTokenLimit: 100 });
  const pending = f.service.callTool(grant.grantId, {}, { workspaceId: f.workspace.workspaceId });
  await ready;
  f.service.revokeGrant(grant.grantId);
  expect((await pending).status).toBe("uncertain");
  expect((f.repo.db.prepare("SELECT status FROM outbound_mcp_calls WHERE grant_id=?").get(grant.grantId) as { status: string }).status).toBe("uncertain");
  f.db.close();
});
