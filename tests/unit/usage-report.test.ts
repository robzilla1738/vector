import { expect, it } from "vitest";
import { openDb } from "@aux/runtime";
import { usageReport } from "../../apps/runtime/src/services/usage-report";

it("groups recorded, estimated, and unpriced model calls without dropping paged runs", () => {
  const db = openDb(":memory:");
  const day = new Date(2026, 8, 27, 12).getTime();
  try {
    const insert = db.prepare(`INSERT INTO model_calls
      (call_id,run_id,role,model_id,duration_ms,cost_usd,cost_estimated,created_at)
      VALUES (?,?, 'planner', ?, 1, ?, ?, ?)`);
    insert.run("a", "run-a", "meta/muse", 0.25, 0, day);
    insert.run("b", "run-a", "meta/muse", null, 0, day + 1);
    insert.run("c", "run-b", "other/model", 0.5, 1, day + 2);
    insert.run("later", "run-c", "other/model", 10, 0, day + 10_000);
    const first = usageReport(db, { asOf: day + 2, limit: 1 }, day + 20_000);
    expect(first.total).toEqual({ calls: 3, recordedUsd: 0.75, unpricedCalls: 1, estimatedCalls: 1 });
    expect(first.byModel).toEqual([
      { modelId: "other/model", calls: 1, recordedUsd: 0.5, unpricedCalls: 0, estimatedCalls: 1 },
      { modelId: "meta/muse", calls: 2, recordedUsd: 0.25, unpricedCalls: 1, estimatedCalls: 0 },
    ]);
    expect(first.byDay).toEqual([
      { day: "2026-09-27", calls: 3, recordedUsd: 0.75, unpricedCalls: 1, estimatedCalls: 1 },
    ]);
    expect(first.byRun[0]?.runId).toBe("run-b");
    expect(first.nextOffset).toBe(1);
    const second = usageReport(db, { asOf: first.asOf, offset: first.nextOffset!, limit: 1 }, day + 20_000);
    expect(second.byRun[0]?.runId).toBe("run-a");
    expect(second.nextOffset).toBeNull();
  } finally {
    db.close();
  }
});
