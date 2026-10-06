import { createHash, randomUUID } from "node:crypto";
import { open, realpath } from "node:fs/promises";
import { Client, type Transport } from "@modelcontextprotocol/client";
import {
  AuxError,
  OutboundMcpGrantParams,
  OutboundMcpGrantSchema,
  OutboundMcpRegisterParams,
  OutboundMcpServerSchema,
  OutboundMcpToolSchema,
  type OutboundMcpGrant,
  type OutboundMcpServer,
} from "@aux/contracts";
import type { Repo } from "../store/repo.js";
import { inspectMcpBundle } from "./mcp-bundle.js";

type ServerRow = { body: string; state: OutboundMcpServer["state"] };
type GrantRow = { body: string; revoked_at: number | null; consumed_at: number | null };
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

/** Reviewed MCP sources, grants, calls, and revocation. */
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
      state: "pending",
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
        .run(
          server.serverId,
          server.workspaceId,
          server.state,
          this.repo.protectRecordField(
            "outbound_mcp_servers",
            [server.serverId],
            "body",
            JSON.stringify(server),
          ),
          now,
          now,
        );
      if (bundleBytes && source.kind === "bundle")
        this.repo.db
          .prepare(
            "INSERT INTO outbound_mcp_bundles(server_id,sha256,archive_base64,installed_at) VALUES(?,?,?,?)",
          )
          .run(
            server.serverId,
            source.sha256,
            this.repo.protectRecordField(
              "outbound_mcp_bundles",
              [server.serverId],
              "archive_base64",
              bundleBytes.toString("base64"),
            ),
            now,
          );
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
      .prepare("SELECT body,state FROM outbound_mcp_servers WHERE server_id=?")
      .get(serverId) as ServerRow | undefined;
    if (!row) throw new AuxError("not_found", "MCP server does not exist");
    return OutboundMcpServerSchema.parse({
      ...JSON.parse(this.repo.revealRecordField("outbound_mcp_servers", [serverId], "body", row.body)),
      state: row.state,
    });
  }

  list(workspaceId: string): OutboundMcpServer[] {
    return (
      this.repo.db
        .prepare("SELECT server_id FROM outbound_mcp_servers WHERE workspace_id=? ORDER BY created_at DESC")
        .all(workspaceId) as { server_id: string }[]
    ).map((row) => this.get(row.server_id));
  }

  approve(serverId: string, expectedDigest: string): OutboundMcpServer {
    const server = this.get(serverId);
    if (server.state !== "pending" || server.sourceDigest !== expectedDigest)
      throw new AuxError("conflict", "Server source changed. Review it before approval.");
    if (server.source.kind === "bundle") this.installedBundle(server);
    this.repo.db
      .prepare(
        "UPDATE outbound_mcp_servers SET state='approved',updated_at=? WHERE server_id=? AND state='pending'",
      )
      .run(Date.now(), serverId);
    return this.get(serverId);
  }

  revoke(serverId: string): OutboundMcpServer {
    this.get(serverId);
    this.repo.db
      .prepare("UPDATE outbound_mcp_servers SET state='revoked',updated_at=? WHERE server_id=?")
      .run(Date.now(), serverId);
    this.repo.db
      .prepare("UPDATE outbound_mcp_grants SET revoked_at=? WHERE server_id=? AND revoked_at IS NULL")
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
    const encoded = this.repo.revealRecordField(
      "outbound_mcp_bundles",
      [server.serverId],
      "archive_base64",
      row.archive_base64,
    );
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

  grant(raw: unknown): OutboundMcpGrant {
    const input = OutboundMcpGrantParams.parse(raw);
    const server = this.get(input.serverId);
    if (server.state !== "approved")
      throw new AuxError("permission_denied", "Approve the server before granting tools.");
    if (input.scope.kind === "workspace" && input.scope.workspaceId !== server.workspaceId)
      throw new AuxError("permission_denied", "Grant Space does not match the server.");
    if (input.scope.kind === "task") {
      const task = this.repo.db
        .prepare("SELECT workspace_id,revision FROM tasks WHERE task_id=?")
        .get(input.scope.taskId) as { workspace_id: string; revision: number } | undefined;
      if (!task || task.workspace_id !== server.workspaceId || task.revision !== input.scope.revision)
        throw new AuxError("conflict", "Task scope changed. Review the current revision.");
    }
    const grant = OutboundMcpGrantSchema.parse({ ...input, grantId: randomUUID(), createdAt: Date.now() });
    this.repo.db
      .prepare("INSERT INTO outbound_mcp_grants(grant_id,server_id,tool_name,body) VALUES(?,?,?,?)")
      .run(
        grant.grantId,
        grant.serverId,
        grant.toolName,
        this.repo.protectRecordField("outbound_mcp_grants", [grant.grantId], "body", JSON.stringify(grant)),
      );
    return grant;
  }

  getGrant(grantId: string): OutboundMcpGrant {
    const row = this.repo.db
      .prepare("SELECT body,revoked_at,consumed_at FROM outbound_mcp_grants WHERE grant_id=?")
      .get(grantId) as GrantRow | undefined;
    if (!row) throw new AuxError("not_found", "MCP tool grant does not exist");
    return OutboundMcpGrantSchema.parse({
      ...JSON.parse(this.repo.revealRecordField("outbound_mcp_grants", [grantId], "body", row.body)),
      revokedAt: row.revoked_at ?? undefined,
      consumedAt: row.consumed_at ?? undefined,
    });
  }

  grants(serverId: string): OutboundMcpGrant[] {
    this.get(serverId);
    return (
      this.repo.db
        .prepare("SELECT grant_id FROM outbound_mcp_grants WHERE server_id=? ORDER BY rowid DESC")
        .all(serverId) as { grant_id: string }[]
    ).map((row) => this.getGrant(row.grant_id));
  }

  revokeGrant(grantId: string): OutboundMcpGrant {
    const grant = this.getGrant(grantId);
    this.repo.db
      .prepare("UPDATE outbound_mcp_grants SET revoked_at=? WHERE grant_id=? AND revoked_at IS NULL")
      .run(Date.now(), grantId);
    for (const controller of this.active.get(grant.serverId) ?? []) controller.abort();
    return this.getGrant(grantId);
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
      if (current.state !== "approved" || current.sourceDigest !== server.sourceDigest)
        throw new AuxError("permission_denied", "MCP server approval was revoked.");
      transport = await this.transportProvider(
        current,
        controller.signal,
        current.source.kind === "bundle" ? this.installedBundle(current) : undefined,
      );
      if (controller.signal.aborted || this.get(server.serverId).state !== "approved")
        throw new AuxError("permission_denied", "MCP server approval was revoked.");
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
    if (server.state !== "approved") throw new AuxError("permission_denied", "MCP server is not approved.");
    return this.connected(server, async (client) => {
      const { tools } = await client.listTools();
      if (tools.length > 100 || Buffer.byteLength(JSON.stringify(tools), "utf8") > 128_000)
        throw new AuxError("invalid_params", "MCP tool catalog exceeds the review limit.");
      return tools.map((tool) =>
        OutboundMcpToolSchema.parse({
          name: tool.name,
          description: tool.description?.slice(0, 2000),
          inputSchema: tool.inputSchema,
        }),
      );
    });
  }

  async callTool(
    grantId: string,
    args: Record<string, unknown>,
    context: { workspaceId: string; taskId?: string; revision?: number },
    externalSignal?: AbortSignal,
  ) {
    if (!this.transportProvider)
      throw new AuxError("backend_unavailable", "Supervised MCP transport is unavailable.");
    const grant = this.getGrant(grantId);
    const server = this.get(grant.serverId);
    if (server.state !== "approved" || grant.revokedAt || grant.consumedAt)
      throw new AuxError("permission_denied", "MCP tool grant is not active.");
    if (
      server.workspaceId !== context.workspaceId ||
      (grant.scope.kind === "workspace" && grant.scope.workspaceId !== context.workspaceId) ||
      (grant.scope.kind === "task" &&
        (grant.scope.taskId !== context.taskId || grant.scope.revision !== context.revision))
    )
      throw new AuxError("permission_denied", "MCP tool grant does not cover this task and revision.");
    if (grant.scope.kind === "task") {
      const task = this.repo.db
        .prepare("SELECT workspace_id,revision FROM tasks WHERE task_id=?")
        .get(grant.scope.taskId) as { workspace_id: string; revision: number } | undefined;
      if (!task || task.workspace_id !== server.workspaceId || task.revision !== grant.scope.revision)
        throw new AuxError("conflict", "Task revision changed before the tool call.");
    }
    if (JSON.stringify(args).length > 64_000)
      throw new AuxError("invalid_params", "MCP tool arguments are too large.");
    const callId = randomUUID();
    const at = Date.now();
    this.repo.db.exec("BEGIN IMMEDIATE");
    try {
      if (grant.mode === "once") {
        const result = this.repo.db
          .prepare(
            "UPDATE outbound_mcp_grants SET consumed_at=? WHERE grant_id=? AND consumed_at IS NULL AND revoked_at IS NULL",
          )
          .run(at, grantId);
        if (result.changes !== 1) throw new AuxError("permission_denied", "MCP tool grant was already used.");
      } else if (this.getGrant(grantId).revokedAt)
        throw new AuxError("permission_denied", "MCP tool grant was revoked.");
      this.repo.db
        .prepare(
          "INSERT INTO outbound_mcp_calls(call_id,server_id,grant_id,tool_name,status,created_at) VALUES(?,?,?,?,'invoking',?)",
        )
        .run(callId, server.serverId, grantId, grant.toolName, at);
      this.repo.db.exec("COMMIT");
    } catch (error) {
      this.repo.db.exec("ROLLBACK");
      throw error;
    }
    try {
      const result = await this.connected(
        server,
        async (client, signal) => {
          const output = await client.callTool({ name: grant.toolName, arguments: args }, { signal });
          if (
            signal.aborted ||
            this.get(server.serverId).state !== "approved" ||
            this.getGrant(grantId).revokedAt
          )
            throw new AuxError("permission_denied", "MCP tool authority was revoked during execution.");
          const serialized = JSON.stringify(output);
          const exceeded = Buffer.byteLength(serialized, "utf8") > grant.outputTokenLimit * 4;
          return {
            output: exceeded ? "Tool output exceeded the approved limit." : serialized,
            isError: exceeded || Boolean(output.isError),
          };
        },
        externalSignal,
      );
      this.repo.db
        .prepare("UPDATE outbound_mcp_calls SET status='completed',ended_at=? WHERE call_id=?")
        .run(Date.now(), callId);
      return { callId, status: "completed" as const, ...result };
    } catch {
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
