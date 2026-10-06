import { createHash, randomUUID } from "node:crypto";
import { open, realpath } from "node:fs/promises";
import { Client, type Transport } from "@modelcontextprotocol/client";
import {
  AuxError,
  OutboundMcpToolToggleParams,
  OutboundMcpRegisterParams,
  OutboundMcpServerSchema,
  OutboundMcpToolSchema,
  type OutboundMcpServer,
} from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import { inspectMcpBundle } from "./mcp-bundle.js";

type ServerRow = { body: string; state: OutboundMcpServer["state"]; updated_at: number };
type BundleRow = { sha256: string; archive_base64: string };
export type McpTransportProvider = (
  server: OutboundMcpServer,
  signal: AbortSignal,
  bundleBytes?: Buffer,
) => Promise<Transport>;

async function readBoundedBundle(path: string): Promise<Buffer> {
  const file = await open(path, "r");
  try {
    const info = await file.stat();
    if (!info.isFile() || info.size > 20_000_000)
      throw new AuxError("invalid_params", "Bundle must be a regular file under 20 MB.");
    const chunks: Buffer[] = [];
    const chunk = Buffer.allocUnsafe(64_000);
    let size = 0;
    for (;;) {
      const { bytesRead } = await file.read(chunk, 0, Math.min(chunk.length, 20_000_001 - size));
      if (!bytesRead) return Buffer.concat(chunks, size);
      size += bytesRead;
      if (size > 20_000_000) throw new AuxError("invalid_params", "Bundle grew beyond 20 MB while reading.");
      chunks.push(Buffer.from(chunk.subarray(0, bytesRead)));
    }
  } finally {
    await file.close();
  }
}

/** User-connected MCP sources, tool toggles, calls, and revocation. */
export class OutboundMcpService {
  private active = new Map<string, Set<AbortController>>();

  constructor(
    private repo: Repo,
    private transportProvider?: McpTransportProvider,
  ) {
    repo.db
      .prepare("UPDATE outbound_mcp_calls SET status='uncertain',ended_at=? WHERE status='invoking'")
      .run(Date.now());
  }

  async register(raw: unknown): Promise<OutboundMcpServer> {
    const input = OutboundMcpRegisterParams.parse(raw);
    if (!this.repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(input.workspaceId))
      throw new AuxError("not_found", "Space does not exist");
    const source =
      input.source.kind === "local"
        ? {
            ...input.source,
            command: await realpath(input.source.command),
            cwd: await realpath(input.source.cwd),
          }
        : input.source.kind === "bundle"
          ? { ...input.source, path: await realpath(input.source.path) }
          : input.source;
    let bundleBytes: Buffer | undefined;
    if (source.kind === "bundle") {
      const inspected = await this.inspectBundle(source.path);
      if (inspected.sha256 !== source.sha256 || inspected.format !== source.format)
        throw new AuxError("conflict", "Bundle contents changed. Inspect it again.");
      bundleBytes = await readBoundedBundle(source.path);
      if (createHash("sha256").update(bundleBytes).digest("hex") !== source.sha256)
        throw new AuxError("conflict", "Bundle contents changed. Inspect it again.");
    }
    const now = Date.now();
    const server = OutboundMcpServerSchema.parse({
      ...input,
      source,
      serverId: randomUUID(),
      state: "active",
      toolsRevision: 0,
      disabledTools: [],
      toolNames: [],
      sourceDigest: createHash("sha256").update(JSON.stringify(source)).digest("hex"),
      createdAt: now,
      updatedAt: now,
    });
    this.repo.db.exec("BEGIN IMMEDIATE");
    try {
      this.repo.db
        .prepare(
          "INSERT INTO outbound_mcp_servers(server_id,workspace_id,state,body,created_at,updated_at) VALUES(?,?,?,?,?,?)",
        )
        .run(server.serverId, server.workspaceId, server.state, JSON.stringify(server), now, now);
      if (bundleBytes && source.kind === "bundle")
        this.repo.db
          .prepare(
            "INSERT INTO outbound_mcp_bundles(server_id,sha256,archive_base64,installed_at) VALUES(?,?,?,?)",
          )
          .run(server.serverId, source.sha256, bundleBytes.toString("base64"), now);
      this.repo.db.exec("COMMIT");
    } catch (error) {
      this.repo.db.exec("ROLLBACK");
      throw error;
    }
    return server;
  }

