import type { DatabaseSync } from "node:sqlite";
import type { UsageReportResult } from "@aux/contracts";
import type { Repo } from "../store/repo.js";

type Bucket = UsageReportResult["total"];
type RawBucket = { calls: number; recordedUsd: number | null; unpricedCalls: number; estimatedCalls: number };

const aggregate = `COUNT(*) AS calls,
  COALESCE(SUM(cost_usd), 0) AS recordedUsd,
  SUM(CASE WHEN cost_usd IS NULL THEN 1 ELSE 0 END) AS unpricedCalls,
  SUM(CASE WHEN cost_estimated = 1 THEN 1 ELSE 0 END) AS estimatedCalls`;

function bucket(row: RawBucket | undefined): Bucket {
  return {
    calls: row?.calls ?? 0,
    recordedUsd: Math.max(0, Number((row?.recordedUsd ?? 0).toFixed(9))),
    unpricedCalls: row?.unpricedCalls ?? 0,
    estimatedCalls: row?.estimatedCalls ?? 0,
  };
}

/** Profile-local model-call accounting. The cursor fixes the time boundary for a paged CSV export. */
export function usageReport(
  db: DatabaseSync,
  input: { asOf?: number; offset?: number; limit?: number } = {},
  now = Date.now(),
  repo?: Repo,
): UsageReportResult {
  const asOf = Math.min(input.asOf ?? now, now);
  const offset = input.offset ?? 0;
  const limit = input.limit ?? 50;
  const total = bucket(
    db.prepare(`SELECT ${aggregate} FROM model_calls WHERE created_at<=?`).get(asOf) as RawBucket,
  );
  const byModel = (
    db
      .prepare(
        `SELECT model_id AS modelId, ${aggregate}
      FROM model_calls WHERE created_at<=? GROUP BY model_id ORDER BY recordedUsd DESC, model_id`,
      )
      .all(asOf) as (RawBucket & { modelId: string })[]
  ).map((row) => ({ modelId: row.modelId, ...bucket(row) }));
  const byDay = (
    db
      .prepare(
        `SELECT strftime('%Y-%m-%d', created_at/1000, 'unixepoch', 'localtime') AS day, ${aggregate}
      FROM model_calls WHERE created_at<=? GROUP BY day ORDER BY day DESC`,
      )
      .all(asOf) as (RawBucket & { day: string })[]
  ).map((row) => ({ day: row.day, ...bucket(row) }));
  const rows = db
    .prepare(
      `SELECT m.run_id AS runId, MAX(r.goal) AS storedTitle,
      MAX(m.created_at) AS lastAt, ${aggregate.replaceAll("cost_usd", "m.cost_usd").replaceAll("cost_estimated", "m.cost_estimated")}
      FROM model_calls m LEFT JOIN runs r ON r.run_id=m.run_id
      WHERE m.created_at<=? GROUP BY m.run_id ORDER BY lastAt DESC, runId LIMIT ? OFFSET ?`,
    )
    .all(asOf, limit + 1, offset) as (RawBucket & { runId: string | null; storedTitle: string | null; lastAt: number })[];
  return {
    asOf,
    total,
    byRun: rows
      .slice(0, limit)
      .map((row) => ({ runId: row.runId, title: (row.runId && repo?.getRun(row.runId)?.goal) ?? (repo ? "Other model calls" : row.storedTitle) ?? "Other model calls", lastAt: row.lastAt, ...bucket(row) })),
    byModel,
    byDay,
    nextOffset: rows.length > limit ? offset + limit : null,
  };
}
