import { mkdirSync } from "node:fs";
import { appendFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import type { Db } from "../store/db.js";

export interface SpanHandle {
  spanId: string;
  end: (outcome?: "ok" | "failed" | "cancelled", attrs?: Record<string, unknown>) => void;
}

/**
 * Minimal structured span layer (roadmap §6): spans persist to SQLite and
 * stream to <dataDir>/traces/spans.jsonl for external inspection. Counters
 * accumulate in memory and are flushed to `kv` (`counter:<name>`) when a
 * span ends — i.e. per program / per run — and on a safety timer, so the
 * 3-4 incr() calls per step cost no SQLite writes (speed P2-1).
 */
export class Tracer {
  private dir?: string;
  private pendingCounters = new Map<string, number>();
  private flushTimer: NodeJS.Timeout | null = null;
  private closed = false;
  private readonly flushDelayMs: number;

  constructor(
    private db: Db,
    opts?: { traceDir?: string; counterFlushMs?: number },
  ) {
    this.dir = opts?.traceDir;
    this.flushDelayMs = opts?.counterFlushMs ?? 2_000;
    if (this.dir) mkdirSync(this.dir, { recursive: true });
  }

  start(
    name: string,
    ctx?: { runId?: string; pageId?: string; parentId?: string; attrs?: Record<string, unknown> },
  ): SpanHandle {
    const spanId = `sp_${randomUUID().slice(0, 12)}`;
    const startedAt = Date.now();
    const db = this.db;
    const file = this.dir;
    const tracer = this;
    return {
      spanId,
      end(outcome = "ok", attrs) {
        const endedAt = Date.now();
        const merged = { ...(ctx?.attrs ?? {}), ...(attrs ?? {}) };
        // a span end is the program/run boundary — land the counters with it
        tracer.flushCounters();
        db.prepare(
          `INSERT OR REPLACE INTO spans(span_id,parent_id,name,run_id,page_id,started_at,ended_at,duration_ms,outcome,attrs)
           VALUES(?,?,?,?,?,?,?,?,?,?)`,
        ).run(
          spanId,
          ctx?.parentId ?? null,
          name,
          ctx?.runId ?? null,
          ctx?.pageId ?? null,
          startedAt,
          endedAt,
          endedAt - startedAt,
          outcome,
          JSON.stringify(merged),
        );
        if (file) {
          // off the critical path — trace export must never break or stall execution
          void appendFile(
            join(file, "spans.jsonl"),
            JSON.stringify({
              spanId,
              parentId: ctx?.parentId ?? null,
              name,
              runId: ctx?.runId ?? null,
              pageId: ctx?.pageId ?? null,
              startedAt,
              durationMs: endedAt - startedAt,
              outcome,
              attrs: merged,
            }) + "\n",
          ).catch(() => {});
        }
      },
    };
  }

  /** Time an async block under a span. */
  async span<T>(
    name: string,
    ctx: { runId?: string; pageId?: string; parentId?: string; attrs?: Record<string, unknown> },
    fn: (h: SpanHandle) => Promise<T>,
  ): Promise<T> {
    const h = this.start(name, ctx);
    try {
      const r = await fn(h);
      h.end("ok");
      return r;
    } catch (e) {
      h.end("failed", { error: e instanceof Error ? e.message : String(e) });
      throw e;
    }
  }

  incr(name: string, by = 1): void {
    this.pendingCounters.set(name, (this.pendingCounters.get(name) ?? 0) + by);
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flushCounters(), this.flushDelayMs);
      this.flushTimer.unref?.();
    }
  }

  /** Write pending counter increments to kv in one transaction. */
  flushCounters(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    if (!this.pendingCounters.size || this.closed) return;
    const batch = this.pendingCounters;
    this.pendingCounters = new Map();
    try {
      // prepare() throws once the database is closed; keep it inside the
      // guard so a late timer never becomes an uncaught exception
      const stmt = this.db.prepare(
        `INSERT INTO kv(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=CAST(value AS INTEGER)+?`,
      );
      this.db.exec("BEGIN");
      for (const [name, by] of batch) stmt.run(`counter:${name}`, String(by), by);
      this.db.exec("COMMIT");
    } catch {
      try {
        this.db.exec("ROLLBACK");
      } catch {
        /* nothing open */
      }
      // keep the increments for the next flush rather than lose them
      for (const [name, by] of batch) this.pendingCounters.set(name, (this.pendingCounters.get(name) ?? 0) + by);
    }
  }

  /** Flush what is pending and stop the timer; the database is about to close. */
  close(): void {
    this.flushCounters();
    this.closed = true;
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /** Persisted value plus anything not yet flushed. */
  counter(name: string): number {
    const row = this.db.prepare("SELECT value FROM kv WHERE key=?").get(`counter:${name}`) as
      | { value: string }
      | undefined;
    return (row ? Number(row.value) : 0) + (this.pendingCounters.get(name) ?? 0);
  }

  /** Every counter, flushed first so kv is authoritative. */
  counters(): Record<string, number> {
    this.flushCounters();
    const rows = this.db.prepare("SELECT key,value FROM kv WHERE key LIKE 'counter:%'").all() as { key: string; value: string }[];
    return Object.fromEntries(rows.map((r) => [r.key.slice(8), Number(r.value)]));
  }

  spansSince(ts: number, limit = 500, runId?: string) {
    return this.db
      .prepare(
        `SELECT * FROM spans WHERE started_at>=? ${runId ? "AND run_id=?" : ""} ORDER BY started_at LIMIT ?`,
      )
      .all(...(runId ? [ts, runId, limit] : [ts, limit]));
  }

  /** Coarse per-name summary for a run — the §6.3 "timeline + breakdown". */
  summary(runId: string): Record<string, { n: number; totalMs: number; maxMs: number }> {
    const rows = this.db
      .prepare(
        `SELECT name, COUNT(*) n, SUM(duration_ms) total, MAX(duration_ms) mx FROM spans WHERE run_id=? GROUP BY name`,
      )
      .all(runId) as { name: string; n: number; total: number; mx: number }[];
    return Object.fromEntries(rows.map((r) => [r.name, { n: r.n, totalMs: r.total, maxMs: r.mx }]));
  }
}