  async inspectBundle(path: string) {
    const format = path.toLowerCase().endsWith(".mcpb")
      ? "mcpb"
      : path.toLowerCase().endsWith(".dxt")
        ? "dxt"
        : null;
    if (!format) throw new AuxError("invalid_params", "Choose a .mcpb or .dxt bundle.");
    const canonicalPath = await realpath(path);
    const bytes = await readBoundedBundle(canonicalPath);
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    const manifest = await inspectMcpBundle(bytes);
    return { path: canonicalPath, sha256, format, name: manifest.name, server: manifest.server };
  }

  get(serverId: string): OutboundMcpServer {
    const row = this.repo.db
      .prepare("SELECT body,state,updated_at FROM outbound_mcp_servers WHERE server_id=?")
      .get(serverId) as ServerRow | undefined;
    if (!row) throw new AuxError("not_found", "MCP server does not exist");
    return OutboundMcpServerSchema.parse({
      ...JSON.parse(row.body),
      state: row.state,
      updatedAt: row.updated_at,
    });
  }

  list(workspaceId: string): OutboundMcpServer[] {
    return (
      this.repo.db
        .prepare("SELECT server_id FROM outbound_mcp_servers WHERE workspace_id=? ORDER BY created_at DESC")
        .all(workspaceId) as { server_id: string }[]
    ).map((row) => this.get(row.server_id));
  }

  revoke(serverId: string): OutboundMcpServer {
    this.get(serverId);
    this.repo.db
      .prepare("UPDATE outbound_mcp_servers SET state='revoked',updated_at=? WHERE server_id=?")
      .run(Date.now(), serverId);
    this.cancelActive(serverId);
    this.repo.db.prepare("DELETE FROM outbound_mcp_bundles WHERE server_id=?").run(serverId);
    return this.get(serverId);
  }

  private installedBundle(server: OutboundMcpServer): Buffer {
    if (server.source.kind !== "bundle") throw new AuxError("invalid_params", "Server is not a bundle.");
    const row = this.repo.db
      .prepare("SELECT sha256,archive_base64 FROM outbound_mcp_bundles WHERE server_id=?")
      .get(server.serverId) as BundleRow | undefined;
    if (!row || row.sha256 !== server.source.sha256 || row.archive_base64.length > 40_000_000)
      throw new AuxError("conflict", "Installed MCP bundle is missing or changed. Review a new source.");
    const encoded = row.archive_base64;
    if (encoded.length > 26_666_668 || !/^[A-Za-z0-9+/]*={0,2}$/.test(encoded))
      throw new AuxError("conflict", "Installed MCP bundle is invalid. Review a new source.");
    const bytes = Buffer.from(encoded, "base64");
    if (
      bytes.length > 20_000_000 ||
      bytes.toString("base64") !== encoded ||
      createHash("sha256").update(bytes).digest("hex") !== server.source.sha256
    )
      throw new AuxError("conflict", "Installed MCP bundle changed. Review a new source.");
    return bytes;
  }

  cancelActive(serverId: string): void {
    for (const controller of this.active.get(serverId) ?? []) controller.abort();
  }

