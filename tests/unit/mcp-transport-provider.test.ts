import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { createMcpTransportProvider, EventBus, makeInvoker, openDb, OutboundMcpService, Repo, TaskService,
  type Services } from "@aux/runtime";
import type { McpOAuthToken, McpStdioLaunchPermit, OutboundMcpServer } from "@aux/contracts";

function fixture(provider: ReturnType<typeof createMcpTransportProvider>) {
  const db = openDb(":memory:"), repo = new Repo(db);
  const workspaceId = new TaskService(repo, new EventBus(repo)).createWorkspace("MCP transport").workspaceId;
  const service = new OutboundMcpService(repo, provider);
  return { db, workspaceId, service,
    async approve(source: OutboundMcpServer["source"]) {
      const server = await service.register({ workspaceId, name: "Fixture", source });
      return service.approve(server.serverId, server.sourceDigest);
    } };
}

function protocolFetch(calls: { method: string; url: string; authorization: string | null; redirect: RequestRedirect | undefined }[]) {
  const fetcher: typeof fetch = async (input, init) => {
    const url = input instanceof Request ? input.url : String(input);
    const method = init?.method ?? (input instanceof Request ? input.method : "GET");
    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
    calls.push({ method, url, authorization: headers.get("authorization"), redirect: init?.redirect });
    if (method === "GET") return new Response(null, { status: 405 });
    const body = JSON.parse(String(init?.body ?? "{}"));
    if (body.id === undefined) return new Response(null, { status: 202 });
    const result = body.method === "initialize"
      ? { protocolVersion: body.params.protocolVersion, capabilities: { tools: {} }, serverInfo: { name: "fixture", version: "1" } }
      : body.method === "tools/list"
        ? { tools: [{ name: "read", inputSchema: { type: "object", properties: {} } }] }
        : { content: [{ type: "text", text: "done" }] };
    return Response.json({ jsonrpc: "2.0", id: body.id, result });
  };
  return fetcher;
}

it("uses the approved HTTPS origin without redirects and no ambient credential", async () => {
  const calls: { method: string; url: string; authorization: string | null; redirect: RequestRedirect | undefined }[] = [];
  const f = fixture(createMcpTransportProvider(undefined, protocolFetch(calls)));
  try {
    const server = await f.approve({ kind: "remote", url: "https://mcp.example.test/api", auth: "none" });
    expect(await f.service.listTools(server.serverId)).toMatchObject([{ name: "read" }]);
    expect(calls.some(call => call.method === "POST")).toBe(true);
    expect(calls.every(call => new URL(call.url).origin === "https://mcp.example.test" &&
      call.redirect === "error" && call.authorization === null)).toBe(true);
  } finally { f.db.close(); }
});

it("fetches a host-owned OAuth token for the exact approved server and rejects a mismatched token", async () => {
  const calls: { method: string; url: string; authorization: string | null; redirect: RequestRedirect | undefined }[] = [];
  let current: "valid" | "wrong" = "valid";
  const native = { mcpOAuthToken: async (server: OutboundMcpServer): Promise<McpOAuthToken> => ({
    serverId: current === "valid" ? server.serverId : "00000000-0000-0000-0000-000000000000",
    sourceDigest: server.sourceDigest, token: "ephemeral-token", expiresAt: Date.now() + 30_000 }) };
  const f = fixture(createMcpTransportProvider(native, protocolFetch(calls)));
  try {
    const server = await f.approve({ kind: "remote", url: "https://mcp.example.test/api", auth: "oauth" });
    expect(await f.service.listTools(server.serverId)).toMatchObject([{ name: "read" }]);
    expect(calls.some(call => call.authorization === "Bearer ephemeral-token")).toBe(true);
    current = "wrong";
    await expect(f.service.listTools(server.serverId)).rejects.toThrow(/credential does not match/);
  } finally { f.db.close(); }
});

