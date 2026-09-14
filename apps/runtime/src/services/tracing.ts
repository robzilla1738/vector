import { appendFileSync, mkdirSync } from "node:fs";
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
 * accumulate in `kv` under `counter:<name>`. No hosted observability.
 */
export class Tracer {
  private dir?: string;

  constructor(
    private db: Db,
    opts?: { traceDir?: string },
  ) {
    this.dir = opts?.traceDir;
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
    return {
      spanId,
      end(outcome = "ok", attrs) {
        const endedAt = Date.now();
        const merged = { ...(ctx?.attrs ?? {}), ...(attrs ?? {}) };
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
          try {
            appendFileSync(
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
            );
          } catch {
            /* trace export must never break execution */
          }
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
    this.db
      .prepare(
        `INSERT INTO kv(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=CAST(value AS INTEGER)+?`,
      )
      .run(`counter:${name}`, String(by), by);
  }

  counter(name: string): number {
    const row = this.db.prepare("SELECT value FROM kv WHERE key=?").get(`counter:${name}`) as
      | { value: string }
      | undefined;
    return row ? Number(row.value) : 0;
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
