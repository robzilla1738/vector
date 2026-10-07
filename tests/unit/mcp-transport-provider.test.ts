import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { createHash } from "node:crypto";
import { mkdtempSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import JSZip from "jszip";
import {
  AgentConnectionService,
  ExternalSessionService,
  SettingsService,
  createMcpTransportProvider,
  EventBus,
  makeInvoker,
  openDb,
  OutboundMcpService,
  Repo,
  TaskService,
  type Services,
} from "@aux/runtime";
import type { OutboundMcpServer } from "@aux/contracts";

function fixture(provider: ReturnType<typeof createMcpTransportProvider>) {
  const db = openDb(":memory:"),
    repo = new Repo(db);
  const workspaceId = new TaskService(repo, new EventBus(repo)).createWorkspace("MCP transport").workspaceId;
  const service = new OutboundMcpService(repo, provider);
  return {
    db,
    workspaceId,
    service,
    async connect(source: OutboundMcpServer["source"]) {
      const server = await service.register({ workspaceId, name: "Fixture", source });
      return server;
    },
  };
}

function protocolFetch(
  calls: {
    method: string;
    url: string;
    authorization: string | null;
    redirect: RequestRedirect | undefined;
  }[],
) {
  const fetcher: typeof fetch = async (input, init) => {
    const url = input instanceof Request ? input.url : String(input);
    const method = init?.method ?? (input instanceof Request ? input.method : "GET");
    const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
    calls.push({ method, url, authorization: headers.get("authorization"), redirect: init?.redirect });
    if (method === "GET") return new Response(null, { status: 405 });
    const body = JSON.parse(String(init?.body ?? "{}"));
    if (body.id === undefined) return new Response(null, { status: 202 });
    const result =
      body.method === "initialize"
        ? {
            protocolVersion: body.params.protocolVersion,
            capabilities: { tools: {} },
            serverInfo: { name: "fixture", version: "1" },
          }
        : body.method === "tools/list"
          ? { tools: [{ name: "read", inputSchema: { type: "object", properties: {} } }] }
          : { content: [{ type: "text", text: "done" }] };
    return Response.json({ jsonrpc: "2.0", id: body.id, result });
  };
  return fetcher;
}

it("uses the approved HTTPS origin without redirects and no ambient credential", async () => {
  const calls: {
    method: string;
    url: string;
    authorization: string | null;
    redirect: RequestRedirect | undefined;
  }[] = [];
  const f = fixture(createMcpTransportProvider(undefined, protocolFetch(calls)));
  try {
    const server = await f.connect({ kind: "remote", url: "https://mcp.example.test/api", auth: "none" });
    expect(await f.service.listTools(server.serverId)).toMatchObject([{ name: "read" }]);
    expect(calls.some((call) => call.method === "POST")).toBe(true);

    expect(
      calls.every(
        (call) =>
          new URL(call.url).origin === "https://mcp.example.test" &&
          call.redirect === "error" &&
          call.authorization === null,
      ),
    ).toBe(true);
  } finally {
    f.db.close();
  }
});

it("fetches an OAuth token only for the approved remote server", async () => {
  const calls: {
    method: string;
    url: string;
    authorization: string | null;
    redirect: RequestRedirect | undefined;
  }[] = [];
  let current: "valid" | "wrong" = "valid";
  const oauth = {
    token: async (server: OutboundMcpServer) => {
      if (current === "wrong" || server.source.kind !== "remote")
        throw new Error("credential does not match");
      return "ephemeral-token";
    },
  };
  const f = fixture(createMcpTransportProvider(oauth, protocolFetch(calls)));
  try {
    const server = await f.connect({ kind: "remote", url: "https://mcp.example.test/api", auth: "oauth" });
    expect(await f.service.listTools(server.serverId)).toMatchObject([{ name: "read" }]);
    expect(calls.some((call) => call.authorization === "Bearer ephemeral-token")).toBe(true);
    current = "wrong";
    await expect(f.service.listTools(server.serverId)).rejects.toThrow(/credential does not match/);
  } finally {
    f.db.close();
  }
});

it.skipIf(process.platform !== "darwin")(
  "runs a reviewed local server under seatbelt and disables its tool",
  async () => {
    const directory = mkdtempSync(join(tmpdir(), "aux-mcp-launch-"));
    const script = join(directory, "server.mjs");
    writeFileSync(
      script,
      `
import { writeFileSync } from "node:fs";
import { connect } from "node:net";
let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => { input += chunk; let at;
  while ((at = input.indexOf("\\n")) >= 0) {
    const line = input.slice(0, at); input = input.slice(at + 1);
    if (!line.trim()) continue;
    const request = JSON.parse(line);
    if (request.id === undefined) continue;
    let result = request.method === "initialize"
      ? { protocolVersion: request.params.protocolVersion, capabilities: { tools: {} }, serverInfo: { name: "local", version: "1" } }
      : request.method === "tools/list"
        ? { tools: [{ name: "local-read", inputSchema: { type: "object", properties: {} } }] }
        : { content: [{ type: "text", text: "local-done" }] };
    if (request.method === "tools/call") {
      let writeDenied = false;
      try { writeFileSync("sandbox-write", "unsafe"); } catch { writeDenied = true; }
      const socket = connect(54321, "127.0.0.1");
      socket.on("error", error => {
        result = { content: [{ type: "text", text: JSON.stringify({ writeDenied, networkDenied: error.code === "EPERM" }) }] };
        process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: request.id, result }) + "\\n");
      });
      continue;
    }
    process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: request.id, result }) + "\\n");
  }
  });`,
    );
    const alias = join(directory, "reviewed-executable");
    symlinkSync(process.execPath, alias);
    const f = fixture(createMcpTransportProvider());
    try {
      const server = await f.connect({ kind: "local", command: alias, args: [script], cwd: directory });
      expect(server.source.kind === "local" && server.source.command).toBe(process.execPath);
      unlinkSync(alias);
      symlinkSync("/bin/false", alias);
      expect(await f.service.listTools(server.serverId)).toMatchObject([{ name: "local-read" }]);
      const toolName = "local-read";
      await f.service.listTools(server.serverId);
      const result = await f.service.callTool(server.serverId, toolName, {}, { workspaceId: f.workspaceId });
      expect(result.status).toBe("completed");
      expect(result.output).toContain('\\"writeDenied\\":true');
      expect(result.output).toContain('\\"networkDenied\\":true');
      f.service.setEnabled({
        serverId: server.serverId,
        toolName,
        enabled: false,
        expectedRevision: f.service.get(server.serverId).toolsRevision,
      });
      await expect(
        f.service.callTool(server.serverId, toolName, {}, { workspaceId: f.workspaceId }),
      ).rejects.toMatchObject({ code: "permission_denied" });
    } finally {
      f.db.close();
      rmSync(directory, { recursive: true, force: true });
    }
  },
);

it.skipIf(process.platform !== "darwin")(
  "runs an approved self-contained Node bundle under the same sandbox",
  async () => {
    const directory = mkdtempSync(join(tmpdir(), "aux-mcp-archive-"));
    const zip = new JSZip();
    zip.file(
      "manifest.json",
      JSON.stringify({
        name: "Packaged tool",
        server: {
          type: "node",
          entry_point: "server.mjs",
          mcp_config: {
            command: "node",
            args: ["${__dirname}/server.mjs", "--config", "${__dirname}/config.json"],
            env: {},
          },
        },
      }),
    );
    zip.file("config.json", JSON.stringify({ message: "bundle-done" }));
    zip.file(
      "server.mjs",
      `
import { readFileSync } from "node:fs";
const config = JSON.parse(readFileSync(process.argv[3], "utf8"));
let pending = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => { pending += chunk; let boundary;
  while ((boundary = pending.indexOf("\\n")) >= 0) {
    const line = pending.slice(0, boundary); pending = pending.slice(boundary + 1);
    if (!line.trim()) continue;
    const request = JSON.parse(line);
    if (request.id === undefined) continue;
    const result = request.method === "initialize"
      ? { protocolVersion: request.params.protocolVersion, capabilities: { tools: {} }, serverInfo: { name: "bundle", version: "1" } }
      : request.method === "tools/list"
        ? { tools: [{ name: "packaged-read", inputSchema: { type: "object", properties: {} } }] }
      : { content: [{ type: "text", text: config.message }] };
    process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: request.id, result }) + "\\n");
  }
});`,
    );
    const path = join(directory, "packaged.mcpb");
    const bytes = await zip.generateAsync({ type: "nodebuffer" });
    writeFileSync(path, bytes);
    const f = fixture(createMcpTransportProvider());
    try {
      const server = await f.connect({
        kind: "bundle",
        path,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        format: "mcpb",
      });
      expect(await f.service.listTools(server.serverId)).toMatchObject([{ name: "packaged-read" }]);
      const toolName = "packaged-read";
      await f.service.listTools(server.serverId);
      const result = await f.service.callTool(server.serverId, toolName, {}, { workspaceId: f.workspaceId });
      expect(result).toMatchObject({ status: "completed", isError: false });
      expect(result.output).toContain("bundle-done");
    } finally {
      f.db.close();
      rmSync(directory, { recursive: true, force: true });
    }
  },
);

it.skipIf(process.platform !== "darwin")(
  "does not pass host identity or PATH into an approved Node bundle",
  async () => {
    expect(process.env.HOME).toBeTruthy();
    expect(process.env.USER).toBeTruthy();
    expect(process.env.PATH).toBeTruthy();
    const directory = mkdtempSync(join(tmpdir(), "aux-mcp-env-"));
    const zip = new JSZip();
    zip.file(
      "manifest.json",
      JSON.stringify({ name: "Env probe", server: { type: "node", entry_point: "server.mjs" } }),
    );
    zip.file(
      "server.mjs",
      `
let pending = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", chunk => { pending += chunk; let boundary;
  while ((boundary = pending.indexOf("\\n")) >= 0) {
    const line = pending.slice(0, boundary); pending = pending.slice(boundary + 1);
    if (!line.trim()) continue;
    const request = JSON.parse(line);
    if (request.id === undefined) continue;
    const seen = { home: process.env.HOME ?? null, user: process.env.USER ?? null,
      path: process.env.PATH ?? null, shell: process.env.SHELL ?? null,
      logname: process.env.LOGNAME ?? null, term: process.env.TERM ?? null };
    const result = request.method === "initialize"
      ? { protocolVersion: request.params.protocolVersion, capabilities: { tools: {} }, serverInfo: { name: "bundle", version: "1" } }
      : request.method === "tools/list"
        ? { tools: [{ name: "env", inputSchema: { type: "object", properties: {} } }] }
      : { content: [{ type: "text", text: JSON.stringify(seen) }] };
    process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: request.id, result }) + "\\n");
  }
});`,
    );
    const path = join(directory, "env.mcpb");
    const bytes = await zip.generateAsync({ type: "nodebuffer" });
    writeFileSync(path, bytes);
    const f = fixture(createMcpTransportProvider());
    try {
      const server = await f.connect({
        kind: "bundle",
        path,
        sha256: createHash("sha256").update(bytes).digest("hex"),
        format: "mcpb",
      });
      const toolName = "env";
      await f.service.listTools(server.serverId);
      const result = await f.service.callTool(server.serverId, toolName, {}, { workspaceId: f.workspaceId });
      expect(result).toMatchObject({ status: "completed", isError: false });
      const body = JSON.parse(result.output) as { content: { type: string; text: string }[] };
      const seen = JSON.parse(body.content[0]?.text ?? "{}") as Record<string, string | null>;
      expect(seen).toEqual({ home: null, user: null, path: null, shell: null, logname: null, term: null });
      expect(result.output).not.toContain(process.env.HOME);
    } finally {
      f.db.close();
      rmSync(directory, { recursive: true, force: true });
    }
  },
);

it("fails closed for unbounded local roots, local URLs, and changed bundles", async () => {
  const f = fixture(createMcpTransportProvider());
  const directory = mkdtempSync(join(tmpdir(), "aux-mcp-deny-"));
  try {
    const local = await f.connect({ kind: "local", command: "/bin/echo", args: [], cwd: "/" });
    await expect(createMcpTransportProvider()(local, new AbortController().signal)).rejects.toThrow(
      /bounded working directory|requires macOS/,
    );
    const oauth = await f.connect({ kind: "remote", url: "https://mcp.example.test/api", auth: "oauth" });
    await expect(f.service.listTools(oauth.serverId)).rejects.toThrow(/OAuth is unavailable/);
    const loopback = await f.connect({ kind: "remote", url: "https://127.0.0.1/api", auth: "none" });
    await expect(f.service.listTools(loopback.serverId)).rejects.toThrow(/public HTTPS/);
    const path = join(directory, "bundle.mcpb");
    writeFileSync(path, "one");
    const bundle: OutboundMcpServer = {
      ...local,
      source: {
        kind: "bundle",
        path,
        sha256: createHash("sha256").update("two").digest("hex"),
        format: "mcpb",
      },
    };
    bundle.sourceDigest = createHash("sha256").update(JSON.stringify(bundle.source)).digest("hex");
    await expect(createMcpTransportProvider()(bundle, new AbortController().signal)).rejects.toThrow(
      /changed since approval/,
    );
  } finally {
    f.db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

it("lets a scoped agent call only a connected tool in its current Space and task revision", async () => {
  const db = openDb(":memory:"),
    repo = new Repo(db),
    events = new EventBus(repo);
  const tasks = new TaskService(repo, events);
  const workspace = tasks.createWorkspace("Scoped MCP");
  const other = tasks.createWorkspace("Other Space");
  const task = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Read",
    objective: "Read",
    criteria: [{ criterionId: "read", description: "Read", verification: "manual" }],
  });
  const calls: {
    method: string;
    url: string;
    authorization: string | null;
    redirect: RequestRedirect | undefined;
  }[] = [];
  const provider = createMcpTransportProvider(undefined, protocolFetch(calls));
  const service = new OutboundMcpService(repo, provider);
  const server = await service.register({
    workspaceId: workspace.workspaceId,
    name: "Reviewed",
    source: { kind: "remote", url: "https://mcp.example.test/api", auth: "none" },
  });

  const toolName = "read";
  await service.listTools(server.serverId);
  const directory = mkdtempSync(join(tmpdir(), "aux-scoped-mcp-policy-"));
  const settings = new SettingsService(repo, join(directory, "settings.json"), {});
  await settings.set({ agentMode: "auto", agentPolicyRevision: 0 });
  const turnMentions = fixtureTurnMentions((pageId) => repo.getPage(pageId));
  const agentConnections = new AgentConnectionService(repo);
  const externalSessions = new ExternalSessionService(repo, events, turnMentions, async () => {});
  const scope = { kind: "task" as const, workspaceId: workspace.workspaceId, taskId: task.taskId };
  const created = agentConnections.create({ name: "MCP fixture", client: "codex", scope });
  const client = agentConnections.authorize(created.token)!;
  const invoke = makeInvoker({
    repo,
    events,
    settings,
    turnMentions,
    agentConnections,
    externalSessions,
    outboundMcp: service,
    mcpTransportProvider: provider,
    runs: { pageOwnership: { snapshot: () => ({}) } },
  } as unknown as Services);
  const input = {
    serverId: server.serverId,
    toolName,
    arguments: {},
    context: { workspaceId: workspace.workspaceId, taskId: task.taskId, revision: task.revision },
  };
  try {
    await expect(invoke("mcp.tools.call", input, { external: true })).rejects.toMatchObject({
      code: "permission_denied",
    });
    await expect(
      invoke(
        "mcp.tools.call",
        { ...input, context: { ...input.context, workspaceId: other.workspaceId } },
        client,
      ),
    ).rejects.toMatchObject({ code: "permission_denied" });
    await expect(
      invoke(
        "mcp.tools.call",
        { ...input, context: { ...input.context, revision: task.revision + 1 } },
        client,
      ),
    ).rejects.toMatchObject({ code: "conflict" });
    expect(await invoke("mcp.tools.call", input, client)).toMatchObject({ status: "completed" });
    expect(calls.some((call) => call.method === "POST")).toBe(true);
    const run = repo.conversationRuns(`external:${client.connectionId}`)[0]!;
    expect(run).toMatchObject({
      status: "running",
      config: { externalConnectionId: client.connectionId, taskId: task.taskId },
    });
    expect(repo.db.prepare("SELECT count(*) AS n FROM outbound_mcp_calls").get()).toMatchObject({ n: 1 });
    await settings.set({ agentMode: "ask", agentPolicyRevision: settings.agentPolicy().agentPolicyRevision });
    await expect(invoke("mcp.tools.call", input, client)).rejects.toMatchObject({ code: "needs_input" });
    expect(repo.getRun(run.runId)?.status).toBe("needs_input");
    expect(repo.db.prepare("SELECT count(*) AS n FROM outbound_mcp_calls").get()).toMatchObject({ n: 1 });
    const pending = repo.db
      .prepare("SELECT run_id,turn_id,kind,approval_id FROM safety_suspensions WHERE state='pending'")
      .all();
    expect(pending).toEqual([
      expect.objectContaining({ run_id: run.runId, turn_id: run.runId, kind: "approval", approval_id: expect.any(String) }),
    ]);
    const decision = repo.db
      .prepare("SELECT request_json FROM safety_decisions ORDER BY rowid DESC LIMIT 1")
      .get() as { request_json: string };
    expect(JSON.parse(decision.request_json)).toMatchObject({
      runId: run.runId,
      action: "mcp.tools.call",
      recipient: `mcp:${server.serverId}:read`,
    });
    service.setEnabled({
      serverId: server.serverId,
      toolName,
      enabled: false,
      expectedRevision: service.get(server.serverId).toolsRevision,
    });
    await expect(invoke("mcp.tools.call", input, client)).rejects.toMatchObject({
      code: "permission_denied",
    });
  } finally {
    invoke.dispose();
    db.close();
    rmSync(directory, { recursive: true, force: true });
  }
});

it("aborts an in-flight HTTPS tool request when its tool is disabled", async () => {
  const calls: {
    method: string;
    url: string;
    authorization: string | null;
    redirect: RequestRedirect | undefined;
  }[] = [];
  const base = protocolFetch(calls);
  let reached!: () => void;
  const sent = new Promise<void>((resolve) => {
    reached = resolve;
  });
  let aborted = false;
  const networkFetch: typeof fetch = (input, init) => {
    if (String(init?.body ?? "").includes('"tools/call"')) {
      reached();
      return new Promise((_, reject) =>
        init?.signal?.addEventListener(
          "abort",
          () => {
            aborted = true;
            reject(new DOMException("Request aborted", "AbortError"));
          },
          { once: true },
        ),
      );
    }
    return base(input, init);
  };
  const f = fixture(createMcpTransportProvider(undefined, networkFetch));
  try {
    const server = await f.connect({ kind: "remote", url: "https://mcp.example.test/api", auth: "none" });
    const toolName = "read";
    await f.service.listTools(server.serverId);
    const pending = f.service.callTool(server.serverId, toolName, {}, { workspaceId: f.workspaceId });
    await sent;
    f.service.setEnabled({
      serverId: server.serverId,
      toolName,
      enabled: false,
      expectedRevision: f.service.get(server.serverId).toolsRevision,
    });
    expect((await pending).status).toBe("uncertain");
    expect(aborted).toBe(true);
  } finally {
    f.db.close();
  }
});