  setEnabled(raw: unknown): OutboundMcpServer {
    const input = OutboundMcpToolToggleParams.parse(raw);
    this.repo.db.exec("BEGIN IMMEDIATE");
    try {
      const server = this.get(input.serverId);
      if (server.state !== "active" || server.toolsRevision !== input.expectedRevision)
        throw new AuxError("conflict", "MCP tools changed. Refresh this connection.");
      if (!server.toolNames.includes(input.toolName))
        throw new AuxError("not_found", "Refresh the server's tool catalog first.");
      const disabled = new Set(server.disabledTools);
      if (input.enabled) disabled.delete(input.toolName);
      else disabled.add(input.toolName);
      const next = {
        ...server,
        disabledTools: [...disabled].sort(),
        toolsRevision: server.toolsRevision + 1,
        updatedAt: Date.now(),
      };
      this.saveServer(next);
      this.repo.db.exec("COMMIT");
      this.cancelActive(server.serverId);
      return next;
    } catch (error) {
      this.repo.db.exec("ROLLBACK");
      throw error;
    }
  }

  private saveServer(server: OutboundMcpServer): void {
    this.repo.db
      .prepare("UPDATE outbound_mcp_servers SET body=?,updated_at=? WHERE server_id=?")
      .run(JSON.stringify(server), server.updatedAt, server.serverId);
  }

  private checkCall(
    server: OutboundMcpServer,
    toolName: string,
    context: { workspaceId: string; taskId?: string; revision?: number },
  ): void {
    const current = this.get(server.serverId);
    if (
      current.state !== "active" ||
      current.sourceDigest !== server.sourceDigest ||
      current.toolsRevision !== server.toolsRevision ||
      !current.toolNames.includes(toolName) ||
      current.disabledTools.includes(toolName)
    )
      throw new AuxError("permission_denied", "MCP tool access changed.");
    if (current.workspaceId !== context.workspaceId)
      throw new AuxError("permission_denied", "MCP tool is outside this Space.");
    if ((context.taskId === undefined) !== (context.revision === undefined))
      throw new AuxError("invalid_params", "Task and revision must be supplied together.");
    if (context.taskId) {
      const task = this.repo.db
        .prepare("SELECT workspace_id,revision,state FROM tasks WHERE task_id=?")
        .get(context.taskId) as { workspace_id: string; revision: number; state: string } | undefined;
      if (
        !task ||
        task.state !== "open" ||
        task.workspace_id !== current.workspaceId ||
        task.revision !== context.revision
      )
        throw new AuxError("conflict", "Task revision changed before the tool call.");
    }
  }

  private async connected<T>(
    server: OutboundMcpServer,
    action: (client: Client, signal: AbortSignal) => Promise<T>,
    externalSignal?: AbortSignal,
  ): Promise<T> {
    if (!this.transportProvider)
      throw new AuxError("backend_unavailable", "Supervised MCP transport is unavailable.");
    const controller = new AbortController();
    const abort = () => controller.abort();
    if (externalSignal?.aborted) controller.abort();
    else externalSignal?.addEventListener("abort", abort, { once: true });
    const active = this.active.get(server.serverId) ?? new Set<AbortController>();
    active.add(controller);
    this.active.set(server.serverId, active);
    let transport: Transport | undefined;
    let client: Client | undefined;
    try {
      const current = this.get(server.serverId);
      if (current.state !== "active" || current.sourceDigest !== server.sourceDigest)
        throw new AuxError("permission_denied", "MCP connection was revoked.");
      transport = await this.transportProvider(
        current,
        controller.signal,
        current.source.kind === "bundle" ? this.installedBundle(current) : undefined,
      );
      if (controller.signal.aborted || this.get(server.serverId).state !== "active")
        throw new AuxError("permission_denied", "MCP connection was revoked.");
      client = new Client({ name: "aux", version: "0.1.0" });
      await client.connect(transport);
      return await action(client, controller.signal);
    } finally {
      externalSignal?.removeEventListener("abort", abort);
      active.delete(controller);
      if (!active.size) this.active.delete(server.serverId);
      if (client) await client.close().catch(() => undefined);
      else if (transport) await transport.close().catch(() => undefined);
    }
  }

