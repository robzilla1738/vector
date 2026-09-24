import type { DatabaseSync } from "node:sqlite";

/** Preserve effect state and task routing while removing settled source-derived arguments. */
export function redactSettledRunInvocations(db: DatabaseSync, runId: string): number {
  if (!db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name='operation_invocations'").get()) return 0;
  const rows = db.prepare(`SELECT invocation_id AS invocationId,inputs,status,effect_outcome AS effectOutcome
    FROM operation_invocations WHERE run_id=?`).all(runId) as {
      invocationId: string; inputs: string; status: string; effectOutcome: string;
    }[];
  let redacted = 0;
  for (const row of rows) {
    if (row.effectOutcome === "unknown" || row.status === "running" || row.status === "interrupted") continue;
    let inputs: Record<string, unknown> = {};
    try {
      const parsed = JSON.parse(row.inputs) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) inputs = parsed as Record<string, unknown>;
    } catch { /* malformed arguments are discarded */ }
    const scope = Object.fromEntries(["taskId", "taskRevision", "projectId"]
      .filter(key => typeof inputs[key] === "string" || key === "taskRevision" && typeof inputs[key] === "number")
      .map(key => [key, inputs[key]]));
    db.prepare(`UPDATE operation_invocations SET inputs=?,route_reason=?,error=NULL WHERE invocation_id=?`)
      .run(JSON.stringify(scope), "Protected source forgotten", row.invocationId);
    redacted++;
  }
  return redacted;
}
