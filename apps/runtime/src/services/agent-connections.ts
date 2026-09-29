import { createHash, randomBytes, randomUUID } from "node:crypto";
import { AgentConnectionCreateParams, AgentConnectionSchema, AuxError, type AgentConnection, type AgentConnectionScope } from "@aux/contracts";
import type { Repo } from "../store/repo.js";

type Row = {
  connection_id: string; name: string; client: "codex" | "claude"; scope_kind: "workspace" | "task" | "session";
  workspace_id: string; task_id: string | null; session_id: string | null;
  created_at: number; last_used_at: number | null; revoked_at: number | null; expires_at: number | null;
};

export interface ScopedExternalClient {
  external: true;
  connectionId: string;
  scope: AgentConnectionScope;
}

const digest = (token: string) => createHash("sha256").update(token, "utf8").digest("hex");

/** last_used_at is bookkeeping: written at most this often per connection. */
const LAST_USED_WRITE_MS = 60_000;

const COLUMNS = `connection_id,name,client,scope_kind,workspace_id,task_id,session_id,created_at,last_used_at,revoked_at,expires_at`;

export class AgentConnectionService {
  /** Active tokens by hash. Revocation goes through this service and evicts, so it takes effect on the next request. */
  private active = new Map<string, { client: ScopedExternalClient; expiresAt?: number; lastUsedWrite: number }>();

  constructor(private repo: Repo) {}

  list(): AgentConnection[] {
    return (this.repo.db.prepare(`SELECT ${COLUMNS}
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
    if (value.scope.kind === "session") {
      const session = this.repo.db.prepare("SELECT 1 FROM sessions WHERE session_id=?").get(value.scope.sessionId);
      if (!session) throw new AuxError("not_found", "Browser session does not exist");
    }
    if (value.expiresAt !== undefined && value.expiresAt <= Date.now())
      throw new AuxError("invalid_params", "expiresAt must be in the future");
    const token = `auxc_${randomBytes(32).toString("base64url")}`;
    const now = Date.now();
    const connection = AgentConnectionSchema.parse({
      connectionId: randomUUID(), name: value.name, client: value.client, scope: value.scope,
      createdAt: now, expiresAt: value.expiresAt,
    });
    this.repo.db.prepare(`INSERT INTO agent_connections(connection_id,name,client,scope_kind,workspace_id,task_id,session_id,token_hash,created_at,expires_at)
      VALUES(?,?,?,?,?,?,?,?,?,?)`).run(connection.connectionId,
        this.repo.protectRecordField("agent_connections", [connection.connectionId], "name", connection.name), connection.client, connection.scope.kind,
        connection.scope.workspaceId,
        connection.scope.kind === "task" ? connection.scope.taskId : null,
        connection.scope.kind === "session" ? connection.scope.sessionId : null,
        digest(token), now, connection.expiresAt ?? null);
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
      if (cached.expiresAt !== undefined && cached.expiresAt <= now) {
        this.active.delete(hash);
        return null;
      }
      if (now - cached.lastUsedWrite >= LAST_USED_WRITE_MS) {
        cached.lastUsedWrite = now;
        this.touch(cached.client.connectionId, now);
      }
      return cached.client;
    }
    const row = this.repo.db.prepare(`SELECT ${COLUMNS}
      FROM agent_connections WHERE token_hash=? AND revoked_at IS NULL
      AND (expires_at IS NULL OR expires_at > ?)`).get(hash, now) as Row | undefined;
    if (!row) return null;
    const record = this.record(row);
    const client: ScopedExternalClient = { external: true, connectionId: row.connection_id, scope: record.scope };
    this.active.set(hash, { client, expiresAt: record.expiresAt, lastUsedWrite: now });
    this.touch(row.connection_id, now);
    return client;
  }

  private touch(connectionId: string, at: number) {
    this.repo.db.prepare("UPDATE agent_connections SET last_used_at=? WHERE connection_id=?").run(at, connectionId);
  }

  private get(connectionId: string): AgentConnection {
    const row = this.repo.db.prepare(`SELECT ${COLUMNS}
      FROM agent_connections WHERE connection_id=?`).get(connectionId) as Row | undefined;
    if (!row) throw new AuxError("not_found", "Connection does not exist");
    return this.record(row);
  }

  private record(row: Row): AgentConnection {
    return AgentConnectionSchema.parse({
      connectionId: row.connection_id,
      name: this.repo.revealRecordField("agent_connections", [row.connection_id], "name", row.name), client: row.client,
      scope: row.scope_kind === "task"
        ? { kind: "task", workspaceId: row.workspace_id, taskId: row.task_id! }
        : row.scope_kind === "session"
          ? { kind: "session", workspaceId: row.workspace_id, sessionId: row.session_id! }
          : { kind: "workspace", workspaceId: row.workspace_id },
      createdAt: row.created_at, lastUsedAt: row.last_used_at ?? undefined,
      expiresAt: row.expires_at ?? undefined, revokedAt: row.revoked_at ?? undefined,
    });
  }
}
