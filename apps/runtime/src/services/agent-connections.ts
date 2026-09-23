import { createHash, randomBytes, randomUUID } from "node:crypto";
import { AgentConnectionCreateParams, AgentConnectionSchema, AuxError, type AgentConnection, type AgentConnectionScope } from "@aux/contracts";
import type { Repo } from "../store/repo.js";

type Row = {
  connection_id: string; name: string; client: "codex" | "claude"; scope_kind: "workspace" | "task";
  workspace_id: string; task_id: string | null; created_at: number; last_used_at: number | null; revoked_at: number | null;
};

export interface ScopedExternalClient {
  external: true;
  connectionId: string;
  scope: AgentConnectionScope;
}

const digest = (token: string) => createHash("sha256").update(token, "utf8").digest("hex");

/** last_used_at is bookkeeping: written at most this often per connection. */
const LAST_USED_WRITE_MS = 60_000;

export class AgentConnectionService {
  /** Active tokens by hash. Revocation goes through this service and evicts, so it takes effect on the next request. */
  private active = new Map<string, { client: ScopedExternalClient; lastUsedWrite: number }>();

  constructor(private repo: Repo) {}

  list(): AgentConnection[] {
    return (this.repo.db.prepare(`SELECT connection_id,name,client,scope_kind,workspace_id,task_id,created_at,last_used_at,revoked_at
      FROM agent_connections ORDER BY created_at DESC,connection_id`).all() as Row[]).map(row => this.record(row));
  }

  create(input: unknown): { connection: AgentConnection; token: string } {
    const value = AgentConnectionCreateParams.parse(input);
    const workspace = this.repo.db.prepare("SELECT 1 FROM workspaces WHERE workspace_id=?").get(value.scope.workspaceId);
    if (!workspace) throw new AuxError("not_found", "Workspace does not exist");
    if (value.scope.kind === "task") {
      const task = this.repo.db.prepare("SELECT workspace_id FROM tasks WHERE task_id=?").get(value.scope.taskId) as { workspace_id: string } | undefined;
      if (!task || task.workspace_id !== value.scope.workspaceId) throw new AuxError("not_found", "Task does not belong to this workspace");
    }
    const token = `auxc_${randomBytes(32).toString("base64url")}`;
    const now = Date.now();
    const connection = AgentConnectionSchema.parse({ connectionId: randomUUID(), name: value.name, client: value.client, scope: value.scope, createdAt: now });
    this.repo.db.prepare(`INSERT INTO agent_connections(connection_id,name,client,scope_kind,workspace_id,task_id,token_hash,created_at)
      VALUES(?,?,?,?,?,?,?,?)`).run(connection.connectionId, connection.name, connection.client, connection.scope.kind,
        connection.scope.workspaceId, connection.scope.kind === "task" ? connection.scope.taskId : null, digest(token), now);
    return { connection, token };
  }

  revoke(connectionId: string): AgentConnection {
    const now = Date.now();
    for (const [hash, entry] of this.active) if (entry.client.connectionId === connectionId) this.active.delete(hash);
    const result = this.repo.db.prepare("UPDATE agent_connections SET revoked_at=? WHERE connection_id=? AND revoked_at IS NULL").run(now, connectionId);
    if (result.changes !== 1) throw new AuxError("not_found", "Active connection does not exist");
    return this.get(connectionId);
  }

  authorize(token: string): ScopedExternalClient | null {
    if (!token.startsWith("auxc_")) return null;
    const hash = digest(token);
    const now = Date.now();
    const cached = this.active.get(hash);
    if (cached) {
      if (now - cached.lastUsedWrite >= LAST_USED_WRITE_MS) {
        cached.lastUsedWrite = now;
        this.touch(cached.client.connectionId, now);
      }
      return cached.client;
    }
    const row = this.repo.db.prepare(`SELECT connection_id,name,client,scope_kind,workspace_id,task_id,created_at,last_used_at,revoked_at
      FROM agent_connections WHERE token_hash=? AND revoked_at IS NULL`).get(hash) as Row | undefined;
    if (!row) return null;
    const client: ScopedExternalClient = { external: true, connectionId: row.connection_id, scope: this.record(row).scope };
    this.active.set(hash, { client, lastUsedWrite: now });
    this.touch(row.connection_id, now);
    return client;
  }

  private touch(connectionId: string, at: number) {
    this.repo.db.prepare("UPDATE agent_connections SET last_used_at=? WHERE connection_id=?").run(at, connectionId);
  }

  private get(connectionId: string): AgentConnection {
    const row = this.repo.db.prepare(`SELECT connection_id,name,client,scope_kind,workspace_id,task_id,created_at,last_used_at,revoked_at
      FROM agent_connections WHERE connection_id=?`).get(connectionId) as Row | undefined;
    if (!row) throw new AuxError("not_found", "Connection does not exist");
    return this.record(row);
  }

  private record(row: Row): AgentConnection {
    return AgentConnectionSchema.parse({
      connectionId: row.connection_id, name: row.name, client: row.client,
      scope: row.scope_kind === "task"
        ? { kind: "task", workspaceId: row.workspace_id, taskId: row.task_id! }
        : { kind: "workspace", workspaceId: row.workspace_id },
      createdAt: row.created_at, lastUsedAt: row.last_used_at ?? undefined, revokedAt: row.revoked_at ?? undefined,
    });
  }
}