  async listTools(serverId: string) {
    const server = this.get(serverId);
    if (server.state !== "active") throw new AuxError("permission_denied", "MCP connection is not active.");
    return this.connected(server, async (client, signal) => {
      const tools = [];
      const cursors = new Set<string>();
      let cursor: string | undefined;
      do {
        const page = await client.listTools(cursor ? { cursor } : undefined, {signal});
        tools.push(...page.tools);
        if (Buffer.byteLength(JSON.stringify(tools), "utf8") > 128_000)
          throw new AuxError("invalid_params", "MCP tool catalog exceeds the metadata limit.");
        cursor = page.nextCursor;
        if (cursor && cursors.has(cursor))
          throw new AuxError("invalid_params", "MCP catalog pagination repeated.");
        if (cursor) cursors.add(cursor);
      } while (cursor);
      const current = this.get(serverId);
      if (current.state !== "active" || current.toolsRevision !== server.toolsRevision)
        throw new AuxError("conflict", "MCP tool access changed while listing tools.");
      const catalog = tools.map((tool) => OutboundMcpToolSchema.parse({
        name: tool.name,
        enabled: !current.disabledTools.includes(tool.name),
        description: tool.description?.slice(0, 2000),
        inputSchema: tool.inputSchema,
      }));
      const names = [...new Set(catalog.map(tool => tool.name))].sort();
      if (names.length !== catalog.length)
        throw new AuxError("invalid_params", "MCP tool catalog contains duplicate names.");
      if (JSON.stringify(names) !== JSON.stringify(current.toolNames)) {
        current.toolNames = names;
        current.toolsRevision += 1;
        current.updatedAt = Date.now();
        this.saveServer(current);
        this.cancelActive(serverId);
      }
      return catalog;
    });
  }

  async callTool(
    serverId: string,
    toolName: string,
    args: Record<string, unknown>,
    context: { workspaceId: string; taskId?: string; revision?: number },
    externalSignal?: AbortSignal,
    authorizeDispatch?: () => Promise<() => void>,
  ) {
    if (!this.transportProvider)
      throw new AuxError("backend_unavailable", "Supervised MCP transport is unavailable.");
    const server = this.get(serverId);
    this.checkCall(server, toolName, context);
    if (Buffer.byteLength(JSON.stringify(args), "utf8") > 64_000)
      throw new AuxError("invalid_params", "MCP tool arguments are too large.");
    const callId = randomUUID();
    let invoking = false;
    try {
      const result = await this.connected(
        server,
        async (client, signal) => {
          this.checkCall(server, toolName, context);
          if (signal.aborted) throw new AuxError("permission_denied", "MCP call was cancelled.");
          const checkAuthorization = await authorizeDispatch?.();
          this.checkCall(server, toolName, context);
          if (signal.aborted) throw new AuxError("permission_denied", "MCP call was cancelled.");
          checkAuthorization?.();
          this.repo.db
            .prepare(
              "INSERT INTO outbound_mcp_calls(call_id,server_id,tool_name,status,created_at) VALUES(?,?,?,'invoking',?)",
            )
            .run(callId, serverId, toolName, Date.now());
          invoking = true;
          const output = await client.callTool({ name: toolName, arguments: args }, { signal });
          checkAuthorization?.();
          this.checkCall(server, toolName, context);
          if (signal.aborted) throw new AuxError("permission_denied", "MCP call was cancelled.");
          const serialized = JSON.stringify(output);
          const exceeded = Buffer.byteLength(serialized, "utf8") > 128_000;
          return {
            output: exceeded ? "Tool output exceeded the display limit." : serialized,
            isError: exceeded || Boolean(output.isError),
          };
        },
        externalSignal,
      );
      this.repo.db
        .prepare("UPDATE outbound_mcp_calls SET status='completed',ended_at=? WHERE call_id=?")
        .run(Date.now(), callId);
      return { callId, status: "completed" as const, ...result };
    } catch (error) {
      if (!invoking) throw error;
      this.repo.db
        .prepare("UPDATE outbound_mcp_calls SET status='uncertain',ended_at=? WHERE call_id=?")
        .run(Date.now(), callId);
      return {
        callId,
        status: "uncertain" as const,
        output: "Tool outcome requires reconciliation before retry.",
        isError: true,
      };
    }
  }
}
