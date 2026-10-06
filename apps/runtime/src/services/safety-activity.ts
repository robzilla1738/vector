import type { DatabaseSync } from "node:sqlite";
import {
  SafetyActivityEntrySchema,
  SafetyActivityQuerySchema,
  type SafetyActivityPage,
} from "@aux/contracts/safety-activity";

/** Project only decision metadata; prompts, page content and approval payloads stay out of the log. */
export function listSafetyActivity(db: DatabaseSync, profileId: string, raw: unknown): SafetyActivityPage {
  const { limit, cursor } = SafetyActivityQuerySchema.parse(raw);
  const parameters: (string | number)[] = [profileId];
  if (cursor) parameters.push(cursor.at, cursor.at, cursor.decisionId);
  parameters.push(limit + 1);
  const rows = db
    .prepare(
      `
    SELECT decision_id AS decisionId, at, actor, effect, category, action, origin, status, source,
      substr(coalesce(json_extract(decision_json, '$.guidance'),
        json_extract(decision_json, '$.suspension.instruction')), 1, 512) AS guidance,
      json_extract(request_json, '$.runId') AS runId,
      CASE WHEN scope_kind='task' THEN scope_id ELSE NULL END AS taskId
    FROM safety_decisions
    WHERE profile_id=? ${cursor ? "AND (at < ? OR (at = ? AND decision_id < ?))" : ""}
    ORDER BY at DESC, decision_id DESC LIMIT ?
  `,
    )
    .all(...parameters);
  const entries = rows.slice(0, limit).map((row) => SafetyActivityEntrySchema.parse(row));
  const last = entries.at(-1);
  return {
    entries,
    nextCursor: rows.length > limit && last ? { at: last.at, decisionId: last.decisionId } : null,
  };
}