it("runs a local server only through the host-issued one-use launcher", async () => {
  const directory = mkdtempSync(join(tmpdir(), "aux-mcp-launch-"));
  const script = join(directory, "launcher.mjs");
  writeFileSync(script, `
if (process.argv[2] !== "signed-capability-123") process.exit(33);
let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => { input += chunk; let at;
  while ((at = input.indexOf("\\n")) >= 0) {
    const line = input.slice(0, at); input = input.slice(at + 1);
    if (!line.trim()) continue;
    const request = JSON.parse(line);
    if (request.id === undefined) continue;
    const result = request.method === "initialize"
      ? { protocolVersion: request.params.protocolVersion, capabilities: { tools: {} }, serverInfo: { name: "local", version: "1" } }
      : request.method === "tools/list"
        ? { tools: [{ name: "local-read", inputSchema: { type: "object", properties: {} } }] }
        : { content: [{ type: "text", text: "local-done" }] };
    process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: request.id, result }) + "\\n");
  }
});`);
  const native = { prepareMcpStdioLaunch: async (server: OutboundMcpServer): Promise<McpStdioLaunchPermit> => ({
    serverId: server.serverId, sourceDigest: server.sourceDigest, capabilityId: "signed-capability-123",
    launcherPath: process.execPath, launcherArgs: [script], cwd: directory, expiresAt: Date.now() + 30_000,
    effectiveProfile: { networkAllowed: false, readableRoots: [directory], writableRoots: [] } }) };
  const f = fixture(createMcpTransportProvider(native));
  try {
    const server = await f.approve({ kind: "local", command: "/not/this/command", args: [], cwd: directory });
    expect(await f.service.listTools(server.serverId)).toMatchObject([{ name: "local-read" }]);
    const grant = f.service.grant({ serverId: server.serverId, toolName: "local-read",
      scope: { kind: "workspace", workspaceId: f.workspaceId }, mode: "once", outputTokenLimit: 100 });
    const result = await f.service.callTool(grant.grantId, {}, { workspaceId: f.workspaceId });
    expect(result.status).toBe("completed");
    expect(result.output).toContain("local-done");
  } finally { f.db.close(); rmSync(directory, { recursive: true, force: true }); }
});

it("fails closed for missing host authority, local URLs, expired permits, and changed bundles", async () => {
  const f = fixture(createMcpTransportProvider());
  const directory = mkdtempSync(join(tmpdir(), "aux-mcp-deny-"));
  try {
    const local = await f.approve({ kind: "local", command: "/bin/echo", args: [], cwd: directory });
    await expect(f.service.listTools(local.serverId)).rejects.toThrow(/Supervised local MCP launch/);
    const oauth = await f.approve({ kind: "remote", url: "https://mcp.example.test/api", auth: "oauth" });
    await expect(f.service.listTools(oauth.serverId)).rejects.toThrow(/OAuth is unavailable/);
    const loopback = await f.approve({ kind: "remote", url: "https://127.0.0.1/api", auth: "none" });
    await expect(f.service.listTools(loopback.serverId)).rejects.toThrow(/public HTTPS/);
    const expired = createMcpTransportProvider({ prepareMcpStdioLaunch: async server => ({
      serverId: server.serverId, sourceDigest: server.sourceDigest, capabilityId: "signed-capability-123",
      launcherPath: process.execPath, launcherArgs: [], cwd: directory, expiresAt: Date.now() - 1,
      effectiveProfile: { networkAllowed: false, readableRoots: [], writableRoots: [] } }) });
    await expect(expired(local, new AbortController().signal)).rejects.toThrow(/invalid or expired/);
    const path = join(directory, "bundle.mcpb");
    writeFileSync(path, "one");
    const bundle: OutboundMcpServer = { ...local, source: { kind: "bundle", path,
      sha256: createHash("sha256").update("two").digest("hex"), format: "mcpb" } };
    bundle.sourceDigest = createHash("sha256").update(JSON.stringify(bundle.source)).digest("hex");
    await expect(expired(bundle, new AbortController().signal)).rejects.toThrow(/changed since approval/);
  } finally { f.db.close(); rmSync(directory, { recursive: true, force: true }); }
});

