import { randomUUID } from "node:crypto";
import { RunSchema, type AgentConnectionScope, type Run } from "@aux/contracts";
import type { EventBus } from "../events.js";
import type { Repo } from "../store/repo.js";

/** An external session goes quiet this long → its run completes. */
export const EXTERNAL_SESSION_IDLE_MS = 10 * 60_000;
const ACTIVE_STATUSES = ["queued", "planning", "running", "paused", "needs_input"] as const;
const ACTIVE = new Set<string>(ACTIVE_STATUSES);
const ACTIVE_SQL = ACTIVE_STATUSES.map((status) => `'${status}'`).join(",");

type ConnectionRow = {
  name: string;
  scope_kind: string;
  task_id: string | null;
  expires_at: number | null;
  revoked_at: number | null;
};

/**
 * S6.7 — every scoped external connection owns a first-class Run, so an
 * agent over MCP/SDK shows the same presence in Tasks (active status, the
 * pages it is working) and trails the same approvals/ledger rows as a
 * built-in agent run. One active run per connection; a new session after a
 * terminal run starts a new run under the same `external:<id>` chat.
 */
export class ExternalSessionService {
  private active = new Map<string, string>();
  private lastActivity = new Map<string, number>();

  constructor(
    private repo: Repo,
    private events: EventBus,
  ) {}

  private connectionRow(connectionId: string): ConnectionRow | undefined {
    return this.repo.db
      .prepare(
        `SELECT name,scope_kind,task_id,expires_at,revoked_at FROM agent_connections WHERE connection_id=?`,
      )
      .get(connectionId) as ConnectionRow | undefined;
  }

  private activeRunId(connectionId: string): string | undefined {
    const row = this.repo.db
      .prepare(
        `SELECT run_id AS runId FROM runs
         WHERE json_extract((SELECT config FROM run_lookup WHERE run_lookup.run_id=runs.run_id),'$.externalConnectionId')=?
         AND status IN (${ACTIVE_SQL}) ORDER BY created_at DESC LIMIT 1`,
      )
      .get(connectionId) as { runId: string } | undefined;
    return row?.runId;
  }

  /** The live session run for a connection — created on first dispatch. */
  ensure(client: { connectionId: string; scope: AgentConnectionScope }, now = Date.now()): string | undefined {
    const row = this.connectionRow(client.connectionId);
    if (!row || row.revoked_at !== null) {
      this.end(client.connectionId, "cancelled", row ? "Connection revoked" : "Connection removed");
      return undefined;
    }
    if (row.expires_at !== null && row.expires_at <= now) {
      this.end(client.connectionId, "completed", "Connection expired");
      return undefined;
    }
    this.lastActivity.set(client.connectionId, now);
    const cached = this.active.get(client.connectionId);
    if (cached && ACTIVE.has(this.repo.getRun(cached)?.status ?? "")) return cached;
    this.active.delete(client.connectionId);
    // A still-active session run in the store resumes instead of duplicating
    // (the in-memory map was rebuilt, or this is a later call in-process).
    const resumed = this.activeRunId(client.connectionId);
    const runId = resumed ?? `extrun_${randomUUID()}`;
    this.active.set(client.connectionId, runId);
    if (!resumed) {
      const run = RunSchema.parse({
        runId,
        goal: `${row.name} — external agent session`,
        status: "running",
        pageIds: [],
        config: {
          implementation: "external-agent",
          externalConnectionId: client.connectionId,
          chatId: `external:${client.connectionId}`,
          ...(client.scope.kind === "task" ? { taskId: client.scope.taskId } : {}),
        },
        startedAt: now,
        createdAt: now,
      });
      this.repo.saveRun(run);
      this.events.emit("run.updated", { run }, runId);
    }
    return runId;
  }

  /** Page claims fold into the session run — Tasks shows the same presence. */
  notePage(connectionId: string, pageId: string) {
    const runId = this.active.get(connectionId);
    const run = runId ? this.repo.getRun(runId) : undefined;
    if (!run || run.pageIds.includes(pageId)) return;
    const updated: Run = { ...run, pageIds: [...run.pageIds, pageId] };
    this.repo.saveRun(updated);
    this.events.emit("run.updated", { run: updated }, updated.runId);
  }

  /** End the session run — revoked connections cancel, expired/idle complete. */
  end(connectionId: string, status: "completed" | "cancelled", statusMessage?: string) {
    const mapped = this.active.get(connectionId);
    this.active.delete(connectionId);
    this.lastActivity.delete(connectionId);
    const mappedRun = mapped ? this.repo.getRun(mapped) : undefined;
    const run = mappedRun && ACTIVE.has(mappedRun.status) ? mappedRun : this.liveRun(connectionId);
    if (!run) return;
    const updated: Run = {
      ...run,
      status,
      endedAt: Date.now(),
      ...(statusMessage ? { statusMessage } : {}),
    };
    this.repo.saveRun(updated);
    this.events.emit("run.updated", { run: updated }, updated.runId);
  }

  /** Driven by the 60 s sweep in main.ts — idle sessions complete, dead connections close out. */
  sweepIdle(now = Date.now(), idleMs = EXTERNAL_SESSION_IDLE_MS) {
    const ids = new Set(this.active.keys());
    for (const connectionId of this.storedActiveIds()) ids.add(connectionId);
    for (const connectionId of ids) {
      const row = this.connectionRow(connectionId);
      if (!row || row.revoked_at !== null) {
        this.end(connectionId, "cancelled", row ? "Connection revoked" : "Connection removed");
        continue;
      }
      if (row.expires_at !== null && row.expires_at <= now) {
        this.end(connectionId, "completed", "Connection expired");
        continue;
      }
      const seen = this.lastActivity.get(connectionId);
      if (seen !== undefined && now - seen >= idleMs) this.end(connectionId, "completed", "Session idle");
    }
  }

  private liveRun(connectionId: string): Run | undefined {
    const runId = this.activeRunId(connectionId);
    return runId ? this.repo.getRun(runId) : undefined;
  }

  /** Active external runs still in the store after the in-memory map was rebuilt. */
  private storedActiveIds(): string[] {
    const rows = this.repo.db
      .prepare(
        `SELECT DISTINCT json_extract((SELECT config FROM run_lookup WHERE run_lookup.run_id=runs.run_id),'$.externalConnectionId') AS id FROM runs
         WHERE status IN (${ACTIVE_SQL})
         AND json_extract((SELECT config FROM run_lookup WHERE run_lookup.run_id=runs.run_id),'$.externalConnectionId') IS NOT NULL`,
      )
      .all() as { id: string }[];
    return rows.map((row) => row.id);
  }
}