it("lets a scoped agent call only a grant for its current Space and task revision", async () => {
  const db = openDb(":memory:"), repo = new Repo(db), events = new EventBus(repo);
  const tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Scoped MCP");
  const other = tasks.createWorkspace("Other Space");
  const task = tasks.create({ workspaceId: workspace.workspaceId, title: "Read", objective: "Read",
    criteria: [{ criterionId: "read", description: "Read", verification: "manual" }] });
  const calls: { method: string; url: string; authorization: string | null; redirect: RequestRedirect | undefined }[] = [];
  const provider = createMcpTransportProvider(undefined, protocolFetch(calls));
  const service = new OutboundMcpService(repo, provider);
  const server = await service.register({ workspaceId: workspace.workspaceId, name: "Reviewed",
    source: { kind: "remote", url: "https://mcp.example.test/api", auth: "none" } });
  service.approve(server.serverId, server.sourceDigest);
  const grant = service.grant({ serverId: server.serverId, toolName: "read",
    scope: { kind: "task", taskId: task.taskId, revision: task.revision }, mode: "standing", outputTokenLimit: 100 });
  const invoke = makeInvoker({ repo, events, mcpTransportProvider: provider, runs: {
    pageOwnership: { snapshot: () => ({}) },
  } } as unknown as Services);
  const scope = { kind: "task" as const, workspaceId: workspace.workspaceId, taskId: task.taskId };
  const client = { external: true, connectionId: "scoped", scope };
  const input = { grantId: grant.grantId, arguments: {},
    context: { workspaceId: workspace.workspaceId, taskId: task.taskId, revision: task.revision } };
  try {
    await expect(invoke("mcp.tools.call", input, { external: true })).rejects.toMatchObject({ code: "permission_denied" });
    await expect(invoke("mcp.tools.call", { ...input, context: { ...input.context, workspaceId: other.workspaceId } }, client))
      .rejects.toMatchObject({ code: "permission_denied" });
    await expect(invoke("mcp.tools.call", { ...input, context: { ...input.context, revision: task.revision + 1 } }, client))
      .rejects.toMatchObject({ code: "conflict" });
    expect(await invoke("mcp.tools.call", input, client)).toMatchObject({ status: "completed" });
    expect(calls.some(call => call.method === "POST")).toBe(true);
    service.revokeGrant(grant.grantId);
    await expect(invoke("mcp.tools.call", input, client)).rejects.toMatchObject({ code: "permission_denied" });
  } finally { db.close(); }
});

it("aborts an in-flight HTTPS tool request when its grant is revoked", async () => {
  const calls: { method: string; url: string; authorization: string | null; redirect: RequestRedirect | undefined }[] = [];
  const base = protocolFetch(calls);
  let reached!: () => void;
  const sent = new Promise<void>(resolve => { reached = resolve; });
  let aborted = false;
  const networkFetch: typeof fetch = (input, init) => {
    if (String(init?.body ?? "").includes('"tools/call"')) {
      reached();
      return new Promise((_, reject) => init?.signal?.addEventListener("abort", () => {
        aborted = true;
        reject(new DOMException("Request aborted", "AbortError"));
      }, { once: true }));
    }
    return base(input, init);
  };
  const f = fixture(createMcpTransportProvider(undefined, networkFetch));
  try {
    const server = await f.approve({ kind: "remote", url: "https://mcp.example.test/api", auth: "none" });
    const grant = f.service.grant({ serverId: server.serverId, toolName: "read",
      scope: { kind: "workspace", workspaceId: f.workspaceId }, mode: "once", outputTokenLimit: 100 });
    const pending = f.service.callTool(grant.grantId, {}, { workspaceId: f.workspaceId });
    await sent;
    f.service.revokeGrant(grant.grantId);
    expect((await pending).status).toBe("uncertain");
    expect(aborted).toBe(true);
  } finally { f.db.close(); }
});
